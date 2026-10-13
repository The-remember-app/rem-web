import { RxDatabase } from 'rxdb';
import {
    DeletedEntity,
    // DeletedEntityProps,
    EntityType,
    DeleteScope,
    IDeletedEntityRepository,
} from '@rem-web/domain';
import { toDate, toIsoString } from '../tools';

export class RxDbDeletedEntityRepository implements IDeletedEntityRepository {
    constructor(private readonly db: RxDatabase) {}

    private get collection() {
        return this.db.deleted_entities;
    }

    toDomain(doc: any): DeletedEntity {
        return new DeletedEntity({
            uuid: doc.uuid,
            userUuid: doc.userUuid,
            entityUuid: doc.entityUuid,
            entityType: doc.entityType as EntityType,
            scope: doc.scope as DeleteScope,
            deletedAt: toDate(doc.deletedAt),
        });
    }

    toDocument(entity: DeletedEntity): Record<string, any> {
        return {
            uuid: entity.uuid,
            userUuid: entity.userUuid,
            entityUuid: entity.entityUuid,
            entityType: entity.entityType,
            scope: entity.scope,
            deletedAt: toIsoString(entity.deletedAt),
        };
    }

    async save(entity: DeletedEntity): Promise<void> {
        await this.collection.upsert(this.toDocument(entity));
    }

    async saveBatch(entities: DeletedEntity[]): Promise<void> {
        if (entities.length === 0) return;
        const docs = entities.map((e) => this.toDocument(e));
        await this.collection.bulkUpsert(docs);
    }

    async getByUuid(uuid: string): Promise<DeletedEntity | null> {
        const doc = await this.collection.findOne({ selector: { uuid } }).exec();
        return doc ? this.toDomain(doc.toJSON()) : null;
    }

    async getAllByUser(userUuid: string): Promise<DeletedEntity[]> {
        const docs = await this.collection.find({ selector: { userUuid } }).exec();
        return docs.map((d) => this.toDomain(d.toJSON()));
    }

    async getByType(userUuid: string, entityType: EntityType): Promise<DeletedEntity[]> {
        const docs = await this.collection
            .find({ selector: { userUuid, entityType } })
            .exec();
        return docs.map((d) => this.toDomain(d.toJSON()));
    }

    async getByEntityUuids(userUuid: string, entityUuids: string[]): Promise<DeletedEntity[]> {
        if (entityUuids.length === 0) return [];
        const docs = await this.collection
            .find({
                selector: {
                    userUuid,
                    entityUuid: { $in: entityUuids },
                },
            })
            .exec();
        return docs.map((d) => this.toDomain(d.toJSON()));
    }

    async deleteByUuids(uuids: string[]): Promise<void> {
        if (uuids.length === 0) return;
        const docs = await this.collection
            .find({
                selector: {
                    uuid: { $in: uuids },
                },
            })
            .exec();

        for (const doc of docs) {
            await doc.remove();
        }
    }

    async deleteByEntityUuids(userUuid: string, entityUuids: string[]): Promise<void> {
        if (entityUuids.length === 0) return;
        const docs = await this.collection
            .find({
                selector: {
                    userUuid,
                    entityUuid: { $in: entityUuids },
                },
            })
            .exec();

        for (const doc of docs) {
            await doc.remove();
        }
    }

    async clearAllByUser(userUuid: string): Promise<void> {
        const docs = await this.collection.find({ selector: { userUuid } }).exec();
        for (const doc of docs) {
            await doc.remove();
        }
    }
}