import { Item, FightAction } from "rpg-shared/lib/objects";

export const initialGame = {
  collisions: [
    [0, 1, 1, 1, 0, 1, 0],
    [1, 0, 0, 0, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0]
  ],
  mobs: [{
    id: 1,
    lvl: 12,
    status: 'IDLE',
    x: 3,
    y: 5,
    type: {
      id: 1,
      name: 'Eagle',
      category: 'common',
      img: ''
    }
  }],
  npcs: [{
    id: 1,
    name: 'Anubis',
    x: 2,
    y: 6,
    lvl: 4,
    img: ''
  }],
  inventorySize: 30
}

export const item: Item = {
  id: 1,
  type: {
    id: 1,
    name: 'sword',
    img: ''
  },
  damage: 31
}

export const shop = {
  items: [item]
}

export const dialog = {
  id: 1,
  npcId: 1,
  steps: [
    {
      id: 1,
      text: 'Have you seen my golden brancelet?',
      options: [
        { id: 1, text: 'Where have you seen it last time?' },
        { id: 2, text: 'I will try to find it for you.' }
      ],
      closeText: 'Sorry, I have no time.'
    }
  ]
}

export const fightAction: FightAction = {     
  id: 1,
  targetId: 1,
  targetType: 'CHARACTER',
  type: 'BASIC_ATTACK',
  changes: {
    hp: -50
  },
  result: {
    hp: 134
  }
}