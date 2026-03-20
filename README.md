# Mystik (Mobile) + API

Это репозиторий с мобильным приложением на **Expo** (React Native) и отдельным **API-сервером** на **Node.js/Express**.

## Состав проекта

- Мобильное приложение: папка `.` (корень), Expo Router, TypeScript.
- API сервер: папка `server/`, Express + MySQL.

## Требования

- Node.js (рекомендуется LTS, совместим с проектом под Node 20+).
- `npm`
- Для сборки под Android: Android SDK + Android Studio (или эмулятор/устройство).
- Для сборки под iOS: macOS + Xcode (если нужна сборка iOS).

## Настройка переменных окружения

### Mobile (Expo)

Файл: `.env` в корне проекта.

Ожидаемая переменная:

- `EXPO_PUBLIC_API_URL` — базовый URL вашего API (например `http://localhost:3001` или `https://<ваше-домеенное-имя>`).

### API сервер

Файл: `server/.env`

Создайте из шаблона:

1. Скопируйте `server/.env.example` в `server/.env`
2. Заполните:
   - `MYSQL_HOST` (по умолчанию `localhost`)
   - `MYSQL_PORT` (по умолчанию `3306`)
   - `MYSQL_USER` (например `root`)
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE` (по умолчанию `mystik`)

Про TLS/SSL:

- В репозитории есть `server/ca.crt`. Сервер автоматически пробует использовать `ca.crt` рядом с кодом, если TLS включён.
- Для локального MySQL без SSL: в `server/.env` установите `MYSQL_SSL=false` (или `MYSQL_SSL=0`).

## Запуск (разработка)

### 1) Запуск API сервера

```bash
cd server
node index-mysql.js
```

Сервер слушает порт по умолчанию: `PORT=3001`.

### 2) Запуск мобильного приложения

```bash
nodeenv --npm=20.19.4 env
.\env\Scripts\activate.ps1
npm install --legacy-peer-deps
bun expo start --web --lan
```

Дальше:

- отсканируйте QR-код в Expo Go, либо
- используйте симулятор/эмулятор.

## Сборка мобильного приложения

У проекта есть файл `eas.json` для сборки через EAS Build, но также поддерживается локальная сборка.

### Вариант 1: Локальная сборка

#### Android

```bash
npm install --legacy-peer-deps
npx expo run:android
```

Нужны настроенные Android SDK/AVD и доступное устройство или эмулятор.

#### iOS

```bash
npm install --legacy-peer-deps
npx expo run:ios
```

Нужны Xcode и симулятор/устройство.

### Вариант 2: Сборка через EAS Build

Для использования EAS Build нужен аккаунт Expo и установленный EAS CLI:

```bash
npm install -g @expo/eas-cli
eas login
```

#### Сборка для разработки

```bash
# Android
eas build --platform android --profile development

# iOS
eas build --platform ios --profile development
```

#### Сборка для тестирования (preview)

```bash
# Android
eas build --platform android --profile preview

# iOS
eas build --platform ios --profile preview
```

#### Продакшн сборка

```bash
# Android
eas build --platform android --profile production

# iOS
eas build --platform ios --profile production
```

> **Примечание:** EAS Build выполняется в облаке, поэтому не требует локальной настройки Android SDK или Xcode.

## Проверка API

Поднимите сервер (см. раздел выше), затем можно запустить тест:

```bash
cd server
node test-api.js
```

## Тестовый пользователь

Для тестирования приложения используйте следующие данные:

- **Имя пользователя:** LilyTech
- **Email:** user@example.com
- **Пароль:** Windows3

## Notes / endpoints

- Проверка здоровья:
  - `GET /health`
  - `GET /api/health`
- API верхнего уровня:
  - `GET /api`

