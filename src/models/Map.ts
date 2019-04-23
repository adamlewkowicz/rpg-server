import { Table, Column, Model, DataType, Default, HasMany } from 'sequelize-typescript';

@Table
export class Map extends Model<Map> {

  @Column
  name!: string;

  @Default(128)
  @Column(DataType.SMALLINT)
  width!: number;

  @Default(128)
  @Column(DataType.SMALLINT)
  height!: number;

}