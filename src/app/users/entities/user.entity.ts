import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  // user entity definition for table structure
  @PrimaryGeneratedColumn('uuid')
  id: number;

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

// {
//   "firstName": "John",
//   "lastName": "Doe",
//   "username": "johndoe",
//   "email": "john.doe@example.com",
//   "gender": "male",
//   "password": "s3cr3tPass",
//   "confirmPassword": "s3cr3tPass"
// }
