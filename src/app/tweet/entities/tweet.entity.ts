import { Hashtag } from 'src/app/hashtags/entities/hashtag.entity';
import { User } from 'src/app/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@Index(['user']) // Index on foreign key for JOIN performance
export class Tweet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: '100', nullable: false })
  title: string;

  @Column({
    type: 'varchar',
    length: '300',
    nullable: false,
  })
  content: string;

  @Column({ type: 'varchar', length: '200', nullable: false })
  image: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => User, (user) => user.tweets, {
    nullable: false,
    onDelete: 'CASCADE',
    // eager: true, // Automatically load user relation when fetching tweet, but not recommended for large relations i.e. performance issues
  })
  @JoinColumn({ name: 'userId' }) // Explicit column name
  user: User;

  @ManyToMany(() => Hashtag) // Many-to-many relation between Tweet and Hashtag unidirectional
  @JoinTable() // Owning side of the many-to-many relationship that contains the junction table
  hashtags: Hashtag[];

  // We don't need to cascade delete hashtags it automatically when a tweet is deleted because hashtags can be shared across multiple tweets
}
