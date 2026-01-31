# Загрузка проекта на GitHub

## Что не попадает в репозиторий (уже в .gitignore)

- `.env` — переменные окружения и секреты
- `.env.local`, `.env.*.local` — локальные env-файлы
- `*.key`, `*.pem` — приватные ключи
- `PRIVATE_KEY`, `PRIVATE_KEY_*` — переменные с ключами
- `node_modules/`, `.next/`, `cache/`, `artifacts/` — зависимости и сборки

## Шаги для загрузки на GitHub

### 1. Создайте репозиторий на GitHub

- Зайдите на https://github.com/new
- Название репозитория: `basegame1`
- **Не** добавляйте README, .gitignore, license (они уже есть в проекте)
- Нажмите «Create repository»

### 2. В папке проекта выполните в терминале

```bash
# Если git ещё не инициализирован
git init

# Добавить все файлы ( .env уже игнорируется )
git add .

# Проверить, что .env не в списке (должно быть "nothing to commit" для .env)
git status

# Первый коммит
git commit -m "Initial commit: Monstro Hunt Base Sepolia"

# Подключить репозиторий
git remote add origin https://github.com/Jenork/basegame1.git

# Ветка main
git branch -M main

# Отправить на GitHub
git push -u origin main
```

### 3. Проверка перед push

Убедитесь, что в коммит не попадают секреты:

```bash
git status
git diff --cached --name-only
```

В списке **не должно** быть: `.env`, файлов с ключами (`.pem`, `.key`).

### 4. Дальнейшие обновления

```bash
git add .
git commit -m "Описание изменений"
git push
```

## Если .env уже был закоммичен ранее

```bash
# Удалить из индекса (файл останется у вас локально)
git rm --cached .env

# Закоммитить удаление из репозитория
git commit -m "Remove .env from repo"
git push
```

После этого смените все секреты (ключи, API-токены), которые лежали в .env — они считаются скомпрометированными.
