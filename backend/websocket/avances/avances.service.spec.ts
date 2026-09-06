import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { AvancesService } from './avances.service';

describe('AvancesService', () => {
  let service: AvancesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
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

    service = module.get<AvancesService>(AvancesService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });
});
