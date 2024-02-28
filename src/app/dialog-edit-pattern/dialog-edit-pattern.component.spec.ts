import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEditPatternComponent } from './dialog-edit-pattern.component';

describe('DialogEditPatternComponent', () => {
  let component: DialogEditPatternComponent;
  let fixture: ComponentFixture<DialogEditPatternComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogEditPatternComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogEditPatternComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
