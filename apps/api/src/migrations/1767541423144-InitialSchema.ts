import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1767541423144 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. 국가(Nation) 테이블
        await queryRunner.query(`
            CREATE TABLE "nation" (
                "id" SERIAL PRIMARY KEY,
                "name" TEXT NOT NULL,
                "color" TEXT NOT NULL,
                "capital_city_id" INTEGER NOT NULL DEFAULT 0,
                "gold" INTEGER NOT NULL DEFAULT 0,
                "rice" INTEGER NOT NULL DEFAULT 0,
                "tech" REAL NOT NULL DEFAULT 0,
                "power" INTEGER NOT NULL DEFAULT 0,
                "level" SMALLINT NOT NULL DEFAULT 1,
                "type_code" TEXT NOT NULL DEFAULT 'che_중립',
                "scout_level" SMALLINT NOT NULL DEFAULT 0,
                "war_state" SMALLINT NOT NULL DEFAULT 0,
                "strategic_cmd_limit" SMALLINT NOT NULL DEFAULT 36,
                "spy" JSONB NOT NULL DEFAULT '{}'::jsonb,
                "meta" JSONB NOT NULL DEFAULT '{}'::jsonb,
                "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
            )
        `);

        // 2. 도시(City) 테이블
        await queryRunner.query(`
            CREATE TABLE "city" (
                "id" SERIAL PRIMARY KEY,
                "name" TEXT NOT NULL,
                "nation_id" INTEGER NOT NULL DEFAULT 0,
                "level" SMALLINT NOT NULL DEFAULT 1,
                "pop" INTEGER NOT NULL DEFAULT 0,
                "pop_max" INTEGER NOT NULL DEFAULT 0,
                "agri" INTEGER NOT NULL DEFAULT 0,
                "agri_max" INTEGER NOT NULL DEFAULT 0,
                "comm" INTEGER NOT NULL DEFAULT 0,
                "comm_max" INTEGER NOT NULL DEFAULT 0,
                "secu" INTEGER NOT NULL DEFAULT 0,
                "secu_max" INTEGER NOT NULL DEFAULT 0,
                "def" INTEGER NOT NULL DEFAULT 0,
                "def_max" INTEGER NOT NULL DEFAULT 0,
                "wall" INTEGER NOT NULL DEFAULT 0,
                "wall_max" INTEGER NOT NULL DEFAULT 0,
                "trust" INTEGER NOT NULL DEFAULT 0,
                "gold" INTEGER NOT NULL DEFAULT 0,
                "rice" INTEGER NOT NULL DEFAULT 0,
                "region" SMALLINT NOT NULL DEFAULT 0,
                "state" SMALLINT NOT NULL DEFAULT 0,
                "term" SMALLINT NOT NULL DEFAULT 0,
                "conflict" JSONB NOT NULL DEFAULT '{}'::jsonb,
                "meta" JSONB NOT NULL DEFAULT '{}'::jsonb
            )
        `);

        // 3. 장수(General) 테이블
        await queryRunner.query(`
            CREATE TABLE "general" (
                "id" SERIAL PRIMARY KEY,
                "owner_id" INTEGER,
                "name" TEXT NOT NULL,
                "nation_id" INTEGER NOT NULL DEFAULT 0,
                "city_id" INTEGER NOT NULL DEFAULT 0,
                "troop_id" INTEGER NOT NULL DEFAULT 0,
                "gold" INTEGER NOT NULL DEFAULT 1000,
                "rice" INTEGER NOT NULL DEFAULT 1000,
                "leadership" SMALLINT NOT NULL DEFAULT 50,
                "leadership_exp" INTEGER NOT NULL DEFAULT 0,
                "strength" SMALLINT NOT NULL DEFAULT 50,
                "strength_exp" INTEGER NOT NULL DEFAULT 0,
                "intel" SMALLINT NOT NULL DEFAULT 50,
                "intel_exp" INTEGER NOT NULL DEFAULT 0,
                "politics" SMALLINT NOT NULL DEFAULT 50,
                "politics_exp" INTEGER NOT NULL DEFAULT 0,
                "charm" SMALLINT NOT NULL DEFAULT 50,
                "charm_exp" INTEGER NOT NULL DEFAULT 0,
                "injury" SMALLINT NOT NULL DEFAULT 0,
                "experience" INTEGER NOT NULL DEFAULT 0,
                "dedication" INTEGER NOT NULL DEFAULT 0,
                "officer_level" SMALLINT NOT NULL DEFAULT 0,
                "officer_city" INTEGER NOT NULL DEFAULT 0,
                "recent_war" INTEGER NOT NULL DEFAULT 0,
                "crew" INTEGER NOT NULL DEFAULT 0,
                "crew_type" SMALLINT NOT NULL DEFAULT 0,
                "train" SMALLINT NOT NULL DEFAULT 0,
                "atmos" SMALLINT NOT NULL DEFAULT 0,
                "age" SMALLINT NOT NULL DEFAULT 20,
                "born_year" SMALLINT NOT NULL DEFAULT 180,
                "dead_year" SMALLINT NOT NULL DEFAULT 300,
                "special" TEXT NOT NULL DEFAULT 'None',
                "spec_age" SMALLINT NOT NULL DEFAULT 0,
                "special2" TEXT NOT NULL DEFAULT 'None',
                "spec_age2" SMALLINT NOT NULL DEFAULT 0,
                "weapon" TEXT NOT NULL DEFAULT 'None',
                "book" TEXT NOT NULL DEFAULT 'None',
                "horse" TEXT NOT NULL DEFAULT 'None',
                "item" TEXT NOT NULL DEFAULT 'None',
                "turn_time" TIMESTAMPTZ NOT NULL DEFAULT now(),
                "recent_war_time" TIMESTAMPTZ,
                "kill_turn" SMALLINT NOT NULL DEFAULT 0,
                "block" SMALLINT NOT NULL DEFAULT 0,
                "meta" JSONB NOT NULL DEFAULT '{}'::jsonb,
                "penalty" JSONB NOT NULL DEFAULT '{}'::jsonb,
                                "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
                                "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
                            )
                        `);
                
                        // 4. 외교(Diplomacy) 테이블
                        await queryRunner.query(`
                            CREATE TABLE "diplomacy" (
                                "id" SERIAL PRIMARY KEY,
                                "src_nation_id" INTEGER NOT NULL,
                                "dest_nation_id" INTEGER NOT NULL,
                                "state" TEXT NOT NULL,
                                "term" SMALLINT NOT NULL DEFAULT 0,
                                "meta" JSONB NOT NULL DEFAULT '{}'::jsonb,
                                "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
                            )
                        `);
                
                        // 5. 부대(Troop) 테이블
                        await queryRunner.query(`
                            CREATE TABLE "troop" (
                                "id" INTEGER PRIMARY KEY, -- 리더 장수 ID
                                "nation_id" INTEGER NOT NULL,
                                "name" TEXT NOT NULL,
                                "meta" JSONB NOT NULL DEFAULT '{}'::jsonb,
                                "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
                            )
                        `);
                
                        // 6. 메시지(Message) 테이블
                        await queryRunner.query(`
                            CREATE TABLE "message" (
                                "id" SERIAL PRIMARY KEY,
                                "mailbox" TEXT NOT NULL,
                                "src_id" INTEGER,
                                "dest_id" INTEGER,
                                "text" TEXT NOT NULL,
                                "sent_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
                                "meta" JSONB NOT NULL DEFAULT '{}'::jsonb
                            )
                        `);
                
                        // 7. 저널(Journal) 테이블 - 변형 CQRS 핵심
                        await queryRunner.query(`
                            CREATE TABLE "journal" (
                                "id" BIGSERIAL PRIMARY KEY,
                                "profile" TEXT NOT NULL,
                                "seq" BIGINT NOT NULL,
                                "type" TEXT NOT NULL,
                                "payload" JSONB NOT NULL,
                                "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
                            )
                        `);
                
                        // 8. 스냅샷(Snapshot) 테이블
                        await queryRunner.query(`
                            CREATE TABLE "snapshot" (
                                "id" SERIAL PRIMARY KEY,
                                "profile" TEXT NOT NULL,
                                "snapshot" JSONB NOT NULL,
                                "checksum" TEXT NOT NULL,
                                "version" INTEGER NOT NULL,
                                "turn_time" TIMESTAMPTZ NOT NULL,
                                "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
                            )
                        `);
                
                        // 9. 월드 상태(WorldState/Env) 테이블
                        await queryRunner.query(`
                            CREATE TABLE "world_state" (
                                "id" SERIAL PRIMARY KEY,
                                "profile" TEXT NOT NULL UNIQUE,
                                "year" SMALLINT NOT NULL DEFAULT 184,
                                "month" SMALLINT NOT NULL DEFAULT 1,
                                "env" JSONB NOT NULL DEFAULT '{}'::jsonb,
                                "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
                            )
                        `);
                    }
                
                    public async down(queryRunner: QueryRunner): Promise<void> {
                        await queryRunner.query(`DROP TABLE "world_state"`);
                        await queryRunner.query(`DROP TABLE "snapshot"`);
                        await queryRunner.query(`DROP TABLE "journal"`);
                        await queryRunner.query(`DROP TABLE "message"`);
                        await queryRunner.query(`DROP TABLE "troop"`);
                        await queryRunner.query(`DROP TABLE "diplomacy"`);
                        await queryRunner.query(`DROP TABLE "general"`);
                        await queryRunner.query(`DROP TABLE "city"`);
                        await queryRunner.query(`DROP TABLE "nation"`);
                    }
                }
                
