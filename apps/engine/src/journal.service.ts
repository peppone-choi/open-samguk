import { Injectable, Logger, Inject } from '@nestjs/common';
import { IJournalRepository, WorldDelta } from '@sammo-ts/logic';
import { env } from '@sammo-ts/infra';

/**
 * 저널링 서비스
 * DDD: 로직 레이어에서 정의한 인터페이스(Port)를 사용함
 */
@Injectable()
export class JournalService {
  private readonly logger = new Logger(JournalService.name);

  constructor(
    @Inject('JOURNAL_REPOSITORY')
    private readonly journalRepository: IJournalRepository,
  ) {}

  /**
   * 새로운 저널 기록
   */
  async record(type: string, payload: any): Promise<void> {
    try {
      await this.journalRepository.record({
        profile: env.PROFILE,
        type,
        payload,
        seq: Date.now().toString(),
      });
      this.logger.debug(`Journal recorded: ${type}`);
    } catch (err) {
      this.logger.error(`Failed to record journal [${type}]`, err);
      throw err;
    }
  }
}
