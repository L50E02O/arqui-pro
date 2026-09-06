import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { IncidenciasGateway } from './incidencias.gateway';
import { IncidenciasService } from './incidencias.service';

describe('IncidenciasGateway', () => {
  let gateway: IncidenciasGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IncidenciasGateway,
        IncidenciasService,
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

    gateway = module.get<IncidenciasGateway>(IncidenciasGateway);
  });

  it('debe estar definido', () => {
    expect(gateway).toBeDefined();
  });
});
