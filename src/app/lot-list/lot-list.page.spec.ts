import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LotListPage } from './lot-list.page';

describe('LotListPage', () => {
  let component: LotListPage;
  let fixture: ComponentFixture<LotListPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(LotListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
