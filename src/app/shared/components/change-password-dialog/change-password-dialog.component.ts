import { Component, inject, signal, output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [DialogModule, ButtonModule, PasswordModule, ReactiveFormsModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast />
    <p-dialog
      header="Cambiar Contraseña"
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
          <label for="currentPassword">Contraseña Actual</label>
          <p-password
            id="currentPassword"
            formControlName="currentPassword"
            [toggleMask]="true"
            [feedback]="false"
            placeholder="Contraseña actual"
            styleClass="w-full"
          />
          @if (form.get('currentPassword')?.invalid && form.get('currentPassword')?.touched) {
            <small class="error">La contraseña actual es requerida</small>
          }
        </div>

        <div class="field">
          <label for="newPassword">Nueva Contraseña</label>
          <p-password
            id="newPassword"
            formControlName="newPassword"
            [toggleMask]="true"
            [feedback]="true"
            placeholder="Nueva contraseña"
            styleClass="w-full"
          />
          @if (form.get('newPassword')?.invalid && form.get('newPassword')?.touched) {
            <small class="error">La nueva contraseña debe tener al menos 6 caracteres</small>
          }
        </div>

        <div class="field">
          <label for="confirmPassword">Confirmar Nueva Contraseña</label>
          <p-password
            id="confirmPassword"
            formControlName="confirmPassword"
            [toggleMask]="true"
            [feedback]="false"
            placeholder="Repite la nueva contraseña"
            styleClass="w-full"
          />
          @if (form.errors?.['mismatch'] && form.get('confirmPassword')?.touched) {
            <small class="error">Las contraseñas no coinciden</small>
          }
        </div>
      </form>

      <ng-template pTemplate="footer">
        <p-button label="Cancelar" [text]="true" [disabled]="saving()" (onClick)="close()" />
        <p-button
          label="Cambiar"
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

      .field :host ::ng-deep .p-password {
        width: 100%;
      }

      .field :host ::ng-deep .p-password-input {
        width: 100%;
      }

      .field .error {
        color: #ef4444;
        font-size: 0.8rem;
      }
    `,
  ],
})
export class ChangePasswordDialogComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);

  visible = false;
  saving = signal(false);

  onClose = output<void>();
  onSaved = output<void>();

  form = this.fb.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: this.passwordMatchValidator },
  );

  passwordMatchValidator(form: any) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  show(): void {
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
      await this.authService.changePassword(
        this.form.value.currentPassword!,
        this.form.value.newPassword!,
      );
      this.messageService.add({
        severity: 'success',
        summary: 'Contraseña actualizada',
        detail: 'Tu contraseña ha sido cambiada correctamente',
      });
      this.onSaved.emit();
      this.close();
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cambiar la contraseña',
      });
    } finally {
      this.saving.set(false);
    }
  }
}
