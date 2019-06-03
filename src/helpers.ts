import { Location } from './models/Location';
import { CharacterLocation } from './models/CharacterLocation';
import { Character } from './models/Character';
import * as Objects from 'rpg-shared/lib/objects';


async function getCharsForLocationId (locationId: number, charId: number) {
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