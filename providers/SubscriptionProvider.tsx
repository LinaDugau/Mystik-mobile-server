import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/providers/AuthProvider";

interface SubscriptionState {
  isPremium: boolean;
  cardBack: string;
  activateSubscription: () => void;
  cancelSubscription: () => void;
  setCardBack: (back: string) => void;
}

export const [SubscriptionProvider, useSubscription] = createContextHook<SubscriptionState>(() => {
  const [isPremium, setIsPremium] = useState(false);
  const [cardBack, setCardBackState] = useState("purple");
  const { user } = useAuth();

  const getApiBaseOrEmpty = () => {
    const raw =
      process.env.EXPO_PUBLIC_API_URL ||
      process.env.EXPO_PUBLIC_API_BASE ||
      process.env.EXPO_PUBLIC_BACKEND_URL ||
      "";
    return raw.trim().replace(/\/$/, "");
  };

  useEffect(() => {
    loadSubscriptionFromLocal();
    loadCardBack();
  }, []);

  const loadSubscriptionFromLocal = async () => {
    try {
      const stored = await AsyncStorage.getItem("subscription");
      if (stored) {
        setIsPremium(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading subscription:", error);
    }
  };

  useEffect(() => {
    const loadPremiumFromServer = async () => {
      try {
        if (!user?.id) return;

        const apiBase = getApiBaseOrEmpty();
        if (!apiBase) return;

        const url = `${apiBase}/api/user/${encodeURIComponent(user.id)}/premium`;
        console.log("[PREMIUM API DEBUG] loadPremium:", { userId: user.id, url });
        const res = await fetch(url);
        const data = await res.json().catch(() => ({}));
        console.log("[PREMIUM API DEBUG] loadPremium response:", {
          userId: user.id,
          status: res.status,
          data,
        });
        if (res.ok && data?.ok) {
          setIsPremium(Boolean(data.isPremium));
          await AsyncStorage.setItem("subscription", JSON.stringify(Boolean(data.isPremium)));
        }
      } catch (e) {
        // Фоллбек оставляем локальным
        console.warn("[PREMIUM API DEBUG] loadPremium error:", e);
      }
    };

    loadPremiumFromServer();
  }, [user?.id]);

  const loadCardBack = async () => {
    try {
      const stored = await AsyncStorage.getItem("cardBack");
      if (stored) {
        setCardBackState(stored);
      }
    } catch (error) {
      console.error("Error loading card back:", error);
    }
  };

  const activateSubscription = async () => {
    try {
      const apiBase = getApiBaseOrEmpty();
      if (apiBase && user?.id) {
        const url = `${apiBase}/api/user/${encodeURIComponent(user.id)}/premium/activate`;
        console.log("[PREMIUM API DEBUG] activate:", { userId: user.id, url });
        const res = await fetch(url, {
          method: "POST",
        });
        const data = await res.json().catch(() => ({}));
        console.log("[PREMIUM API DEBUG] activate response:", {
          userId: user.id,
          status: res.status,
          data,
        });
        if (res.ok && data?.ok) {
          setIsPremium(true);
          await AsyncStorage.setItem("subscription", JSON.stringify(true));
          return;
        }
      }
    } catch {
      // ignore
      console.warn("[PREMIUM API DEBUG] activate error");
    }

    setIsPremium(true);
    await AsyncStorage.setItem("subscription", JSON.stringify(true));
  };

  const cancelSubscription = async () => {
    try {
      const apiBase = getApiBaseOrEmpty();
      if (apiBase && user?.id) {
        const url = `${apiBase}/api/user/${encodeURIComponent(user.id)}/premium/cancel`;
        console.log("[PREMIUM API DEBUG] cancel:", { userId: user.id, url });
        const res = await fetch(url, {
          method: "POST",
        });
        const data = await res.json().catch(() => ({}));
        console.log("[PREMIUM API DEBUG] cancel response:", {
          userId: user.id,
          status: res.status,
          data,
        });
        if (res.ok && data?.ok) {
          setIsPremium(false);
          setCardBackState("purple");
          await AsyncStorage.setItem("subscription", JSON.stringify(false));
          await AsyncStorage.setItem("cardBack", "purple");
          return;
        }
      }
    } catch {
      // ignore
      console.warn("[PREMIUM API DEBUG] cancel error");
    }

    setIsPremium(false);
    setCardBackState("purple");
    await AsyncStorage.setItem("subscription", JSON.stringify(false));
    await AsyncStorage.setItem("cardBack", "purple");
  };

  const setCardBack = async (back: string) => {
    setCardBackState(back);
    await AsyncStorage.setItem("cardBack", back);
  };

  return {
    isPremium,
    cardBack,
    activateSubscription,
    cancelSubscription,
    setCardBack,
  };
});