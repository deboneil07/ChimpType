import { useState, useRef, useEffect } from "react";
import { pusher } from "../utils/pusher";
import { api } from "../utils/axios";
import Play from "./play";
import { useCodeStore, useStore, useUserStore, useMatchStore } from "../utils/zustand";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useAuth } from "../hooks/auth";
import LeaderBoard from "./leaderboard";

export default function FindMatch() {
  const { logout } = useKindeAuth();

  const { user, error } = useAuth();

  const { setStats } = useUserStore();

  const { setMatchDetails } = useMatchStore();

  useEffect(() => {
    if (user) {

      setStats({id: user.id, email: user.email, elo: user.elo})
    }
  }, [user])

  const [playerId, setPlayerId] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [opponentId, setOpponentId] = useState(null);
  const [showCountdown, setShowCountdown] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [showContent, setShowContent] = useState(false);

  const { setTimer } = useStore();
  const { setCode } = useCodeStore();
  const channelRef = useRef(null);

  useEffect(() => {
    setShowContent(true);
  }, []);

  async function findMatch() {
    const newPlayerId = "chimp-" + user.id
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

        subscribeToRoom(newRoomId, newPlayerId, newOpponentId);
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

  function subscribeToRoom(room, player, opponent) {

    const channel = pusher.subscribe(room);
    channelRef.current = channel;

    setMatchDetails({
      playerId: player,
      roomId: room,
      opponentId: opponent
    })


    channel.bind("match-start");



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
    return <Play playerId={playerId} opponentId={opponentId} roomId={roomId} />;
  }

  return (
    <div className="fixed inset-0 bg-[#0f0f0f] text-[#f5f5f5] font-mono flex flex-col items-center justify-center p-6">
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
          <div className="absolute top-4 left-4 flex items-center gap-3">
            <div className="flex items-center gap-3 border-2 border-yellow-300 rounded-lg px-4 py-2">
              <div className="text-yellow-300 font-semibold hidden sm:block">
                {`chimp-${user.id}`}
              </div>
            </div>
          </div>
          <div className="absolute bottom-4 left-4 text-xl font-bold text-yellow-300 text-center space-y-4">
            <button
              onClick={() => logout()}
              type="button"
              className="border-2 border-yellow-300 rounded-lg px-4 py-2 text-yellow-300 hover:bg-yellow-500 hover:text-black transition"
            >
              Sign out
            </button>
          </div>

          <div className="absolute right-8 top-10">
            <LeaderBoard />
          </div>

          <div
            className={`max-w-2xl w-full space-y-8 transition-all duration-700 transform
          ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-yellow-300">
                Find Your Match
              </h1>
            </div>

            <div className="flex justify-center">
              <button
                disabled={playerId}
                onClick={findMatch}
                className="bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-black font-bold px-12 py-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95 text-xl"
              >
                {playerId ? "Finding Match..." : "Find Match"}
              </button>
            </div>

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
