import React, { useState, useMemo, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, Dimensions, Modal, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Calendar, Gem, Heart, Crown, Sparkles, X } from "lucide-react-native";
import { useUser } from "@/providers/UserProvider";
import { useSubscription } from "@/providers/SubscriptionProvider";
import { ZODIAC_SIGNS, getZodiacSign } from "@/constants/zodiac";
import { PERSONALITY_TRAITS } from "@/constants/personality";
import { router, useLocalSearchParams } from "expo-router";
import { useDatabase } from "@/hooks/useDatabase";
import { useHoroscope } from "@/hooks/useHoroscope";
import DestinyMatrixSVG from "@/components/DestinyMatrixSVG";
import { calculateDestinyMatrix } from "@/utils/destinyMatrix";
import { useAuth } from "@/providers/AuthProvider";
import { 
  PURPOSE_20_40, 
  PURPOSE_40_60,
  PURPOSE_GENERAL,
} from "@/constants/purpose";
import {
  TALENTS,
  CHALLENGES,
  MONEY_DIRECTION,
  MONEY_SUCCESS,
  MONEY_FLOW,
  CHAKRA_HEALTH,
  HEALTH_RECOMMENDATIONS,
  PAST_LIVES,
  CHILDREN_MISTAKES,
  MANAGEMENT_GUIDANCE,
  RELATIONSHIPS_WOMEN,
  RELATIONSHIPS_MEN,
  YEAR_ESSENCE,
  YEAR_REASONS,
} from "@/constants/destinyMatrix";
import { CHARACTER, EXIT_REASONS } from "@/constants/relationships";
import { PARENTS_MALE_LINE, PARENTS_FEMALE_LINE, PARENTS_RESENTMENTS } from "@/constants/parents";

const { width, height } = Dimensions.get("window");

