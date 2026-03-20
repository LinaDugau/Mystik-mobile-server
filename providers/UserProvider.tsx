import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface UserState {
  birthDate: string;
  setBirthDate: (date: string) => void;
  clearUserData: () => void;
}

export const [UserProvider, useUser] = createContextHook<UserState>(() => {
  const [birthDate, setBirthDateState] = useState("");

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const stored = await AsyncStorage.getItem("birthDate");
      if (stored) {
        setBirthDateState(stored);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const setBirthDate = async (date: string) => {
    setBirthDateState(date);
    await AsyncStorage.setItem("birthDate", date);
  };

  const clearUserData = async () => {
    setBirthDateState("");
    await AsyncStorage.removeItem("birthDate");
  };

  return {
    birthDate,
    setBirthDate,
    clearUserData,
  };
});