import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UomPage } from './uom.page';

describe('UomPage', () => {
  let component: UomPage;
  let fixture: ComponentFixture<UomPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(UomPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
