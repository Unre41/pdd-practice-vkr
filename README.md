# Запуск

Требуется Node.js 22.13 или новее и pnpm.

```bash
pnpm install --frozen-lockfile
pnpm run dev
```

Откройте http://localhost:3000/pdd-practice-vkr/.

## Сборка для GitHub Pages

Статический сайт собирается через Next.js: в Vinext 1.0.0-beta.3
пререндер с `basePath` возвращает 404 и пропускает страницы.

```bash
pnpm run build
```

Готовые HTML, CSS и JavaScript находятся в папке `out/`.
Сервер Node.js для публикации не требуется.

В настройках репозитория **Settings → Pages → Source** выберите **GitHub Actions**.
Workflow `.github/workflows/deploy.yml` собирает и публикует `out/` при push в `main`
или при ручном запуске. Префикс `/pdd-practice-vkr` в `next.config.ts`
соответствует имени репозитория.
