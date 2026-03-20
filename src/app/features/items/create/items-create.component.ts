import { Component, inject, signal, ElementRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ItemsService, GeolocationService } from '../../../core/services';
import { CATEGORIES } from '../../../core/models';
import { HeaderComponent, MapComponent } from '../../../shared/components';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-items-create',
  standalone: true,
  imports: [
    HeaderComponent,
    MapComponent,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    InputNumberModule,
    ButtonModule,
    CardModule,
    MessageModule,
    ToastModule,
    FileUploadModule,
  ],
  providers: [MessageService],
  templateUrl: './items-create.component.html',
  styleUrl: './items-create.component.scss',
})
export class ItemsCreateComponent {
  private fb = inject(FormBuilder);
  private itemsService = inject(ItemsService);
  private geolocationService = inject(GeolocationService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  categories = CATEGORIES.map((c) => ({ label: c, value: c }));

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
  useCurrentLocation = signal(false);

  onLocationSelected(location: { lat: number; lng: number }): void {
    this.form.patchValue({
      latitude: location.lat,
      longitude: location.lng,
    });
  }

  useMyLocation(): void {
    this.useCurrentLocation.set(true);
    this.geolocationService
      .getCurrentPosition()
      .then((position: { lat: number; lng: number }) => {
        this.form.patchValue({
          latitude: position.lat,
          longitude: position.lng,
        });
        this.useCurrentLocation.set(false);
      })
      .catch(() => {
        this.useCurrentLocation.set(false);
        this.messageService.add({
          severity: 'warn',
          summary: 'Ubicación no disponible',
          detail: 'No se pudo obtener tu ubicación. Usa las coordenadas manualmente.',
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
    }
  }

  async onSubmit(): Promise<void> {
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

      setTimeout(() => {
        this.router.navigate(['/items']);
      }, 1500);
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

  goBack(): void {
    this.router.navigate(['/items']);
  }
}
