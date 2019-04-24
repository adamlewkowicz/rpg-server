import { Table, Column, Model, DataType, Default, ForeignKey, CreatedAt, BelongsTo, HasMany } from 'sequelize-typescript';
import { Character } from './character';
import { Map } from './Map'; 

@Table
export class CharacterPosition extends Model<CharacterPosition> {

  // @HasMany(() => Character, 'id')
  // characterId!: Character;

  // @ForeignKey(() => Map)
  // mapId!: number;

  @Default(0)
  @Column(DataType.SMALLINT)
  positionX!: number;

  @Default(0)
  @Column(DataType.SMALLINT)
  positionY!: number;

  @CreatedAt
  @Column
  createdAat!: Date;

}