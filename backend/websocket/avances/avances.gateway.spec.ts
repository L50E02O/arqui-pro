import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { AvancesGateway } from './avances.gateway';
import { AvancesService } from './avances.service';

describe('AvancesGateway', () => {
  let gateway: AvancesGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvancesGateway,
        AvancesService,
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

    gateway = module.get<AvancesGateway>(AvancesGateway);
  });

  it('debe estar definido', () => {
    expect(gateway).toBeDefined();
  });
});
