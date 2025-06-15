import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum UserRole {
  PATIENT = 'patient',
  PARTNER = 'partner',
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  countryCode: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  age: number;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.PATIENT })
  role: UserRole;

  @Column({ nullable: true })
  otp: string;

  @Column({ nullable: true })
  otpExpireAt: Date;

  @Column({ default: false })
  phoneVerified: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}