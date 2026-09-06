import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { NotificacionGateway } from './notificacion.gateway';
import { NotificacionService } from './notificacion.service';

describe('NotificacionGateway', () => {
  let gateway: NotificacionGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificacionGateway,
        NotificacionService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    gateway = module.get<NotificacionGateway>(NotificacionGateway);
  });

  it('debe estar definido', () => {
    expect(gateway).toBeDefined();
  });
});
