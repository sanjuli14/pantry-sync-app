import { Component, input, output } from '@angular/core';
import { Item } from '../../../core/models';
import { getImageUrl } from '../../../core/utils/image.utils';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-item-card',
  standalone: true,
  imports: [CardModule, TagModule, ButtonModule],
  templateUrl: './item-card.component.html',
  styleUrl: './item-card.component.scss',
})
export class ItemCardComponent {
  item = input.required<Item>();
  showActions = input(true);
  isOwner = input(false);
  viewDetails = output<Item>();
  deleteItem = output<Item>();

  private categoryEmojis: Record<string, string> = {
    'Frutas/Vegetales': '🥬',
    Panadería: '🥖',
    Lácteos: '🧀',
    Enlatados: '🥫',
    Higiene: '🧴',
    Otros: '📦',
  };

  getCategoryEmoji(): string {
    return this.categoryEmojis[this.item().category] || '📦';
  }

  getImageUrl(): string | null {
    return getImageUrl(this.item().image_url);
  }

  hasImage(): boolean {
    return !!this.getImageUrl();
  }

  getUrgencyClass(): string {
    const expiresDate = new Date(this.item().expires_at);
    const now = new Date();
    const hoursLeft = Math.round((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60));

    if (hoursLeft < 12) return 'urgent';
    if (hoursLeft < 24) return 'warning';
    return 'normal';
  }

  getExpiresText(): string {
    const expiresDate = new Date(this.item().expires_at);
    const now = new Date();
    const hoursLeft = Math.round((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60));

    if (hoursLeft < 1) return 'Expira pronto!';
    if (hoursLeft < 24) return `${hoursLeft}h`;
    const days = Math.round(hoursLeft / 24);
    return `${days}d`;
  }
}
