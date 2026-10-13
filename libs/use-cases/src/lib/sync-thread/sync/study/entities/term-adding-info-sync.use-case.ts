// domain/src/use-cases/sync/term-adding-info-sync.use-case.ts

import { AbsSyncUseCase, UpdateScope } from '../abs.sync.use-case';
// import { TermAddingInfo } from '../../entities/term-adding-info';
// import { ITermAddingInfoNetworkService } from '../../services/network/term-adding-info.interface.service';
// import { ITermAddingInfoRepository } from '../../repositories/term-adding-info.repo.interface';
// import { ICollisionResolverService } from '../../services/collision/collision-resolver.interface.service';
import { TreeSortUtil } from '../../../../utils/tree-sort.util';
import {
    ICollisionResolverService,
    ITermAddingInfoNetworkService,
    ITermAddingInfoRepository,
    TermAddingInfo
} from "@rem-web/domain";

export class TermAddingInfoSyncUseCase extends AbsSyncUseCase<TermAddingInfo> {
    constructor(
        private readonly networkService: ITermAddingInfoNetworkService,
        private readonly repository: ITermAddingInfoRepository,
        collisionResolver: ICollisionResolverService<TermAddingInfo>
    ) {
        super(collisionResolver);
    }

    protected fetchServerEntitiesBatches(lastSyncTime?: Date): AsyncGenerator<TermAddingInfo[], void, unknown> {
        return this.networkService.getByModules([], { updatedAfter: lastSyncTime });
    }

    protected async *fetchDeletedUuidsFromServer(lastSyncTime?: Date): AsyncGenerator<string[], void, unknown> {
        yield [];
    }

    protected async fetchSingleServerEntity(uuid: string): Promise<TermAddingInfo> {
        const item = await this.networkService.getById(uuid);
        if (!item) throw new Error(`TermAddingInfo ${uuid} не найден на сервере`);
        return item;
    }

    protected fetchLocalEntitiesByUuids(uuids: string[]): Promise<TermAddingInfo[]> {
        return this.repository.findByPks(uuids);
    }

    protected async saveLocally(entities: TermAddingInfo[]): Promise<void> {
        if (entities.length === 0) return;

        // Сортировка: родители перед детьми для предотвращения FK-ошибок
        const sortedItems = TreeSortUtil.sortTopologicallyParentFirst(
            entities,
            (item) => item.parentAddInfoUuid
        );

        try {
            await this.repository.upsertBatch(sortedItems);
        } catch (error) {
            console.error('[TermAddingInfoSync] Ошибка сохранения в БД:', error);
            for (const item of sortedItems) {
                try {
                    await this.repository.upsert(item);
                } catch (e) {
                    console.error(`[TermAddingInfoSync] Пропущена запись ${item.uuid}:`, e);
                }
            }
        }
    }

    protected async hardOverwriteLocally(serverEntities: TermAddingInfo[]): Promise<void> {
        // Удаление снизу вверх
        const childFirst = TreeSortUtil.sortTopologicallyChildFirst(
            serverEntities,
            (item) => item.parentAddInfoUuid
        );

        for (const item of childFirst) {
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

    protected getLocallyCreated(): Promise<TermAddingInfo[]> {
        return this.repository.getLocallyCreated();
    }

    protected getLocallyModified(): Promise<TermAddingInfo[]> {
        return this.repository.getLocallyModified();
    }

    protected getStaleEntities(): Promise<TermAddingInfo[]> {
        return this.repository.getWithServerChanges();
    }

    protected override async determineUpdateScope(): Promise<UpdateScope> {
        return 'full'; // Нет разделения на shared/personal
    }

    protected sendCreateToServer(entity: TermAddingInfo): Promise<TermAddingInfo> {
        return this.networkService.create(entity);
    }

    protected sendUpdateToServer(entity: TermAddingInfo): Promise<TermAddingInfo> {
        return this.networkService.update(entity.uuid, entity);
    }
}