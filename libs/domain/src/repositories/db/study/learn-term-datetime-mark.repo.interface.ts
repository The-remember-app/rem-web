import {LearnTermDatetimeMark, LearnTermDatetimeMarkProps} from '../../../entities/study/learn-term-datetime-mark';
import {IBaseRepository} from "./abc";
import {Observable} from "rxjs";
import {IBaseSyncRepository} from "../sync/abs.sync.interface";

export interface ILearnTermDatetimeMarkRepository extends IBaseRepository<LearnTermDatetimeMark, string, LearnTermDatetimeMarkProps>,IBaseSyncRepository<LearnTermDatetimeMark, string, LearnTermDatetimeMarkProps> {
    getById(uuid: string, userUuid: string): Promise<LearnTermDatetimeMark | null>;
    getByTerm(termUuid: string, userUuid: string): Promise<LearnTermDatetimeMark[]>;
    // save(mark: LearnTermDatetimeMark): Promise<void>;
    // saveBatch(marks: LearnTermDatetimeMark[]): Promise<void>;
    // delete(uuid: string, userUuid: string): Promise<void>;
    findByUserUuid(userUuid: string): Promise<LearnTermDatetimeMark[]>;
    findByTermUuid(termUuid: string, userUuid: string): Promise<LearnTermDatetimeMark[]>;
    observeByTermUuid(termUuid: string, userUuid: string): Observable<LearnTermDatetimeMark[]>;
    findByModuleUuid(moduleUuid: string, userUuid: string): Promise<LearnTermDatetimeMark[]>;
}