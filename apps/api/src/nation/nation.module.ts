import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NationEntity, GeneralEntity } from '@sammo-ts/infra';
import { NationController } from './nation.controller.js';
import { NationService } from './nation.service.js';

@Module({
    imports: [
        TypeOrmModule.forFeature([NationEntity, GeneralEntity]),
    ],
    controllers: [NationController],
    providers: [NationService],
    exports: [NationService],
})
export class NationModule {}
