import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ValoracionesGateway } from './valoraciones.gateway';
import { ValoracionesService } from './valoraciones.service';

describe('ValoracionesGateway', () => {
  let gateway: ValoracionesGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValoracionesGateway,
        ValoracionesService,
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

    gateway = module.get<ValoracionesGateway>(ValoracionesGateway);
  });

  it('debe estar definido', () => {
    expect(gateway).toBeDefined();
  });
});
