import { Tabs } from "expo-router";
import { Home, Star, User, Sparkles, BookOpen } from "lucide-react-native";
import { Platform } from "react-native";
import { useDatabase } from "@/hooks/useDatabase";
import React, { useEffect } from "react";
import { router } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { View, ActivityIndicator } from "react-native";

function TabsLayoutInner() {
  const { logTabClick, deviceId } = useDatabase();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#ffd700",
        tabBarInactiveTintColor: "#8b7aa8",
        tabBarStyle: {
          backgroundColor: "#1a1a2e",
          borderTopColor: "#2a2a3e",
          paddingBottom: Platform.OS === "ios" ? 0 : 5,
          height: Platform.OS === "ios" ? 85 : 60,
        },
        headerStyle: {
          backgroundColor: "#1a1a2e",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
      screenListeners={{
        tabPress: (e) => {
          const routeName = e.target?.split("-")[0] || "unknown";
          if (deviceId) {
            logTabClick(routeName);
          }
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Главная",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tarot"
        options={{
          title: "Таро",
          tabBarIcon: ({ color }) => <Sparkles size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="horoscope"
        options={{
          title: "Эзотерика",
          tabBarIcon: ({ color }) => <Star size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tests"
        options={{
          title: "Тесты",
          tabBarIcon: ({ color }) => <BookOpen size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Профиль",
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

export default function TabsLayout() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth");
    }
  }, [isLoading, user]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' }}>
        <ActivityIndicator size="large" color="#ffd700" />
      </View>
    );
  }

  if (!user) {
    // Пока перенаправление на экран авторизации не завершилось, показываем фон приложения,
    // чтобы не было «пустого» синего/белого экрана.
    return <View style={{ flex: 1, backgroundColor: '#1a1a2e' }} />;
  }

  return <TabsLayoutInner />;
}