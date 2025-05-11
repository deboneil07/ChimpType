import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useEffect, useState } from "react";
import db from "../utils/supabase";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  const { getAccessToken } = useKindeAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = await getAccessToken();
        const res = await fetch(
          `https://chimptype.kinde.com/oauth2/v2/user_profile`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        const data = await res.json();
        const findUser = await db.getUser(data.email);

        if (findUser.success.length === 0) {
          const newUser = await db.createUser(data.email);

          if (newUser.success) {
            setUser({
              id: newUser.success.id,
              email: newUser.success.email,
              elo: newUser.success.elo
            });
          }
        } else {
          if (findUser.success) {
            setUser({
              id: findUser.success[0].id,
              elo: findUser.success[0].elo,
              email: findUser.success[0].email
            });
          }
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, [getAccessToken]);

  return {
    user,
    error,
  };
}
