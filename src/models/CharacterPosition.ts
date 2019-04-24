import {
  Table, Column, Model, DataType, Default, ForeignKey, CreatedAt,
  BelongsTo, AllowNull, HasMany,
} from 'sequelize-typescript';
import { Character } from './Character';
import { Map } from './Map'; 

@Table({
  timestamps: false
})
export class CharacterPosition extends Model<CharacterPosition> {

  /* Map */
  @ForeignKey(() => Map)
  @Column
  mapId!: number;
  
  @BelongsTo(() => Map)
  map!: Map;

  /* Character */
  @ForeignKey(() => Character)
  @Column
  charId!: number;

  @BelongsTo(() => Character)
  character!: Character;

  @Default(0)
  @Column(DataType.SMALLINT)
  positionX!: number;

  @Default(0)
  @Column(DataType.SMALLINT)
  positionY!: number;

  @CreatedAt
  @Default(Date)
  @Column
  createdAt!: Date;

}