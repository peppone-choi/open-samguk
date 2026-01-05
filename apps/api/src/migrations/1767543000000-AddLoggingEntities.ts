import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLoggingEntities1767543000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. api_log 테이블
        await queryRunner.query(`
            CREATE TABLE "api_log" (
                "id" BIGSERIAL PRIMARY KEY,
                "member_id" BIGINT,
                "method" TEXT NOT NULL,
                "path" TEXT NOT NULL,
                "query" JSONB,
                "body" JSONB,
                "status_code" INTEGER NOT NULL,
                "response_time" INTEGER NOT NULL,
                "ip" TEXT,
                "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
            )
        `);

        // 2. err_log 테이블
        await queryRunner.query(`
            CREATE TABLE "err_log" (
                "id" BIGSERIAL PRIMARY KEY,
                "member_id" BIGINT,
                "type" TEXT NOT NULL,
                "message" TEXT NOT NULL,
                "stack" TEXT,
                "context" JSONB,
                "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "err_log"`);
        await queryRunner.query(`DROP TABLE "api_log"`);
    }

}
