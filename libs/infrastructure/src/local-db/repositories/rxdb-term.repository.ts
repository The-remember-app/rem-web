import { RxDatabase } from 'rxdb';
import { Observable, map } from 'rxjs';
// import { ITermRepository } from './term.repo.interface';
// import { Term, TermProps } from '../../entities/term';
import { toDate, toIsoString } from './tools';
import {ITermRepository, Term,  TermProps} from "@rem-web/domain";

export class RxDbTermRepository implements ITermRepository {
    constructor(private readonly db: RxDatabase) {}

    toDomain(doc: any): Term {
        return new Term({
            uuid: doc.uuid,
            userUuid: doc.userUuid,
            term: doc.term,
            definition: doc.definition,
            moduleUuid: doc.moduleUuid,
            chooseErrorCounter: doc.chooseErrorCounter,
            writeErrorCounter: doc.writeErrorCounter,
            choiceNegErrorCounter: doc.choiceNegErrorCounter,
            watchCount: doc.watchCount,
            createdAt: toDate(doc.createdAt),
            updatedAt: toDate(doc.updatedAt),
            personalCreatedAt: toDate(doc.personalCreatedAt),
            personalUpdatedAt: toDate(doc.personalUpdatedAt),
        });
    }

    toDocument(entity: Term): Record<string, any> {
        return {
            uuid: entity.uuid,
            userUuid: entity.userUuid,
            term: entity.term,
            definition: entity.definition,
            moduleUuid: entity.moduleUuid,
            chooseErrorCounter: entity.chooseErrorCounter,
            writeErrorCounter: entity.writeErrorCounter,
            choiceNegErrorCounter: entity.choiceNegErrorCounter,
            watchCount: entity.watchCount,
            createdAt: toIsoString(entity.createdAt),
            updatedAt: toIsoString(entity.updatedAt),
            personalCreatedAt: toIsoString(entity.personalCreatedAt),
            personalUpdatedAt: toIsoString(entity.personalUpdatedAt),
        };
    }

    async save(entity: Term): Promise<void> {
        await this.db.terms.insert(this.toDocument(entity));
    }

    async upsert(entity: Term): Promise<void> {
        await this.db.terms.upsert(this.toDocument(entity));
    }

    async saveBatch(terms: Term[]): Promise<void> {
        if (terms.length === 0) return;
        await this.db.terms.bulkUpsert(terms.map(t => this.toDocument(t)));
    }

    async update(uuid: string, data: Partial<TermProps>): Promise<void> {
        const doc = await this.db.terms.findOne({ selector: { uuid } }).exec();
        if (!doc) return;
        const patchData: Record<string, any> = { ...data };
        if (data.createdAt) patchData.createdAt = toIsoString(data.createdAt);
        if (data.updatedAt) patchData.updatedAt = toIsoString(data.updatedAt);
        if (data.personalCreatedAt) patchData.personalCreatedAt = toIsoString(data.personalCreatedAt);
        if (data.personalUpdatedAt) patchData.personalUpdatedAt = toIsoString(data.personalUpdatedAt);
        await doc.patch(patchData);
    }

    async updateCounters(
        uuid: string,
        userUuid: string,
        counters: Partial<Pick<Term, 'chooseErrorCounter' | 'writeErrorCounter' | 'choiceNegErrorCounter' | 'watchCount'>>
    ): Promise<void> {
        const doc = await this.db.terms.findOne({ selector: { uuid, userUuid } }).exec();
        if (doc) await doc.patch(counters);
    }

    async delete(uuid: string): Promise<void> {
        const doc = await this.db.terms.findOne({ selector: { uuid } }).exec();
        if (doc) await doc.remove();
    }

    async findByPk(uuid: string): Promise<Term | null> {
        const doc = await this.db.terms.findOne({ selector: { uuid } }).exec();
        return doc ? this.toDomain(doc.toJSON()) : null;
    }

    observeByPk(uuid: string): Observable<Term | null> {
        return (this.db.terms.findOne({ selector: { uuid } }).$ as Observable<any>).pipe(
            map(doc => (doc ? this.toDomain(doc.toJSON()) : null))
        );
    }

    async getById(uuid: string, userUuid: string): Promise<Term | null> {
        const doc = await this.db.terms.findOne({ selector: { uuid, userUuid } }).exec();
        return doc ? this.toDomain(doc.toJSON()) : null;
    }

    async getByModule(moduleUuid: string, userUuid: string): Promise<Term[]> {
        return this.findByModuleUuid(moduleUuid, userUuid);
    }

    async findByUserUuid(userUuid: string): Promise<Term[]> {
        const docs = await this.db.terms.find({ selector: { userUuid } }).exec();
        return docs.map(d => this.toDomain(d.toJSON()));
    }

    async findByModuleUuid(moduleUuid: string, userUuid: string): Promise<Term[]> {
        const docs = await this.db.terms.find({ selector: { moduleUuid, userUuid } }).exec();
        return docs.map(d => this.toDomain(d.toJSON()));
    }

    observeByModuleUuid(moduleUuid: string, userUuid: string): Observable<Term[]> {
        return (this.db.terms.find({ selector: { moduleUuid, userUuid } }).$ as Observable<any>).pipe(
            map(docs => docs.map((d: any) => this.toDomain(d.toJSON())))
        );
    }

    // async saveBatch(entities: Term[]): Promise<void> {
    //     if (entities.length === 0) return;
    //     await this.db.terms.bulkInsert(entities.map(e => this.toDocument(e)));
    // }

    async upsertBatch(entities: Term[]): Promise<void> {
        if (entities.length === 0) return;
        await this.db.terms.bulkUpsert(entities.map(e => this.toDocument(e)));
    }

    async updateBatch(entities: Term[]): Promise<void> {
        if (entities.length === 0) return;
        await this.db.terms.bulkUpsert(entities.map(e => this.toDocument(e)));
    }

    async deleteBatch(entities: Term[]): Promise<void> {
        if (entities.length === 0) return;
        const uuids = entities.map(e => e.uuid);
        await this.db.terms.find({ selector: { uuid: { $in: uuids } } }).remove();
    }
}