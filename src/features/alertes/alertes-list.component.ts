import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from 'core/services/data.service';
import { Alert, AlertLevel, ALERT_LEVEL_META } from 'core/models/alert.model';

@Component({
  selector: 'app-alertes-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Filtres par niveau -->
    <div class="alertes__toolbar">
      <div class="alertes__filters">
        <button class="alertes__filter" [ngClass]="{ 'alertes__filter--active': activeFilter === null }" (click)="setFilter(null)">Toutes</button>
        <button class="alertes__filter" [ngClass]="{ 'alertes__filter--active': activeFilter === AlertLevel.HIGH }" (click)="setFilter(AlertLevel.HIGH)">Haute priorité</button>
        <button class="alertes__filter" [ngClass]="{ 'alertes__filter--active': activeFilter === AlertLevel.MEDIUM }" (click)="setFilter(AlertLevel.MEDIUM)">Moyenne</button>
        <button class="alertes__filter" [ngClass]="{ 'alertes__filter--active': activeFilter === AlertLevel.LOW }" (click)="setFilter(AlertLevel.LOW)">Faible</button>
      </div>
      <span class="alertes__count">{{ filteredAlerts.length }} alerte(s)</span>
    </div>

    <!-- Liste d'alertes -->
    <div class="alertes__list">
      <div
        *ngFor="let alert of filteredAlerts"
        class="alertes__item"
        [ngClass]="'alertes__item--' + alert.level"
      >
        <div class="alertes__icon" [ngClass]="'alertes__icon--' + alert.level" aria-hidden="true">
          <span class="material-icons-round" *ngIf="alert.level === AlertLevel.HIGH">warning</span>
          <span class="material-icons-round" *ngIf="alert.level === AlertLevel.MEDIUM">schedule</span>
          <span class="material-icons-round" *ngIf="alert.level === AlertLevel.LOW">info</span>
        </div>

        <!-- Contenu -->
        <div class="alertes__content">
          <div class="alertes__title">{{ alert.title }}</div>
          <div class="alertes__desc">{{ alert.description }}</div>
          <!-- Lien vers le lot si associé -->
          <a *ngIf="alert.lotId" [routerLink]="['/lots', getLotIdForRoute(alert.lotId)]" class="alertes__lot-link">
            <span class="material-icons-round">inventory_2</span> Voir le lot {{ alert.lotId }}
          </a>
        </div>

        <!-- Droite : priorité + temps -->
        <div class="alertes__meta">
          <span class="alertes__priority" [ngClass]="'alertes__priority--' + alert.level">
            {{ getLevelLabel(alert.level) }}
          </span>
          <span class="alertes__time">{{ alert.createdAt }}</span>
          <span class="alertes__read-dot" *ngIf="!alert.read"></span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* Toolbar */
    .alertes__toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .alertes__filters { display: flex; gap: 8px; }
    .alertes__filter {
      padding: 8px 14px;
      border-radius: 10px;
      border: 1px solid var(--earth-200);
      background: white;
      font-size: 0.78rem;
      font-family: inherit;
      color: var(--earth-600);
      cursor: pointer;
      box-shadow: var(--shadow);
      transition: all 0.2s ease;
    }
    .alertes__filter:hover { border-color: var(--gold-300); color: var(--gold-600); }
    .alertes__filter--active {
      border-color: var(--gold-300);
      background: rgba(212, 168, 67, 0.08);
      color: var(--gold-600);
    }
    .alertes__count { font-size: 0.76rem; color: var(--earth-400); font-style: italic; }

    /* Alert list */
    .alertes__list { display: flex; flex-direction: column; gap: 10px; }

    /* Alert item */
    .alertes__item {
      background: white;
      border-radius: var(--radius);
      border: 1px solid var(--earth-100);
      box-shadow: var(--shadow);
      padding: 18px 20px;
      display: flex;
      align-items: flex-start;
      gap: 14px;
      transition: transform 0.2s;
    }
    .alertes__item:hover { transform: translateX(4px); }
    .alertes__item--high   { border-left: 3px solid var(--red-500); }
    .alertes__item--medium { border-left: 3px solid var(--amber-500); }
    .alertes__item--low    { border-left: 3px solid var(--blue-500); }

    /* Icon */
    .alertes__icon {
      width: 44px; height: 44px;
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .alertes__icon .material-icons-round { font-size: 24px; }
    .alertes__icon--high   { background: var(--red-100);   color: var(--red-500); }
    .alertes__icon--medium { background: var(--amber-100); color: var(--amber-500); }
    .alertes__icon--low    { background: var(--blue-100);  color: var(--blue-500); }

    /* Content */
    .alertes__content { flex: 1; min-width: 0; }
    .alertes__title { font-size: 0.83rem; font-weight: 600; color: var(--earth-800); margin-bottom: 4px; }
    .alertes__desc { font-size: 0.75rem; color: var(--earth-500); line-height: 1.5; }
    .alertes__lot-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8rem;
      color: var(--primary-600);
      margin-top: 8px;
      text-decoration: none;
      font-weight: 500;
      transition: color var(--transition);
    }
    .alertes__lot-link:hover { color: var(--primary-700); }
    .alertes__lot-link .material-icons-round { font-size: 18px; }

    /* Meta (droite) */
    .alertes__meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;
      flex-shrink: 0;
      position: relative;
    }
    .alertes__priority {
      font-size: 0.68rem;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 4px;
    }
    .alertes__priority--high   { background: var(--red-100);   color: var(--red-500); }
    .alertes__priority--medium { background: var(--amber-100); color: var(--amber-500); }
    .alertes__priority--low    { background: var(--blue-100);  color: var(--blue-500); }
    .alertes__time { font-size: 0.68rem; color: var(--earth-400); }

    /* Non-read indicator */
    .alertes__read-dot {
      width: 7px; height: 7px;
      border-radius: 50%;
      background: var(--red-500);
    }
  `]
})
export class AlertesListComponent implements OnInit {
  AlertLevel = AlertLevel;

  allAlerts: Alert[] = [];
  filteredAlerts: Alert[] = [];
  activeFilter: AlertLevel | null = null;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getAlerts().subscribe(alerts => {
      this.allAlerts = alerts;
      this.applyFilter();
    });
  }

  setFilter(level: AlertLevel | null): void {
    this.activeFilter = level;
    this.applyFilter();
  }

  private applyFilter(): void {
    this.filteredAlerts = this.activeFilter
      ? this.allAlerts.filter(a => a.level === this.activeFilter)
      : [...this.allAlerts];
  }

  getLevelLabel(level: AlertLevel): string {
    return ALERT_LEVEL_META[level].label;
  }

  /** ID sans # pour l’URL (ex. #LOT-2026-0843 → LOT-2026-0843). */
  getLotIdForRoute(lotId: string | undefined): string {
    return (lotId || '').replace(/^#/, '');
  }
}
