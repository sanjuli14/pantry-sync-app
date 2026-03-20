import { Component, inject, signal, output, OnInit } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ItemsService, GeolocationService } from '../../../core/services';
import { CATEGORIES } from '../../../core/models';

@Component({
  selector: 'app-create-item-dialog',
  standalone: true,
  imports: [
    DialogModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    InputNumberModule,
    ButtonModule,
    ToastModule,
    ReactiveFormsModule,
  ],
  providers: [MessageService],
  template: `
    <p-toast />
    <p-dialog
      header="Publicar Artículo"
      [(visible)]="visible"
      [modal]="true"
      [style]="{ width: '650px', maxHeight: '90vh' }"
      [draggable]="false"
      [resizable]="false"
      (onHide)="onCancel()"
    >
      <div class="create-dialog-content">
        @if (error()) {
          <div class="error-banner">
            <i class="pi pi-exclamation-circle"></i>
            {{ error() }}
          </div>
        }

        <form [formGroup]="form" class="create-form">
          <div class="form-field">
            <label for="title">Título</label>
            <input
              pInputText
              id="title"
              formControlName="title"
              placeholder="Ej: Manzanas frescas"
            />
            @if (form.get('title')?.invalid && form.get('title')?.touched) {
              <small class="p-error">El título es requerido</small>
            }
          </div>

          <div class="form-field">
            <label for="category">Categoría</label>
            <p-select
              id="category"
              formControlName="category"
              [options]="categories"
              placeholder="Selecciona una categoría"
              styleClass="w-full"
            />
            @if (form.get('category')?.invalid && form.get('category')?.touched) {
              <small class="p-error">La categoría es requerida</small>
            }
          </div>

          <div class="form-field">
            <label for="description">Descripción</label>
            <textarea
              pTextarea
              id="description"
              formControlName="description"
              rows="2"
              placeholder="Describe el artículo..."
            ></textarea>
            @if (form.get('description')?.invalid && form.get('description')?.touched) {
              <small class="p-error">La descripción es requerida</small>
            }
          </div>

          <div class="form-row">
            <div class="form-field">
              <label for="zone">Zona</label>
              <input pInputText id="zone" formControlName="zone" placeholder="Ej: Centro" />
              @if (form.get('zone')?.invalid && form.get('zone')?.touched) {
                <small class="p-error">La zona es requerida</small>
              }
            </div>

            <div class="form-field">
              <label for="contact">Contacto</label>
              <input pInputText id="contact" formControlName="contact" placeholder="Teléfono" />
            </div>
          </div>

          <div class="location-section">
            <div class="location-header">
              <span class="location-label">
                <i class="pi pi-map-marker"></i>
                Ubicación
              </span>
              <p-button
                label="Mi ubicación"
                icon="pi pi-compass"
                [text]="true"
                [loading]="gettingLocation()"
                (onClick)="useCurrentLocation()"
                size="small"
              />
            </div>

            <div class="coordinates-row">
              <div class="coord-input">
                <label>Latitud</label>
                <p-inputNumber
                  formControlName="latitude"
                  [minFractionDigits]="6"
                  [maxFractionDigits]="6"
                  [min]="-90"
                  [max]="90"
                />
              </div>
              <div class="coord-input">
                <label>Longitud</label>
                <p-inputNumber
                  formControlName="longitude"
                  [minFractionDigits]="6"
                  [maxFractionDigits]="6"
                  [min]="-180"
                  [max]="180"
                />
              </div>
            </div>
          </div>

          <div class="image-section">
            <label>Imagen del artículo <span class="required">*</span></label>
            <div class="file-upload" [class.has-file]="selectedFile" [class.error]="imageError()">
              <input
                type="file"
                accept="image/*"
                id="fileInput"
                (change)="onFileSelected($event)"
                hidden
              />
              <label for="fileInput" class="upload-label">
                @if (selectedFile) {
                  <div class="preview-container">
                    <img [src]="getPreviewUrl()" alt="Preview" class="preview-image" />
                    <div class="preview-info">
                      <i class="pi pi-check-circle"></i>
                      <span>{{ selectedFile.name }}</span>
                    </div>
                  </div>
                } @else {
                  <div class="upload-placeholder">
                    <i class="pi pi-cloud-upload"></i>
                    <span>Seleccionar imagen</span>
                  </div>
                }
              </label>
              @if (selectedFile) {
                <button type="button" class="clear-btn" (click)="clearFile()">
                  <i class="pi pi-times"></i>
                </button>
              }
            </div>
            @if (imageError()) {
              <small class="p-error">La imagen es requerida</small>
            }
          </div>
        </form>
      </div>

      <ng-template pTemplate="footer">
        <p-button label="Cancelar" [text]="true" (onClick)="onCancel()" />
        <p-button
          label="Publicar"
          icon="pi pi-check"
          [loading]="loading()"
          (onClick)="onSubmit()"
          [disabled]="form.invalid"
        />
      </ng-template>
    </p-dialog>
  `,
  styles: [
    `
      .create-dialog-content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .error-banner {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        background: var(--red-100);
        border: 1px solid var(--red-300);
        border-radius: 8px;
        color: var(--red-700);
        font-size: 0.9rem;
      }

      .create-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .form-field {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;

        label {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-color-secondary);
        }

        input,
        textarea,
        :host ::ng-deep .p-select {
          width: 100%;
        }

        textarea {
          resize: vertical;
        }
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }

      .location-section {
        background: var(--surface-ground);
        border-radius: 8px;
        padding: 1rem;

        .location-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;

          .location-label {
            font-size: 0.85rem;
            font-weight: 500;
            color: var(--text-color-secondary);
            display: flex;
            align-items: center;
            gap: 0.4rem;

            i {
              color: var(--primary-color);
            }
          }
        }

        .coordinates-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;

          .coord-input {
            display: flex;
            flex-direction: column;
            gap: 0.4rem;

            label {
              font-size: 0.8rem;
              color: var(--text-color-secondary);
            }

            :host ::ng-deep .p-inputnumber {
              width: 100%;
            }
          }
        }
      }

      .image-section {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;

        label {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-color-secondary);

          .required {
            color: #ef4444;
          }
        }

        &.error .file-upload {
          border-color: #ef4444;
        }
      }

      .file-upload {
        position: relative;
        border: 2px dashed var(--surface-border);
        border-radius: 8px;
        transition: all 0.2s;

        &:hover {
          border-color: var(--primary-color);
        }

        &.has-file {
          border-style: solid;
          border-color: var(--green-500);
        }

        &.error {
          border-color: #ef4444;
        }

        .upload-label {
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 0.9rem;
          color: var(--text-color-secondary);

          .upload-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
            padding: 2rem;
            width: 100%;

            i {
              font-size: 2rem;
            }
          }

          .preview-container {
            display: flex;
            align-items: center;
            gap: 1rem;
            width: 100%;
            padding: 0.75rem;

            .preview-image {
              width: 60px;
              height: 60px;
              object-fit: cover;
              border-radius: 8px;
            }

            .preview-info {
              display: flex;
              align-items: center;
              gap: 0.5rem;
              flex: 1;

              i {
                font-size: 1.25rem;
                color: #10b981;
              }
            }
          }
        }

        .clear-btn {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: var(--red-500);
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;

          &:hover {
            background: var(--red-600);
          }
        }
      }
    `,
  ],
})
export class CreateItemDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private itemsService = inject(ItemsService);
  private geolocationService = inject(GeolocationService);
  private messageService = inject(MessageService);

  categories = CATEGORIES.map((c) => ({ label: c, value: c }));

  visible = false;
  form = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    zone: ['', Validators.required],
    category: ['', Validators.required],
    contact: [''],
    latitude: [40.7128, [Validators.required]],
    longitude: [-74.006, [Validators.required]],
  });

  selectedFile: File | null = null;
  loading = signal(false);
  error = signal<string | null>(null);
  gettingLocation = signal(false);
  imageError = signal(false);

  created = output<void>();
  cancel = output<void>();

  ngOnInit(): void {}

  show(lat?: number, lng?: number): void {
    this.form.reset();
    this.selectedFile = null;
    this.error.set(null);
    this.imageError.set(false);

    if (lat !== undefined && lng !== undefined) {
      this.form.patchValue({ latitude: lat, longitude: lng });
    }

    this.visible = true;
  }

  hide(): void {
    this.visible = false;
  }

  useCurrentLocation(): void {
    this.gettingLocation.set(true);
    this.geolocationService
      .getCurrentPosition()
      .then((pos) => {
        this.form.patchValue({ latitude: pos.lat, longitude: pos.lng });
        this.gettingLocation.set(false);
      })
      .catch(() => {
        this.gettingLocation.set(false);
        this.messageService.add({
          severity: 'warn',
          summary: 'Ubicación no disponible',
          detail: 'No se pudo obtener tu ubicación.',
        });
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 5 * 1024 * 1024) {
        this.messageService.add({
          severity: 'error',
          summary: 'Archivo muy grande',
          detail: 'La imagen debe ser menor a 5MB',
        });
        input.value = '';
        return;
      }
      this.selectedFile = file;
      this.imageError.set(false);
    }
  }

  getPreviewUrl(): string {
    if (this.selectedFile) {
      return URL.createObjectURL(this.selectedFile);
    }
    return '';
  }

  clearFile(): void {
    this.selectedFile = null;
    this.imageError.set(true);
  }

  async onSubmit(): Promise<void> {
    if (!this.selectedFile) {
      this.imageError.set(true);
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      const item = await this.itemsService.create(this.form.value as any);

      if (this.selectedFile) {
        await this.itemsService.uploadImage(item.id, this.selectedFile);
      }

      this.messageService.add({
        severity: 'success',
        summary: '¡Publicado!',
        detail: 'El artículo se ha publicado correctamente',
      });

      this.hide();
      this.created.emit();
    } catch (err: any) {
      this.error.set(err.error?.detail || 'Error al publicar');
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: this.error()!,
      });
    } finally {
      this.loading.set(false);
    }
  }

  onCancel(): void {
    this.cancel.emit();
    this.hide();
  }
}
