/**
 * Returns a new player with money credited.
 */
export function creditPlayer(player, amount) {
  return Object.freeze({ ...player, money: player.money + amount });
}

/**
 * Returns a new player with money debited.
 * If player can't afford it, money goes negative (bankruptcy check happens elsewhere).
 */
export function debitPlayer(player, amount) {
  return Object.freeze({ ...player, money: player.money - amount });
}

/**
 * Transfers money from one player to another.
 * Returns { payer, payee } as new player objects.
 */
export function transferMoney(payer, payee, amount) {
  return Object.freeze({
    payer: debitPlayer(payer, amount),
    payee: creditPlayer(payee, amount),
  });
}
