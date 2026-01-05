import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeneralEntity, NationEntity, GeneralTurn } from '@sammo-ts/infra';
import { JoinDto, DropItemDto, BuildNationCandidateDto, ReserveCommandDto } from './dto/index.js';

/**
 * 장수 정보 응답 타입
 */
export interface GeneralInfo {
    id: number;
    name: string;
    nationId: number;
    cityId: number;
    troopId: number;
    gold: number;
    rice: number;
    leadership: number;
    strength: number;
    intel: number;
    politics: number;
    charm: number;
    experience: number;
    dedication: number;
    officerLevel: number;
    crew: number;
    crewType: number;
    train: number;
    atmos: number;
    age: number;
    special: string;
    special2: string;
    weapon: string;
    book: string;
    horse: string;
    item: string;
    injury: number;
    turnTime: Date;
}

/**
 * 장수 로그 엔트리 타입
 */
export interface LogEntry {
    id: number;
    generalId: number;
    logType: string;
    message: string;
    createdAt: Date;
}

@Injectable()
export class GeneralService {
    constructor(
        @InjectRepository(GeneralEntity)
        private generalRepository: Repository<GeneralEntity>,
        @InjectRepository(NationEntity)
        private nationRepository: Repository<NationEntity>,
        @InjectRepository(GeneralTurn)
        private generalTurnRepository: Repository<GeneralTurn>,
    ) {}

    /**
     * 장수 ID로 장수 정보 조회
     */
    async getGeneralById(id: number): Promise<GeneralInfo> {
        const general = await this.generalRepository.findOne({ where: { id } });
        if (!general) {
            throw new NotFoundException(`General with id ${id} not found`);
        }
        return this.mapToGeneralInfo(general);
    }

    /**
     * 장수 프론트 정보 조회 (메인 화면용)
     */
    async getFrontInfo(generalId: number): Promise<{
        result: boolean;
        general: GeneralInfo;
        nation: NationEntity | null;
    }> {
        const general = await this.generalRepository.findOne({ where: { id: generalId } });
        if (!general) {
            throw new NotFoundException(`General with id ${generalId} not found`);
        }

        let nation: NationEntity | null = null;
        if (general.nation_id > 0) {
            nation = await this.nationRepository.findOne({ where: { id: general.nation_id } });
        }

        return {
            result: true,
            general: this.mapToGeneralInfo(general),
            nation,
        };
    }

    /**
     * 장수 커맨드 테이블 조회
     */
    async getCommandTable(generalId: number): Promise<{
        result: boolean;
        commandList: Array<{ turnIdx: number; action: string; arg: Record<string, unknown> }>;
    }> {
        const turns = await this.generalTurnRepository.find({
            where: { general_id: String(generalId) },
            order: { turn_idx: 'ASC' },
        });

        return {
            result: true,
            commandList: turns.map(t => ({
                turnIdx: t.turn_idx,
                action: t.action,
                arg: t.arg as Record<string, unknown>,
            })),
        };
    }

    /**
     * 장수 로그 조회
     * TODO: 실제 로그 테이블 연동 필요
     */
    async getGeneralLog(
        generalId?: number,
        logType?: string,
        lastId?: number
    ): Promise<{ result: boolean; log: LogEntry[] }> {
        // TODO: 로그 테이블 구현 후 실제 데이터 조회
        // 현재는 빈 배열 반환
        return {
            result: true,
            log: [],
        };
    }

    /**
     * 국가 가입
     */
    async join(generalId: number, dto: JoinDto): Promise<{ result: boolean }> {
        const general = await this.generalRepository.findOne({ where: { id: generalId } });
        if (!general) {
            throw new NotFoundException(`General with id ${generalId} not found`);
        }

        if (general.nation_id > 0) {
            throw new BadRequestException('Already joined a nation');
        }

        const nation = await this.nationRepository.findOne({ where: { id: dto.nationId } });
        if (!nation) {
            throw new NotFoundException(`Nation with id ${dto.nationId} not found`);
        }

        // 국가의 block_scout 등 임관 조건 검증
        // TODO: GameConst 기반 인원 제한 검증

        general.nation_id = dto.nationId;
        await this.generalRepository.save(general);

        return { result: true };
    }

