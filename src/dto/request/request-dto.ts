import { RequestStatus, Request } from '@prisma/client';

/**
 * DTO для получения информации об обращении
 */
export class RequestDto {
  /**
   * ID обращения
   */
  id: string;

  /**
   * Дата создания
   */
  createdAt: Date;

  /**
   * Дата обновления
   */
  updatedAt: Date;

  /**
   * Тема
   */
  subject: string;

  /**
   * Описание проблемы
   */
  description: string;

  /**
   * Описание решения проблемы
   */
  solutionText: string | null;

  /**
   * Описание отмены решения проблемы
   */
  cancelReason: string | null;

  /**
   * Статус обращения
   */
  status: RequestStatus;

  /**
   * @param id ID обращения
   * @param createdAt Дата создания
   * @param updatedAt Дата обновления
   * @param subject Тема
   * @param description Описание проблемы
   * @param solutionText Описание решения проблемы
   * @param cancelReason Описание отмены решения проблемы
   * @param status Статус обращения
   */
  constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    subject: string,
    description: string,
    solutionText: string | null,
    cancelReason: string | null,
    status: RequestStatus
  ) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.subject = subject;
    this.description = description;
    this.solutionText = solutionText;
    this.cancelReason = cancelReason;
    this.status = status;
  }

  /**
   * Маппинг Prisma-модели "Обращение"
   * @param model Модель "Обращение"
   */
  public static fromModel(model: Request): RequestDto {
    return new RequestDto(
      model.id,
      model.createdAt,
      model.updatedAt,
      model.subject,
      model.description,
      model.solutionText,
      model.cancelReason,
      model.status
    );
  }
}
