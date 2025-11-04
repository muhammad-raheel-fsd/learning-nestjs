import { User } from 'src/app/users/entities/user.entity';
import { Gender } from 'src/shared/types';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  // JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: '50', nullable: true })
  firstName: string;

  @Column({ type: 'varchar', length: '50', nullable: true })
  lastName: string;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender;

  @Column({ type: 'date', nullable: true })
  dob: Date;

  @Column({ type: 'varchar', length: '200', nullable: true })
  bio: string;

  @Column({ type: 'text', nullable: true })
  profilePicture: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // In callback, we specify the inverse side of the relation e.g which property on User entity relates to this Profile entity i.e. user.profile
  @OneToOne(() => User, (user) => user.profile, {
    // cascade: ['insert'], // Enable cascade insert operations from profile to related user e.g creates user when creating profile
    // cascade: ['insert', 'update'], // Enable only insert and update cascade operations
    // eager: true, // Automatically load user relation when fetching profile
    onDelete: 'CASCADE', // When user is deleted, delete related profile as well
  })
  // @JoinColumn() we don't need to create foreign key here since it's already created in User entity e.g. foreign key of Profile in User table
  @JoinColumn() // Owning side of the one-to-one relationship that contains the foreign key e.g. Profile table contains foreign key of User
  user: User;
}
