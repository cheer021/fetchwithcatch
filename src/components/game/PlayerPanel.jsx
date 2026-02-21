import BOARD_SPACES from '../../game/board-config';

export default function PlayerPanel({ players, currentPlayerIndex, propertyOwnership, houseCount }) {
  return (
    <div className="flex flex-col gap-2 w-full max-w-xs">
      {players.map((player, index) => {
        const isCurrent = index === currentPlayerIndex;
        const properties = player.ownedProperties.map((id) => BOARD_SPACES[id]);

        return (
          <div
            key={player.id}
            className={`rounded-lg p-2 text-sm border-2 transition-colors ${
              player.isBankrupt
                ? 'bg-slate-100 border-slate-200 opacity-50'
                : isCurrent
                  ? 'bg-yellow-50 border-yellow-400 shadow'
                  : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-4 h-4 rounded-full shrink-0"
                style={{ backgroundColor: player.avatarColor }}
              />
              <span className="font-semibold truncate">
                {player.name}
                {player.isBot && <span className="text-slate-400 text-xs ml-1">(AI)</span>}
              </span>
              <span className={`ml-auto font-mono font-bold ${player.money < 100 ? 'text-red-600' : 'text-emerald-700'}`}>
                ${player.money}
              </span>
            </div>

            {player.isBankrupt && (
              <span className="text-red-500 text-xs font-semibold">BANKRUPT</span>
            )}

            {player.isInJail && !player.isBankrupt && (
              <span className="text-orange-500 text-xs font-semibold">IN JAIL</span>
            )}

            {properties.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {properties.map((prop) => {
                  const houses = houseCount[prop.id] ?? 0;
                  return (
                    <span
                      key={prop.id}
                      className="text-[10px] px-1 py-0.5 rounded text-white leading-none"
                      style={{ backgroundColor: prop.group ? undefined : '#666' }}
                      title={`${prop.name}${houses > 0 ? ` (${houses >= 5 ? 'Hotel' : `${houses}H`})` : ''}`}
                    >
                      <span
                        className="inline-block w-2 h-2 rounded-sm mr-0.5"
                        style={{
                          backgroundColor: {
                            brown: '#8B4513', lightblue: '#87CEEB', pink: '#FF69B4',
                            orange: '#FF8C00', green: '#228B22', yellow: '#FFD700', blue: '#0000CD',
                          }[prop.group] || '#999',
                        }}
                      />
                      {houses > 0 && <span className="text-yellow-300">{houses >= 5 ? 'H' : houses}</span>}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
