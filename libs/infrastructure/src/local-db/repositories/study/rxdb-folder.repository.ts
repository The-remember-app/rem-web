// repositories/rxdb-folder.repository.ts

import { RxDatabase } from 'rxdb';
import { Observable, map } from 'rxjs';
import {EntityType, Folder, FolderProps, IFolderRepository} from '@rem-web/domain';
import { toDate, toIsoString } from '../tools';
// import { RxDbBasePersSyncRepository } from './rxdb-base-pers-sync.repository';
import { RxDbModuleRepository } from './rxdb-module.repository';
import {RxDbBasePersSyncRepository} from "../sync/abs-sync-pers.rxdb.repository";

export class RxDbFolderRepository
    extends RxDbBasePersSyncRepository<Folder, FolderProps>
    implements IFolderRepository
{
    constructor(db: RxDatabase<any>) {
        super(db);
    }
    protected get entityType(): EntityType {
        return 'folder';
    }

    protected get collection() {
        return this.db.folders;
    }

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
            syncState: doc.syncState ?? 'synced',
            personalSyncState: doc.personalSyncState ?? 'synced',
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
            syncState: entity.syncState,
            personalSyncState: entity.personalSyncState,
        };
    }

    override async deleteCascading(uuid: string): Promise<void> {
        const subFolders = await this.db.folders.find({ selector: { rootFolderUuid: uuid } }).exec();
        for (const subFolder of subFolders) {
            await this.deleteCascading(subFolder.uuid);
        }

        const modules = await this.db.modules.find({ selector: { rootFolderUuid: uuid } }).exec();
        const moduleRepo = new RxDbModuleRepository(this.db);
        for (const mod of modules) {
            await moduleRepo.deleteCascading(mod.uuid);
        }

        await this.delete(uuid);
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
}