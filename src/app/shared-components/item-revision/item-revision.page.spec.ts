import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemRevisionPage } from './item-revision.page';

describe('ItemRevisionPage', () => {
  let component: ItemRevisionPage;
  let fixture: ComponentFixture<ItemRevisionPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ItemRevisionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
