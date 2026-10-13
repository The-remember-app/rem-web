// domain/src/use-cases/sync/term-sync.use-case.ts

import { AbsSyncUseCase, UpdateScope } from '../abs.sync.use-case';
import {ICollisionResolverService, ITermNetworkService, ITermRepository, Term} from "@rem-web/domain";
// import { Term } from '../../entities/term';
// import { ITermNetworkService } from '../../services/network/term.interface.service';
// import { ITermRepository } from '../../repositories/term.repo.interface';
// import { ICollisionResolverService } from '../../services/collision/collision-resolver.interface.service';

export class TermSyncUseCase extends AbsSyncUseCase<Term> {
    constructor(
        // private readonly userUuid: string,
        private readonly termNetworkService: ITermNetworkService,
        private readonly termRepository: ITermRepository,
        collisionResolver: ICollisionResolverService<Term>
    ) {
        super(collisionResolver);
    }

    protected fetchServerEntitiesBatches(lastSyncTime?: Date): AsyncGenerator<Term[], void, unknown> {
        return this.termNetworkService.getPersonalByModules([], { updatedAfter: lastSyncTime });
    }

    protected async *fetchDeletedUuidsFromServer(lastSyncTime?: Date): AsyncGenerator<string[], void, unknown> {
        yield [];
    }

    protected async fetchSingleServerEntity(uuid: string): Promise<Term> {
        const term = await this.termNetworkService.getPersonalById(uuid);
        if (!term) throw new Error(`Термин ${uuid} не найден на сервере`);
        return term;
    }

    protected fetchLocalEntitiesByUuids(uuids: string[]): Promise<Term[]> {
        return this.termRepository.findByPks(uuids);
    }

    protected async saveLocally(entities: Term[]): Promise<void> {
        if (entities.length === 0) return;
        try {
            await this.termRepository.upsertBatch(entities);
        } catch (error) {
            console.error('[TermSync] Ошибка сохранения терминов:', error);
            for (const term of entities) {
                try {
                    await this.termRepository.upsert(term);
                } catch (e) {
                    console.error(`[TermSync] Пропущен термин ${term.uuid} из-за отсутствующего модуля`, e);
                }
            }
        }
    }

    protected async hardOverwriteLocally(serverEntities: Term[]): Promise<void> {
        for (const entity of serverEntities) {
            await this.termRepository.deleteCascading(entity.uuid);
        }
        await this.saveLocally(serverEntities);
    }

    protected deleteLocallyCascading(uuid: string): Promise<void> {
        return this.termRepository.deleteCascading(uuid);
    }

    protected checkLocalExists(uuid: string): Promise<boolean> {
        return this.termRepository.exists(uuid);
    }

    protected getLocallyCreated(): Promise<Term[]> {
        return this.termRepository.getLocallyCreated();
    }

    protected getLocallyModified(): Promise<Term[]> {
        return this.termRepository.getLocallyModified();
    }

    protected getStaleEntities(): Promise<Term[]> {
        return this.termRepository.getWithServerChanges();
    }

    protected override async determineUpdateScope(entity: Term): Promise<UpdateScope> {
        const isShared = (entity as any).isSharedLocallyUpdated;
        const isPersonal = (entity as any).isPersonalLocallyUpdated;

        if (isShared && isPersonal) return 'both';
        if (isShared) return 'shared';
        if (isPersonal) return 'personal';
        return 'full';
    }

    protected sendCreateToServer(entity: Term): Promise<Term> {
        return this.termNetworkService.createPersonal(entity);
    }

    protected sendUpdateToServer(entity: Term): Promise<Term> {
        return this.termNetworkService.updatePersonal(entity.uuid, entity);
    }

    protected override async sendSharedUpdateToServer(entity: Term): Promise<Term> {
        const shared = await this.termNetworkService.updateShared(entity.uuid, entity as any);
        return shared as unknown as Term;
    }

    protected override sendPersonalUpdateToServer(entity: Term): Promise<Term> {
        return this.termNetworkService.updatePersonal(entity.uuid, entity);
    }
}