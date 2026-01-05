import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGatewayEntities1767542000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. member 테이블
        await queryRunner.query(`
            CREATE TABLE "member" (
                "id" BIGSERIAL PRIMARY KEY,
                "oauth_id" TEXT,
                "username" TEXT NOT NULL UNIQUE,
                "email" TEXT NOT NULL UNIQUE,
                "oauth_type" TEXT NOT NULL DEFAULT 'NONE',
                "oauth_info" JSONB,
                "token_valid_until" TIMESTAMPTZ,
                "password_hash" TEXT,
                "salt" TEXT,
                "meta" JSONB NOT NULL DEFAULT '{}'::jsonb,
                "grade" INTEGER NOT NULL DEFAULT 0,
                "reg_date" TIMESTAMPTZ NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
            )
        `);

        // 2. member_log 테이블
        await queryRunner.query(`
            CREATE TABLE "member_log" (
                "id" BIGSERIAL PRIMARY KEY,
                "member_id" BIGINT NOT NULL,
                "date" TIMESTAMPTZ NOT NULL DEFAULT now(),
                "action_type" TEXT NOT NULL,
                "action" TEXT NOT NULL
            )
        `);

        // 3. login_token 테이블
        await queryRunner.query(`
            CREATE TABLE "login_token" (
                "id" BIGSERIAL PRIMARY KEY,
                "member_id" BIGINT NOT NULL,
                "base_token" TEXT NOT NULL,
                "reg_ip" TEXT NOT NULL,
                "reg_date" TIMESTAMPTZ NOT NULL DEFAULT now(),
                "expire_date" TIMESTAMPTZ NOT NULL
            )
        `);

        // 4. system 테이블
        await queryRunner.query(`
            CREATE TABLE "system" (
                "id" SERIAL PRIMARY KEY,
                "register_open" BOOLEAN NOT NULL DEFAULT true,
                "login_open" BOOLEAN NOT NULL DEFAULT true,
                "notice" TEXT,
                "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "system"`);
        await queryRunner.query(`DROP TABLE "login_token"`);
        await queryRunner.query(`DROP TABLE "member_log"`);
        await queryRunner.query(`DROP TABLE "member"`);
    }

}
