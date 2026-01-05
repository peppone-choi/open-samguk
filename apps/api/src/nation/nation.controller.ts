import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
    Query,
    UseGuards,
    Req,
    ParseIntPipe,
    BadRequestException,
} from '@nestjs/common';
import { NationService } from './nation.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import {
    zSetRateDto,
    zSetBillDto,
    zSetSecretLimitDto,
    zSetNoticeDto,
    zSetScoutMsgDto,
    zSetBlockScoutDto,
    zSetBlockWarDto,
    zSetTroopNameDto,
} from './dto/index.js';

/**
 * 국가 API 컨트롤러
 * 국가 정보 조회, 설정 변경 등 국가 관련 기능 제공
 */
@Controller('api/v1/nation')
@UseGuards(JwtAuthGuard)
export class NationController {
    constructor(private readonly nationService: NationService) {}

    /**
     * 국가 정보 조회
     * GET /api/v1/nation/info
     */
    @Get('info')
    async getNationInfo(
        @Req() req: { user: { generalId?: number; nationId?: number } },
        @Query('full') fullParam?: string
    ) {
        const nationId = req.user.nationId;
        if (!nationId) {
            throw new BadRequestException('No nation associated with user');
        }
        const full = fullParam === 'true';
        return this.nationService.getNationInfo(nationId, full);
    }

    /**
     * 국가 소속 장수 목록 조회
     * GET /api/v1/nation/generals
     */
    @Get('generals')
    async getGeneralList(@Req() req: { user: { nationId?: number } }) {
        const nationId = req.user.nationId;
        if (!nationId) {
            throw new BadRequestException('No nation associated with user');
        }
        return this.nationService.getGeneralList(nationId);
    }

    /**
     * 장수 로그 조회 (수뇌부용)
     * GET /api/v1/nation/general-log
     */
    @Get('general-log')
    async getGeneralLog(
        @Req() req: { user: { generalId?: number; nationId?: number } },
        @Query('generalId', ParseIntPipe) targetGeneralId: number,
        @Query('reqType') reqType: string,
        @Query('reqTo') reqToParam?: string
    ) {
        const { generalId, nationId } = req.user;
        if (!generalId || !nationId) {
            throw new BadRequestException('No general or nation associated with user');
        }
        const reqTo = reqToParam ? parseInt(reqToParam, 10) : undefined;
        return this.nationService.getGeneralLog(nationId, generalId, targetGeneralId, reqType, reqTo);
    }

    /**
     * 세율 설정
     * POST /api/v1/nation/rate
     */
    @Post('rate')
    async setRate(
        @Req() req: { user: { generalId?: number; nationId?: number } },
        @Body() body: unknown
    ) {
        const { generalId, nationId } = req.user;
        if (!generalId || !nationId) {
            throw new BadRequestException('No general or nation associated with user');
        }

        const parseResult = zSetRateDto.safeParse(body);
        if (!parseResult.success) {
            throw new BadRequestException(parseResult.error.errors);
        }

        return this.nationService.setRate(nationId, generalId, parseResult.data);
    }

    /**
     * 봉급 설정
     * POST /api/v1/nation/bill
     */
    @Post('bill')
    async setBill(
        @Req() req: { user: { generalId?: number; nationId?: number } },
        @Body() body: unknown
    ) {
        const { generalId, nationId } = req.user;
        if (!generalId || !nationId) {
            throw new BadRequestException('No general or nation associated with user');
        }

        const parseResult = zSetBillDto.safeParse(body);
        if (!parseResult.success) {
            throw new BadRequestException(parseResult.error.errors);
        }

        return this.nationService.setBill(nationId, generalId, parseResult.data);
    }

    /**
     * 기밀 제한 설정
     * POST /api/v1/nation/secret-limit
     */
    @Post('secret-limit')
    async setSecretLimit(
        @Req() req: { user: { generalId?: number; nationId?: number } },
        @Body() body: unknown
    ) {
        const { generalId, nationId } = req.user;
        if (!generalId || !nationId) {
            throw new BadRequestException('No general or nation associated with user');
        }

        const parseResult = zSetSecretLimitDto.safeParse(body);
        if (!parseResult.success) {
            throw new BadRequestException(parseResult.error.errors);
        }

        return this.nationService.setSecretLimit(nationId, generalId, parseResult.data);
    }

    /**
     * 국가 공지 설정
     * POST /api/v1/nation/notice
     */
    @Post('notice')
    async setNotice(
        @Req() req: { user: { generalId?: number; nationId?: number } },
        @Body() body: unknown
    ) {
        const { generalId, nationId } = req.user;
        if (!generalId || !nationId) {
            throw new BadRequestException('No general or nation associated with user');
        }

        const parseResult = zSetNoticeDto.safeParse(body);
        if (!parseResult.success) {
            throw new BadRequestException(parseResult.error.errors);
        }

        return this.nationService.setNotice(nationId, generalId, parseResult.data);
    }

    /**
     * 스카웃 메시지 설정
     * POST /api/v1/nation/scout-msg
     */
    @Post('scout-msg')
    async setScoutMsg(
        @Req() req: { user: { generalId?: number; nationId?: number } },
        @Body() body: unknown
    ) {
        const { generalId, nationId } = req.user;
        if (!generalId || !nationId) {
            throw new BadRequestException('No general or nation associated with user');
        }

        const parseResult = zSetScoutMsgDto.safeParse(body);
        if (!parseResult.success) {
            throw new BadRequestException(parseResult.error.errors);
        }

        return this.nationService.setScoutMsg(nationId, generalId, parseResult.data);
    }

    /**
     * 스카웃 차단 설정
     * POST /api/v1/nation/block-scout
     */
    @Post('block-scout')
    async setBlockScout(
        @Req() req: { user: { generalId?: number; nationId?: number } },
        @Body() body: unknown
    ) {
        const { generalId, nationId } = req.user;
        if (!generalId || !nationId) {
            throw new BadRequestException('No general or nation associated with user');
        }

        const parseResult = zSetBlockScoutDto.safeParse(body);
        if (!parseResult.success) {
            throw new BadRequestException(parseResult.error.errors);
        }

        return this.nationService.setBlockScout(nationId, generalId, parseResult.data);
    }

    /**
     * 선전포고 차단 설정
     * POST /api/v1/nation/block-war
     */
    @Post('block-war')
    async setBlockWar(
        @Req() req: { user: { generalId?: number; nationId?: number } },
        @Body() body: unknown
    ) {
        const { generalId, nationId } = req.user;
        if (!generalId || !nationId) {
            throw new BadRequestException('No general or nation associated with user');
        }

        const parseResult = zSetBlockWarDto.safeParse(body);
        if (!parseResult.success) {
            throw new BadRequestException(parseResult.error.errors);
        }

        return this.nationService.setBlockWar(nationId, generalId, parseResult.data);
    }

    /**
     * 부대명 설정
     * PUT /api/v1/nation/troop/:troopId/name
     */
    @Put('troop/:troopId/name')
    async setTroopName(
        @Req() req: { user: { generalId?: number; nationId?: number } },
        @Param('troopId', ParseIntPipe) troopId: number,
        @Body() body: unknown
    ) {
        const { generalId, nationId } = req.user;
        if (!generalId || !nationId) {
            throw new BadRequestException('No general or nation associated with user');
        }

        const parseResult = zSetTroopNameDto.safeParse(body);
        if (!parseResult.success) {
            throw new BadRequestException(parseResult.error.errors);
        }

        return this.nationService.setTroopName(nationId, generalId, troopId, parseResult.data);
    }
}
