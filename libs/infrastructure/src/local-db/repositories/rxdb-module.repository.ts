import { RxDatabase } from 'rxdb';
import { Observable, map } from 'rxjs';
// import { IModuleRepository } from './module.repo.interface';
// import { Module, ModuleProps } from '../../entities/module';
import { toDate, toIsoString } from './tools';
import {IModuleRepository, Module, ModuleProps} from "@rem-web/domain";

export class RxDbModuleRepository implements IModuleRepository {
    constructor(private readonly db: RxDatabase) {}

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
        };
    }

    async save(entity: Module): Promise<void> {
        await this.db.modules.insert(this.toDocument(entity));
    }

    async upsert(entity: Module): Promise<void> {
        await this.db.modules.upsert(this.toDocument(entity));
    }

    async saveBatch(modules: Module[]): Promise<void> {
        if (modules.length === 0) return;
        await this.db.modules.bulkUpsert(modules.map(m => this.toDocument(m)));
    }

    async update(uuid: string, data: Partial<ModuleProps>): Promise<void> {
        const doc = await this.db.modules.findOne({ selector: { uuid } }).exec();
        if (!doc) return;
        const patchData: Record<string, any> = { ...data };
        if (data.createdAt) patchData.createdAt = toIsoString(data.createdAt);
        if (data.updatedAt) patchData.updatedAt = toIsoString(data.updatedAt);
        if (data.personalCreatedAt) patchData.personalCreatedAt = toIsoString(data.personalCreatedAt);
        if (data.personalUpdatedAt) patchData.personalUpdatedAt = toIsoString(data.personalUpdatedAt);
        await doc.patch(patchData);
    }

    async delete(uuid: string): Promise<void> {
        const doc = await this.db.modules.findOne({ selector: { uuid } }).exec();
        if (doc) await doc.remove();
    }

    async findByPk(uuid: string): Promise<Module | null> {
        const doc = await this.db.modules.findOne({ selector: { uuid } }).exec();
        return doc ? this.toDomain(doc.toJSON()) : null;
    }

    observeByPk(uuid: string): Observable<Module | null> {
        return (this.db.modules.findOne({ selector: { uuid } }).$ as Observable<any>).pipe(
            map(doc => (doc ? this.toDomain(doc.toJSON()) : null))
        );
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

    // async saveBatch(entities: Module[]): Promise<void> {
    //     if (entities.length === 0) return;
    //     await this.db.modules.bulkInsert(entities.map(e => this.toDocument(e)));
    // }

    async upsertBatch(entities: Module[]): Promise<void> {
        if (entities.length === 0) return;
        await this.db.modules.bulkUpsert(entities.map(e => this.toDocument(e)));
    }

    async updateBatch(entities: Module[]): Promise<void> {
        if (entities.length === 0) return;
        await this.db.modules.bulkUpsert(entities.map(e => this.toDocument(e)));
    }

    async deleteBatch(entities: Module[]): Promise<void> {
        if (entities.length === 0) return;
        const uuids = entities.map(e => e.uuid);
        await this.db.modules.find({ selector: { uuid: { $in: uuids } } }).remove();
    }
}