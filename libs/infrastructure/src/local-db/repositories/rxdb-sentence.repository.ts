import { RxDatabase } from 'rxdb';
import { Observable, map } from 'rxjs';
// import { ISentenceRepository } from './sentence.repo.interface';
// import { Sentence, SentenceProps } from '../../entities/sentence';
import { toDate, toIsoString } from './tools';
import {ISentenceRepository, Sentence, SentenceProps} from "@rem-web/domain";

export class RxDbSentenceRepository implements ISentenceRepository {
    constructor(private readonly db: RxDatabase) {}

    toDomain(doc: any): Sentence {
        return new Sentence({
            uuid: doc.uuid,
            userUuid: doc.userUuid,
            sentence: doc.sentence ?? null,
            translate: doc.translate ?? null,
            termUuid: doc.termUuid,
            createdAt: toDate(doc.createdAt),
            updatedAt: toDate(doc.updatedAt),
        });
    }

    toDocument(entity: Sentence): Record<string, any> {
        return {
            uuid: entity.uuid,
            userUuid: entity.userUuid,
            sentence: entity.sentence ?? null,
            translate: entity.translate ?? null,
            termUuid: entity.termUuid,
            createdAt: toIsoString(entity.createdAt),
            updatedAt: toIsoString(entity.updatedAt),
        };
    }

    async save(entity: Sentence): Promise<void> {
        await this.db.sentences.insert(this.toDocument(entity));
    }

    async upsert(entity: Sentence): Promise<void> {
        await this.db.sentences.upsert(this.toDocument(entity));
    }

    async saveBatch(sentences: Sentence[]): Promise<void> {
        if (sentences.length === 0) return;
        await this.db.sentences.bulkUpsert(sentences.map(s => this.toDocument(s)));
    }

    async update(uuid: string, data: Partial<SentenceProps>): Promise<void> {
        const doc = await this.db.sentences.findOne({ selector: { uuid } }).exec();
        if (!doc) return;
        const patchData: Record<string, any> = { ...data };
        if (data.createdAt) patchData.createdAt = toIsoString(data.createdAt);
        if (data.updatedAt) patchData.updatedAt = toIsoString(data.updatedAt);
        await doc.patch(patchData);
    }

    async delete(uuid: string): Promise<void> {
        const doc = await this.db.sentences.findOne({ selector: { uuid } }).exec();
        if (doc) await doc.remove();
    }

    async findByPk(uuid: string): Promise<Sentence | null> {
        const doc = await this.db.sentences.findOne({ selector: { uuid } }).exec();
        return doc ? this.toDomain(doc.toJSON()) : null;
    }

    observeByPk(uuid: string): Observable<Sentence | null> {
        return (this.db.sentences.findOne({ selector: { uuid } }).$ as Observable<any>).pipe(
            map(doc => (doc ? this.toDomain(doc.toJSON()) : null))
        );
    }


    async getById(uuid: string, userUuid: string): Promise<Sentence | null> {
        const doc = await this.db.sentences.findOne({ selector: { uuid, userUuid } }).exec();
        return doc ? this.toDomain(doc.toJSON()) : null;
    }

    async getByTerm(termUuid: string, userUuid: string): Promise<Sentence[]> {
        return this.findByTermUuid(termUuid, userUuid);
    }

    async findByUserUuid(userUuid: string): Promise<Sentence[]> {
        const docs = await this.db.sentences.find({ selector: { userUuid } }).exec();
        return docs.map(d => this.toDomain(d.toJSON()));
    }

    async findByTermUuid(termUuid: string, userUuid: string): Promise<Sentence[]> {
        const docs = await this.db.sentences.find({ selector: { termUuid, userUuid } }).exec();
        return docs.map(d => this.toDomain(d.toJSON()));
    }

    observeByTermUuid(termUuid: string, userUuid: string): Observable<Sentence[]> {
        return (this.db.sentences.find({ selector: { termUuid, userUuid } }).$ as Observable<any>).pipe(
            map(docs => docs.map((d: any) => this.toDomain(d.toJSON())))
        );
    }

    async findByModuleUuid(moduleUuid: string, userUuid: string): Promise<Sentence[]> {
        const terms = await this.db.terms.find({ selector: { moduleUuid, userUuid } }).exec();
        const termUuids = terms.map(t => t.uuid);
        if (termUuids.length === 0) return [];

        const docs = await this.db.sentences.find({
            selector: {
                termUuid: { $in: termUuids },
                userUuid,
            },
        }).exec();

        return docs.map(d => this.toDomain(d.toJSON()));
    }

    // async saveBatch(entities: Sentence[]): Promise<void> {
    //     if (entities.length === 0) return;
    //     await this.db.sentences.bulkInsert(entities.map(e => this.toDocument(e)));
    // }

    async upsertBatch(entities: Sentence[]): Promise<void> {
        if (entities.length === 0) return;
        await this.db.sentences.bulkUpsert(entities.map(e => this.toDocument(e)));
    }

    async updateBatch(entities: Sentence[]): Promise<void> {
        if (entities.length === 0) return;
        await this.db.sentences.bulkUpsert(entities.map(e => this.toDocument(e)));
    }

    async deleteBatch(entities: Sentence[]): Promise<void> {
        if (entities.length === 0) return;
        const uuids = entities.map(e => e.uuid);
        await this.db.sentences.find({ selector: { uuid: { $in: uuids } } }).remove();
    }
}