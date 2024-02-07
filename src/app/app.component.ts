import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  public headerTitle = 'Mob-Inv';
  public appPages = [
    { title: 'Home', url: '/dashboard', icon: 'easel-outline' },
    { title: 'Assigned Responsibilities', url: '/my-resp', icon: 'briefcase-outline' },
    { title: 'Select Org', url: '/select-org', icon: 'briefcase-outline' },
    { title: 'Refresh', url: '/activity', icon: 'refresh-outline' },
    { title: 'Logout', url: '/dashboard/logout', icon: 'log-out-outline' },
    { title: 'Logout + Clear', url: '/dashboard/logout-clear', icon: 'trash' },
  ];
  constructor() {}
}
