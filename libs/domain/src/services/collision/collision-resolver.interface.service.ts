export interface ResolvedCollisionsLists<T> {
    newEntities: Set<T>;            // 1. Новые сущности, которых нет в локальной БД
    updatedEntities:  Set<T>;        // 2. Обновленные сущности (перезаписать в БД)
    localModifications:  Set<T>;     // 3. Имеют локальные изменения, которых нет на сервере
    unchangedEntities:  Set<T>;      // 4. Без изменений (игнорируем)
    errorEntities:  Set<T>;          // 5. Ошибки при решении коллизий (нужна жесткая перезапись)
}

export type ResolutionStatus = keyof ResolvedCollisionsLists<any>;

export interface ICollisionResolverService<T> {
    /**
     * Пакетное разрешение коллизий для списков
     */
    resolveBatches(serverEntities: T[], localEntities: T[]): ResolvedCollisionsLists<T>;

    /**
     * Разрешение коллизии для одной сущности.
     * Возвращает название категории, к которой относится результат.
     */
    resolveSingle(serverEntity: T, localEntity: T): ResolutionStatus;
}
