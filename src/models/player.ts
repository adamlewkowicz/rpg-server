import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';

@Table
export class Player extends Model<Player> {

  @Column
  name!: string;

  @Column(DataType.SMALLINT)
  level!: number;
  
}