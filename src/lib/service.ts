import { PrismaClient } from '@prisma/client';

/**
 * Абстрактный сервис бизнес-логики приложения
 */
export abstract class Service {
  /**
   * Клиент для Prisma
   */
  protected prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }
}
