import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubInventoryPage } from './sub-inventory.page';

describe('SubInventoryPage', () => {
  let component: SubInventoryPage;
  let fixture: ComponentFixture<SubInventoryPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SubInventoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
