import {TermAddingInfo, TermAddingInfoProps} from '../../../entities/study/term-adding-info';
import {IBaseRepository} from "./abc";
import {Observable} from "rxjs";
import {IBaseSyncRepository} from "../sync/abs.sync.interface";

export interface ITermAddingInfoRepository extends IBaseRepository<TermAddingInfo, string, TermAddingInfoProps>, IBaseSyncRepository<TermAddingInfo, string, TermAddingInfoProps> {
    getById(uuid: string, userUuid: string): Promise<TermAddingInfo | null>;
    getByTerm(termUuid: string, userUuid: string): Promise<TermAddingInfo[]>;
    // save(info: TermAddingInfo): Promise<void>;
    // saveBatch(infos: TermAddingInfo[]): Promise<void>;
    // delete(uuid: string, userUuid: string): Promise<void>;
    findByUserUuid(userUuid: string): Promise<TermAddingInfo[]>;
    findByTermUuid(termUuid: string, userUuid: string): Promise<TermAddingInfo[]>;
    observeByTermUuid(termUuid: string, userUuid: string): Observable<TermAddingInfo[]>;
    findByParentAddInfoUuid(parentAddInfoUuid: string, userUuid: string): Promise<TermAddingInfo[]>;
    observeByParentAddInfoUuid(parentAddInfoUuid: string, userUuid: string): Observable<TermAddingInfo[]>;
    findByModuleUuid(moduleUuid: string, userUuid: string): Promise<TermAddingInfo[]>;
}