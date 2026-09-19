import { RxDatabase } from 'rxdb';
import { Observable, map } from 'rxjs';
// import { ITermAddingInfoRepository } from './term-adding-info.repo.interface';
// import { TermAddingInfo, TermAddingInfoProps } from '../../entities/term-adding-info';
import { toDate, toIsoString } from './tools';
import {ITermAddingInfoRepository, TermAddingInfo, TermAddingInfoProps} from "@rem-web/domain";

export class RxDbTermAddingInfoRepository implements ITermAddingInfoRepository {
    constructor(private readonly db: RxDatabase) {}

    toDomain(doc: any): TermAddingInfo {
        return new TermAddingInfo({
            uuid: doc.uuid,
            userUuid: doc.userUuid,
            textData: doc.textData ?? null,
            addingTextData: doc.addingTextData ?? null,
            dialectOrArea: doc.dialectOrArea ?? null,
            addInfoType: doc.addInfoType,
            termUuid: doc.termUuid,
            parentAddInfoUuid: doc.parentAddInfoUuid ?? null,
            createdAt: toDate(doc.createdAt),
            updatedAt: toDate(doc.updatedAt),
        });
    }

    toDocument(entity: TermAddingInfo): Record<string, any> {
        return {
            uuid: entity.uuid,
            userUuid: entity.userUuid,
            textData: entity.textData ?? null,
            addingTextData: entity.addingTextData ?? null,
            dialectOrArea: entity.dialectOrArea ?? null,
            addInfoType: entity.addInfoType,
            termUuid: entity.termUuid,
            parentAddInfoUuid: entity.parentAddInfoUuid ?? null,
            createdAt: toIsoString(entity.createdAt),
            updatedAt: toIsoString(entity.updatedAt),
        };
    }

    async save(entity: TermAddingInfo): Promise<void> {
        await this.db.termAddingInfos.insert(this.toDocument(entity));
    }

    async upsert(entity: TermAddingInfo): Promise<void> {
        await this.db.termAddingInfos.upsert(this.toDocument(entity));
    }

    async saveBatch(infos: TermAddingInfo[]): Promise<void> {
        if (infos.length === 0) return;
        await this.db.termAddingInfos.bulkUpsert(infos.map(i => this.toDocument(i)));
    }

    async update(uuid: string, data: Partial<TermAddingInfoProps>): Promise<void> {
        const doc = await this.db.termAddingInfos.findOne({ selector: { uuid } }).exec();
        if (!doc) return;
        const patchData: Record<string, any> = { ...data };
        if (data.createdAt) patchData.createdAt = toIsoString(data.createdAt);
        if (data.updatedAt) patchData.updatedAt = toIsoString(data.updatedAt);
        await doc.patch(patchData);
    }

    async delete(uuid: string): Promise<void> {
        const doc = await this.db.termAddingInfos.findOne({ selector: { uuid } }).exec();
        if (doc) await doc.remove();
    }

    async findByPk(uuid: string): Promise<TermAddingInfo | null> {
        const doc = await this.db.termAddingInfos.findOne({ selector: { uuid } }).exec();
        return doc ? this.toDomain(doc.toJSON()) : null;
    }

    observeByPk(uuid: string): Observable<TermAddingInfo | null> {
        return (this.db.termAddingInfos.findOne({ selector: { uuid } }).$ as Observable<any>).pipe(
            map(doc => (doc ? this.toDomain(doc.toMutableJSON ? doc.toMutableJSON() : doc.toJSON()) : null))
        );

    }
    // observeByPk(uuid: string): Observable<User | null> {
    //     return (this.db.users.findOne({ selector: { uuid } }).$ as Observable<any>).pipe(
    //         map(doc => (doc ? this.toDomain(doc.toMutableJSON ? doc.toMutableJSON() : doc.toJSON()) : null))
    //     );
    // }

    async getById(uuid: string, userUuid: string): Promise<TermAddingInfo | null> {
        const doc = await this.db.termAddingInfos.findOne({ selector: { uuid, userUuid } }).exec();
        return doc ? this.toDomain(doc.toJSON()) : null;
    }

    async getByTerm(termUuid: string, userUuid: string): Promise<TermAddingInfo[]> {
        return this.findByTermUuid(termUuid, userUuid);
    }

    async findByUserUuid(userUuid: string): Promise<TermAddingInfo[]> {
        const docs = await this.db.termAddingInfos.find({ selector: { userUuid } }).exec();
        return docs.map(d => this.toDomain(d.toJSON()));
    }

    async findByTermUuid(termUuid: string, userUuid: string): Promise<TermAddingInfo[]> {
        const docs = await this.db.termAddingInfos.find({ selector: { termUuid, userUuid } }).exec();
        return docs.map(d => this.toDomain(d.toJSON()));
    }

    observeByTermUuid(termUuid: string, userUuid: string): Observable<TermAddingInfo[]> {
        return (this.db.termAddingInfos.find({ selector: { termUuid, userUuid } }).$ as Observable<any>).pipe(
            map(docs => docs.map((d: any) => this.toDomain(d.toJSON())))
        );
    }


    async findByParentAddInfoUuid(parentAddInfoUuid: string, userUuid: string): Promise<TermAddingInfo[]> {
        const docs = await this.db.termAddingInfos.find({ selector: { parentAddInfoUuid, userUuid } }).exec();
        return docs.map(d => this.toDomain(d.toJSON()));
    }

    observeByParentAddInfoUuid(parentAddInfoUuid: string, userUuid: string): Observable<TermAddingInfo[]> {
        return (this.db.termAddingInfos.find({ selector: { parentAddInfoUuid, userUuid } }).$ as Observable<any>).pipe(
            map(docs => docs.map((d: any) => this.toDomain(d.toJSON())))
        );
    }

    async findByModuleUuid(moduleUuid: string, userUuid: string): Promise<TermAddingInfo[]> {
        const terms = await this.db.terms.find({ selector: { moduleUuid, userUuid } }).exec();
        const termUuids = terms.map(t => t.uuid);
        if (termUuids.length === 0) return [];

        const docs = await this.db.termAddingInfos.find({
            selector: {
                termUuid: { $in: termUuids },
                userUuid,
            },
        }).exec();

        return docs.map(d => this.toDomain(d.toJSON()));
    }

    // async saveBatch(entities: TermAddingInfo[]): Promise<void> {
    //     if (entities.length === 0) return;
    //     await this.db.termAddingInfos.bulkInsert(entities.map(e => this.toDocument(e)));
    // }

    async upsertBatch(entities: TermAddingInfo[]): Promise<void> {
        if (entities.length === 0) return;
        await this.db.termAddingInfos.bulkUpsert(entities.map(e => this.toDocument(e)));
    }

    async updateBatch(entities: TermAddingInfo[]): Promise<void> {
        if (entities.length === 0) return;
        await this.db.termAddingInfos.bulkUpsert(entities.map(e => this.toDocument(e)));
    }

    async deleteBatch(entities: TermAddingInfo[]): Promise<void> {
        if (entities.length === 0) return;
        const uuids = entities.map(e => e.uuid);
        await this.db.termAddingInfos.find({ selector: { uuid: { $in: uuids } } }).remove();
    }
}