// repositories/rxdb-base-sync.repository.ts

// import { RxDatabase, RxCollection } from 'rxdb';
import { Observable, map } from 'rxjs';
import { IBaseSyncRepository} from '@rem-web/domain';
// import { toIsoString } from '../tools';
import {RxDbAbsStudyRepository} from "../study/abs.rxdb.repository";

export abstract class RxDbBaseSyncRepository<T extends { uuid: string }, TProps>
    extends RxDbAbsStudyRepository<T,  TProps>
    implements IBaseSyncRepository<T, string, TProps>
{

    // --- IBaseSyncRepository ---
    async getLocallyCreated(): Promise<T[]> {
        const docs = await this.collection.find({ selector: { syncState: 'created' } }).exec();
        return docs.map(d => this.toDomain(d.toJSON()));
    }

    async getLocallyModified(): Promise<T[]> {
        const docs = await this.collection.find({ selector: { syncState: 'modified' } }).exec();
        return docs.map(d => this.toDomain(d.toJSON()));
    }

    async getWithServerChanges(): Promise<T[]> {
        const docs = await this.collection.find({ selector: { syncState: 'stale' } }).exec();
        return docs.map(d => this.toDomain(d.toJSON()));
    }

    async getUpdating(): Promise<T[]> {
        const docs = await this.collection.find({
            selector: { syncState: { $in: ['syncing_to_server', 'syncing_from_server'] } },
        }).exec();
        return docs.map(d => this.toDomain(d.toJSON()));
    }

    async getWithSyncErrors(): Promise<T[]> {
        const docs = await this.collection.find({ selector: { syncState: 'error' } }).exec();
        return docs.map(d => this.toDomain(d.toJSON()));
    }

    observeLocallyCreated(): Observable<T | null> {
        return (this.collection.find({ selector: { syncState: 'created' } }).$ as Observable<any[]>).pipe(
            map(docs => (docs.length > 0 ? this.toDomain(docs[0].toJSON()) : null))
        );
    }

    observeLocallyModified(): Observable<T | null> {
        return (this.collection.find({ selector: { syncState: 'modified' } }).$ as Observable<any[]>).pipe(
            map(docs => (docs.length > 0 ? this.toDomain(docs[0].toJSON()) : null))
        );
    }

}