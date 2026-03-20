import { Component, inject, signal, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { SliderModule } from 'primeng/slider';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { GeolocationService } from '../../../core/services';

export interface SearchParams {
  lat: number;
  lng: number;
  radius: number;
}

@Component({
  selector: 'app-search-dialog',
  standalone: true,
  imports: [
    DialogModule,
    InputNumberModule,
    SliderModule,
    ButtonModule,
    FormsModule,
    MessageModule,
  ],
  providers: [MessageService],
  template: `
    <p-dialog
      header="Buscar artículos"
      [(visible)]="visible"
      [modal]="true"
      [style]="{ width: '500px' }"
      [draggable]="false"
      [resizable]="false"
      (onHide)="onCancel()"
    >
      <div class="search-dialog-content">
        <div class="input-group">
          <label for="lat">Latitud</label>
          <p-inputNumber
            id="lat"
            [(ngModel)]="lat"
            [minFractionDigits]="4"
            [maxFractionDigits]="6"
            [min]="-90"
            [max]="90"
            placeholder="Ej: 40.7128"
          />
        </div>

        <div class="input-group">
          <label for="lng">Longitud</label>
          <p-inputNumber
            id="lng"
            [(ngModel)]="lng"
            [minFractionDigits]="4"
            [maxFractionDigits]="6"
            [min]="-180"
            [max]="180"
            placeholder="Ej: -74.006"
          />
        </div>

        <div class="radius-group">
          <label
            >Radio de búsqueda: <strong>{{ radius }} km</strong></label
          >
          <p-slider [(ngModel)]="radius" [min]="0.5" [max]="20" [step]="0.5" />
        </div>

        <p-button
          label="Usar mi ubicación"
          icon="pi pi-compass"
          [outlined]="true"
          [loading]="gettingLocation()"
          (onClick)="useCurrentLocation()"
          styleClass="location-btn"
        />
      </div>

      <ng-template pTemplate="footer">
        <p-button label="Cancelar" [text]="true" (onClick)="onCancel()" />
        <p-button
          label="Buscar"
          icon="pi pi-search"
          (onClick)="onSearch()"
          [disabled]="!isValid()"
        />
      </ng-template>
    </p-dialog>
  `,
  styles: [
    `
      .search-dialog-content {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        padding: 0.5rem 0;
      }

      .input-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        label {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-color-secondary);
        }

        :host ::ng-deep .p-inputnumber {
          width: 100%;
        }
      }

      .radius-group {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        label {
          font-size: 0.9rem;
          color: var(--text-color-secondary);

          strong {
            color: var(--primary-color);
          }
        }

        :host ::ng-deep .p-slider {
          width: 100%;
        }
      }

      .location-btn {
        width: 100%;
      }
    `,
  ],
})
export class SearchDialogComponent {
  private geolocationService = inject(GeolocationService);
  private messageService = inject(MessageService);

  visible = false;
  lat = 40.7128;
  lng = -74.006;
  radius = 5;
  gettingLocation = signal(false);

  search = output<SearchParams>();
  cancel = output<void>();

  show(lat?: number, lng?: number, radius?: number): void {
    if (lat !== undefined) this.lat = lat;
    if (lng !== undefined) this.lng = lng;
    if (radius !== undefined) this.radius = radius;
    this.visible = true;
  }

  hide(): void {
    this.visible = false;
  }

  isValid(): boolean {
    return (
      this.lat >= -90 && this.lat <= 90 && this.lng >= -180 && this.lng <= 180 && this.radius >= 0.5
    );
  }

  useCurrentLocation(): void {
    this.gettingLocation.set(true);
    this.geolocationService
      .getCurrentPosition()
      .then((pos) => {
        this.lat = pos.lat;
        this.lng = pos.lng;
        this.gettingLocation.set(false);
      })
      .catch((err) => {
        this.gettingLocation.set(false);
        this.messageService.add({
          severity: 'warn',
          summary: 'Ubicación no disponible',
          detail: err.message || 'No se pudo obtener tu ubicación.',
        });
      });
  }

  onSearch(): void {
    if (this.isValid()) {
      this.search.emit({ lat: this.lat, lng: this.lng, radius: this.radius });
      this.hide();
    }
  }

  onCancel(): void {
    this.cancel.emit();
    this.hide();
  }
}
