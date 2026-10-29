import * as SQLite from "expo-sqlite";
import { create } from "zustand";

const db = SQLite.openDatabaseSync("delices.db");

db.execSync(
  `CREATE TABLE IF NOT EXISTS favorites (
    meal_id TEXT PRIMARY KEY NOT NULL,
    created_at INTEGER NOT NULL
  );`,
);

function loadFavorites(): string[] {
  const rows = db.getAllSync<{ meal_id: string }>(
    "SELECT meal_id FROM favorites ORDER BY created_at DESC",
  );
  return rows.map((row) => row.meal_id);
}

type FavoritesState = {
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
};

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: loadFavorites(),
  toggleFavorite: (id: string) => {
    const current = get().favorites;
    const isFavorite = current.includes(id);

    if (isFavorite) {
      db.runSync("DELETE FROM favorites WHERE meal_id = ?", id);
    } else {
      db.runSync(
        "INSERT OR IGNORE INTO favorites (meal_id, created_at) VALUES (?, ?)",
        id,
        Date.now(),
      );
    }

    const updated = isFavorite
      ? current.filter((favoriteId) => favoriteId !== id)
      : [id, ...current];

    set({ favorites: updated });
  },
  isFavorite: (id: string) => get().favorites.includes(id),
}));
