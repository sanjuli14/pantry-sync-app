import {
  Component,
  input,
  effect,
  ElementRef,
  viewChild,
  AfterViewInit,
  output,
} from '@angular/core';
import * as L from 'leaflet';
import { Item } from '../../../core/models';
import { getImageUrl } from '../../../core/utils/image.utils';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  template: `<div #mapContainer class="map-container"></div>`,
  styles: [
    `
      .map-container {
        width: 100%;
        height: 100%;
        border-radius: 12px;
        z-index: 1;
      }

      :host ::ng-deep {
        .marker-pin {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .marker-pin.pulse {
          animation: pulse 2s infinite;
        }

        .marker-pin.item {
          background: white;
          border: 2px solid #6366f1;
        }

        .marker-emoji {
          font-size: 20px;
        }

        .marker-label {
          background: white;
          width: max-content;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 80px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
          margin-top: 2px;
        }

        .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
        }

        .leaflet-popup-content {
          margin: 12px !important;
        }
      }
    `,
  ],
})
export class MapComponent implements AfterViewInit {
  private mapContainer = viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');
  private map?: L.Map;
  private markersLayer?: L.LayerGroup;

  center = input<{ lat: number; lng: number }>({ lat: 40.7128, lng: -80.006 });
  items = input<Item[]>([]);
  radius = input<number>(0.5);
  enableClick = input(true);
  label = input<string[]>([]);

  locationSelected = output<{ lat: number; lng: number }>();

  private searchMarker?: L.Marker;

  constructor() {
    effect(() => {
      const c = this.center();
      if (this.map) {
        this.map.setView([c.lat, c.lng], 14);
        this.updateSearchMarker(c);
      }
    });

    effect(() => {
      const items = this.items();
      if (this.map) {
        this.updateItemsMarkers(items);
      }
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    const c = this.center();

    this.map = L.map(this.mapContainer().nativeElement, {
      center: [c.lat, c.lng],
      zoom: 14,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);

    this.updateSearchMarker(c);

    if (this.enableClick()) {
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        this.locationSelected.emit({ lat: e.latlng.lat, lng: e.latlng.lng });
      });
    }
  }

  private updateSearchMarker(center: { lat: number; lng: number }): void {
    if (!this.map) return;

    const icon = L.divIcon({
      className: 'search-marker',
      html: `
        <div class="marker-pin pulse">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#6366f1">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      `,
      iconSize: [52, 52],
      iconAnchor: [16, 32],
    });

    if (this.searchMarker) {
      this.searchMarker.setLatLng([center.lat, center.lng]);
      this.searchMarker.setIcon(icon);
    } else {
      this.searchMarker = L.marker([center.lat, center.lng], { icon })
        .addTo(this.map!)
        .bindPopup('Ubicación de búsqueda');
    }
  }

  private updateItemsMarkers(items: Item[]): void {
    if (!this.markersLayer) return;

    this.markersLayer.clearLayers();

    const categoryIcons: Record<string, string> = {
      'Frutas/Vegetales': '🥬',
      Panadería: '🥖',
      Lácteos: '🧀',
      Enlatados: '🥫',
      Higiene: '🧴',
      Otros: '📦',
    };

    items.forEach((item) => {
      if (item.latitude && item.longitude) {
        const imageUrl = getImageUrl(item.image_url);

        const icon = L.divIcon({
          className: 'item-marker',
          html: `
            <div class="marker-pin item" style="background: ${imageUrl ? 'url(' + imageUrl + ') center/cover' : '#fff'}">
              ${imageUrl ? '' : '<span class="marker-emoji">' + (categoryIcons[item.category] || '📦') + '</span>'}
            </div>
            <div class="marker-label">${item.title}</div>
          `,
          iconSize: [40, 55],
          iconAnchor: [20, 55],
          popupAnchor: [0, -45],
        });

        const expiresDate = new Date(item.expires_at);
        const now = new Date();
        const hoursLeft = Math.round((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60));
        const urgency = hoursLeft < 12 ? '🔴' : hoursLeft < 24 ? '🟡' : '🟢';

        const phone = item.contact?.replace(/\D/g, '') || '';
        const message = encodeURIComponent(`Hola! Me interesa el artículo: ${item.title}`);
        const whatsappLink = phone ? `https://wa.me/${phone}?text=${message}` : '';

        const popupContent = `
          <div style="min-width: 180px;">
            ${imageUrl ? `<img src="${imageUrl}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 6px; margin-bottom: 8px;" />` : ''}
            <strong style="font-size: 14px; display: block; margin-bottom: 4px;">${item.title}</strong>
            <p style="margin: 2px 0; font-size: 12px; color: #666;">📍 ${item.zone}</p>
            <p style="margin: 2px 0; font-size: 12px;">${urgency} Expira en ${hoursLeft}h</p>
            <p style="margin: 2px 0; font-size: 11px; color: #888;">${item.category}</p>
            ${
              whatsappLink
                ? `
              <a href="${whatsappLink}" target="_blank" rel="noopener noreferrer" 
                 style="display: inline-flex; align-items: center; gap: 4px; margin-top: 8px; padding: 6px 12px; background: #25d366; color: white; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 500;">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Contactar
              </a>
            `
                : ''
            }
          </div>
        `;

        const marker = L.marker([item.latitude, item.longitude], { icon }).bindPopup(popupContent);

        this.markersLayer!.addLayer(marker);
      }
    });
  }

  focusOnLocation(lat: number, lng: number): void {
    if (this.map) {
      this.map.setView([lat, lng], 15);
      this.updateSearchMarker({ lat, lng });
    }
  }
}
