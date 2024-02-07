import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectOrgPage } from './select-org.page';

describe('SelectOrgPage', () => {
  let component: SelectOrgPage;
  let fixture: ComponentFixture<SelectOrgPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SelectOrgPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
