import { Injectable } from '@angular/core';

@Injectable()
export class NgxGridService {
  constructor() { }
  sayHello(name?: String) {
    return `Hello ${name || 'Stanger'}!`;
  }
}
