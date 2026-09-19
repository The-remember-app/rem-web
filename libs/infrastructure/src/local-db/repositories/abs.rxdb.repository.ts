// repositories/rxdb-base-sync.repository.ts

import { RxDatabase, RxCollection } from 'rxdb';
import { Observable, map } from 'rxjs';
import {IBaseRepository, IBaseSyncRepository} from '@rem-web/domain';
import { toIsoString } from './tools';

export abstract class RxDbBaseSyncRepository<T extends { uuid: string }, TProps>
    implements IBaseRepository<T, string, TProps>, IBaseSyncRepository<T, string, TProps>
{
    constructor(protected readonly db: RxDatabase) {}

    protected abstract get collection(): RxCollection;

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

    async delete(pk: string): Promise<void> {
        const doc = await this.collection.findOne({ selector: { uuid: pk } }).exec();
        if (doc) await doc.remove();
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

    async deleteBatch(entities: T[]): Promise<void> {
        if (entities.length === 0) return;
        const uuids = entities.map(e => e.uuid);
        await this.collection.find({ selector: { uuid: { $in: uuids } } }).remove();
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

    // --- IBaseSyncRepository ---
    async getLocallyCreated(): Promise<T[]> {
        const docs = await this.collection.find({ selector: { syncState: 'created' } }).exec();
        return docs.map(d => this.toDomain(d.toJSON()));
    }

    async getLocallyModified(): Promise<T[]> {
        const docs = await this.collection.find({ selector: { syncState: 'modified' } }).exec();
        return docs.map(d => this.toDomain(d.toJSON()));
    }

    async getWithServerChanges(): Promise<T[]> {
        const docs = await this.collection.find({ selector: { syncState: 'stale' } }).exec();
        return docs.map(d => this.toDomain(d.toJSON()));
    }

    async getUpdating(): Promise<T[]> {
        const docs = await this.collection.find({
            selector: { syncState: { $in: ['syncing_to_server', 'syncing_from_server'] } },
        }).exec();
        return docs.map(d => this.toDomain(d.toJSON()));
    }

    async getWithSyncErrors(): Promise<T[]> {
        const docs = await this.collection.find({ selector: { syncState: 'error' } }).exec();
        return docs.map(d => this.toDomain(d.toJSON()));
    }

    observeLocallyCreated(): Observable<T | null> {
        return (this.collection.find({ selector: { syncState: 'created' } }).$ as Observable<any[]>).pipe(
            map(docs => (docs.length > 0 ? this.toDomain(docs[0].toJSON()) : null))
        );
    }

    observeLocallyModified(): Observable<T | null> {
        return (this.collection.find({ selector: { syncState: 'modified' } }).$ as Observable<any[]>).pipe(
            map(docs => (docs.length > 0 ? this.toDomain(docs[0].toJSON()) : null))
        );
    }
}