import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUserStore, useMatchStore } from "../utils/zustand";

import { api } from "../utils/axios";
import { useScore } from "../utils/zustand";
import { pusher } from "../utils/pusher";

export default function Result() {
  const [isVisible, setIsVisible] = useState(false);
  const { playerId } = useUserStore();
  const {  matchRoomId } = useMatchStore();
  const {
    matchOpponentWpm,
    matchOpponentCorrect,
    matchOpponentError,
    setMatchOpponentDetails,
    matchPlayerWpm,
    matchPlayerCorrect,
    matchPlayerError
  } = useScore();

  const navigate = useNavigate();
  const channel = pusher.subscribe(`${matchRoomId}`);

  // Cleanup function
  const cleanup = () => {


    // Unsubscribe from channel
    if (channel) {
      channel.unbind_all();
      channel.unsubscribe();
    }

    // Clear match data from Zustand store
    useMatchStore.getState().setMatchDetails({
      playerId: null,
      roomId: null,
      opponentId: null
    });

    // Clear score data from Zustand store
    useScore.getState().setMatchPlayerDetails({
      matchPlayerWpm: null,
      matchPlayerCorrect: null,
      matchPlayerError: null
    });
    useScore.getState().setMatchOpponentDetails({
      matchOpponentWpm: null,
      matchOpponentCorrect: null,
      matchOpponentError: null
    });
    localStorage.removeItem('match-store');
    localStorage.removeItem('participant-score');

  };

  useEffect(() => {
    const updateScore = async () => {
      await api.post("/update-score", {
        roomId: matchRoomId,
        playerId: playerId,  // Send our own ID
        score: {
          wpm: matchPlayerWpm,
          correct: matchPlayerCorrect,
          error: matchPlayerError,
        },
      });
    };
    updateScore();

    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  channel.bind("update-score", (data) => {
    if (data.playerId !== playerId) {
      setMatchOpponentDetails({
        matchOpponentWpm: data.score.wpm,
        matchOpponentCorrect: data.score.correct,
        matchOpponentError: data.score.error,
      });
    }
  });

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  // Cleanup when match ends (when navigating away)
  const handleMatchEnd = () => {
    cleanup();
    navigate("/find");
  };

  const Stamp = ({ type, color }) => (
    <div className={`absolute -top-12 -right-4 rotate-[15deg] opacity-80 mix-blend-multiply select-none pointer-events-none`}
    >
      <div
        className={`w-28 h-28 rounded-full border-[2px] ${color} flex flex-col items-center justify-center text-center tracking-wider font-bold text-xs p-2`}
        style={{
          background: `radial-gradient(circle, ${color === 'border-green-400' ? 'rgba(34,197,94,0.07)' : 'rgba(239,68,68,0.07)'} 0%, ${color === 'border-green-400' ? 'rgba(34,197,94,0.02)' : 'rgba(239,68,68,0.02)'} 100%)`,
          fontFamily: "monospace",
          textShadow: "1px 1px 0 #000",
          boxShadow: `inset 0 0 6px ${color === 'border-green-400' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}, 0 0 0 1px ${color === 'border-green-400' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`,
        }}
      >
        <div className={`text-center uppercase tracking-wider ${color === 'border-green-400' ? 'text-green-400' : 'text-red-400'}`}>
          <div className="text-[10px] font-bold mb-1">Verified by</div>
          <div className="text-sm font-extrabold tracking-tight whitespace-nowrap">
            {type === 'player' ? 'Chimp & Co.' : 'Chimp & Co.'}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-[#0f0f0f] text-[#f5f5f5] font-mono flex items-center justify-center p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">

        <div className={`rounded-xl p-6 shadow-xl border border-yellow-400/20 transition-all duration-500 transform relative ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <Stamp type="player" color="border-green-400" />
          <h1 className="text-2xl font-bold text-green-400 text-center mb-6">
            Your Report
          </h1>

          <div className="grid grid-cols-3 gap-4">
            <div className={`bg-[#2a2a2a] rounded-lg p-4 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-lg border border-yellow-400/20 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <div className="text-2xl mb-1 text-green-400">⚡</div>
              <div className="text-2xl font-bold text-yellow-400 mb-1">{matchPlayerWpm || 0}</div>
              <div className="text-[#bbbbbb] text-xs">WPM</div>
            </div>
            <div className={`bg-[#2a2a2a] rounded-lg p-4 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-lg border border-yellow-400/20 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <div className="text-2xl mb-1 text-green-400">✓</div>
              <div className="text-2xl font-bold text-yellow-400 mb-1">{matchPlayerCorrect || 0}</div>
              <div className="text-[#bbbbbb] text-xs">Correct</div>
            </div>
            <div className={`bg-[#2a2a2a] rounded-lg p-4 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-lg border border-yellow-400/20 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <div className="text-2xl mb-1 text-green-400">×</div>
              <div className="text-2xl font-bold text-yellow-400 mb-1">{matchPlayerError || 0}</div>
              <div className="text-[#bbbbbb] text-xs">Errors</div>
            </div>
          </div>
        </div>

        {/* Opponent Card */}
        <div className={`rounded-xl p-6 shadow-xl border border-yellow-400/20 transition-all duration-500 transform relative ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <Stamp type="opponent" color="border-red-400" />
          <h1 className="text-2xl font-bold text-red-400 text-center mb-6">
            Opponent's Report
          </h1>

          <div className="grid grid-cols-3 gap-4">
            <div className={`bg-[#2a2a2a] rounded-lg p-4 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-lg border border-yellow-400/20 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <div className="text-2xl mb-1 text-red-400">⚡</div>
              <div className="text-2xl font-bold text-yellow-400 mb-1">{matchOpponentWpm || 0}</div>
              <div className="text-[#bbbbbb] text-xs">WPM</div>
            </div>
            <div className={`bg-[#2a2a2a] rounded-lg p-4 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-lg border border-yellow-400/20 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <div className="text-2xl mb-1 text-red-400">✓</div>
              <div className="text-2xl font-bold text-yellow-400 mb-1">{matchOpponentCorrect || 0}</div>
              <div className="text-[#bbbbbb] text-xs">Correct</div>
            </div>
            <div className={`bg-[#2a2a2a] rounded-lg p-4 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-lg border border-yellow-400/20 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <div className="text-2xl mb-1 text-red-400">×</div>
              <div className="text-2xl font-bold text-yellow-400 mb-1">{matchOpponentError || 0}</div>
              <div className="text-[#bbbbbb] text-xs">Errors</div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
        <button
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-2 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95 text-sm"
          onClick={handleMatchEnd}
        >
          Another try chimp?
        </button>
      </div>
    </div>
  );
}
