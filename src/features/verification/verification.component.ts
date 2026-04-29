import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DataService } from 'core/services/data.service';
import { Lot, LotStatus, LOT_STATUS_META } from 'core/models/lot.model';
import { LotTimelineComponent } from 'shared/components/lot-timeline/lot-timeline.component';
import { QrScannerComponent } from 'shared/components/qr-scanner/qr-scanner.component';

/**
 * Page publique de vérification d'un lot (acheteurs internationaux et tous les acteurs).
 * Aligné sur le document SunuGOLD : « Consultation et vérification de l'authenticité
 * des certificats via QR code pour garantir l'origine légale et responsable de l'or. »
 */
@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LotTimelineComponent, QrScannerComponent],
  template: `
    <div class="verif">
      <div class="verif__bg" aria-hidden="true"></div>

      <header class="verif__header">
        <a routerLink="/login" class="verif__logo">
          <span class="material-icons-round">diamond</span>
          <span class="verif__title">SunuGOLD</span>
        </a>
        <p class="verif__tagline">Vérifier l'origine légale et responsable de l'or artisanal — Sénégal</p>
      </header>

      <main class="verif__main" role="main">
        <section class="verif__search card">
          <h1 class="verif__heading">Vérifier un lot</h1>
          <p class="verif__intro">Saisissez l'identifiant du lot ou le code QR pour consulter la traçabilité et l'authenticité du certificat.</p>
          <div class="verif__form">
            <input
              type="text"
              class="verif__input"
              placeholder="Ex. #LOT-2026-0847 ou QR-LOT-0847"
              [(ngModel)]="lotIdInput"
              (keyup.enter)="search()"
              #inputRef
            />
            <button type="button" class="verif__btn" (click)="search()">Vérifier</button>
          </div>
        </section>

        <section class="verif__scanner card">
          <h2 class="verif__subheading">
            <span class="material-icons-round">qr_code_scanner</span>
            Scanner un QR code
          </h2>
          <app-qr-scanner (scanSuccess)="onScanResult($event)"></app-qr-scanner>
        </section>

        <section class="verif__result card" *ngIf="searched">
          <ng-container *ngIf="lot; else notFound">
            <div class="verif__certified" *ngIf="lot.status === certifiedStatus">
              <span class="material-icons-round">verified</span>
              <div>
                <strong>Lot certifié</strong>
                <span>Ce lot est d'origine légale et tracé par la plateforme SunuGOLD.</span>
              </div>
            </div>
            <div class="verif__certified verif__certified--warning" *ngIf="lot.status !== certifiedStatus">
              <span class="material-icons-round">info</span>
              <div>
                <strong>Statut : {{ statusLabel(lot.status) }}</strong>
                <span>Ce lot n'est pas encore certifié pour l'export.</span>
              </div>
            </div>

            <div class="verif__lot-meta">
              <h2>{{ lot.id }}</h2>
              <p><span class="material-icons-round">location_on</span> {{ lot.region }} · <span class="material-icons-round">scale</span> {{ lot.poids }} kg · {{ lot.date }}</p>
              <p><strong>Orpailleur</strong> {{ lot.orpailleurName }}<ng-container *ngIf="lot.transporteurName"> · <strong>Transporteur</strong> {{ lot.transporteurName }}</ng-container></p>
            </div>

            <h3 class="verif__trace-title">Chaîne de traçabilité</h3>
            <app-lot-timeline [trace]="lot.trace"></app-lot-timeline>
          </ng-container>
          <ng-template #notFound>
            <div class="verif__not-found">
              <span class="material-icons-round">search_off</span>
              <p>Aucun lot trouvé pour « {{ lastSearch }} ».</p>
              <p>Vérifiez l'identifiant ou le code QR et réessayez.</p>
            </div>
          </ng-template>
        </section>
      </main>

      <footer class="verif__footer">
        <a routerLink="/login">Accès acteurs SunuGOLD</a>
      </footer>
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; }

    .verif {
      position: relative;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      padding: var(--space-xl);
      background: var(--earth-900);
    }

    .verif__bg {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse 80% 60% at 20% 90%, rgba(212, 168, 67, 0.12) 0%, transparent 50%),
        radial-gradient(ellipse 60% 50% at 80% 10%, rgba(212, 168, 67, 0.06) 0%, transparent 50%);
      pointer-events: none;
    }

    .verif__header {
      position: relative;
      text-align: center;
      margin-bottom: var(--space-2xl);
    }

    .verif__logo {
      display: inline-flex;
      align-items: center;
      gap: var(--space-sm);
      color: var(--primary-200);
      text-decoration: none;
      font-family: 'Playfair Display', serif;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .verif__logo .material-icons-round { font-size: 32px; }

    .verif__tagline {
      color: var(--earth-400);
      font-size: 0.85rem;
      margin: var(--space-sm) 0 0;
    }

    .verif__main {
      position: relative;
      flex: 1;
      max-width: 640px;
      margin: 0 auto;
      width: 100%;
    }

    .card {
      background: rgba(44, 36, 32, 0.85);
      border: 1px solid rgba(212, 168, 67, 0.12);
      border-radius: var(--radius-xl);
      padding: var(--space-xl);
      margin-bottom: var(--space-xl);
      box-shadow: var(--shadow-lg);
    }

    .verif__heading {
      font-size: 1.5rem;
      color: var(--earth-100);
      margin: 0 0 var(--space-sm);
    }

    .verif__intro {
      color: var(--earth-400);
      font-size: 0.9rem;
      margin: 0 0 var(--space-lg);
    }

    .verif__form {
      display: flex;
      gap: var(--space-md);
    }

    .verif__input {
      flex: 1;
      padding: var(--space-md) var(--space-lg);
      border: 1px solid rgba(212, 168, 67, 0.25);
      border-radius: var(--radius);
      background: rgba(61, 51, 43, 0.5);
      color: var(--earth-100);
      font-size: 1rem;
      font-family: inherit;
    }

    .verif__input::placeholder { color: var(--earth-500); }

    .verif__btn {
      padding: var(--space-md) var(--space-xl);
      background: linear-gradient(135deg, var(--primary-300), var(--primary-500));
      border: none;
      border-radius: var(--radius);
      color: var(--earth-900);
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      white-space: nowrap;
    }

    .verif__subheading {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      font-size: 1.1rem;
      color: var(--earth-200);
      margin: 0 0 var(--space-sm);
    }

    .verif__subheading .material-icons-round { font-size: 24px; color: var(--earth-400); }

    .verif__bientot {
      color: var(--earth-500);
      font-size: 0.9rem;
      margin: 0;
      font-style: italic;
    }

    .verif__result { margin-top: var(--space-lg); }

    .verif__certified {
      display: flex;
      align-items: flex-start;
      gap: var(--space-md);
      padding: var(--space-md) var(--space-lg);
      background: rgba(76, 175, 80, 0.12);
      border: 1px solid rgba(76, 175, 80, 0.3);
      border-radius: var(--radius);
      margin-bottom: var(--space-xl);
      color: var(--earth-100);
    }

    .verif__certified .material-icons-round { color: var(--green-400); font-size: 28px; flex-shrink: 0; }

    .verif__certified strong { display: block; margin-bottom: 2px; }

    .verif__certified span:not(.material-icons-round) { font-size: 0.9rem; color: var(--earth-300); }

    .verif__certified--warning {
      background: rgba(255, 193, 7, 0.1);
      border-color: rgba(255, 193, 7, 0.25);
    }

    .verif__certified--warning .material-icons-round { color: #ffc107; }

    .verif__lot-meta h2 { font-size: 1.25rem; color: var(--primary-200); margin: 0 0 var(--space-xs); }
    .verif__lot-meta p { color: var(--earth-400); font-size: 0.9rem; margin: 0 0 var(--space-xs); display: flex; align-items: center; gap: var(--space-xs); }
    .verif__lot-meta .material-icons-round { font-size: 18px; }

    .verif__trace-title { font-size: 1rem; color: var(--earth-300); margin: var(--space-lg) 0 var(--space-md); }

    .verif__not-found {
      text-align: center;
      padding: var(--space-2xl);
      color: var(--earth-400);
    }

    .verif__not-found .material-icons-round { font-size: 48px; margin-bottom: var(--space-md); opacity: 0.6; }
    .verif__not-found p { margin: 0 0 var(--space-sm); }

    .verif__footer {
      position: relative;
      text-align: center;
      margin-top: auto;
      padding-top: var(--space-2xl);
    }

    .verif__footer a { color: var(--earth-500); font-size: 0.85rem; text-decoration: none; }
    .verif__footer a:hover { color: var(--primary-300); }
  `]
})
export class VerificationComponent implements OnInit {
  lotIdInput = '';
  lastSearch = '';
  searched = false;
  lot: Lot | undefined;
  certifiedStatus = LotStatus.CERTIFIED;

  constructor(
    private route: ActivatedRoute,
    private data: DataService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.lotIdInput = id;
        this.search();
      }
    });
  }

  search(): void {
    const id = this.lotIdInput?.trim();
    this.searched = true;
    this.lastSearch = id || '(vide)';
    if (!id) {
      this.lot = undefined;
      return;
    }
    this.data.getLotById(id).subscribe(l => this.lot = l);
  }

  statusLabel(status: LotStatus): string {
    return LOT_STATUS_META[status]?.label ?? status;
  }

  onScanResult(value: string): void {
    this.lotIdInput = value;
    this.search();
  }
}
