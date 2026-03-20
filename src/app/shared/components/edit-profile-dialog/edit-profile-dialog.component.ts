import { Component, inject, signal, output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-edit-profile-dialog',
  standalone: true,
  imports: [DialogModule, ButtonModule, InputTextModule, ReactiveFormsModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast />
    <p-dialog
      header="Editar Perfil"
      [(visible)]="visible"
      [modal]="true"
      [closable]="true"
      [style]="{ width: '400px' }"
      [draggable]="false"
      [resizable]="false"
      (onHide)="onClose.emit()"
    >
      <form [formGroup]="form" class="form-content">
        <div class="field">
          <label for="alias">Alias</label>
          <input pInputText id="alias" formControlName="alias" placeholder="Tu nombre de usuario" />
          @if (form.get('alias')?.invalid && form.get('alias')?.touched) {
            <small class="error">El alias es requerido</small>
          }
        </div>

        <div class="field">
          <label for="phone">Teléfono</label>
          <input pInputText id="phone" formControlName="phone" placeholder="+56912345678" />
          @if (form.get('phone')?.invalid && form.get('phone')?.touched) {
            <small class="error">El teléfono debe tener entre 8 y 20 caracteres</small>
          }
        </div>
      </form>

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

      .field input {
        width: 100%;
      }

      .field .error {
        color: #ef4444;
        font-size: 0.8rem;
      }
    `,
  ],
})
export class EditProfileDialogComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);

  visible = false;
  saving = signal(false);

  onClose = output<void>();
  onSaved = output<void>();

  form = this.fb.group({
    alias: ['', [Validators.required, Validators.minLength(3)]],
    phone: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
  });

  show(): void {
    const user = this.authService.user();
    this.form.patchValue({
      alias: user?.alias || '',
      phone: user?.phone || '',
    });
    this.visible = true;
  }

  close(): void {
    this.visible = false;
    this.form.reset();
    this.onClose.emit();
  }

  async save(): Promise<void> {
    if (this.form.invalid) return;

    this.saving.set(true);
    try {
      await this.authService.updateProfile({
        alias: this.form.value.alias!,
        phone: this.form.value.phone!,
      });
      this.messageService.add({
        severity: 'success',
        summary: 'Perfil actualizado',
        detail: 'Tus datos han sido guardados correctamente',
      });
      this.onSaved.emit();
      this.close();
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo actualizar el perfil',
      });
    } finally {
      this.saving.set(false);
    }
  }
}
