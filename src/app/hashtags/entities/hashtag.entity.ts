import { Tweet } from 'src/app/tweet/entities/tweet.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Hashtag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  name: string;

  @ManyToMany(() => Tweet, (tweet) => tweet.hashtags, {
    onDelete: 'CASCADE',
  })
  tweets: Tweet[];
}
