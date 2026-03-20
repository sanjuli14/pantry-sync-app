import { Component, inject, signal, output, OnInit, viewChild } from '@angular/core';
import { AuthService } from '../../../core/services';
import { Item } from '../../../core/models';
import { getImageUrl } from '../../../core/utils/image.utils';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DatePipe } from '@angular/common';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ItemsService } from '../../../core/services';
import { EditProfileDialogComponent } from '../edit-profile-dialog/edit-profile-dialog.component';
import { ChangePasswordDialogComponent } from '../change-password-dialog/change-password-dialog.component';
import { EditItemDialogComponent } from '../edit-item-dialog/edit-item-dialog.component';

@Component({
  selector: 'app-profile-dialog',
  standalone: true,
  imports: [
    DialogModule,
    ButtonModule,
    DatePipe,
    ConfirmDialogComponent,
    ToastModule,
    EditProfileDialogComponent,
    ChangePasswordDialogComponent,
    EditItemDialogComponent,
  ],
  providers: [MessageService],
  template: `
    <p-toast />
    <p-dialog
      header="Mi Perfil"
      [(visible)]="visible"
      [modal]="true"
      [closable]="true"
      [style]="{ width: '800px', maxHeight: '90vh' }"
      [draggable]="false"
      [resizable]="false"
      (onHide)="onClose.emit()"
    >
      <div class="profile-content">
        <div class="profile-header">
          <div class="avatar">
            {{ authService.user()?.alias?.charAt(0)?.toUpperCase() ?? '' }}
          </div>
          <div class="user-info">
            <h2>{{ authService.user()?.alias }}</h2>
            <p class="user-meta">
              <i class="pi pi-calendar"></i>
              Miembro desde {{ authService.user()?.created_at | date: 'fullDate' }}
            </p>
            <div class="detail-info">
              <span>{{ authService.user()?.phone || 'No proporcionado' }}</span>
            </div>
          </div>
        </div>

        <div class="stats-section">
          <div class="stat-card highlight">
            <span class="stat-value">{{ myItems().length }}</span>
            <span class="stat-label">Artículos publicados</span>
          </div>
        </div>

        <div class="items-section">
          <h3>
            <i class="pi pi-box"></i>
            Mis artículos
          </h3>

          @if (loading()) {
            <div class="loading-state">
              <i class="pi pi-spin pi-spinner"></i>
              <span>Cargando...</span>
            </div>
          } @else if (myItems().length > 0) {
            <div class="items-list">
              @for (item of myItems(); track item.id) {
                <div class="item-card">
                  <div class="item-info" (click)="openDetailDialog(item)">
                    <div class="item-image">
                      @if (hasImage(item)) {
                        <img [src]="getImageUrl(item)" [alt]="item.title" />
                      } @else {
                        <div class="image-placeholder">
                          <span>{{ getCategoryEmoji(item.category) }}</span>
                        </div>
                      }
                    </div>
                    <div class="item-details">
                      <h4>{{ item.title }}</h4>
                      <p class="item-zone">
                        <i class="pi pi-map-marker"></i>
                        {{ item.zone }}
                      </p>
                      <p class="item-expires">
                        <i class="pi pi-clock"></i>
                        Expira: {{ item.expires_at | date: 'mediumDate' }}
                      </p>
                    </div>
                  </div>
                  <div class="item-actions">
                    <p-button
                      icon="pi pi-pencil"
                      pTooltip="Editar"
                      tooltipPosition="top"
                      [text]="true"
                      severity="warn"
                      (onClick)="openEditItemDialog(item)"
                    />
                    <p-button
                      icon="pi pi-eye"
                      pTooltip="Ver detalles"
                      tooltipPosition="top"
                      [text]="true"
                      (onClick)="openDetailDialog(item)"
                    />
                    <p-button
                      icon="pi pi-trash"
                      pTooltip="Eliminar"
                      tooltipPosition="top"
                      [text]="true"
                      severity="danger"
                      (onClick)="openDeleteDialog(item)"
                    />
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="empty-items">
              <span class="empty-icon">📦</span>
              <p>No tienes artículos publicados</p>
            </div>
          }
        </div>
      </div>

      <ng-template pTemplate="footer">
        <p-button
          label="Editar Perfil"
          icon="pi pi-user-edit"
          [text]="true"
          (onClick)="openEditProfileDialog()"
        />
        <p-button
          label="Cambiar Contraseña"
          icon="pi pi-lock"
          [text]="true"
          (onClick)="openChangePasswordDialog()"
        />
        <p-button label="Cerrar sesión" severity="danger" [outlined]="true" (onClick)="logout()" />
      </ng-template>
    </p-dialog>

    <!-- Detail Dialog -->
    <p-dialog
      [(visible)]="detailDialogVisible"
      [modal]="true"
      [closable]="true"
      [style]="{ width: '550px' }"
      [draggable]="false"
      [resizable]="false"
      [header]="'Detalles: ' + (selectedItem()?.title || '')"
    >
      @if (selectedItem()) {
        <div class="detail-content">
          @if (hasImage(selectedItem()!)) {
            <div class="detail-image">
              <img [src]="getImageUrl(selectedItem()!)" [alt]="selectedItem()!.title" />
            </div>
          }

          <div class="detail-badges">
            <span class="category-badge">{{ selectedItem()!.category }}</span>
          </div>

          <div class="detail-grid">
            <div class="detail-item">
              <i class="pi pi-map-marker"></i>
              <div>
                <label>Zona</label>
                <span>{{ selectedItem()!.zone }}</span>
              </div>
            </div>

            <div class="detail-item">
              <i class="pi pi-clock"></i>
              <div>
                <label>Expira</label>
                <span>{{ selectedItem()!.expires_at | date: 'mediumDate' }}</span>
              </div>
            </div>

            @if (selectedItem()!.contact) {
              <div class="detail-item">
                <i class="pi pi-phone"></i>
                <div>
                  <label>Contacto</label>
                  <span>{{ selectedItem()!.contact }}</span>
                </div>
              </div>
            }
          </div>

          <div class="detail-description">
            <h4>Descripción</h4>
            <p>{{ selectedItem()!.description }}</p>
          </div>

          <div class="detail-meta">
            <span>
              <i class="pi pi-calendar"></i>
              Publicado {{ selectedItem()!.created_at | date: 'medium' }}
            </span>
          </div>
        </div>
      }
    </p-dialog>

    <!-- Confirm Delete Dialog -->
    <app-confirm-dialog #confirmDeleteDialog (onConfirm)="confirmDelete()" />

    <!-- Edit Profile Dialog -->
    <app-edit-profile-dialog #editProfileDialog (onSaved)="onProfileSaved()" />

    <!-- Change Password Dialog -->
    <app-change-password-dialog #changePasswordDialog (onSaved)="onPasswordChanged()" />

    <!-- Edit Item Dialog -->
    <app-edit-item-dialog #editItemDialog (onSaved)="onItemSaved()" />
  `,
  styles: [
    `
      .profile-content {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .profile-header {
        display: flex;
        align-items: center;
        gap: 1.25rem;
        padding: 1.25rem;
        background: var(--surface-ground);
        border-radius: 12px;
        margin: -1rem -1rem 0 -1rem;
        color: #1e293b;

        .avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: bold;
          background: var(--primary-color);
          color: black;
        }

        .user-info {
          flex: 1;

          h2 {
            font-size: 1.25rem;
            font-weight: 600;
            margin: 0 0 0.35rem 0;
            color: #1e293b;
          }

          .user-meta {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            font-size: 0.85rem;
            color: #64748b;
            margin: 0;
          }
        }
      }

      .profile-details {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;

        .detail-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--surface-ground);
          border-radius: 10px;

          .detail-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--primary-color);
            color: white;

            i {
              font-size: 1.1rem;
            }
          }

          .detail-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 0.2rem;

            span {
              color: #1e293b;
            }

            label {
              font-size: 0.75rem;
              color: var(--text-color-secondary);
            }

            span {
              font-weight: 500;
            }
          }
        }
      }

      .stats-section {
        .stat-card {
          padding: 1.5rem;
          background: var(--surface-ground);
          border-radius: 12px;
          text-align: center;

          &.highlight {
            background: var(--surface-ground);

            .stat-value {
              color: var(--primary-color);
            }

            .stat-label {
              color: #64748b;
            }
          }

          .stat-value {
            display: block;
            font-size: 2.5rem;
            font-weight: 700;
            line-height: 1;
            margin-bottom: 0.5rem;
          }

          .stat-label {
            font-size: 0.9rem;
            opacity: 0.9;
          }
        }
      }

      .items-section {
        border-top: 1px solid var(--surface-border);
        padding-top: 1.5rem;

        h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 1rem 0;

          i {
            color: var(--primary-color);
          }
        }
      }

      .items-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        max-height: 400px;
        overflow-y: auto;
      }

      .item-card {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: var(--surface-ground);
        border-radius: 12px;
        transition: all 0.2s;

        &:hover {
          background: var(--surface-100);
        }

        .item-info {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
        }

        .item-image {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .image-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f1f5f9;
            font-size: 1.75rem;
          }
        }

        .item-details {
          flex: 1;

          h4 {
            margin: 0 0 0.35rem;
            font-size: 1rem;
            font-weight: 600;
            color: #1e293b;
          }

          .item-zone,
          .item-expires {
            margin: 0;
            font-size: 0.85rem;
            color: #64748b;
            display: flex;
            align-items: center;
            gap: 0.35rem;

            i {
              font-size: 0.75rem;
              color: var(--primary-color);
            }
          }

          .item-expires {
            margin-top: 0.25rem;
          }
        }

        .item-actions {
          display: flex;
          gap: 0.25rem;
        }
      }

      .loading-state {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        padding: 2rem;
        color: var(--text-color-secondary);

        i {
          color: var(--primary-color);
        }
      }

      .empty-items {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 2rem;
        text-align: center;

        .empty-icon {
          font-size: 3rem;
        }
        p {
          color: var(--text-color-secondary);
          margin: 0;
          font-size: 0.9rem;
        }
      }

      .detail-content {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      .detail-image {
        width: 100%;
        height: 200px;
        border-radius: 10px;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .detail-badges {
        .category-badge {
          display: inline-block;
          padding: 0.4rem 1rem;
          background: var(--primary-color);
          color: white;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
        }
      }

      .detail-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 0.75rem;

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.75rem;
          background: var(--surface-ground);
          border-radius: 8px;

          i {
            font-size: 1rem;
            color: var(--primary-color);
          }

          div {
            display: flex;
            flex-direction: column;
            gap: 0.15rem;

            label {
              font-size: 0.7rem;
              color: var(--text-color-secondary);
            }

            span {
              font-size: 0.9rem;
              font-weight: 500;
            }
          }
        }
      }

      .detail-description {
        h4 {
          margin: 0 0 0.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-color-secondary);
        }

        p {
          margin: 0;
          line-height: 1.5;
          color: #1e293b;
        }
      }

      .detail-meta {
        padding-top: 0.75rem;
        border-top: 1px solid var(--surface-border);

        span {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.85rem;
          color: var(--text-color-secondary);

          i {
            font-size: 0.85rem;
          }
        }
      }

      @media (max-width: 600px) {
        .profile-details {
          grid-template-columns: 1fr;
        }

        .item-card {
          flex-direction: column;
          align-items: flex-start;

          .item-actions {
            width: 100%;
            justify-content: flex-end;
          }
        }

        .detail-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class ProfileDialogComponent implements OnInit {
  authService = inject(AuthService);
  private itemsService = inject(ItemsService);
  private messageService = inject(MessageService);

  confirmDeleteDialog = viewChild.required<ConfirmDialogComponent>('confirmDeleteDialog');
  editProfileDialog = viewChild.required<EditProfileDialogComponent>('editProfileDialog');
  changePasswordDialog = viewChild.required<ChangePasswordDialogComponent>('changePasswordDialog');
  editItemDialog = viewChild.required<EditItemDialogComponent>('editItemDialog');

  visible = false;
  detailDialogVisible = false;
  myItems = signal<Item[]>([]);
  loading = signal(true);
  selectedItem = signal<Item | null>(null);
  itemToDelete = signal<Item | null>(null);
  deletingId = signal<number | null>(null);

  onClose = output<void>();

  private categoryEmojis: Record<string, string> = {
    'Frutas/Vegetales': '🥬',
    Panadería: '🥖',
    Lácteos: '🧀',
    Enlatados: '🥫',
    Higiene: '🧴',
    Otros: '📦',
  };

  ngOnInit(): void {
    this.loadMyItems();
  }

  show(): void {
    this.visible = true;
  }

  hide(): void {
    this.visible = false;
  }

  async loadMyItems(): Promise<void> {
    this.loading.set(true);
    try {
      const items = await this.itemsService.getMine();
      this.myItems.set(items);
    } catch (err) {
      console.error('Error loading items:', err);
    } finally {
      this.loading.set(false);
    }
  }

  getCategoryEmoji(category: string): string {
    return this.categoryEmojis[category] || '📦';
  }

  getImageUrl(item: Item): string | null {
    return getImageUrl(item.image_url);
  }

  hasImage(item: Item): boolean {
    return !!this.getImageUrl(item);
  }

  openDetailDialog(item: Item): void {
    this.selectedItem.set(item);
    this.detailDialogVisible = true;
  }

  openDeleteDialog(item: Item): void {
    this.itemToDelete.set(item);
    this.confirmDeleteDialog().show({
      title: 'Eliminar Artículo',
      message: `¿Estás seguro de que quieres eliminar "${item.title}"? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      icon: 'pi pi-trash',
      isDanger: true,
    });
  }

  async confirmDelete(): Promise<void> {
    const item = this.itemToDelete();
    if (!item) return;

    this.deletingId.set(item.id);
    try {
      await this.itemsService.delete(item.id);
      this.messageService.add({
        severity: 'success',
        summary: 'Eliminado',
        detail: 'El artículo ha sido eliminado correctamente',
      });
      this.loadMyItems();
    } catch (err) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo eliminar el artículo',
      });
    } finally {
      this.deletingId.set(null);
      this.itemToDelete.set(null);
    }
  }

  logout(): void {
    this.authService.logout();
    this.hide();
  }

  closeAndGoToMap(): void {
    this.hide();
  }

  openEditProfileDialog(): void {
    this.editProfileDialog().show();
  }

  openChangePasswordDialog(): void {
    this.changePasswordDialog().show();
  }

  openEditItemDialog(item: Item): void {
    this.editItemDialog().show(item);
  }

  onProfileSaved(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Perfil actualizado',
      detail: 'Tus datos han sido actualizados',
    });
  }

  onPasswordChanged(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Contraseña cambiada',
      detail: 'Tu contraseña ha sido actualizada',
    });
  }

  onItemSaved(): void {
    this.loadMyItems();
  }
}
