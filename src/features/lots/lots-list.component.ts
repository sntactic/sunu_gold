import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DataService } from 'core/services/data.service';
import { Lot, LotStatus, LOT_STATUS_META } from 'core/models/lot.model';
import { AuthService } from 'core/services/auth.service';
import { Role } from 'core/models/user.model';
import { BadgeComponent } from 'shared/components/badge/badge.component';
import { QrIconComponent } from 'shared/components/qr-icon/qr-icon.component';
import { ProgressBarComponent } from 'shared/components/progress-bar/progress-bar.component';

@Component({
  selector: 'app-lots-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BadgeComponent, QrIconComponent, ProgressBarComponent],
  template: `
    <div class="lots">
      <!-- Messages de succès/erreur -->
      <div *ngIf="showSuccessMessage" class="lots__notification lots__notification--success">
        <span class="material-icons-round">check_circle</span>
        <span>{{ purchaseMessage }}</span>
      </div>

      <div *ngIf="showErrorMessage" class="lots__notification lots__notification--error">
        <span class="material-icons-round">error</span>
        <span>{{ purchaseMessage }}</span>
      </div>

      <!-- Boîte de dialogue d'achat -->
      <div *ngIf="showPurchaseDialog" class="lots__dialog-overlay" (click)="cancelPurchase()">
        <div class="lots__dialog" (click)="$event.stopPropagation()">
          <div class="lots__dialog-header">
            <h3>Confirmer l'achat</h3>
            <button type="button" class="lots__dialog-close" (click)="cancelPurchase()">
              <span class="material-icons-round">close</span>
            </button>
          </div>
          <div class="lots__dialog-body">
            <div class="lots__dialog-info">
              <p><strong>Lot :</strong> {{ selectedLot?.id }}</p>
              <p><strong>Région :</strong> {{ selectedLot?.region }}</p>
              <p><strong>Orpailleur :</strong> {{ selectedLot?.orpailleurName }}</p>
              <p><strong>Poids :</strong> {{ selectedLot?.poids }} kg</p>
            </div>
            <div class="lots__dialog-amount">
              <label for="purchase-amount">Montant de l'achat (FCFA) :</label>
              <input
                id="purchase-amount"
                type="number"
                [(ngModel)]="purchaseAmount"
                [disabled]="isProcessingPurchase"
                min="1"
                step="1000"
              />
            </div>
            <p class="lots__dialog-warning">
              <span class="material-icons-round">info</span>
              Cette action créera une transaction d'achat et sera enregistrée dans votre historique.
            </p>
          </div>
          <div class="lots__dialog-footer">
            <button
              type="button"
              class="lots__dialog-btn lots__dialog-btn--cancel"
              (click)="cancelPurchase()"
              [disabled]="isProcessingPurchase"
            >Annuler</button>
            <button
              type="button"
              class="lots__dialog-btn lots__dialog-btn--confirm"
              (click)="confirmPurchase()"
              [disabled]="isProcessingPurchase || purchaseAmount <= 0"
            >
              <span *ngIf="!isProcessingPurchase">Confirmer l'achat</span>
              <span *ngIf="isProcessingPurchase" class="lots__dialog-loading">
                <span class="lots__spinner"></span>
                Traitement en cours...
              </span>
            </button>
          </div>
        </div>
      </div>

      <div class="lots__toolbar">
        <div class="lots__search">
          <span class="material-icons-round">search</span>
          <input
            type="search"
            placeholder="Rechercher un lot, une région..."
            [(ngModel)]="searchTerm"
            (ngModelChange)="applyFilters()"
            aria-label="Rechercher"
          />
        </div>
        <div class="lots__filters" role="group" aria-label="Filtrer par statut">
          <button
            type="button"
            class="lots__filter"
            [class.lots__filter--active]="activeFilter === null"
            (click)="setFilter(null)"
          >Tous</button>
          <button
            *ngFor="let status of statuses"
            type="button"
            class="lots__filter"
            [class.lots__filter--active]="activeFilter === status"
            (click)="setFilter(status)"
          >{{ getStatusLabel(status) }}</button>
          <a routerLink="/verifier" class="lots__link-verif" target="_blank" rel="noopener">
            <span class="material-icons-round">verified_user</span>
            Vérifier un lot (public)
          </a>
        </div>
      </div>

      <div class="lots__card">
        <div class="lots__table-wrap">
          <table class="lots__table">
            <thead>
              <tr>
                <th>Lot ID</th>
                <th>QR</th>
                <th>Région</th>
                <th>Orpailleur</th>
                <th>Poids (kg)</th>
                <th>Progression</th>
                <th>Statut</th>
                <th>Date</th>
                <th *ngIf="isCommercant">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let lot of filteredLots" class="lots__row-clickable">
                <td>
                  <a [routerLink]="['/lots', getLotRouteId(lot.id)]" class="lots__lot-id lots__lot-link">{{ lot.id }}</a>
                </td>
                <td>
                  <span (click)="$event.stopPropagation()">
                    <app-qr-icon [lotId]="lot.id"></app-qr-icon>
                  </span>
                </td>
                <td>{{ lot.region }}</td>
                <td>{{ lot.orpailleurName }}</td>
                <td class="lots__poids">{{ lot.poids }}</td>
                <td><app-progress-bar [value]="lot.progression"></app-progress-bar></td>
                <td><app-badge [type]="lot.status"></app-badge></td>
                <td class="lots__date">{{ lot.date }}</td>
                <td *ngIf="isCommercant">
                  <button
                    *ngIf="lot.status === 'certified'"
                    type="button"
                    class="lots__buy-btn"
                    [class.lots__buy-btn--loading]="purchasingLotId === lot.id"
                    [disabled]="isProcessingPurchase"
                    (click)="acheter(lot, $event)"
                  >
                    <span *ngIf="purchasingLotId !== lot.id" class="material-icons-round">shopping_cart</span>
                    <span *ngIf="purchasingLotId === lot.id" class="lots__spinner lots__spinner--small"></span>
                    <span>{{ purchasingLotId === lot.id ? 'Traitement...' : 'Acheter' }}</span>
                  </button>
                  <span *ngIf="lot.status === 'vendu'" class="lots__sold-label">
                    <span class="material-icons-round">check_circle</span>
                    Acheté
                  </span>
                </td>
              </tr>
              <tr *ngIf="filteredLots.length === 0">
                <td colspan="8" class="lots__empty">
                  <span class="material-icons-round">inbox</span>
                  Aucun lot ne correspond à vos critères.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .lots__toolbar {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      margin-bottom: var(--space-lg);
      flex-wrap: wrap;
    }

    .lots__search {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      background: var(--earth-0);
      border: 1px solid var(--earth-200);
      border-radius: var(--radius);
      padding: var(--space-sm) var(--space-md);
      box-shadow: var(--shadow-sm);
      flex: 1;
      min-width: 220px;
      max-width: 360px;
      transition: border-color var(--transition), box-shadow var(--transition);
    }

    .lots__search:focus-within {
      border-color: var(--primary-400);
      box-shadow: 0 0 0 3px rgba(212, 168, 67, 0.15);
    }

    .lots__search .material-icons-round {
      font-size: 22px;
      color: var(--earth-500);
      flex-shrink: 0;
    }

    .lots__search input {
      border: none;
      outline: none;
      font-size: 0.9rem;
      font-family: inherit;
      color: var(--earth-800);
      background: transparent;
      flex: 1;
      min-width: 0;
    }

    .lots__search input::placeholder {
      color: var(--earth-400);
    }

    .lots__filters {
      display: flex;
      gap: var(--space-sm);
      flex-wrap: wrap;
    }

    .lots__filter {
      padding: var(--space-sm) var(--space-md);
      border-radius: var(--radius);
      border: 1px solid var(--earth-200);
      background: var(--earth-0);
      font-size: 0.85rem;
      font-family: inherit;
      font-weight: 500;
      color: var(--earth-600);
      cursor: pointer;
      transition: all var(--transition);
    }

    .lots__filter:hover {
      border-color: var(--primary-300);
      color: var(--primary-600);
      background: var(--primary-50);
    }

    .lots__filter--active {
      border-color: var(--primary-400);
      background: var(--primary-50);
      color: var(--primary-700);
    }

    .lots__card {
      background: var(--earth-0);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow);
      border: 1px solid var(--earth-100);
      overflow: hidden;
    }

    .lots__table-wrap {
      overflow-x: auto;
    }

    .lots__table {
      width: 100%;
      border-collapse: collapse;
    }

    .lots__table th {
      text-align: left;
      font-size: 0.7rem;
      color: var(--earth-500);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-weight: 600;
      padding: var(--space-md) var(--space-lg);
      border-bottom: 1px solid var(--earth-200);
      background: var(--earth-50);
      white-space: nowrap;
    }

    .lots__table td {
      padding: var(--space-md) var(--space-lg);
      font-size: 0.875rem;
      color: var(--earth-700);
      border-bottom: 1px solid var(--earth-50);
      vertical-align: middle;
      transition: background var(--transition);
    }

    .lots__table tbody tr:hover td {
      background: var(--primary-50);
    }

    .lots__table tbody tr:last-child td {
      border-bottom: none;
    }

    .lots__link-verif {
      display: inline-flex;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-sm) var(--space-md);
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--primary-600);
      text-decoration: none;
      border-radius: var(--radius);
      transition: background var(--transition), color var(--transition);
    }
    .lots__link-verif:hover { background: var(--primary-50); color: var(--primary-700); }
    .lots__link-verif .material-icons-round { font-size: 18px; }

    .lots__row-clickable { cursor: pointer; }
    .lots__lot-link {
      font-family: 'Playfair Display', serif;
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--primary-600);
      text-decoration: none;
      transition: color var(--transition);
    }
    .lots__lot-link:hover { color: var(--primary-700); text-decoration: underline; }
    .lots__lot-id {
      font-family: 'Playfair Display', serif;
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--earth-800);
    }

    .lots__poids {
      font-weight: 600;
      color: var(--earth-800);
    }

    .lots__date {
      font-size: 0.8rem;
      color: var(--earth-500);
    }

    .lots__buy-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: var(--radius);
      border: none;
      background: var(--green-100);
      color: var(--green-600);
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
    }
    .lots__buy-btn .material-icons-round { font-size: 16px; }
    .lots__buy-btn:hover:not(:disabled) { background: var(--green-200); }
    .lots__buy-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .lots__buy-btn--loading {
      background: var(--earth-200);
      color: var(--earth-600);
    }

    .lots__sold-label {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: var(--radius);
      background: #e9d5ff;
      color: #7c3aed;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .lots__sold-label .material-icons-round { font-size: 16px; }

    /* Notifications */
    .lots__notification {
      position: fixed;
      top: 80px;
      right: 20px;
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-md) var(--space-lg);
      border-radius: var(--radius);
      box-shadow: var(--shadow-lg);
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
      max-width: 400px;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .lots__notification--success {
      background: var(--green-50);
      color: var(--green-700);
      border: 1px solid var(--green-200);
    }

    .lots__notification--success .material-icons-round {
      color: var(--green-600);
    }

    .lots__notification--error {
      background: #fee;
      color: #c33;
      border: 1px solid #fcc;
    }

    .lots__notification--error .material-icons-round {
      color: #c33;
    }

    /* Boîte de dialogue */
    .lots__dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .lots__dialog {
      background: var(--earth-0);
      border-radius: var(--radius-lg);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      width: 90%;
      max-width: 500px;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .lots__dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-lg);
      border-bottom: 1px solid var(--earth-200);
    }

    .lots__dialog-header h3 {
      margin: 0;
      font-size: 1.25rem;
      color: var(--earth-800);
    }

    .lots__dialog-close {
      background: none;
      border: none;
      cursor: pointer;
      padding: var(--space-xs);
      color: var(--earth-500);
      transition: color var(--transition);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .lots__dialog-close:hover {
      color: var(--earth-800);
    }

    .lots__dialog-body {
      padding: var(--space-lg);
    }

    .lots__dialog-info {
      background: var(--earth-50);
      padding: var(--space-md);
      border-radius: var(--radius);
      margin-bottom: var(--space-lg);
    }

    .lots__dialog-info p {
      margin: var(--space-xs) 0;
      font-size: 0.875rem;
      color: var(--earth-700);
    }

    .lots__dialog-amount {
      margin-bottom: var(--space-lg);
    }

    .lots__dialog-amount label {
      display: block;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--earth-700);
      margin-bottom: var(--space-sm);
    }

    .lots__dialog-amount input {
      width: 100%;
      padding: var(--space-sm) var(--space-md);
      border: 1px solid var(--earth-200);
      border-radius: var(--radius);
      font-size: 1rem;
      font-family: inherit;
      color: var(--earth-800);
      transition: border-color var(--transition), box-shadow var(--transition);
    }

    .lots__dialog-amount input:focus {
      outline: none;
      border-color: var(--primary-400);
      box-shadow: 0 0 0 3px rgba(212, 168, 67, 0.15);
    }

    .lots__dialog-amount input:disabled {
      background: var(--earth-100);
      cursor: not-allowed;
    }

    .lots__dialog-warning {
      display: flex;
      align-items: flex-start;
      gap: var(--space-sm);
      padding: var(--space-md);
      background: var(--primary-50);
      border-radius: var(--radius);
      font-size: 0.8rem;
      color: var(--earth-600);
      margin: 0;
    }

    .lots__dialog-warning .material-icons-round {
      font-size: 18px;
      color: var(--primary-500);
      flex-shrink: 0;
    }

    .lots__dialog-footer {
      display: flex;
      gap: var(--space-md);
      padding: var(--space-lg);
      border-top: 1px solid var(--earth-200);
    }

    .lots__dialog-btn {
      flex: 1;
      padding: var(--space-sm) var(--space-lg);
      border-radius: var(--radius);
      font-size: 0.875rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: all var(--transition);
      border: none;
    }

    .lots__dialog-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .lots__dialog-btn--cancel {
      background: var(--earth-100);
      color: var(--earth-700);
    }

    .lots__dialog-btn--cancel:hover:not(:disabled) {
      background: var(--earth-200);
    }

    .lots__dialog-btn--confirm {
      background: var(--green-500);
      color: white;
    }

    .lots__dialog-btn--confirm:hover:not(:disabled) {
      background: var(--green-600);
    }

    .lots__dialog-loading {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      justify-content: center;
    }

    /* Spinner de chargement */
    .lots__spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    .lots__spinner--small {
      width: 14px;
      height: 14px;
      border-width: 2px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .lots__empty {
      text-align: center;
      color: var(--earth-500);
      padding: var(--space-2xl) !important;
      font-style: italic;
    }

    .lots__empty .material-icons-round {
      display: block;
      font-size: 48px;
      margin-bottom: var(--space-md);
      opacity: 0.5;
    }

    @media (max-width: 960px) {
      .lots__table th,
      .lots__table td {
        padding: var(--space-sm) var(--space-md);
      }
    }
  `]
})
export class LotsListComponent implements OnInit {
  allLots: Lot[] = [];
  filteredLots: Lot[] = [];
  searchTerm = '';
  activeFilter: LotStatus | null = null;
  statuses = [LotStatus.CERTIFIED, LotStatus.EN_TRANSIT, LotStatus.EN_ATTENTE, LotStatus.VENDU, LotStatus.ALERTE];

