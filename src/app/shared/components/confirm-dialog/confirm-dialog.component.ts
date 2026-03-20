import { Component, signal, output, AfterViewInit } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [DialogModule, ButtonModule],
  template: `
    <p-dialog
      [header]="title()"
      [(visible)]="visible"
      [modal]="true"
      [closable]="true"
      [style]="{ width: '400px' }"
      [draggable]="false"
      [resizable]="false"
    >
      <div class="confirm-content">
        <div class="confirm-icon" [class.danger]="isDanger()">
          <i [class]="icon()"></i>
        </div>
        <p>{{ message() }}</p>
      </div>

      <ng-template pTemplate="footer">
        <p-button label="Cancelar" [text]="true" (onClick)="close()" />
        <p-button
          [label]="confirmText()"
          [severity]="isDanger() ? 'danger' : 'primary'"
          [icon]="icon()"
          [loading]="loading()"
          (onClick)="confirm()"
        />
      </ng-template>
    </p-dialog>
  `,
  styles: [
    `
      .confirm-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        padding: 1rem 0;

        .confirm-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fef3c7;

          i {
            font-size: 2rem;
            color: #f59e0b;
          }

          &.danger {
            background: #fee2e2;

            i {
              color: #ef4444;
            }
          }
        }

        p {
          margin: 0;
          text-align: center;
          font-size: 1rem;
          color: #1e293b;
          line-height: 1.5;
        }
      }
    `,
  ],
})
export class ConfirmDialogComponent {
  visible = false;
  title = signal('Confirmar');
  message = signal('¿Estás seguro?');
  confirmText = signal('Confirmar');
  icon = signal('pi pi-check');
  isDanger = signal(false);
  loading = signal(false);

  onConfirm = output<void>();
  ready = output<ConfirmDialogComponent>();

  ngAfterViewInit(): void {
    this.ready.emit(this);
  }

  show(options: {
    title?: string;
    message: string;
    confirmText?: string;
    icon?: string;
    isDanger?: boolean;
  }): void {
    this.title.set(options.title || 'Confirmar');
    this.message.set(options.message);
    this.confirmText.set(options.confirmText || 'Confirmar');
    this.icon.set(options.icon || 'pi pi-check');
    this.isDanger.set(options.isDanger || false);
    this.visible = true;
  }

  close(): void {
    this.visible = false;
  }

  confirm(): void {
    this.onConfirm.emit();
    this.close();
  }
}
