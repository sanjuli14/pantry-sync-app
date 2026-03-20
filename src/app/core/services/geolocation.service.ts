import { Injectable, inject } from '@angular/core';
import { IpLocationService } from './ip-location.service';

interface GeoPosition {
  lat: number;
  lng: number;
}

@Injectable({ providedIn: 'root' })
export class GeolocationService {
  private ipLocationService = inject(IpLocationService);

  async getCurrentPosition(): Promise<GeoPosition> {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        this.tryIpFallback(resolve, reject);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          this.tryIpFallback(resolve, reject);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    });
  }

  private tryIpFallback(
    resolve: (value: GeoPosition) => void,
    reject: (reason?: any) => void,
  ): void {
    this.ipLocationService.getLocation().then(resolve).catch(reject);
  }
}
