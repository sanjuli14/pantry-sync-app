import { Injectable } from '@angular/core';

interface GeoPosition {
  lat: number;
  lng: number;
}

@Injectable({ providedIn: 'root' })
export class GeolocationService {
  async getCurrentPosition(): Promise<GeoPosition> {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('Geolocation not supported'));
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
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    });
  }
}
