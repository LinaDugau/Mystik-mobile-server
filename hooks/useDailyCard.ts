import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TAROT_CARDS, TarotCard } from "@/constants/tarot";

interface DailyCardData {
  card: TarotCard;
  date: string;
}

export function useDailyCard() {
  const [card, setCard] = useState<TarotCard | null>(null);
  const [isNewDay, setIsNewDay] = useState(false);

  useEffect(() => {
    loadDailyCard();
  }, []);

  const loadDailyCard = async () => {
    try {
      const stored = await AsyncStorage.getItem("dailyCard");
      const today = new Date().toDateString();
      
      if (stored) {
        const data: DailyCardData = JSON.parse(stored);
        if (data.date === today) {
          console.log("[DAILY CARD DEBUG] loaded cached card:", {
            date: data.date,
            cardName: data.card?.name,
            cardNumber: data.card?.number,
          });
          setCard(data.card);
          setIsNewDay(false);
        } else {
          console.log("[DAILY CARD DEBUG] daily card expired. storedDate:", data.date, "today:", today);
          setIsNewDay(true);
        }
      } else {
        console.log("[DAILY CARD DEBUG] no cached daily card. today:", today);
        setIsNewDay(true);
      }
    } catch (error) {
      console.error("Error loading daily card:", error);
      setIsNewDay(true);
    }
  };

  const drawDailyCard = () => {
    const randomCard = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
    const today = new Date().toDateString();
    
    const data: DailyCardData = {
      card: randomCard,
      date: today,
    };
    
    AsyncStorage.setItem("dailyCard", JSON.stringify(data));
    console.log("[DAILY CARD DEBUG] drew new daily card:", {
      date: today,
      cardName: randomCard?.name,
      cardNumber: randomCard?.number,
    });
    setCard(randomCard);
    setIsNewDay(false);
    
    return randomCard;
  };

  return { card, isNewDay, drawDailyCard };
}