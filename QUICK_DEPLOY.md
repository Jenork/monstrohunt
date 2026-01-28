# ⚡ Быстрый деплой на GitHub + Vercel

## 🎯 Краткая инструкция

### 1. GitHub (5 минут)

```bash
# Инициализируйте git (если еще не сделано)
git init

# Добавьте все файлы
git add .

# Сделайте первый коммит
git commit -m "Initial commit: MONSTROHUNT v1.3"

# Создайте репозиторий на GitHub и добавьте remote
git remote add origin https://github.com/YOUR_USERNAME/monstrohunt.git
git branch -M main
git push -u origin main
```

### 2. Vercel (3 минуты)

1. Зайдите на https://vercel.com
2. Войдите через GitHub
3. Нажмите "Add New Project"
4. Выберите ваш репозиторий
5. Добавьте переменную окружения:
   - `NEXT_PUBLIC_CONTRACT_ADDRESS` = адрес вашего контракта
6. Нажмите "Deploy"

**Готово!** Ваше приложение будет доступно по адресу `https://monstrohunt.vercel.app`

## ⚠️ Важно перед загрузкой

✅ Убедитесь, что `.env` в `.gitignore` (уже есть)
✅ НЕ коммитьте `PRIVATE_KEY` ни в коем случае!
✅ Проверьте, что приложение работает локально

## 📚 Подробная инструкция

См. [GITHUB_VERCEL_DEPLOY.md](./GITHUB_VERCEL_DEPLOY.md)
