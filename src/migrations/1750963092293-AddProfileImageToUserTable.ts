import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProfileImageToUserTable1750963092293 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE users 
            ADD COLUMN profile_image VARCHAR(255) NULL AFTER name
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE users 
            DROP COLUMN profile_image
        `);
    }
}