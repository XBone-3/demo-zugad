import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SerialPage } from './serial.page';

describe('SerialPage', () => {
  let component: SerialPage;
  let fixture: ComponentFixture<SerialPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SerialPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
