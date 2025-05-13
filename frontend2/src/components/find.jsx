import { useState, useRef, useEffect } from "react";
import { pusher } from "../utils/pusher";
import { api } from "../utils/axios";
import Play from "./play";
import {
  useCodeStore,
  useStore,
  useUserStore,
  useMatchStore,
  useScore,
} from "../utils/zustand";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useAuth } from "../hooks/auth";
import LeaderBoard from "./leaderboard";
import BananaBackground from "./BananaBackground";

const MobileSidebar = ({ isOpen, onClose, children }) => {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-80 bg-[#1a1a1a] border-l border-yellow-400/20 transform transition-transform duration-300 ease-in-out z-50 lg:hidden
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-4 flex justify-between items-center border-b border-yellow-400/20">
          <h2 className="text-yellow-400 font-bold">Leaderboard</h2>
          <button
            onClick={onClose}
            className="text-yellow-400/60 hover:text-yellow-400 hover:bg-yellow-400/10 rounded-full p-2 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="h-[calc(100%-4rem)] overflow-y-auto">{children}</div>
      </div>
    </>
  );
};

const DifficultyModal = ({ isOpen, onClose, onSelectDifficulty }) => {
  if (!isOpen) return null;

  const difficulties = [
    { level: "Noob Chimp", emoji: "🐒", description: "For the newborn chimps!" },
    { level: "Veteran Orangutan", emoji: "🦧", description: "For battle hardened chimps!" },
    { level: "King Kong", emoji: "🦍", description: "Proceed with caution!" }
  ];

  return (
    <div className="fixed inset-0 z-[60]">
      <div
        className="absolute inset-0 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-[#1a1a1a] border-2 border-yellow-400/20 rounded-xl p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-yellow-400">Choose Your Challenge</h2>
            <button
              onClick={onClose}
              className="text-yellow-400/60 hover:text-yellow-400 hover:bg-yellow-400/10 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mb-4 flex items-center gap-2 text-yellow-300 text-sm font-semibold">
            <span className="text-lg text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="inline w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M4.93 19h14.14c1.05 0 1.65-1.14 1.13-2.05l-7.07-12.25c-.52-.91-1.74-.91-2.26 0L3.8 16.95c-.52.91.08 2.05 1.13 2.05z" />
              </svg>
            </span>
            <span>Matches against bots do <span className="underline text-red-500">not</span> affect your ELO.</span>
          </div>
          <div className="space-y-4">
            {difficulties.map(({ level, emoji, description }) => (
              <button
                key={level}
                onClick={() => onSelectDifficulty(level)}
                className="w-full bg-[#2a2a2a] hover:bg-[#333333] border border-yellow-400/20 rounded-lg p-4 text-left transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{emoji}</span>
                  <div>
                    <h3 className="text-yellow-400 font-bold capitalize group-hover:text-yellow-300">
                      {level}
                    </h3>
                    <p className="text-[#bbbbbb] text-sm">{description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function FindMatch() {
  const { logout } = useKindeAuth();

  const { user, error } = useAuth();

  const { setStats } = useUserStore();
  const { setMatchOpponentDetails } = useScore();

  const { setMatchDetails } = useMatchStore();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // const [type, setType] = useState(null);

  useEffect(() => {
    if (user) {
      setStats({ id: user.id, email: user.email, elo: user.elo });
    }
  }, [user]);

  const [playerId, setPlayerId] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [opponentId, setOpponentId] = useState(null);
  const [showCountdown, setShowCountdown] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [showContent, setShowContent] = useState(false);

  const [gameType, setGameType] = useState("");

  const { setTimer } = useStore();
  const { setCode } = useCodeStore();
  const channelRef = useRef(null);

  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [difficulty, setDifficulty] = useState(null);

  useEffect(() => {
    setShowContent(true);
  }, []);

  async function findBot(difficultyLevel) {
    setDifficulty(difficultyLevel);
    const newPlayerId = "bot-chimp-" + user.id;
    setPlayerId(newPlayerId);

    try {
      const response = await api.post("/bot-find-match", {
        playerId: newPlayerId,
        difficulty: difficultyLevel
      });

      console.log(response)

      if(response.data.matched) {
        const newRoomId = response.data.roomId;
        const newOpponentId = response.data.opponentId;

        setCode(response.data?.randomBlock.code);
        console.log(response.data)
        setMatchOpponentDetails({
          matchOpponentWpm: response.data.botScore.wpm,
          matchOpponentCorrect: response.data.botScore.correct,
          matchOpponentError: response.data.botScore.error,
        })

        setRoomId(newRoomId);
        setOpponentId(newOpponentId);
        // console.log(newRoomId, newOpponentId, newPlayerId);

        subscribeToRoom(newRoomId, newPlayerId, newOpponentId, 'bot');
      }

    } catch(error) {
      console.error("Matchmaking failed", error);
    }
  }

  async function findMatch() {
    // setType("user")
    const newPlayerId = "chimp-" + user.id;
    setPlayerId(newPlayerId);

    try {
      const response = await api.post("/find-match", {
        playerId: newPlayerId,
      });

      if (response.data.matched) {
        const newRoomId = response.data.roomId;
        const newOpponentId = response.data.opponentId;

        setRoomId(newRoomId);
        setOpponentId(newOpponentId);

        subscribeToRoom(newRoomId, newPlayerId, newOpponentId, 'user');
      } else {
        waitForMatch(newPlayerId);
      }
    } catch (error) {
      console.error("Matchmaking failed", error);
    }
  }

  function waitForMatch(tempPlayerId) {
    const tempRoom = `temp-${tempPlayerId}`;
    const tempChannel = pusher.subscribe(tempRoom);

    tempChannel.bind("match-start", (data) => {
      const newRoomId = data.roomId;
      const newOpponentId = data.players.find((id) => id !== tempPlayerId);

      setRoomId(newRoomId);
      setOpponentId(newOpponentId);

      setCode(data.randomBlock.code);

      pusher.unsubscribe(tempRoom);
      subscribeToRoom(newRoomId, tempPlayerId, newOpponentId);
    });
  }

  function subscribeToRoom(room, player, opponent, type) {
    const channel = pusher.subscribe(room);
    channelRef.current = channel;

    console.log(room, player, opponent)

    setMatchDetails({
      playerId: player,
      roomId: room,
      opponentId: opponent,
    });

    type === 'bot' ? setGameType('bot') : setGameType('user')

    if(type === 'bot') {
      console.log("before randomblock receive")
      channel.bind("bot-match-start")
    }
    else {
      channel.bind("match-start");
    }



    channel.bind("timer-update", (data) => {
      setTimer(data.timeLeft);
    });

    channel.bind("code-block", (data) => {
      setCode(data?.randomBlock.code);
    });
  }

  useEffect(() => {
    if (playerId && opponentId && roomId) {
      setShowCountdown(true);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(interval);
            setShowCountdown(false);
            setGameStarted(true);
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [playerId, opponentId, roomId]);

  if (gameStarted) {
    return <Play playerId={playerId} opponentId={opponentId} roomId={roomId} type={gameType} />;
  }

  return (
    <div className="fixed inset-0 bg-[#0f0f0f] text-[#f5f5f5] font-mono flex flex-col items-center justify-center p-6">
      <BananaBackground />
      {error ? (
        <div className="flex flex-col items-center justify-center space-y-6">
          <img src="/chimp-logo.webp" alt="Chimp Logo" className="w-60 h-60" />
          <div className="text-center space-y-4">
            <p className="text-[#bbbbbb] text-lg">
              Authentication? Never heard of her 🤔
            </p>
            <button
              onClick={() => (window.location.href = "/")}
              className="border-2 border-yellow-300 rounded-lg px-6 py-3 text-yellow-300 hover:bg-yellow-500 hover:text-black transition mt-4"
            >
              Back Home
            </button>
          </div>
        </div>
      ) : !user ? (
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="w-60 h-60 relative">
            <img
              src="/chimp-logo.webp"
              alt="Chimp Logo"
              className="w-full h-full opacity-50"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-yellow-300 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
          <div className="text-center space-y-4">
            <p className="text-[#bbbbbb] text-lg animate-pulse">
              Loading your profile...
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Top Bar - Always visible */}
          <div className="fixed top-0 left-0 right-0 bg-[#0f0f0f]/80 backdrop-blur-sm border-b border-yellow-400/20 z-30 px-4 py-2 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 border-2 border-yellow-300 rounded-lg px-4 py-2">
                <div className="text-yellow-300 font-semibold text-sm sm:text-base truncate max-w-[200px] sm:max-w-none">
                  {`chimp-${user.id}`}
                </div>
              </div>
            </div>

            {/* Leaderboard Toggle Button - Mobile Only */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors bg-yellow-400/10 hover:bg-yellow-400/20 rounded-lg px-3 py-2"
            >
              <span className="text-sm font-semibold">Top Chimps</span>
              <span className="text-xl">🐒</span>
            </button>
          </div>

          {/* Sign Out Button */}
          <div className="fixed bottom-4 left-4 text-xl font-bold text-yellow-300 text-center space-y-4">
            <button
              onClick={() => logout()}
              type="button"
              className="border-2 border-yellow-300 rounded-lg px-4 py-2 text-yellow-300 hover:bg-yellow-500 hover:text-black transition text-sm sm:text-base"
            >
              Sign out
            </button>
          </div>

          {/* Leaderboard - Desktop */}
          <div className="hidden lg:block fixed right-8 top-24">
            <LeaderBoard />
          </div>

          {/* Leaderboard - Mobile Sidebar */}
          <MobileSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          >
            <div className="p-4">
              <LeaderBoard />
            </div>
          </MobileSidebar>

          {/* Main Content */}
          <div
            className={`max-w-2xl w-full space-y-8 transition-all duration-700 transform mt-16
          ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-yellow-300">
                Find Your Match
              </h1>
            </div>

            <div className="flex justify-center gap-4">
              <button
                disabled={playerId}
                onClick={findMatch}
                className="bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-black font-bold px-8 py-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95 text-xl"
              >
                {playerId ? "Finding Match..." : "Find Match"}
              </button>

              <button
                disabled={playerId}
                onClick={() => setShowDifficultyModal(true)}
                className="disabled:opacity-50 text-yellow-400 border-2 border-yellow-400 font-bold px-8 py-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95 text-xl"
              >
                {playerId ? "Finding Bot..." : "Challenge Bot"}
              </button>
            </div>

            <DifficultyModal
              isOpen={showDifficultyModal}
              onClose={() => setShowDifficultyModal(false)}
              onSelectDifficulty={(level) => {
                setShowDifficultyModal(false);
                findBot(level);
              }}
            />

            {playerId && !opponentId && (
              <div className="text-center space-y-4">
                <div className="text-yellow-300 text-2xl font-bold animate-pulse">
                  Searching for opponent...
                </div>
                <div className="flex justify-center items-center gap-2 text-[#bbbbbb]">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
                <p className="text-sm text-[#bbbbbb]">Your ID: {playerId}</p>
              </div>
            )}

            {showCountdown && (
              <div className="text-center space-y-2">
                <div className="text-green-400 text-4xl font-bold animate-pulse">
                  {countdown}
                </div>
                <div className="text-[#bbbbbb]">Match starting...</div>
              </div>
            )}

            {roomId && (
              <div className="text-center space-y-3 text-[#bbbbbb] border-t border-yellow-400/20 pt-4">
                <div className="text-yellow-300 text-lg">Match Found!</div>
                <div className="flex justify-center gap-4 text-sm">
                  <span className="text-yellow-400">Room:</span> {roomId}
                </div>
                <div className="flex justify-center gap-4 text-sm">
                  <span className="text-yellow-400">You:</span> {playerId}
                </div>
                <div className="flex justify-center gap-4 text-sm">
                  <span className="text-yellow-400">Opponent:</span>{" "}
                  {opponentId}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
