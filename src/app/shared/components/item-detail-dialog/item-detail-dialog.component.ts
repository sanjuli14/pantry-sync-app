import { Component, signal, output, AfterViewInit } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DatePipe } from '@angular/common';
import { Item } from '../../../core/models';
import { getImageUrl } from '../../../core/utils/image.utils';

@Component({
  selector: 'app-item-detail-dialog',
  standalone: true,
  imports: [DialogModule, ButtonModule, DatePipe],
  template: `
    <p-dialog
      header="Detalles del Artículo"
      [(visible)]="visible"
      [modal]="true"
      [closable]="true"
      [style]="{ width: '550px', maxHeight: '90vh' }"
      [draggable]="false"
      [resizable]="false"
      (onHide)="onClose.emit()"
    >
      @if (item()) {
        <div class="detail-content">
          @if (hasImage()) {
            <div class="item-image">
              <img [src]="getImageUrl()" [alt]="item()!.title" />
            </div>
          }

          <div class="item-header">
            <h2>{{ item()!.title }}</h2>
            <span class="category-badge">{{ item()!.category }}</span>
          </div>

          <div class="detail-grid">
            <div class="detail-item">
              <i class="pi pi-map-marker"></i>
              <div>
                <label>Zona</label>
                <span>{{ item()!.zone }}</span>
              </div>
            </div>

            <div class="detail-item">
              <i class="pi pi-clock"></i>
              <div>
                <label>Expira</label>
                <span>{{ item()!.expires_at | date: 'mediumDate' }}</span>
              </div>
            </div>

            @if (item()!.contact) {
              <div class="detail-item">
                <i class="pi pi-phone"></i>
                <div>
                  <label>Contacto</label>
                  <span>{{ item()!.contact }}</span>
                </div>
              </div>
              <div class="detail-item whatsapp-item">
                <a
                  [href]="getWhatsAppLink()"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="whatsapp-button"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                    />
                  </svg>
                  <span>Contactar por WhatsApp</span>
                </a>
              </div>
            }
          </div>

          <div class="description-section">
            <h3>Descripción</h3>
            <p>{{ item()!.description }}</p>
          </div>

          <div class="meta-info">
            <span>
              <i class="pi pi-calendar"></i>
              Publicado {{ item()!.created_at | date: 'medium' }}
            </span>
          </div>
        </div>
      }

      <ng-template pTemplate="footer">
        <p-button label="Cerrar" [text]="true" (onClick)="close()" />
        @if (showActions()) {
          <p-button
            label="Eliminar"
            severity="danger"
            icon="pi pi-trash"
            (onClick)="onDelete.emit(item()!)"
          />
        }
      </ng-template>
    </p-dialog>
  `,
  styles: [
    `
      .detail-content {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .item-image {
        width: 100%;
        height: 250px;
        border-radius: 12px;
        overflow: hidden;
        margin: -1rem -1rem 0 -1rem;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .item-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;

        h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
        }

        .category-badge {
          padding: 0.5rem 1rem;
          background: var(--primary-color);
          color: white;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
        }
      }

      .detail-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1rem;

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 10px;

          i {
            font-size: 1.25rem;
            color: var(--primary-color);
          }

          div {
            display: flex;
            flex-direction: column;
            gap: 0.2rem;

            label {
              font-size: 0.75rem;
              color: #64748b;
            }

            span {
              font-weight: 500;
            }
          }
        }
      }

      .description-section {
        h3 {
          margin: 0 0 0.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: #475569;
        }

        p {
          margin: 0;
          line-height: 1.6;
          color: #1e293b;
        }
      }

      .meta-info {
        padding-top: 1rem;
        border-top: 1px solid #e2e8f0;

        span {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: #64748b;

          i {
            font-size: 0.85rem;
          }
        }
      }

      @media (max-width: 500px) {
        .item-header {
          flex-direction: column;
          align-items: flex-start;
        }

        .detail-grid {
          grid-template-columns: 1fr;
        }
      }

      .whatsapp-item {
        background: transparent;
        padding: 0;

        .whatsapp-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: #25d366;
          color: white;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.95rem;
          transition:
            background-color 0.2s,
            transform 0.1s;

          &:hover {
            background: #1ebe57;
            transform: translateY(-1px);
          }

          &:active {
            transform: translateY(0);
          }

          svg {
            flex-shrink: 0;
          }
        }
      }
    `,
  ],
})
export class ItemDetailDialogComponent {
  visible = false;
  item = signal<Item | null>(null);
  showActions = signal(true);

  onClose = output<void>();
  onDelete = output<Item>();
  ready = output<ItemDetailDialogComponent>();

  ngAfterViewInit(): void {
    this.ready.emit(this);
  }

  show(selectedItem: Item, showDelete = true): void {
    this.item.set(selectedItem);
    this.showActions.set(showDelete);
    this.visible = true;
  }

  close(): void {
    this.visible = false;
    this.onClose.emit();
  }

  getImageUrl(): string | null {
    const i = this.item();
    if (!i) return null;
    return getImageUrl(i.image_url);
  }

  hasImage(): boolean {
    return !!this.getImageUrl();
  }

  getWhatsAppLink(): string {
    const contact = this.item()?.contact?.replace(/\D/g, '') || '';
    const message = encodeURIComponent(`Hola! Me interesa el artículo: ${this.item()?.title}`);
    return `https://wa.me/${contact}?text=${message}`;
  }
}
