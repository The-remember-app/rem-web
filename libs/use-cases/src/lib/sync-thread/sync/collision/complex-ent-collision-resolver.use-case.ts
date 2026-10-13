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
        private readonly commonCollisionResolver: ICollisionResolverService<T>,
        private readonly personalCollisionResolver: ICollisionResolverService<T>,
) {}

    public execute(serverEntities: T[], localEntities: T[]): ResolvedCollisionsLists<T> {
        let common = this.commonCollisionResolver.resolveBatches(serverEntities, localEntities);
        let personal = this.personalCollisionResolver.resolveBatches(serverEntities, localEntities);

        let result = {
            newEntities: new Set([...common.updatedEntities, ...personal.updatedEntities ]) ,
            updatedEntities: new Set([...common.updatedEntities ,...personal.updatedEntities ]),
            localModifications:  new Set([...common.updatedEntities , ...personal.updatedEntities]) ,
            unchangedEntities: new Set([...common.unchangedEntities].filter(x => personal.unchangedEntities.has(x))) ,
            errorEntities: new Set([...common.updatedEntities , ...personal.updatedEntities]),
        } ;
        return result

    }

}