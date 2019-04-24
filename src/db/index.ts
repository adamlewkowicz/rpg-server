import { Sequelize } from 'sequelize-typescript';
import { Character } from '../models/character';
import { Map } from '../models/Map';
import { CharacterPosition } from '../models/CharacterPosition';

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: 'rpg-mysql',
  database: 'mmorpg',
  username: 'root',
  password: 'pwd'
  // modelPaths: [__dirname + '/**/*.ts']
});

sequelize.addModels([Character, Map, CharacterPosition]);

export { sequelize as sequelize };