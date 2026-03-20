import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import type { TarotSpread } from "@/constants/tarot";

type TarotCardApi = {
  id: string;
  number: string;
  name: string;
  symbol: string;
  meaning: string;
};

type TarotInterpretationApi = {
  position: string;
  card: TarotCardApi;
  interpretation: string;
};

type TarotReadingApi = {
  id: string;
  spread: TarotSpread;
  cards: (TarotCardApi & { position?: string })[];
  interpretations: TarotInterpretationApi[];
  createdAt: string;
};

function getApiBase(): string {
  const raw =
    process.env.EXPO_PUBLIC_API_URL ||
    process.env.EXPO_PUBLIC_API_BASE ||
    process.env.EXPO_PUBLIC_BACKEND_URL ||
    "";
  const cleaned = raw.trim().replace(/\/$/, "");
  return cleaned || "http://localhost:3001";
}

export function useTarotSpreads() {
  const [spreads, setSpreads] = useState<TarotSpread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpreads = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiBase = getApiBase();
        console.log("[TAROT API DEBUG] fetching spreads:", `${apiBase}/api/tarot/spreads`);

        const res = await fetch(`${apiBase}/api/tarot/spreads`);
        const data = await res.json().catch(() => ({}));

        if (data.ok) setSpreads(data.spreads);
        else setError(data.error || "Ошибка загрузки раскладов");
      } catch (e) {
        console.error("[TAROT API DEBUG] fetchSpreads error:", e);
        setError("Ошибка сети");
      } finally {
        setLoading(false);
      }
    };

    fetchSpreads();
  }, []);

  return { spreads, loading, error };
}

export function useTarotCards() {
  const [cards, setCards] = useState<TarotCardApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiBase = getApiBase();
        console.log("[TAROT API DEBUG] fetching cards:", `${apiBase}/api/tarot/cards`);

        const res = await fetch(`${apiBase}/api/tarot/cards`);
        const data = await res.json().catch(() => ({}));

        if (data.ok) setCards(data.cards);
        else setError(data.error || "Ошибка загрузки карт");
      } catch (e) {
        console.error("[TAROT API DEBUG] fetchCards error:", e);
        setError("Ошибка сети");
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  return { cards, loading, error };
}

export function useTarotReadingAPI() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createReading = async (spreadId: string, cardIds: string[]): Promise<TarotReadingApi | null> => {
    if (!user?.id) {
      setError("Пользователь не авторизован");
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const apiBase = getApiBase();

      console.log("[TAROT API DEBUG] createReading request:", {
        userId: user.id,
        spreadId,
        cardIds,
      });

      const res = await fetch(`${apiBase}/api/tarot/reading`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          spreadId,
          cardIds,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        console.log("[TAROT API DEBUG] createReading ok:", {
          readingId: data.reading?.id,
          interpretationsCount: data.reading?.interpretations?.length,
        });
        return data.reading as TarotReadingApi;
      }

      setError(data.error || "Ошибка создания гадания");
      console.warn("[TAROT API DEBUG] createReading failed:", { status: res.status, data });
      return null;
    } catch (e) {
      console.error("[TAROT API DEBUG] createReading error:", e);
      setError("Ошибка сети");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createReading, loading, error };
}

