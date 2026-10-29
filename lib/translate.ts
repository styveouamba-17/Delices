import { useEffect, useState } from "react";

const cache = new Map<string, string>();
const pending = new Map<string, Promise<string>>();

async function requestTranslation(text: string): Promise<string> {
  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|fr`,
    );
    const json = await response.json();
    const translated = json?.responseData?.translatedText;
    return typeof translated === "string" && translated.length > 0 ? translated : text;
  } catch (error) {
    console.error("Erreur de traduction:", error);
    return text;
  }
}

export function translateText(text: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return Promise.resolve(text);

  if (cache.has(trimmed)) {
    return Promise.resolve(cache.get(trimmed)!);
  }
  if (pending.has(trimmed)) {
    return pending.get(trimmed)!;
  }

  const promise = requestTranslation(trimmed).then((translated) => {
    cache.set(trimmed, translated);
    pending.delete(trimmed);
    return translated;
  });
  pending.set(trimmed, promise);
  return promise;
}

export function useTranslatedText(text?: string | null): string {
  const [translated, setTranslated] = useState(text ?? "");

  useEffect(() => {
    if (!text) {
      setTranslated("");
      return;
    }
    let cancelled = false;
    setTranslated(text);
    translateText(text).then((result) => {
      if (!cancelled) setTranslated(result);
    });
    return () => {
      cancelled = true;
    };
  }, [text]);

  return translated;
}
