const CHANCE_CARDS = Object.freeze([
  { id: 'ch1',  text: 'Advance to GO. Collect $200.',                          effect: { type: 'move-to', position: 0 } },
  { id: 'ch2',  text: 'Go directly to Jail. Do not pass GO.',                  effect: { type: 'go-to-jail' } },
  { id: 'ch3',  text: 'Bank pays you a dividend of $50.',                      effect: { type: 'gain', amount: 50 } },
  { id: 'ch4',  text: 'Go back 3 spaces.',                                     effect: { type: 'move-relative', offset: -3 } },
  { id: 'ch5',  text: 'Speeding fine. Pay $75.',                               effect: { type: 'lose', amount: 75 } },
  { id: 'ch6',  text: 'Your building loan matures. Collect $150.',             effect: { type: 'gain', amount: 150 } },
  { id: 'ch7',  text: 'You have been elected chairman of the board. Pay $100.', effect: { type: 'lose', amount: 100 } },
  { id: 'ch8',  text: 'Advance to Boardwalk.',                                 effect: { type: 'move-to', position: 23 } },
  { id: 'ch9',  text: 'Bank error in your favor. Collect $100.',               effect: { type: 'gain', amount: 100 } },
  { id: 'ch10', text: 'Pay poor tax of $50.',                                  effect: { type: 'lose', amount: 50 } },
]);

const COMMUNITY_CHEST_CARDS = Object.freeze([
  { id: 'cc1',  text: 'Advance to GO. Collect $200.',                        effect: { type: 'move-to', position: 0 } },
  { id: 'cc2',  text: 'Bank error in your favor. Collect $200.',             effect: { type: 'gain', amount: 200 } },
  { id: 'cc3',  text: 'Doctor\'s fee. Pay $50.',                             effect: { type: 'lose', amount: 50 } },
  { id: 'cc4',  text: 'Go directly to Jail. Do not pass GO.',               effect: { type: 'go-to-jail' } },
  { id: 'cc5',  text: 'Holiday fund matures. Collect $100.',                 effect: { type: 'gain', amount: 100 } },
  { id: 'cc6',  text: 'Income tax refund. Collect $20.',                     effect: { type: 'gain', amount: 20 } },
  { id: 'cc7',  text: 'Life insurance matures. Collect $100.',               effect: { type: 'gain', amount: 100 } },
  { id: 'cc8',  text: 'Hospital fees. Pay $100.',                            effect: { type: 'lose', amount: 100 } },
  { id: 'cc9',  text: 'School fees. Pay $50.',                               effect: { type: 'lose', amount: 50 } },
  { id: 'cc10', text: 'You inherit $100.',                                   effect: { type: 'gain', amount: 100 } },
]);

/**
 * Shuffles an array immutably using Fisher-Yates.
 */
function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Creates a shuffled deck. Returns { cards, index }.
 * Draw by reading cards[index], then increment index (wrap around + reshuffle).
 */
export function createDeck(type) {
  const source = type === 'chance' ? CHANCE_CARDS : COMMUNITY_CHEST_CARDS;
  return Object.freeze({ cards: shuffle(source), index: 0 });
}

/**
 * Draws the next card from a deck. Returns { card, deck } (new deck state).
 */
export function drawCard(deck) {
  const card = deck.cards[deck.index];
  const nextIndex = deck.index + 1;

  if (nextIndex >= deck.cards.length) {
    // Reshuffle
    return { card, deck: createDeck(card.id.startsWith('ch') ? 'chance' : 'community-chest') };
  }

  return { card, deck: Object.freeze({ ...deck, index: nextIndex }) };
}
