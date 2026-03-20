import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  type ColorValue
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Sparkles, Star, Grid3x3, BookCheck, Crown } from "lucide-react-native";
import { router } from "expo-router";
import { useSubscription } from "@/providers/SubscriptionProvider";
import { useDailyCard } from "@/hooks/useDailyCard";
import { useDatabase } from "@/hooks/useDatabase"; 
import { getDailyAdvice } from "@/constants/dailyAdvice";

export default function HomeScreen() {
  const { isPremium } = useSubscription();
  const { card } = useDailyCard();
  const { logHoroscopeClick, logTestClick, logTarotClick } = useDatabase(); 
  const dailyAdvice = getDailyAdvice();

  const features = [
    {
      icon: Sparkles,
      title: "Карта дня",
      description: card ? `Сегодня: ${card.name}` : "Узнай свою карту",
      route: "/tarot",
      gradient: ["#9c27b0", "#673ab7"],
      logAction: () => logTarotClick("daily"), 
    },
    {
      icon: Star,
      title: "Гороскоп",
      description: "Персональный прогноз",
      route: "/horoscope",
      gradient: ["#2196f3", "#3f51b5"],
      logAction: () => logHoroscopeClick("horoscope"),
    },
    {
      icon: Grid3x3,
      title: "Матрица судьбы",
      description: "Расшифруй свой код",
      route: "/horoscope?tab=matrix",
      gradient: ["#4caf50", "#8bc34a"] as readonly [ColorValue, ...ColorValue[]],
      logAction: () => logHoroscopeClick("matrix"), 
    },
    {
      icon: BookCheck,
      title: "Тесты",
      description: "Узнай больше о себе",
      route: "/tests",
      gradient: ["#ff9800", "#ff5722"],
      logAction: () => logTestClick("general"), 
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={["#1a1a2e", "#16213e"]}
        style={styles.header}
      >
        <Text style={styles.greeting}>Добро пожаловать</Text>
        <Text style={styles.subtitle}>в мир мистики и самопознания</Text>
        
        {!isPremium && (
          <TouchableOpacity
            style={styles.premiumBanner}
            onPress={() => router.push("/subscription")}
          >
            <LinearGradient
              colors={["#ffd700", "#ffed4e"]}
              style={styles.premiumGradient}
            >
              <Crown size={20} color="#1a1a2e" />
              <Text style={styles.premiumText}>Открой безлимит</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </LinearGradient>

      <View style={styles.featuresContainer}>
        {features.map((feature, index) => (
          <TouchableOpacity
            key={index}
            style={styles.featureCard}
            onPress={() => {
              feature.logAction();
              router.push(feature.route as any);
            }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={feature.gradient}
              style={styles.featureGradient}
            >
              <feature.icon size={32} color="#fff" />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.dailyTip}>
        <Text style={styles.tipTitle}>💫 Совет дня</Text>
        <Text style={styles.tipText}>
          {dailyAdvice.text}
          {dailyAdvice.author && (
            <Text style={styles.tipAuthor}>
              {" — "}
              {dailyAdvice.author}
            </Text>
          )}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f1e",
  },
  header: {
    padding: 24,
    paddingTop: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#b8b8d0",
  },
  premiumBanner: {
    marginTop: 20,
  },
  premiumGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 20,
    gap: 8,
  },
  premiumText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a2e",
  },
  featuresContainer: {
    padding: 20,
    gap: 16,
  },
  featureCard: {
    borderRadius: 20,
    overflow: "hidden",
  },
  featureGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  dailyTip: {
    margin: 20,
    padding: 20,
    backgroundColor: "rgba(255,215,0,0.1)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.2)",
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffd700",
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: "#b8b8d0",
    lineHeight: 20,
  },
  tipAuthor: {
    fontStyle: "italic",
    opacity: 0.8,
  },
});