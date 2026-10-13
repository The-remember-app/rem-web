// application/src/use-cases/sync/get-active-sync-scope.use-case.ts

import {SyncScopeResolverService} from "@rem-web/domain";

export class GetActiveSyncScopeUseCase {
    constructor(private readonly syncScopeResolverService: SyncScopeResolverService) {}

    public async execute(userUuid: string): Promise<string[]> {
        const activeUuidsSet = await this.syncScopeResolverService.resolveActiveModuleUuids(userUuid);
        return Array.from(activeUuidsSet);
    }
}