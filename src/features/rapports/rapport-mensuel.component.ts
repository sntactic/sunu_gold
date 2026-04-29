import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DataService } from 'core/services/data.service';
import { Lot } from 'core/models/lot.model';
import { BadgeComponent } from 'shared/components/badge/badge.component';

const MOIS_LABELS = ['Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre', 'Janvier'];
const MOIS_PRODUCTION = [620, 740, 580, 810, 690, 847]; // kg, cohérent avec le graphique

@Component({
  selector: 'app-rapport-mensuel',
  standalone: true,
  imports: [CommonModule, RouterLink, BadgeComponent],
  template: `
    <div class="rapport" *ngIf="moisLabel">
      <a href="/dashboard" class="rapport__back" (click)="goToDashboard($event)">
        <span class="material-icons-round">arrow_back</span>
        Retour au tableau de bord
      </a>

      <header class="rapport__header">
        <div class="rapport__header-main">
          <h1 class="rapport__title">Rapport d'activité — {{ moisLabel }} 2026</h1>
          <p class="rapport__subtitle">Synthèse détaillée de l'activité orpaillère pour la période.</p>
        </div>
        <button type="button" class="rapport__print" (click)="print()">
          <span class="material-icons-round">print</span>
          Imprimer le rapport
        </button>
      </header>

      <section class="rapport__kpis">
        <div class="rapport__kpi">
          <span class="rapport__kpi-value">{{ productionMois }} kg</span>
          <span class="rapport__kpi-label">Production du mois</span>
        </div>
        <div class="rapport__kpi">
          <span class="rapport__kpi-value">{{ lotsDuMois.length }}</span>
          <span class="rapport__kpi-label">Lots enregistrés</span>
        </div>
        <div class="rapport__kpi">
          <span class="rapport__kpi-value">{{ certifiesMois }}</span>
          <span class="rapport__kpi-label">Lots certifiés</span>
        </div>
        <div class="rapport__kpi">
          <span class="rapport__kpi-value">{{ (productionMois * 0.02).toFixed(0) }} K FCFA</span>
          <span class="rapport__kpi-label">Est. taxes (2%)</span>
        </div>
      </section>

      <section class="rapport__section">
        <h2 class="rapport__section-title">Détail des lots — {{ moisLabel }}</h2>
        <div class="rapport__table-wrap">
          <table class="rapport__table">
            <thead>
              <tr>
                <th>Lot ID</th>
                <th>Région</th>
                <th>Orpailleur</th>
                <th>Poids (kg)</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let lot of lotsDuMois">
                <td><a [routerLink]="['/lots', getLotRouteId(lot.id)]" class="rapport__link">{{ lot.id }}</a></td>
                <td>{{ lot.region }}</td>
                <td>{{ lot.orpailleurName }}</td>
                <td>{{ lot.poids }}</td>
                <td><app-badge [type]="lot.status"></app-badge></td>
                <td>{{ lot.date }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="rapport__section rapport__section--repartition">
        <h2 class="rapport__section-title">Répartition par région ({{ moisLabel }})</h2>
        <div class="rapport__region-bars">
          <div class="rapport__region-item" *ngFor="let r of regionStats">
            <div class="rapport__region-info">
              <span class="rapport__region-name">{{ r.region }}</span>
              <span class="rapport__region-value">{{ r.poids }} kg ({{ r.count }} lot(s))</span>
            </div>
            <div class="rapport__region-bar-wrap">
              <div class="rapport__region-bar" [style.width.%]="r.percent" [style.background]="r.color"></div>
            </div>
          </div>
        </div>
      </section>

      <footer class="rapport__footer">
        <p>Rapport généré le {{ dateGeneration }} — SunuGOLD Plateforme de Traçabilité Aurifère</p>
      </footer>
    </div>

    <div class="rapport__error" *ngIf="error">
      <p>Période invalide.</p>
      <a href="/dashboard" (click)="goToDashboard($event)">Retour au tableau de bord</a>
    </div>
  `,
  styles: [`
    .rapport { max-width: 900px; margin: 0 auto; padding-bottom: var(--space-2xl); }
    .rapport__back {
      display: inline-flex;
      align-items: center;
      gap: var(--space-sm);
      color: var(--earth-600);
      text-decoration: none;
      font-size: 0.9rem;
      margin-bottom: var(--space-lg);
    }
    .rapport__back:hover { color: var(--primary-600); }
    .rapport__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: var(--space-lg);
      margin-bottom: var(--space-2xl);
      padding-bottom: var(--space-xl);
      border-bottom: 2px solid var(--earth-200);
    }
    .rapport__title { font-size: 1.75rem; color: var(--earth-800); margin: 0 0 var(--space-xs); }
    .rapport__subtitle { color: var(--earth-500); margin: 0; }
    .rapport__print {
      display: inline-flex;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-sm) var(--space-lg);
      background: var(--earth-800);
      color: var(--earth-0);
      border: none;
      border-radius: var(--radius);
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
    }
    .rapport__print:hover { background: var(--earth-700); }
    .rapport__kpis {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-lg);
      margin-bottom: var(--space-2xl);
    }
    .rapport__kpi {
      background: var(--earth-0);
      padding: var(--space-lg);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow);
      border: 1px solid var(--earth-100);
      text-align: center;
    }
    .rapport__kpi-value { display: block; font-size: 1.5rem; font-weight: 700; color: var(--primary-600); }
    .rapport__kpi-label { font-size: 0.8rem; color: var(--earth-500); }
    .rapport__section { margin-bottom: var(--space-2xl); }
    .rapport__section-title { font-size: 1.1rem; color: var(--earth-800); margin: 0 0 var(--space-lg); }
    .rapport__table-wrap { overflow-x: auto; background: var(--earth-0); border-radius: var(--radius-lg); box-shadow: var(--shadow); }
    .rapport__table { width: 100%; border-collapse: collapse; }
    .rapport__table th, .rapport__table td { padding: var(--space-sm) var(--space-md); text-align: left; }
    .rapport__table th { background: var(--earth-50); font-size: 0.7rem; text-transform: uppercase; color: var(--earth-500); }
    .rapport__table td { font-size: 0.875rem; color: var(--earth-700); border-bottom: 1px solid var(--earth-50); }
    .rapport__link { font-weight: 600; color: var(--primary-600); text-decoration: none; }
    .rapport__link:hover { text-decoration: underline; }
    .rapport__region-bars { display: flex; flex-direction: column; gap: var(--space-md); }
    .rapport__region-item { display: grid; grid-template-columns: 180px 1fr; align-items: center; gap: var(--space-md); }
    .rapport__region-info { display: flex; flex-direction: column; gap: 2px; }
    .rapport__region-name { font-weight: 600; color: var(--earth-800); }
    .rapport__region-value { font-size: 0.8rem; color: var(--earth-500); }
    .rapport__region-bar-wrap { height: 24px; background: var(--earth-100); border-radius: var(--radius); overflow: hidden; }
    .rapport__region-bar { height: 100%; border-radius: var(--radius); min-width: 4px; transition: width 0.5s ease; }
    .rapport__footer { margin-top: var(--space-2xl); padding-top: var(--space-lg); border-top: 1px solid var(--earth-200); font-size: 0.8rem; color: var(--earth-500); }
    .rapport__error { text-align: center; padding: var(--space-2xl); }

    @media print {
      .rapport__back, .rapport__print { display: none !important; }
      .rapport {
        padding: 0 !important;
        max-width: 100% !important;
        margin: 0 !important;
      }
      .rapport__header {
        border-bottom: 2px solid #333 !important;
        padding-bottom: 12pt !important;
        margin-bottom: 18pt !important;
      }
      .rapport__title { font-size: 18pt !important; color: #1a1a1a !important; }
      .rapport__subtitle { color: #444 !important; font-size: 10pt !important; }
      .rapport__kpis {
        display: grid !important;
        grid-template-columns: repeat(4, 1fr) !important;
        gap: 12pt !important;
        margin-bottom: 18pt !important;
      }
      .rapport__kpi {
        background: #f5f5f5 !important;
        padding: 12pt !important;
        border: 1px solid #ddd !important;
      }
      .rapport__kpi-value { font-size: 14pt !important; color: #8a6014 !important; }
      .rapport__kpi-label { font-size: 9pt !important; color: #555 !important; }
      .rapport__section { margin-bottom: 18pt !important; break-inside: avoid; }
      .rapport__section-title { font-size: 12pt !important; color: #1a1a1a !important; margin-bottom: 10pt !important; }
      .rapport__table-wrap { overflow: visible !important; box-shadow: none !important; border: 1px solid #ccc !important; }
      .rapport__table th, .rapport__table td {
        padding: 6pt 10pt !important;
        font-size: 9pt !important;
        color: #333 !important;
        border-bottom: 1px solid #eee !important;
      }
      .rapport__table th { background: #eee !important; }
      .rapport__link { color: #8a6014 !important; }
      .rapport__region-bars { break-inside: avoid; }
      .rapport__region-item { grid-template-columns: 140pt 1fr !important; }
      .rapport__region-name { color: #1a1a1a !important; }
      .rapport__region-value { color: #555 !important; }
      .rapport__footer { margin-top: 18pt !important; padding-top: 12pt !important; border-top: 1px solid #ccc !important; font-size: 9pt !important; color: #555 !important; }
    }

    @media (max-width: 768px) {
      .rapport__kpis { grid-template-columns: repeat(2, 1fr); }
      .rapport__region-item { grid-template-columns: 1fr; }
    }
  `]
})
export class RapportMensuelComponent implements OnInit {
  moisIndex: number | null = null;
  moisLabel: string | null = null;
  productionMois = 0;
  lotsDuMois: Lot[] = [];
  certifiesMois = 0;
  regionStats: { region: string; poids: number; count: number; percent: number; color: string }[] = [];
  dateGeneration = '';
  error = false;

