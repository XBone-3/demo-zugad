import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from './auth.service';
import { NetworkService } from '../providers/network.service';
import { Subscription } from 'rxjs';
import { UiProviderService } from '../providers/ui-provider.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy {

  form: FormGroup | any;
  showPassword: boolean = false;
  isOnline: boolean = false;
  networkSubscription!: Subscription;
  


  constructor(
    private authService: AuthService,
    private networkService: NetworkService,
    private uiProviderService: UiProviderService
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      username: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      password: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
    })
    this.networkSubscription = this.networkService.isNetworkAvailable().subscribe((networkStatus) => {
      this.isOnline = networkStatus
    })
  }

  login() {
    if (this.isOnline) {
      const username = this.form.value.username;
    const password = this.form.value.password;
    this.authService.login(username, password);
    }
    else {
      this.uiProviderService.presentAlert('Error', 'You need to be online to proceed');
      this.uiProviderService.presentToast('Error', 'No Internet Connection');
    }
    
  }

  fillDetails() {
    this.form.setValue({
      username: 'manideep j',
      password: 'manudj'
    })
  }

  ngOnDestroy() {
    if (this.networkSubscription) {
      this.networkSubscription.unsubscribe();
    }
  }

}