  // État pour le processus d'achat
  isProcessingPurchase = false;
  purchasingLotId: string | null = null;
  showPurchaseDialog = false;
  selectedLot: Lot | null = null;
  purchaseAmount = 0;
  purchaseMessage = '';
  showSuccessMessage = false;
  showErrorMessage = false;

  constructor(
    private dataService: DataService,
    private authService: AuthService
  ) {}

  get isCommercant(): boolean {
    const user = this.authService.getCurrentUser();
    return !!user && user.role === Role.COMMERÇANT;
  }

  ngOnInit(): void {
    this.dataService.getLots().subscribe(lots => {
      this.allLots = lots;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    let result = [...this.allLots];
    if (this.activeFilter) {
      result = result.filter(l => l.status === this.activeFilter);
    }
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(l =>
        l.id.toLowerCase().includes(term) ||
        l.region.toLowerCase().includes(term) ||
        l.orpailleurName.toLowerCase().includes(term)
      );
    }
    this.filteredLots = result;
  }

  setFilter(status: LotStatus | null): void {
    this.activeFilter = status;
    this.applyFilters();
  }

  getStatusLabel(status: LotStatus): string {
    return LOT_STATUS_META[status].label;
  }

  /** ID sans # pour la route /lots/:id */
  getLotRouteId(id: string): string {
    return (id || '').replace(/^#/, '');
  }

  /** Ouvre la boîte de dialogue d'achat */
  acheter(lot: Lot, event: Event): void {
    event.stopPropagation();
    if (!this.isCommercant || lot.status !== LotStatus.CERTIFIED || this.isProcessingPurchase) return;

    this.selectedLot = lot;
    // Prix estimé : 250 000 FCFA par kg
    this.purchaseAmount = Math.round(lot.poids * 250000);
    this.showPurchaseDialog = true;
    this.showSuccessMessage = false;
    this.showErrorMessage = false;
  }

  /** Confirme et effectue l'achat */
  confirmPurchase(): void {
    if (!this.selectedLot || this.isProcessingPurchase || this.purchaseAmount <= 0) return;

    this.isProcessingPurchase = true;
    this.purchasingLotId = this.selectedLot.id;

    // Simule un processus d'achat avec délai réseau
    this.dataService.acheterLot(this.selectedLot.id, this.purchaseAmount).subscribe({
      next: () => {
        // Succès
        this.purchaseMessage = `Achat réussi ! Vous avez acheté le lot ${this.selectedLot!.id} pour ${this.purchaseAmount.toLocaleString('fr-FR')} FCFA`;
        this.showSuccessMessage = true;
        this.showPurchaseDialog = false;

        // Rafraîchir la liste des lots après un court délai
        setTimeout(() => {
          this.dataService.getLots().subscribe(lots => {
            this.allLots = lots;
            this.applyFilters();
          });

          // Masquer le message après 5 secondes
          setTimeout(() => {
            this.showSuccessMessage = false;
          }, 5000);
        }, 500);

        this.isProcessingPurchase = false;
        this.purchasingLotId = null;
        this.selectedLot = null;
      },
      error: () => {
        // Erreur
        this.purchaseMessage = 'Erreur lors de l\'achat. Veuillez réessayer.';
        this.showErrorMessage = true;
        this.showPurchaseDialog = false;
        this.isProcessingPurchase = false;
        this.purchasingLotId = null;

        // Masquer le message après 5 secondes
        setTimeout(() => {
          this.showErrorMessage = false;
        }, 5000);
      }
    });
  }

  /** Annule l'achat */
  cancelPurchase(): void {
    this.showPurchaseDialog = false;
    this.selectedLot = null;
    this.purchaseAmount = 0;
  }
}
