export function getApiBaseFromEnv(): string | null {
  const raw =
    process.env.EXPO_PUBLIC_API_URL ||
    process.env.EXPO_PUBLIC_API_BASE ||
    process.env.EXPO_PUBLIC_BACKEND_URL ||
    "";

  const cleaned = raw.trim().replace(/\/$/, "");
  return cleaned || null;
}

export async function checkApiReachable(
  apiBase: string,
  timeoutMs = 5000
): Promise<{ reachable: boolean; error?: string; checkedUrl: string }> {
  const checkedUrl = `${apiBase}/api/quizzes`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Нам важно не содержимое ответа, а сам факт, что сервер доступен.
    // Поэтому считаем "reachable" даже при HTTP 404/500, если fetch дошёл до ответа.
    await fetch(checkedUrl, {
      method: "GET",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    return { reachable: true, checkedUrl };
  } catch (e: any) {
    const name = e?.name;
    const message = e?.message;

    if (name === "AbortError") {
      return {
        reachable: false,
        checkedUrl,
        error: "Таймаут. Сервер не отвечает.",
      };
    }

    return {
      reachable: false,
      checkedUrl,
      error: message || "Ошибка сети. Проверьте интернет-соединение.",
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

