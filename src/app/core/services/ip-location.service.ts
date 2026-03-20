import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface GeoPosition {
  lat: number;
  lng: number;
}

interface IpApiResponse {
  lat: number;
  lon: number;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class IpLocationService {
  private http = inject(HttpClient);

  async getLocation(): Promise<GeoPosition> {
    try {
      const response = await firstValueFrom(
        this.http.get<IpApiResponse>('http://ip-api.com/json/?fields=lat,lon,status'),
      );

      if (response.status !== 'success') {
        throw new Error('IP geolocation failed');
      }

      return {
        lat: response.lat,
        lng: response.lon,
      };
    } catch {
      throw new Error('No se pudo obtener la ubicación por IP');
    }
  }
}
