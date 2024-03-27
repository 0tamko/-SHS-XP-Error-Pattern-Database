import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEditTypeComponent } from './dialog-edit-type.component';

describe('DialogEditTypeComponent', () => {
  let component: DialogEditTypeComponent;
  let fixture: ComponentFixture<DialogEditTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogEditTypeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogEditTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
