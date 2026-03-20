import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SubscriptionProvider } from "@/providers/SubscriptionProvider";
import { UserProvider } from "@/providers/UserProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import NoInternetScreen from "@/components/NoInternetScreen";
import { checkApiReachable, getApiBaseFromEnv } from "@/utils/apiReachability";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Назад", headerStyle: { backgroundColor: "#1a1a2e" }, headerTintColor: "#fff" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="auth"
        options={{
          title: "Вход",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="subscription"
        options={{
          presentation: "modal",
          title: "Премиум подписка",
        }}
      />
      <Stack.Screen
        name="quiz/[id]"
        options={{
          presentation: "modal",
          title: "Тест",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [gate, setGate] = useState<{ mode: "checking" | "offline" | "online"; checkedUrl?: string; error?: string | null }>({
    mode: "checking",
    checkedUrl: undefined,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function runCheck() {
      setGate({ mode: "checking" });

      const apiBase = getApiBaseFromEnv();
      if (!apiBase) {
        // Если переменная окружения не задана — не блокируем приложение.
        if (!cancelled) setGate({ mode: "online" });
        return;
      }

      const result = await checkApiReachable(apiBase, 5000);
      if (cancelled) return;

      if (result.reachable) {
        setGate({ mode: "online" });
      } else {
        setGate({ mode: "offline", checkedUrl: result.checkedUrl, error: result.error ?? null });
      }
    }

    runCheck();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (gate.mode !== "checking") {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [gate.mode]);

  const onRetry = async () => {
    let cancelled = false;
    setGate({ mode: "checking" });

    const apiBase = getApiBaseFromEnv();
    if (!apiBase) {
      if (!cancelled) setGate({ mode: "online" });
      return;
    }

    const result = await checkApiReachable(apiBase, 5000);
    if (cancelled) return;

    if (result.reachable) {
      setGate({ mode: "online" });
    } else {
      setGate({ mode: "offline", checkedUrl: result.checkedUrl, error: result.error ?? null });
    }
  };

  if (gate.mode !== "online") {
    return <NoInternetScreen mode={gate.mode} onRetry={onRetry} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <UserProvider>
            <SubscriptionProvider>
              <RootLayoutNav />
            </SubscriptionProvider>
          </UserProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}