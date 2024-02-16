import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubInvPage } from './sub-inv.page';

describe('SubInvPage', () => {
  let component: SubInvPage;
  let fixture: ComponentFixture<SubInvPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SubInvPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
