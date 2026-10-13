// export interface ISyncUseCase {
//
//     execute(lastSyncTime?: Date): Promise<SyncResult>;
//
// }

import {ISyncStudyUseCase} from "./abs.sync.use-case";
// import {LearnTermDatetimeMarkSyncUseCase, TermAddingInfoSyncUseCase} from "@rem-web/use-cases";

export interface SyncResult {
    success: boolean;
    syncedCount: number;
    error?: Error;
}

export interface MasterSyncOptions {
    lastSyncTime?: Date;
    onProgress?: (step: string, progress: number) => void;
}

export interface MasterSyncResult {
    success: boolean;
    details: Record<string, SyncResult>;
    completedAt: Date;
}

export class MasterSyncOrchestratorUseCase {

    constructor(
        private readonly syncUserUseCase: ISyncStudyUseCase,
        private readonly syncFolderUseCase: ISyncStudyUseCase,
        private readonly syncModuleUseCase: ISyncStudyUseCase,
        private readonly syncTermUseCase: ISyncStudyUseCase,
        private readonly syncTermAddingInfoUseCase: ISyncStudyUseCase,
        private readonly syncSentenceUseCase: ISyncStudyUseCase,
        private readonly syncLearnTermDatetimeMarkUseCase: ISyncStudyUseCase,
        private readonly syncProgressUseCase: ISyncStudyUseCase
    ) {
    }

    /**
     * Запускает последовательный процесс синхронизации всех сущностей.
     *
     * @param lastSyncTime Временная метка последней успешной синхронизации.
     * @returns Результат выполнения всей цепочки синхронизации.
     */

    async execute(lastSyncTime?: Date): Promise<MasterSyncResult> {
        const results: Record<string, SyncResult> = {};
        // Определяем строгую последовательность выполнения
        const steps: Array<{ name: string; useCase: ISyncStudyUseCase }> = [
            {name: 'user', useCase: this.syncUserUseCase},
            {name: 'folder', useCase: this.syncFolderUseCase},
            {name: 'module', useCase: this.syncModuleUseCase},
            {name: 'term', useCase: this.syncTermUseCase},
            {name: 'term_add_info', useCase: this.syncTermAddingInfoUseCase},
            {name: 'sentence', useCase: this.syncSentenceUseCase},
            {name: 'learn_mark', useCase: this.syncLearnTermDatetimeMarkUseCase},
            {name: 'progress', useCase: this.syncProgressUseCase},
        ];

        try {
            for (const step of steps) {
                const result = await step.useCase.execute(lastSyncTime);
                results[step.name] = result;
                // Если один из этапов завершился с ошибкой, прерываем дальнейшую синхронизацию
                if (!result.success) {
                    throw new Error(
                        `Sync failed at step [${step.name}]: ${result.error?.message || 'Unknown error'}`
                    );
                }
            }
            return {
                success: true,
                details: results,
                completedAt: new Date(),
            };
        } catch (error) {
            return {
                success: false,
                details: results,
                completedAt: new Date(),
            };
        }
    }
}
