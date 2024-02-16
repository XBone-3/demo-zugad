import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocatorPage } from './locator.page';

describe('LocatorPage', () => {
  let component: LocatorPage;
  let fixture: ComponentFixture<LocatorPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(LocatorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
