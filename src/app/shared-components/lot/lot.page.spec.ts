import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LotPage } from './lot.page';

describe('LotPage', () => {
  let component: LotPage;
  let fixture: ComponentFixture<LotPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(LotPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
