import {
    ICollisionResolverService,
    ISyncableEntityProps,
    ResolvedCollisionsLists,
    // SimpleCollisionMapper
} from "@rem-web/domain";
// import {SimpleCollisionMapper} from "../../../../../../domain/src/mappers/collision/interface.mapper";


export class SimpleEntCollisionResolverUseCase<T extends ISyncableEntityProps> {

    constructor(
        // private readonly mapper: Type<SimpleCollisionMapper<T>>,
        private readonly collisionResolver: ICollisionResolverService<T>,
) {}

    public execute(serverEntities: T[], localEntities: T[]): ResolvedCollisionsLists<T> {
        return this.collisionResolver.resolveBatches(serverEntities, localEntities);

    }

}