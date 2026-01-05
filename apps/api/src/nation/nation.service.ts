import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NationEntity, GeneralEntity } from '@sammo-ts/infra';
import {
    SetRateDto,
    SetBillDto,
    SetSecretLimitDto,
    SetNoticeDto,
    SetScoutMsgDto,
    SetBlockScoutDto,
    SetBlockWarDto,
    SetTroopNameDto,
} from './dto/index.js';

/**
 * 국가 정보 응답 타입
 */
export interface NationInfo {
    id: number;
    name: string;
    color: string;
    capitalCityId: number;
    gold: number;
    rice: number;
    tech: number;
    power: number;
    level: number;
    typeCode: string;
    scoutLevel: number;
    warState: number;
    strategicCmdLimit: number;
    surrenderLimit: number;
}

/**
 * 국가 전체 정보 응답 타입 (수뇌부용)
 */
export interface NationFullInfo extends NationInfo {
    rate?: number;
    bill?: number;
    secretLimit?: number;
    notice?: string;
    scoutMsg?: string;
    blockScout?: boolean;
    blockWar?: boolean;
}

/**
 * 권한 레벨 상수
 */
export const PERMISSION = {
    NONE: -1,
    MEMBER: 0,
    STAFF: 1,
    CHIEF: 2,
    DIPLOMAT: 4,
} as const;

@Injectable()
export class NationService {
    constructor(
        @InjectRepository(NationEntity)
        private nationRepository: Repository<NationEntity>,
        @InjectRepository(GeneralEntity)
        private generalRepository: Repository<GeneralEntity>,
    ) {}

    /**
     * 국가 정보 조회
     */
    async getNationInfo(
        nationId: number,
        full: boolean = false
    ): Promise<{ result: boolean; nation: NationInfo | NationFullInfo }> {
        const nation = await this.nationRepository.findOne({ where: { id: nationId } });
        if (!nation) {
            throw new NotFoundException(`Nation with id ${nationId} not found`);
        }

        const nationInfo: NationInfo = this.mapToNationInfo(nation);

        if (full) {
            const fullInfo: NationFullInfo = {
                ...nationInfo,
                rate: nation.meta?.rate ?? 15,
                bill: nation.meta?.bill ?? 100,
                secretLimit: nation.meta?.secretLimit ?? 50,
                notice: nation.meta?.notice ?? '',
                scoutMsg: nation.meta?.scoutMsg ?? '',
                blockScout: nation.meta?.blockScout ?? false,
                blockWar: nation.meta?.blockWar ?? false,
            };
            return { result: true, nation: fullInfo };
        }

        return { result: true, nation: nationInfo };
    }

    /**
     * 국가 소속 장수 목록 조회
     */
    async getGeneralList(nationId: number): Promise<{
        result: boolean;
        list: Array<{
            id: number;
            name: string;
            officerLevel: number;
            cityId: number;
            leadership: number;
            strength: number;
            intel: number;
        }>;
    }> {
        const generals = await this.generalRepository.find({
            where: { nation_id: nationId },
            order: { officer_level: 'DESC', name: 'ASC' },
        });

        return {
            result: true,
            list: generals.map(g => ({
                id: g.id,
                name: g.name,
                officerLevel: g.officer_level,
                cityId: g.city_id,
                leadership: g.leadership,
                strength: g.strength,
                intel: g.intel,
            })),
        };
    }

    /**
     * 세율 설정
     */
    async setRate(
        nationId: number,
        generalId: number,
        dto: SetRateDto
    ): Promise<{ result: boolean }> {
        await this.checkPermission(generalId, nationId, PERMISSION.CHIEF);

        const nation = await this.nationRepository.findOne({ where: { id: nationId } });
        if (!nation) {
            throw new NotFoundException(`Nation with id ${nationId} not found`);
        }

        nation.meta = { ...nation.meta, rate: dto.amount };
        await this.nationRepository.save(nation);

        return { result: true };
    }

    /**
     * 봉급 설정
     */
    async setBill(
        nationId: number,
        generalId: number,
        dto: SetBillDto
    ): Promise<{ result: boolean }> {
        await this.checkPermission(generalId, nationId, PERMISSION.CHIEF);

        const nation = await this.nationRepository.findOne({ where: { id: nationId } });
        if (!nation) {
            throw new NotFoundException(`Nation with id ${nationId} not found`);
        }

        nation.meta = { ...nation.meta, bill: dto.amount };
        await this.nationRepository.save(nation);

        return { result: true };
    }

    /**
     * 기밀 제한 설정
     */
    async setSecretLimit(
        nationId: number,
        generalId: number,
        dto: SetSecretLimitDto
    ): Promise<{ result: boolean }> {
        await this.checkPermission(generalId, nationId, PERMISSION.CHIEF);

        const nation = await this.nationRepository.findOne({ where: { id: nationId } });
        if (!nation) {
            throw new NotFoundException(`Nation with id ${nationId} not found`);
        }

        nation.meta = { ...nation.meta, secretLimit: dto.amount };
        await this.nationRepository.save(nation);

        return { result: true };
    }

    /**
     * 국가 공지 설정
     */
    async setNotice(
        nationId: number,
        generalId: number,
        dto: SetNoticeDto
    ): Promise<{ result: boolean }> {
        await this.checkPermission(generalId, nationId, PERMISSION.CHIEF);

        const nation = await this.nationRepository.findOne({ where: { id: nationId } });
        if (!nation) {
            throw new NotFoundException(`Nation with id ${nationId} not found`);
        }

        nation.meta = { ...nation.meta, notice: dto.msg };
        await this.nationRepository.save(nation);

        return { result: true };
    }

