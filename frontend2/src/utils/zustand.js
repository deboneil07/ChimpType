import { create } from "zustand";
import { persist } from "zustand/middleware";


export const useStore = create((set) => ({
  timer: 0,
  setTimer: (time) => set(() => ({ timer: time })),
}));

export const useCodeStore = create((set) => ({
  code: "",
  setCode: (code) => set(() => ({ code: code })),
}));

export const useUserStore = create(
  persist(
    (set, get) => ({
      playerId: null,
      playerEmail: null,
      playerElo: null,
      setStats: (data) =>
        set({
          playerId: data.id,
          playerEmail: data.email,
          playerElo: data.elo ?? 0,
        }),

      setElo: (scoreToAdd) => {
        const newElo = (parseInt(get().playerElo) || 0) + parseInt(scoreToAdd);
        set({ playerElo: newElo });
      },
    }),
    {
      name: "user-store",
      getStorage: () => localStorage,
    },
  ),
);

export const useMatchStore = create(
  persist(
    (set) => ({
      matchPlayerId: null,
      matchRoomId: null,
      matchOpponentId: null,
      setMatchDetails: (data) =>
        set({
          matchPlayerId: data.playerId,
          matchRoomId: data.roomId,
          matchOpponentId: data.opponentId,
        }),
    }),
    {
      name: "match-store",
      getStorage: () => localStorage,
    },
  ),
);

export const useScore = create(
  persist(
    (set) => ({
      matchPlayerWpm: null,
      matchPlayerCorrect: null,
      matchPlayerError: null,
      matchOpponentWpm: null,
      matchOpponentCorrect: null,
      matchOpponentError: null,
      setMatchPlayerDetails: (data) =>
        set({
          matchPlayerWpm: data.matchPlayerWpm,
          matchPlayerCorrect: data.matchPlayerCorrect,
          matchPlayerError: data.matchPlayerError,
        }),

      setMatchOpponentDetails: (data) =>
        set({
          matchOpponentWpm: data.matchOpponentWpm,
          matchOpponentCorrect: data.matchOpponentCorrect,
          matchOpponentError: data.matchOpponentError,
        }),
    }),
    {
      name: "participant-score",
      getStorage: () => localStorage,
    },
  ),
);
