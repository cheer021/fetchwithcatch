import Modal from '../Modal';
import BOARD_SPACES, { GROUP_COLORS } from '../../game/board-config';

export default function BuyModal({ isOpen, spaceId, player, onBuy, onDecline }) {
  if (!isOpen || spaceId == null) return null;

  const space = BOARD_SPACES[spaceId];
  if (!space) return null;

  const groupColor = space.group ? GROUP_COLORS[space.group] : '#666';

  return (
    <Modal isOpen={isOpen} title="Property Available!">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-16 rounded"
            style={{ backgroundColor: groupColor }}
          />
          <div>
            <h3 className="font-bold text-lg">{space.name}</h3>
            <p className="text-slate-600">Price: <span className="font-semibold">${space.price}</span></p>
            <p className="text-slate-500 text-sm">Base rent: ${space.baseRent}</p>
          </div>
        </div>

        <p className="text-sm text-slate-600">
          Your cash: <span className="font-semibold">${player?.money ?? 0}</span>
          {player && <span className="text-slate-400"> (after: ${player.money - space.price})</span>}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onBuy}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            Buy for ${space.price}
          </button>
          <button
            onClick={onDecline}
            className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2 rounded-lg transition-colors"
          >
            Pass
          </button>
        </div>
      </div>
    </Modal>
  );
}
