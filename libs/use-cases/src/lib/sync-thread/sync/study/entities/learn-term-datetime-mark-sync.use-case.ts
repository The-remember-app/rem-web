// domain/src/use-cases/sync/learn-term-datetime-mark-sync.use-case.ts

import { AbsSyncUseCase, UpdateScope } from '../abs.sync.use-case';
import {
    ICollisionResolverService,
    ILearnTermDatetimeMarkNetworkService,
    ILearnTermDatetimeMarkRepository,
    LearnTermDatetimeMark
} from "@rem-web/domain";
// import { LearnTermDatetimeMark } from '../../entities/learn-term-datetime-mark';
// import { ILearnTermDatetimeMarkNetworkService } from '../../services/network/learn-term-datetime-mark.interface.service';
// import { ILearnTermDatetimeMarkRepository } from '../../repositories/learn-term-datetime-mark.repo.interface';
// import { ICollisionResolverService } from '../../services/collision/collision-resolver.interface.service';

export class LearnTermDatetimeMarkSyncUseCase extends AbsSyncUseCase<LearnTermDatetimeMark> {
    constructor(
        private readonly networkService: ILearnTermDatetimeMarkNetworkService,
        private readonly repository: ILearnTermDatetimeMarkRepository,
        collisionResolver: ICollisionResolverService<LearnTermDatetimeMark>
    ) {
        super(collisionResolver);
    }

    protected fetchServerEntitiesBatches(lastSyncTime?: Date): AsyncGenerator<LearnTermDatetimeMark[], void, unknown> {
        return this.networkService.getByModules([], { updatedAfter: lastSyncTime });
    }

    protected async *fetchDeletedUuidsFromServer(lastSyncTime?: Date): AsyncGenerator<string[], void, unknown> {
        yield [];
    }

    protected async fetchSingleServerEntity(uuid: string): Promise<LearnTermDatetimeMark> {
        const item = await this.networkService.getById(uuid);
        if (!item) throw new Error(`LearnTermDatetimeMark ${uuid} не найден на сервере`);
        return item;
    }

    protected fetchLocalEntitiesByUuids(uuids: string[]): Promise<LearnTermDatetimeMark[]> {
        return this.repository.findByPks(uuids);
    }

    protected async saveLocally(entities: LearnTermDatetimeMark[]): Promise<void> {
        if (entities.length === 0) return;
        try {
            await this.repository.upsertBatch(entities);
        } catch (error) {
            console.error('[MarkSync] Ошибка сохранения отметок:', error);
            for (const mark of entities) {
                try {
                    await this.repository.upsert(mark);
                } catch (e) {
                    console.error(`[MarkSync] Пропущена отметка ${mark.uuid}`, e);
                }
            }
        }
    }

    protected async hardOverwriteLocally(serverEntities: LearnTermDatetimeMark[]): Promise<void> {
        for (const mark of serverEntities) {
            await this.repository.deleteCascading(mark.uuid);
        }
        await this.saveLocally(serverEntities);
    }

    protected deleteLocallyCascading(uuid: string): Promise<void> {
        return this.repository.deleteCascading(uuid);
    }

    protected checkLocalExists(uuid: string): Promise<boolean> {
        return this.repository.exists(uuid);
    }

    protected getLocallyCreated(): Promise<LearnTermDatetimeMark[]> {
        return this.repository.getLocallyCreated();
    }

    protected getLocallyModified(): Promise<LearnTermDatetimeMark[]> {
        return this.repository.getLocallyModified();
    }

    protected getStaleEntities(): Promise<LearnTermDatetimeMark[]> {
        return this.repository.getWithServerChanges();
    }

    protected override async determineUpdateScope(): Promise<UpdateScope> {
        return 'full';
    }

    protected sendCreateToServer(entity: LearnTermDatetimeMark): Promise<LearnTermDatetimeMark> {
        return this.networkService.create(entity);
    }

    protected sendUpdateToServer(entity: LearnTermDatetimeMark): Promise<LearnTermDatetimeMark> {
        return this.networkService.update(entity.uuid, entity);
    }
}