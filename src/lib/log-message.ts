/**
 * Формат вывода сообщений лога о событиях на уровне контроллера
 * @param controller Название контроллера
 * @returns Метод, возвращающий строку, в качестве параметра которой передается логгируемое сообщение
 */
export const logMessage =
  (controller: string) =>
  (message: string): string =>
    `[${controller}]: ${message}`;
