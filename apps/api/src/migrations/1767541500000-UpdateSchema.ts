import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSchema1767541500000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. nation 테이블: surrender_limit 추가
        await queryRunner.query(`ALTER TABLE "nation" ADD COLUMN "surrender_limit" SMALLINT NOT NULL DEFAULT 72`);

        // 2. city 테이블: supply 추가
        await queryRunner.query(`ALTER TABLE "city" ADD COLUMN "supply" SMALLINT NOT NULL DEFAULT 1`);

        // 3. general 테이블: dex, defence_train, tournament_state, last_turn 추가
        await queryRunner.query(`ALTER TABLE "general" ADD COLUMN "dex" JSONB NOT NULL DEFAULT '{}'::jsonb`);
        await queryRunner.query(`ALTER TABLE "general" ADD COLUMN "defence_train" SMALLINT NOT NULL DEFAULT 80`);
        await queryRunner.query(`ALTER TABLE "general" ADD COLUMN "tournament_state" SMALLINT NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "general" ADD COLUMN "last_turn" JSONB NOT NULL DEFAULT '{}'::jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "general" DROP COLUMN "last_turn"`);
        await queryRunner.query(`ALTER TABLE "general" DROP COLUMN "tournament_state"`);
        await queryRunner.query(`ALTER TABLE "general" DROP COLUMN "defence_train"`);
        await queryRunner.query(`ALTER TABLE "general" DROP COLUMN "dex"`);
        await queryRunner.query(`ALTER TABLE "city" DROP COLUMN "supply"`);
        await queryRunner.query(`ALTER TABLE "nation" DROP COLUMN "surrender_limit"`);
    }

}
