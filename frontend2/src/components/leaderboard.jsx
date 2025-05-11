import { useEffect, useState } from "react";
import useLeaderBoard from "../hooks/leaderboard";

export default function LeaderBoard() {
  const { players, error } = useLeaderBoard();
  const [leaderBoardPlayers, setLeaderBoardPlayers] = useState(null);
  
  useEffect(() => {
    if(players) {
      setLeaderBoardPlayers(players);
    }
  }, [players]);

  if (error || (leaderBoardPlayers && leaderBoardPlayers.length === 0)) {
    return (
      <div className="bg-[#1a1a1a] border border-yellow-400/20 rounded-xl p-4 w-80 h-120 flex flex-col items-center justify-center space-y-6">
        <div className="w-32 h-32 relative">
          <img
            src="/chimp-logo.webp"
            alt="Chimp Logo"
            className="w-full h-full opacity-50"
          />
        </div>
        <div className="text-center space-y-4">
          <p className="text-[#bbbbbb] text-lg">
            No top chimps arrived yet!
          </p>
        </div>
      </div>
    );
  }

  if (!leaderBoardPlayers) {
    return (
      <div className="bg-[#1a1a1a] border border-yellow-400/20 rounded-xl p-4 w-80 h-120 flex items-center justify-center">
        <div className="w-32 h-32 relative">
          <img
            src="/chimp-logo.webp"
            alt="Chimp Logo"
            className="w-full h-full opacity-50"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-yellow-300 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] border border-yellow-400/20 rounded-xl p-4 w-80 h-120 flex flex-col">
      <div className="text-yellow-400 text-xl font-bold mb-4 text-center">
        Top Chimps
      </div>
      
      <div className="flex justify-between text-yellow-400/60 text-sm mb-2 px-2">
        <span>Chimps</span>
        <span>ELO</span>
      </div>
      
      <div className="overflow-y-auto flex-1 space-y-2 pr-2 custom-scrollbar">
        {leaderBoardPlayers.map((player, index) => (
          <div 
            key={player.id}
            className="bg-[#2a2a2a] rounded-lg p-3 flex justify-between items-center hover:bg-[#333333] transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-yellow-400/40 text-sm w-6">#{index + 1}</span>
              <span className="text-yellow-400 font-mono text-sm truncate max-w-[150px]">
                {player.id}
              </span>
            </div>
            <span className="text-yellow-400 font-bold">{player.elo}</span>
          </div>
        ))}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a1a1a;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4d4d00;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #666600;
        }
      `}</style>
    </div>
  );
}