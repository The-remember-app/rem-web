import {ICollisionResolverService, ResolutionStatus, ResolvedCollisionsLists} from "./collision-resolver.interface.service";
import {SyncState} from "@rem-web/domain";


export class BaseCollisionResolverService<T> implements ICollisionResolverService<T> {

    constructor(
        protected syncStateGetter: (ent: T)=>{state: SyncState, updatedAt: Date},
        protected entityMapper: (ent1: T, ent2: T,)=> T,
    ) {
    }

    resolveBatches(serverEntities: T[], localEntities: T[]): ResolvedCollisionsLists<T> {
        throw new Error("Method not implemented.");
    }


    resolveSingle(serverEntity: T, localEntity: T): ResolutionStatus {
        throw new Error("Method not implemented.");
    }

}