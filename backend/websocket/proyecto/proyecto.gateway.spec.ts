import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ProyectoGateway } from './proyecto.gateway';
import { ProyectoService } from './proyecto.service';

describe('ProyectoGateway', () => {
  let gateway: ProyectoGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProyectoGateway,
        ProyectoService,
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

    gateway = module.get<ProyectoGateway>(ProyectoGateway);
  });

  it('debe estar definido', () => {
    expect(gateway).toBeDefined();
  });
});
