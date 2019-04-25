import { Sequelize } from 'sequelize-typescript';
import { Character } from '../models/Character';
import { CharacterLocation } from '../models/CharacterLocation';
import { Location } from '../models/Location';
import { Item, CharacterItem } from '../models/Item';

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: 'rpg-mysql',
  database: 'mmorpg',
  username: 'root',
  password: 'pwd'
  // modelPaths: [__dirname + '/**/*.ts']
});

sequelize.addModels([
  Character,
  Location,
  CharacterLocation,
  Item, 
  CharacterItem
]);

export { sequelize as sequelize };