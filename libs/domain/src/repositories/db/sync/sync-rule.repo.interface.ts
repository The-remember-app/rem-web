// import { SyncRule, SyncRuleTargetType } from '../entities/sync-rule';

import {SyncRule, SyncRuleTargetType} from "../../../entities/sync/sync-rule";

export interface ISyncRuleRepository {
    /**
     * Сохранить или обновить правило синхронизации
     */
    save(rule: SyncRule): Promise<void>;

    /**
     * Пакетное сохранение правил
     */
    saveBatch(rules: SyncRule[]): Promise<void>;


    /**
     * Получить вообще все заданные правила
     */
    getAllRules(): Promise<SyncRule[]>;

    /**
     * Получить правило по его UUID
     */
    getByUuid(uuid: string): Promise<SyncRule | null>;

    /**
     * Найти правило для конкретной цели (папки, модуля или GLOBAL)
     */
    findByTargetUuid(userUuid: string, targetUuid: string): Promise<SyncRule | null>;

    /**
     * Найти правила для массива целей (для оптимизации загрузки родительских цепочек)
     */
    findByTargetUuids(userUuid: string, targetUuids: string[]): Promise<SyncRule[]>;

    /**
     * Получить глобальное правило для пользователя
     */
    getGlobalRule(userUuid: string): Promise<SyncRule | null>;

    /**
     * Получить правила определенного уровня (все правила для папок или все для модулей)
     */
    getByTargetType(userUuid: string, targetType: SyncRuleTargetType): Promise<SyncRule[]>;

    /**
     * Получить вообще все заданные пользователем правила
     */
    getAllByUser(userUuid: string): Promise<SyncRule[]>;

    /**
     * Удалить явное правило для объекта (возврат к наследованию)
     */
    deleteByTargetUuid(userUuid: string, targetUuid: string): Promise<void>;

    /**
     * Пакетное удаление правил по спискам targetUuid (например, при физическом удалении папки)
     */
    deleteByTargetUuids(userUuid: string, targetUuids: string[]): Promise<void>;

    /**
     * Полная очистка всех правил пользователя
     */
    clearAllByUser(userUuid: string): Promise<void>;
}