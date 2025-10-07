# 🌐 Настройка домена agentspool.ai

## Шаг 1: Деплой на Railway

Сначала задеплойте проект на Railway и получите стандартные URL:
- Backend: `https://backend-production-xxx.railway.app`
- Frontend: `https://frontend-production-xxx.railway.app`

## Шаг 2: Настройка DNS записей

В панели управления вашего регистратора домена (где куплен agentspool.ai) добавьте следующие DNS записи:

### Основной сайт (Frontend):
```
Type: CNAME
Name: www
Value: frontend-production-xxx.railway.app
TTL: 300 (или Auto)

Type: CNAME  
Name: @  (или оставьте пустым)
Value: frontend-production-xxx.railway.app
TTL: 300 (или Auto)
```

### API (Backend):
```
Type: CNAME
Name: api
Value: backend-production-xxx.railway.app  
TTL: 300 (или Auto)
```

## Шаг 3: Настройка доменов в Railway

### Frontend Service:
1. Откройте Frontend сервис в Railway Dashboard
2. Перейдите в **Settings** → **Domains**
3. Нажмите **"Custom Domain"**
4. Добавьте домены:
   - `agentspool.ai`
   - `www.agentspool.ai`

### Backend Service:
1. Откройте Backend сервис в Railway Dashboard
2. Перейдите в **Settings** → **Domains**
3. Нажмите **"Custom Domain"**
4. Добавьте домен:
   - `api.agentspool.ai`

## Шаг 4: Обновление переменных окружения

### Frontend Service:
```bash
NEXT_PUBLIC_API_URL=https://api.agentspool.ai
```

### Backend Service:
```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
SECRET_KEY=your-super-secret-production-key
FRONTEND_URL=https://agentspool.ai
```

## Шаг 5: Проверка

После настройки (может занять до 24 часов для полного распространения DNS):

- ✅ **Основной сайт**: https://agentspool.ai
- ✅ **С www**: https://www.agentspool.ai  
- ✅ **API**: https://api.agentspool.ai/health
- ✅ **API Docs**: https://api.agentspool.ai/docs

## Популярные регистраторы

### Cloudflare:
```
Type: CNAME, Name: www, Content: frontend-production-xxx.railway.app, Proxy: ON
Type: CNAME, Name: @, Content: frontend-production-xxx.railway.app, Proxy: ON
Type: CNAME, Name: api, Content: backend-production-xxx.railway.app, Proxy: ON
```

### Namecheap:
```
Type: CNAME Record, Host: www, Value: frontend-production-xxx.railway.app
Type: CNAME Record, Host: @, Value: frontend-production-xxx.railway.app  
Type: CNAME Record, Host: api, Value: backend-production-xxx.railway.app
```

### GoDaddy:
```
Type: CNAME, Name: www, Value: frontend-production-xxx.railway.app
Type: CNAME, Name: @, Value: frontend-production-xxx.railway.app
Type: CNAME, Name: api, Value: backend-production-xxx.railway.app
```

## SSL сертификаты

Railway автоматически выдаст SSL сертификаты для всех ваших доменов. Обычно это занимает 5-15 минут после настройки DNS.

## Результат

После завершения настройки:
- **Главная страница**: https://agentspool.ai
- **API**: https://api.agentspool.ai  
- **Автоматические SSL сертификаты**
- **Автоматические деплои при git push**
