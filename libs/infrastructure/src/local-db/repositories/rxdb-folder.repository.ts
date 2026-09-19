import { RxDatabase } from 'rxdb';
import { Observable, map } from 'rxjs';
// import { IFolderRepository } from './folder.repo.interface';
// import { Folder, FolderProps } from '../../entities/folder';
import { toDate, toIsoString } from './tools';
import {Folder, FolderProps, IFolderRepository} from "@rem-web/domain";

export class RxDbFolderRepository implements IFolderRepository {
    constructor(private readonly db: RxDatabase) {}

    toDomain(doc: any): Folder {
        return new Folder({
            uuid: doc.uuid,
            userUuid: doc.userUuid,
            name: doc.name,
            authorUuid: doc.authorUuid,
            rootFolderUuid: doc.rootFolderUuid ?? null,
            createdAt: toDate(doc.createdAt),
            updatedAt: toDate(doc.updatedAt),
            personalCreatedAt: toDate(doc.personalCreatedAt),
            personalUpdatedAt: toDate(doc.personalUpdatedAt),
        });
    }

    toDocument(entity: Folder): Record<string, any> {
        return {
            uuid: entity.uuid,
            userUuid: entity.userUuid,
            name: entity.name,
            authorUuid: entity.authorUuid,
            rootFolderUuid: entity.rootFolderUuid ?? null,
            createdAt: toIsoString(entity.createdAt),
            updatedAt: toIsoString(entity.updatedAt),
            personalCreatedAt: toIsoString(entity.personalCreatedAt),
            personalUpdatedAt: toIsoString(entity.personalUpdatedAt),
        };
    }

    async save(entity: Folder): Promise<void> {
        await this.db.folders.insert(this.toDocument(entity));
    }

    async upsert(entity: Folder): Promise<void> {
        await this.db.folders.upsert(this.toDocument(entity));
    }

    async saveBatch(folders: Folder[]): Promise<void> {
        if (folders.length === 0) return;
        await this.db.folders.bulkUpsert(folders.map(f => this.toDocument(f)));
    }

    async update(uuid: string, data: Partial<FolderProps>): Promise<void> {
        const doc = await this.db.folders.findOne({ selector: { uuid } }).exec();
        if (!doc) return;
        const patchData: Record<string, any> = { ...data };
        if (data.createdAt) patchData.createdAt = toIsoString(data.createdAt);
        if (data.updatedAt) patchData.updatedAt = toIsoString(data.updatedAt);
        if (data.personalCreatedAt) patchData.personalCreatedAt = toIsoString(data.personalCreatedAt);
        if (data.personalUpdatedAt) patchData.personalUpdatedAt = toIsoString(data.personalUpdatedAt);
        await doc.patch(patchData);
    }

    async delete(uuid: string): Promise<void> {
        const doc = await this.db.folders.findOne({ selector: { uuid } }).exec();
        if (doc) await doc.remove();
    }

    async findByPk(uuid: string): Promise<Folder | null> {
        const doc = await this.db.folders.findOne({ selector: { uuid } }).exec();
        return doc ? this.toDomain(doc.toJSON()) : null;
    }

    observeByPk(uuid: string): Observable<Folder | null> {
        return (this.db.folders.findOne({ selector: { uuid } }).$ as Observable<any>).pipe(
            map(doc => (doc ? this.toDomain(doc.toJSON()) : null))
        );
    }

    async getById(uuid: string, userUuid: string): Promise<Folder | null> {
        const doc = await this.db.folders.findOne({ selector: { uuid, userUuid } }).exec();
        return doc ? this.toDomain(doc.toJSON()) : null;
    }

    async getAllByUser(userUuid: string): Promise<Folder[]> {
        return this.findByUserUuid(userUuid);
    }

    async getByParentFolder(rootFolderUuid: string, userUuid: string): Promise<Folder[]> {
        return this.findByRootFolderUuid(rootFolderUuid, userUuid);
    }

    async findByUserUuid(userUuid: string): Promise<Folder[]> {
        const docs = await this.db.folders.find({ selector: { userUuid } }).exec();
        return docs.map(d => this.toDomain(d.toJSON()));
    }

    observeByUserUuid(userUuid: string): Observable<Folder[]> {
        return (this.db.folders.find({ selector: { userUuid } }).$ as Observable<any>).pipe(
            map(docs => docs.map((d: any) => this.toDomain(d.toJSON())))
        );
    }

    async findByRootFolderUuid(rootFolderUuid: string | null, userUuid: string): Promise<Folder[]> {
        const selector = rootFolderUuid
            ? { rootFolderUuid, userUuid }
            : { rootFolderUuid: { $exists: false }, userUuid };
        const docs = await this.db.folders.find({ selector }).exec();
        return docs.map(d => this.toDomain(d.toJSON()));
    }

    observeByRootFolderUuid(rootFolderUuid: string | null, userUuid: string): Observable<Folder[]> {
        const selector = rootFolderUuid
            ? { rootFolderUuid, userUuid }
            : { rootFolderUuid: { $exists: false }, userUuid };
        return (this.db.folders.find({ selector }).$ as Observable<any>).pipe(
            map(docs => docs.map((d: any) => this.toDomain(d.toJSON())))
        );
    }

    async findByAuthorUuid(authorUuid: string): Promise<Folder[]> {
        const docs = await this.db.folders.find({ selector: { authorUuid } }).exec();
        return docs.map(d => this.toDomain(d.toJSON()));
    }

    // async saveBatch(entities: Folder[]): Promise<void> {
    //     if (entities.length === 0) return;
    //     await this.db.folders.bulkInsert(entities.map(e => this.toDocument(e)));
    // }

    async upsertBatch(entities: Folder[]): Promise<void> {
        if (entities.length === 0) return;
        await this.db.folders.bulkUpsert(entities.map(e => this.toDocument(e)));
    }

    async updateBatch(entities: Folder[]): Promise<void> {
        if (entities.length === 0) return;
        await this.db.folders.bulkUpsert(entities.map(e => this.toDocument(e)));
    }

    async deleteBatch(entities: Folder[]): Promise<void> {
        if (entities.length === 0) return;
        const uuids = entities.map(e => e.uuid);
        await this.db.folders.find({ selector: { uuid: { $in: uuids } } }).remove();
    }
}