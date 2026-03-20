import { Component, inject, signal, OnInit, ChangeDetectorRef } from '@angular/core';
import { ItemsService } from '../../../core/services';
import { Item } from '../../../core/models';
import {
  HeaderComponent,
  ItemCardComponent,
  ItemDetailDialogComponent,
  ConfirmDialogComponent,
} from '../../../shared/components';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-items-list',
  standalone: true,
  imports: [
    HeaderComponent,
    ItemCardComponent,
    ItemDetailDialogComponent,
    ConfirmDialogComponent,
    CardModule,
    ButtonModule,
    TabsModule,
    TooltipModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './items-list.component.html',
  styleUrl: './items-list.component.scss',
})
export class ItemsListComponent implements OnInit {
  private itemsService = inject(ItemsService);
  private messageService = inject(MessageService);
  public cdr = inject(ChangeDetectorRef);

  detailDialog: ItemDetailDialogComponent | null = null;
  confirmDialog: ConfirmDialogComponent | null = null;

  allItems = signal<Item[]>([]);
  myItems = signal<Item[]>([]);
  loading = signal(true);
  activeTab = signal(0);
  deletingId = signal<number | null>(null);
  itemToDelete = signal<Item | null>(null);
  selectedItem = signal<Item | null>(null);

  ngOnInit(): void {
    this.loadItems();
  }

  setDetailDialog(dialog: ItemDetailDialogComponent): void {
    this.detailDialog = dialog;
  }

  setConfirmDialog(dialog: ConfirmDialogComponent): void {
    this.confirmDialog = dialog;
  }

  async loadItems(): Promise<void> {
    this.loading.set(true);
    try {
      const [all, mine] = await Promise.all([
        this.itemsService.getAll(),
        this.itemsService.getMine(),
      ]);
      this.allItems.set(all);
      this.myItems.set(mine);
    } catch (err) {
      console.error('Error loading items:', err);
    } finally {
      this.loading.set(false);
      this.cdr.detectChanges();
    }
  }

  onViewDetails(item: Item): void {
    this.selectedItem.set(item);
    if (this.detailDialog) {
      this.detailDialog.show(item, false);
    }
  }

  onDeleteItem(item: Item): void {
    this.itemToDelete.set(item);
    if (this.confirmDialog) {
      this.confirmDialog.show({
        title: 'Eliminar Artículo',
        message: `¿Estás seguro de que quieres eliminar "${item.title}"? Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        icon: 'pi pi-trash',
        isDanger: true,
      });
    }
  }

  async onConfirmDelete(): Promise<void> {
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
      this.loadItems();
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

  goToMap(): void {
    if (this.detailDialog) {
      this.detailDialog.close();
    }
  }
}
