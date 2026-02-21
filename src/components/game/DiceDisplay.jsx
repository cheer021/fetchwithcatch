const DICE_DOTS = {
  1: [[1, 1]],
  2: [[0, 2], [2, 0]],
  3: [[0, 2], [1, 1], [2, 0]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
};

function DieFace({ value, rolling }) {
  const dots = DICE_DOTS[value] || [];

  return (
    <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-lg border-2 border-slate-300 shadow-md grid grid-cols-3 grid-rows-3 p-1.5 gap-0.5 ${rolling ? 'animate-bounce' : ''}`}>
      {Array.from({ length: 3 }, (_, row) =>
        Array.from({ length: 3 }, (_, col) => {
          const hasDot = dots.some(([r, c]) => r === row && c === col);
          return (
            <div key={`${row}-${col}`} className="flex items-center justify-center">
              {hasDot && (
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-slate-800 rounded-full" />
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default function DiceDisplay({ dice, rolling }) {
  if (!dice) return null;

  return (
    <div className="flex gap-3 items-center justify-center">
      <DieFace value={dice.die1} rolling={rolling} />
      <DieFace value={dice.die2} rolling={rolling} />
    </div>
  );
}
