import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ProyectoService } from './proyecto.service';

describe('ProyectoService', () => {
  let service: ProyectoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
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

    service = module.get<ProyectoService>(ProyectoService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });
});
