import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { createRedisClient, createConsumerGroup, env } from '@sammo-ts/infra';
import { EngineService } from './engine.service.js';
import { DaemonCommand } from './types.js';

@Injectable()
export class StreamConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(StreamConsumerService.name);
  private readonly redis = createRedisClient();
  private readonly streamKey = `stream:${env.PROFILE}:daemon:commands`;
  private readonly groupName = `group:${env.PROFILE}:engine`;
  private readonly consumerName = `consumer:${process.pid}`;
  private isRunning = false;

  private readonly deadKey = `stream:${env.PROFILE}:daemon:commands:dead`;
  private readonly maxRetries = 5;

  constructor(private readonly engineService: EngineService) {}

  async onModuleInit() {
    this.logger.log(`Initializing Stream Consumer for ${this.streamKey}`);
    await createConsumerGroup(this.streamKey, this.groupName);
    this.isRunning = true;
    this.consumeLoop().catch((err) => {
      this.logger.error('Stream consume loop failed', err);
    });
  }

  onModuleDestroy() {
    this.isRunning = false;
  }

  private async consumeLoop() {
    while (this.isRunning) {
      try {
        // Phase K3: 큐 깊이 측정 (XPENDING 사용)
        const pendingInfo = await this.redis.xpending(this.streamKey, this.groupName);
        const pendingCount = (pendingInfo as any)[0] || 0;
        this.engineService.updateQueueDepth(pendingCount);

        // XREADGROUP을 사용하여 새 메시지 대기
        // PENDING 메시지를 먼저 확인하거나 신규 메시지를 가져옴
        const results = await this.redis.xreadgroup(
          'GROUP', this.groupName, this.consumerName,
          'COUNT', '1',
          'BLOCK', '5000',
          'STREAMS', this.streamKey, '>'
        ) as [string, [string, string[]][]][] | null;

        if (!results) continue;

        for (const [stream, messages] of results) {
          for (const [id, fields] of messages) {
            // Redis에서 제공하는 delivery count 확인 필요 (여기서는 간소화)
            await this.processMessage(id, fields, 1);
          }
        }
      } catch (err) {
        this.logger.error('Error in consume loop', err);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  private async processMessage(id: string, fields: string[], retryCount: number) {
    let data: Record<string, string> = {};
    try {
      // flat array를 object로 변환
      for (let i = 0; i < fields.length; i += 2) {
        const key = fields[i];
        const value = fields[i + 1];
        if (key !== undefined && value !== undefined) {
          data[key] = value;
        }
      }

      if (!data.payload) {
        throw new Error('Missing payload in message');
      }
      const command = JSON.parse(data.payload) as DaemonCommand;
      this.logger.log(`Processing [${command.requestId}] ${command.type}`);

      await this.engineService.handleCommand(command);

      // 처리 완료 후 ACK
      await this.redis.xack(this.streamKey, this.groupName, id);
    } catch (err) {
      this.logger.error(`Failed to process message ${id} (retry: ${retryCount})`, err);
      
      if (retryCount >= this.maxRetries) {
        this.logger.warn(`Max retries exceeded for ${id}. Moving to DLQ.`);
        await this.redis.xadd(this.deadKey, '*', 'original_id', id, 'payload', data.payload || '', 'error', String(err));
        await this.redis.xack(this.streamKey, this.groupName, id);
      }
      // ACK를 하지 않으면 Redis Stream의 PENDING 리스트에 남아 나중에 다시 처리됨
    }
  }
}
