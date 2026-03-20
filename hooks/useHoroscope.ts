import { useEffect, useState } from "react";

export type HoroscopePeriod = "today" | "week" | "month";

export interface HoroscopeData {
  sign: string;
  text: string;
  date: string; // YYYY-MM-DD
  period?: "week" | "month";
  weekRange?: string;
  monthRange?: string;
}

function getApiBase(): string {
  const raw =
    process.env.EXPO_PUBLIC_API_URL ||
    process.env.EXPO_PUBLIC_API_BASE ||
    process.env.EXPO_PUBLIC_BACKEND_URL ||
    "";
  const cleaned = raw.trim().replace(/\/$/, "");
  // Для эмулятора/локальной разработки: совместимо с mystik-web server.
  return cleaned || "http://localhost:3001";
}

function mapRuZodiacToEn(zodiacSign: string): string {
  const signMapping: Record<string, string> = {
    Овен: "aries",
    Телец: "taurus",
    Близнецы: "gemini",
    Рак: "cancer",
    Лев: "leo",
    Дева: "virgo",
    Весы: "libra",
    Скорпион: "scorpio",
    Стрелец: "sagittarius",
    Козерог: "capricorn",
    Водолей: "aquarius",
    Рыбы: "pisces",
  };

  return signMapping[zodiacSign] || zodiacSign.toLowerCase();
}

export function useHoroscope(zodiacSign: string, period: HoroscopePeriod = "today") {
  const [horoscope, setHoroscope] = useState<HoroscopeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const fetchHoroscope = async () => {
      if (!zodiacSign) {
        setHoroscope(null);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const apiBase = getApiBase();
        if (typeof window !== "undefined" && window.location?.protocol === "https:" && apiBase.startsWith("http://")) {
          // В Expo Web через tunnel страница часто грузится по https, а http API браузер блокирует (mixed content).
          throw new Error("WEB_HTTPS_HTTP_MIXED_CONTENT");
        }
        const englishSign = mapRuZodiacToEn(zodiacSign);

        let apiUrl = `${apiBase}/api/horoscope/${encodeURIComponent(englishSign)}`;
        if (period === "week") apiUrl += "/weekly";
        if (period === "month") apiUrl += "/monthly";

        const timestamp = Date.now();
        const response = await fetch(`${apiUrl}?t=${timestamp}`);
        const data = await response.json().catch(() => ({}));

        if (isCancelled) return;

        if (response.ok && data?.ok && data?.horoscope) {
          setHoroscope(data.horoscope as HoroscopeData);
        } else {
          setHoroscope(null);
          setError(data?.error || "Ошибка получения гороскопа");
        }
      } catch (_) {
        if (!isCancelled) {
          setHoroscope(null);
          const apiBase = getApiBase();
          if (typeof window !== "undefined" && window.location?.protocol === "https:" && apiBase.startsWith("http://")) {
            setError("Для Web через tunnel нужен HTTPS API или запуск без tunnel (иначе браузер блокирует http-запрос).");
          } else if (apiBase.includes("localhost")) {
            setError("Ошибка сети. Для телефона/туннеля укажи EXPO_PUBLIC_API_URL (localhost на телефоне не твой ПК).");
          } else {
            setError("Ошибка сети");
          }
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchHoroscope();

    return () => {
      isCancelled = true;
    };
  }, [zodiacSign, period]);

  return { horoscope, loading, error };
}

