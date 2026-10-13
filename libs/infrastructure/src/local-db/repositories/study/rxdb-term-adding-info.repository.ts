// repositories/rxdb-term-adding-info.repository.ts

import { RxDatabase } from 'rxdb';
import { Observable, map } from 'rxjs';
import {EntityType, ITermAddingInfoRepository, TermAddingInfo, TermAddingInfoProps} from '@rem-web/domain';
import { toDate, toIsoString } from '../tools';
import {RxDbBaseSyncRepository} from "../sync/abs-sync.rxdb.repository";
// import {RxDbBaseSyncRepository} from "./abs.rxdb.repository";
// import { RxDbBaseSyncRepository } from './rxdb-base-sync.repository';

export class RxDbTermAddingInfoRepository
    extends RxDbBaseSyncRepository<TermAddingInfo, TermAddingInfoProps>
    implements ITermAddingInfoRepository
{
    constructor(db: RxDatabase<any>) {
        super(db);
    }
    protected get entityType(): EntityType {
        return 'term_adding_info';
    }

    protected get collection() {
        return this.db.termAddingInfos;
    }

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
            syncState: doc.syncState ?? 'synced',
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
            syncState: entity.syncState,
        };
    }

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

    override async deleteCascading(uuid: string): Promise<void> {
        // Находим все дочерние элементы, ссылающиеся на текущую запись
        const children = await this.db.termAddingInfos
            .find({ selector: { parentAddInfoUuid: uuid } })
            .exec();

        // Рекурсивно удаляем каждого потомка
        for (const child of children) {
            await this.deleteCascading(child.uuid);
        }

        // Удаляем саму сущность (вызов super/this.delete запишет удаление в deleted_entities)
        await this.delete(uuid);
    }
}