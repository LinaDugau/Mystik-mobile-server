import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Crown, ArrowLeft, RefreshCw } from "lucide-react-native";
import { router } from "expo-router";
import { useDatabase } from "@/hooks/useDatabase";

export default function AdminPanel() {
  const { getStats, isInitialized } = useDatabase();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const refreshStats = async () => {
    if (!isInitialized) return;
    
    try {
      setLoading(true);
      const statsData = await getStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error refreshing stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    async function loadStats() {
      if (!isInitialized) {
        console.log("Database not initialized yet, waiting...");
        return;
      }
      
      try {
        setLoading(true);
        const statsData = await getStats();
        console.log("Stats loaded:", statsData);
        
        if (isMounted) {
          setStats(statsData);
        }
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    
    loadStats();
    
    return () => {
      isMounted = false;
    };
  }, [isInitialized]); 

  if (loading || !stats) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Crown size={32} color="#ffd700" />
          <Text style={styles.title}>Админ-панель</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loading}>
            {!isInitialized ? "Инициализация базы данных..." : "Загрузка статистики..."}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Crown size={32} color="#ffd700" />
        <Text style={styles.title}>Админ-панель</Text>
        <TouchableOpacity onPress={refreshStats} style={styles.refreshButton}>
          <RefreshCw size={24} color="#ffd700" />
        </TouchableOpacity>
      </View>

      {/* Выручка */}
      <View style={styles.statCard}>
        <Text style={styles.statTitle}>Выручка</Text>
        <LinearGradient colors={["#ffd700", "#ffed4e"]} style={styles.statValue}>
          <Text style={styles.statNumber}>{stats.totalRevenue?.toFixed(2) || '0.00'} ₽</Text>
        </LinearGradient>
      </View>

      {/* Соотношение пользователей */}
      <View style={styles.statCard}>
        <Text style={styles.statTitle}>Пользователи</Text>
        <View style={styles.ratioContainer}>
          <View style={styles.ratioItem}>
            <Text style={styles.ratioLabel}>Платные: {stats.premiumCount || 0}</Text>
            <View style={[styles.ratioBar, { width: `${stats.totalUsers > 0 ? (stats.premiumCount / stats.totalUsers) * 100 : 0}%` }]} />
          </View>
          <View style={styles.ratioItem}>
            <Text style={styles.ratioLabel}>Бесплатные: {stats.freeCount || 0}</Text>
            <View style={[styles.ratioBar, { width: `${stats.totalUsers > 0 ? (stats.freeCount / stats.totalUsers) * 100 : 0}%` }]} />
          </View>
        </View>
      </View>

      {/* Клики по табам */}
      <View style={styles.statCard}>
        <Text style={styles.statTitle}>Клики по разделам</Text>
        {Object.keys(stats.tabClicks || {}).length > 0 ? (
          Object.entries(stats.tabClicks).map(([tab, count]) => (
            <View key={tab} style={styles.clickItem}>
              <Text style={styles.clickLabel}>{tab}</Text>
              <Text style={styles.clickCount}>{String(count)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Нет данных</Text>
        )}
      </View>

      {/* Клики по тестам */}
      <View style={styles.statCard}>
        <Text style={styles.statTitle}>Клики по тестам</Text>
        {Object.keys(stats.testClicks || {}).length > 0 ? (
          Object.entries(stats.testClicks).map(([test, count]) => (
            <View key={test} style={styles.clickItem}>
              <Text style={styles.clickLabel}>{test}</Text>
              <Text style={styles.clickCount}>{String(count)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Нет данных</Text>
        )}
      </View>

      {/* Клики по таро */}
      <View style={styles.statCard}>
        <Text style={styles.statTitle}>Клики по гаданиям (Таро)</Text>
        {Object.keys(stats.tarotClicks || {}).length > 0 ? (
          Object.entries(stats.tarotClicks).map(([spread, count]) => (
            <View key={spread} style={styles.clickItem}>
              <Text style={styles.clickLabel}>{spread}</Text>
              <Text style={styles.clickCount}>{String(count)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Нет данных</Text>
        )}
      </View>

      {/* Клики по гороскопу */}
      <View style={styles.statCard}>
        <Text style={styles.statTitle}>Клики по эзотерике</Text>
        {Object.keys(stats.horoscopeClicks || {}).length > 0 ? (
          Object.entries(stats.horoscopeClicks).map(([section, count]) => (
            <View key={section} style={styles.clickItem}>
              <Text style={styles.clickLabel}>{section}</Text>
              <Text style={styles.clickCount}>{String(count)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Нет данных</Text>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1a1a2e',
  },
  backButton: {
    marginRight: 10,
  },
  refreshButton: {
    marginLeft: 10,
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  statCard: {
    margin: 20,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  statTitle: {
    fontSize: 18,
    color: '#ffd700',
    marginBottom: 10,
  },
  statValue: {
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  ratioContainer: {
    gap: 10,
  },
  ratioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ratioLabel: {
    color: '#fff',
    flex: 1,
  },
  ratioBar: {
    height: 10,
    backgroundColor: '#ffd700',
    borderRadius: 5,
  },
  clickItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  clickLabel: {
    color: '#b8b8d0',
    flex: 1,
  },
  clickCount: {
    color: '#ffd700',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loading: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});