import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TransHistPage } from './trans-hist.page';

describe('TransHistPage', () => {
  let component: TransHistPage;
  let fixture: ComponentFixture<TransHistPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(TransHistPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
