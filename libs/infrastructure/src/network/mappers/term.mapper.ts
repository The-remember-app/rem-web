import { SharedTerm, Term, SharedTermProps, TermProps } from '@rem-web/domain';
import {
    TermDto,
    PersonalizeTermDto,
    CreateTermDto,
    UpdateTermDto,
    CreateOnlyPersonalizePartTermDto,
    UpdateOnlyPersonalizePartTermDto
} from '../api/generated/code';
import { toIsoString } from '../utils/date.utils';

export class TermMapper {
    static toSharedDomain(dto: TermDto): SharedTerm {
        return new SharedTerm({
            uuid: dto.id,
            term: dto.term,
            definition: dto.definition,
            moduleUuid: dto.module_id,
            createdAt: new Date(dto.created_at),
            updatedAt: new Date(dto.updated_at)
        });
    }

    static toPersonalDomain(dto: PersonalizeTermDto): Term {
        return new Term({
            uuid: dto.id,
            userUuid: dto.user_id,
            term: dto.term,
            definition: dto.definition,
            moduleUuid: dto.module_id,
            chooseErrorCounter: dto.choose_error_counter,
            writeErrorCounter: dto.write_error_counter,
            choiceNegErrorCounter: dto.choice_neg_error_counter,
            watchCount: dto.watch_count,
            createdAt: new Date(dto.created_at),
            updatedAt: new Date(dto.updated_at),
            personalCreatedAt: new Date(dto.personal_created_at),
            personalUpdatedAt: new Date(dto.personal_updated_at)
        });
    }

    static toCreateDto(entity: SharedTerm): CreateTermDto {
        return {
            id: entity.uuid,
            term: entity.term,
            definition: entity.definition,
            module_id: entity.moduleUuid
        };
    }

    static toCreatePersonalizeDto(entity: Term): CreateOnlyPersonalizePartTermDto {
        return {
            term_id: entity.uuid,
            choose_error_counter: entity.chooseErrorCounter,
            write_error_counter: entity.writeErrorCounter,
            choice_neg_error_counter: entity.choiceNegErrorCounter,
            watch_count: entity.watchCount
        };
    }

    static toUpdateDto(data: Partial<SharedTermProps>): UpdateTermDto {
        return {
            term: data.term ?? '',
            definition: data.definition ?? '',
            updated_at: toIsoString(data.updatedAt) ?? new Date().toISOString()
        };
    }

    static toUpdatePersonalizeDto(data: Partial<TermProps>): UpdateOnlyPersonalizePartTermDto {
        return {
            choose_error_counter: data.chooseErrorCounter ?? 0,
            write_error_counter: data.writeErrorCounter ?? 0,
            choice_neg_error_counter: data.choiceNegErrorCounter ?? 0,
            watch_count: data.watchCount ?? 0,
            personal_updated_at: toIsoString(data.personalUpdatedAt) ?? new Date().toISOString()
        };
    }
}