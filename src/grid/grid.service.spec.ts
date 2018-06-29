import { TestBed, inject } from '@angular/core/testing';

import { NgxGridService } from './grid.service';

describe('LibService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NgxGridService]
    });
  });

  it('should create service', inject([NgxGridService], (service: NgxGridService) => {
    expect(service).toBeTruthy();
  }));

  it('should say hello to stranger', inject([NgxGridService], (service: NgxGridService) => {
    expect(service.sayHello()).toBe('Hello Stanger!');
  }));

 it('should say hello to provided user', inject([NgxGridService], (service: NgxGridService) => {
    expect(service.sayHello('ng-hacker')).toBe('Hello ng-hacker!');
  }));
});
