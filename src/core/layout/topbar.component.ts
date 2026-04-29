import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../services/data.service';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/user.model';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  'dashboard':     { title: 'Tableau de Bord',           subtitle: 'Vue globale — Janvier 2026' },
  'lots':          { title: 'Suivi des Lots d\'Or',       subtitle: 'Gestion et traçabilité' },
  'certification': { title: 'Certificats d\'Origine',     subtitle: 'Certificats émis et validés' },
  'licences':      { title: 'Licences & Audit',          subtitle: 'Licences d\'export et journal d\'audit' },
  'acteurs':       { title: 'Gestion des Acteurs',        subtitle: 'Acteurs enregistrés sur la plateforme' },
  'alertes':       { title: 'Centre d\'Alertes',          subtitle: 'Surveillance en temps réel' },
  'historique':    { title: 'Mon historique',              subtitle: 'Historique d\'activité' },
  'transit':       { title: 'Déclarer un transit',        subtitle: 'Traçabilité du transport' },
  'rapports':     { title: 'Rapport mensuel',            subtitle: 'Détail d\'activité du mois' }
};

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="topbar" role="banner">
      <div class="topbar__left">
        <a *ngIf="showBackToDashboard" href="/dashboard" class="topbar__back" aria-label="Retour au tableau de bord" (click)="goToDashboard($event)">
          <span class="material-icons-round">arrow_back</span>
          <span class="topbar__back-label">Tableau de bord</span>
        </a>
        <div class="topbar__titles">
          <h1 class="topbar__title">{{ pageTitle }}</h1>
          <p class="topbar__subtitle" *ngIf="pageSubtitle">{{ pageSubtitle }}</p>
        </div>
      </div>
      <div class="topbar__right">
        <button
          *ngIf="isGouverneur && unreadCount > 0"
          class="topbar__notif"
          (click)="goToAlerts()"
          type="button"
          aria-label="Voir les alertes ({{ unreadCount }} non lues)"
        >
          <span class="material-icons-round">notifications</span>
          <span class="topbar__badge" aria-hidden="true">{{ unreadCount }}</span>
        </button>
      </div>
    </header>
  `,
  styles: [`
    :host { display: block; }

    .topbar {
      padding: var(--space-lg) var(--space-xl);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-md);
      background: var(--earth-0);
      border-bottom: 1px solid var(--earth-200);
      position: sticky;
      top: 0;
      z-index: 10;
      box-shadow: var(--shadow-sm);
      flex-shrink: 0;
    }

    .topbar__left {
      min-width: 0;
      display: flex;
      align-items: center;
      gap: var(--space-md);
    }
    .topbar__back {
      display: inline-flex;
      align-items: center;
      gap: var(--space-xs);
      padding: var(--space-xs) var(--space-sm);
      border-radius: var(--radius);
      color: var(--earth-600);
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 500;
      transition: background var(--transition), color var(--transition);
      flex-shrink: 0;
    }
    .topbar__back:hover {
      background: var(--earth-100);
      color: var(--primary-600);
    }
    .topbar__back .material-icons-round { font-size: 22px; }
    .topbar__back-label { display: none; }
    @media (min-width: 768px) {
      .topbar__back-label { display: inline; }
    }
    .topbar__titles { min-width: 0; }
    .topbar__title {
      font-family: 'Playfair Display', serif;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--earth-800);
      margin: 0;
      letter-spacing: -0.02em;
      line-height: 1.3;
    }

    .topbar__subtitle {
      font-size: 0.8rem;
      color: var(--earth-500);
      margin: 2px 0 0;
      font-weight: 500;
    }

    .topbar__right {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }

    .topbar__notif {
      width: 44px;
      height: 44px;
      border-radius: var(--radius);
      border: 1px solid var(--earth-200);
      background: var(--earth-0);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--earth-600);
      position: relative;
      transition: background var(--transition), color var(--transition), border-color var(--transition);
    }

    .topbar__notif:hover {
      background: var(--earth-50);
      color: var(--primary-500);
      border-color: var(--earth-300);
    }

    .topbar__notif .material-icons-round {
      font-size: 24px;
    }

    .topbar__badge {
      position: absolute;
      top: 6px;
      right: 6px;
      background: var(--red-500);
      color: white;
      font-size: 0.65rem;
      font-weight: 700;
      min-width: 18px;
      height: 18px;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
      border: 2px solid var(--earth-0);
    }

    @media (max-width: 960px) {
      .topbar {
        padding: var(--space-md) var(--space-lg);
      }

      .topbar__title {
        font-size: 1.25rem;
      }

      .topbar__subtitle {
        font-size: 0.75rem;
      }
    }
  `]
})
export class TopbarComponent implements OnInit {
  pageTitle = 'Tableau de Bord';
  pageSubtitle = '';
  unreadCount = 0;
  isGouverneur = false;
  showBackToDashboard = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private authService: AuthService
  ) {}

  private updateTitle(): void {
    const path = this.router.url.split('?')[0].replace(/^\//, '') || 'dashboard';
    const segments = path.split('/').filter(Boolean);
    this.showBackToDashboard = path !== '' && path !== 'dashboard';
    if (path.includes('declarer')) {
      this.pageTitle = 'Déclarer une production';
      this.pageSubtitle = 'Formulaire guidé pour orpailleurs';
    } else if (segments[0] === 'lots' && segments[1] && segments[1] !== 'declarer') {
      this.pageTitle = 'Détail du lot';
      this.pageSubtitle = 'Traçabilité et cycle de vie';
    } else if (segments[0] === 'acteurs' && segments[1]) {
      this.pageTitle = 'Fiche acteur';
      this.pageSubtitle = 'Informations personnelles et historique d\'activité';
    } else if (path.startsWith('transit')) {
      this.pageTitle = 'Déclarer un transit';
      this.pageSubtitle = 'Traçabilité du transport';
    } else if (path.startsWith('rapports')) {
      this.pageTitle = 'Rapport mensuel';
      this.pageSubtitle = 'Détail d\'activité du mois';
    } else {
      const segment = segments[0] || 'dashboard';
      const meta = PAGE_TITLES[segment] || PAGE_TITLES['dashboard'];
      this.pageTitle = meta.title;
      this.pageSubtitle = meta.subtitle;
    }
  }

  ngOnInit(): void {
    this.router.events.subscribe(() => this.updateTitle());
    this.authService.user$.subscribe(user => {
      if (user) {
        this.isGouverneur = user.role === Role.GOUVERNEMENT;
        this.unreadCount = this.dataService.getUnreadAlertsCount();
      }
    });
    this.updateTitle();
  }

  goToAlerts(): void {
    this.router.navigate(['/alertes']);
  }

  /** Retour au tableau de bord (jamais vers la page de connexion) */
  goToDashboard(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/dashboard'], { replaceUrl: true });
  }
}
