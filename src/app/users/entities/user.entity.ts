import { Profile } from 'src/app/profile/entities/profile.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  // user entity definition for table structure
  @PrimaryGeneratedColumn('uuid')
  id: string; // UUID is a string, not a number

  @Column({ type: 'varchar', length: '30', unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: '40', unique: true, nullable: false })
  username: string;

  @Column({ type: 'varchar', length: '20', nullable: false })
  password: string;

  @Column({ type: 'varchar', length: '20', nullable: false })
  confirmPassword: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToOne(() => Profile)
  @JoinColumn()
  profile: Profile;
}

// {
//   "firstName": "Jane",
//   "lastName": "Doe",
//   "username": "janedoe",
//   "email": "jane.doe@example.com",
//   "gender": "female",
//   "password": "s3cr3tPass",
//   "confirmPassword": "s3cr3tPass"
// }
