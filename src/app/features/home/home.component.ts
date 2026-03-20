import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ItemsService, AuthService } from '../../core/services';
import { Item, NearbyItem } from '../../core/models';
import {
  MapComponent,
  SearchDialogComponent,
  SearchParams,
  CreateItemDialogComponent,
  ProfileDialogComponent,
} from '../../shared/components';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MapComponent,
    SearchDialogComponent,
    CreateItemDialogComponent,
    ProfileDialogComponent,
    ButtonModule,
    TooltipModule,
    BadgeModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private itemsService = inject(ItemsService);
  protected authService = inject(AuthService);
  protected router = inject(Router);

  mapComponent = viewChild.required<MapComponent>('map');
  searchDialog = viewChild.required<SearchDialogComponent>('searchDialog');
  createDialog = viewChild.required<CreateItemDialogComponent>('createDialog');
  profileDialog = viewChild.required<ProfileDialogComponent>('profileDialog');

  lat = 40.7128;
  lng = -74.006;
  radius = 5;

  nearbyItems = signal<NearbyItem[]>([]);
  loading = signal(false);
  selectedLocation = signal<{ lat: number; lng: number } | null>(null);

  ngOnInit(): void {
    this.getUserLocation();
  }

  getUserLocation(): void {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.lat = position.coords.latitude;
          this.lng = position.coords.longitude;
          this.searchNearby();
        },
        () => {
          this.searchNearby();
        },
      );
    } else {
      this.searchNearby();
    }
  }

  async searchNearby(): Promise<void> {
    this.loading.set(true);
    try {
      const results = await this.itemsService.getNearby(this.lat, this.lng, this.radius);
      this.nearbyItems.set(results);
    } catch (err) {
      console.error('Error searching nearby:', err);
    } finally {
      this.loading.set(false);
    }
  }

  onLocationSelected(location: { lat: number; lng: number }): void {
    this.selectedLocation.set(location);
    this.lat = location.lat;
    this.lng = location.lng;
  }

  onSearch(params: SearchParams): void {
    this.lat = params.lat;
    this.lng = params.lng;
    this.radius = params.radius;
    this.searchNearby();
    this.selectedLocation.set(null);
  }

  onCreateItem(): void {
    const location = this.selectedLocation() || { lat: this.lat, lng: this.lng };
    this.createDialog().show(location.lat, location.lng);
  }

  onItemCreated(): void {
    this.searchNearby();
  }

  openSearchDialog(): void {
    this.searchDialog().show(this.lat, this.lng, this.radius);
  }

  openCreateDialog(): void {
    this.createDialog().show(this.lat, this.lng);
  }

  openProfileDialog(): void {
    this.profileDialog().show();
  }

  getItemMarkers(): Item[] {
    const currentUserId = this.authService.user()?.id;
    return this.nearbyItems()
      .map((n) => n.item)
      .filter((item) => item.user_id !== currentUserId);
  }

  getNameMarkes(): string[] {
    return this.nearbyItems().map((n) => n.item.title);
  }

  getDistanceToItem(item: Item): string {
    const nearby = this.nearbyItems().find((n) => n.item.id === item.id);
    return nearby ? `${nearby.distance_km.toFixed(2)} km` : '';
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
