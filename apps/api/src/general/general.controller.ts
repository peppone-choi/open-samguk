import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
    Req,
    ParseIntPipe,
    BadRequestException,
} from '@nestjs/common';
import { GeneralService } from './general.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import {
    zJoinDto,
    zDropItemDto,
    zBuildNationCandidateDto,
    zReserveCommandDto,
    JoinDto,
    DropItemDto,
    BuildNationCandidateDto,
    ReserveCommandDto,
} from './dto/index.js';

/**
 * 장수 API 컨트롤러
 * 장수 정보 조회, 임관, 커맨드 예약 등 장수 관련 기능 제공
 */
@Controller('api/v1/general')
@UseGuards(JwtAuthGuard)
export class GeneralController {
    constructor(private readonly generalService: GeneralService) {}

    /**
     * 장수 프론트 정보 조회 (메인 화면용)
     * GET /api/v1/general/front-info
     */
    @Get('front-info')
    async getFrontInfo(@Req() req: { user: { generalId?: number } }) {
        const generalId = req.user.generalId;
        if (!generalId) {
            throw new BadRequestException('No general associated with user');
        }
        return this.generalService.getFrontInfo(generalId);
    }

    /**
     * 장수 커맨드 테이블 조회
     * GET /api/v1/general/command-table
     */
    @Get('command-table')
    async getCommandTable(@Req() req: { user: { generalId?: number } }) {
        const generalId = req.user.generalId;
        if (!generalId) {
            throw new BadRequestException('No general associated with user');
        }
        return this.generalService.getCommandTable(generalId);
    }

    /**
     * 장수 로그 조회
     * GET /api/v1/general/log
     */
    @Get('log')
    async getGeneralLog(
        @Req() req: { user: { generalId?: number } },
        @Query('generalId') generalIdParam?: string,
        @Query('logType') logType?: string,
        @Query('lastId') lastIdParam?: string
    ) {
        const generalId = generalIdParam ? parseInt(generalIdParam, 10) : req.user.generalId;
        const lastId = lastIdParam ? parseInt(lastIdParam, 10) : undefined;
        return this.generalService.getGeneralLog(generalId, logType, lastId);
    }

    /**
     * 장수 정보 조회
     * GET /api/v1/general/:id
     */
    @Get(':id')
    async getGeneral(@Param('id', ParseIntPipe) id: number) {
        return this.generalService.getGeneralById(id);
    }

    /**
     * 장수별 로그 조회
     * GET /api/v1/general/:id/log
     */
    @Get(':id/log')
    async getGeneralLogById(
        @Param('id', ParseIntPipe) id: number,
        @Query('logType') logType?: string,
        @Query('lastId') lastIdParam?: string
    ) {
        const lastId = lastIdParam ? parseInt(lastIdParam, 10) : undefined;
        return this.generalService.getGeneralLog(id, logType, lastId);
    }

    /**
     * 국가 가입
     * POST /api/v1/general/join
     */
    @Post('join')
    async join(@Req() req: { user: { generalId?: number } }, @Body() body: unknown) {
        const generalId = req.user.generalId;
        if (!generalId) {
            throw new BadRequestException('No general associated with user');
        }

        const parseResult = zJoinDto.safeParse(body);
        if (!parseResult.success) {
            throw new BadRequestException(parseResult.error.errors);
        }

        return this.generalService.join(generalId, parseResult.data);
    }

    /**
     * 커맨드 예약
     * POST /api/v1/general/command
     */
    @Post('command')
    async reserveCommand(@Req() req: { user: { generalId?: number } }, @Body() body: unknown) {
        const generalId = req.user.generalId;
        if (!generalId) {
            throw new BadRequestException('No general associated with user');
        }

        const parseResult = zReserveCommandDto.safeParse(body);
        if (!parseResult.success) {
            throw new BadRequestException(parseResult.error.errors);
        }

        return this.generalService.reserveCommand(generalId, parseResult.data);
    }

    /**
     * 아이템 드롭
     * POST /api/v1/general/drop-item
     */
    @Post('drop-item')
    async dropItem(@Req() req: { user: { generalId?: number } }, @Body() body: unknown) {
        const generalId = req.user.generalId;
        if (!generalId) {
            throw new BadRequestException('No general associated with user');
        }

        const parseResult = zDropItemDto.safeParse(body);
        if (!parseResult.success) {
            throw new BadRequestException(parseResult.error.errors);
        }

        return this.generalService.dropItem(generalId, parseResult.data);
    }

    /**
     * 즉시 퇴각
     * POST /api/v1/general/instant-retreat
     */
    @Post('instant-retreat')
    async instantRetreat(@Req() req: { user: { generalId?: number } }) {
        const generalId = req.user.generalId;
        if (!generalId) {
            throw new BadRequestException('No general associated with user');
        }
        return this.generalService.instantRetreat(generalId);
    }

    /**
     * 프리스타트 사망
     * POST /api/v1/general/die-prestart
     */
    @Post('die-prestart')
    async dieOnPrestart(@Req() req: { user: { generalId?: number } }) {
        const generalId = req.user.generalId;
        if (!generalId) {
            throw new BadRequestException('No general associated with user');
        }
        return this.generalService.dieOnPrestart(generalId);
    }

    /**
     * 건국 후보 등록
     * POST /api/v1/general/build-nation-candidate
     */
    @Post('build-nation-candidate')
    async buildNationCandidate(
        @Req() req: { user: { generalId?: number } },
        @Body() body: unknown
    ) {
        const generalId = req.user.generalId;
        if (!generalId) {
            throw new BadRequestException('No general associated with user');
        }

        const parseResult = zBuildNationCandidateDto.safeParse(body);
        if (!parseResult.success) {
            throw new BadRequestException(parseResult.error.errors);
        }

        return this.generalService.buildNationCandidate(generalId, parseResult.data);
    }
}
