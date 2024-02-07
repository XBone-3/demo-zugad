import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GoodsReceiptPage } from './goods-receipt.page';

describe('GoodsReceiptPage', () => {
  let component: GoodsReceiptPage;
  let fixture: ComponentFixture<GoodsReceiptPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(GoodsReceiptPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
