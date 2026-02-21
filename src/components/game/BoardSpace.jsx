import { GROUP_COLORS } from "../../game/board-config";

export default function BoardSpace({
  space,
  owner,
  houses,
  players,
  isCurrentSpace,
  onSpaceClick,
}) {
  const groupColor = space.group ? GROUP_COLORS[space.group] : null;
  const playersHere = players.filter(
    (p) => p.position === space.id && !p.isBankrupt,
  );

  const typeIcons = {
    go: "$",
    jail: "J",
    "free-parking": "P",
    "go-to-jail": "!",
    chance: "?",
    "community-chest": "C",
  };

  return (
    <div
      onClick={() => onSpaceClick?.(space)}
      className={`relative flex flex-col border border-slate-300 bg-white text-xs overflow-hidden cursor-pointer transition-shadow h-full ${
        isCurrentSpace
          ? "ring-2 ring-yellow-400 shadow-lg z-10"
          : "hover:shadow-md"
      }`}
      title={`${space.name}${space.price ? ` - $${space.price}` : ""}`}
    >
      {/* Color band for properties */}
      {groupColor && (
        <div
          className="h-2 w-full shrink-0"
          style={{ backgroundColor: groupColor }}
        />
      )}

      {/* Space content */}
      <div className="flex-1 flex flex-col items-center justify-center p-0.5 min-h-0">
        <span className="font-semibold text-center leading-tight line-clamp-2 text-[9px] sm:text-[10px]">
          {space.type === "property"
            ? space.name
            : typeIcons[space.type] || space.name}
        </span>

        {space.price > 0 && (
          <span className="text-slate-500 text-[8px]">${space.price}</span>
        )}

        {/* Houses indicator */}
        {houses > 0 && (
          <div className="flex gap-px mt-0.5">
            {houses >= 5 ? (
              <span className="text-red-600 text-[8px] font-bold">H</span>
            ) : (
              Array.from({ length: houses }, (_, i) => (
                <div key={i} className="w-1.5 h-1.5 bg-green-600 rounded-sm" />
              ))
            )}
          </div>
        )}
      </div>

      {/* Owner indicator */}
      {owner && (
        <div
          className="absolute top-0 right-0 w-2 h-2 rounded-bl"
          style={{ backgroundColor: owner.avatarColor }}
        />
      )}

      {/* Player tokens */}
      {playersHere.length > 0 && (
        <div className="absolute bottom-0.5 left-0.5 flex gap-0.5 flex-wrap">
          {playersHere.map((p) => (
            <div
              key={p.id}
              className="w-3 h-3 rounded-full border border-white shadow-sm"
              style={{ backgroundColor: p.avatarColor }}
              title={p.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}
