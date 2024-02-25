import { Injectable } from '@angular/core';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UiProviderService {

  private loaders: HTMLIonLoadingElement[] = [];

  constructor(
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController
  ) { }

  async presentToast(header: string, message: string, toastColor: string = 'primary') {
    const toast = await this.toastController.create({
      header: header,
      message: message,
      duration: 2000,
      color: toastColor,
      position: 'top'
    });
    await toast.present();
  }

  async presentLoading(message: string) {
    const loading = await this.loadingController.create({
      message: message
    });
    this.loaders.push(loading);
    await loading.present();
  }

  presentAlert(header: string, message: string, accept_btn_text: string = 'OK') {
    return new Promise(async (resolve, reject) => {
      const alert = await this.alertController.create({
        header: header,
        message: message,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: accept_btn_text,
            handler: () => {
              resolve(true);
            }
          }
        ]
      })
      await alert.present();
    })
  }

  dismissLoading() {
    this.loaders.forEach(async (loader) => {
      await loader.dismiss();
    })
  }
}
