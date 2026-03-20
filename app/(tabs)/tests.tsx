import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BookOpen, Lock, CheckCircle2 } from "lucide-react-native";
import { useSubscription } from "@/providers/SubscriptionProvider";
import { router } from "expo-router";
import { useFocusEffect } from "expo-router";
import { QUIZZES } from "@/constants/quiz";
import { useDatabase } from "@/hooks/useDatabase"; // Новый импорт
import { useAuth } from "@/providers/AuthProvider";

export default function TestsScreen() {
  const { isPremium } = useSubscription();
  const { logTestClick } = useDatabase(); // Добавляем хук
  const { user } = useAuth();

  const getApiBase = () => {
    const raw =
      process.env.EXPO_PUBLIC_API_URL ||
      process.env.EXPO_PUBLIC_API_BASE ||
      process.env.EXPO_PUBLIC_BACKEND_URL ||
      "";
    const cleaned = raw.trim().replace(/\/$/, "");
    return cleaned || "http://localhost:3001";
  };

  const quizIds = useMemo(() => Object.values(QUIZZES).map((q) => q.id), []);
  const [passedQuizIds, setPassedQuizIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Проверка: берутся ли тесты с БД (только лог).
    const loadDbQuizzesDebug = async () => {
      try {
        const apiBase = getApiBase();
        const res = await fetch(`${apiBase}/api/quizzes`);
        const data = await res.json().catch(() => ({}));
        if (data?.ok && data?.quizzes) {
          const count = Array.isArray(data.quizzes) ? data.quizzes.length : Object.keys(data.quizzes).length;
          console.log("[DB DEBUG] /api/quizzes ok, count:", count);
          const firstId = Object.keys(data.quizzes)[0];
          if (firstId) console.log("[DB DEBUG] first quiz id:", firstId);
        } else {
          console.log("[DB DEBUG] /api/quizzes returned:", data);
        }
      } catch (e) {
        console.warn("[DB DEBUG] /api/quizzes fetch failed:", e);
      }
    };

    loadDbQuizzesDebug();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Проверяем, какие тесты уже пройдены текущим пользователем (по наличию result в БД).
    const loadPassed = async () => {
      if (!user?.id) return;

      try {
        const apiBase = getApiBase();
        const uniqIds = Array.from(new Set(quizIds));

        const checks = await Promise.all(
          uniqIds.map(async (quizId) => {
            try {
              const res = await fetch(
                `${apiBase}/api/user/${encodeURIComponent(user.id)}/quiz/${encodeURIComponent(
                  quizId
                )}/result`
              );
              if (res.ok) return quizId;
              if (res.status === 404) return null;
              return null;
            } catch {
              return null;
            }
          })
        );

        const passed = new Set(checks.filter(Boolean) as string[]);
        setPassedQuizIds(passed);
      } catch (e) {
        console.warn("Failed to load passed quizzes:", e);
      }
    };

    loadPassed();
  }, [user?.id, quizIds]);

  // Обновляем статус “пройден” при возвращении на экран (после прохождения теста)
  useFocusEffect(
    React.useCallback(() => {
      const loadPassedOnFocus = async () => {
        if (!user?.id) return;

        try {
          const apiBase = getApiBase();
          const uniqIds = Array.from(new Set(quizIds));

          const checks = await Promise.all(
            uniqIds.map(async (quizId) => {
              try {
                const res = await fetch(
                  `${apiBase}/api/user/${encodeURIComponent(user.id)}/quiz/${encodeURIComponent(
                    quizId
                  )}/result`
                );
                if (res.ok) return quizId;
                if (res.status === 404) return null;
                return null;
              } catch {
                return null;
              }
            })
          );

          const passed = new Set(checks.filter(Boolean) as string[]);
          setPassedQuizIds(passed);
        } catch (e) {
          console.warn("Failed to load passed quizzes on focus:", e);
        }
      };

      loadPassedOnFocus();
    }, [user?.id, quizIds])
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Тесты</Text>
        </View>

        <Text style={styles.subtitle}>Выберите тест для прохождения</Text>

        <FlatList
          data={Object.values(QUIZZES)}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.testRow}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.testCard,
                item.isPremium && !isPremium && styles.testCardLocked,
                passedQuizIds.has(item.id) && styles.testCardPassed,
              ]}
              onPress={() => {
                logTestClick(item.id); // Логируем клик по тесту
                router.push(`/quiz/${item.id}`);
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  item.isPremium && !isPremium
                    ? ["#333", "#555"]
                    : passedQuizIds.has(item.id)
                      ? ["#4a148c", "#7b1fa2"]
                      : ["#4a148c", "#7b1fa2"]
                }
                style={styles.testCardGradient}
              >
                {passedQuizIds.has(item.id) && (
                  <View style={styles.passedTopOverlay} />
                )}
                {passedQuizIds.has(item.id) && (
                  <View style={styles.passedBadge}>
                    <CheckCircle2 size={20} color="#ffd700" />
                  </View>
                )}
                {item.isPremium && !isPremium && (
                  <Lock size={20} color="#ffd700" style={styles.lockIcon} />
                )}
                <BookOpen size={24} color="#fff" style={styles.testIcon} />
                <Text style={styles.testTitle}>{item.title}</Text>
                <Text style={styles.testDescription}>{item.description}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          scrollEnabled={false}
          contentContainerStyle={styles.testsGrid}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f1e",
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 18,
    color: "#b8b8d0",
    textAlign: "center",
    marginBottom: 20,
  },
  testsGrid: {
    paddingHorizontal: 20,
  },
  testRow: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  testCard: {
    width: "48%",
    height: 160,
    borderRadius: 16,
    overflow: "hidden",
  },
  testCardLocked: {
    opacity: 0.7,
  },
  testCardPassed: {
    borderWidth: 2,
    borderColor: "#ffd700",
  },
  testCardGradient: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  passedBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,215,0,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  passedTopOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,215,0,0.15)",
  },
  lockIcon: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  testIcon: {
    marginBottom: 8,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  testDescription: {
    fontSize: 11,
    color: "#b8b8d0",
    textAlign: "center",
    lineHeight: 16,
  },
});