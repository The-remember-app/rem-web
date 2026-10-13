// domain/src/use-cases/sync/sentence-sync.use-case.ts

import { AbsSyncUseCase, UpdateScope } from '../abs.sync.use-case';
import {ICollisionResolverService, ISentenceNetworkService, ISentenceRepository, Sentence} from "@rem-web/domain";
// import { Sentence } from '../../entities/sentence';
// import { ISentenceNetworkService } from '../../services/network/sentence.interface.service';
// import { ISentenceRepository } from '../../repositories/sentence.repo.interface';
// import { ICollisionResolverService } from '../../services/collision/collision-resolver.interface.service';


export class SentenceSyncUseCase extends AbsSyncUseCase<Sentence> {
    constructor(
        private readonly networkService: ISentenceNetworkService,
        private readonly repository: ISentenceRepository,
        collisionResolver: ICollisionResolverService<Sentence>
    ) {
        super(collisionResolver);
    }

    protected fetchServerEntitiesBatches(lastSyncTime?: Date): AsyncGenerator<Sentence[], void, unknown> {
        return this.networkService.getByModules([], { updatedAfter: lastSyncTime });
    }

    protected async *fetchDeletedUuidsFromServer(lastSyncTime?: Date): AsyncGenerator<string[], void, unknown> {
        yield [];
    }

    protected async fetchSingleServerEntity(uuid: string): Promise<Sentence> {
        const item = await this.networkService.getById(uuid);
        if (!item) throw new Error(`Sentence ${uuid} не найдено на сервере`);
        return item;
    }

    protected fetchLocalEntitiesByUuids(uuids: string[]): Promise<Sentence[]> {
        return this.repository.findByPks(uuids);
    }

    protected async saveLocally(entities: Sentence[]): Promise<void> {
        if (entities.length === 0) return;
        try {
            await this.repository.upsertBatch(entities);
        } catch (error) {
            console.error('[SentenceSync] Ошибка сохранения предложений:', error);
            for (const sentence of entities) {
                try {
                    await this.repository.upsert(sentence);
                } catch (e) {
                    console.error(`[SentenceSync] Пропущено предложение ${sentence.uuid}`, e);
                }
            }
        }
    }

    protected async hardOverwriteLocally(serverEntities: Sentence[]): Promise<void> {
        for (const item of serverEntities) {
            await this.repository.deleteCascading(item.uuid);
        }
        await this.saveLocally(serverEntities);
    }

    protected deleteLocallyCascading(uuid: string): Promise<void> {
        return this.repository.deleteCascading(uuid);
    }

    protected checkLocalExists(uuid: string): Promise<boolean> {
        return this.repository.exists(uuid);
    }

    protected getLocallyCreated(): Promise<Sentence[]> {
        return this.repository.getLocallyCreated();
    }

    protected getLocallyModified(): Promise<Sentence[]> {
        return this.repository.getLocallyModified();
    }

    protected getStaleEntities(): Promise<Sentence[]> {
        return this.repository.getWithServerChanges();
    }

    protected override async determineUpdateScope(): Promise<UpdateScope> {
        return 'full';
    }

    protected sendCreateToServer(entity: Sentence): Promise<Sentence> {
        return this.networkService.create(entity);
    }

    protected sendUpdateToServer(entity: Sentence): Promise<Sentence> {
        return this.networkService.update(entity.uuid, entity);
    }
}