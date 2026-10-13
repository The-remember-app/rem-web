// domain/src/utils/tree-sort.util.ts

export interface RecursiveEntity {
    uuid: string;
    parentUuid?: string | null;
}

export class TreeSortUtil {
    /**
     * Сортирует список сущностей так, чтобы РОДИТЕЛИ всегда шли РАНЬШЕ ДЕТЕЙ.
     * Используется перед вставкой / сохранением в БД.
     */
    public static sortTopologicallyParentFirst<T extends RecursiveEntity>(
        entities: T[],
        getParentUuidFn: (entity: T) => string | null | undefined
    ): T[] {
        const sorted: T[] = [];
        const visited = new Set<string>();
        const entityMap = new Map<string, T>(entities.map(e => [e.uuid, e]));

        const visit = (entity: T) => {
            if (visited.has(entity.uuid)) return;

            const parentUuid = getParentUuidFn(entity);
            if (parentUuid && entityMap.has(parentUuid)) {
                visit(entityMap.get(parentUuid)!);
            }

            visited.add(entity.uuid);
            sorted.push(entity);
        };

        for (const entity of entities) {
            visit(entity);
        }

        return sorted;
    }

    /**
     * Сортирует список так, чтобы ДЕТИ шли РАНЬШЕ РОДИТЕЛЕЙ.
     * Используется перед удалением из БД.
     */
    public static sortTopologicallyChildFirst<T extends RecursiveEntity>(
        entities: T[],
        getParentUuidFn: (entity: T) => string | null | undefined
    ): T[] {
        return this.sortTopologicallyParentFirst(entities, getParentUuidFn).reverse();
    }
}