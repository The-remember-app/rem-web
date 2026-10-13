// domain/src/use-cases/sync/module-sync.use-case.ts

import { AbsSyncUseCase, UpdateScope } from '../abs.sync.use-case';
import {ICollisionResolverService, IModuleNetworkService, IModuleRepository, Module} from "@rem-web/domain";
// import { Module } from '../../entities/module';
// import { IModuleNetworkService } from '../../services/network/module.interface.service';
// import { IModuleRepository } from '../../repositories/module.repo.interface';
// import { ICollisionResolverService } from '../../services/collision/collision-resolver.interface.service';


export class ModuleSyncUseCase extends AbsSyncUseCase<Module> {
    constructor(
        // private readonly userUuid: string,
        private readonly moduleNetworkService: IModuleNetworkService,
        private readonly moduleRepository: IModuleRepository,
        collisionResolver: ICollisionResolverService<Module>
    ) {
        super(collisionResolver);
    }

    protected fetchServerEntitiesBatches(lastSyncTime?: Date): AsyncGenerator<Module[], void, unknown> {
        return this.moduleNetworkService.getPersonalByFolders([], { updatedAfter: lastSyncTime });
    }

    protected async *fetchDeletedUuidsFromServer(lastSyncTime?: Date): AsyncGenerator<string[], void, unknown> {
        yield [];
    }

    protected async fetchSingleServerEntity(uuid: string): Promise<Module> {
        const module = await this.moduleNetworkService.getPersonalById(uuid);
        if (!module) throw new Error(`Модуль ${uuid} не найден на сервере`);
        return module;
    }

    protected fetchLocalEntitiesByUuids(uuids: string[]): Promise<Module[]> {
        return this.moduleRepository.findByPks(uuids);
    }

    protected async saveLocally(entities: Module[]): Promise<void> {
        if (entities.length === 0) return;
        try {
            await this.moduleRepository.upsertBatch(entities);
        } catch (error) {
            console.error('[ModuleSync] Ошибка сохранения модулей в БД:', error);
            for (const module of entities) {
                try {
                    await this.moduleRepository.upsert(module);
                } catch (e) {
                    console.error(`[ModuleSync] Пропущен модуль ${module.uuid} из-за отсутствующей родительской папки`, e);
                }
            }
        }
    }

    protected async hardOverwriteLocally(serverEntities: Module[]): Promise<void> {
        for (const entity of serverEntities) {
            await this.moduleRepository.deleteCascading(entity.uuid);
        }
        await this.saveLocally(serverEntities);
    }

    protected deleteLocallyCascading(uuid: string): Promise<void> {
        return this.moduleRepository.deleteCascading(uuid);
    }

    protected checkLocalExists(uuid: string): Promise<boolean> {
        return this.moduleRepository.exists(uuid);
    }

    protected getLocallyCreated(): Promise<Module[]> {
        return this.moduleRepository.getLocallyCreated();
    }

    protected getLocallyModified(): Promise<Module[]> {
        return this.moduleRepository.getLocallyModified();
    }

    protected getStaleEntities(): Promise<Module[]> {
        return this.moduleRepository.getWithServerChanges();
    }

    protected override async determineUpdateScope(entity: Module): Promise<UpdateScope> {
        const isShared = (entity as any).isSharedLocallyUpdated;
        const isPersonal = (entity as any).isPersonalLocallyUpdated;

        if (isShared && isPersonal) return 'both';
        if (isShared) return 'shared';
        if (isPersonal) return 'personal';
        return 'full';
    }

    protected sendCreateToServer(entity: Module): Promise<Module> {
        return this.moduleNetworkService.createPersonal(entity);
    }

    protected sendUpdateToServer(entity: Module): Promise<Module> {
        return this.moduleNetworkService.updatePersonal(entity.uuid, entity);
    }

    protected override async sendSharedUpdateToServer(entity: Module): Promise<Module> {
        const shared = await this.moduleNetworkService.updateShared(entity.uuid, entity as any);
        return shared as unknown as Module;
    }

    protected override sendPersonalUpdateToServer(entity: Module): Promise<Module> {
        return this.moduleNetworkService.updatePersonal(entity.uuid, entity);
    }
}