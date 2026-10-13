// repositories/rxdb-base-sync.repository.ts

import { RxDatabase, RxCollection } from 'rxdb';
import { Observable, map } from 'rxjs';
import {DeleteScope, EntityType, IBaseRepository} from '@rem-web/domain';
import { toIsoString } from '../tools';

export abstract class RxDbAbsStudyRepository<T extends { uuid: string }, TProps>
    implements IBaseRepository<T, string, TProps>
{
    constructor(protected readonly db: RxDatabase) {}

    protected abstract get collection(): RxCollection;
    protected abstract get entityType(): EntityType;

    abstract toDomain(doc: any): T;
    abstract toDocument(entity: T): Record<string, any>;

    // --- IBaseRepository ---
    async save(entity: T): Promise<void> {
        await this.collection.insert(this.toDocument(entity));
    }

    async upsert(entity: T): Promise<void> {
        await this.collection.upsert(this.toDocument(entity));
    }
    // update(pk: PK, data: Partial<T>): Promise<void>;
    async update(pk: string, data: Partial<T>): Promise<void> {
        const doc = await this.collection.findOne({ selector: { uuid: pk } }).exec();
        if (!doc) return;

        const patchData: Record<string, any> = {};
        for (const [key, value] of Object.entries(data as Record<string, any>)) {
            if (value instanceof Date) {
                patchData[key] = toIsoString(value);
            } else if (value !== undefined) {
                patchData[key] = value;
            }
        }
        await doc.patch(patchData);
    }

    async delete(pk: string, scope: DeleteScope = 'full'): Promise<void> {
        const doc = await this.collection.findOne({ selector: { uuid: pk } }).exec();
        if (doc) {
            const data = doc.toJSON();
            const userUuid = data.userUuid || data.uuid; // fallback для User
            await this.recordDeletedEntity(userUuid, pk, scope);
            await doc.remove();
        }
    }

    async saveBatch(entities: T[]): Promise<void> {
        if (entities.length === 0) return;
        await this.collection.bulkUpsert(entities.map(e => this.toDocument(e)));
    }

    async upsertBatch(entities: T[]): Promise<void> {
        if (entities.length === 0) return;
        await this.collection.bulkUpsert(entities.map(e => this.toDocument(e)));
    }

    async updateBatch(entities: T[]): Promise<void> {
        if (entities.length === 0) return;
        await this.collection.bulkUpsert(entities.map(e => this.toDocument(e)));
    }

    async deleteBatch(entities: T[], scope: DeleteScope = 'full'): Promise<void> {
        if (entities.length === 0) return;
        const uuids = entities.map(e => e.uuid);
        const docs = await this.collection.find({ selector: { uuid: { $in: uuids } } }).exec();

        const deletedRecords = docs.map(doc => {
            const data = doc.toJSON();
            return {
                uuid: crypto.randomUUID(),
                userUuid: data.userUuid || data.uuid,
                entityUuid: data.uuid,
                entityType: this.entityType,
                scope,
                deletedAt: new Date().toISOString(),
            };
        });

        if (deletedRecords.length > 0) {
            await this.db.deleted_entities.bulkUpsert(deletedRecords);
        }

        for (const doc of docs) {
            await doc.remove();
        }
    }



    async findByPk(pk: string): Promise<T | null> {
        const doc = await this.collection.findOne({ selector: { uuid: pk } }).exec();
        return doc ? this.toDomain(doc.toJSON()) : null;
    }

    async findByPks(pks: string[]): Promise<T[]> {
        if (pks.length === 0) return [];
        const docs = await this.collection.find({ selector: { uuid: { $in: pks } } }).exec();
        return docs.map(d => this.toDomain(d.toJSON()));
    }

    observeByPk(pk: string): Observable<T | null> {
        return (this.collection.findOne({ selector: { uuid: pk } }).$ as Observable<any>).pipe(
            map(doc => (doc ? this.toDomain(doc.toMutableJSON ? doc.toMutableJSON() : doc.toJSON()) : null))
        );
    }

    observeByPks(pks: string[]): Observable<T | null> {
        return (this.collection.find({ selector: { uuid: { $in: pks } } }).$ as Observable<any[]>).pipe(
            map(docs => (docs.length > 0 ? this.toDomain(docs[0].toMutableJSON ? docs[0].toMutableJSON() : docs[0].toJSON()) : null))
        );
    }

    async exists(pk: string): Promise<boolean> {
        const doc = await this.collection.findOne({ selector: { uuid: pk } }).exec();
        return doc !== null;
    }

    async deleteCascading(pk: string): Promise<void> {
        await this.delete(pk);
    }

    // Хелпер записи удаленной сущности в outbox-таблицу deleted_entities
    protected async recordDeletedEntity(
        userUuid: string,
        entityUuid: string,
        scope: DeleteScope = 'full'
    ): Promise<void> {
        if (!userUuid || !entityUuid) return;
        await this.db.deleted_entities.upsert({
            uuid: crypto.randomUUID(),
            userUuid,
            entityUuid,
            entityType: this.entityType,
            scope,
            deletedAt: new Date().toISOString(),
        });
    }



}