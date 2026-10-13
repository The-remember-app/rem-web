// import {
//     LearnTermDatetimeMark,
//     LearnTermDatetimeMarkProps,
// } from '../../entities/study/learn-term-datetime-mark';
import {
    LearnMarkDto,
    CreateLearnMarkDto,
    UpdateLearnMarksDto,
    WatchLearnTypeEnum,
} from '../api/generated/code';
import {LearnTermDatetimeMark, LearnTermDatetimeMarkProps, WatchLearnType} from "@rem-web/domain";
// import { WatchLearnType } from '../../entities/enums';

export class LearnTermDatetimeMarkMapper {
    public static toDomain(dto: LearnMarkDto): LearnTermDatetimeMark {
        return new LearnTermDatetimeMark({
            uuid: dto.id,
            userUuid: dto.user_id,
            termUuid: dto.term_id,
            startWatch: new Date(dto.start_watch),
            endWatch: new Date(dto.end_watch),
            isLearnt: dto.is_learnt,
            isLearnIterStart: dto.is_learn_iter_start,
            watchType: (dto.watch_type as unknown as WatchLearnType) ?? WatchLearnType.WRITE,
            createdAt: new Date(dto.created_at),
            updatedAt: new Date(dto.updated_at),
        });
    }

    public static toCreateDto(entity: LearnTermDatetimeMark): CreateLearnMarkDto {
        return {
            id: entity.uuid,
            term_id: entity.termUuid,
            start_watch: entity.startWatch.toISOString(),
            end_watch: entity.endWatch.toISOString(),
            is_learnt: entity.isLearnt,
            is_learn_iter_start: entity.isLearnIterStart,
            watch_type: entity.watchType as unknown as WatchLearnTypeEnum,
        };
    }

    public static toUpdateDto(data: Partial<LearnTermDatetimeMarkProps>): UpdateLearnMarksDto {
        return {
            start_watch: (data.startWatch ?? new Date()).toISOString(),
            end_watch: (data.endWatch ?? new Date()).toISOString(),
            is_learnt: data.isLearnt ?? false,
            is_learn_iter_start: data.isLearnIterStart ?? false,
            watch_type: data.watchType as unknown as WatchLearnTypeEnum,
            updated_at: (data.updatedAt ?? new Date()).toISOString(),
        };
    }
}