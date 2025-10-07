# 🔄 Database Migration Guide

Пошаговая инструкция по миграции данных из старой БД в новую Railway БД.

## Шаг 1: Установка PostgreSQL клиента (если еще не установлен)

### macOS:
```bash
brew install postgresql
```

### Ubuntu/Debian:
```bash
sudo apt-get install postgresql-client
```

### Проверка установки:
```bash
pg_dump --version
psql --version
```

## Шаг 2: Создание дампа старой базы

### Вариант A: Автоматический (рекомендуется)

```bash
# Запустите скрипт миграции - он сделает дамп автоматически
python migrate_database.py
```

Скрипт создаст файл вида `database_backup_20241007_143022.sql`

### Вариант B: Ручной дамп

```bash
pg_dump --no-owner --no-acl --clean --if-exists \
  "postgresql://primeagents_user:b694e983cc198e7e34f52cfa1dc8d32f@gondola.proxy.rlwy.net:22252/railway" \
  -f database_backup.sql
```

## Шаг 3: Создание PostgreSQL на Railway

1. Зайдите в **Railway Dashboard**
2. Откройте ваш проект **AgentsPool**
3. Нажмите **"New Service"** → **"Database"** → **"PostgreSQL"**
4. Railway создаст базу и сгенерирует `DATABASE_URL`

## Шаг 4: Получение DATABASE_URL

1. Откройте созданный **Postgres service**
2. Перейдите на вкладку **"Variables"**
3. Скопируйте значение `DATABASE_URL`

Формат будет примерно такой:
```
postgresql://postgres:password@region.railway.app:5432/railway
```

## Шаг 5: Импорт данных в новую БД

### Вариант A: Через Railway CLI (рекомендуется)

```bash
# Установите Railway CLI
npm install -g @railway/cli

# Авторизуйтесь
railway login

# Подключитесь к проекту
railway link

# Импортируйте дамп
railway run psql $DATABASE_URL < database_backup_YYYYMMDD_HHMMSS.sql
```

### Вариант B: Напрямую через psql

```bash
# Установите DATABASE_URL как переменную окружения
export DATABASE_URL="postgresql://postgres:password@region.railway.app:5432/railway"

# Импортируйте дамп
psql $DATABASE_URL < database_backup_YYYYMMDD_HHMMSS.sql
```

### Вариант C: Автоматически через скрипт

```bash
# Установите DATABASE_URL
export DATABASE_URL="postgresql://postgres:password@region.railway.app:5432/railway"

# Запустите скрипт миграции
python migrate_database.py
```

Скрипт автоматически:
- Создаст дамп старой БД
- Импортирует в новую БД
- Проверит корректность миграции

## Шаг 6: Проверка миграции

```bash
# Подключитесь к новой БД
railway connect Postgres

# Проверьте таблицы
\dt

# Проверьте количество записей
SELECT 'categories' as table_name, COUNT(*) FROM categories
UNION ALL
SELECT 'agents', COUNT(*) FROM agents
UNION ALL
SELECT 'reviews', COUNT(*) FROM reviews;

# Выйдите
\q
```

## Шаг 7: Обновление Backend конфигурации

1. Откройте **Backend service** в Railway
2. Перейдите на вкладку **"Variables"**
3. Добавьте/обновите переменную:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   ```
4. Backend автоматически перезапустится

## ✅ Готово!

Ваша база данных успешно мигрирована на Railway!

## 🔧 Troubleshooting

### Ошибка: "connection refused"
- Проверьте, что Railway Postgres запущен
- Проверьте правильность DATABASE_URL

### Ошибка: "permission denied"
Добавьте флаги `--no-owner --no-acl` при создании дампа

### Ошибка: "table already exists"
Используйте флаги `--clean --if-exists` при создании дампа

### Нужна помощь?
Проверьте логи в Railway Dashboard или используйте:
```bash
railway logs --service Postgres
```

## 📊 Статистика миграции

После успешной миграции вы должны увидеть:
- ✅ Все таблицы созданы (categories, agents, agent_media, reviews, agent_stats)
- ✅ Все данные импортированы
- ✅ Индексы и constraints настроены
- ✅ Backend подключается к новой БД
