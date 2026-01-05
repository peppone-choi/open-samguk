import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneralEntity, NationEntity, GeneralTurn } from '@sammo-ts/infra';
import { GeneralController } from './general.controller.js';
import { GeneralService } from './general.service.js';

@Module({
    imports: [
        TypeOrmModule.forFeature([GeneralEntity, NationEntity, GeneralTurn]),
    ],
    controllers: [GeneralController],
    providers: [GeneralService],
    exports: [GeneralService],
})
export class GeneralModule {}
