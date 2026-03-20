import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Linking,
  TextInput,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Crown,
  Calendar,
  LogOut,
  LogIn,
  Bell,
  Globe,
  Info,
  HelpCircle,
  Sparkles,
  SquarePen,
  Key,
} from "lucide-react-native";
import { useSubscription } from "@/providers/SubscriptionProvider";
import { useUser } from "@/providers/UserProvider";
import { useAuth } from "@/providers/AuthProvider";
import { router } from "expo-router";
import { useDatabase } from "@/hooks/useDatabase";

export default function ProfileScreen() {
  const { isPremium, cardBack, setCardBack, cancelSubscription } = useSubscription(); 
  const { birthDate, setBirthDate, clearUserData } = useUser();
  const { user, logout, updateProfile, changePassword } = useAuth();
  const { logAction } = useDatabase();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [selectedCardBack, setSelectedCardBack] = useState(cardBack);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBirthDate, setEditBirthDate] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    setSelectedCardBack(cardBack);
  }, [cardBack]);

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

  const isValidDate = (date: string): boolean => {
    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(date)) return false;
    const [day, month, year] = date.split(".").map(Number);
    if (year < 1900 || year > 2100 || month < 1 || month > 12) return false;
    const daysInMonth = new Date(year, month, 0).getDate();
    return day >= 1 && day <= daysInMonth;
  };

  const handleLogin = () => {
    router.push("/auth");
  };

  const handleLogout = () => {
    Alert.alert(
      "Выход",
      "Выберите действие",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Выйти",
          style: "destructive",
          onPress: async () => {
            logAction("logout");
            await logout();
            clearUserData();
            router.replace("/auth");
          },
        },
      ]
    );
  };

  const supportContacts = [
    { name: "Ангелина Дмитриева", phone: "+7 (902) 851-01-87", email: "ychebka337@mail.ru" },
    { name: "Вероника Сараева", phone: "+7 (982) 186-36-10", email: "ychebka337@mail.ru" },
    { name: "Феона Симеонидис", phone: "+7 (951) 978-71-03", email: "ychebka337@mail.ru" },
  ];

  const showAboutApp = () => {
    logAction("view_about_app");
    Alert.alert(
      "О приложении",
      "Приложение создано для хакатона\n\nВерсия: 1.0.0\nЯзык: Русский",
      [{ text: "ОК" }]
    );
  };

  const showSupport = () => {
    logAction("view_support");
    const contactsText = supportContacts
      .map(c => `${c.name}\nТел: ${c.phone}\nEmail: ${c.email}`)
      .join("\n\n");

    Alert.alert(
      "Поддержка",
      contactsText,
      [
        { text: "Отмена", style: "cancel" },
        { 
          text: "Позвонить", 
          onPress: () => {
            logAction("support_call");
            Linking.openURL(`tel:${supportContacts[2].phone}`);
          },
        },
      ]
    );
  };

  const handleCardBackChange = (back: string) => {
    if (!isPremium) {
      logAction("attempt_card_back_change_non_premium");
      Alert.alert(
        "Премиум функция",
        "Выбор рубашки карт доступен только по подписке",
        [
          { text: "Отмена", style: "cancel" },
          { text: "Подписка", onPress: () => router.push("/subscription") },
        ]
      );
      return;
    }
    logAction(`change_card_back_${back}`);
    setSelectedCardBack(back);
    setCardBack(back);
  };

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription();
      logAction("cancel_subscription");
      setSelectedCardBack("purple");
      setCardBack("purple");
      Alert.alert("Успешно", "Подписка отменена");
    } catch (error) {
      console.error("Ошибка отмены подписки:", error);
      Alert.alert("Ошибка", "Не удалось отменить подписку. Попробуйте снова.");
    }
  };

  const cardBacks: { id: string; name: string; colors: [string, string, ...string[]]; textColor?: string }[] = [
    { id: "purple", name: "Фиолетовый", colors: ["#4a148c", "#7b1fa2", "#9c27b0"] },
    { id: "gold", name: "Золотистый", colors: ["#ffd700", "#ffed4e"], textColor: "#1a1a2e" },
    { id: "black", name: "Черный", colors: ["#1a1a2e", "#333"] },
    { id: "red", name: "Красный", colors: ["#d32f2f", "#f44336"] },
  ];

  const handleEditProfilePress = () => {
    setEditName(user?.name || "Мистический странник");
    setEditBirthDate(birthDate || "");
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    const trimmedName = editName.trim();
    const trimmedDate = editBirthDate.trim();

    if (!trimmedName) {
      Alert.alert("Ошибка", "Введите имя");
      return;
    }

    if (trimmedDate && !isValidDate(trimmedDate)) {
      Alert.alert("Ошибка", "Введите корректную дату в формате ДД.ММ.ГГГГ");
      return;
    }

    const success = await updateProfile(trimmedName, trimmedDate || undefined);
    if (!success) {
      Alert.alert("Ошибка", "Не удалось сохранить профиль. Попробуйте снова.");
      return;
    }

    if (trimmedDate) {
      await setBirthDate(trimmedDate);
    }

    logAction("update_profile");
    Alert.alert("Успешно", "Профиль обновлён");
    setIsEditingProfile(false);
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Ошибка", "Заполните все поля");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Ошибка", "Новые пароли не совпадают");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Ошибка", "Новый пароль должен быть не менее 6 символов");
      return;
    }

    const success = await changePassword(oldPassword, newPassword, confirmPassword);
    if (success) {
      logAction("change_password");
      Alert.alert("Успешно", "Пароль успешно изменён");
      setIsChangingPassword(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      Alert.alert("Ошибка", "Не удалось изменить пароль. Проверьте старый пароль");
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <LinearGradient
          colors={["#1a1a2e", "#16213e"]}
          style={styles.headerGradient}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.userName}>{user?.name || "Мистический странник"}</Text>
          {birthDate && (
            <View style={styles.birthDateBadge}>
              <Calendar size={14} color="#ffd700" />
              <Text style={styles.birthDateText}>{birthDate}</Text>
            </View>
          )}
          {user && (
            <View style={styles.profileButtonsContainer}>
              <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfilePress}>
                <SquarePen size={16} color="#ffffff" />
                <Text style={styles.editProfileText}>Редактировать</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.changePasswordButton} 
                onPress={() => {
                  setIsChangingPassword(true);
                  setOldPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
              >
                <Key size={16} color="#ffffff" />
                <Text style={styles.changePasswordText}>Пароль</Text>
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>
      </View>

      {isPremium ? (
        <View style={styles.premiumCard}>
          <LinearGradient
            colors={["#ffd700", "#ffed4e"]}
            style={styles.premiumGradient}
          >
            <Crown size={24} color="#1a1a2e" />
            <View style={styles.premiumInfo}>
              <Text style={styles.premiumTitle}>Премиум активен</Text>
              <Text style={styles.premiumSubtitle}>Безлимитный доступ</Text>
            </View>
          </LinearGradient>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              Alert.alert(
                "Отмена подписки",
                "Вы уверены, что хотите отменить подписку?",
                [
                  { text: "Нет", style: "cancel" },
                  { text: "Да", onPress: handleCancelSubscription },
                ]
              );
            }}
          >
            <Text style={styles.cancelText}>Отменить подписку</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.subscribeCard}
          onPress={() => {
            logAction("view_subscription_page");
            router.push("/subscription");
          }}
        >
          <LinearGradient
            colors={["#9c27b0", "#673ab7"]}
            style={styles.subscribeGradient}
          >
            <Crown size={24} color="#fff" />
            <View style={styles.subscribeInfo}>
              <Text style={styles.subscribeTitle}>Получить премиум</Text>
              <Text style={styles.subscribeSubtitle}>990₽ в месяц</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}

      <View style={styles.menuContainer}>
        <Text style={styles.sectionTitle}>Настройки</Text>

        {isPremium && (
          <View style={styles.menuItemCard}>
            <View style={styles.menuItemLeftCard}>
              <Sparkles size={20} color="#ffd700" />
              <Text style={styles.menuText}>Рубашка карт</Text>
            </View>
            <View style={styles.cardBackOptions}>
              {cardBacks.map(back => (
                <TouchableOpacity
                  key={back.id}
                  style={[
                    styles.cardBackButton,
                    selectedCardBack === back.id && styles.cardBackButtonSelected,
                  ]}
                  onPress={() => handleCardBackChange(back.id)}
                >
                  <LinearGradient
                    colors={back.colors}
                    style={styles.cardBackPreview}
                  >
                    <Text style={[styles.cardBackText, back.textColor ? { color: back.textColor } : undefined]}>{back.name}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Bell size={20} color="#ffd700" />
            <Text style={styles.menuText}>Уведомления</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={value => {
              logAction(`toggle_notifications_${value ? "on" : "off"}`);
              setNotificationsEnabled(value);
            }}
            trackColor={{ false: "#333", true: "#ffd700" }}
            thumbColor={notificationsEnabled ? "#fff" : "#666"}
          />
        </View>

        <View style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Globe size={20} color="#ffd700" />
            <Text style={styles.menuText}>Язык</Text>
          </View>
          <Text style={styles.menuValue}>Русский</Text>
        </View>

        <TouchableOpacity style={styles.menuItem} onPress={showAboutApp}>
          <View style={styles.menuItemLeft}>
            <Info size={20} color="#ffd700" />
            <Text style={styles.menuText}>О приложении</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={showSupport}>
          <View style={styles.menuItemLeft}>
            <HelpCircle size={20} color="#ffd700" />
            <Text style={styles.menuText}>Поддержка</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {!user ? (
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <LogIn size={20} color="#4caf50" />
          <Text style={styles.loginText}>Войти</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#ff4444" />
          <Text style={styles.logoutText}>Выйти</Text>
        </TouchableOpacity>
      )}

      <Modal visible={isEditingProfile} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Редактировать профиль</Text>
            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Имя</Text>
              <TextInput
                style={styles.modalInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Введите имя"
                placeholderTextColor="#666"
              />
            </View>
            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Дата рождения</Text>
              <TextInput
                style={styles.modalInput}
                value={editBirthDate}
                onChangeText={(text) => setEditBirthDate(formatDateInput(text))}
                placeholder="ДД.ММ.ГГГГ"
                placeholderTextColor="#666"
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setIsEditingProfile(false)}
              >
                <Text style={styles.modalButtonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleSaveProfile}
              >
                <Text style={styles.modalButtonTextPrimary}>Сохранить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isChangingPassword} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Сменить пароль</Text>
            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Старый пароль</Text>
              <TextInput
                style={styles.modalInput}
                value={oldPassword}
                onChangeText={setOldPassword}
                placeholder="Введите старый пароль"
                placeholderTextColor="#666"
                secureTextEntry
              />
            </View>
            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Новый пароль</Text>
              <TextInput
                style={styles.modalInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Минимум 6 символов"
                placeholderTextColor="#666"
                secureTextEntry
              />
            </View>
            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Повторите новый пароль</Text>
              <TextInput
                style={styles.modalInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Повторите новый пароль"
                placeholderTextColor="#666"
                secureTextEntry
              />
            </View>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setIsChangingPassword(false);
                  setOldPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
              >
                <Text style={styles.modalButtonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleChangePassword}
              >
                <Text style={styles.modalButtonTextPrimary}>Изменить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f1e",
  },
  header: {
    marginBottom: 20,
  },
  headerGradient: {
    padding: 30,
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
  },
  userName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  birthDateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,215,0,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  birthDateText: {
    color: "#ffd700",
    fontSize: 12,
  },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    gap: 6,
  },
  editProfileText: {
    color: "#fff",
    fontSize: 14,
  },
  profileButtonsContainer: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
    justifyContent: "center",
  },
  changePasswordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    gap: 6,
  },
  changePasswordText: {
    color: "#fff",
    fontSize: 14,
  },
  premiumCard: {
    margin: 20,
  },
  premiumGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    gap: 16,
  },
  premiumInfo: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a2e",
  },
  premiumSubtitle: {
    fontSize: 14,
    color: "#4a148c",
  },
  cancelButton: {
    marginTop: 12,
    padding: 12,
    alignItems: "center",
  },
  cancelText: {
    color: "#ff4444",
    fontSize: 14,
  },
  subscribeCard: {
    margin: 20,
  },
  subscribeGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    gap: 16,
  },
  subscribeInfo: {
    flex: 1,
  },
  subscribeTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  subscribeSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 16,
  },
  menuContainer: {
    padding: 20,
  },
  menuItemCard: {
    flexDirection: "column",
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    marginBottom: 10,
  },
  menuItemLeftCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuText: {
    fontSize: 16,
    color: "#fff",
  },
  menuArrow: {
    fontSize: 20,
    color: "#666",
  },
  menuValue: {
    fontSize: 14,
    color: "#b8b8d0",
  },
  cardBackOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  cardBackButton: {
    width: "48%",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  cardBackButtonSelected: {
    borderColor: "#ffd700",
  },
  cardBackPreview: {
    padding: 12,
    alignItems: "center",
    borderRadius: 5,
  },
  cardBackText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    margin: 20,
    padding: 16,
    backgroundColor: "rgba(255,68,68,0.1)",
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ff4444",
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    backgroundColor: "rgba(76,175,80,0.1)",
    borderRadius: 12,
  },
  loginText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4caf50",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#1a1a2e",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 16,
  },
  modalField: {
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 14,
    color: "#b8b8d0",
    marginBottom: 6,
  },
  modalInput: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#fff",
    fontSize: 16,
  },
  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  modalButtonPrimary: {
    backgroundColor: "#ffd700",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  modalButtonTextPrimary: {
    color: "#1a1a2e",
    fontSize: 14,
    fontWeight: "600",
  },
});