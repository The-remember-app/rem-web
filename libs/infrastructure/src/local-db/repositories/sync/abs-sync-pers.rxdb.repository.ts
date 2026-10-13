// repositories/rxdb-base-pers-sync.repository.ts

import {Observable, map} from 'rxjs';
import {IBasePersSyncRepository} from '@rem-web/domain';
// import {RxDbAbsStudyRepository} from "../study/abs.rxdb.repository";
import {RxDbBaseSyncRepository} from "./abs-sync.rxdb.repository";

// import { RxDbBaseSyncRepository } from './rxdb-base-sync.repository';

export abstract class RxDbBasePersSyncRepository<T extends { uuid: string }, TProps>
    extends RxDbBaseSyncRepository<T, TProps>
    implements IBasePersSyncRepository<T, string, TProps> {

    override async getLocallyCreated(): Promise<T[]> {
        const docs = await this.collection.find({
            selector: {
                $or: [
                    {syncState: 'created'},
                    {personalSyncState: 'created'}
                ]
            }
        }).exec();
        return docs.map(d => this.toDomain(d.toJSON()));
    }

    override async getLocallyModified(): Promise<T[]> {
        const docs = await this.collection.find({
            selector: {
                $or: [
                    {syncState: 'modified'},
                    {personalSyncState: 'modified'},
                ]
            }
        }).exec();
        return docs.map(d => this.toDomain(d.toJSON()));
    }

    override async getWithServerChanges(): Promise<T[]> {
        const docs = await this.collection.find({
            selector: {
                $or: [
                    {syncState: 'stale'},
                    {personalSyncState: 'stale'}
                ]
            }
        }).exec();
        return docs.map(d => this.toDomain(d.toJSON()));
    }

    override async getUpdating(): Promise<T[]> {
        const docs = await this.collection.find({
            selector: {
                $or: [
                    {syncState: {$in: ['syncing_to_server', 'syncing_from_server']}},
                    {personalSyncState: {$in: ['syncing_to_server', 'syncing_from_server']}}
                ]
            }
        }).exec();
        return docs.map(d => this.toDomain(d.toJSON()));
    }

    override async getWithSyncErrors(): Promise<T[]> {
        const docs = await this.collection.find({
            selector: {
                $or: [
                    {syncState: 'error'},
                    {personalSyncState: 'error'}
                ]
            }
        }).exec();
        return docs.map(d => this.toDomain(d.toJSON()));
    }

    override observeLocallyCreated(): Observable<T | null> {
        return (this.collection.find({
            selector: {
                $or: [
                    {syncState: 'created'},
                    {personalSyncState: 'created'}
                ]
            }
        }).$ as Observable<any[]>).pipe(
            map(docs => (docs.length > 0 ? this.toDomain(docs[0].toJSON()) : null))
        );
    }

    override observeLocallyModified(): Observable<T | null> {
        return (this.collection.find({
            selector: {
                $or: [
                    {syncState: 'modified'},
                    {personalSyncState: 'modified'}
                ]
            }
        }).$ as Observable<any[]>).pipe(
            map(docs => (docs.length > 0 ? this.toDomain(docs[0].toJSON()) : null))
        );
    }

    // --- IBasePersSyncRepository ---
    async getPersLocallyCreated(): Promise<T[]> {
        const docs = await this.collection.find({selector: {personalSyncState: 'created'}}).exec();
        return docs.map(d => this.toDomain(d.toJSON()));
    }

    async getPersLocallyModified(): Promise<T[]> {
        const docs = await this.collection.find({selector: {personalSyncState: 'modified'}}).exec();
        return docs.map(d => this.toDomain(d.toJSON()));
    }

    async getPersWithServerChanges(): Promise<T[]> {
        const docs = await this.collection.find({selector: {personalSyncState: 'stale'}}).exec();
        return docs.map(d => this.toDomain(d.toJSON()));
    }

    async getPersUpdating(): Promise<T[]> {
        const docs = await this.collection.find({
            selector: {personalSyncState: {$in: ['syncing_to_server', 'syncing_from_server']}},
        }).exec();
        return docs.map(d => this.toDomain(d.toJSON()));
    }

    async getPersWithSyncErrors(): Promise<T[]> {
        const docs = await this.collection.find({selector: {personalSyncState: 'error'}}).exec();
        return docs.map(d => this.toDomain(d.toJSON()));
    }

    observePersLocallyCreated(): Observable<T | null> {
        return (this.collection.find({selector: {personalSyncState: 'created'}}).$ as Observable<any[]>).pipe(
            map(docs => (docs.length > 0 ? this.toDomain(docs[0].toJSON()) : null))
        );
    }

    observePersLocallyModified(): Observable<T | null> {
        return (this.collection.find({selector: {personalSyncState: 'modified'}}).$ as Observable<any[]>).pipe(
            map(docs => (docs.length > 0 ? this.toDomain(docs[0].toJSON()) : null))
        );
    }
}