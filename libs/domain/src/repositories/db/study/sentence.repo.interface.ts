import {Sentence, SentenceProps} from '../../../entities/study/sentence';
import {IBaseRepository} from "./abc";
import {Observable} from "rxjs";
import {IBaseSyncRepository} from "../sync/abs.sync.interface";

export interface ISentenceRepository extends IBaseRepository<Sentence, string, SentenceProps>, IBaseSyncRepository<Sentence, string, SentenceProps> {
    getById(uuid: string, userUuid: string): Promise<Sentence | null>;
    getByTerm(termUuid: string, userUuid: string): Promise<Sentence[]>;
    // save(sentence: Sentence): Promise<void>;
    // saveBatch(sentences: Sentence[]): Promise<void>;
    // delete(uuid: string, userUuid: string): Promise<void>;
    findByUserUuid(userUuid: string): Promise<Sentence[]>;
    findByTermUuid(termUuid: string, userUuid: string): Promise<Sentence[]>;
    observeByTermUuid(termUuid: string, userUuid: string): Observable<Sentence[]>;
    findByModuleUuid(moduleUuid: string, userUuid: string): Promise<Sentence[]>;
}