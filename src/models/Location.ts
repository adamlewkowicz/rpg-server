import { Table, Column, Model, DataType, Default, HasMany } from 'sequelize-typescript';

@Table({
  tableName: 'locations'
})
export class Location extends Model<Location> {

  @Column
  name!: string;

  @Default(128)
  @Column(DataType.SMALLINT)
  width!: number;

  @Default(128)
  @Column(DataType.SMALLINT)
  height!: number;

}