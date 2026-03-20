import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";

interface QuizResultPayload {
  answers: number[];
  result: any;
}

interface UseQuizResultsReturn {
  result: any;
  loading: boolean;
  error: string | null;
  saveResult: (payload: QuizResultPayload) => Promise<void>;
  clearResult: () => void;
  reload: () => Promise<void>;
}

export function useQuizResults(quizId: string): UseQuizResultsReturn {
  const { user } = useAuth();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getApiBase = () => {
    const raw =
      process.env.EXPO_PUBLIC_API_URL ||
      process.env.EXPO_PUBLIC_API_BASE ||
      process.env.EXPO_PUBLIC_BACKEND_URL ||
      "";
    const cleaned = raw.trim().replace(/\/$/, "");
    return cleaned || "http://localhost:3001";
  };

  const loadResult = async () => {
    if (!user?.id || !quizId) return;

    try {
      setLoading(true);
      setError(null);

      const apiBase = getApiBase();
      const response = await fetch(
        `${apiBase}/api/user/${encodeURIComponent(user.id)}/quiz/${encodeURIComponent(
          quizId
        )}/result`
      );
      const data = await response.json().catch(() => ({}));

      if (response.status === 404) {
        setResult(null);
        return;
      }

      if (response.ok && data?.ok && data.result) {
        setResult(data.result.result);
      } else if (!response.ok) {
        setError(data.error || "Ошибка загрузки результата теста");
      }
    } catch (e) {
      console.error("Error loading quiz result:", e);
      setError("Ошибка сети при загрузке результата теста");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id && quizId) {
      loadResult();
    }
  }, [user?.id, quizId]);

  const saveResult = async ({ answers, result: calculatedResult }: QuizResultPayload) => {
    if (!user?.id || !quizId) {
      setError("Пользователь не авторизован");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const apiBase = getApiBase();
      const response = await fetch(
        `${apiBase}/api/user/${encodeURIComponent(user.id)}/quiz/${encodeURIComponent(
          quizId
        )}/result`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            answers,
            result: calculatedResult,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.ok && data?.ok) {
        setResult(calculatedResult);
      } else {
        setError(data.error || "Ошибка сохранения результата теста");
      }
    } catch (e) {
      console.error("Error saving quiz result:", e);
      setError("Ошибка сети при сохранении результата теста");
    } finally {
      setLoading(false);
    }
  };

  const clearResult = () => {
    setResult(null);
    setError(null);
  };

  return {
    result,
    loading,
    error,
    saveResult,
    clearResult,
    reload: loadResult,
  };
}