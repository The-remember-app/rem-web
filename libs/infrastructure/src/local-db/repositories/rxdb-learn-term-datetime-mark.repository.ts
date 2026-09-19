import { RxDatabase } from 'rxdb';
import { Observable, map } from 'rxjs';
// import { ILearnTermDatetimeMarkRepository } from './learn-term-datetime-mark.repo.interface';
// import { LearnTermDatetimeMark, LearnTermDatetimeMarkProps } from '../../entities/learn-term-datetime-mark';
import { toDate, toIsoString } from './tools';
import {ILearnTermDatetimeMarkRepository, LearnTermDatetimeMark, LearnTermDatetimeMarkProps} from "@rem-web/domain";

export class RxDbLearnTermDatetimeMarkRepository implements ILearnTermDatetimeMarkRepository {
    constructor(private readonly db: RxDatabase) {}

    toDomain(doc: any): LearnTermDatetimeMark {
        return new LearnTermDatetimeMark({
            uuid: doc.uuid,
            userUuid: doc.userUuid,
            termUuid: doc.termUuid,
            startWatch: toDate(doc.startWatch),
            endWatch: toDate(doc.endWatch),
            isLearnt: doc.isLearnt,
            isLearnIterStart: doc.isLearnIterStart,
            watchType: doc.watchType,
            createdAt: toDate(doc.createdAt),
            updatedAt: toDate(doc.updatedAt),
        });
    }

    toDocument(entity: LearnTermDatetimeMark): Record<string, any> {
        return {
            uuid: entity.uuid,
            userUuid: entity.userUuid,
            termUuid: entity.termUuid,
            startWatch: toIsoString(entity.startWatch),
            endWatch: toIsoString(entity.endWatch),
            isLearnt: entity.isLearnt,
            isLearnIterStart: entity.isLearnIterStart,
            watchType: entity.watchType,
            createdAt: toIsoString(entity.createdAt),
            updatedAt: toIsoString(entity.updatedAt),
        };
    }

    async save(entity: LearnTermDatetimeMark): Promise<void> {
        await this.db.learnMarks.insert(this.toDocument(entity));
    }

    async upsert(entity: LearnTermDatetimeMark): Promise<void> {
        await this.db.learnMarks.upsert(this.toDocument(entity));
    }

    async saveBatch(marks: LearnTermDatetimeMark[]): Promise<void> {
        if (marks.length === 0) return;
        await this.db.learnMarks.bulkUpsert(marks.map(m => this.toDocument(m)));
    }

    async update(uuid: string, data: Partial<LearnTermDatetimeMarkProps>): Promise<void> {
        const doc = await this.db.learnMarks.findOne({ selector: { uuid } }).exec();
        if (!doc) return;
        const patchData: Record<string, any> = { ...data };
        if (data.startWatch) patchData.startWatch = toIsoString(data.startWatch);
        if (data.endWatch) patchData.endWatch = toIsoString(data.endWatch);
        if (data.createdAt) patchData.createdAt = toIsoString(data.createdAt);
        if (data.updatedAt) patchData.updatedAt = toIsoString(data.updatedAt);
        await doc.patch(patchData);
    }

    async delete(uuid: string): Promise<void> {
        const doc = await this.db.learnMarks.findOne({ selector: { uuid } }).exec();
        if (doc) await doc.remove();
    }

    async findByPk(uuid: string): Promise<LearnTermDatetimeMark | null> {
        const doc = await this.db.learnMarks.findOne({ selector: { uuid } }).exec();
        return doc ? this.toDomain(doc.toJSON()) : null;
    }

    observeByPk(uuid: string): Observable<LearnTermDatetimeMark | null> {
        return (this.db.learnMarks.findOne({ selector: { uuid } }).$ as Observable<any>).pipe(
            map(doc => (doc ? this.toDomain(doc.toJSON()) : null))
        );
    }

    async getById(uuid: string, userUuid: string): Promise<LearnTermDatetimeMark | null> {
        const doc = await this.db.learnMarks.findOne({ selector: { uuid, userUuid } }).exec();
        return doc ? this.toDomain(doc.toJSON()) : null;
    }

    async getByTerm(termUuid: string, userUuid: string): Promise<LearnTermDatetimeMark[]> {
        return this.findByTermUuid(termUuid, userUuid);
    }

    async findByUserUuid(userUuid: string): Promise<LearnTermDatetimeMark[]> {
        const docs = await this.db.learnMarks.find({ selector: { userUuid } }).exec();
        return docs.map(d => this.toDomain(d.toJSON()));
    }

    async findByTermUuid(termUuid: string, userUuid: string): Promise<LearnTermDatetimeMark[]> {
        const docs = await this.db.learnMarks.find({ selector: { termUuid, userUuid } }).exec();
        return docs.map(d => this.toDomain(d.toJSON()));
    }

    observeByTermUuid(termUuid: string, userUuid: string): Observable<LearnTermDatetimeMark[]> {
        return (this.db.learnMarks.find({ selector: { termUuid, userUuid } }).$ as Observable<any>).pipe(
            map(docs => docs.map((d: any) => this.toDomain(d.toJSON())))
        );
    }

    async findByModuleUuid(moduleUuid: string, userUuid: string): Promise<LearnTermDatetimeMark[]> {
        const terms = await this.db.terms.find({ selector: { moduleUuid, userUuid } }).exec();
        const termUuids = terms.map(t => t.uuid);
        if (termUuids.length === 0) return [];

        const docs = await this.db.learnMarks.find({
            selector: {
                termUuid: { $in: termUuids },
                userUuid,
            },
        }).exec();

        return docs.map(d => this.toDomain(d.toJSON()));
    }

    // async saveBatch(entities: LearnTermDatetimeMark[]): Promise<void> {
    //     if (entities.length === 0) return;
    //     await this.db.learnMarks.bulkInsert(entities.map(e => this.toDocument(e)));
    // }

    async upsertBatch(entities: LearnTermDatetimeMark[]): Promise<void> {
        if (entities.length === 0) return;
        await this.db.learnMarks.bulkUpsert(entities.map(e => this.toDocument(e)));
    }

    async updateBatch(entities: LearnTermDatetimeMark[]): Promise<void> {
        if (entities.length === 0) return;
        await this.db.learnMarks.bulkUpsert(entities.map(e => this.toDocument(e)));
    }

    async deleteBatch(entities: LearnTermDatetimeMark[]): Promise<void> {
        if (entities.length === 0) return;
        const uuids = entities.map(e => e.uuid);
        await this.db.learnMarks.find({ selector: { uuid: { $in: uuids } } }).remove();
    }
}