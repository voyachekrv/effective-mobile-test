import { RequestService } from '../src/services/request/request-service';
import { Request, RequestStatus } from '@prisma/client';
import { HttpError } from '../src/lib/http-error';
import { redis } from '../src/config/redis';
import { RequestQuery } from '../src/schemas/request/request-query-schema';
import { RequestDto } from '../src/dto/request/request-dto';
import { RequestCreateDto } from '../src/schemas/request/request-create-schema';
import { RequestUpdateManyResultDto } from '../src/dto/request/request-update-many-result-dto';

jest.mock('../src/config/redis', () => ({
  redis: {
    get: jest.fn(),
    set: jest.fn(),
    keys: jest.fn(),
    del: jest.fn()
  }
}));

const mockPrisma = {
  request: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    findFirst: jest.fn()
  }
} as any;

class TestRequestService extends RequestService {
  constructor() {
    super();
    this.prisma = mockPrisma;
  }
}

describe('RequestService', () => {
  let service: RequestService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TestRequestService();
  });

  describe('findAll', () => {
    const filter: RequestQuery = { take: 10, skip: 0 };

    it('возвращает данные из кэша, если они в нем присутствуют', async () => {
      const cachedValue = JSON.stringify([{ id: '1', subject: 'test', description: 'desc' }]);
      (redis.get as jest.Mock).mockResolvedValue(cachedValue);

      const result = await service.findAll(filter);

      expect(redis.get).toHaveBeenCalled();
      expect(result).toEqual(JSON.parse(cachedValue));
    });

    it('возвращает данные из БД, если они в отсутствуют в кэше', async () => {
      (redis.get as jest.Mock).mockResolvedValue(null);
      const dbData = [{ id: '1', subject: 'test', description: 'desc' }] as Request[];
      mockPrisma.request.findMany.mockResolvedValue(dbData);
      const dto = RequestDto.fromModel(dbData[0]);
      jest.spyOn(RequestDto, 'fromModel').mockReturnValue(dto);

      const result = await service.findAll(filter);

      expect(mockPrisma.request.findMany).toHaveBeenCalled();
      expect(redis.set).toHaveBeenCalled();
      expect(result).toEqual([dto]);
    });
  });

  describe('create', () => {
    it('создает новое обращение', async () => {
      const dto: RequestCreateDto = { subject: 'subj', description: 'desc' };
      const created = { id: '1', ...dto } as Request;
      mockPrisma.request.create.mockResolvedValue(created);
      jest.spyOn(RequestDto, 'fromModel').mockReturnValue(RequestDto.fromModel(created));
      (redis.keys as jest.Mock).mockResolvedValue(['request:1']);
      (redis.del as jest.Mock).mockResolvedValue(1);

      const result = await service.create(dto);

      expect(mockPrisma.request.create).toHaveBeenCalled();
      expect(redis.del).toHaveBeenCalledWith('request:1');
      expect(result).toEqual(RequestDto.fromModel(created));
    });
  });

  describe('start', () => {
    it('обновляет статус обращения на "В работе"', async () => {
      mockPrisma.request.findFirst.mockResolvedValue({ id: '1' });
      const updated = { id: '1', status: RequestStatus.IN_PROGRESS } as Request;
      mockPrisma.request.update.mockResolvedValue(updated);
      jest.spyOn(RequestDto, 'fromModel').mockReturnValue(RequestDto.fromModel(updated));
      (redis.keys as jest.Mock).mockResolvedValue(['request:1']);
      (redis.del as jest.Mock).mockResolvedValue(1);

      const result = await service.start('1');

      expect(result).toEqual(RequestDto.fromModel(updated));
      expect(redis.del).toHaveBeenCalledWith('request:1');
      expect(result).toEqual(RequestDto.fromModel(updated));
    });

    it('возвращает 404, если обращение по ID не найдено', async () => {
      mockPrisma.request.findFirst.mockResolvedValue(null);
      await expect(service.start('1')).rejects.toThrow(HttpError);
    });
  });

  describe('complete', () => {
    it('обновляет статус обращения на "Завершено"', async () => {
      mockPrisma.request.findFirst.mockResolvedValue({ id: '1' });
      const updated = { id: '1', status: RequestStatus.COMPLETED, solutionText: 'done' } as Request;
      mockPrisma.request.update.mockResolvedValue(updated);
      jest.spyOn(RequestDto, 'fromModel').mockReturnValue(RequestDto.fromModel(updated));
      (redis.keys as jest.Mock).mockResolvedValue(['request:1']);
      (redis.del as jest.Mock).mockResolvedValue(1);

      const result = await service.complete('1', { closingText: 'done' });

      expect(result).toEqual(RequestDto.fromModel(updated));
      expect(redis.del).toHaveBeenCalledWith('request:1');
      expect(result).toEqual(RequestDto.fromModel(updated));
    });
  });

  describe('cancel', () => {
    it('обновляет статус обращения на "Отменено"', async () => {
      mockPrisma.request.findFirst.mockResolvedValue({ id: '1' });
      const updated = { id: '1', status: RequestStatus.CANCELLED, cancelReason: 'because' } as Request;
      mockPrisma.request.update.mockResolvedValue(updated);
      jest.spyOn(RequestDto, 'fromModel').mockReturnValue(RequestDto.fromModel(updated));
      (redis.keys as jest.Mock).mockResolvedValue(['request:1']);
      (redis.del as jest.Mock).mockResolvedValue(1);

      const result = await service.cancel('1', { closingText: 'because' });

      expect(result).toEqual(RequestDto.fromModel(updated));
      expect(redis.del).toHaveBeenCalledWith('request:1');
      expect(result).toEqual(RequestDto.fromModel(updated));
    });
  });

  describe('cancelAllInProgress', () => {
    it('обновляет статус всех обращений со статусом "В работе" на "Отмена"', async () => {
      mockPrisma.request.updateMany.mockResolvedValue({ count: 3 });
      (redis.keys as jest.Mock).mockResolvedValue(['request:1']);
      (redis.del as jest.Mock).mockResolvedValue(1);
      const result = await service.cancelAllInProgress();

      expect(result).toEqual(new RequestUpdateManyResultDto(3));
      expect(redis.del).toHaveBeenCalledWith('request:1');
    });
  });
});
