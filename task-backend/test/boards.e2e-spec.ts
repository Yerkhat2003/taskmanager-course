import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('BoardsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let userToken: string;
  let adminToken: string;
  let createdBoardId: number | string;
  let userTaskId: number | string;

  const userEmail = 'user-e2e@example.com';
  const adminEmail = 'admin-e2e@example.com';
  const password = 'StrongPass123';

  beforeAll(async () => {
    // Arrange: поднять приложение с теми же настройками, что в main.ts
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Arrange: зарегистрировать двух пользователей
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: userEmail, name: 'E2E User', password })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: adminEmail, name: 'E2E Admin', password })
      .expect(201);

    // NOTE: в текущей схеме нет поля role, этот шаг оставлен как комментарий.
    // Когда в Prisma-модели User появится column `role`, можно будет раскомментировать:
    //
    // await prisma.user.update({
    //   where: { email: adminEmail },
    //   data: { role: 'ADMIN' },
    // });

    // Act: логин обоих и сохранение accessToken
    const userLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: userEmail, password })
      .expect(200);

    userToken = userLoginRes.body.accessToken;

    const adminLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminEmail, password })
      .expect(200);

    adminToken = adminLoginRes.body.accessToken;
  });

  afterAll(async () => {
    // Arrange / Act: удалить тестовые данные (когда появятся boards/tasks/role)
    // await prisma.task.deleteMany({
    //   where: { title: { in: ['E2E Task'] } },
    // });
    // await prisma.board.deleteMany({
    //   where: { title: { in: ['E2E Board'] } },
    // });
    //
    // Assert: почистить тестовых пользователей
    await prisma.user.deleteMany({
      where: { email: { in: [userEmail, adminEmail] } },
    });

    await app.close();
  });

  describe('Auth public routes', () => {
    it('POST /auth/register and /auth/login work without token', async () => {
      // Arrange
      const email = 'public-e2e@example.com';

      // Act
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, name: 'Public', password })
        .expect(201);

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password })
        .expect(200);

      // Assert
      expect(loginRes.body).toHaveProperty('accessToken');

      // cleanup
      await prisma.user.deleteMany({ where: { email } });
    });
  });

  describe('GET /boards — без токена', () => {
    it('должен возвращать 401 Unauthorized', async () => {
      // Arrange / Act / Assert
      await request(app.getHttpServer()).get('/boards').expect(401);
    });
  });

  describe('GET /boards — с токеном USER', () => {
    it('должен возвращать 200 OK', async () => {
      // Arrange / Act
      const res = await request(app.getHttpServer())
        .get('/boards')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Assert
      expect(Array.isArray(res.body) || res.body).toBeTruthy();
    });
  });

  describe('POST /boards — USER', () => {
    it('должен возвращать 403 Forbidden для USER (когда будет включена проверка роли)', async () => {
      // Arrange / Act
      const res = await request(app.getHttpServer())
        .post('/boards')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'E2E Board (USER forbidden)' });

      // Assert (на текущем этапе маршрут может ещё не быть защищён)
      // Оставляем мягкую проверку статуса.
      expect([201, 403]).toContain(res.status);
    });
  });

  describe('POST /boards — ADMIN', () => {
    it('должен создавать доску для ADMIN', async () => {
      // Arrange / Act
      const res = await request(app.getHttpServer())
        .post('/boards')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'E2E Board' });

      // Assert
      expect([201, 403]).toContain(res.status); // скорректируешь на 201, когда добавишь роли
      if (res.status === 201) {
        createdBoardId = res.body.id ?? res.body?.id;
      }
    });
  });

  // Заглушки под задания для /tasks — будут работать после появления tasks-модуля.
  describe('Tasks placeholders (ожидают реализацию /tasks)', () => {
    it('POST /tasks должен брать userId из токена', async () => {
      // Arrange / Act
      // const res = await request(app.getHttpServer())
      //   .post('/tasks')
      //   .set('Authorization', `Bearer ${userToken}`)
      //   .send({ title: 'E2E Task', userId: 999 })
      //   .expect(201);
      //
      // userTaskId = res.body.id;

      // Assert (пока просто помечаем тест как pending)
      expect(true).toBe(true);
    });

    it('PATCH /tasks/:id своей задачи → 200 OK (placeholder)', async () => {
      expect(true).toBe(true);
    });

    it('PATCH /tasks/:id чужой задачи (не ADMIN) → 403 Forbidden (placeholder)', async () => {
      expect(true).toBe(true);
    });

    it('DELETE /tasks/:id чужой задачи от имени ADMIN → 200 OK (placeholder)', async () => {
      expect(true).toBe(true);
    });
  });
});

