import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ReadingsData {
  count: number;
  date: string;
}

export function useTarotReadings() {
  const [readingsToday, setReadingsToday] = useState(0);
  const MAX_FREE_READINGS = 3;

  useEffect(() => {
    loadReadings();
  }, []);

  const loadReadings = async () => {
    try {
      const stored = await AsyncStorage.getItem("tarotReadings");
      const today = new Date().toDateString();
      
      if (stored) {
        const data: ReadingsData = JSON.parse(stored);
        if (data.date === today) {
          setReadingsToday(data.count);
        } else {

          setReadingsToday(0);
        }
      }
    } catch (error) {
      console.error("Error loading readings:", error);
    }
  };

  const performReading = async () => {
    const today = new Date().toDateString();
    const newCount = readingsToday + 1;
    
    const data: ReadingsData = {
      count: newCount,
      date: today,
    };
    
    await AsyncStorage.setItem("tarotReadings", JSON.stringify(data));
    setReadingsToday(newCount);
  };

  const canRead = readingsToday < MAX_FREE_READINGS;

  return { readingsToday, canRead, performReading };
}