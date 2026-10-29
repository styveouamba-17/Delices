import { create } from "zustand";

const STORAGE_KEY = "delices_favorites";

function loadFavorites(): string[] {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites: string[]) {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // ignore storage errors (e.g. privacy mode)
  }
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
    const updated = isFavorite
      ? current.filter((favoriteId) => favoriteId !== id)
      : [id, ...current];

    saveFavorites(updated);
    set({ favorites: updated });
  },
  isFavorite: (id: string) => get().favorites.includes(id),
}));
