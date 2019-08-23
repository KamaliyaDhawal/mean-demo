import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GuidanceUserComponent } from './guidance-user.component';

describe('GuidanceUserComponent', () => {
  let component: GuidanceUserComponent;
  let fixture: ComponentFixture<GuidanceUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GuidanceUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GuidanceUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
