import {
  Table, Column, Model, DataType, Default, Unique,
  AllowNull, HasMany, ForeignKey, BelongsTo,
} from 'sequelize-typescript';
import { STORAGE_TYPES } from '../consts';
import { Character } from './Character';

const { INVENTORY, DEPOSIT } = STORAGE_TYPES;
type ITEM_STORAGE = 'INVENTORY' | 'DEPOSIT';


@Table({
  tableName: 'items'
})
export class Item extends Model<Item> {

  @Unique
  @AllowNull(false)
  @Column
  name!: string;

  @Default(0)
  @Column
  damage!: number

}



@Table({
  tableName: 'character_items',
  indexes: [{
    unique: true,
    fields: ['charId', 'itemId', 'position', 'storage']
  }]
})
export class CharacterItem extends Model<CharacterItem> {

  @ForeignKey(() => Character)
  @AllowNull(false)
  @Column
  charId!: number;
  @BelongsTo(() => Character)
  character!: Character;

  @ForeignKey(() => Item)
  @Column
  itemId!: number;
  @BelongsTo(() => Item)
  item!: Item;

  @Default(INVENTORY)
  @AllowNull(false)
  @Column(DataType.ENUM(INVENTORY, DEPOSIT))
  storage!: ITEM_STORAGE;

  @AllowNull(false)
  @Column
  position!: number;


  static async getFromInventory(charId: number) {
    const items = await this.findAll({
      where: { charId, storage: INVENTORY },
      attributes: ['id', 'position'],
      include: [{ model: Item }]
    });
    return items.map(foundItem => {
      const { item, ...rest } = foundItem.toJSON();
      const { id: itemId, ...itemWithoutId } = item;
      return { ...rest, itemId, ...itemWithoutId };
    });
  }
}