import { Profile } from 'src/app/profile/entities/profile.entity';
import { Tweet } from 'src/app/tweet/entities/tweet.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  // JoinColumn,
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

  @OneToOne(() => Profile, (profile) => profile.user, {
    cascade: ['insert', 'update'], // Enable cascade crud operations from user to related profile e.g creates profile when creating user

    // cascade: ['insert', 'update'], // Enable only insert and update cascade operations
    // eager: true, // Automatically load profile relation when fetching user, but not recommended for large relations i.e. performance issues
  })
  // @JoinColumn() // Owning side of the one-to-one relationship that contains the foreign key e.g. User table contains foreign key of Profile
  profile: Profile;

  @OneToMany(() => Tweet, (tweet) => tweet.user)
  tweets: Tweet[];
}
