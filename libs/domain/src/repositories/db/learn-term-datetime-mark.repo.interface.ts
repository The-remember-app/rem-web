import { LearnTermDatetimeMark } from '../../entities/learn-term-datetime-mark';

export interface ILearnTermDatetimeMarkRepository {
    getById(uuid: string, userUuid: string): Promise<LearnTermDatetimeMark | null>;
    getByTerm(termUuid: string, userUuid: string): Promise<LearnTermDatetimeMark[]>;
    save(mark: LearnTermDatetimeMark): Promise<void>;
    saveBatch(marks: LearnTermDatetimeMark[]): Promise<void>;
    delete(uuid: string, userUuid: string): Promise<void>;
}