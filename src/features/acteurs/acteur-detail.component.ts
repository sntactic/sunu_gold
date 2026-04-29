import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DataService } from 'core/services/data.service';
import { Acteur, KycStatus } from 'core/models/acteur.model';
import { Lot } from 'core/models/lot.model';
import { Role, ROLE_META } from 'core/models/user.model';
import { BadgeComponent } from 'shared/components/badge/badge.component';

@Component({
  selector: 'app-acteur-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, BadgeComponent],
  template: `
    <div class="acteur-detail" *ngIf="acteur; else loading">
      <a href="/dashboard" class="acteur-detail__back" (click)="goToDashboard($event)">
        <span class="material-icons-round">arrow_back</span>
        Retour au tableau de bord
      </a>

      <header class="acteur-detail__header">
        <div class="acteur-detail__avatar">{{ getInitials(acteur.name) }}</div>
        <div class="acteur-detail__head-main">
          <h1 class="acteur-detail__name">{{ acteur.name }}</h1>
          <p class="acteur-detail__subtitle">{{ acteur.subtitle }}</p>
          <div class="acteur-detail__badges">
            <span class="acteur-detail__role-badge" [ngClass]="'acteur-detail__role-badge--' + acteur.role">
              {{ ROLE_META[acteur.role].label }}
            </span>
            <span class="acteur-detail__kyc" [ngClass]="acteur.kyc === KycStatus.VERIFIED ? 'acteur-detail__kyc--ok' : 'acteur-detail__kyc--pending'">
              <span class="material-icons-round">{{ acteur.kyc === KycStatus.VERIFIED ? 'verified' : 'schedule' }}</span>
              {{ acteur.kyc === KycStatus.VERIFIED ? 'KYC vérifié' : 'KYC en cours' }}
            </span>
          </div>
        </div>
      </header>

      <div class="acteur-detail__grid">
        <section class="acteur-detail__card">
          <h2 class="acteur-detail__card-title">
            <span class="material-icons-round">person</span>
            Informations personnelles
          </h2>
          <dl class="acteur-detail__dl">
            <dt>Identifiant</dt>
            <dd><code class="acteur-detail__id">{{ acteur.id }}</code></dd>
            <dt>Région</dt>
            <dd>{{ acteur.region }}</dd>
            <dt>Téléphone</dt>
            <dd>{{ acteur.phone || '—' }}</dd>
            <dt>Email</dt>
            <dd>{{ acteur.email || '—' }}</dd>
            <dt>Adresse</dt>
            <dd>{{ acteur.address || '—' }}</dd>
            <dt>Inscrit le</dt>
            <dd>{{ acteur.registeredAt || '—' }}</dd>
          </dl>
        </section>

        <section class="acteur-detail__card acteur-detail__card--wide">
          <h2 class="acteur-detail__card-title">
            <span class="material-icons-round">history</span>
            Historique d'activité
            <span class="acteur-detail__count">({{ activityLots.length }} lot(s))</span>
          </h2>
          <div class="acteur-detail__table-wrap" *ngIf="activityLots.length > 0">
            <table class="acteur-detail__table">
              <thead>
                <tr>
                  <th>Lot</th>
                  <th>Rôle dans le lot</th>
                  <th>Région</th>
                  <th>Poids</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let lot of activityLots">
                  <td>
                    <a [routerLink]="['/lots', getLotRouteId(lot.id)]" class="acteur-detail__lot-link">{{ lot.id }}</a>
                  </td>
                  <td>{{ getRoleInLot(lot) }}</td>
                  <td>{{ lot.region }}</td>
                  <td>{{ lot.poids }} kg</td>
                  <td><app-badge [type]="lot.status"></app-badge></td>
                  <td>{{ lot.date }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p *ngIf="activityLots.length === 0" class="acteur-detail__empty">
            Aucun lot associé à cet acteur pour le moment.
          </p>
        </section>
      </div>
    </div>

    <ng-template #loading>
      <div class="acteur-detail__loading" *ngIf="!error">
        <span class="material-icons-round">hourglass_empty</span>
        <p>Chargement de l'acteur…</p>
      </div>
      <div class="acteur-detail__error" *ngIf="error">
        <span class="material-icons-round">error_outline</span>
        <p>Acteur introuvable.</p>
        <a href="/dashboard" class="acteur-detail__back" (click)="goToDashboard($event)">Retour au tableau de bord</a>
      </div>
    </ng-template>
  `,
  styles: [`
    .acteur-detail { max-width: 960px; margin: 0 auto; }

    .acteur-detail__back {
      display: inline-flex;
      align-items: center;
      gap: var(--space-sm);
      color: var(--earth-600);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      margin-bottom: var(--space-lg);
      transition: color var(--transition);
    }
    .acteur-detail__back:hover { color: var(--primary-600); }
    .acteur-detail__back .material-icons-round { font-size: 20px; }

    .acteur-detail__header {
      display: flex;
      align-items: flex-start;
      gap: var(--space-xl);
      margin-bottom: var(--space-xl);
      padding: var(--space-xl);
      background: var(--earth-0);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow);
      border: 1px solid var(--earth-100);
    }

    .acteur-detail__avatar {
      width: 72px;
      height: 72px;
      border-radius: var(--radius-lg);
      background: linear-gradient(135deg, var(--primary-400), var(--primary-600));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--earth-900);
      flex-shrink: 0;
    }

    .acteur-detail__head-main { min-width: 0; }
    .acteur-detail__name {
      font-family: 'Playfair Display', serif;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--earth-800);
      margin: 0 0 var(--space-xs);
    }
    .acteur-detail__subtitle {
      font-size: 0.9rem;
      color: var(--earth-500);
      margin: 0 0 var(--space-md);
    }
    .acteur-detail__badges { display: flex; flex-wrap: wrap; gap: var(--space-sm); }
    .acteur-detail__role-badge {
      padding: 4px 12px;
      border-radius: var(--radius);
      font-size: 0.75rem;
      font-weight: 600;
    }
    .acteur-detail__role-badge--gouvernement { background: #FEF3DC; color: var(--gold-600); }
    .acteur-detail__role-badge--mineur { background: var(--amber-100); color: var(--amber-600); }
    .acteur-detail__role-badge--commerçant { background: var(--blue-100); color: var(--blue-600); }
    .acteur-detail__role-badge--transporteur { background: #EDE8FF; color: #7C4DFF; }
    .acteur-detail__kyc {
      display: inline-flex;
      align-items: center;
      gap: var(--space-xs);
      font-size: 0.8rem;
      color: var(--earth-600);
    }
    .acteur-detail__kyc .material-icons-round { font-size: 18px; }
    .acteur-detail__kyc--ok { color: var(--green-600); }
    .acteur-detail__kyc--pending { color: var(--amber-600); }

    .acteur-detail__grid {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: var(--space-xl);
    }
    .acteur-detail__card--wide { grid-column: 1 / -1; }
    @media (max-width: 768px) {
      .acteur-detail__grid { grid-template-columns: 1fr; }
      .acteur-detail__card--wide { grid-column: 1; }
    }

    .acteur-detail__card {
      background: var(--earth-0);
      border-radius: var(--radius-lg);
      padding: var(--space-xl);
      box-shadow: var(--shadow);
      border: 1px solid var(--earth-100);
    }
    .acteur-detail__card-title {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      font-family: 'Playfair Display', serif;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--earth-800);
      margin: 0 0 var(--space-lg);
      padding-bottom: var(--space-sm);
      border-bottom: 1px solid var(--earth-100);
    }
    .acteur-detail__card-title .material-icons-round { font-size: 22px; color: var(--primary-500); }
    .acteur-detail__count { font-weight: 400; color: var(--earth-500); font-size: 0.9rem; }

    .acteur-detail__dl {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: var(--space-xs) var(--space-lg);
      margin: 0;
    }
    .acteur-detail__dl dt {
      font-size: 0.75rem;
      color: var(--earth-500);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .acteur-detail__dl dd {
      margin: 0;
      font-size: 0.9rem;
      color: var(--earth-800);
    }
    .acteur-detail__id {
      font-family: monospace;
      font-size: 0.85rem;
      background: var(--earth-100);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .acteur-detail__table-wrap { overflow-x: auto; }
    .acteur-detail__table { width: 100%; border-collapse: collapse; }
    .acteur-detail__table th {
      text-align: left;
      font-size: 0.7rem;
      color: var(--earth-500);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: var(--space-sm) var(--space-md);
      border-bottom: 1px solid var(--earth-200);
      background: var(--earth-50);
    }
    .acteur-detail__table td {
      padding: var(--space-sm) var(--space-md);
      font-size: 0.875rem;
      color: var(--earth-700);
      border-bottom: 1px solid var(--earth-50);
    }
    .acteur-detail__lot-link {
      font-weight: 600;
      color: var(--primary-600);
      text-decoration: none;
    }
    .acteur-detail__lot-link:hover { text-decoration: underline; }
    .acteur-detail__empty { color: var(--earth-500); font-style: italic; margin: 0; }
    .acteur-detail__loading, .acteur-detail__error {
      text-align: center;
      padding: var(--space-3xl);
      color: var(--earth-500);
    }
    .acteur-detail__loading .material-icons-round,
    .acteur-detail__error .material-icons-round { font-size: 48px; margin-bottom: var(--space-md); opacity: 0.6; }
    .acteur-detail__error .material-icons-round { color: var(--red-500); }
  `]
})
export class ActeurDetailComponent implements OnInit {
  ROLE_META = ROLE_META;
  KycStatus = KycStatus;

  acteur: Acteur | null = null;
  activityLots: Lot[] = [];
  error = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService
  ) {}

  goToDashboard(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/dashboard'], { replaceUrl: true });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = true;
      return;
    }
    this.dataService.getActeurById(id).subscribe(a => {
      if (a) {
        this.acteur = a;
        this.dataService.getLotsByActeurId(a.id).subscribe(lots => {
          this.activityLots = lots;
        });
      } else {
        this.error = true;
      }
    });
  }

  getInitials(name: string): string {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  getRoleInLot(lot: Lot): string {
    if (this.acteur && lot.orpailleurId === this.acteur.id) return 'Orpailleur';
    if (this.acteur && lot.transporteurId === this.acteur.id) return 'Transporteur';
    return '—';
  }

  getLotRouteId(id: string): string {
    return (id || '').replace(/^#/, '');
  }
}
