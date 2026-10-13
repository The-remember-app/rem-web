// repositories/rxdb-learn-term-datetime-mark.repository.ts

import { RxDatabase } from 'rxdb';
import { Observable, map } from 'rxjs';
import {
    EntityType,
    ILearnTermDatetimeMarkRepository,
    LearnTermDatetimeMark,
    LearnTermDatetimeMarkProps
} from '@rem-web/domain';
import { toDate, toIsoString } from '../tools';
import {RxDbBaseSyncRepository} from "../sync/abs-sync.rxdb.repository";
// import {RxDbBaseSyncRepository} from "./abs.rxdb.repository";
// import { RxDbBaseSyncRepository } from './rxdb-base-sync.repository';

export class RxDbLearnTermDatetimeMarkRepository
    extends RxDbBaseSyncRepository<LearnTermDatetimeMark, LearnTermDatetimeMarkProps>
    implements ILearnTermDatetimeMarkRepository
{
    constructor(db: RxDatabase<any>) {
        super(db);
    }

    protected get collection() {
        return this.db.learnMarks;
    }
    protected get entityType(): EntityType {
        return 'learn_mark';
    }

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
            syncState: doc.syncState ?? 'synced',
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
            syncState: entity.syncState,
        };
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
}