function HoroscopeScreenInner() {
  const { birthDate, setBirthDate } = useUser();
  const { isPremium } = useSubscription();
  const { logHoroscopeClick } = useDatabase();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const { user } = useAuth();
  const [dateInput, setDateInput] = useState(birthDate || "");
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month">("today");
  const [activeTab, setActiveTab] = useState<"horoscope" | "matrix">(tab === "matrix" ? "matrix" : "horoscope");
  const [matrixTab, setMatrixTab] = useState<"visual" | "purpose" | "talents" | "money" | "challenges" | "health" | "pastlives" | "children" | "guidance" | "relationships" | "yearforecast" | "parents">("visual");
  const [expandedTalentSections, setExpandedTalentSections] = useState({
    god: true,
    father: true,
    mother: true,
  });

  const [expandedChakraSections, setExpandedChakraSections] = useState({
    sah: false,
    aj: false,
    vish: false,
    anah: false,
    man: false,
    svad: false,
    mul: false,
  });
  const [expandedParentsSections, setExpandedParentsSections] = useState({
    maleLine: false,
    femaleLine: false,
    resentments: false,
  });
  const [expandedChakras, setExpandedChakras] = useState<{ [key: string]: boolean }>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string; description: string }>({ title: "", description: "" });

  const normalizeAccountBirthDate = (value?: string): string | null => {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(trimmed)) return trimmed;
    const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (iso) {
      const [, y, m, d] = iso;
      return `${d}.${m}.${y}`;
    }
    return null;
  };

  const toggleTalentSection = (section: 'god' | 'father' | 'mother') => {
    setExpandedTalentSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleParentsSection = (section: 'maleLine' | 'femaleLine' | 'resentments') => {
    setExpandedParentsSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleChakraSection = (section: 'sah' | 'aj' | 'vish' | 'anah' | 'man' | 'svad' | 'mul') => {
    setExpandedChakraSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  useEffect(() => {
    if (birthDate) return;
    const accountDate = normalizeAccountBirthDate(user?.birthDate);
    if (!accountDate) return;
    setBirthDate(accountDate);
    setDateInput(accountDate);
  }, [user?.birthDate, birthDate, setBirthDate]);

  useEffect(() => {
    if (tab === "matrix") {
      setActiveTab("matrix");
      logHoroscopeClick("matrix");
    }
  }, [tab, logHoroscopeClick]);

  const formatDateInput = (text: string) => {
    const digits = text.replace(/\D/g, "");
    let formatted = "";
    for (let i = 0; i < digits.length && i < 8; i++) {
      if (i === 2 || i === 4) {
        formatted += ".";
      }
      formatted += digits[i];
    }
    return formatted;
  };

  const handleDateInputChange = (text: string) => {
    const formatted = formatDateInput(text);
    setDateInput(formatted);
  };

  const isValidDate = (date: string): boolean => {
    const regex = /^\d{2}\.\d{2}\.\d{4}$/;
    if (!regex.test(date)) return false;
    const [day, month, year] = date.split(".").map(Number);
    if (year < 1900 || year > 2100) return false;
    if (month < 1 || month > 12) return false;
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > daysInMonth) return false;
    return true;
  };

  const handleDateSubmit = () => {
    if (!isValidDate(dateInput)) {
      Alert.alert("Ошибка", "Введите корректную дату в формате ДД.ММ.ГГГГ");
      return;
    }
    setBirthDate(dateInput);
  };

  // Конвертация даты из ДД.ММ.ГГГГ в ГГГГ-ММ-ДД для расчета матрицы
  const convertDateForMatrix = (date: string): string => {
    const match = date.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (!match) return "";
    const [, day, month, year] = match;
    return `${year}-${month}-${day}`;
  };

  const matrixData = useMemo(() => {
    if (!birthDate || !/^\d{2}\.\d{2}\.\d{4}$/.test(birthDate)) return null;
    const isoDate = convertDateForMatrix(birthDate);
    return calculateDestinyMatrix(isoDate);
  }, [birthDate]);

  const getArcanaName = (num: number): string => {
    const arcanas = [
      "", "Маг", "Верховная Жрица", "Императрица", "Император", "Иерофант", "Влюбленные", "Колесница", "Сила", "Отшельник",
      "Колесо Фортуны", "Справедливость", "Повешенный", "Смерть", "Умеренность", "Дьявол", "Башня", "Звезда", "Луна", "Солнце",
      "Суд", "Мир", "Шут"
    ];
    return arcanas[num] || `Аркан ${num}`;
  };

  const getPointDescription = (index: number): string => {
    const descriptions = [
      "Центральная точка матрицы (Д) - предназначение, жизненный сценарий, основная задача души, здоровье, руководство по жизни.",
      "День рождения (А2) - глубинные личные качества, таланты, программы из прошлой жизни, предназначение.",
      "Месяц рождения (Б2) - глубинная зона комфорта, родители, женская линия, сексуальность, отношения.",
      "Год рождения (В2) - глубинные таланты, наследство от предков, деньги, прошлая жизнь.",
      "Сумма А+Б+В (Г2) - глубинная кармическая задача, прошлая жизнь, отношения, дети.",
      "А + Б (Е2) - глубинная энергия родителей, семейные программы, детство, здоровье.",
      "Б + В (Ж2) - глубинная энергия отношений, сексуальность, партнерство, дети.",
      "В + Г (И2) - глубинная энергия карьеры, деньги, таланты в работе, успех.",
      "А + Г (З2) - глубинная энергия здоровья, программы, жизненный сценарий, руководство по жизни.",
      "А - личные качества, характер, таланты, предназначение, программы.",
      "Б - зона комфорта, эмоциональная сфера, родители, женская энергия, сексуальность.",
      "В - таланты, душа, прошлая жизнь, деньги, предназначение.",
      "Г - кармическая задача, отец линия, прошлая жизнь, отношения, дети.",
      "Е - энергия родителей, детство, семейные программы, здоровье.",
      "Ж - энергия отношений, сексуальность, партнерство, дети.",
      "И - энергия денег, карьера, успех, таланты.",
      "З - энергия здоровья, программы, жизненный сценарий, руководство по жизни.",
      "А1 - внутренняя личные качества, глубокие таланты, программы.",
      "Б1 - внутренняя зона комфорта, глубокие отношения с родителями, сексуальность.",
      "В1 - внутренние таланты, глубокие способности, деньги, прошлая жизнь.",
      "Г1 - внутренняя кармическая задача, глубокая прошлая жизнь, отношения.",
      "Е1 - внутренняя энергия родителей, глубокие программы, здоровье, детство.",
      "Ж1 - внутренняя энергия отношений, глубокая сексуальность, партнерство, дети.",
      "И1 - внутренняя энергия карьеры, глубокие деньги, успех, таланты.",
      "З1 - внутренняя энергия здоровья, глубокие программы, жизненный сценарий, руководство."
    ];
    return descriptions[index] || "Дополнительная энергетическая характеристика матрицы судьбы.";
  };

  const zodiacSign = birthDate ? getZodiacSign(birthDate) : null;
  const zodiacData = zodiacSign ? ZODIAC_SIGNS[zodiacSign] : null;
  const zodiacSignName = zodiacData?.name || "";

  const { horoscope: dailyHoroscope, loading: dailyLoading, error: dailyError } = useHoroscope(zodiacSignName, "today");
  const { horoscope: weeklyHoroscope, loading: weeklyLoading, error: weeklyError } = useHoroscope(zodiacSignName, "week");
  const { horoscope: monthlyHoroscope, loading: monthlyLoading, error: monthlyError } = useHoroscope(zodiacSignName, "month");

  const formatRuDate = (isoDate: string, opts?: Intl.DateTimeFormatOptions) => {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return isoDate;
    return date.toLocaleDateString("ru-RU", opts);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Гороскоп и Матрица судьбы</Text>
      </View>
      {!birthDate ? (
        <View style={styles.dateInputContainer}>
          <Text style={styles.inputLabel}>Введите дату рождения</Text>
          <TextInput
            style={styles.dateInput}
            placeholder="ДД.ММ.ГГГГ"
            placeholderTextColor="#666"
            value={dateInput}
            onChangeText={handleDateInputChange}
            keyboardType="numeric"
            maxLength={10}
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleDateSubmit}>
            <LinearGradient colors={["#ffd700", "#ffed4e"]} style={styles.submitGradient}>
              <Text style={styles.submitText}>Продолжить</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.tabSelector}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === "horoscope" ? styles.tabButtonActive : styles.tabButtonInactive]}
              onPress={() => {
                logHoroscopeClick("horoscope");
                setActiveTab("horoscope");
                if (tab === "matrix") {
                  router.replace("/horoscope");
                }
              }}
            >
              <LinearGradient
                colors={activeTab === "horoscope" ? ["#2196f3", "#3f51b5"] : ["#444", "#666"]}
                style={styles.tabGradient}
              >
                <Text style={[styles.tabText, activeTab === "horoscope" ? styles.tabTextActive : styles.tabTextInactive]}>
                  Гороскоп
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === "matrix" ? styles.tabButtonActive : styles.tabButtonInactive]}
              onPress={() => {
                logHoroscopeClick("matrix");
                setActiveTab("matrix");
              }}
            >
              <LinearGradient
                colors={activeTab === "matrix" ? ["#4caf50", "#8bc34a"] : ["#444", "#666"]}
                style={styles.tabGradient}
              >
                <Text style={[styles.tabText, activeTab === "matrix" ? styles.tabTextActive : styles.tabTextInactive]}>
                  Матрица судьбы
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          {activeTab === "horoscope" && (
            <View key="horoscope-content">
              <View style={styles.zodiacCard}>
                <LinearGradient colors={["#2196f3", "#3f51b5"]} style={styles.zodiacGradient}>
                  <Text style={styles.zodiacSymbol}>{zodiacData?.symbol || ""}</Text>
                  <Text style={styles.zodiacName}>{zodiacData?.name || ""}</Text>
                  <Text style={styles.zodiacDates}>{zodiacData?.dates || ""}</Text>
                  <Text style={styles.zodiacElement}>Стихия: {zodiacData?.element || ""}</Text>
                </LinearGradient>
              </View>
              <View style={styles.periodSelector}>
                {(["today", "week", "month"] as const).map((period) => (
                  <TouchableOpacity
                    key={period}
                    style={[styles.periodButton, selectedPeriod === period && styles.periodButtonActive]}
                    onPress={() => {
                      logHoroscopeClick(`horoscope_${period}`);
                      setSelectedPeriod(period);
                    }}
                  >
                    <Text style={[styles.periodText, selectedPeriod === period && styles.periodTextActive]}>
                      {period === "today" ? "Сегодня" : period === "week" ? "Неделя" : "Месяц"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.horoscopeCard}>
                {selectedPeriod === "today" || isPremium ? (
                  <>
                    <Text style={styles.horoscopeTitle}>
                      {selectedPeriod === "today" ? "Прогноз на сегодня" : selectedPeriod === "week" ? "Прогноз на неделю" : "Прогноз на месяц"}
                    </Text>
                    {selectedPeriod === "today" ? (
                      dailyLoading ? (
                        <Text style={styles.horoscopeText}>Загрузка гороскопа...</Text>
                      ) : dailyError ? (
                        <Text style={styles.horoscopeText}>{dailyError}</Text>
                      ) : dailyHoroscope ? (
                        <>
                          {dailyHoroscope.text
                            .split("\n\n")
                            .filter(Boolean)
                            .map((paragraph, index) => (
                              <Text key={index} style={[styles.horoscopeText, index > 0 && { marginTop: 12 }]}>
                                {paragraph}
                              </Text>
                            ))}
                          <Text style={styles.horoscopeMeta}>
                            {formatRuDate(dailyHoroscope.date, { day: "numeric", month: "long", year: "numeric" })} • Источник: Рамблер
                          </Text>
                        </>
                      ) : (
                        <Text style={styles.horoscopeText}>{zodiacData?.horoscope.today || ""}</Text>
                      )
                    ) : selectedPeriod === "week" ? (
                      weeklyLoading ? (
                        <Text style={styles.horoscopeText}>Загрузка недельного гороскопа...</Text>
                      ) : weeklyError ? (
                        <Text style={styles.horoscopeText}>{weeklyError}</Text>
                      ) : weeklyHoroscope ? (
                        <>
                          {weeklyHoroscope.text
                            .split("\n\n")
                            .filter(Boolean)
                            .map((paragraph, index) => (
                              <Text key={index} style={[styles.horoscopeText, index > 0 && { marginTop: 12 }]}>
                                {paragraph}
                              </Text>
                            ))}
                          <Text style={styles.horoscopeMeta}>
                            {(weeklyHoroscope.weekRange ||
                              formatRuDate(weeklyHoroscope.date, { day: "numeric", month: "long", year: "numeric" }))}{" "}
                            • Источник: Рамблер
                          </Text>
                        </>
                      ) : (
                        <Text style={styles.horoscopeText}>{zodiacData?.horoscope.week || ""}</Text>
                      )
                    ) : monthlyLoading ? (
                      <Text style={styles.horoscopeText}>Загрузка месячного гороскопа...</Text>
                    ) : monthlyError ? (
                      <Text style={styles.horoscopeText}>{monthlyError}</Text>
                    ) : monthlyHoroscope ? (
                      <>
                        {monthlyHoroscope.text
                          .split("\n\n")
                          .filter(Boolean)
                          .map((paragraph, index) => (
                            <Text key={index} style={[styles.horoscopeText, index > 0 && { marginTop: 12 }]}>
                              {paragraph}
                            </Text>
                          ))}
                        <Text style={styles.horoscopeMeta}>
                          {(monthlyHoroscope.monthRange || formatRuDate(monthlyHoroscope.date, { month: "long", year: "numeric" }))} • Источник: Рамблер
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.horoscopeText}>{zodiacData?.horoscope.month || ""}</Text>
                    )}
                  </>
                ) : (
                  <View style={styles.lockedBlock}>
                    <Crown size={28} color="#ffd700" />
                    <Text style={styles.lockedText}>Доступно только для премиум</Text>
                    <TouchableOpacity style={styles.unlockButton} onPress={() => router.push("/subscription")}>
                      <LinearGradient colors={["#ffd700", "#ffed4e"]} style={styles.unlockGradient}>
                        <Text style={styles.unlockText}>Открыть доступ</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              {isPremium ? (
                <View style={styles.infoCards}>
                  <TouchableOpacity 
                    style={styles.infoCard}
                    onPress={() => {
                      setModalContent({
                        title: `Тотемное животное: ${zodiacData?.totem || ""}`,
                        description: zodiacData?.totemDescription || ""
                      });
                      setModalVisible(true);
                    }}
                  >
                    <Heart size={24} color="#ff69b4" />
                    <Text style={styles.infoTitle}>Тотемное животное</Text>
                    <Text style={styles.infoText}>{zodiacData?.totem || ""}</Text>
                    <Text style={styles.infoHint}>Нажмите для подробностей</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.infoCard}
                    onPress={() => {
                      setModalContent({
                        title: "Камни-талисманы",
                        description: zodiacData?.stonesDescription || ""
                      });
                      setModalVisible(true);
                    }}
                  >
                    <Gem size={24} color="#ffd700" />
                    <Text style={styles.infoTitle}>Камни - талисманы</Text>
                    <Text style={styles.infoText}>{zodiacData?.stones.join(", ") || ""}</Text>
                    <Text style={styles.infoHint}>Нажмите для подробностей</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.lockedBlock}>
                  <Crown size={28} color="#ffd700" />
                  <Text style={styles.lockedText}>Тотемное животное и камни доступны только для премиум</Text>
                  <TouchableOpacity style={styles.unlockButton} onPress={() => router.push("/subscription")}>
                    <LinearGradient colors={["#ffd700", "#ffed4e"]} style={styles.unlockGradient}>
                      <Text style={styles.unlockText}>Открыть доступ</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
              <View style={styles.compatibilityCard}>
                <Text style={styles.compatibilityTitle}>Совместимость</Text>
                <View style={styles.compatibilityList}>
                  <View style={styles.compatibilityItem}>
                    <Text style={styles.compatibilityLabel}>Лучшая:</Text>
                    <Text style={styles.compatibilityValue}>{zodiacData?.compatibility.best.join(", ") || ""}</Text>
                  </View>
                  <View style={styles.compatibilityItem}>
                    <Text style={styles.compatibilityLabel}>Хорошая:</Text>
                    <Text style={styles.compatibilityValue}>{zodiacData?.compatibility.good.join(", ") || ""}</Text>
                  </View>
                  <View style={styles.compatibilityItem}>
                    <Text style={styles.compatibilityLabel}>Сложная:</Text>
                    <Text style={styles.compatibilityValue}>{zodiacData?.compatibility.challenging.join(", ") || ""}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
          {activeTab === "matrix" && matrixData && (
            <View key="matrix-content">
              {/* Вкладки матрицы */}
              <View style={styles.matrixTabContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    style={[styles.matrixTab, matrixTab === "visual" && styles.matrixTabActive]}
                    onPress={() => setMatrixTab("visual")}
                  >
                    <Text style={[styles.matrixTabText, matrixTab === "visual" && styles.matrixTabTextActive]}>
                      Матрица
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.matrixTab, matrixTab === "talents" && styles.matrixTabActive]}
                    onPress={() => setMatrixTab("talents")}
                  >
                    <Text style={[styles.matrixTabText, matrixTab === "talents" && styles.matrixTabTextActive]}>
                      Таланты {!isPremium && <Crown size={12} color="#ffd700" />}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.matrixTab, matrixTab === "pastlives" && styles.matrixTabActive]}
                    onPress={() => setMatrixTab("pastlives")}
                  >
                    <Text style={[styles.matrixTabText, matrixTab === "pastlives" && styles.matrixTabTextActive]}>
                      Прошлая жизнь
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.matrixTab, matrixTab === "health" && styles.matrixTabActive]}
                    onPress={() => setMatrixTab("health")}
                  >
                    <Text style={[styles.matrixTabText, matrixTab === "health" && styles.matrixTabTextActive]}>
                      Здоровье {!isPremium && <Crown size={12} color="#ffd700" />}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.matrixTab, matrixTab === "purpose" && styles.matrixTabActive]}
                    onPress={() => setMatrixTab("purpose")}
                  >
                    <Text style={[styles.matrixTabText, matrixTab === "purpose" && styles.matrixTabTextActive]}>
                      Предназначение {!isPremium && <Crown size={12} color="#ffd700" />}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.matrixTab, matrixTab === "challenges" && styles.matrixTabActive]}
                    onPress={() => setMatrixTab("challenges")}
                  >
                    <Text style={[styles.matrixTabText, matrixTab === "challenges" && styles.matrixTabTextActive]}>
                      Испытания {!isPremium && <Crown size={12} color="#ffd700" />}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.matrixTab, matrixTab === "relationships" && styles.matrixTabActive]}
                    onPress={() => setMatrixTab("relationships")}
                  >
                    <Text style={[styles.matrixTabText, matrixTab === "relationships" && styles.matrixTabTextActive]}>
                      Отношения {!isPremium && <Crown size={12} color="#ffd700" />}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.matrixTab, matrixTab === "yearforecast" && styles.matrixTabActive]}
                    onPress={() => setMatrixTab("yearforecast")}
                  >
                    <Text style={[styles.matrixTabText, matrixTab === "yearforecast" && styles.matrixTabTextActive]}>
                      Прогноз на год
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.matrixTab, matrixTab === "money" && styles.matrixTabActive]}
                    onPress={() => setMatrixTab("money")}
                  >
                    <Text style={[styles.matrixTabText, matrixTab === "money" && styles.matrixTabTextActive]}>
                      Деньги {!isPremium && <Crown size={12} color="#ffd700" />}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.matrixTab, matrixTab === "parents" && styles.matrixTabActive]}
                    onPress={() => setMatrixTab("parents")}
                  >
                    <Text style={[styles.matrixTabText, matrixTab === "parents" && styles.matrixTabTextActive]}>
                      Родители {!isPremium && <Crown size={12} color="#ffd700" />}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.matrixTab, matrixTab === "children" && styles.matrixTabActive]}
                    onPress={() => setMatrixTab("children")}
                  >
                    <Text style={[styles.matrixTabText, matrixTab === "children" && styles.matrixTabTextActive]}>
                      Дети {!isPremium && <Crown size={12} color="#ffd700" />}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.matrixTab, matrixTab === "guidance" && styles.matrixTabActive]}
                    onPress={() => setMatrixTab("guidance")}
                  >
                    <Text style={[styles.matrixTabText, matrixTab === "guidance" && styles.matrixTabTextActive]}>
                      Руководство {!isPremium && <Crown size={12} color="#ffd700" />}
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>

              {/* Визуализация матрицы */}
              {matrixTab === "visual" && (
                <>
                <View style={styles.matrixVisualization}>
                  <DestinyMatrixSVG matrix={matrixData.points} width={width * 0.98} height={600} />
                </View>

                {/* Чакры (краткая сводка как на вебе) */}
                {matrixData.chartHeart && (
                  <>
                    <Text style={styles.chakraSectionTitle}>Чакры</Text>
                    <View style={{ marginHorizontal: 16 }}>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                        {[
                          {
                            key: "sah",
                            name: "Сахасрара",
                            physics: matrixData.chartHeart.sahphysics,
                            energy: matrixData.chartHeart.sahenergy,
                            emotions: matrixData.chartHeart.sahemotions,
                          },
                          {
                            key: "aj",
                            name: "Аджна",
                            physics: matrixData.chartHeart.ajphysics,
                            energy: matrixData.chartHeart.ajenergy,
                            emotions: matrixData.chartHeart.ajemotions,
                          },
                          {
                            key: "vish",
                            name: "Вишудха",
                            physics: matrixData.chartHeart.vishphysics,
                            energy: matrixData.chartHeart.vishenergy,
                            emotions: matrixData.chartHeart.vishemotions,
                          },
                          {
                            key: "anah",
                            name: "Анахата",
                            physics: matrixData.chartHeart.anahphysics,
                            energy: matrixData.chartHeart.anahenergy,
                            emotions: matrixData.chartHeart.anahemotions,
                          },
                          {
                            key: "man",
                            name: "Манипура",
                            physics: matrixData.chartHeart.manphysics,
                            energy: matrixData.chartHeart.manenergy,
                            emotions: matrixData.chartHeart.manemotions,
                          },
                          {
                            key: "svad",
                            name: "Свадхистана",
                            physics: matrixData.chartHeart.svadphysics,
                            energy: matrixData.chartHeart.svadenergy,
                            emotions: matrixData.chartHeart.svademotions,
                          },
                          {
                            key: "mul",
                            name: "Муладхара",
                            physics: matrixData.chartHeart.mulphysics,
                            energy: matrixData.chartHeart.mulenergy,
                            emotions: matrixData.chartHeart.mulemotions,
                          },
                        ].map((chakra) => (
                          <View key={chakra.key} style={[styles.chakraShortCard, { width: '48%', marginHorizontal: 0, marginBottom: 8 }]}>
                            <Text style={styles.chakraShortTitle}>{chakra.name}</Text>
                            <View style={styles.chakraShortRow}>
                              <Text style={styles.chakraShortLabel}>Физика:</Text>
                              <Text style={styles.chakraShortValue}>{chakra.physics}</Text>
                            </View>
                            <View style={styles.chakraShortRow}>
                              <Text style={styles.chakraShortLabel}>Энергия:</Text>
                              <Text style={styles.chakraShortValue}>{chakra.energy}</Text>
                            </View>
                            <View style={styles.chakraShortRow}>
                              <Text style={styles.chakraShortLabel}>Эмоции:</Text>
                              <Text style={styles.chakraShortValue}>{chakra.emotions}</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  </>
                )}

                {/* Предназначение */}
                <View style={styles.purposesCard}>
                  <Text style={styles.purposesTitle}>Предназначение</Text>

                  {/* Личное предназначение */}
                  <View style={styles.purposeBlock}>
                    <Text style={styles.purposeBlockTitle}>Личное предназначение</Text>
                    <Text style={styles.purposeBlockSubtitle}>
                      Поиск души, баланс женских и мужских качеств, способности, навыки
                    </Text>
                    <Text style={styles.purposeBlockLine}>
                      Небо: <Text style={styles.purposeValue}>{matrixData.purposes.skypoint}</Text> | Земля:{" "}
                      <Text style={styles.purposeValue}>{matrixData.purposes.earthpoint}</Text> | Результат:{" "}
                      <Text style={styles.purposeValue}>{matrixData.purposes.perspurpose}</Text>
                    </Text>
                  </View>

                  <View style={{height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 8}} />

                  {/* Предназначение для общества и рода */}
                  <View style={styles.purposeBlock}>
                    <Text style={styles.purposeBlockTitle}>Предназначение для общества и рода</Text>
                    <Text style={styles.purposeBlockSubtitle}>
                      Задачи для рода, результаты и признание в обществе
                    </Text>
                    <Text style={styles.purposeBlockLine}>
                      Женское: <Text style={styles.purposeValue}>{matrixData.purposes.femalepoint}</Text> | Мужское:{" "}
                      <Text style={styles.purposeValue}>{matrixData.purposes.malepoint}</Text> | Результат:{" "}
                      <Text style={styles.purposeValue}>{matrixData.purposes.socialpurpose}</Text>
                    </Text>
                  </View>

                  <View style={{height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 8}} />

                  {/* Общее предназначение на эту жизнь */}
                  <View style={styles.purposeBlock}>
                    <Text style={styles.purposeBlockTitle}>Общее предназначение на эту жизнь</Text>
                    <Text style={styles.purposeBlockMain}>
                      {matrixData.purposes.generalpurpose}
                    </Text>
                  </View>

                  <View style={{height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 8}} />

                  {/* Планетарное предназначение */}
                  <View style={styles.purposeBlock}>
                    <Text style={styles.purposeBlockTitle}>Планетарное предназначение</Text>
                    <Text style={styles.purposeBlockSubtitle}>
                      Духовный путь, глобальная задача, где божественное во мне? Глобальная цель души
                    </Text>
                    <Text style={styles.purposeBlockMain}>
                      {matrixData.purposes.planetarypurpose}
                    </Text>
                  </View>
                </View>
                </>
              )}

              {/* Таланты */}
              {matrixTab === "talents" && (
                isPremium ? (
                <View style={styles.contentCard}>
                  <Text style={styles.contentTitle}>Ваши таланты</Text>
                  
                  {(() => {
                    // Собираем все использованные числа для проверки дубликатов
                    const usedNumbers = new Set<number>();
                    
                    // Функция для фильтрации уникальных чисел
                    const getUniqueTalents = (numbers: (number | undefined)[]) => {
                      return numbers
                        .filter(num => num !== undefined)
                        .filter(num => {
                          if (usedNumbers.has(num!)) {
                            return false;
                          }
                          usedNumbers.add(num!);
                          return true;
                        })
                        .map(num => ({
                          number: num!,
                          description: TALENTS[num!]?.description || 'Описание отсутствует'
                        }));
                    };

                    // Таланты от Бога: точки 2, 18, 10 (B, P, T)
                    const godNumbers = [
                      matrixData.points[2]?.value,  // B - месяц
                      matrixData.points[18]?.value, // P
                      matrixData.points[10]?.value  // T
                    ];
                    
                    // Таланты от Отца: точки 5, 27, 26 (F, F1, F2)
                    const fatherNumbers = [
                      matrixData.points[5]?.value,  // F
                      matrixData.points[27]?.value, // F1
                      matrixData.points[26]?.value  // F2
                    ];
                    
                    // Таланты от Матери: точки 6, 29, 28 (G, G1, G2)
                    const motherNumbers = [
                      matrixData.points[6]?.value,  // G
                      matrixData.points[29]?.value, // G1
                      matrixData.points[28]?.value  // G2
                    ];

                    // Обрабатываем таланты от Бога
                    const fromGod = getUniqueTalents(godNumbers);
                    
                    // Обрабатываем таланты от Отца
                    const fromFather = getUniqueTalents(fatherNumbers);
                    
                    // Обрабатываем таланты от Матери
                    const fromMother = getUniqueTalents(motherNumbers);

                    return (
                      <>
                        {/* Талант от Бога */}
                        {fromGod.length > 0 && (
                          <View style={[styles.talentCard, { borderLeftColor: '#ffd700' }]}>
                            <TouchableOpacity 
                              style={styles.talentHeader} 
                              onPress={() => toggleTalentSection('god')}
                            >
                              <Text style={[styles.talentCategory, { color: '#ffd700' }]}>Талант от Бога</Text>
                              <Text style={styles.talentToggleIcon}>
                                {expandedTalentSections.god ? '−' : '+'}
                              </Text>
                            </TouchableOpacity>
                            {expandedTalentSections.god && (
                              <View style={styles.talentContent}>
                                {fromGod.map((talent, index) => (
                                  <View key={index} style={[
                                    styles.talentItem,
                                    index < fromGod.length - 1 && styles.talentItemWithBorder
                                  ]}>
                                    <View style={[styles.talentNumber, { backgroundColor: '#ffd700' }]}>
                                      <Text style={styles.talentNumberText}>{talent.number}</Text>
                                    </View>
                                    <Text style={styles.talentDescription}>{talent.description}</Text>
                                  </View>
                                ))}
                              </View>
                            )}
                          </View>
                        )}

                        {/* Талант от Отца */}
                        {fromFather.length > 0 && (
                          <View style={[styles.talentCard, { borderLeftColor: '#4caf50' }]}>
                            <TouchableOpacity 
                              style={styles.talentHeader} 
                              onPress={() => toggleTalentSection('father')}
                            >
                              <Text style={[styles.talentCategory, { color: '#4caf50' }]}>Талант от Отца</Text>
                              <Text style={styles.talentToggleIcon}>
                                {expandedTalentSections.father ? '−' : '+'}
                              </Text>
                            </TouchableOpacity>
                            {expandedTalentSections.father && (
                              <View style={styles.talentContent}>
                                {fromFather.map((talent, index) => (
                                  <View key={index} style={[
                                    styles.talentItem,
                                    index < fromFather.length - 1 && styles.talentItemWithBorder
                                  ]}>
                                    <View style={[styles.talentNumber, { backgroundColor: '#4caf50' }]}>
                                      <Text style={styles.talentNumberText}>{talent.number}</Text>
                                    </View>
                                    <Text style={styles.talentDescription}>{talent.description}</Text>
                                  </View>
                                ))}
                              </View>
                            )}
                          </View>
                        )}

                        {/* Талант от Матери */}
                        {fromMother.length > 0 && (
                          <View style={[styles.talentCard, { borderLeftColor: '#2196f3' }]}>
                            <TouchableOpacity 
                              style={styles.talentHeader} 
                              onPress={() => toggleTalentSection('mother')}
                            >
                              <Text style={[styles.talentCategory, { color: '#2196f3' }]}>Талант от Матери</Text>
                              <Text style={styles.talentToggleIcon}>
                                {expandedTalentSections.mother ? '−' : '+'}
                              </Text>
                            </TouchableOpacity>
                            {expandedTalentSections.mother && (
                              <View style={styles.talentContent}>
                                {fromMother.map((talent, index) => (
                                  <View key={index} style={[
                                    styles.talentItem,
                                    index < fromMother.length - 1 && styles.talentItemWithBorder
                                  ]}>
                                    <View style={[styles.talentNumber, { backgroundColor: '#2196f3' }]}>
                                      <Text style={styles.talentNumberText}>{talent.number}</Text>
                                    </View>
                                    <Text style={styles.talentDescription}>{talent.description}</Text>
                                  </View>
                                ))}
                              </View>
                            )}
                          </View>
                        )}
                      </>
                    );
                  })()}
                </View>
                ) : (
                  <View style={styles.lockedBlock}>
                    <Crown size={28} color="#ffd700" />
                    <Text style={styles.lockedText}>Доступно только для премиум</Text>
                    <TouchableOpacity style={styles.unlockButton} onPress={() => router.push("/subscription")}>
                      <LinearGradient colors={["#ffd700", "#ffed4e"]} style={styles.unlockGradient}>
                        <Text style={styles.unlockText}>Открыть доступ</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )
              )}

              {/* Деньги */}
              {matrixTab === "money" && (
                isPremium ? (
                <View style={styles.contentCard}>
                  <Text style={styles.contentTitle}>Финансы и карьера</Text>
                  
                  {matrixData.points[15] && MONEY_DIRECTION[matrixData.points[15].value] && (
                    <>
                      <View style={styles.arcanaIndicator}>
                        <View style={styles.arcanaCircle}>
                          <Text style={styles.arcanaNumber}>{matrixData.points[15].value}</Text>
                        </View>
                        <Text style={styles.arcanaText}>
                          Направление деятельности
                        </Text>
                      </View>
                      <Text style={styles.contentText}>
                        {MONEY_DIRECTION[matrixData.points[15].value].description}
                      </Text>
                    </>
                  )}
                  
                  {matrixData.points[25] && MONEY_SUCCESS[matrixData.points[25].value] && (
                    <>
                      <View style={[styles.arcanaIndicator, { marginTop: 20 }]}>
                        <View style={styles.arcanaCircle}>
                          <Text style={styles.arcanaNumber}>{matrixData.points[25].value}</Text>
                        </View>
                        <Text style={styles.arcanaText}>
                          Для достижения успеха 
                        </Text>
                      </View>
                      <Text style={styles.contentText}>
                        {MONEY_SUCCESS[matrixData.points[25].value].description}
                      </Text>
                    </>
                  )}

                  {/* Как раскрыть денежный поток */}
                  {(() => {
                    const shownNumbers = new Set<number>();
                    const numbers = [
                      { value: matrixData.points[19]?.value, index: 19 },
                      { value: matrixData.points[3]?.value, index: 3 }
                    ];
                    
                    return numbers.map((num, idx) => {
                      if (!num.value || shownNumbers.has(num.value)) {
                        return null;
                      }
                      shownNumbers.add(num.value);
                      
                      const isLast = idx === numbers.filter(n => n.value && !shownNumbers.has(n.value)).length - 1;
                      
                      return (
                        <View key={num.index}>
                          <View style={[styles.arcanaIndicator, { marginTop: 20 }]}>
                            <View style={styles.arcanaCircle}>
                              <Text style={styles.arcanaNumber}>{num.value}</Text>
                            </View>
                            <Text style={styles.arcanaText}>
                              Как раскрыть денежный поток
                            </Text>
                          </View>
                          <Text style={styles.contentText}>
                            {MONEY_FLOW[num.value]?.description || 'Описание отсутствует'}
                          </Text>
                          {!isLast && (
                            <View style={{height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 8}} />
                          )}
                        </View>
                      );
                    });
                  })()}
                </View>
                ) : (
                  <View style={styles.lockedBlock}>
                    <Crown size={28} color="#ffd700" />
                    <Text style={styles.lockedText}>Доступно только для премиум</Text>
                    <TouchableOpacity style={styles.unlockButton} onPress={() => router.push("/subscription")}>
                      <LinearGradient colors={["#ffd700", "#ffed4e"]} style={styles.unlockGradient}>
                        <Text style={styles.unlockText}>Открыть доступ</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )
              )}

              {/* Испытания */}
              {matrixTab === "challenges" && (
                isPremium ? (
                <View style={styles.contentCard}>
                  <Text style={styles.contentTitle}>Жизненные испытания</Text>
                  
                  {matrixData.points[0] && CHALLENGES[matrixData.points[0].value] && (
                    <>
                      <View style={styles.arcanaIndicator}>
                        <View style={styles.arcanaCircle}>
                          <Text style={styles.arcanaNumber}>{matrixData.points[0].value}</Text>
                        </View>
                        <Text style={styles.arcanaText}>
                          Расчет по центральной точке матрицы
                        </Text>
                      </View>
                      <Text style={styles.contentText}>
                        {CHALLENGES[matrixData.points[0].value].description}
                      </Text>
                    </>
                  )}
                </View>
                ) : (
                  <View style={styles.lockedBlock}>
                    <Crown size={28} color="#ffd700" />
                    <Text style={styles.lockedText}>Доступно только для премиум</Text>
                    <TouchableOpacity style={styles.unlockButton} onPress={() => router.push("/subscription")}>
                      <LinearGradient colors={["#ffd700", "#ffed4e"]} style={styles.unlockGradient}>
                        <Text style={styles.unlockText}>Открыть доступ</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )
              )}

              {/* Здоровье */}
              {matrixTab === "health" && (
                isPremium ? (
                <View style={styles.contentCard}>
                  <Text style={styles.contentTitle}>Здоровье по чакрам</Text>
                  
                  {/* Общая рекомендация */}
                  {matrixData.points[0] && HEALTH_RECOMMENDATIONS[matrixData.points[0].value] && (
                    <>
                      <View style={styles.arcanaIndicator}>
                        <View style={styles.arcanaCircle}>
                          <Text style={styles.arcanaNumber}>{matrixData.points[0].value}</Text>
                        </View>
                        <Text style={styles.arcanaText}>
                          Общая рекомендация 
                        </Text>
                      </View>
                      <Text style={styles.contentText}>
                        {HEALTH_RECOMMENDATIONS[matrixData.points[0].value].description}
                      </Text>
                    </>
                  )}

                  {/* Чакры */}
                  {matrixData.chartHeart && (() => {
                    // Глобальный набор использованных чисел для всех чакр
                    const usedNumbers = new Set<number>();
                    
                    return Object.entries(CHAKRA_HEALTH).map(([chakraKey, healthData]) => {
                      // Получаем данные чакры из matrixData.chartHeart
                      const chakraData = matrixData.chartHeart;
                      
                      // Вычисляем рекомендации по числам для текущей чакры
                      const recommendations = (() => {
                        const physicsField = `${chakraKey}physics` as keyof typeof chakraData;
                        const energyField = `${chakraKey}energy` as keyof typeof chakraData;
                        const emotionsField = `${chakraKey}emotions` as keyof typeof chakraData;
                        
                        const numbers = [
                          chakraData[physicsField], 
                          chakraData[energyField], 
                          chakraData[emotionsField]
                        ];
                        const uniqueNumbers = Array.from(new Set(numbers))
                          .filter(num => num && num <= 22 && !usedNumbers.has(num)) // Исключаем уже использованные числа
                          .sort((a, b) => a - b);
                        
                        // Добавляем числа в глобальный набор использованных
                        uniqueNumbers.forEach(num => usedNumbers.add(num));
                        
                        return uniqueNumbers.map(num => ({
                          number: num,
                          description: HEALTH_RECOMMENDATIONS[num]?.description || 'Описание отсутствует'
                        }));
                      })();
                        
                        const physicsField = `${chakraKey}physics` as keyof typeof chakraData;
                        
                        return (
                          <View key={chakraKey} style={styles.chakraCard}>
                            <TouchableOpacity 
                              style={styles.chakraHeader} 
                              onPress={() => toggleChakraSection(chakraKey as 'sah' | 'aj' | 'vish' | 'anah' | 'man' | 'svad' | 'mul')}
                            >
                              <View style={styles.chakraHeaderContent}>
                                <Text style={styles.chakraHeaderTitle}>
                                  {healthData.organs}
                                </Text>
                                <Text style={styles.chakraHeaderSubtitle}>
                                  {healthData.name} - {chakraData[physicsField]}
                                </Text>
                              </View>
                              <Text style={styles.chakraToggleIcon}>
                                {expandedChakraSections[chakraKey as keyof typeof expandedChakraSections] ? '−' : '+'}
                              </Text>
                            </TouchableOpacity>
                            
                            {expandedChakraSections[chakraKey as keyof typeof expandedChakraSections] && (
                              <View style={styles.chakraContent}>
                                <View style={{marginBottom: 12}}>
                                  <Text style={{fontSize: 14, fontWeight: 600, color: '#e91e63', marginBottom: 6}}>
                                    Проблемы со здоровьем:
                                  </Text>
                                  <Text style={{fontSize: 13, color: '#b8b8d0', lineHeight: 18}}>
                                    {healthData.problems}
                                  </Text>
                                </View>

                                <View style={{marginBottom: 12}}>
                                  <Text style={{fontSize: 14, fontWeight: 600, color: '#ff9800', marginBottom: 6}}>
                                    Причины:
                                  </Text>
                                  <Text style={{fontSize: 13, color: '#b8b8d0', lineHeight: 18}}>
                                    {healthData.causes}
                                  </Text>
                                </View>

                                <View style={{marginBottom: 12}}>
                                  <Text style={{fontSize: 14, fontWeight: 600, color: '#4caf50', marginBottom: 6}}>
                                    Решение:
                                  </Text>
                                  <Text style={{fontSize: 13, color: '#b8b8d0', lineHeight: 18}}>
                                    {healthData.solution}
                                  </Text>
                                </View>
                                
                                {/* Рекомендации по числам */}
                                {recommendations && recommendations.length > 0 && (
                                  <View style={{marginTop: 12}}>
                                    <Text style={{fontSize: 14, fontWeight: 600, color: '#ffd700', marginBottom: 10}}>
                                      Рекомендации по числам:
                                    </Text>
                                    {recommendations.map((rec, index) => (
                                      <View key={rec.number} style={[
                                        {marginBottom: index < recommendations.length - 1 ? 12 : 0},
                                        {paddingBottom: index < recommendations.length - 1 ? 12 : 0},
                                        index < recommendations.length - 1 && {borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)'}
                                      ]}>
                                        <View style={{flexDirection: 'row', gap: 8, alignItems: 'flex-start'}}>
                                          <View style={{
                                            width: 26,
                                            height: 26,
                                            borderRadius: 13,
                                            backgroundColor: '#ffd700',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                          }}>
                                            <Text style={{
                                              color: '#1a1a2e',
                                              fontSize: 13,
                                              fontWeight: '700',
                                            }}>
                                              {rec.number}
                                            </Text>
                                          </View>
                                          <Text style={{
                                            fontSize: 13,
                                            color: '#b8b8d0',
                                            lineHeight: 18,
                                            flex: 1,
                                          }}>
                                            {rec.description}
                                          </Text>
                                        </View>
                                      </View>
                                    ))}
                                  </View>
                                )}
                              </View>
                            )}
                          </View>
                        );
                      })}
                    )()}
                  </View>
                ) : (
                  <View style={styles.lockedBlock}>
                    <Crown size={28} color="#ffd700" />
                    <Text style={styles.lockedText}>Доступно только для премиум</Text>
                    <TouchableOpacity style={styles.unlockButton} onPress={() => router.push("/subscription")}>
                      <LinearGradient colors={["#ffd700", "#ffed4e"]} style={styles.unlockGradient}>
                        <Text style={styles.unlockText}>Открыть доступ</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )
              )}

              {/* Прошлые жизни */}
              {matrixTab === "pastlives" && (
                <View style={styles.contentCard}>
                  <Text style={styles.contentTitle}>Прошлые жизни</Text>
                  {(() => {
                    // Формируем ключ из точек матрицы как в веб-версии
                    // J (332.59, 470), R (333, 510), D (332.7, 559)
                    const j = matrixData.points[12]?.value;  // J
                    const r = matrixData.points[20]?.value;  // R
                    const d = matrixData.points[4]?.value;   // D
                    
                    const key = `${j}-${r}-${d}`;
                    const pastLife = PAST_LIVES[key];
                    
                    return (
                      <>
                        <View style={styles.pastLifeIndicator}>
                          <View style={styles.arcanaCircle}>
                            <Text style={styles.arcanaNumber}>{j}</Text>
                          </View>
                          <Text style={styles.arcanaDash}>—</Text>
                          <View style={styles.arcanaCircle}>
                            <Text style={styles.arcanaNumber}>{r}</Text>
                          </View>
                          <Text style={styles.arcanaDash}>—</Text>
                          <View style={styles.arcanaCircle}>
                            <Text style={styles.arcanaNumber}>{d}</Text>
                          </View>
                        </View>
                        
                        {pastLife ? (
                          <>
                            <Text style={styles.pastLifeTitle}>{pastLife.name}</Text>
                            <Text style={styles.contentText}>{pastLife.description}</Text>
                          </>
                        ) : (
                          <Text style={styles.contentText}>
                            Информация о прошлых жизнях для комбинации {key} пока недоступна.
                          </Text>
                        )}
                      </>
                    );
                  })()}
                </View>
              )}

              {/* Дети */}
              {matrixTab === "children" && (
                isPremium ? (
                <View style={styles.contentCard}>
                  <Text style={styles.contentTitle}>Ошибки по отношению к детям</Text>
                  
                  {(() => {
                    // Используем те же точки что и в веб-версии: индексы 9, 17, 1
                    const numbers = [
                      { value: matrixData.points[9]?.value, index: 9 },
                      { value: matrixData.points[17]?.value, index: 17 },
                      { value: matrixData.points[1]?.value, index: 1 }
                    ].filter(num => num.value !== undefined);
                    
                    // Убираем дубликаты, но сохраняем порядок
                    const uniqueNumbers: { value: number; index: number }[] = [];
                    const seenValues = new Set<number>();
                    
                    numbers.forEach(num => {
                      if (!seenValues.has(num.value!)) {
                        seenValues.add(num.value!);
                        uniqueNumbers.push(num as { value: number; index: number });
                      }
                    });
                    
                    return (
                      <>
                        {uniqueNumbers.map((num, idx) => {
                          const childrenMistake = CHILDREN_MISTAKES[num.value];
                          const isLast = idx === uniqueNumbers.length - 1;
                          
                          return (
                            <View key={`${num.index}-${num.value}`} style={{ marginBottom: isLast ? 0 : 20 }}>
                              <View style={styles.arcanaIndicator}>
                                <View style={styles.arcanaCircle}>
                                  <Text style={styles.arcanaNumber}>{num.value}</Text>
                                </View>
                                <Text style={styles.arcanaText}>
                                  Ошибки по отношению к детям
                                </Text>
                              </View>
                              
                              {childrenMistake ? (
                                <Text style={styles.contentText}>
                                  {childrenMistake}
                                </Text>
                              ) : (
                                <Text style={styles.contentText}>
                                  Информация об ошибках в воспитании для аркана {num.value} пока недоступна.
                                </Text>
                              )}
                              
                              {!isLast && (
                                <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginTop: 16 }} />
                              )}
                            </View>
                          );
                        })}
                      </>
                    );
                  })()}
                </View>
                ) : (
                  <View style={styles.lockedBlock}>
                    <Crown size={28} color="#ffd700" />
                    <Text style={styles.lockedText}>Доступно только для премиум</Text>
                    <TouchableOpacity style={styles.unlockButton} onPress={() => router.push("/subscription")}>
                      <LinearGradient colors={["#ffd700", "#ffed4e"]} style={styles.unlockGradient}>
                        <Text style={styles.unlockText}>Открыть доступ</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )
              )}

              {/* Предназначение */}
              {matrixTab === "purpose" && (
                isPremium ? (
                <View style={styles.contentCard}>
                  <Text style={styles.contentTitle}>Предназначение</Text>
                  
                  {(() => {
                    // Используем данные из matrixData.purposes как в веб-версии
                    const purposes = [
                      { 
                        value: matrixData.purposes.perspurpose, 
                        title: "Предназначение (20-40 лет)",
                        data: PURPOSE_20_40
                      },
                      { 
                        value: matrixData.purposes.socialpurpose, 
                        title: "Предназначение (40-60 лет)",
                        data: PURPOSE_40_60
                      },
                      { 
                        value: matrixData.purposes.generalpurpose, 
                        title: "Предназначение (общее)",
                        data: PURPOSE_GENERAL
                      }
                    ];
                    
                    // Убираем дубликаты, но сохраняем порядок
                    const uniquePurposes: typeof purposes = [];
                    const seenValues = new Set<number>();
                    
                    purposes.forEach(purpose => {
                      if (!seenValues.has(purpose.value)) {
                        seenValues.add(purpose.value);
                        uniquePurposes.push(purpose);
                      }
                    });
                    
                    return (
                      <>
                        {uniquePurposes.map((purpose, idx) => {
                          const purposeData = purpose.data[purpose.value];
                          const isLast = idx === uniquePurposes.length - 1;
                          
                          return (
                            <View key={`${purpose.title}-${purpose.value}`} style={{ marginBottom: isLast ? 0 : 20 }}>
                              <View style={styles.arcanaIndicator}>
                                <View style={styles.arcanaCircle}>
                                  <Text style={styles.arcanaNumber}>{purpose.value}</Text>
                                </View>
                                <Text style={styles.arcanaText}>
                                  {purpose.title}
                                </Text>
                              </View>
                              
                              {purposeData ? (
                                <Text style={styles.contentText}>
                                  {purposeData.description}
                                </Text>
                              ) : (
                                <Text style={styles.contentText}>
                                  Информация о предназначении для аркана {purpose.value} пока недоступна.
                                </Text>
                              )}
                              
                              {!isLast && (
                                <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginTop: 16 }} />
                              )}
                            </View>
                          );
                        })}
                      </>
                    );
                  })()}
                </View>
                ) : (
                  <View style={styles.lockedBlock}>
                    <Crown size={28} color="#ffd700" />
                    <Text style={styles.lockedText}>Доступно только для премиум</Text>
                    <TouchableOpacity style={styles.unlockButton} onPress={() => router.push("/subscription")}>
                      <LinearGradient colors={["#ffd700", "#ffed4e"]} style={styles.unlockGradient}>
                        <Text style={styles.unlockText}>Открыть доступ</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )
              )}

              {/* Руководство */}
              {matrixTab === "guidance" && (
                isPremium ? (
                <View style={styles.contentCard}>
                  <Text style={styles.contentTitle}>Рекомендации по управлению</Text>
                  
                  {(() => {
                    // Используем те же точки что и в веб-версии: индексы 1, 2, 0
                    const numbers = [
                      { value: matrixData.points[1]?.value, index: 1 },
                      { value: matrixData.points[2]?.value, index: 2 },
                      { value: matrixData.points[0]?.value, index: 0 }
                    ].filter(num => num.value !== undefined);
                    
                    // Убираем дубликаты, но сохраняем порядок
                    const uniqueNumbers: { value: number; index: number }[] = [];
                    const seenValues = new Set<number>();
                    
                    numbers.forEach(num => {
                      if (!seenValues.has(num.value!)) {
                        seenValues.add(num.value!);
                        uniqueNumbers.push(num as { value: number; index: number });
                      }
                    });
                    
                    return (
                      <>
                        {uniqueNumbers.map((num, idx) => {
                          const guidance = MANAGEMENT_GUIDANCE[num.value];
                          const isLast = idx === uniqueNumbers.length - 1;
                          
                          return (
                            <View key={`${num.index}-${num.value}`} style={{ marginBottom: isLast ? 0 : 20 }}>
                              <View style={styles.arcanaIndicator}>
                                <View style={styles.arcanaCircle}>
                                  <Text style={styles.arcanaNumber}>{num.value}</Text>
                                </View>
                                <Text style={styles.arcanaText}>
                                  Рекомендации по управлению
                                </Text>
                              </View>
                              
                              {guidance ? (
                                <Text style={styles.contentText}>
                                  {guidance}
                                </Text>
                              ) : (
                                <Text style={styles.contentText}>
                                  Информация о руководстве по жизни для аркана {num.value} пока недоступна.
                                </Text>
                              )}
                              
                              {!isLast && (
                                <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginTop: 16 }} />
                              )}
                            </View>
                          );
                        })}
                      </>
                    );
                  })()}
                </View>
                ) : (
                  <View style={styles.lockedBlock}>
                    <Crown size={28} color="#ffd700" />
                    <Text style={styles.lockedText}>Доступно только для премиум</Text>
                    <TouchableOpacity style={styles.unlockButton} onPress={() => router.push("/subscription")}>
                      <LinearGradient colors={["#ffd700", "#ffed4e"]} style={styles.unlockGradient}>
                        <Text style={styles.unlockText}>Открыть доступ</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )
              )}

              {/* Отношения */}
              {matrixTab === "relationships" && (
                isPremium ? (
                <View style={styles.contentCard}>
                  <Text style={styles.contentTitle}>Отношения</Text>
                  
                  {(() => {
                    // Используем те же точки что и в веб-версии: индексы 12, 16 для отношений и характера, 15 для выхода
                    const relationshipNumbers = [
                      { value: matrixData.points[12]?.value, index: 12 },
                      { value: matrixData.points[16]?.value, index: 16 }
                    ].filter(num => num.value !== undefined);
                    
                    const exitNumber = matrixData.points[15]?.value;
                    
                    // Убираем дубликаты для отношений и характера
                    const uniqueRelationshipNumbers: { value: number; index: number }[] = [];
                    const seenValues = new Set<number>();
                    
                    relationshipNumbers.forEach(num => {
                      if (!seenValues.has(num.value!)) {
                        seenValues.add(num.value!);
                        uniqueRelationshipNumbers.push(num as { value: number; index: number });
                      }
                    });
                    
                    return (
                      <>
                        {/* Отношения для женщин */}
                        {uniqueRelationshipNumbers.map((num, idx) => {
                          const relationshipData = RELATIONSHIPS_WOMEN[num.value];
                          const isLast = idx === uniqueRelationshipNumbers.length - 1;
                          
                          return (
                            <View key={`women-${num.index}-${num.value}`} style={{ marginBottom: isLast ? 20 : 16 }}>
                              <View style={[styles.arcanaIndicator, { backgroundColor: 'rgba(255, 105, 180, 0.1)' }]}>
                                <View style={[styles.arcanaCircle, { backgroundColor: '#ff69b4' }]}>
                                  <Text style={styles.arcanaNumber}>{num.value}</Text>
                                </View>
                                <Text style={styles.arcanaText}>
                                  Отношения для женщин
                                </Text>
                              </View>
                              
                              {relationshipData ? (
                                <Text style={styles.contentText}>
                                  {relationshipData}
                                </Text>
                              ) : (
                                <Text style={styles.contentText}>
                                  Информация об отношениях для женщин для аркана {num.value} пока недоступна.
                                </Text>
                              )}
                            </View>
                          );
                        })}
                        
                        {/* Разделитель перед разделом для мужчин */}
                        <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginTop: 16, marginBottom: 16 }} />
                        
                        {/* Отношения для мужчин */}
                        {uniqueRelationshipNumbers.map((num, idx) => {
                          const relationshipData = RELATIONSHIPS_MEN[num.value];
                          const isLast = idx === uniqueRelationshipNumbers.length - 1;
                          
                          return (
                            <View key={`men-${num.index}-${num.value}`} style={{ marginBottom: isLast ? 20 : 16 }}>
                              <View style={[styles.arcanaIndicator, { backgroundColor: 'rgba(65, 105, 225, 0.1)' }]}>
                                <View style={[styles.arcanaCircle, { backgroundColor: '#4169e1' }]}>
                                  <Text style={styles.arcanaNumber}>{num.value}</Text>
                                </View>
                                <Text style={styles.arcanaText}>
                                  Отношения для мужчин
                                </Text>
                              </View>
                              
                              {relationshipData ? (
                                <Text style={styles.contentText}>
                                  {relationshipData}
                                </Text>
                              ) : (
                                <Text style={styles.contentText}>
                                  Информация об отношениях для мужчин для аркана {num.value} пока недоступна.
                                </Text>
                              )}
                            </View>
                          );
                        })}
                        
                        {/* Разделитель перед разделом "На выходе" */}
                        {exitNumber && <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginTop: 16, marginBottom: 16 }} />}
                        
                        {/* На выходе */}
                        {exitNumber && (
                          <>
                            <View style={{ marginBottom: 20 }}>
                              <View style={[styles.arcanaIndicator, { backgroundColor: 'rgba(255, 68, 68, 0.1)' }]}>
                                <View style={[styles.arcanaCircle, { backgroundColor: '#ff4444' }]}>
                                  <Text style={styles.arcanaNumber}>{exitNumber}</Text>
                                </View>
                                <Text style={styles.arcanaText}>
                                  На выходе
                                </Text>
                              </View>
                              
                              {EXIT_REASONS[exitNumber] ? (
                                <Text style={styles.contentText}>
                                  {EXIT_REASONS[exitNumber]}
                                </Text>
                              ) : (
                                <Text style={styles.contentText}>
                                  Информация о причинах расставания для аркана {exitNumber} пока недоступна.
                                </Text>
                              )}
                            </View>
                          </>
                        )}
                        
                        {/* Разделитель перед разделом "Характер партнера" */}
                        <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginTop: 16, marginBottom: 16 }} />
                        
                        {/* Характер партнера */}
                        {uniqueRelationshipNumbers.map((num, idx) => {
                          const characterData = CHARACTER[num.value];
                          const isLast = idx === uniqueRelationshipNumbers.length - 1;
                          
                          return (
                            <View key={`character-${num.index}-${num.value}`} style={{ marginBottom: isLast ? 0 : 16 }}>
                              <View style={[styles.arcanaIndicator, { backgroundColor: 'rgba(50, 205, 50, 0.1)' }]}>
                                <View style={[styles.arcanaCircle, { backgroundColor: '#32cd32' }]}>
                                  <Text style={styles.arcanaNumber}>{num.value}</Text>
                                </View>
                                <Text style={styles.arcanaText}>
                                  Характер партнера
                                </Text>
                              </View>
                              
                              {characterData ? (
                                <Text style={styles.contentText}>
                                  {characterData}
                                </Text>
                              ) : (
                                <Text style={styles.contentText}>
                                  Информация о характере партнера для аркана {num.value} пока недоступна.
                                </Text>
                              )}
                            </View>
                          );
                        })}
                      </>
                    );
                  })()}
                </View>
                ) : (
                  <View style={styles.lockedBlock}>
                    <Crown size={28} color="#ffd700" />
                    <Text style={styles.lockedText}>Доступно только для премиум</Text>
                    <TouchableOpacity style={styles.unlockButton} onPress={() => router.push("/subscription")}>
                      <LinearGradient colors={["#ffd700", "#ffed4e"]} style={styles.unlockGradient}>
                        <Text style={styles.unlockText}>Открыть доступ</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )
              )}

              {/* Прогноз на год */}
              {matrixTab === "yearforecast" && (
                <View style={styles.contentCard}>
                  <Text style={styles.contentTitle}>Прогноз на год</Text>
                  
                  {(() => {
                    // Вычисляем возраст и числа как в веб-версии
                    const today = new Date();
                    
                    // Конвертируем дату из формата DD.MM.YYYY в Date
                    const [day, month, year] = birthDate.split('.').map(Number);
                    const birth = new Date(year, month - 1, day); // month - 1 потому что месяцы в JS начинаются с 0
                    
                    const age = today.getFullYear() - birth.getFullYear() - 
                      (today.getMonth() < birth.getMonth() || 
                       (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate()) ? 1 : 0);
                    
                    // Первое число - суть года (текущий возраст)
                    const essenceNumber = matrixData.points[0].value + (age % 22 === 0 ? 22 : age % 22);
                    const normalizedEssenceNumber = essenceNumber > 22 ? essenceNumber - 22 : essenceNumber;
                    
                    // Второе число - причины событий (возраст ±40)
                    const adjustedAge = age <= 40 ? age + 40 : age - 40;
                    const reasonsNumber = matrixData.points[0].value + (adjustedAge % 22 === 0 ? 22 : adjustedAge % 22);
                    const normalizedReasonsNumber = reasonsNumber > 22 ? reasonsNumber - 22 : reasonsNumber;
                    
                    return (
                      <>
                        {/* Суть года, основной мотив */}
                        <Text style={[styles.arcanaText, { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#9c27b0' }]}>
                          Суть года, основной мотив
                        </Text>
                        <Text style={[styles.arcanaText, { fontSize: 13, color: '#b8b8d0', marginBottom: 12 }]}>
                          Возраст: {age} лет
                        </Text>
                        
                        <View style={{ marginBottom: 20 }}>
                          <View style={[styles.arcanaIndicator, { backgroundColor: 'rgba(156, 39, 176, 0.1)' }]}>
                            <View style={[styles.arcanaCircle, { backgroundColor: '#9c27b0' }]}>
                              <Text style={styles.arcanaNumber}>{normalizedEssenceNumber}</Text>
                            </View>
                            <Text style={styles.arcanaText}>
                              В плюсе
                            </Text>
                          </View>
                          
                          {YEAR_ESSENCE[normalizedEssenceNumber] ? (
                            <Text style={styles.contentText}>
                              {YEAR_ESSENCE[normalizedEssenceNumber].positive}
                            </Text>
                          ) : (
                            <Text style={styles.contentText}>
                              Информация о позитивном сценарии для аркана {normalizedEssenceNumber} пока недоступна.
                            </Text>
                          )}
                          
                          <View style={[styles.arcanaIndicator, { backgroundColor: 'rgba(156, 39, 176, 0.1)', marginTop: 16 }]}>
                            <View style={[styles.arcanaCircle, { backgroundColor: '#9c27b0' }]}>
                              <Text style={styles.arcanaNumber}>{normalizedEssenceNumber}</Text>
                            </View>
                            <Text style={styles.arcanaText}>
                              В минусе
                            </Text>
                          </View>
                          
                          {YEAR_ESSENCE[normalizedEssenceNumber] ? (
                            <Text style={styles.contentText}>
                              {YEAR_ESSENCE[normalizedEssenceNumber].negative}
                            </Text>
                          ) : (
                            <Text style={styles.contentText}>
                              Информация о негативном сценарии для аркана {normalizedEssenceNumber} пока недоступна.
                            </Text>
                          )}
                        </View>
                        
                        {/* Разделитель */}
                        <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 16 }} />
                        
                        {/* Причины событий */}
                        <Text style={[styles.arcanaText, { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#2196f3' }]}>
                          Причины событий
                        </Text>
                        
                        <View>
                          <View style={[styles.arcanaIndicator, { backgroundColor: 'rgba(33, 150, 243, 0.1)' }]}>
                            <View style={[styles.arcanaCircle, { backgroundColor: '#2196f3' }]}>
                              <Text style={styles.arcanaNumber}>{normalizedReasonsNumber}</Text>
                            </View>
                            <Text style={styles.arcanaText}>
                              В плюсе
                            </Text>
                          </View>
                          
                          {YEAR_REASONS[normalizedReasonsNumber] ? (
                            <Text style={styles.contentText}>
                              {YEAR_REASONS[normalizedReasonsNumber].positive}
                            </Text>
                          ) : (
                            <Text style={styles.contentText}>
                              Информация о позитивных причинах для аркана {normalizedReasonsNumber} пока недоступна.
                            </Text>
                          )}
                          
                          <View style={[styles.arcanaIndicator, { backgroundColor: 'rgba(33, 150, 243, 0.1)', marginTop: 16 }]}>
                            <View style={[styles.arcanaCircle, { backgroundColor: '#2196f3' }]}>
                              <Text style={styles.arcanaNumber}>{normalizedReasonsNumber}</Text>
                            </View>
                            <Text style={styles.arcanaText}>
                              В минусе
                            </Text>
                          </View>
                          
                          {YEAR_REASONS[normalizedReasonsNumber] ? (
                            <Text style={styles.contentText}>
                              {YEAR_REASONS[normalizedReasonsNumber].negative}
                            </Text>
                          ) : (
                            <Text style={styles.contentText}>
                              Информация о негативных причинах для аркана {normalizedReasonsNumber} пока недоступна.
                            </Text>
                          )}
                        </View>
                      </>
                    );
                  })()}
                </View>
              )}

              {/* Родители */}
              {matrixTab === "parents" && (
                isPremium ? (
                <View style={styles.contentCard}>
                  <Text style={styles.contentTitle}>Родители</Text>
                  
                  {(() => {
                    // Родовые программы по мужской линии: точки 5, 27, 26, 30, 31, 7
                    const maleLineNumbers = [
                      { value: matrixData.points[5]?.value, index: 5 },
                      { value: matrixData.points[27]?.value, index: 27 },
                      { value: matrixData.points[26]?.value, index: 26 },
                      { value: matrixData.points[30]?.value, index: 30 },
                      { value: matrixData.points[31]?.value, index: 31 },
                      { value: matrixData.points[7]?.value, index: 7 }
                    ].filter(num => num.value !== undefined);
                    
                    // Родовые программы по женской линии: точки 6, 29, 28, 32, 33, 8
                    const femaleLineNumbers = [
                      { value: matrixData.points[6]?.value, index: 6 },
                      { value: matrixData.points[29]?.value, index: 29 },
                      { value: matrixData.points[28]?.value, index: 28 },
                      { value: matrixData.points[32]?.value, index: 32 },
                      { value: matrixData.points[33]?.value, index: 33 },
                      { value: matrixData.points[8]?.value, index: 8 }
                    ].filter(num => num.value !== undefined);
                    
                    // Обиды на родителей: точки 9, 17, 1
                    const resentmentNumbers = [
                      { value: matrixData.points[9]?.value, index: 9 },
                      { value: matrixData.points[17]?.value, index: 17 },
                      { value: matrixData.points[1]?.value, index: 1 }
                    ].filter(num => num.value !== undefined);
                    
                    // Убираем дубликаты для каждого раздела
                    const getUniqueNumbers = (numbers: { value: number; index: number }[]) => {
                      const uniqueNumbers: { value: number; index: number }[] = [];
                      const seenValues = new Set<number>();
                      
                      numbers.forEach(num => {
                        if (!seenValues.has(num.value)) {
                          seenValues.add(num.value);
                          uniqueNumbers.push(num);
                        }
                      });
                      
                      return uniqueNumbers;
                    };
                    
                    const uniqueMaleLineNumbers = getUniqueNumbers(maleLineNumbers);
                    const uniqueFemaleLineNumbers = getUniqueNumbers(femaleLineNumbers);
                    const uniqueResentmentNumbers = getUniqueNumbers(resentmentNumbers);
                    
                    return (
                      <>
                        {/* Родовые программы по мужской линии */}
                        <View style={[styles.talentSection, { borderLeftColor: '#2196f3' }]}>
                          <TouchableOpacity 
                            style={styles.talentHeader} 
                            onPress={() => toggleParentsSection('maleLine')}
                          >
                            <View style={styles.talentHeaderContent}>
                              <Text style={styles.talentHeaderTitle}>Родовые программы по мужской линии</Text>
                            </View>
                            <Text style={[styles.expandIcon, { color: '#2196f3' }]}>
                              {expandedParentsSections.maleLine ? '−' : '+'}
                            </Text>
                          </TouchableOpacity>
                          
                          {expandedParentsSections.maleLine && (
                            <View style={styles.talentContent}>
                              {uniqueMaleLineNumbers.map((num, idx) => {
                                const maleLineData = PARENTS_MALE_LINE[num.value];
                                const isLast = idx === uniqueMaleLineNumbers.length - 1;
                                
                                return (
                                  <View key={`male-${num.index}-${num.value}`} style={{ marginBottom: isLast ? 0 : 16 }}>
                                    <View style={[styles.arcanaIndicator, { backgroundColor: 'rgba(33, 150, 243, 0.1)' }]}>
                                      <View style={[styles.arcanaCircle, { backgroundColor: '#2196f3' }]}>
                                        <Text style={styles.arcanaNumber}>{num.value}</Text>
                                      </View>
                                      <Text style={styles.arcanaText}>
                                        Родовые программы по мужской линии
                                      </Text>
                                    </View>
                                    
                                    {maleLineData ? (
                                      <Text style={styles.contentText}>
                                        {maleLineData}
                                      </Text>
                                    ) : (
                                      <Text style={styles.contentText}>
                                        Информация о родовых программах по мужской линии для аркана {num.value} пока недоступна.
                                      </Text>
                                    )}
                                    
                                    {!isLast && (
                                      <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginTop: 16 }} />
                                    )}
                                  </View>
                                );
                              })}
                            </View>
                          )}
                        </View>
                        
                        {/* Родовые программы по женской линии */}
                        <View style={[styles.talentSection, { borderLeftColor: '#e91e63' }]}>
                          <TouchableOpacity 
                            style={styles.talentHeader} 
                            onPress={() => toggleParentsSection('femaleLine')}
                          >
                            <View style={styles.talentHeaderContent}>
                              <Text style={styles.talentHeaderTitle}>Родовые программы по женской линии</Text>
                            </View>
                            <Text style={[styles.expandIcon, { color: '#e91e63' }]}>
                              {expandedParentsSections.femaleLine ? '−' : '+'}
                            </Text>
                          </TouchableOpacity>
                          
                          {expandedParentsSections.femaleLine && (
                            <View style={styles.talentContent}>
                              {uniqueFemaleLineNumbers.map((num, idx) => {
                                const femaleLineData = PARENTS_FEMALE_LINE[num.value];
                                const isLast = idx === uniqueFemaleLineNumbers.length - 1;
                                
                                return (
                                  <View key={`female-${num.index}-${num.value}`} style={{ marginBottom: isLast ? 0 : 16 }}>
                                    <View style={[styles.arcanaIndicator, { backgroundColor: 'rgba(233, 30, 99, 0.1)' }]}>
                                      <View style={[styles.arcanaCircle, { backgroundColor: '#e91e63' }]}>
                                        <Text style={styles.arcanaNumber}>{num.value}</Text>
                                      </View>
                                      <Text style={styles.arcanaText}>
                                        Родовые программы по женской линии
                                      </Text>
                                    </View>
                                    
                                    {femaleLineData ? (
                                      <Text style={styles.contentText}>
                                        {femaleLineData}
                                      </Text>
                                    ) : (
                                      <Text style={styles.contentText}>
                                        Информация о родовых программах по женской линии для аркана {num.value} пока недоступна.
                                      </Text>
                                    )}
                                    
                                    {!isLast && (
                                      <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginTop: 16 }} />
                                    )}
                                  </View>
                                );
                              })}
                            </View>
                          )}
                        </View>
                        
                        {/* Обиды на родителей */}
                        <View style={[styles.talentSection, { borderLeftColor: '#ff9800' }]}>
                          <TouchableOpacity 
                            style={styles.talentHeader} 
                            onPress={() => toggleParentsSection('resentments')}
                          >
                            <View style={styles.talentHeaderContent}>
                              <Text style={styles.talentHeaderTitle}>Обиды на родителей</Text>
                            </View>
                            <Text style={[styles.expandIcon, { color: '#ff9800' }]}>
                              {expandedParentsSections.resentments ? '−' : '+'}
                            </Text>
                          </TouchableOpacity>
                          
                          {expandedParentsSections.resentments && (
                            <View style={styles.talentContent}>
                              {uniqueResentmentNumbers.map((num, idx) => {
                                const resentmentData = PARENTS_RESENTMENTS[num.value];
                                const isLast = idx === uniqueResentmentNumbers.length - 1;
                                
                                return (
                                  <View key={`resentment-${num.index}-${num.value}`} style={{ marginBottom: isLast ? 0 : 16 }}>
                                    <View style={[styles.arcanaIndicator, { backgroundColor: 'rgba(255, 152, 0, 0.1)' }]}>
                                      <View style={[styles.arcanaCircle, { backgroundColor: '#ff9800' }]}>
                                        <Text style={styles.arcanaNumber}>{num.value}</Text>
                                      </View>
                                      <Text style={styles.arcanaText}>
                                        Обиды на родителей
                                      </Text>
                                    </View>
                                    
                                    {resentmentData ? (
                                      <Text style={styles.contentText}>
                                        {resentmentData}
                                      </Text>
                                    ) : (
                                      <Text style={styles.contentText}>
                                        Информация об обидах на родителей для аркана {num.value} пока недоступна.
                                      </Text>
                                    )}
                                    
                                    {!isLast && (
                                      <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginTop: 16 }} />
                                    )}
                                  </View>
                                );
                              })}
                            </View>
                          )}
                        </View>
                      </>
                    );
                  })()}
                </View>
                ) : (
                  <View style={styles.lockedBlock}>
                    <Crown size={28} color="#ffd700" />
                    <Text style={styles.lockedText}>Доступно только для премиум</Text>
                    <TouchableOpacity style={styles.unlockButton} onPress={() => router.push("/subscription")}>
                      <LinearGradient colors={["#ffd700", "#ffed4e"]} style={styles.unlockGradient}>
                        <Text style={styles.unlockText}>Открыть доступ</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )
              )}

              {matrixTab === "visual" && (
                <View style={styles.personalityContainer}>
                  <Text style={styles.personalityTitle}>Характер и суперсила по матрице</Text>

                  <View style={styles.personalityCard}>
                    <Text style={styles.personalityCardTitle}>В плюсе</Text>
                    <View style={styles.personalityIndicator}>
                      <View style={styles.smallArcanaCircle}>
                        <Text style={styles.smallArcanaNumber}>{matrixData.points[1]?.value}</Text>
                      </View>
                      <Text style={styles.personalityLabel}>
                        День рождения
                      </Text>
                    </View>
                    <Text style={styles.personalityText}>
                      {PERSONALITY_TRAITS[matrixData.points[1]?.value || 0]?.positive || "Описание отсутствует"}
                    </Text>
                    {matrixData.points[2] && matrixData.points[2].value !== matrixData.points[1]?.value && (
                      <>
                        <View style={styles.personalityDivider} />
                        <View style={styles.personalityIndicator}>
                          <View style={styles.smallArcanaCircle}>
                            <Text style={styles.smallArcanaNumber}>{matrixData.points[2].value}</Text>
                          </View>
                          <Text style={styles.personalityLabel}>
                            Месяц рождения
                          </Text>
                        </View>
                        <Text style={styles.personalityText}>
                          {PERSONALITY_TRAITS[matrixData.points[2].value]?.positive || "Описание отсутствует"}
                        </Text>
                      </>
                    )}
                  </View>

                  <View style={styles.personalityCard}>
                    <Text style={styles.personalityCardTitle}>В минусе</Text>
                    <View style={styles.personalityIndicator}>
                      <View style={styles.smallArcanaCircle}>
                        <Text style={styles.smallArcanaNumber}>{matrixData.points[1]?.value}</Text>
                      </View>
                      <Text style={styles.personalityLabel}>
                        День рождения
                      </Text>
                    </View>
                    <Text style={styles.personalityText}>
                      {PERSONALITY_TRAITS[matrixData.points[1]?.value || 0]?.negative || "Описание отсутствует"}
                    </Text>
                    {matrixData.points[2] && matrixData.points[2].value !== matrixData.points[1]?.value && (
                      <>
                        <View style={styles.personalityDivider} />
                        <View style={styles.personalityIndicator}>
                          <View style={styles.smallArcanaCircle}>
                            <Text style={styles.smallArcanaNumber}>{matrixData.points[2].value}</Text>
                          </View>
                          <Text style={styles.personalityLabel}>
                            Месяц рождения
                          </Text>
                        </View>
                        <Text style={styles.personalityText}>
                          {PERSONALITY_TRAITS[matrixData.points[2].value]?.negative || "Описание отсутствует"}
                        </Text>
                      </>
                    )}
                  </View>

                  <View style={styles.personalityCard}>
                    <Text style={styles.personalityCardTitle}>В общении</Text>
                    <View style={styles.personalityIndicator}>
                      <View style={styles.smallArcanaCircle}>
                        <Text style={styles.smallArcanaNumber}>{matrixData.points[0]?.value}</Text>
                      </View>
                      <Text style={styles.personalityLabel}>
                        Центральная точка
                      </Text>
                    </View>
                    <Text style={styles.personalityText}>
                      {PERSONALITY_TRAITS[matrixData.points[0]?.value || 0]?.communication || "Описание отсутствует"}
                    </Text>
                  </View>

                  <View style={styles.personalityCard}>
                    <Text style={styles.personalityCardTitle}>Ваша суперсила</Text>
                    <View style={styles.personalityIndicator}>
                      <View style={styles.smallArcanaCircle}>
                        <Text style={styles.smallArcanaNumber}>{matrixData.points[0]?.value}</Text>
                      </View>
                      <Text style={styles.personalityLabel}>
                        Центральная точка
                      </Text>
                    </View>
                    <Text style={styles.personalityText}>
                      {PERSONALITY_TRAITS[matrixData.points[0]?.value || 0]?.superpower || "Описание отсутствует"}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}
          <TouchableOpacity
            style={styles.changeButton}
            onPress={() => {
              setBirthDate("");
              setDateInput("");
            }}
          >
            <Calendar size={20} color="#ffd700" />
            <Text style={styles.changeText}>Изменить дату рождения</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Модальное окно для описаний */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <X size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{modalContent.title}</Text>
            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalDescription}>{modalContent.description}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

