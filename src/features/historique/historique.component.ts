import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from 'core/services/auth.service';
import { DataService } from 'core/services/data.service';
import { User, Role } from 'core/models/user.model';
import { Lot } from 'core/models/lot.model';
import { Transaction } from 'core/models/transaction.model';
import { BadgeComponent } from 'shared/components/badge/badge.component';

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [CommonModule, RouterLink, BadgeComponent],
  template: `
    <div class="historique">
      <h1 class="historique__title">Mon historique d'activité</h1>
      <p class="historique__intro">{{ introText }}</p>

      <!-- Mineur : tous ses lots -->
      <ng-container *ngIf="currentUser && isMineur">
        <div class="historique__card">
          <h2 class="historique__card-title">
            <span class="material-icons-round">inventory_2</span>
            Historique de mes lots
          </h2>
          <div class="historique__table-wrap">
            <table class="historique__table">
              <thead>
                <tr>
                  <th>Lot</th>
                  <th>Région</th>
                  <th>Poids</th>
                  <th>Statut</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let lot of myLots">
                  <td><a [routerLink]="['/lots', getLotRouteId(lot.id)]" class="historique__link">{{ lot.id }}</a></td>
                  <td>{{ lot.region }}</td>
                  <td>{{ lot.poids }} kg</td>
                  <td><app-badge [type]="lot.status"></app-badge></td>
                  <td>{{ lot.date }}</td>
                  <td><a [routerLink]="['/lots', getLotRouteId(lot.id)]" class="historique__btn">Voir</a></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p *ngIf="myLots.length === 0" class="historique__empty">Aucun lot pour le moment.</p>
        </div>
      </ng-container>

      <!-- Commerçant : lots certifiés disponibles + historique d'achats -->
      <ng-container *ngIf="currentUser && isCommercant">
        <div class="historique__card">
          <h2 class="historique__card-title">
            <span class="material-icons-round">verified</span>
            Lots certifiés disponibles
          </h2>
          <div class="historique__table-wrap">
            <table class="historique__table">
              <thead>
                <tr>
                  <th>Lot</th>
                  <th>Région</th>
                  <th>Orpailleur</th>
                  <th>Poids</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let lot of certifiedLots">
                  <td><a [routerLink]="['/lots', getLotRouteId(lot.id)]" class="historique__link">{{ lot.id }}</a></td>
                  <td>{{ lot.region }}</td>
                  <td>{{ lot.orpailleurName }}</td>
                  <td>{{ lot.poids }} kg</td>
                  <td><app-badge [type]="lot.status"></app-badge></td>
                  <td><a [routerLink]="['/lots', getLotRouteId(lot.id)]" class="historique__btn">Voir</a></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p *ngIf="certifiedLots.length === 0" class="historique__empty">Aucun lot certifié disponible.</p>
        </div>

        <div class="historique__card">
          <h2 class="historique__card-title">
            <span class="material-icons-round">shopping_cart</span>
            Historique de mes achats
          </h2>
          <div class="historique__table-wrap">
            <table class="historique__table">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Lot</th>
                  <th>Vendeur (orpailleur)</th>
                  <th>Date</th>
                  <th>Montant</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let tx of myTransactions">
                  <td>{{ tx.id }}</td>
                  <td><a [routerLink]="['/lots', getLotRouteId(tx.lotId)]" class="historique__link">{{ tx.lotId }}</a></td>
                  <td>{{ tx.vendeurName }}</td>
                  <td>{{ tx.date }}</td>
                  <td *ngIf="tx.montant as m">{{ m | number:'1.0-0' }} FCFA</td>
                  <td *ngIf="!tx.montant">—</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p *ngIf="myTransactions.length === 0" class="historique__empty">Aucun achat enregistré pour le moment.</p>
        </div>
      </ng-container>

      <!-- Transporteur : livraisons (lots où il est assigné) -->
      <ng-container *ngIf="currentUser && isTransporteur">
        <div class="historique__card">
          <h2 class="historique__card-title">
            <span class="material-icons-round">local_shipping</span>
            Historique de mes livraisons
          </h2>
          <div class="historique__table-wrap">
            <table class="historique__table">
              <thead>
                <tr>
                  <th>Lot</th>
                  <th>Région</th>
                  <th>Orpailleur</th>
                  <th>Poids</th>
                  <th>Statut</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let lot of myTransports">
                  <td><a [routerLink]="['/lots', getLotRouteId(lot.id)]" class="historique__link">{{ lot.id }}</a></td>
                  <td>{{ lot.region }}</td>
                  <td>{{ lot.orpailleurName }}</td>
                  <td>{{ lot.poids }} kg</td>
                  <td><app-badge [type]="lot.status"></app-badge></td>
                  <td>{{ lot.date }}</td>
                  <td><a [routerLink]="['/lots', getLotRouteId(lot.id)]" class="historique__btn">Voir</a></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p *ngIf="myTransports.length === 0" class="historique__empty">Aucune livraison pour le moment.</p>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .historique { max-width: 960px; margin: 0 auto; }
    .historique__title { font-size: 1.5rem; color: var(--earth-800); margin: 0 0 var(--space-sm); }
    .historique__intro { color: var(--earth-500); margin: 0 0 var(--space-xl); }
    .historique__card {
      background: var(--earth-0);
      border-radius: var(--radius-lg);
      padding: var(--space-xl);
      box-shadow: var(--shadow);
      border: 1px solid var(--earth-100);
    }
    .historique__card-title {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      font-size: 1.1rem;
      color: var(--earth-800);
      margin: 0 0 var(--space-lg);
    }
    .historique__card-title .material-icons-round { color: var(--primary-500); }
    .historique__table-wrap { overflow-x: auto; }
    .historique__table { width: 100%; border-collapse: collapse; }
    .historique__table th {
      text-align: left;
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--earth-500);
      padding: var(--space-sm) var(--space-md);
      border-bottom: 1px solid var(--earth-200);
      background: var(--earth-50);
    }
    .historique__table td {
      padding: var(--space-sm) var(--space-md);
      font-size: 0.875rem;
      color: var(--earth-700);
      border-bottom: 1px solid var(--earth-50);
    }
    .historique__link { font-weight: 600; color: var(--primary-600); text-decoration: none; }
    .historique__link:hover { text-decoration: underline; }
    .historique__btn {
      display: inline-block;
      padding: var(--space-xs) var(--space-sm);
      background: var(--primary-50);
      color: var(--primary-600);
      border-radius: var(--radius);
      font-size: 0.8rem;
      font-weight: 600;
      text-decoration: none;
    }
    .historique__btn:hover { background: var(--primary-100); }
    .historique__empty { color: var(--earth-500); font-style: italic; margin: 0; }
  `]
})
export class HistoriqueComponent implements OnInit {
  currentUser: User | null = null;
  myLots: Lot[] = [];
  certifiedLots: Lot[] = [];
  myTransports: Lot[] = [];
  myTransactions: Transaction[] = [];
  introText = '';

  get isMineur(): boolean { return this.currentUser?.role === Role.MINEUR; }
  get isCommercant(): boolean { return this.currentUser?.role === Role.COMMERÇANT; }
  get isTransporteur(): boolean { return this.currentUser?.role === Role.TRANSPORTEUR; }

  constructor(
    private authService: AuthService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
      if (!user) return;
      if (user.role === Role.MINEUR) {
        this.introText = 'Consultez l\'historique de tous vos lots déclarés et leur statut.';
        this.dataService.getLots().subscribe(lots => this.myLots = lots);
      } else if (user.role === Role.COMMERÇANT) {
        this.introText = 'Lots certifiés disponibles à l\'achat et historique de vos achats.';
        this.dataService.getLots().subscribe(lots => this.certifiedLots = lots);
        this.dataService.getTransactions().subscribe(txs => this.myTransactions = txs);
      } else if (user.role === Role.TRANSPORTEUR) {
        this.introText = 'Historique des livraisons qui vous sont assignées.';
        this.dataService.getLots().subscribe(lots => this.myTransports = lots);
      }
    });
  }

  getLotRouteId(id: string): string {
    return (id || '').replace(/^#/, '');
  }
}