    /**
     * 아이템 드롭
     */
    async dropItem(generalId: number, dto: DropItemDto): Promise<{ result: boolean }> {
        const general = await this.generalRepository.findOne({ where: { id: generalId } });
        if (!general) {
            throw new NotFoundException(`General with id ${generalId} not found`);
        }

        const itemField = dto.itemType as keyof Pick<GeneralEntity, 'weapon' | 'book' | 'horse' | 'item'>;
        if (general[itemField] === 'None') {
            throw new BadRequestException(`No ${dto.itemType} equipped`);
        }

        general[itemField] = 'None';
        await this.generalRepository.save(general);

        // TODO: 유니크 아이템 복권 로직 추가

        return { result: true };
    }

    /**
     * 즉시 퇴각
     */
    async instantRetreat(generalId: number): Promise<{ result: boolean }> {
        const general = await this.generalRepository.findOne({ where: { id: generalId } });
        if (!general) {
            throw new NotFoundException(`General with id ${generalId} not found`);
        }

        // TODO: 퇴각 조건 검증 (전투 중인지 등)
        // TODO: 실제 퇴각 로직 구현

        return { result: true };
    }

    /**
     * 프리스타트 사망 (장수 삭제)
     */
    async dieOnPrestart(generalId: number): Promise<{ result: boolean }> {
        const general = await this.generalRepository.findOne({ where: { id: generalId } });
        if (!general) {
            throw new NotFoundException(`General with id ${generalId} not found`);
        }

        // TODO: 프리스타트 상태 검증
        // 프리스타트 상태에서만 삭제 가능

        await this.generalRepository.remove(general);

        return { result: true };
    }

    /**
     * 건국 후보 등록
     */
    async buildNationCandidate(
        generalId: number,
        dto: BuildNationCandidateDto
    ): Promise<{ result: boolean }> {
        const general = await this.generalRepository.findOne({ where: { id: generalId } });
        if (!general) {
            throw new NotFoundException(`General with id ${generalId} not found`);
        }

        if (general.nation_id > 0) {
            throw new BadRequestException('Already in a nation');
        }

        // TODO: 건국 조건 검증 (도시 소유 여부, 자원 등)
        // TODO: 실제 건국 후보 등록 로직

        return { result: true };
    }

    /**
     * 커맨드 예약
     */
    async reserveCommand(
        generalId: number,
        dto: ReserveCommandDto
    ): Promise<{ result: boolean; brief: string }> {
        const general = await this.generalRepository.findOne({ where: { id: generalId } });
        if (!general) {
            throw new NotFoundException(`General with id ${generalId} not found`);
        }

        // 기존 턴 삭제 및 새로운 커맨드 등록
        for (const turnIdx of dto.turnList) {
            // 기존 턴 삭제
            await this.generalTurnRepository.delete({
                general_id: String(generalId),
                turn_idx: turnIdx,
            });

            // 새 턴 등록
            const newTurn = new GeneralTurn();
            newTurn.general_id = String(generalId);
            newTurn.turn_idx = turnIdx;
            newTurn.action = dto.action;
            newTurn.arg = dto.arg ?? {};
            await this.generalTurnRepository.save(newTurn);
        }

        return {
            result: true,
            brief: `${dto.action} 예약됨 (${dto.turnList.length}턴)`,
        };
    }

    /**
     * GeneralEntity를 GeneralInfo로 매핑
     */
    private mapToGeneralInfo(entity: GeneralEntity): GeneralInfo {
        return {
            id: entity.id,
            name: entity.name,
            nationId: entity.nation_id,
            cityId: entity.city_id,
            troopId: entity.troop_id,
            gold: entity.gold,
            rice: entity.rice,
            leadership: entity.leadership,
            strength: entity.strength,
            intel: entity.intel,
            politics: entity.politics,
            charm: entity.charm,
            experience: entity.experience,
            dedication: entity.dedication,
            officerLevel: entity.officer_level,
            crew: entity.crew,
            crewType: entity.crew_type,
            train: entity.train,
            atmos: entity.atmos,
            age: entity.age,
            special: entity.special,
            special2: entity.special2,
            weapon: entity.weapon,
            book: entity.book,
            horse: entity.horse,
            item: entity.item,
            injury: entity.injury,
            turnTime: entity.turn_time,
        };
    }
}
