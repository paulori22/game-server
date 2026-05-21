import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1779326692838 implements MigrationInterface {
    name = 'InitialSchema1779326692838'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "games" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "slug" character varying(100) NOT NULL, "name" character varying(255) NOT NULL, "fieldsSchema" jsonb NOT NULL, "defaultSortField" character varying(64) NOT NULL, "defaultSortOrder" character varying(4) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_095bbaa4f028fa5a03e37f631d6" UNIQUE ("slug"), CONSTRAINT "PK_c9b16b62917b5595af982d66337" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "leaderboard_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "playerName" character varying(100) NOT NULL, "data" jsonb NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "game_id" uuid, CONSTRAINT "UQ_a591aa59484f081870d717413b4" UNIQUE ("game_id", "playerName"), CONSTRAINT "PK_a3187f7d37819756a5519336665" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "leaderboard_entries" ADD CONSTRAINT "FK_262d471e2b769a2b85ddf813212" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leaderboard_entries" DROP CONSTRAINT "FK_262d471e2b769a2b85ddf813212"`);
        await queryRunner.query(`DROP TABLE "leaderboard_entries"`);
        await queryRunner.query(`DROP TABLE "games"`);
    }

}
