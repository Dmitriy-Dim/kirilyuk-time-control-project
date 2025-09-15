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

Тестирование
changePassword.test.ts - тесты для смены пароля:
Тест на ошибку: сотрудник не найден
Успешный тест: пароль изменен

updateEmployee.test.ts - тесты для обновления данных сотрудника:
Тест на ошибку: обновление не удалось
Успешный тест: данные сотрудника обновлены

getAllEmployees.test.ts - тесты для получения всех сотрудников:
Успешный тест: пустой список сотрудников
Успешный тест: возврат списка сотрудников

setRole.test.ts - тесты для установки роли:
Тест на ошибку: сотрудник не найден (через getEmployeeById)
Тест на ошибку: неверная роль (через checkRole)
Тест на ошибку: обновление не удалось
Успешный тест: роль обновлена
