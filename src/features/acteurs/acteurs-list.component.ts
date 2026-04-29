import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DataService } from 'core/services/data.service';
import { Acteur, KycStatus } from 'core/models/acteur.model';
import { Role, ROLE_META } from 'core/models/user.model';

@Component({
  selector: 'app-acteurs-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <!-- Recherche par identifiant ou nom -->
    <div class="acteurs__search-wrap">
      <span class="material-icons-round acteurs__search-icon">search</span>
      <input
        type="search"
        class="acteurs__search-input"
        placeholder="Rechercher par identifiant (ex. mineur-001) ou nom..."
        [(ngModel)]="searchTerm"
        (ngModelChange)="applyFilter()"
        aria-label="Rechercher un acteur"
      />
    </div>

    <!-- Filtres par rôle -->
    <div class="acteurs__filters">
      <button
        class="acteurs__filter"
        [ngClass]="{ 'acteurs__filter--active': activeRoleFilter === null }"
        (click)="setRoleFilter(null)"
      >
        <span class="acteurs__filter-count">{{ allActeurs.length }}</span>
        <span class="acteurs__filter-label">Tous</span>
      </button>
      <button
        *ngFor="let role of filterRoles"
        class="acteurs__filter"
        [ngClass]="{ 'acteurs__filter--active': activeRoleFilter === role }"
        (click)="setRoleFilter(role)"
      >
        <span class="acteurs__filter-count">{{ countForRole(role) }}</span>
        <span class="acteurs__filter-label">{{ ROLE_META[role].label }}</span>
      </button>
    </div>

    <!-- Table des acteurs -->
    <div class="acteurs__table-wrap">
      <table class="acteurs__table">
        <thead>
          <tr>
            <th>Acteur</th>
            <th>Rôle</th>
            <th>Région</th>
            <th>KYC</th>
            <th>Lots actifs</th>
            <th>Dernière activité</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let acteur of filteredActeurs" [routerLink]="['/acteurs', acteur.id]" class="acteurs__row-link">
            <td>
              <div class="acteurs__actor-row">
                <div class="acteurs__avatar">{{ getInitials(acteur.name) }}</div>
                <div>
                  <div class="acteurs__actor-name">{{ acteur.name }}</div>
                  <div class="acteurs__actor-sub">{{ acteur.subtitle }} · {{ acteur.id }}</div>
                </div>
              </div>
            </td>
            <td><span class="acteurs__role-badge" [ngClass]="'acteurs__role-badge--' + acteur.role">{{ ROLE_META[acteur.role].label }}</span></td>
            <td>{{ acteur.region }}</td>
            <td>
              <div class="acteurs__kyc">
                <div class="acteurs__kyc-dot" [ngClass]="acteur.kyc === KycStatus.VERIFIED ? 'acteurs__kyc-dot--ok' : 'acteurs__kyc-dot--pending'"></div>
                <span>{{ acteur.kyc === KycStatus.VERIFIED ? 'Vérifié' : 'En cours' }}</span>
              </div>
            </td>
            <td class="acteurs__lots-count">{{ acteur.activeLots }}</td>
            <td class="acteurs__last">{{ acteur.lastActivity }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* Filters */
    .acteurs__filters {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 22px;
    }
    .acteurs__filter {
      padding: 16px 14px;
      border-radius: 10px;
      border: 1px solid var(--earth-200);
      background: white;
      cursor: pointer;
      text-align: center;
      box-shadow: var(--shadow);
      transition: all 0.2s ease;
      font-family: inherit;
    }
    .acteurs__filter:hover { border-color: var(--gold-300); }
    .acteurs__filter--active {
      border-color: var(--gold-300);
      background: rgba(212, 168, 67, 0.06);
      box-shadow: 0 0 0 2px rgba(212, 168, 67, 0.12), var(--shadow);
    }
    .acteurs__filter-count {
      display: block;
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--earth-800);
    }
    .acteurs__filter--active .acteurs__filter-count { color: var(--gold-600); }
    .acteurs__filter-label {
      display: block;
      font-size: 0.72rem;
      color: var(--earth-500);
      margin-top: 2px;
    }

    /* Table */
    .acteurs__table-wrap {
      background: white;
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      border: 1px solid var(--earth-100);
      overflow: hidden;
    }
    .acteurs__table { width: 100%; border-collapse: collapse; }
    .acteurs__table th {
      text-align: left;
      font-size: 0.7rem;
      color: var(--earth-500);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
      padding: 12px 18px;
      border-bottom: 1px solid var(--earth-200);
      background: var(--earth-50);
    }
    .acteurs__table td {
      padding: 13px 18px;
      font-size: 0.8rem;
      color: var(--earth-700);
      border-bottom: 1px solid var(--earth-50);
      vertical-align: middle;
    }
    .acteurs__table tbody tr { transition: background 0.2s; }
    .acteurs__table tbody tr:hover { background: rgba(212, 168, 67, 0.04); }
    .acteurs__table tbody tr:last-child td { border-bottom: none; }
    .acteurs__row-link { cursor: pointer; }

    /* Search */
    .acteurs__search-wrap {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      margin-bottom: var(--space-lg);
      max-width: 420px;
      background: var(--earth-0);
      border: 1px solid var(--earth-200);
      border-radius: var(--radius);
      padding: var(--space-sm) var(--space-md);
      box-shadow: var(--shadow-sm);
    }
    .acteurs__search-wrap:focus-within { border-color: var(--primary-400); box-shadow: 0 0 0 3px rgba(212, 168, 67, 0.15); }
    .acteurs__search-icon { font-size: 22px; color: var(--earth-500); }
    .acteurs__search-input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 0.9rem;
      font-family: inherit;
      color: var(--earth-800);
      background: transparent;
    }
    .acteurs__search-input::placeholder { color: var(--earth-400); }

    /* Actor row */
    .acteurs__actor-row { display: flex; align-items: center; gap: 10px; }
    .acteurs__avatar {
      width: 34px; height: 34px;
      border-radius: 8px;
      background: linear-gradient(135deg, var(--gold-400), var(--gold-600));
      display: flex; align-items: center; justify-content: center;
      font-size: 0.72rem; font-weight: 700;
      color: var(--earth-900);
      flex-shrink: 0;
    }
    .acteurs__actor-name { font-weight: 500; color: var(--earth-800); font-size: 0.8rem; }
    .acteurs__actor-sub { font-size: 0.68rem; color: var(--earth-400); }

    /* Role badge */
    .acteurs__role-badge {
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.7rem;
      font-weight: 600;
      white-space: nowrap;
    }
    .acteurs__role-badge--gouvernement { background: #FEF3DC; color: var(--gold-600); }
    .acteurs__role-badge--mineur        { background: var(--amber-100); color: var(--amber-500); }
    .acteurs__role-badge--commerçant    { background: var(--blue-100); color: var(--blue-500); }
    .acteurs__role-badge--transporteur  { background: #EDE8FF; color: #7C4DFF; }

    /* KYC */
    .acteurs__kyc { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; }
    .acteurs__kyc-dot { width: 7px; height: 7px; border-radius: 50%; }
    .acteurs__kyc-dot--ok      { background: var(--green-500); }
    .acteurs__kyc-dot--pending { background: var(--amber-500); }

    .acteurs__lots-count { font-weight: 600; color: var(--earth-800); }
    .acteurs__last { font-size: 0.74rem; color: var(--earth-400); }
  `]
})
export class ActeursListComponent implements OnInit {
  ROLE_META = ROLE_META;
  KycStatus = KycStatus;

  allActeurs: Acteur[] = [];
  filteredActeurs: Acteur[] = [];
  activeRoleFilter: Role | null = null;
  searchTerm = '';

  /** Rôles utilisés comme filtres (excluant GOUVERNEMENT car c'est le rôle admin) */
  filterRoles = [Role.MINEUR, Role.COMMERÇANT, Role.TRANSPORTEUR];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getActeurs().subscribe(acteurs => {
      this.allActeurs = acteurs;
      this.applyFilter();
    });
  }

  setRoleFilter(role: Role | null): void {
    this.activeRoleFilter = role;
    this.applyFilter();
  }

  applyFilter(): void {
    let list = this.activeRoleFilter
      ? this.allActeurs.filter(a => a.role === this.activeRoleFilter)
      : [...this.allActeurs];
    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      list = list.filter(
        a =>
          a.id.toLowerCase().includes(term) ||
          a.name.toLowerCase().includes(term) ||
          (a.subtitle && a.subtitle.toLowerCase().includes(term))
      );
    }
    this.filteredActeurs = list;
  }

  countForRole(role: Role): number {
    return this.allActeurs.filter(a => a.role === role).length;
  }

  getInitials(name: string): string {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }
}
