import { Table, Column, Model, DataType, Default, HasMany } from 'sequelize-typescript';

@Table
export class Character extends Model<Character> {

  @Column
  name!: string;

  @Column(DataType.SMALLINT)
  level!: number;
  
  @Column(DataType.BOOLEAN)
  online!: boolean;

  @Default(0)
  @Column(DataType.SMALLINT)
  positionX!: number;

  @Default(0)
  @Column(DataType.SMALLINT)
  positionY!: number;
}