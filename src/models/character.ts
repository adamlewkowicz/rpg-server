import { Table, Column, Model, DataType, Default, HasMany } from 'sequelize-typescript';
import { CharacterLocation } from './CharacterLocation';

@Table({
  tableName: 'characters'
})
export class Character extends Model<Character> {

  @Column
  name!: string;

  @Default(1)
  @Column(DataType.SMALLINT)
  level!: number;
  
  @Default(false)
  @Column(DataType.BOOLEAN)
  online!: boolean;

  static async createWithLocation({ name, locationId = 1 }: any) {
    const character = await Character.create({ name });
    const location = await CharacterLocation.create({ locationId, charId: character.id });
    return {
      ...character.toJSON(),
      ...location.toJSON()
    }
  }
}