export default function HoroscopeScreen() {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!showContent) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#ffd700" />
        <Text style={styles.loadingScreenText}>Загружаем раздел эзотерики...</Text>
      </View>
    );
  }

  return <HoroscopeScreenInner />;
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
  dateInputContainer: {
    padding: 20,
    alignItems: "center",
  },
  inputLabel: {
    fontSize: 16,
    color: "#b8b8d0",
    marginBottom: 20,
  },
  dateInput: {
    width: "100%",
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  submitButton: {
    width: "100%",
  },
  submitGradient: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a2e",
  },
  tabSelector: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  tabButtonActive: {
    borderWidth: 1,
    borderColor: "#ffd700",
    elevation: 4,
    shadowColor: "#ffd700",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  tabButtonInactive: {
    borderWidth: 1,
    borderColor: "#666",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  tabGradient: {
    padding: 12,
    alignItems: "center",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#fff",
  },
  tabTextInactive: {
    color: "#b8b8d0",
  },
  zodiacCard: {
    margin: 20,
    borderRadius: 20,
    overflow: "hidden",
  },
  zodiacGradient: {
    padding: 30,
    alignItems: "center",
  },
  zodiacSymbol: {
    fontSize: 60,
    marginBottom: 10,
  },
  zodiacName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  zodiacDates: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 8,
  },
  zodiacElement: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  periodSelector: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  periodButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
  },
  periodButtonActive: {
    backgroundColor: "rgba(255,215,0,0.2)",
    borderWidth: 1,
    borderColor: "#ffd700",
  },
  periodText: {
    color: "#b8b8d0",
    fontSize: 14,
    fontWeight: "500",
  },
  periodTextActive: {
    color: "#ffd700",
  },
  horoscopeCard: {
    margin: 20,
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
  },
  horoscopeTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffd700",
    marginBottom: 12,
  },
  horoscopeText: {
    fontSize: 14,
    color: "#b8b8d0",
    lineHeight: 22,
  },
  horoscopeMeta: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    fontSize: 12,
    color: "#b8b8d0",
    opacity: 0.7,
  },
  infoCards: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 10,
  },
  infoCard: {
    flex: 1,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    alignItems: "center",
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    marginTop: 8,
    marginBottom: 8,
    textAlign: "center",
  },
  infoText: {
    fontSize: 12,
    color: "#b8b8d0",
    textAlign: "center",
  },
  infoHint: {
    fontSize: 10,
    color: "#ffd700",
    marginTop: 8,
    fontStyle: "italic",
    textAlign: "center",
  },
  compatibilityCard: {
    margin: 20,
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
  },
  compatibilityTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffd700",
    marginBottom: 16,
  },
  compatibilityList: {
    gap: 12,
  },
  compatibilityItem: {
    flexDirection: "row",
    gap: 8,
  },
  compatibilityLabel: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
    width: 80,
  },
  compatibilityValue: {
    fontSize: 14,
    color: "#b8b8d0",
    flex: 1,
  },
  changeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    margin: 20,
    padding: 12,
    backgroundColor: "rgba(255,215,0,0.2)",
    borderRadius: 12,
  },
  changeText: {
    color: "#ffd700",
    fontSize: 14,
    fontWeight: "500",
  },
  lockedBlock: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  lockedText: {
    color: "#b8b8d0",
    fontSize: 14,
    textAlign: "center",
    paddingLeft: 30,
    paddingRight: 30,
  },
  unlockButton: {
    marginHorizontal: 10,
    marginTop: 12,
  },
  unlockGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 10,
    borderRadius: 12,
  },
  unlockText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a2e",
  },
  matrixContainer: {
    alignItems: "center",
    marginTop: 0,
    marginBottom: 40,
    minHeight: Math.min(width * 1.2, height * 0.7, 600),
  },
  interpretationContainer: {
    padding: 20,
    paddingTop: 10,
  },
  interpretationTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffd700",
    marginBottom: 12,
  },
  pointCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  pointCardLocked: {
    opacity: 0.6,
  },
  pointHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  pointInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  pointValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffd700",
    width: 40,
    textAlign: "center",
  },
  pointMeaning: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  arcanaName: {
    fontSize: 12,
    color: "#b8b8d0",
    marginTop: 2,
  },
  pointDescription: {
    fontSize: 14,
    color: "#b8b8d0",
    lineHeight: 20,
  },
  personalityContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  personalityTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffd700",
    marginBottom: 12,
  },
  personalityCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  personalityCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  personalityLabel: {
    fontSize: 13,
    color: "#ffd700",
    marginBottom: 4,
  },
  personalityText: {
    fontSize: 13,
    color: "#b8b8d0",
    lineHeight: 20,
  },
  personalityDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 10,
  },
  matrixTabContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  matrixTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  matrixTabActive: {
    backgroundColor: "rgba(255,215,0,0.2)",
    borderWidth: 1,
    borderColor: "#ffd700",
  },
  matrixTabText: {
    color: "#b8b8d0",
    fontSize: 14,
    fontWeight: "500",
  },
  matrixTabTextActive: {
    color: "#ffd700",
  },
  matrixVisualization: {
    alignItems: "center",
    marginBottom: 20,
  },
  purposesCard: {
    margin: 20,
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
  },
  purposesTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffd700",
    marginBottom: 12,
  },
  purposeBlock: {
    marginBottom: 12,
    paddingVertical: 4,
  },
  purposeBlockTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  purposeBlockSubtitle: {
    fontSize: 13,
    color: "#b8b8d0",
    marginBottom: 4,
  },
  purposeBlockLine: {
    fontSize: 14,
    color: "#b8b8d0",
  },
  purposeBlockMain: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: "700",
    color: "#ffd700",
  },
  purposeValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffd700",
  },
  contentCard: {
    margin: 20,
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffd700",
    marginBottom: 16,
  },
  contentSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9c27b0",
    marginTop: 16,
    marginBottom: 8,
  },
  contentText: {
    fontSize: 14,
    color: "#b8b8d0",
    lineHeight: 22,
  },
  chakraCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#9c27b0",
  },
  chakraTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9c27b0",
    marginBottom: 8,
  },
  chakraOrgans: {
    fontSize: 13,
    color: "#ffd700",
    marginBottom: 12,
    fontStyle: "italic",
  },
  chakraSectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffd700",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  chakraShortCard: {
    marginHorizontal: 0,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  chakraShortTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  chakraShortRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  chakraShortLabel: {
    fontSize: 14,
    color: "#b8b8d0",
  },
  chakraShortValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffd700",
  },
  chakraLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
    marginTop: 8,
    marginBottom: 4,
  },
  chakraText: {
    fontSize: 13,
    color: "#b8b8d0",
    lineHeight: 20,
  },
  pastLifeTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffd700",
    marginBottom: 8,
    textAlign: "center",
  },
  pastLifeKey: {
    fontSize: 12,
    color: "#9c27b0",
    marginBottom: 16,
    textAlign: "center",
    fontStyle: "italic",
  },
  childrenSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4caf50",
    marginBottom: 12,
  },
  guidanceSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2196f3",
    marginBottom: 12,
  },
  relationshipSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ff69b4",
    marginTop: 16,
    marginBottom: 12,
  },
  yearForecastSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#00bcd4",
    marginTop: 20,
    marginBottom: 12,
  },
  yearForecastLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffd700",
    marginTop: 16,
    marginBottom: 8,
  },
  arcanaIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,215,0,0.1)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  arcanaCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ffd700",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  arcanaNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a2e",
  },
  arcanaText: {
    flex: 1,
    fontSize: 14,
    color: "#b8b8d0",
    lineHeight: 20,
  },
  pastLifeIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,215,0,0.1)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  arcanaDash: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffd700",
    marginHorizontal: 4,
    lineHeight: 50,
  },
  personalityIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 10,
  },
  smallArcanaCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffd700",
    justifyContent: "center",
    alignItems: "center",
  },
  smallArcanaNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a1a2e",
  },
  talentSection: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  talentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  talentCategory: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffd700",
  },
  talentNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ffd700",
    justifyContent: "center",
    alignItems: "center",
  },
  talentNumberText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a2e",
  },
  talentDescription: {
    fontSize: 14,
    color: "#b8b8d0",
    lineHeight: 20,
    flex: 1,
    marginLeft: 12,
  },
  talentItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  talentCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    borderLeftWidth: 3,
    borderLeftColor: "#ffd700",
  },
  talentToggleIcon: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  talentContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  talentItemWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
    paddingBottom: 16,
  },
  chakraHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  chakraHeaderContent: {
    flex: 1,
  },
  chakraHeaderTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffd700",
    marginBottom: 2,
  },
  chakraHeaderSubtitle: {
    fontSize: 12,
    color: "#b8b8d0",
    fontStyle: "italic",
  },
  chakraToggleIcon: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  chakraContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  talentHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  talentHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  talentNumbers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  expandIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
    marginBottom: 8,
  },
  chakraArrow: {
    fontSize: 16,
    color: "#9c27b0",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#1a1a2e",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxHeight: "80%",
    borderWidth: 1,
    borderColor: "#ffd700",
  },
  modalCloseButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffd700",
    marginBottom: 16,
    paddingRight: 40,
  },
  modalScrollView: {
    maxHeight: "100%",
  },
  modalDescription: {
    fontSize: 16,
    color: "#b8b8d0",
    lineHeight: 24,
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: "#0f0f1e",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingScreenText: {
    marginTop: 16,
    fontSize: 16,
    color: "#ffd700",
    textAlign: "center",
  },
});