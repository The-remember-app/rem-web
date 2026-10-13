// export interface ISyncScopeResolverService {
//     /**
//      * Рассчитывает итоговый Set из UUID всех модулей, данные которых должны
//      * синхронизироваться, проходя по дереву правил и наследования.
//      */
//     resolveActiveModuleUuids(userUuid: string): Promise<Set<string>>;
//
//     /**
//      * Быстрая проверка, подлежит ли конкретный модуль синхронизации
//      */
//     isModuleSynced(userUuid: string, moduleUuid: string): Promise<boolean>;
//
//     /**
//      * Быстрая проверка, подлежит ли конкретная папка синхронизации
//      */
//     isFolderSynced(userUuid: string, folderUuid: string): Promise<boolean>;
// }

// import { ISyncScopeResolverService } from './sync-scope-resolver.service.interface';
import { ISyncRuleRepository } from '../../repositories/db/sync/sync-rule.repo.interface';
import { IFolderRepository } from '../../repositories/db/study/folder.repo.interface';
import { IModuleRepository } from '../../repositories/db/study/module.repo.interface';
import { Folder } from '../../entities/study/folder';
import { Module } from '../../entities/study/module';

// import {
//     Folder,
//     IFolderRepository,
//     IModuleRepository,
//     ISyncRuleRepository,
//      Module
// } from "@rem-web/domain";

export class SyncScopeResolverService  {
    constructor(
        private readonly syncRuleRepository: ISyncRuleRepository,
        private readonly folderRepository: IFolderRepository,
        private readonly moduleRepository: IModuleRepository,
    ) {}

    /**
     * Пакетный расчет всех активных модулей за O(N) проход в памяти.
     * Используется перед началом полной синхронизации.
     */
    public async resolveActiveModuleUuids(userUuid: string): Promise<Set<string>> {
        const [allRules, allFolders, allModules] = await Promise.all([
            this.syncRuleRepository.getAllByUser(userUuid),
            this.folderRepository.getAllByUser(userUuid),
            this.moduleRepository.getAllByUser(userUuid),
        ]);

        // Индексация правил: targetUuid -> isIncluded
        const rulesMap = new Map<string, boolean>();
        allRules.forEach((rule) => rulesMap.set(rule.targetUuid, rule.isIncluded));

        // Глобальное правило (по умолчанию true, если явно не отключено)
        const globalDefault = rulesMap.get('GLOBAL') ?? true;

        // Индексация папок для быстрого подъема по дереву
        const folderMap = new Map<string, Folder>();
        allFolders.forEach((folder) => folderMap.set(folder.uuid, folder));

        const activeModuleUuids = new Set<string>();

        for (const module of allModules) {
            if (this.evaluateModuleInclusion(module, rulesMap, folderMap, globalDefault)) {
                activeModuleUuids.add(module.uuid);
            }
        }

        return activeModuleUuids;
    }

    /**
     * Точечная проверка одного модуля с ленивой загрузкой цепочки родителей
     */
    public async isModuleSynced(userUuid: string, moduleUuid: string): Promise<boolean> {
        // 1. Быстрая проверка явного правила модуля
        const moduleRule = await this.syncRuleRepository.findByTargetUuid(userUuid, moduleUuid);
        if (moduleRule) {
            return moduleRule.isIncluded;
        }

        // 2. Получаем модуль для определения родительской папки
        const module = await this.moduleRepository.getById(moduleUuid, userUuid);
        if (!module) {
            return false;
        }

        // 3. Если родительской папки нет — считываем глобальный дефолт
        if (!module.rootFolderUuid) {
            return this.getGlobalDefault(userUuid);
        }

        // 4. Передаем проверку иерархии папок
        return this.isFolderSynced(userUuid, module.rootFolderUuid);
    }

    /**
     * Точечная проверка папки с подъемом к корню
     */
    public async isFolderSynced(userUuid: string, folderUuid: string): Promise<boolean> {
        let currentFolderUuid: string | null | undefined = folderUuid;

        while (currentFolderUuid) {
            // Если у текущей папки есть явное правило — оно определяющее
            const folderRule = await this.syncRuleRepository.findByTargetUuid(userUuid, currentFolderUuid);
            if (folderRule) {
                return folderRule.isIncluded;
            }

            // Поднимаемся к родителю
            const folder = await this.folderRepository.getById(currentFolderUuid, userUuid);
            if (!folder) {
                break;
            }

            currentFolderUuid = folder.rootFolderUuid;
        }

        // Если ни одно правило в цепочке предков не найдено — возвращаем GLOBAL
        return this.getGlobalDefault(userUuid);
    }

    /**
     * Чистая чистая функция расчета для батч-прохода
     */
    private evaluateModuleInclusion(
        module: Module,
        rulesMap: Map<string, boolean>,
        folderMap: Map<string, Folder>,
        globalDefault: boolean,
    ): boolean {
        if (rulesMap.has(module.uuid)) {
            return rulesMap.get(module.uuid)!;
        }

        let currentFolderUuid: string | null | undefined = module.rootFolderUuid;

        while (currentFolderUuid) {
            if (rulesMap.has(currentFolderUuid)) {
                return rulesMap.get(currentFolderUuid)!;
            }

            const parentFolder = folderMap.get(currentFolderUuid);
            currentFolderUuid = parentFolder?.rootFolderUuid;
        }

        return globalDefault;
    }

    /**
     * Вспомогательное получение глобального дефолта
     */
    private async getGlobalDefault(userUuid: string): Promise<boolean> {
        const globalRule = await this.syncRuleRepository.getGlobalRule(userUuid);
        return globalRule ? globalRule.isIncluded : true;
    }
}