/**
 * 24-space board layout (clockwise from GO at bottom-right corner):
 *
 *  [FreePark] [top-5]  [top-4]  [top-3]  [top-2]  [top-1]  [GoToJail]
 *  [left-5]                 C E N T E R                      [right-1]
 *  [left-4]                (dice, controls,                   [right-2]
 *  [left-3]                 game log)                         [right-3]
 *  [left-2]                                                   [right-4]
 *  [left-1]                                                   [right-5]
 *  [Jail]     [bot-1]  [bot-2]  [bot-3]  [bot-4]  [bot-5]  [GO]
 *
 *  Movement: clockwise starting from GO (id=0, bottom-right)
 */

const BOARD_SPACES = Object.freeze([
  // Bottom row (right to left): GO + 5 spaces
  { id: 0,  name: 'GO',                type: 'go',              group: null,        price: 0,   baseRent: 0,   side: 'bottom', sideIndex: 0 },
  { id: 1,  name: 'Mediterranean Ave', type: 'property',        group: 'brown',     price: 60,  baseRent: 4,   side: 'bottom', sideIndex: 1 },
  { id: 2,  name: 'Community Chest',   type: 'community-chest', group: null,        price: 0,   baseRent: 0,   side: 'bottom', sideIndex: 2 },
  { id: 3,  name: 'Baltic Ave',        type: 'property',        group: 'brown',     price: 60,  baseRent: 8,   side: 'bottom', sideIndex: 3 },
  { id: 4,  name: 'Oriental Ave',      type: 'property',        group: 'lightblue', price: 100, baseRent: 12,  side: 'bottom', sideIndex: 4 },
  { id: 5,  name: 'Chance',            type: 'chance',          group: null,        price: 0,   baseRent: 0,   side: 'bottom', sideIndex: 5 },

  // Left column (bottom to top): Jail + 5 spaces
  { id: 6,  name: 'Jail',              type: 'jail',            group: null,        price: 0,   baseRent: 0,   side: 'left',   sideIndex: 0 },
  { id: 7,  name: 'Vermont Ave',       type: 'property',        group: 'lightblue', price: 100, baseRent: 14,  side: 'left',   sideIndex: 1 },
  { id: 8,  name: 'Connecticut Ave',   type: 'property',        group: 'pink',      price: 140, baseRent: 18,  side: 'left',   sideIndex: 2 },
  { id: 9,  name: 'Community Chest',   type: 'community-chest', group: null,        price: 0,   baseRent: 0,   side: 'left',   sideIndex: 3 },
  { id: 10, name: 'St. James Place',   type: 'property',        group: 'pink',      price: 140, baseRent: 20,  side: 'left',   sideIndex: 4 },
  { id: 11, name: 'Chance',            type: 'chance',          group: null,        price: 0,   baseRent: 0,   side: 'left',   sideIndex: 5 },

  // Top row (left to right): Free Parking + 5 spaces
  { id: 12, name: 'Free Parking',      type: 'free-parking',    group: null,        price: 0,   baseRent: 0,   side: 'top',    sideIndex: 0 },
  { id: 13, name: 'Tennessee Ave',     type: 'property',        group: 'orange',    price: 180, baseRent: 26,  side: 'top',    sideIndex: 1 },
  { id: 14, name: 'Indiana Ave',       type: 'property',        group: 'orange',    price: 180, baseRent: 28,  side: 'top',    sideIndex: 2 },
  { id: 15, name: 'Community Chest',   type: 'community-chest', group: null,        price: 0,   baseRent: 0,   side: 'top',    sideIndex: 3 },
  { id: 16, name: 'Pacific Ave',       type: 'property',        group: 'green',     price: 240, baseRent: 36,  side: 'top',    sideIndex: 4 },
  { id: 17, name: 'Chance',            type: 'chance',          group: null,        price: 0,   baseRent: 0,   side: 'top',    sideIndex: 5 },

  // Right column (top to bottom): Go To Jail + 5 spaces
  { id: 18, name: 'Go To Jail',        type: 'go-to-jail',      group: null,        price: 0,   baseRent: 0,   side: 'right',  sideIndex: 0 },
  { id: 19, name: 'North Carolina Ave',type: 'property',        group: 'green',     price: 240, baseRent: 40,  side: 'right',  sideIndex: 1 },
  { id: 20, name: 'Marvin Gardens',    type: 'property',        group: 'yellow',    price: 280, baseRent: 44,  side: 'right',  sideIndex: 2 },
  { id: 21, name: 'Community Chest',   type: 'community-chest', group: null,        price: 0,   baseRent: 0,   side: 'right',  sideIndex: 3 },
  { id: 22, name: 'Ventnor Ave',       type: 'property',        group: 'yellow',    price: 280, baseRent: 48,  side: 'right',  sideIndex: 4 },
  { id: 23, name: 'Boardwalk',         type: 'property',        group: 'blue',      price: 350, baseRent: 50,  side: 'right',  sideIndex: 5 },
]);

export const TOTAL_SPACES = BOARD_SPACES.length;

export const GROUP_COLORS = Object.freeze({
  brown: '#8B4513',
  lightblue: '#87CEEB',
  pink: '#FF69B4',
  orange: '#FF8C00',
  green: '#228B22',
  yellow: '#FFD700',
  blue: '#0000CD',
});

/**
 * Returns property IDs belonging to a color group.
 */
export function getGroupPropertyIds(group) {
  return BOARD_SPACES
    .filter((s) => s.group === group && s.type === 'property')
    .map((s) => s.id);
}

/**
 * Returns all unique color groups that have properties.
 */
export function getAllGroups() {
  const groups = new Set();
  for (const space of BOARD_SPACES) {
    if (space.group) groups.add(space.group);
  }
  return [...groups];
}

export default BOARD_SPACES;
