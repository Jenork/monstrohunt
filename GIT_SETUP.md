# 📦 Настройка Git и загрузка на GitHub

## ⚠️ Важно перед началом

1. **Убедитесь, что `.env` файл НЕ будет загружен:**
   - Проверьте, что `.env` есть в `.gitignore` ✅ (уже есть)

2. **НЕ коммитьте `PRIVATE_KEY`:**
   - Он должен оставаться только локально
   - Используется только для деплоя контракта

## 🚀 Пошаговая инструкция

### Шаг 1: Откройте терминал в папке проекта

Откройте PowerShell или CMD в папке:
```
C:\Users\Дмитрий\MonstroHuntTemp
```

### Шаг 2: Инициализируйте Git

```bash
git init
```

### Шаг 3: Добавьте все файлы

```bash
git add .
```

### Шаг 4: Проверьте, что .env не добавлен

```bash
git status
```

Убедитесь, что `.env` НЕ в списке файлов для коммита!

### Шаг 5: Сделайте первый коммит

```bash
git commit -m "Initial commit: MONSTROHUNT v1.3"
```

### Шаг 6: Переименуйте ветку в main

```bash
git branch -M main
```

### Шаг 7: Создайте репозиторий на GitHub

1. Зайдите на https://github.com/new
2. Название: `monstrohunt` (или другое)
3. Описание: "Onchain monster hunting game on Base Network"
4. Выберите **Private** (рекомендуется)
5. **НЕ** добавляйте README, .gitignore или лицензию
6. Нажмите "Create repository"

### Шаг 8: Добавьте remote и загрузите код

**Замените `YOUR_USERNAME` на ваш GitHub username:**

```bash
git remote add origin https://github.com/YOUR_USERNAME/monstrohunt.git
git push -u origin main
```

Если GitHub попросит авторизацию:
- Используйте Personal Access Token вместо пароля
- Или используйте GitHub Desktop для удобства

## ✅ Проверка

После успешной загрузки:
1. Зайдите на ваш GitHub репозиторий
2. Убедитесь, что все файлы загружены
3. Убедитесь, что `.env` файла НЕТ в репозитории

## 🔐 Если случайно загрузили .env

Если вы случайно загрузили `.env` с секретами:

1. **Немедленно удалите файл из истории:**
   ```bash
   git rm --cached .env
   git commit -m "Remove .env from repository"
   git push
   ```

2. **Смените все секреты** (PRIVATE_KEY и т.д.)

3. **Рассмотрите создание нового репозитория** если секреты критичны

## 📝 Альтернатива: GitHub Desktop

Если команды вызывают проблемы, используйте GitHub Desktop:

1. Скачайте https://desktop.github.com/
2. File → Add Local Repository
3. Выберите папку `C:\Users\Дмитрий\MonstroHuntTemp`
4. Нажмите "Publish repository"
5. Выберите название и создайте репозиторий

---

**После загрузки на GitHub переходите к деплою на Vercel!**
