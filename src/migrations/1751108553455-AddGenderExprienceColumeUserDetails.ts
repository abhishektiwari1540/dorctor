import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddExperienceYearColumnUserDetails1751108553455 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn("user_details", new TableColumn({
      name: "experience_year",
      type: "varchar",
      isNullable: true,
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("user_details", "experience_year");
  }
}
