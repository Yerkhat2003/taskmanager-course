import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('boards')
export class Board {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;
}