    /**
     * 스카웃 메시지 설정
     */
    async setScoutMsg(
        nationId: number,
        generalId: number,
        dto: SetScoutMsgDto
    ): Promise<{ result: boolean }> {
        await this.checkPermission(generalId, nationId, PERMISSION.CHIEF);

        const nation = await this.nationRepository.findOne({ where: { id: nationId } });
        if (!nation) {
            throw new NotFoundException(`Nation with id ${nationId} not found`);
        }

        nation.meta = { ...nation.meta, scoutMsg: dto.msg };
        await this.nationRepository.save(nation);

        return { result: true };
    }

    /**
     * 스카웃 차단 설정
     */
    async setBlockScout(
        nationId: number,
        generalId: number,
        dto: SetBlockScoutDto
    ): Promise<{ result: boolean }> {
        await this.checkPermission(generalId, nationId, PERMISSION.CHIEF);

        const nation = await this.nationRepository.findOne({ where: { id: nationId } });
        if (!nation) {
            throw new NotFoundException(`Nation with id ${nationId} not found`);
        }

        nation.meta = { ...nation.meta, blockScout: dto.value };
        await this.nationRepository.save(nation);

        return { result: true };
    }

    /**
     * 선전포고 차단 설정
     */
    async setBlockWar(
        nationId: number,
        generalId: number,
        dto: SetBlockWarDto
    ): Promise<{ result: boolean; availableCnt?: number }> {
        await this.checkPermission(generalId, nationId, PERMISSION.CHIEF);

        const nation = await this.nationRepository.findOne({ where: { id: nationId } });
        if (!nation) {
            throw new NotFoundException(`Nation with id ${nationId} not found`);
        }

        // TODO: 차단 가능 횟수 계산 로직
        const availableCnt = (nation.meta?.blockWarAvailable ?? 3) - 1;

        if (dto.value && availableCnt < 0) {
            throw new BadRequestException('No remaining block war uses');
        }

        nation.meta = {
            ...nation.meta,
            blockWar: dto.value,
            blockWarAvailable: dto.value ? availableCnt : (nation.meta?.blockWarAvailable ?? 3),
        };
        await this.nationRepository.save(nation);

        return { result: true, availableCnt: dto.value ? availableCnt : undefined };
    }

    /**
     * 부대명 설정
     */
    async setTroopName(
        nationId: number,
        generalId: number,
        troopId: number,
        dto: SetTroopNameDto
    ): Promise<{ result: boolean }> {
        // 부대장이거나 외교권자(permission >= 4)만 가능
        const general = await this.generalRepository.findOne({ where: { id: generalId } });
        if (!general) {
            throw new NotFoundException(`General with id ${generalId} not found`);
        }

        if (general.nation_id !== nationId) {
            throw new ForbiddenException('Not a member of this nation');
        }

        const isTroopLeader = general.troop_id === troopId && general.officer_level >= 3;
        const isDiplomat = general.officer_level >= 5;

        if (!isTroopLeader && !isDiplomat) {
            throw new ForbiddenException('Insufficient permission to rename troop');
        }

        // TODO: 실제 부대 테이블 업데이트 필요
        // 현재는 stub만 구현

        return { result: true };
    }

    /**
     * 장수 로그 조회 (수뇌부용)
     */
    async getGeneralLog(
        nationId: number,
        generalId: number,
        targetGeneralId: number,
        reqType: string,
        reqTo?: number
    ): Promise<{ result: boolean; log: Array<{ id: number; message: string; createdAt: Date }> }> {
        await this.checkPermission(generalId, nationId, PERMISSION.STAFF);

        // TODO: 로그 테이블 구현 후 실제 데이터 조회
        return {
            result: true,
            log: [],
        };
    }

    /**
     * 권한 체크
     */
    private async checkPermission(
        generalId: number,
        nationId: number,
        requiredLevel: number
    ): Promise<void> {
        const general = await this.generalRepository.findOne({ where: { id: generalId } });
        if (!general) {
            throw new NotFoundException(`General with id ${generalId} not found`);
        }

        if (general.nation_id !== nationId) {
            throw new ForbiddenException('Not a member of this nation');
        }

        const permission = this.calculatePermission(general);
        if (permission < requiredLevel) {
            throw new ForbiddenException(`Insufficient permission. Required: ${requiredLevel}, Current: ${permission}`);
        }
    }

    /**
     * 권한 레벨 계산
     * permission < 0: 국가 미소속
     * permission >= 1: 수뇌부 또는 사관년도 충족
     * permission >= 2: 수뇌 (officer_level >= 5)
     * permission == 4: 외교권자
     */
    private calculatePermission(general: GeneralEntity): number {
        if (general.nation_id === 0) {
            return PERMISSION.NONE;
        }

        // 외교권자 (officer_level 12)
        if (general.officer_level >= 12) {
            return PERMISSION.DIPLOMAT;
        }

        // 수뇌 (officer_level >= 5)
        if (general.officer_level >= 5) {
            return PERMISSION.CHIEF;
        }

        // 수뇌부 (officer_level >= 2)
        if (general.officer_level >= 2) {
            return PERMISSION.STAFF;
        }

        return PERMISSION.MEMBER;
    }

    /**
     * NationEntity를 NationInfo로 매핑
     */
    private mapToNationInfo(entity: NationEntity): NationInfo {
        return {
            id: entity.id,
            name: entity.name,
            color: entity.color,
            capitalCityId: entity.capital_city_id,
            gold: entity.gold,
            rice: entity.rice,
            tech: entity.tech,
            power: entity.power,
            level: entity.level,
            typeCode: entity.type_code,
            scoutLevel: entity.scout_level,
            warState: entity.war_state,
            strategicCmdLimit: entity.strategic_cmd_limit,
            surrenderLimit: entity.surrender_limit,
        };
    }
}
