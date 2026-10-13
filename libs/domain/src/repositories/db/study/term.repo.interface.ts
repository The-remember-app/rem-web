import {Term, TermProps} from '../../../entities/study/term';
import {IBaseRepository} from "./abc";
import {Observable} from "rxjs";
import {IBasePersSyncRepository} from "../sync/abs.sync.interface";

export interface ITermRepository extends IBaseRepository<Term, string, TermProps>,
    IBasePersSyncRepository<Term, string, TermProps> {
    getById(uuid: string, userUuid: string): Promise<Term | null>;
    getByModule(moduleUuid: string, userUuid: string): Promise<Term[]>;
    // save(term: Term): Promise<void>;
    // saveBatch(terms: Term[]): Promise<void>;
    updateCounters(
        uuid: string,
        userUuid: string,
        counters: Partial<Pick<Term, 'chooseErrorCounter' | 'writeErrorCounter' | 'choiceNegErrorCounter' | 'watchCount'>>
    ): Promise<void>;
    findByUserUuid(userUuid: string): Promise<Term[]>;
    findByModuleUuid(moduleUuid: string, userUuid: string): Promise<Term[]>;
    observeByModuleUuid(moduleUuid: string, userUuid: string): Observable<Term[]>;
    // delete(uuid: string, userUuid: string): Promise<void>;
}