# 🚀 ПРОСТОЙ ДЕПЛОЙ AGENTSPOOL НА RAILWAY

## ✅ САМЫЙ ПРОСТОЙ СПОСОБ (5 минут)

### 1️⃣ Откройте Railway Dashboard
```
https://railway.app/new
```

### 2️⃣ Создайте проект с GitHub
1. Нажмите **"Deploy from GitHub repo"**
2. Выберите **"AgentsPool"**
3. Railway создаст ОДИН сервис - это нормально

### 3️⃣ Добавьте PostgreSQL
1. В проекте нажмите **"+ New"**
2. **"Database"** → **"Add PostgreSQL"**
3. Готово!

### 4️⃣ Удалите автоматически созданный сервис
1. Нажмите на сервис "AgentsPool" (который упал)
2. **Settings** → прокрутите вниз
3. **"Remove Service from All Environments"**
4. Подтвердите

### 5️⃣ Создайте Backend сервис вручную
1. **"+ New"** → **"Empty Service"**
2. Нажмите на новый сервис
3. **"Settings"** → **"Connect to a GitHub Repo"**
4. Выберите **"AgentsPool"**
5. ⚠️ **ВАЖНО!** Прокрутите до **"Root Directory"** и введите: `backend`
6. Нажмите **"Deploy"**

7. Перейдите на вкладку **"Variables"**
8. Добавьте переменные:
   ```
   DATABASE_URL (нажмите $ → Postgres → DATABASE_URL)
   SECRET_KEY = agentspool-production-secret-key-2024
   PORT = 8000
   ```

9. Переименуйте сервис (опционально):
   - **Settings** → **"Service Name"**: `backend`

10. Дождитесь деплоя (2-3 минуты)

11. Получите Backend URL:
    - **Settings** → **"Networking"** → скопируйте URL

### 6️⃣ Создайте Frontend сервис вручную  
1. **"+ New"** → **"Empty Service"**
2. Нажмите на новый сервис
3. **"Settings"** → **"Connect to a GitHub Repo"**
4. Выберите **"AgentsPool"**
5. ⚠️ **ВАЖНО!** Прокрутите до **"Root Directory"** и введите: `frontend`
6. Нажмите **"Deploy"**

7. Перейдите на вкладку **"Variables"**
8. Добавьте:
   ```
   NEXT_PUBLIC_API_URL = [ваш Backend URL из шага 5]
   ```

9. Переименуйте сервис (опционально):
   - **Settings** → **"Service Name"**: `frontend`

10. Дождитесь деплоя (3-4 минуты)

11. Получите Frontend URL:
    - **Settings** → **"Networking"** → скопируйте URL

### 7️⃣ Обновите CORS в Backend
1. Откройте **Backend сервис**
2. **Variables** → добавьте:
   ```
   FRONTEND_URL = [ваш Frontend URL из шага 6]
   ```
3. Backend перезапустится автоматически

### 8️⃣ Импортируйте схему БД (в терминале)
```bash
cd /Users/dmitriimomot/Documents/AgentsPool
railway link  # Выберите ваш проект в браузере
railway run psql $DATABASE_URL < database_backup_20251007_151635.sql
```

### 9️⃣ Проверьте работу
- Backend Health: `https://[backend-url]/health`
- API Docs: `https://[backend-url]/docs`
- Frontend: `https://[frontend-url]`

---

## ✅ ГОТОВО!

У вас должно получиться:
```
AgentsPool Project
├── Postgres (Database)
├── backend (Backend API)
└── frontend (Next.js Web)
```

---

## 🔥 ЕСЛИ ЧТО-ТО ПОШЛО НЕ ТАК:

### Backend не стартует
1. **Settings** → **Deployments** → последний деплой → **"View Logs"**
2. Проверьте что Root Directory = `backend`
3. Проверьте что все переменные установлены

### Frontend не стартует
1. Проверьте что Root Directory = `frontend`
2. Проверьте что `NEXT_PUBLIC_API_URL` правильный
3. Проверьте логи деплоя

### Нужно начать заново
Удалите все сервисы (кроме Postgres) и создайте заново с шага 5

---

## 💡 ГЛАВНОЕ ПРАВИЛО:

**Root Directory ОБЯЗАТЕЛЕН!**
- Backend: `backend`
- Frontend: `frontend`

Без этого Railway не поймет что деплоить и упадет с ошибкой!
