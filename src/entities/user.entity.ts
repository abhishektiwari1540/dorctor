import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { UserDetails } from './user-details.entity';

export enum UserRole {
  PATIENT = 'patient',
  PARTNER = 'partner',
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  countryCode: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
profileImage: string;


  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  age: number;

  @Column({ nullable: true })
  image: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.PATIENT })
  role: UserRole;

  @Column({ type: 'varchar', length: 6, nullable: true })
  otp: string | null;

  

  @Column({ type: 'datetime', nullable: true })
  otpExpireAt: Date | null;

  @Column({ default: false })
  phoneVerified: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

}
