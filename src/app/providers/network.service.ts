import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { UiProviderService } from './ui-provider.service';



@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  networkStatus!: string; 
  private hasShownToast = false; 
  private onlineStatusSubject = new BehaviorSubject<boolean>(true);

  constructor(
    private uiProviderService: UiProviderService
  ) {
    this.startChecking(5000);
   }

  /* common method to check network status */ 
  startChecking(intervalDuration: number = 5000): Observable<boolean> {
    interval(intervalDuration).subscribe(async () => {
      const status = await Network.getStatus();
      if (status.connected) {
        // console.log('Online'); 
        this.hasShownToast = false; 
        this.onlineStatusSubject.next(true);
      } else { 
        // console.log('Offline'); 
        if (!this.hasShownToast) { 
          this.uiProviderService.presentToast('Connection Status', 'Offline'); 
          this.hasShownToast = true; 
          this.onlineStatusSubject.next(false); 
        } 
      }
    }); 
    return this.onlineStatusSubject.asObservable();
  } 
  
  isNetworkAvailable(): Observable<boolean> { 
    return this.onlineStatusSubject.asObservable(); 
  }


}
