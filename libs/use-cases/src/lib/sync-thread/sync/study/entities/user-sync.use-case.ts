// domain/src/use-cases/sync/user-sync.use-case.ts

import { AbsSyncUseCase, UpdateScope } from '../abs.sync.use-case';
import {ICollisionResolverService, IUserNetworkService, IUserRepository, User} from "@rem-web/domain";
// import { User } from '../../entities/user';
// import { IUserNetworkService } from '../../services/network/user.interface.service';
// import { IUserRepository } from '../../repositories/user.repo.interface';
// import { ICollisionResolverService } from '../../services/collision/collision-resolver.interface.service';

export class UserSyncUseCase extends AbsSyncUseCase<User> {
    constructor(
        private readonly userNetworkService: IUserNetworkService,
        private readonly userRepository: IUserRepository,
        collisionResolver: ICollisionResolverService<User>
    ) {
        super(collisionResolver);
    }

    protected async *fetchServerEntitiesBatches(lastSyncTime?: Date): AsyncGenerator<User[], void, unknown> {
        const user = await this.userNetworkService.getMe();
        if (user) {
            yield [user];
        }
    }

    protected async *fetchDeletedUuidsFromServer(lastSyncTime?: Date): AsyncGenerator<string[], void, unknown> {
        yield [];
    }

    protected async fetchSingleServerEntity(uuid: string): Promise<User> {
        const user = await this.userNetworkService.getMe();
        if (!user) throw new Error('Пользователь не найден на сервере');
        return user;
    }

    protected async fetchLocalEntitiesByUuids(uuids: string[]): Promise<User[]> {
        const user = await this.userRepository.findActiveUser();
        return user && uuids.includes(user.uuid) ? [user] : [];
    }

    protected async saveLocally(entities: User[]): Promise<void> {
        if (entities.length === 0) return;
        await this.userRepository.upsertBatch(entities);
    }

    protected async hardOverwriteLocally(serverEntities: User[]): Promise<void> {
        for (const user of serverEntities) {
            await this.userRepository.delete(user.uuid);
        }
        await this.saveLocally(serverEntities);
    }

    protected deleteLocallyCascading(uuid: string): Promise<void> {
        return this.userRepository.delete(uuid);
    }

    protected checkLocalExists(uuid: string): Promise<boolean> {
        return this.userRepository.exists(uuid);
    }

    protected getLocallyCreated(): Promise<User[]> {
        return this.userRepository.getLocallyCreated();
    }

    protected getLocallyModified(): Promise<User[]> {
        return this.userRepository.getLocallyModified();
    }

    protected getStaleEntities(): Promise<User[]> {
        return this.userRepository.getWithServerChanges();
    }

    protected override async determineUpdateScope(): Promise<UpdateScope> {
        return 'full';
    }

    protected sendCreateToServer(entity: User): Promise<User> {
        return this.userNetworkService.create(entity);
    }

    protected sendUpdateToServer(entity: User): Promise<User> {
        return this.userNetworkService.updateMe(entity);
    }
}