  private regionColors: Record<string, string> = {
    'Kédougou': '#D4A843',
    'Dakar': '#2E7D32',
    'Thiès': '#1565C0',
    'Autres': '#FF8F00'
  };

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
    const mois = this.route.snapshot.paramMap.get('mois');
    const index = mois ? parseInt(mois, 10) : -1;
    if (index < 0 || index > 5) {
      this.error = true;
      return;
    }
    this.moisIndex = index;
    this.moisLabel = MOIS_LABELS[index];
    this.productionMois = MOIS_PRODUCTION[index];
    this.dateGeneration = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

    this.dataService.getAllLots().subscribe(all => {
      this.lotsDuMois = this.simulateLotsForMonth(all, index);
      this.certifiesMois = this.lotsDuMois.filter(l => l.status === 'certified').length;
      this.regionStats = this.buildRegionStats(this.lotsDuMois);
    });
  }

  private simulateLotsForMonth(all: Lot[], monthIndex: number): Lot[] {
    const count = Math.min(5 + monthIndex * 2, 12);
    return all.slice(0, count);
  }

  private buildRegionStats(lots: Lot[]): { region: string; poids: number; count: number; percent: number; color: string }[] {
    const byRegion: Record<string, { poids: number; count: number }> = {};
    lots.forEach(l => {
      const r = l.region || 'Autres';
      if (!byRegion[r]) byRegion[r] = { poids: 0, count: 0 };
      byRegion[r].poids += l.poids;
      byRegion[r].count += 1;
    });
    const total = lots.reduce((s, l) => s + l.poids, 0);
    return Object.entries(byRegion).map(([region, data]) => ({
      region,
      poids: Math.round(data.poids * 10) / 10,
      count: data.count,
      percent: total ? (data.poids / total) * 100 : 0,
      color: this.regionColors[region] || '#6B5B4E'
    }));
  }

  getLotRouteId(id: string): string {
    return (id || '').replace(/^#/, '');
  }

  print(): void {
    window.print();
  }
}
