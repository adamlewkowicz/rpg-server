import { Table, Column, Model, DataType, Default, HasMany } from 'sequelize-typescript';

@Table
export class Character extends Model<Character> {

  @Column
  name!: string;

  @Column(DataType.SMALLINT)
  level!: number;
  
  @Column(DataType.BOOLEAN)
  online!: boolean;

}