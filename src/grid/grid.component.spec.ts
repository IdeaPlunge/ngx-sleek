import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { NgxGridComponent } from './grid.component';

describe('LibComponent', function () {
  let de: DebugElement;
  let comp: NgxGridComponent;
  let fixture: ComponentFixture<NgxGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NgxGridComponent]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxGridComponent);
    comp = fixture.componentInstance;
    de = fixture.debugElement.query(By.css('p.description'));
  });

  it('should create component', () => expect(comp).toBeDefined());

  it('should have expected <p> text', () => {
    fixture.detectChanges();
    const p = de.nativeElement;
    const description = 'Sleek Angular Grid Component';
    expect(p.textContent).toEqual(description);
  });
});
