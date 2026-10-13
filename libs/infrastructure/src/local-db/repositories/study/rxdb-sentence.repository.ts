// repositories/rxdb-sentence.repository.ts

import { RxDatabase } from 'rxdb';
import { Observable, map } from 'rxjs';
import {EntityType, ISentenceRepository, Sentence, SentenceProps} from '@rem-web/domain';
import { toDate, toIsoString } from '../tools';
import {RxDbBaseSyncRepository} from "../sync/abs-sync.rxdb.repository";
// import {RxDbBaseSyncRepository} from "./abs.rxdb.repository";
// import { RxDbBaseSyncRepository } from './rxdb-base-sync.repository';

export class RxDbSentenceRepository
    extends RxDbBaseSyncRepository<Sentence, SentenceProps>
    implements ISentenceRepository
{
    constructor(db: RxDatabase<any>) {
        super(db);
    }
    protected get entityType(): EntityType {
        return 'sentence';
    }

    protected get collection() {
        return this.db.sentences;
    }

    toDomain(doc: any): Sentence {
        return new Sentence({
            uuid: doc.uuid,
            userUuid: doc.userUuid,
            sentence: doc.sentence ?? null,
            translate: doc.translate ?? null,
            termUuid: doc.termUuid,
            createdAt: toDate(doc.createdAt),
            updatedAt: toDate(doc.updatedAt),
            syncState: doc.syncState ?? 'synced',
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
            syncState: entity.syncState,
        };
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
}