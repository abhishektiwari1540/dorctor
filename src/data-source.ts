// src/data-source.ts
import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/user.entity";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "",
  database: "patient_planet",
  synchronize: false,
  logging: true,
  entities: [User],
  migrations: ["src/migrations/*.ts"],
  subscribers: [],
});