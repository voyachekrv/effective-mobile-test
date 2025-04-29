/**
 * DTO с информацией о множественном обновлении записей об обращениях
 */
export class RequestUpdateManyResultDto {
  /**
   * Количество обновленных записей
   */
  count: number;

  /**
   * @param count Количество обновленных записей
   */
  constructor(count: number) {
    this.count = count;
  }
}
