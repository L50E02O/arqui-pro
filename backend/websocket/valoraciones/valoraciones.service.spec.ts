import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ValoracionesService } from './valoraciones.service';

describe('ValoracionesService', () => {
  let service: ValoracionesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
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

    service = module.get<ValoracionesService>(ValoracionesService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });
});
