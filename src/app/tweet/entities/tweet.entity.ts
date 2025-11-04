import { User } from 'src/app/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
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
  @JoinColumn()
  user: User;
}
