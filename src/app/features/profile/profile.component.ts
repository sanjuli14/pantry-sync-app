import { Component, inject, signal, OnInit, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, ItemsService } from '../../core/services';
import { Item } from '../../core/models';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DatePipe } from '@angular/common';
import { ItemCardComponent, ItemDetailDialogComponent } from '../../shared/components';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [DialogModule, ButtonModule, DatePipe, ItemCardComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);
  private itemsService = inject(ItemsService);
  private router = inject(Router);

  openDetails = viewChild.required<ItemDetailDialogComponent>('detailsDialog');

  myItems = signal<Item[]>([]);
  loading = signal(true);
  visible = true;

  ngOnInit(): void {
    this.loadMyItems();
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

  onViewItem(item: Item): void {
    this.openDetails().show(item);
  }

  deleteItems(item: Item): void {
    this.itemsService.delete(item.id).then(() => {
      this.loadMyItems();
    });
  }

  goToMap(): void {
    this.router.navigate(['/']);
  }

  logout(): void {
    this.authService.logout();
  }
}
