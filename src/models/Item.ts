import {
  Table, Column, Model, DataType, Default, Unique,
  AllowNull, HasMany, ForeignKey, BelongsTo,
  CreatedAt,
} from 'sequelize-typescript';
import { STORAGE_TYPES } from '../consts';
import { Character } from './Character';

const { INVENTORY, DEPOSIT, GROUND } = STORAGE_TYPES;
type ITEM_STORAGE = 'INVENTORY' | 'DEPOSIT' | 'GROUND';


@Table({
  tableName: 'item_types'
})
export class ItemType extends Model<ItemType> {

  @Unique
  @AllowNull(false)
  @Column
  name!: string;

  @Default(0)
  @Column
  damage!: number

}



@Table({
  tableName: 'items_loot',
  timestamps: false
})
export class ItemLoot extends Model<ItemLoot> {

  @ForeignKey(() => Character)
  @AllowNull(false)
  @Column
  lootedBy!: number;
  @BelongsTo(() => Character)
  Character!: Character;

  @ForeignKey(() => ItemType)
  @AllowNull(false)
  @Column
  typeId!: number;
  @BelongsTo(() => ItemType)
  type!: ItemType;

  @CreatedAt
  @AllowNull(false)
  @Default(Date)
  @Column
  lootedAt!: Date;

}



@Table({
  tableName: 'items_loot_location',
  indexes: [{
    unique: true,
    fields: ['charId', 'lootId', 'position', 'storage']
  }]
})
export class ItemLocation extends Model<ItemLocation> {

  @BelongsTo(() => Character)
  character!: Character;
  @ForeignKey(() => Character)
  @AllowNull(false)
  @Column
  charId!: number;


  @BelongsTo(() => ItemLoot)
  loot!: ItemLoot;
  @ForeignKey(() => ItemLoot)
  @AllowNull(false)
  @Column
  lootId!: number;


  @Default(INVENTORY)
  @AllowNull(false)
  @Column(DataType.ENUM(INVENTORY, DEPOSIT, GROUND))
  storage!: ITEM_STORAGE;

  @AllowNull(false)
  @Column
  position!: number;

  static async getInventory (charId: number) {
    const foundItems = await this.findAll({
      where: { charId, storage: INVENTORY },
      attributes: ['id', 'position'],
      include: [{
        model: ItemLoot,
        attributes: { exclude: ['typeId'] },
        include: [{ model: ItemType }]
      }]
    });
    return foundItems.map(foundItem => {
      const { loot: { type, ...loot }, ...item } = foundItem.toJSON();
      return { ...item, loot, type };
    });
  }
}