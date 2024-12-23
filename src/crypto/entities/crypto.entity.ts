import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('crypto_data')
export class CryptoEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  symbol!: string;

  @Column()
  name!: string;

  @Column('decimal', { precision: 18, scale: 8 })
  price!: number;

  @Column('decimal', { precision: 24, scale: 2 })
  marketCap!: number;

  @Column('decimal', { precision: 24, scale: 2 })
  volume24h!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  percentChange24h!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  percentChange7d!: number;

  @CreateDateColumn()
  timestamp!: Date;

  @Column('jsonb', { nullable: true })
  technicalIndicators!: Record<string, any>;
}
