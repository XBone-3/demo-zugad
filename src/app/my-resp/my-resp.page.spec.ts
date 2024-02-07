import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyRespPage } from './my-resp.page';

describe('MyRespPage', () => {
  let component: MyRespPage;
  let fixture: ComponentFixture<MyRespPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(MyRespPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
