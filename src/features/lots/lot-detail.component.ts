import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DataService } from 'core/services/data.service';
import { Lot, LotStatus, LOT_STATUS_META } from 'core/models/lot.model';
import { BadgeComponent } from 'shared/components/badge/badge.component';
import { LotTimelineComponent } from 'shared/components/lot-timeline/lot-timeline.component';
import { ProgressBarComponent } from 'shared/components/progress-bar/progress-bar.component';
import { QRCodeModule } from 'angularx-qrcode';

@Component({
  selector: 'app-lot-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, BadgeComponent, LotTimelineComponent, ProgressBarComponent, QRCodeModule],
  template: `
    <div class="lot-detail" *ngIf="lot; else loading">
      <a href="/dashboard" class="lot-detail__back" (click)="goToDashboard($event)">
        <span class="material-icons-round">arrow_back</span>
        Retour au tableau de bord
      </a>

      <header class="lot-detail__header">
        <div class="lot-detail__title-row">
          <h1 class="lot-detail__id">{{ lot.id }}</h1>
          <app-badge [type]="lot.status"></app-badge>
        </div>
        <p class="lot-detail__meta">
          <span class="material-icons-round">location_on</span> {{ lot.region }}
          · <span class="material-icons-round">scale</span> {{ lot.poids }} kg
          · Créé le {{ lot.date }}
        </p>
      </header>

      <div class="lot-detail__grid">
        <section class="lot-detail__card">
          <h2 class="lot-detail__card-title">Cycle de vie du lot</h2>
          <app-lot-timeline [trace]="lot.trace"></app-lot-timeline>
        </section>

        <aside class="lot-detail__aside">
          <div class="lot-detail__card">
            <h2 class="lot-detail__card-title">Progression</h2>
            <app-progress-bar [value]="lot.progression" [label]="'Traçabilité'"></app-progress-bar>
            <p class="lot-detail__progress-label">{{ lot.progression }}% complété</p>
          </div>

          <div class="lot-detail__card">
            <h2 class="lot-detail__card-title">Acteurs</h2>
            <div class="lot-detail__actors">
              <div class="lot-detail__actor">
                <span class="material-icons-round">person</span>
                <div>
                  <strong>Orpailleur</strong>
                  <span>{{ lot.orpailleurName }}</span>
                </div>
              </div>
              <div class="lot-detail__actor" *ngIf="lot.transporteurName">
                <span class="material-icons-round">local_shipping</span>
                <div>
                  <strong>Transporteur</strong>
                  <span>{{ lot.transporteurName }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="lot-detail__card lot-detail__qr-card">
            <h2 class="lot-detail__card-title">Code QR du lot</h2>
            <p class="lot-detail__qr-hint">Scannez pour vérifier l'origine du lot (page publique)</p>
            <div class="lot-detail__qr-wrap">
              <qrcode [qrdata]="getVerificationUrl(lot)" [width]="140" [errorCorrectionLevel]="'M'" [colorDark]="'#2C2420'" [colorLight]="'#f5f0eb'"></qrcode>
            </div>
            <p class="lot-detail__qr-code">ID : {{ lot.id }}</p>
            <a [routerLink]="['/verifier']" [queryParams]="{ id: lot.id }" class="lot-detail__verify-link">
              Ouvrir la page de vérification
            </a>
          </div>
        </aside>
      </div>
    </div>

    <ng-template #loading>
      <div class="lot-detail__loading" *ngIf="!error">
        <span class="material-icons-round">hourglass_empty</span>
        <p>Chargement du lot…</p>
      </div>
      <div class="lot-detail__error" *ngIf="error">
        <span class="material-icons-round">error_outline</span>
        <p>Lot introuvable.</p>
        <a href="/dashboard" class="lot-detail__back" (click)="goToDashboard($event)">Retour au tableau de bord</a>
      </div>
    </ng-template>
  `,
  styles: [`
    .lot-detail { max-width: 960px; margin: 0 auto; }

    .lot-detail__back {
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
    .lot-detail__back:hover { color: var(--primary-600); }
    .lot-detail__back .material-icons-round { font-size: 20px; }

    .lot-detail__header {
      margin-bottom: var(--space-xl);
    }

    .lot-detail__title-row {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      flex-wrap: wrap;
    }

    .lot-detail__id {
      font-family: 'Playfair Display', serif;
      font-size: 1.75rem;
      font-weight: 600;
      color: var(--earth-800);
      margin: 0;
    }

    .lot-detail__meta {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      flex-wrap: wrap;
      margin: var(--space-sm) 0 0;
      font-size: 0.9rem;
      color: var(--earth-500);
    }
    .lot-detail__meta .material-icons-round { font-size: 18px; }

    .lot-detail__grid {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: var(--space-xl);
    }

    .lot-detail__card {
      background: var(--earth-0);
      border-radius: var(--radius-lg);
      padding: var(--space-xl);
      box-shadow: var(--shadow);
      border: 1px solid var(--earth-100);
      margin-bottom: var(--space-lg);
    }

    .lot-detail__card-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--earth-800);
      margin: 0 0 var(--space-lg);
      padding-bottom: var(--space-sm);
      border-bottom: 1px solid var(--earth-100);
    }

    .lot-detail__progress-label {
      font-size: 0.85rem;
      color: var(--earth-500);
      margin: var(--space-sm) 0 0;
    }

    .lot-detail__actors { display: flex; flex-direction: column; gap: var(--space-md); }
    .lot-detail__actor {
      display: flex;
      align-items: flex-start;
      gap: var(--space-md);
    }
    .lot-detail__actor .material-icons-round {
      font-size: 24px;
      color: var(--primary-500);
      flex-shrink: 0;
    }
    .lot-detail__actor strong { display: block; font-size: 0.75rem; color: var(--earth-500); text-transform: uppercase; }
    .lot-detail__actor span { font-size: 0.9rem; color: var(--earth-800); }

    .lot-detail__qr-hint { font-size: 0.85rem; color: var(--earth-500); margin-bottom: var(--space-md); }
    .lot-detail__qr-wrap {
      padding: var(--space-md);
      background: var(--earth-50);
      border-radius: var(--radius);
      display: inline-block;
      margin-bottom: var(--space-sm);
    }
    .lot-detail__qr-wrap qrcode ::ng-deep img { display: block; border-radius: 4px; }
    .lot-detail__qr-code { font-size: 0.8rem; color: var(--earth-600); margin: 0 0 var(--space-sm); font-family: monospace; }
    .lot-detail__verify-link {
      display: inline-block;
      margin-top: var(--space-md);
      font-size: 0.85rem;
      color: var(--primary-600);
      font-weight: 500;
      text-decoration: none;
    }
    .lot-detail__verify-link:hover { text-decoration: underline; }

    .lot-detail__loading,
    .lot-detail__error {
      text-align: center;
      padding: var(--space-3xl);
      color: var(--earth-500);
    }
    .lot-detail__loading .material-icons-round,
    .lot-detail__error .material-icons-round { font-size: 48px; margin-bottom: var(--space-md); opacity: 0.6; }
    .lot-detail__error .material-icons-round { color: var(--red-500); }

    @media (max-width: 960px) {
      .lot-detail__grid { grid-template-columns: 1fr; }
    }
  `]
})
export class LotDetailComponent implements OnInit {
  lot: Lot | null = null;
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
    this.dataService.getLotById(id).subscribe(l => {
      if (l) {
        this.lot = l;
      } else {
        this.error = true;
      }
    });
  }

  getVerificationUrl(lot: Lot): string {
    if (typeof window !== 'undefined') {
      return window.location.origin + '/verifier?id=' + encodeURIComponent(lot.id);
    }
    return '/verifier?id=' + encodeURIComponent(lot.id);
  }
}
