# 🚀 Railway CLI - Команды для деплоя

## Подготовка

```bash
# Убедитесь что Railway CLI установлен
railway --version

# Если не установлен:
npm install -g @railway/cli
```

## Шаг 1: Удалить старый проект (если нужно)

Если у вас уже есть упавший проект, удалите его через Dashboard или:
```bash
railway unlink
```

## Шаг 2: Авторизация

```bash
# Откроется браузер для авторизации
railway login
```

## Шаг 3: Создание проекта

```bash
# Создать новый проект
railway init

# Выберите:
# - "Create a new project"
# - Назовите: AgentsPool
```

## Шаг 4: Добавление PostgreSQL

⚠️ **PostgreSQL нужно добавить через Dashboard:**

1. Откройте: https://railway.app/dashboard
2. Выберите проект AgentsPool
3. Нажмите **"+ New"** → **"Database"** → **"Add PostgreSQL"**

## Шаг 5: Деплой Backend

```bash
# Перейти в backend
cd backend

# Создать сервис Backend
railway up --service agentspool-backend

# Установить переменные окружения
railway variables set DATABASE_URL='${{Postgres.DATABASE_URL}}'
railway variables set SECRET_KEY='agentspool-production-secret-key-2024'
railway variables set PORT='8000'

# Получить URL Backend
railway status

# Вернуться в корень
cd ..
```

**Скопируйте Backend URL** (будет вида: `https://agentspool-backend-production-xxxx.up.railway.app`)

## Шаг 6: Деплой Frontend

```bash
# Перейти в frontend
cd frontend

# Создать сервис Frontend
railway up --service agentspool-frontend

# Установить переменные (замените YOUR_BACKEND_URL)
railway variables set NEXT_PUBLIC_API_URL='YOUR_BACKEND_URL'

# Получить URL Frontend
railway status

# Вернуться в корень
cd ..
```

**Скопируйте Frontend URL**

## Шаг 7: Обновить CORS в Backend

```bash
# Перейти в backend
cd backend

# Установить FRONTEND_URL (замените YOUR_FRONTEND_URL)
railway variables set FRONTEND_URL='YOUR_FRONTEND_URL'

# Вернуться в корень
cd ..
```

## Шаг 8: Импорт схемы базы данных

```bash
# Импортировать схему
railway run --service agentspool-backend psql \$DATABASE_URL < database_backup_20251007_151635.sql
```

## Шаг 9: Проверка

```bash
# Открыть Backend
railway open --service agentspool-backend

# Открыть Frontend
railway open --service agentspool-frontend
```

Проверьте:
- Backend Health: `https://[backend-url]/health`
- API Docs: `https://[backend-url]/docs`
- Frontend: `https://[frontend-url]`

## Полезные команды

```bash
# Просмотр логов Backend
railway logs --service agentspool-backend

# Просмотр логов Frontend
railway logs --service agentspool-frontend

# Список переменных окружения
railway variables

# Просмотр статуса
railway status

# Открыть проект в браузере
railway open
```

## Troubleshooting

### Ошибка: "service not found"
Используйте флаг `--service` с правильным именем сервиса

### Ошибка при импорте БД
Убедитесь что PostgreSQL создан и переменная `DATABASE_URL` установлена

### Нужно переделоить
```bash
cd backend
railway up
cd ../frontend
railway up
```

---

## ✅ Готово!

После выполнения всех шагов ваш AgentsPool будет онлайн! 🎉
