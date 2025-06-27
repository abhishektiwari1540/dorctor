import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'user_details' })
export class UserDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  // @OneToOne(() => User, (user) => user.userDetails)
  // @JoinColumn({ name: 'user_id' }) // this is important!
  // user: User;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  language: string;

  @Column({ type: 'date', nullable: true })
  dob: string;

  @Column({ nullable: true })
  servicePin: string;

  @Column({ type: 'int', nullable: true })
  experience: number;

  @Column({ nullable: true })
  serviceArea: string;

  @Column({ type: 'text', nullable: true })
  aboutMe: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
