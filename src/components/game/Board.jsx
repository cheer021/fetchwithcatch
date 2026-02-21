import BoardSpace from "./BoardSpace";

/**
 * Maps board space IDs to CSS grid positions for a 7x7 grid.
 * Layout:
 *   Row 1: top-left corner (12), top side (13-17), top-right corner (18)
 *   Rows 2-6: left side (11-7), CENTER, right side (19-23)
 *   Row 7: bottom-left corner (6), bottom side (5-1), bottom-right corner (0)
 */
function getGridPosition(space) {
  const { side, sideIndex } = space;

  if (side === "bottom") {
    // Bottom row: GO(0) is col 7, then 1-5 go right to left (cols 6-2)
    if (sideIndex === 0) return { row: 7, col: 7 }; // GO
    return { row: 7, col: 7 - sideIndex };
  }

  if (side === "left") {
    // Left column: Jail(6) is row 7 col 1, then 7-11 go bottom to top (rows 6-2)
    if (sideIndex === 0) return { row: 7, col: 1 }; // Jail
    return { row: 7 - sideIndex, col: 1 };
  }

  if (side === "top") {
    // Top row: Free Parking(12) is col 1, then 13-17 go left to right (cols 2-6)
    if (sideIndex === 0) return { row: 1, col: 1 }; // Free Parking
    return { row: 1, col: 1 + sideIndex };
  }

  if (side === "right") {
    // Right column: Go To Jail(18) is row 1 col 7, then 19-23 go top to bottom (rows 2-6)
    if (sideIndex === 0) return { row: 1, col: 7 }; // Go To Jail
    return { row: 1, col: 7, rowOffset: sideIndex };
  }

  return { row: 1, col: 1 };
}

export default function Board({
  boardSpaces,
  players,
  propertyOwnership,
  houseCount,
  currentPlayerIndex,
  children,
  onSpaceClick,
}) {
  const currentPlayer = players[currentPlayerIndex];

  return (
    <div className="w-full max-w-[700px] aspect-square">
      <div
        className="grid w-full h-full gap-px bg-slate-200"
        style={{
          gridTemplateColumns: "repeat(7, 1fr)",
          gridTemplateRows: "repeat(7, 1fr)",
        }}
      >
        {boardSpaces.map((space) => {
          const pos = getGridPosition(space);
          let row = pos.row;
          let col = pos.col;

          // Handle right side offsets
          if (space.side === "right" && space.sideIndex > 0) {
            row = 1 + space.sideIndex;
          }

          const ownerPlayer = propertyOwnership[space.id]
            ? players.find((p) => p.id === propertyOwnership[space.id])
            : null;

          return (
            <div
              key={space.id}
              className="h-full"
              style={{ gridRow: row, gridColumn: col }}
            >
              <BoardSpace
                space={space}
                owner={ownerPlayer}
                houses={houseCount[space.id] ?? 0}
                players={players}
                isCurrentSpace={
                  currentPlayer && currentPlayer.position === space.id
                }
                onSpaceClick={onSpaceClick}
              />
            </div>
          );
        })}

        {/* Center area: game controls */}
        <div
          style={{ gridRow: "2 / 7", gridColumn: "2 / 7" }}
          className="bg-emerald-50 flex items-center justify-center overflow-hidden"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
