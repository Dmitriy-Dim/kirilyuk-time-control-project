Система контроля рабочего времени — Логирование
Основные изменения
Winston (winston.ts) Многоуровневое логирование (error, warn, info, debug) с выводом в консоль и файлы: error.log, combined.log, exceptions.log, rejections.log. Хелперы: logError(), logWarn(), logInfo(), logDebug().

Обработчик ошибок (errorHandler.ts)

5xx → error, 4xx → warn, 401 → не логируются

Включает метод, URL, IP, User-Agent, статус и stack trace

Контроллеры (accountController.ts, shiftController.ts)

Логирование успешных операций (info) и ошибок (warn)

Отслеживание смен, перерывов, ID сотрудников

Валидация (bodyValidation.ts)

Логируются ошибки Joi и отсутствие тела запроса

Сервер (server.ts)

Лог старта, конфигурации, необработанных исключений и промисов

Структура логов
Уровни: error, warn, info, debug

Файлы: error.log, combined.log, exceptions.log, rejections.log, access.log

Morgan: консоль (dev), файл (combined)

Безопасность
Ошибки 401 не логируются — защита от утечки данных

Конфигурация
json
{
  "logLevel": "info"
}
Настраивается в app-config.json
