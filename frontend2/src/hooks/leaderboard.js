import { useEffect } from "react";
import { useState } from "react";
import db from "../utils/supabase";


export default function useLeaderBoard() {
  const [players, setPLayers] = useState(null);

  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const response = await db.getAll();
      if(response.success) {
        const sortedPlayers = response.success.sort((a, b) => b.elo - a.elo);
        setPLayers(sortedPlayers);
      } else {
        setError(response.error)
      }

    }

    fetchData()
  },[])

  return {
    players,
    error
  }

}
