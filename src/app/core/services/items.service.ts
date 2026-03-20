import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Item, ItemCreate, NearbyItem } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ItemsService {
  private readonly _items = signal<Item[]>([]);
  private readonly _loading = signal(false);

  readonly items = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();

  constructor(private http: HttpClient) {}

  async getAll(): Promise<Item[]> {
    this._loading.set(true);
    try {
      const items = await firstValueFrom(this.http.get<Item[]>(`${environment.apiUrl}/items/`));
      this._items.set(items);
      return items;
    } finally {
      this._loading.set(false);
    }
  }

  async getNearby(lat: number, lng: number, radius = 0.5): Promise<NearbyItem[]> {
    const params = new HttpParams()
      .set('lat', lat.toString())
      .set('lng', lng.toString())
      .set('radius', radius.toString());

    return firstValueFrom(
      this.http.get<NearbyItem[]>(`${environment.apiUrl}/items/nearby`, { params }),
    );
  }

  async getMine(): Promise<Item[]> {
    return firstValueFrom(this.http.get<Item[]>(`${environment.apiUrl}/items/mine`));
  }

  async getByZone(zone: string): Promise<Item[]> {
    return firstValueFrom(
      this.http.get<Item[]>(`${environment.apiUrl}/items/zone/${encodeURIComponent(zone)}`),
    );
  }

  async getById(id: number): Promise<Item> {
    return firstValueFrom(this.http.get<Item>(`${environment.apiUrl}/items/${id}`));
  }

  async create(data: ItemCreate): Promise<Item> {
    const item = await firstValueFrom(this.http.post<Item>(`${environment.apiUrl}/items/`, data));
    return item;
  }

  async uploadImage(itemId: number, file: File): Promise<{ image_url: string; item_id: number }> {
    const formData = new FormData();
    formData.append('file', file);

    return firstValueFrom(
      this.http.post<{ image_url: string; item_id: number }>(
        `${environment.apiUrl}/items/${itemId}/image`,
        formData,
      ),
    );
  }

  async delete(itemId: number): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${environment.apiUrl}/items/${itemId}`));
  }

  async update(itemId: number, data: Partial<ItemCreate>): Promise<Item> {
    return firstValueFrom(this.http.put<Item>(`${environment.apiUrl}/items/${itemId}`, data));
  }
}
