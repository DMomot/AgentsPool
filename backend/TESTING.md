# API Testing Guide

## Overview

Автоматические тесты для проверки всех API эндпоинтов после деплоя.

## Что тестируется

- ✅ Доступность API (`/status`)
- ✅ Все категории (`GET /api/v1/categories`)
- ✅ Категория по ID (`GET /api/v1/categories/{id}`)
- ✅ Категория по slug (`GET /api/v1/categories/slug/{slug}`)
- ✅ Агенты по категории (`GET /api/v1/categories/{slug}/agents`)
- ✅ Статистика категорий (`GET /api/v1/categories/stats`)
- ✅ Поиск агентов (`GET /api/v1/agents`)
- ✅ Агент по slug (`GET /api/v1/agents/slug/{slug}`)
- ✅ Проверка URL (`GET /api/v1/agents/check-url`)
- ✅ CORS заголовки
- ✅ Время ответа API (< 5 сек)

## Локальный запуск тестов

### Установка зависимостей

```bash
cd backend
pip install -r requirements.txt
```

### Запуск тестов

**Тест production:**
```bash
python run_tests.py
```

**Тест локального сервера:**
```bash
python run_tests.py local
```

**Тест кастомного URL:**
```bash
python run_tests.py http://localhost:8000
```

**Прямой запуск pytest:**
```bash
# Production
API_BASE_URL=https://agentspool.ai pytest test_api.py -v

# Local
API_BASE_URL=http://localhost:8000 pytest test_api.py -v
```

## Автоматические тесты

### GitHub Actions

Тесты автоматически запускаются:
- ✅ При push в main
- ✅ При создании Pull Request
- ✅ Каждые 6 часов (мониторинг production)
- ✅ Вручную через GitHub Actions UI

### Файлы

- `.github/workflows/test-deploy.yml` - GitHub Actions workflow
- `test_api.py` - Тесты API
- `run_tests.py` - Скрипт для быстрого запуска

## Добавление новых тестов

Добавьте функцию в `test_api.py`:

```python
def test_new_endpoint():
    """Test description"""
    import requests
    response = requests.get(urljoin(API_BASE_URL, "/api/v1/new-endpoint"))
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
```

## CI/CD интеграция

### Railway

Railway автоматически использует `healthcheckPath` из `railway.toml`:
```toml
healthcheckPath = "/status"
```

### Добавить в Railway deploy hook

Можно добавить команду для запуска тестов после деплоя:
```bash
python run_tests.py && echo "Tests passed"
```

## Мониторинг

GitHub Actions запускает тесты каждые 6 часов для мониторинга production.
Если тесты падают - вы получите уведомление на email (настраивается в GitHub).

## Troubleshooting

**Тесты падают локально:**
- Проверьте что сервер запущен: `curl http://localhost:8000/status`
- Убедитесь что база данных доступна

**Тесты падают на production:**
- Проверьте Railway logs
- Проверьте доступность БД
- Проверьте переменные окружения

**Timeout ошибки:**
- Увеличьте timeout в тестах
- Проверьте производительность БД запросов

