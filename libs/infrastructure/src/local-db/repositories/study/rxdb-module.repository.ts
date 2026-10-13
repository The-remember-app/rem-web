// repositories/rxdb-module.repository.ts

import { RxDatabase } from 'rxdb';
import { Observable, map } from 'rxjs';
import {EntityType, IModuleRepository, Module, ModuleProps} from '@rem-web/domain';
import { toDate, toIsoString } from '../tools';
// import { RxDbBasePersSyncRepository } from './rxdb-base-pers-sync.repository';
import { RxDbTermRepository } from './rxdb-term.repository';
import {RxDbBasePersSyncRepository} from "../sync/abs-sync-pers.rxdb.repository";

export class RxDbModuleRepository
    extends RxDbBasePersSyncRepository<Module, ModuleProps>
    implements IModuleRepository
{
    constructor(db: RxDatabase<any>) {
        super(db);
    }

    protected get entityType(): EntityType {
        return 'module';
    }

    protected get collection() {
        return this.db.modules;
    }

    toDomain(doc: any): Module {
        return new Module({
            uuid: doc.uuid,
            userUuid: doc.userUuid,
            name: doc.name,
            description: doc.description ?? null,
            rootFolderUuid: doc.rootFolderUuid,
            isReverseDefinitionWrite: doc.isReverseDefinitionWrite,
            standardAndReverseWrite: doc.standardAndReverseWrite,
            isReverseDefinitionChoice: doc.isReverseDefinitionChoice,
            standardAndReverseChoice: doc.standardAndReverseChoice,
            maxIterationLen: doc.maxIterationLen,
            minIterationLen: doc.minIterationLen,
            minWatchCount: doc.minWatchCount,
            knownTermPart: doc.knownTermPart,
            choicesCount: doc.choicesCount,
            isLearnt: doc.isLearnt,
            createdAt: toDate(doc.createdAt),
            updatedAt: toDate(doc.updatedAt),
            personalCreatedAt: toDate(doc.personalCreatedAt),
            personalUpdatedAt: toDate(doc.personalUpdatedAt),
            syncState: doc.syncState ?? 'synced',
            personalSyncState: doc.personalSyncState ?? 'synced',
        });
    }

    toDocument(entity: Module): Record<string, any> {
        return {
            uuid: entity.uuid,
            userUuid: entity.userUuid,
            name: entity.name,
            description: entity.description ?? null,
            rootFolderUuid: entity.rootFolderUuid,
            isReverseDefinitionWrite: entity.isReverseDefinitionWrite,
            standardAndReverseWrite: entity.standardAndReverseWrite,
            isReverseDefinitionChoice: entity.isReverseDefinitionChoice,
            standardAndReverseChoice: entity.standardAndReverseChoice,
            maxIterationLen: entity.maxIterationLen,
            minIterationLen: entity.minIterationLen,
            minWatchCount: entity.minWatchCount,
            knownTermPart: entity.knownTermPart,
            choicesCount: entity.choicesCount,
            isLearnt: entity.isLearnt,
            createdAt: toIsoString(entity.createdAt),
            updatedAt: toIsoString(entity.updatedAt),
            personalCreatedAt: toIsoString(entity.personalCreatedAt),
            personalUpdatedAt: toIsoString(entity.personalUpdatedAt),
            syncState: entity.syncState,
            personalSyncState: entity.personalSyncState,
        };
    }

    override async deleteCascading(uuid: string): Promise<void> {
        const terms = await this.db.terms.find({ selector: { moduleUuid: uuid } }).exec();
        const termRepo = new RxDbTermRepository(this.db);
        for (const term of terms) {
            await termRepo.deleteCascading(term.uuid);
        }

        await this.delete(uuid);
    }

    async getById(uuid: string, userUuid: string): Promise<Module | null> {
        const doc = await this.db.modules.findOne({ selector: { uuid, userUuid } }).exec();
        return doc ? this.toDomain(doc.toJSON()) : null;
    }

    async getAllByUser(userUuid: string): Promise<Module[]> {
        return this.findByUserUuid(userUuid);
    }

    async getByFolder(rootFolderUuid: string, userUuid: string): Promise<Module[]> {
        return this.findByRootFolderUuid(rootFolderUuid, userUuid);
    }

    async findByUserUuid(userUuid: string): Promise<Module[]> {
        const docs = await this.db.modules.find({ selector: { userUuid } }).exec();
        return docs.map(d => this.toDomain(d.toJSON()));
    }

    observeByUserUuid(userUuid: string): Observable<Module[]> {
        return (this.db.modules.find({ selector: { userUuid } }).$ as Observable<any>).pipe(
            map(docs => docs.map((d: any) => this.toDomain(d.toJSON())))
        );
    }

    async findByRootFolderUuid(rootFolderUuid: string, userUuid: string): Promise<Module[]> {
        const docs = await this.db.modules.find({ selector: { rootFolderUuid, userUuid } }).exec();
        return docs.map(d => this.toDomain(d.toJSON()));
    }

    observeByRootFolderUuid(rootFolderUuid: string, userUuid: string): Observable<Module[]> {
        return (this.db.modules.find({ selector: { rootFolderUuid, userUuid } }).$ as Observable<any>).pipe(
            map(docs => docs.map((d: any) => this.toDomain(d.toJSON())))
        );
    }

    async getLearnProcess(moduleUuid: string, userUuid: string): Promise<[number, number, number, number]> {
        const moduleEntity = await this.getById(moduleUuid, userUuid);
        const termsDocs = await this.db.terms.find({ selector: { moduleUuid, userUuid } }).exec();
        const terms = termsDocs.map(t => t.toJSON());

        if (moduleEntity?.isLearnt) {
            const len = terms.length;
            return [len, len, len, len];
        }

        const writtenLearned = terms.filter(t => t.writeErrorCounter <= 0 && t.watchCount !== 0).length;
        const choiceLearned = terms.filter(t => t.chooseErrorCounter <= 0 && t.watchCount !== 0).length;
        const watched = terms.filter(t => t.watchCount > 0).length;

        return [writtenLearned, choiceLearned, watched, terms.length];
    }
}