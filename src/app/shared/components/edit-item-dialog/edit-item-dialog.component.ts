import { Component, inject, signal, output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ItemsService } from '../../../core/services';
import { Item, CATEGORIES } from '../../../core/models';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-edit-item-dialog',
  standalone: true,
  imports: [
    DialogModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    ReactiveFormsModule,
    ToastModule,
  ],
  providers: [MessageService],
  template: `
    <p-toast />
    <p-dialog
      header="Editar Artículo"
      [(visible)]="visible"
      [modal]="true"
      [closable]="true"
      [style]="{ width: '500px' }"
      [draggable]="false"
      [resizable]="false"
      (onHide)="onClose.emit()"
    >
      @if (item()) {
        <form [formGroup]="form" class="form-content">
          <div class="field">
            <label for="title">Título</label>
            <input
              pInputText
              id="title"
              formControlName="title"
              placeholder="Nombre del artículo"
            />
            @if (form.get('title')?.invalid && form.get('title')?.touched) {
              <small class="error">El título es requerido</small>
            }
          </div>

          <div class="field">
            <label for="description">Descripción</label>
            <textarea
              pInputTextarea
              id="description"
              formControlName="description"
              placeholder="Describe el artículo..."
              [autoResize]="true"
              rows="3"
            ></textarea>
            @if (form.get('description')?.invalid && form.get('description')?.touched) {
              <small class="error">La descripción es requerida</small>
            }
          </div>

          <div class="field">
            <label for="zone">Zona</label>
            <input pInputText id="zone" formControlName="zone" placeholder="Barrio o zona" />
            @if (form.get('zone')?.invalid && form.get('zone')?.touched) {
              <small class="error">La zona es requerida</small>
            }
          </div>

          <div class="field">
            <label for="category">Categoría</label>
            <p-select
              id="category"
              formControlName="category"
              [options]="categories"
              placeholder="Selecciona una categoría"
              styleClass="w-full"
            />
          </div>

          <div class="field">
            <label for="contact">Teléfono de Contacto</label>
            <input pInputText id="contact" formControlName="contact" placeholder="+56912345678" />
          </div>
        </form>
      }

      <ng-template pTemplate="footer">
        <p-button label="Cancelar" [text]="true" [disabled]="saving()" (onClick)="close()" />
        <p-button
          label="Guardar"
          [loading]="saving()"
          [disabled]="form.invalid"
          (onClick)="save()"
        />
      </ng-template>
    </p-dialog>
  `,
  styles: [
    `
      .form-content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .field label {
        font-weight: 500;
        font-size: 0.9rem;
        color: #475569;
      }

      .field input,
      .field textarea,
      .field :host ::ng-deep .p-dropdown {
        width: 100%;
      }

      .field .error {
        color: #ef4444;
        font-size: 0.8rem;
      }
    `,
  ],
})
export class EditItemDialogComponent {
  private fb = inject(FormBuilder);
  private itemsService = inject(ItemsService);
  private messageService = inject(MessageService);

  visible = false;
  saving = signal(false);
  item = signal<Item | null>(null);

  onClose = output<void>();
  onSaved = output<void>();

  categories = CATEGORIES.map((c) => ({ label: c, value: c }));

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    zone: ['', Validators.required],
    category: ['', Validators.required],
    contact: [''],
  });

  show(item: Item): void {
    this.item.set(item);
    this.form.patchValue({
      title: item.title,
      description: item.description,
      zone: item.zone,
      category: item.category,
      contact: item.contact || '',
    });
    this.visible = true;
  }

  close(): void {
    this.visible = false;
    this.form.reset();
    this.item.set(null);
    this.onClose.emit();
  }

  async save(): Promise<void> {
    if (this.form.invalid) return;

    const currentItem = this.item();
    if (!currentItem) return;

    this.saving.set(true);
    try {
      await this.itemsService.update(currentItem.id, {
        title: this.form.value.title!,
        description: this.form.value.description!,
        zone: this.form.value.zone!,
        category: this.form.value.category!,
        contact: this.form.value.contact || undefined,
      });
      this.messageService.add({
        severity: 'success',
        summary: 'Artículo actualizado',
        detail: 'Los cambios han sido guardados correctamente',
      });
      this.onSaved.emit();
      this.close();
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo actualizar el artículo',
      });
    } finally {
      this.saving.set(false);
    }
  }
}
