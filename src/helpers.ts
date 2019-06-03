import { Location } from './models/Location';
import { CharacterLocation } from './models/CharacterLocation';
import { Character } from './models/Character';
import * as Objects from 'rpg-shared/lib/objects';
import { ItemLocation } from './models/Item';

export async function initGame(clientId: number) {
  const character = await Character.findByPk(clientId);
  const position = await CharacterLocation.findOne({
    where: { charId: clientId },
    order: [['id', 'DESC']]
  });
  const [inventory] = await Promise.all([
    ItemLocation.getInventory(clientId)
  ]);
  const currentMap = await Location.findByPk(1);

  return { character, position, currentMap, inventory };
}

export async function getCharsForLocationId (locationId: number, charId: number) {
  const sameLocationChars = await CharacterLocation
  .findAll({
    where: { locationId },
    include: [
      { model: Character }
    ]
  });

  const normalizedChars = sameLocationChars
    .map(char => {
      const { character, ...rest } = char.toJSON();
      return { ...character, ...rest };
    })
    .filter(char => char.id != charId);

  return normalizedChars;
}


export async function getDataForNextLocation(nextLocationId: number, charId: number) {

  const [nextLocation, characters] = await Promise.all([
    Location.findByPk(nextLocationId),
    getCharsForLocationId(nextLocationId, charId)
  ]);

  if (!nextLocation || !characters) {
    const error = new Error(`Location probably doesn't exists - 404`);
    throw error;
    // error.status = 404;
  }

  return { nextLocation, characters }
}