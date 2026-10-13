// repositories/rxdb-term.repository.ts

import { RxDatabase } from 'rxdb';
import { Observable, map } from 'rxjs';
import {EntityType, ITermRepository, Term, TermProps} from '@rem-web/domain';
import { toDate, toIsoString } from '../tools';
import {RxDbBasePersSyncRepository} from "../sync/abs-sync-pers.rxdb.repository";
import {RxDbSentenceRepository} from "./rxdb-sentence.repository";
import {RxDbTermAddingInfoRepository} from "./rxdb-term-adding-info.repository";
import {RxDbLearnTermDatetimeMarkRepository} from "./rxdb-learn-term-datetime-mark.repository";
// import { RxDbBasePersSyncRepository } from './rxdb-base-pers-sync.repository';

export class RxDbTermRepository
    extends RxDbBasePersSyncRepository<Term, TermProps>
    implements ITermRepository
{
    constructor(db: RxDatabase<any>) {
        super(db);
    }

    protected get collection() {
        return this.db.terms;
    }
    protected get entityType(): EntityType {
        return 'term';
    }

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
            syncState: doc.syncState ?? 'synced',
            personalSyncState: doc.personalSyncState ?? 'synced',
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
            syncState: entity.syncState,
            personalSyncState: entity.personalSyncState,
        };
    }

    override async deleteCascading(uuid: string): Promise<void> {
        const sentenceRepo = new RxDbSentenceRepository(this.db);
        const sentences = await this.db.sentences.find({ selector: { termUuid: uuid } }).exec();
        for (const doc of sentences) {
            await sentenceRepo.delete(doc.uuid);
        }

        const addInfoRepo = new RxDbTermAddingInfoRepository(this.db);
        const addInfos = await this.db.termAddingInfos.find({ selector: { termUuid: uuid } }).exec();
        for (const doc of addInfos) {
            await addInfoRepo.delete(doc.uuid);
        }

        const markRepo = new RxDbLearnTermDatetimeMarkRepository(this.db);
        const marks = await this.db.learnMarks.find({ selector: { termUuid: uuid } }).exec();
        for (const doc of marks) {
            await markRepo.delete(doc.uuid);
        }

        await this.delete(uuid);
    }

    async updateCounters(
        uuid: string,
        userUuid: string,
        counters: Partial<Pick<Term, 'chooseErrorCounter' | 'writeErrorCounter' | 'choiceNegErrorCounter' | 'watchCount'>>
    ): Promise<void> {
        const doc = await this.db.terms.findOne({ selector: { uuid, userUuid } }).exec();
        if (doc) await doc.patch(counters);
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
}