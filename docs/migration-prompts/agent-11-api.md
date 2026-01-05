# Agent 11: API 레이어 마이그레이션

## 업무 범위
레거시 API 엔드포인트를 NestJS + tRPC로 포팅

## 대상 디렉토리
- 소스: `legacy/hwe/sammo/API/**/*.php` (79개 파일)
- 타겟: `apps/api/src/` (NestJS 모듈)

## API 디렉토리 구조
```
legacy/hwe/sammo/API/
├── Auction/
├── Betting/
├── Command/
├── General/
├── Global/
├── InheritAction/
├── Message/
├── Misc/
├── Nation/
├── NationCommand/
├── Troop/
└── Vote/
```

## 체크리스트

### Auction API
- [ ] 경매 목록 조회
- [ ] 입찰 등록
- [ ] 낙찰 처리
- [ ] 경매 등록

### General API
- [ ] 장수 정보 조회
- [ ] 장수 커맨드 등록
- [ ] 장수 상태 업데이트

### Nation API
- [ ] 국가 정보 조회
- [ ] 국가 커맨드 등록
- [ ] 외교 상태 조회

### Message API
- [ ] 메시지 발송
- [ ] 메시지 목록 조회
- [ ] 게시판 글 등록

### Troop API
- [ ] 부대 생성
- [ ] 부대 가입/탈퇴
- [ ] 부대 정보 조회

### Vote API
- [ ] 투표 생성
- [ ] 투표 참여
- [ ] 투표 결과 조회

### Command API
- [ ] 커맨드 예약
- [ ] 커맨드 취소
- [ ] 커맨드 목록 조회

### Global API
- [ ] 게임 상태 조회
- [ ] 랭킹 조회
- [ ] 월드 히스토리

## 포팅 규칙
1. REST API 또는 tRPC 엔드포인트로 변환
2. 입력 검증 (Zod 스키마)
3. 인증/권한 체크
4. 에러 처리
5. 로깅

## 파일 구조
```typescript
// apps/api/src/general/general.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GeneralService } from './general.service';

@Controller('api/general')
@UseGuards(JwtAuthGuard)
export class GeneralController {
  constructor(private generalService: GeneralService) {}

  @Get(':id')
  async getGeneral(@Param('id') id: number) {
    return this.generalService.findById(id);
  }

  @Post(':id/command')
  async registerCommand(
    @Param('id') id: number,
    @Body() commandDto: RegisterCommandDto
  ) {
    return this.generalService.registerCommand(id, commandDto);
  }
}

// tRPC 라우터 예시
// apps/api/src/trpc/general.router.ts
import { router, publicProcedure, protectedProcedure } from './trpc';
import { z } from 'zod';

export const generalRouter = router({
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      return ctx.generalService.findById(input.id);
    }),

  registerCommand: protectedProcedure
    .input(z.object({
      generalId: z.number(),
      command: z.string(),
      args: z.record(z.any()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return ctx.generalService.registerCommand(input);
    }),
});
```
