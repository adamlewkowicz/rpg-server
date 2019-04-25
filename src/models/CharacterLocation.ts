import {
  Table, Column, Model, DataType, Default, ForeignKey, CreatedAt,
  BelongsTo, AllowNull, HasMany,
} from 'sequelize-typescript';
import { Character } from './Character';
import { Location } from './Location'; 

@Table({
  tableName: 'character_location',
  timestamps: false
})
export class CharacterLocation extends Model<CharacterLocation> {

  /* Location */
  @ForeignKey(() => Location)
  @Column
  locationId!: number;
  @BelongsTo(() => Location)
  location!: Location;

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
  date!: Date;

}