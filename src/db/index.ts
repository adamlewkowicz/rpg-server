import { Sequelize } from 'sequelize-typescript';
import { Character } from '../models/Character';
import { CharacterLocation } from '../models/CharacterLocation';
import { Location } from '../models/Location';

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
  CharacterLocation
]);

export { sequelize as sequelize };