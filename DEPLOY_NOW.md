# 🚀 Деплой AgentsPool на Railway - Пошаговая инструкция

## ⚡ Быстрый старт (10 минут)

### Шаг 1: Вход в Railway (1 минута)

1. Откройте в браузере: **https://railway.app**
2. Нажмите **"Login"** → войдите через **GitHub**
3. Авторизуйте Railway доступ к вашим репозиториям

### Шаг 2: Создание проекта (1 минута)

1. На главной странице Railway нажмите **"New Project"**
2. Выберите **"Deploy from GitHub repo"**
3. Найдите и выберите **"AgentsPool"**
4. Railway начнет деплой автоматически

---

## 📊 Настройка сервисов

### 🗄️ Сервис 1: PostgreSQL Database (2 минуты)

1. В дашборде проекта нажмите **"+ New"**
2. Выберите **"Database"** → **"Add PostgreSQL"**
3. Railway автоматически создаст базу данных
4. ✅ Готово! **DATABASE_URL** сгенерирован

---

### 🐍 Сервис 2: Backend (Python/FastAPI) (3 минуты)

#### Создание и настройка:

1. **Создать сервис:**
   - Нажмите **"+ New"** → **"GitHub Repo"**
   - Выберите **"AgentsPool"**

2. **Настроить Root Directory:**
   - Нажмите на сервис
   - **Settings** → раздел **"Build"**
   - **Root Directory:** `backend`
   - Нажмите вне поля для сохранения

3. **Добавить переменные окружения:**
   - Вкладка **"Variables"** → **"+ New Variable"**
   
   Добавьте 3 переменные:
   
   ```
   Переменная 1:
   Key: DATABASE_URL
   Value: нажмите "$" → выберите "Postgres" → "DATABASE_URL"
   
   Переменная 2:
   Key: SECRET_KEY
   Value: agentspool-production-secret-key-2024
   
   Переменная 3:
   Key: PORT
   Value: 8000
   ```

4. **Переименовать (опционально):**
   - **Settings** → **Service Name:** `agentspool-backend`

✅ **Backend деплоится! Ждите 2-3 минуты**

5. **Получить URL Backend:**
   - **Settings** → **Networking** → **Public Networking**
   - Скопируйте URL (будет вида: `https://agentspool-backend-production-xxxx.up.railway.app`)

---

### 🎨 Сервис 3: Frontend (Next.js) (3 минуты)

#### Создание и настройка:

1. **Создать сервис:**
   - Нажмите **"+ New"** → **"GitHub Repo"**
   - Выберите **"AgentsPool"**

2. **Настроить Root Directory:**
   - Нажмите на сервис
   - **Settings** → раздел **"Build"**
   - **Root Directory:** `frontend`
   - Нажмите вне поля для сохранения

3. **Добавить переменные окружения:**
   - Вкладка **"Variables"** → **"+ New Variable"**
   
   ```
   Key: NEXT_PUBLIC_API_URL
   Value: [URL вашего Backend из предыдущего шага]
   ```
   
   Например: `https://agentspool-backend-production-xxxx.up.railway.app`

4. **Переименовать (опционально):**
   - **Settings** → **Service Name:** `agentspool-frontend`

✅ **Frontend деплоится! Ждите 3-4 минуты**

5. **Получить URL Frontend:**
   - **Settings** → **Networking** → **Public Networking**
   - Скопируйте URL

---

### 🔧 Шаг 3: Финальная настройка CORS (1 минута)

1. Откройте **Backend service**
2. **Variables** → **"+ New Variable"**
   ```
   Key: FRONTEND_URL
   Value: [URL вашего Frontend]
   ```
   Например: `https://agentspool-frontend-production-xxxx.up.railway.app`

3. Backend автоматически перезапустится

---

## 📥 Импорт схемы базы данных

### Через Railway CLI (в терминале):

```bash
# 1. Войдите в Railway (откроется браузер)
railway login

# 2. Подключитесь к проекту
railway link

# 3. Импортируйте схему БД
railway run psql $DATABASE_URL < database_backup_20251007_151635.sql
```

### Альтернативный способ (через Railway Dashboard):

1. Откройте **Postgres service**
2. Вкладка **"Data"** → **"Query"**
3. Скопируйте содержимое файла `database_backup_20251007_151635.sql`
4. Вставьте в Query Editor
5. Нажмите **"Run Query"**

---

## ✅ Проверка деплоя

После завершения всех шагов проверьте:

### 1. Backend API
```
https://[ваш-backend-url]/health
```
Должен вернуть: `{"status": "healthy"}`

### 2. API Documentation
```
https://[ваш-backend-url]/docs
```
Должна открыться Swagger UI документация

### 3. Frontend
```
https://[ваш-frontend-url]
```
Должна открыться главная страница сайта

---

## 🎯 Итоговая структура

После деплоя у вас будет 3 сервиса:

```
AgentsPool Project
├── Postgres (Database)
│   └── URL: postgres://...railway.app:5432/railway
│
├── agentspool-backend (Backend API)
│   ├── Root: backend/
│   ├── URL: https://...backend...railway.app
│   └── Variables:
│       ├── DATABASE_URL → Postgres.DATABASE_URL
│       ├── SECRET_KEY
│       ├── PORT
│       └── FRONTEND_URL
│
└── agentspool-frontend (Frontend Web)
    ├── Root: frontend/
    ├── URL: https://...frontend...railway.app
    └── Variables:
        └── NEXT_PUBLIC_API_URL → Backend URL
```

---

## 🌐 Настройка домена agentspool.ai (опционально)

После успешного деплоя вы можете настроить кастомный домен:

### Frontend:
1. **Frontend Service** → **Settings** → **Networking**
2. **Custom Domain** → Add Domain
3. Добавьте: `agentspool.ai` и `www.agentspool.ai`

### Backend:
1. **Backend Service** → **Settings** → **Networking**
2. **Custom Domain** → Add Domain
3. Добавьте: `api.agentspool.ai`

### Настройка DNS:
См. файл `DOMAIN_SETUP.md` для детальных инструкций

---

## 🚨 Troubleshooting

### Backend не стартует
- Проверьте логи: Backend Service → **Deployments** → последний деплой → **View Logs**
- Убедитесь, что `DATABASE_URL` правильно настроен

### Frontend показывает ошибки API
- Проверьте, что `NEXT_PUBLIC_API_URL` указывает на правильный Backend URL
- Проверьте, что `FRONTEND_URL` в Backend указывает на Frontend URL

### База данных пустая
- Выполните импорт схемы через Railway CLI или Query Editor

---

## 📞 Готово!

Ваш сайт AgentsPool теперь онлайн! 🎉

- **Backend API**: работает на Railway
- **Frontend**: доступен публично
- **Database**: PostgreSQL на Railway
- **Автоматические деплои**: при каждом git push

Следующий шаг: настройте домен agentspool.ai для профессионального вида!