import { useEffect, useRef } from 'react';

export default function GameLog({ log }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log.length]);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 h-40 overflow-y-auto text-xs">
      {log.length === 0 ? (
        <p className="text-slate-400 italic">Game events will appear here...</p>
      ) : (
        log.map((entry, i) => (
          <div
            key={i}
            className="py-0.5 border-b border-slate-100 last:border-0"
          >
            <span className="text-slate-400 mr-1">T{entry.turn}</span>
            {entry.message}
          </div>
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
}
