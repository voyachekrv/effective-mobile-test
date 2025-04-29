import { RequestDto } from '../../dto/request/request-dto';
import { RequestCreateDto } from '../../schemas/request/request-create-schema';
import { Service } from '../../lib/service';
import { HttpError } from '../../lib/http-error';
import { HttpStatus } from '../../lib/http-status';
import { Prisma, RequestStatus } from '@prisma/client';
import { RequestClosingDto } from '../../schemas/request/request-closing-schema';
import { RequestUpdateManyResultDto } from '../../dto/request/request-update-many-result-dto';
import { RequestQuery } from '../../schemas/request/request-query-schema';
import { DateTime } from 'luxon';
import { redis } from '../../config/redis';

const DEFAULT_CACHE_LIFETIME = 60;
const CACHE_PREFIX = 'request';

/**
 * Сервис для работы с обращениями
 * @param filter Фильтр поиска обращений с возможностью ограничения количества выдаваемых записей
 */
export class RequestService extends Service {
  /**
   * Поиск множества записей об обращениях по фильтрации по дате, а также ограничение количества выдаваемых записей.
   * Записи сначала ищутся из кэша, если в кэше их нет, то извлекаются из БД
   * @param filter Схема поиска и фильтрации обращений
   * @return [RequestDto] Список найденных обращений
   */
  public async findAll(filter: RequestQuery): Promise<RequestDto[]> {
    const cached = await redis.get(this.toCacheKey(filter));

    if (cached) {
      return JSON.parse(cached) as RequestDto[];
    }

    const requests = await this.prisma.request.findMany({
      where: this.mapFilterToWhereInput(filter),
      orderBy: { createdAt: 'desc' },
      take: filter.take,
      skip: filter.skip
    });

    const dtoList = requests.map(request => RequestDto.fromModel(request));

    await redis.set(this.toCacheKey(filter), JSON.stringify(dtoList), 'EX', DEFAULT_CACHE_LIFETIME);

    return dtoList;
  }

  /**
   * Создание нового обращения
   * @param dto Данные для создания нового обращения
   * @return RequestDto - Новое обращение
   */
  public async create(dto: RequestCreateDto): Promise<RequestDto> {
    const newRequest = await this.prisma.request.create({
      data: { subject: dto.subject, description: dto.description }
    });

    await this.invalidateCache();

    return RequestDto.fromModel(newRequest);
  }

  /**
   * Перевод обращения в работу. Если обращение не найдено, возвращает 404
   * @param id ID обращения
   * @return RequestDto - Обновленное обращение
   */
  public async start(id: string): Promise<RequestDto> {
    await this.checkRequestExists(id);

    const request = await this.prisma.request.update({ where: { id }, data: { status: RequestStatus.IN_PROGRESS } });

    await this.invalidateCache();

    return RequestDto.fromModel(request);
  }

  /**
   * Завершение обработки обращения. Если обращение не найдено, возвращает 404
   * @param id ID обращения
   * @param dto DTO текста описания решения
   * @return RequestDto - Обновленное обращение
   */
  public async complete(id: string, dto: RequestClosingDto): Promise<RequestDto> {
    await this.checkRequestExists(id);

    const request = await this.prisma.request.update({
      where: { id },
      data: { status: RequestStatus.COMPLETED, solutionText: dto.closingText }
    });

    await this.invalidateCache();

    return RequestDto.fromModel(request);
  }

  /**
   * Отмена обработки обращения. Если обращение не найдено, возвращает 404
   * @param id ID обращения
   * @param dto DTO текста описания причины отмены
   * @return RequestDto - Обновленное обращение
   */
  public async cancel(id: string, dto: RequestClosingDto): Promise<RequestDto> {
    await this.checkRequestExists(id);

    const request = await this.prisma.request.update({
      where: { id },
      data: { status: RequestStatus.CANCELLED, cancelReason: dto.closingText }
    });

    await this.invalidateCache();

    return RequestDto.fromModel(request);
  }

  /**
   * Отмена всех обращений, которые находятся в статусе "В работе"
   * @returns RequestUpdateManyResultDto количество обновленных обращений
   */
  public async cancelAllInProgress(): Promise<RequestUpdateManyResultDto> {
    const updatedRequests = await this.prisma.request.updateMany({
      where: { status: RequestStatus.IN_PROGRESS },
      data: { status: RequestStatus.CANCELLED }
    });

    await this.invalidateCache();

    return new RequestUpdateManyResultDto(updatedRequests.count);
  }

  /**
   * Проверка существования обращения. Если обращение не найдено, возвращает 404
   * @param id ID обращения
   */
  private async checkRequestExists(id: string): Promise<void> {
    const request = await this.prisma.request.findFirst({ where: { id } });

    if (!request) {
      throw new HttpError(HttpStatus.NOT_FOUND, `Request with ID = ${id} was not found`);
    }
  }

  /**
   * Маппинг входящего объекта запросов в объект поиска обращений в БД
   * @param filter Объект параметров фильтрации
   * @return Prisma.RequestWhereInput Условие поиска записей об обращении
   */
  private mapFilterToWhereInput(filter: RequestQuery): Prisma.RequestWhereInput {
    const input: Prisma.RequestWhereInput = {};

    if (filter.from && filter.to) {
      input.createdAt = { lte: new Date(filter.to), gte: new Date(filter.from) };
    }

    if (filter.date) {
      const startOfDay = DateTime.fromISO(filter.date).startOf('day').toJSDate();
      const endOfDay = DateTime.fromISO(filter.date).endOf('day').toJSDate();

      input.createdAt = {
        gte: startOfDay,
        lte: endOfDay
      };
    }

    return input;
  }

  /**
   * Маппинг объекта фильтра поиска в название ключа кэша
   * @param filter  Схема поиска и фильтрации обращений
   * @return string Ключ кэша
   */
  private toCacheKey(filter: RequestQuery): string {
    return `${CACHE_PREFIX}:${filter.date ?? ''}:${filter.from ?? ''}:${filter.to ?? ''}:${filter.skip}:${filter.take}`;
  }

  /**
   * Инвалидация кэша
   */
  private async invalidateCache(): Promise<void> {
    const keys = await redis.keys(`${CACHE_PREFIX}:*`);
    if (keys.length) {
      await redis.del(...keys);
    }
  }
}
