import { createClient } from "@supabase/supabase-js";
import { uniqueId } from "./uniqueId";

class DB {
  #supabase;
  constructor() {
    this.#supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_KEY,
    );
  }

  async createUser(email) {
    let id = uniqueId();
    let mail = email;

    const { error } = await this.#supabase
      .from("users")
      .insert({ id: id, email: mail });

    return error
      ? { success: null, error: error }
      : { success: { id: id, email: mail, elo: 0 }, error: null };
  }

  async getUser(email) {
    const { data, error } = await this.#supabase
      .from("users")
      .select()
      .eq("email", email);

    return error
      ? { success: null, error: error }
      : { success: data, error: null };
  }

  async updateUser(email, wpm, correctWords, errors, totalWords, prevElo) {
    correctWords = parseInt(correctWords);
    errors = parseInt(errors);
    totalWords = parseInt(totalWords);
    const accuracy = correctWords / totalWords;
    const newScore = parseInt((accuracy * wpm).toFixed(2));
    let score = newScore + parseInt(prevElo || 0);
    const { error } = await this.#supabase
      .from("users")
      .update({ elo: score })
      .eq("email", email);

    return error
      ? { success: null, error: error }
      : { success: score, error: null };
  }

  async getAll() {
    const { data, error } = await this.#supabase.from("users").select();

    return error
      ? { success: null, error: error }
      : { success: data, error: null };
  }
}

const db = new DB();

export default db;
