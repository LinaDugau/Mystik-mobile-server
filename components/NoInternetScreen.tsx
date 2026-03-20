import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { WifiOff } from "lucide-react-native";

type Props = {
  mode: "checking" | "offline";
  onRetry?: () => void;
};

export default function NoInternetScreen({ mode, onRetry }: Props) {
  const isChecking = mode === "checking";

  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <LinearGradient colors={["#1a1a2e", "#16213e"]} style={styles.textCard}>
          <View style={styles.iconWrap}>
            <WifiOff size={34} color="#ffd700" />
          </View>
          <Text style={styles.title}>Нет подключения к интрнерету.</Text>
          <Text style={styles.subtitle}>Чтобы приложение работало нужен доступ к интернету.</Text>
        </LinearGradient>

        {isChecking ? (
          <ActivityIndicator size="large" color="#ffd700" style={styles.loader} />
        ) : (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.9}>
            <LinearGradient colors={["#ffd700", "#ffed4e"]} style={styles.retryGradient}>
              <Text style={styles.retryText}>Попробовать снова</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f1e",
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  textCard: {
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 18,
    borderRadius: 28,
    alignItems: "center",
    marginHorizontal: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#b8b8d0",
    lineHeight: 20,
    textAlign: "center",
  },
  body: {
    paddingHorizontal: 20,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  retryButton: {
    marginTop: 16,
    width: "100%",
  },
  loader: {
    marginTop: 10,
  },
  retryGradient: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  retryText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a2e",
  },
});

