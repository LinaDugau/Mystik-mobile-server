import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Check, Crown, Sparkles, Infinity } from "lucide-react-native";
import { router } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { useSubscription } from "@/providers/SubscriptionProvider";
import { useDatabase } from "@/hooks/useDatabase"; 

export default function SubscriptionScreen() {
  const { user, isLoading } = useAuth();
  const { activateSubscription } = useSubscription();
  const { logSubscription } = useDatabase();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth");
    }
  }, [isLoading, user]); 

  const features = [
    { icon: Infinity, text: "Безлимитные гадания на Таро" },
    { icon: Check, text: "Полная матрица судьбы" },
    { icon: Check, text: "Расширенные гороскопы" },
    { icon: Check, text: "Все премиум тесты" },
    { icon: Check, text: "Персональные рекомендации" },
  ];

  const handleSubscribe = () => {
    Alert.alert(
      "Оформить подписку",
      "Премиум подписка за 990₽ в месяц. Продолжить?",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Оформить",
          onPress: () => {
            activateSubscription();
            logSubscription(990); 
            Alert.alert("Успешно!", "Премиум подписка активирована");
            router.back();
          },
        },
      ]
    );
  };

  if (!isLoading && !user) {
    return null;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={["#1a1a2e", "#0f0f1e"]}
        style={styles.header}
      >
        <Crown size={60} color="#ffd700" />
        <Text style={styles.title}>Премиум доступ</Text>
        <Text style={styles.subtitle}>
          Откройте все возможности приложения
        </Text>
      </LinearGradient>

      <View style={styles.featuresContainer}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <feature.icon size={20} color="#ffd700" />
            <Text style={styles.featureText}>{feature.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.priceCard}>
        <Text style={styles.priceLabel}>Ежемесячная подписка</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>990</Text>
          <Text style={styles.currency}>₽/мес</Text>
        </View>
        <Text style={styles.priceNote}>Отмена в любое время</Text>
      </View>

      <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
        <LinearGradient
          colors={["#ffd700", "#ffed4e"]}
          style={styles.subscribeGradient}
        >
          <Text style={styles.subscribeText}>Оформить подписку</Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.termsContainer}>
        <Text style={styles.termsText}>
          Нажимая "Оформить подписку", вы соглашаетесь с условиями использования
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
    padding: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#b8b8d0",
    textAlign: "center",
  },
  featuresContainer: {
    padding: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    marginBottom: 10,
  },
  featureText: {
    fontSize: 16,
    color: "#fff",
    flex: 1,
  },
  priceCard: {
    margin: 20,
    padding: 24,
    backgroundColor: "rgba(255,215,0,0.1)",
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,215,0,0.3)",
  },
  priceLabel: {
    fontSize: 14,
    color: "#b8b8d0",
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#ffd700",
  },
  currency: {
    fontSize: 20,
    color: "#ffd700",
    marginLeft: 4,
  },
  priceNote: {
    fontSize: 12,
    color: "#b8b8d0",
    marginTop: 8,
  },
  subscribeButton: {
    margin: 20,
  },
  subscribeGradient: {
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  subscribeText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a2e",
  },
  termsContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  termsText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    lineHeight: 18,
  },
});