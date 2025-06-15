import { MigrationInterface, QueryRunner,Table } from "typeorm";

export class CreateUserTable1749997089962 implements MigrationInterface {

     public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
          new Table({
            name: "users",
            columns: [
              {
                name: "id",
                type: "int",
                isPrimary: true,
                isGenerated: true,
                generationStrategy: "increment",
              },
              {
                name: "country_code",
                type: "varchar",
                length: "5",
                isNullable: false,
                default: "'+1'",
              },
              {
                name: "phone",
                type: "varchar",
                length: "15",
                isNullable: false,
              },
              {
                name: "otp",
                type: "varchar",
                length: "6",
                isNullable: true,
              },
              {
                name: "phone_verified",
                type: "boolean",
                default: false,
              },
              {
                name: "phone_verified_at",
                type: "timestamp",
                isNullable: true,
              },
              {
                name: "name",
                type: "varchar",
                length: "100",
                isNullable: true,
              },
              {
                name: "email",
                type: "varchar",
                length: "100",
                isNullable: true,
                isUnique: true,
              },
              {
                name: "age",
                type: "int",
                isNullable: true,
              },
              {
                name: "password",
                type: "varchar",
                length: "255",
                isNullable: true,
              },
              {
                name: "profile_picture",
                type: "varchar",
                length: "255",
                isNullable: true,
              },
              {
                name: "created_at",
                type: "timestamp",
                default: "CURRENT_TIMESTAMP",
              },
              {
                name: "updated_at",
                type: "timestamp",
                default: "CURRENT_TIMESTAMP",
                onUpdate: "CURRENT_TIMESTAMP",
              },
              {
                name: "deleted_at",
                type: "timestamp",
                isNullable: true,
              },
              {
                name: "status",
                type: "enum",
                enum: ["active", "inactive", "suspended"],
                default: "'active'",
              },
              {
                name: "otp_expire_at",
                type: "timestamp",
                isNullable: true,
              },
              {
                name: "role",
                type: "enum",
                enum: ["patient", "partner"],
                default: "'patient'",
              },
            ],
          }),
          true
        );
    
        // Add unique constraint for phone and country code combination
        await queryRunner.query(
          "ALTER TABLE users ADD CONSTRAINT uq_user_phone_country UNIQUE (country_code, phone);"
        );
      }
    
      public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("users");
      }

}
