// application/src/use-cases/sync/update-sync-rule.use-case.ts
// import { ISyncRuleRepository, SyncRule, SyncRuleTargetType } from 'domain';

import {ISyncRuleRepository, SyncRule, SyncRuleTargetType} from "@rem-web/domain";
// import {SyncRule} from "../../../../../../domain/src/entities/sync/sync-rule";

export interface UpdateSyncRuleDto {
    userUuid: string;
    targetUuid: string;
    targetType: SyncRuleTargetType;
    isIncluded: boolean;
}

export class UpdateSyncRuleUseCase {
    constructor(private readonly syncRuleRepository: ISyncRuleRepository) {}

    public async execute(dto: UpdateSyncRuleDto): Promise<void> {
        const existingRule = await this.syncRuleRepository.findByTargetUuid(dto.userUuid, dto.targetUuid);

        const ruleToSave = new SyncRule({
            uuid: existingRule?.uuid ?? crypto.randomUUID(),
            userUuid: dto.userUuid,
            targetUuid: dto.targetUuid,
            targetType: dto.targetType,
            isIncluded: dto.isIncluded,
            createdAt: existingRule?.createdAt ?? new Date(),
            updatedAt: new Date(),
        });

        await this.syncRuleRepository.save(ruleToSave);
    }
}