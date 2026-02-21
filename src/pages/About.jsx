import { useState } from 'react';

const SECTIONS = [
  {
    title: 'How to Play',
    content: `Roll the dice and move your token around the board. When you land on an unowned property, you can buy it. When you land on a property owned by another player, you pay them rent. The goal is to be the last player standing—or the richest when the turn limit is reached.`,
  },
  {
    title: 'Properties & Houses',
    content: `There are 6 color groups with 2 properties each. When you own both properties in a color group, you have a monopoly! You can then build houses (up to 5 per property) to increase the rent dramatically. House cost is half the property price.`,
  },
  {
    title: 'Special Spaces',
    content: `GO: Collect $200 every time you pass or land on GO. Jail: Just visiting unless you're sent there. Go To Jail: Go directly to jail—do not pass GO. Free Parking: Nothing happens, take a breather. Chance & Community Chest: Draw a card for a surprise effect!`,
  },
  {
    title: 'Jail Rules',
    content: `If you're in jail, you can pay $50 to get out, or try to roll doubles (max 3 attempts). After 3 failed attempts, you must pay. You cannot buy properties or collect rent while in jail.`,
  },
  {
    title: 'Winning the Game',
    content: `A player is eliminated when they go bankrupt (money drops below $0 after paying rent). The game also ends after 50 turns—the richest remaining player wins. If you're the last player standing, you win immediately!`,
  },
];

function CollapsibleSection({ title, content, isOpen, onToggle }) {
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors font-semibold flex items-center justify-between"
      >
        {title}
        <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          &#9660;
        </span>
      </button>
      {isOpen && (
        <div className="px-4 py-3 text-slate-600 leading-relaxed">
          {content}
        </div>
      )}
    </div>
  );
}

export default function About() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="flex-1 max-w-2xl mx-auto p-8 w-full">
      <h1 className="text-3xl font-bold mb-6">About the Game</h1>
      <p className="text-slate-600 mb-6">
        Fetch With Catch is a simplified version of the classic Monopoly board game.
        Play against 2 AI opponents on a 24-space board.
      </p>
      <div className="flex flex-col gap-2">
        {SECTIONS.map((section, i) => (
          <CollapsibleSection
            key={section.title}
            title={section.title}
            content={section.content}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
          />
        ))}
      </div>
    </div>
  );
}
