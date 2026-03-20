// Простой тест API
// Запустите сервер перед запуском этого скрипта: npm run dev
// Затем в другом терминале: node test-api.js

const API_BASE = 'http://localhost:3001';

async function testAPI() {
  console.log('🧪 Тестирование API...\n');

  try {
    // Тест 1: Регистрация
    console.log('1️⃣ Тест регистрации...');
    const registerData = {
      email: `test${Date.now()}@example.com`,
      username: `testuser${Date.now()}`,
      password: 'password123',
      name: 'Тестовый Пользователь',
      birthDate: '1990-01-01'
    };

    const registerRes = await fetch(`${API_BASE}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData)
    });
    const registerResult = await registerRes.json();
    
    if (registerResult.ok) {
      console.log('✅ Регистрация успешна');
      console.log('   ID:', registerResult.user.id);
      console.log('   Email:', registerResult.user.email);
      console.log('   Username:', registerResult.user.username);
      console.log('   Name:', registerResult.user.name);
    } else {
      console.log('❌ Ошибка регистрации:', registerResult.error);
      return;
    }

    const userId = registerResult.user.id;
    const userEmail = registerResult.user.email;
    const username = registerResult.user.username;

    // Тест 2: Вход по email
    console.log('\n2️⃣ Тест входа по email...');
    const loginEmailRes = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: userEmail, password: 'password123' })
    });
    const loginEmailResult = await loginEmailRes.json();
    
    if (loginEmailResult.ok) {
      console.log('✅ Вход по email успешен');
    } else {
      console.log('❌ Ошибка входа по email:', loginEmailResult.error);
    }

    // Тест 3: Вход по username
    console.log('\n3️⃣ Тест входа по username...');
    const loginUsernameRes = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: username, password: 'password123' })
    });
    const loginUsernameResult = await loginUsernameRes.json();
    
    if (loginUsernameResult.ok) {
      console.log('✅ Вход по username успешен');
    } else {
      console.log('❌ Ошибка входа по username:', loginUsernameResult.error);
    }

    // Тест 4: Получение пользователя
    console.log('\n4️⃣ Тест получения данных пользователя...');
    const getUserRes = await fetch(`${API_BASE}/api/user/${userId}`);
    const getUserResult = await getUserRes.json();
    
    if (getUserResult.ok) {
      console.log('✅ Данные получены');
      console.log('   Name:', getUserResult.user.name);
      console.log('   Birth Date:', getUserResult.user.birthDate);
    } else {
      console.log('❌ Ошибка получения данных:', getUserResult.error);
    }

    // Тест 5: Обновление профиля
    console.log('\n5️⃣ Тест обновления профиля...');
    const updateRes = await fetch(`${API_BASE}/api/user/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Обновлённое Имя', birthDate: '1995-05-15' })
    });
    const updateResult = await updateRes.json();
    
    if (updateResult.ok) {
      console.log('✅ Профиль обновлён');
      console.log('   New Name:', updateResult.user.name);
      console.log('   New Birth Date:', updateResult.user.birthDate);
    } else {
      console.log('❌ Ошибка обновления:', updateResult.error);
    }

    // Тест 6: Смена пароля
    console.log('\n6️⃣ Тест смены пароля...');
    const changePasswordRes = await fetch(`${API_BASE}/api/user/${userId}/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        oldPassword: 'password123',
        newPassword: 'newpassword456',
        confirmPassword: 'newpassword456'
      })
    });
    const changePasswordResult = await changePasswordRes.json();
    
    if (changePasswordResult.ok) {
      console.log('✅ Пароль изменён');
    } else {
      console.log('❌ Ошибка смены пароля:', changePasswordResult.error);
    }

    // Тест 7: Вход с новым паролем
    console.log('\n7️⃣ Тест входа с новым паролем...');
    const loginNewPasswordRes = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: userEmail, password: 'newpassword456' })
    });
    const loginNewPasswordResult = await loginNewPasswordRes.json();
    
    if (loginNewPasswordResult.ok) {
      console.log('✅ Вход с новым паролем успешен');
    } else {
      console.log('❌ Ошибка входа с новым паролем:', loginNewPasswordResult.error);
    }

    console.log('\n✨ Все тесты завершены!');

  } catch (error) {
    console.error('\n❌ Ошибка:', error.message);
    console.log('\n💡 Убедитесь, что сервер запущен: npm run dev');
  }
}

testAPI();
