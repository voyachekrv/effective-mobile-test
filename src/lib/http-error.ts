/**
 * Ошибка с HTTP-статусом
 */
export class HttpError extends Error {
  /**
   * HTTP-статус код
   */
  public statusCode: number;

  /**
   * Дополнительные данные, описывающие ошибку
   */
  public details?: unknown;

  /**
   * Ошибка с HTTP-статусом
   * @param statusCode HTTP-статус ошибки
   * @param message Сообщение об ошибке
   * @param details Дополнительные данные, описывающие ошибку
   */
  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
