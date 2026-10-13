import {IPersonalSyncEntityProps, ISyncableEntityProps} from "../../entities/sync/abs.entity";


export interface SimpleCollisionMapper<T extends ISyncableEntityProps> {

    map(local: T, server: T): T;

}

export interface ComplexCollisionMapper<T extends IPersonalSyncEntityProps> {

    mapCommon(local: T, server: T): T;
    mapPersonal(local: T, server: T): T;

}