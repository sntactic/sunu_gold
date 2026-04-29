import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from 'core/services/auth.service';
import { DataService } from 'core/services/data.service';
import { User, Role } from 'core/models/user.model';
import { Lot, LotStatus } from 'core/models/lot.model';
import { Acteur } from 'core/models/acteur.model';
import { StatCardComponent } from 'shared/components/stat-card/stat-card.component';
import { SenegalMapComponent } from 'shared/components/senegal-map/senegal-map.component';
import { BadgeComponent } from 'shared/components/badge/badge.component';
import { NgChartsModule } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatCardComponent, BadgeComponent, NgChartsModule, SenegalMapComponent],
  template: `
    <!-- Chargement : évite la page blanche au premier rendu -->
    <div class="dashboard__loading" *ngIf="!currentUser">
      <span class="material-icons-round">hourglass_empty</span>
      <p>Chargement du tableau de bord…</p>
    </div>

    <!-- ══ GOUVERNEMENT ══ -->
    <ng-container *ngIf="currentUser && isGouvernement">
      <div class="dashboard__stats">
        <app-stat-card variant="gold" [value]="totalPoidsGov.toFixed(1)" unit="kg" label="Or déclaré (tous lots)" [trendValue]="recentLots.length + ' lots récents'" trendDirection="up">
          <span class="material-icons-round" slot="icon">diamond</span>
        </app-stat-card>
        <app-stat-card variant="green" [value]="certCountGov.toString()" label="Certificats émis" trendValue="Valides" trendDirection="up">
          <span class="material-icons-round" slot="icon">verified</span>
        </app-stat-card>
        <app-stat-card variant="blue" [value]="acteursGov.length.toString()" label="Acteurs enregistrés" trendValue="Tous rôles" trendDirection="up">
          <span class="material-icons-round" slot="icon">groups</span>
        </app-stat-card>
        <app-stat-card variant="amber" [value]="(totalPoidsGov * 0.02).toFixed(1) + 'M'" unit="FCFA" label="Est. taxes (2%)" trendValue="Simulation" trendDirection="down">
          <span class="material-icons-round" slot="icon">payments</span>
        </app-stat-card>
      </div>

      <div class="dashboard__grid">
        <div class="dashboard__panel">
          <div class="dashboard__panel-header">
            <h2>Production mensuelle (kg)</h2>
          </div>
          <div class="dashboard__chart dashboard__chart--clickable">
            <canvas baseChart [data]="barChartData" [options]="barChartOptions" type="bar"></canvas>
          </div>
          <p class="dashboard__chart-hint">Cliquez sur une barre pour ouvrir le rapport détaillé du mois.</p>
        </div>

        <div class="dashboard__panel">
          <div class="dashboard__panel-header">
            <h2>Répartition par région</h2>
          </div>
          <div class="dashboard__chart dashboard__chart--doughnut">
            <canvas baseChart [data]="doughnutChartData" [options]="doughnutChartOptions" type="doughnut"></canvas>
            <div class="dashboard__legend">
              <div class="legend__item" *ngFor="let r of regionData">
                <div class="legend__color" [style.background]="r.color"></div>
                <span class="legend__label">{{ r.region }}</span>
                <span class="legend__value">{{ r.percent }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="dashboard__panel dashboard__panel--full">
        <div class="dashboard__panel-header">
          <h2>Répartition de l'activité orpaillère — Sénégal</h2>
          <a routerLink="/acteurs" class="dashboard__btn-all">Voir les acteurs</a>
        </div>
        <app-senegal-map [acteurs]="acteursGov" [lots]="recentLots" [regionStats]="regionStatsForMap" [showLiveBadge]="true"></app-senegal-map>
      </div>

      <div class="dashboard__panel dashboard__panel--full">
        <div class="dashboard__panel-header">
          <h2>Derniers lots enregistrés</h2>
          <a routerLink="/lots" class="dashboard__btn-all">Voir tous les lots</a>
        </div>
        <div class="dashboard__table-wrap">
          <table class="dashboard__table">
            <thead>
              <tr>
                <th>Lot ID</th>
                <th>Région</th>
                <th>Poids (kg)</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let lot of recentLots" class="dashboard__row-link">
                <td><a [routerLink]="['/lots', getLotRouteId(lot.id)]" class="dashboard__lot-id dashboard__lot-link">{{ lot.id }}</a></td>
                <td>{{ lot.region }}</td>
                <td class="dashboard__lot-poids">{{ lot.poids }}</td>
                <td><app-badge [type]="lot.status"></app-badge></td>
                <td class="dashboard__lot-date">{{ lot.date }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </ng-container>

    <!-- ══ MINEUR (ORPAILLEUR) ══ -->
    <ng-container *ngIf="currentUser && isMineur">
      <div class="dashboard__stats">
        <app-stat-card variant="gold" [value]="myLots.length.toString()" label="Mes lots" [trendValue]="myLotsEnAttente + ' en attente'" trendDirection="up">
          <span class="material-icons-round" slot="icon">inventory_2</span>
        </app-stat-card>
        <app-stat-card variant="green" [value]="certifiedCount.toString()" label="Lots certifiés (certificats d'origine)" [trendValue]="certifiedCount + ' certificat(s) émis'" trendDirection="up">
          <span class="material-icons-round" slot="icon">verified</span>
        </app-stat-card>
        <app-stat-card variant="blue" [value]="totalPoids.toFixed(1)" unit="kg" label="Production totale" [trendValue]="certifiedPoids.toFixed(1) + ' kg certifiés'" trendDirection="up">
          <span class="material-icons-round" slot="icon">scale</span>
        </app-stat-card>
        <app-stat-card variant="amber" [value]="alerteCount.toString()" label="Alertes sur mes lots" [trendValue]="alerteCount === 0 ? 'Aucune' : alerteCount + ' à traiter'" trendDirection="down">
          <span class="material-icons-round" slot="icon">notifications_active</span>
        </app-stat-card>
      </div>
      <div class="dashboard__panel dashboard__panel--full">
        <div class="dashboard__panel-header">
          <h2>Mes lots</h2>
          <a routerLink="/lots" class="dashboard__btn-all">Voir tout</a>
        </div>
        <div class="dashboard__table-wrap">
          <table class="dashboard__table">
            <thead><tr><th>Lot ID</th><th>Région</th><th>Poids (kg)</th><th>Statut</th><th>Date</th></tr></thead>
            <tbody>
              <tr *ngFor="let lot of myLots" class="dashboard__row-link">
                <td><a [routerLink]="['/lots', getLotRouteId(lot.id)]" class="dashboard__lot-id dashboard__lot-link">{{ lot.id }}</a></td>
                <td>{{ lot.region }}</td>
                <td class="dashboard__lot-poids">{{ lot.poids }}</td>
                <td><app-badge [type]="lot.status"></app-badge></td>
                <td class="dashboard__lot-date">{{ lot.date }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </ng-container>

    <!-- ══ COMMERÇANT ══ -->
    <ng-container *ngIf="currentUser && isCommercant">
      <div class="dashboard__stats">
        <app-stat-card variant="gold" [value]="availableLots.length.toString()" label="Lots certifiés disponibles" trendValue="3" trendDirection="up">
          <span class="material-icons-round" slot="icon">diamond</span>
        </app-stat-card>
        <app-stat-card variant="green" [value]="availablePoids.toFixed(1)" unit="kg" label="Total kg disponible" trendValue="12%" trendDirection="up">
          <span class="material-icons-round" slot="icon">scale</span>
        </app-stat-card>
        <app-stat-card variant="blue" value="3" label="Régions représentées" trendValue="1" trendDirection="up">
          <span class="material-icons-round" slot="icon">map</span>
        </app-stat-card>
        <app-stat-card variant="amber" value="2" label="Achats en cours" trendValue="0" trendDirection="down">
          <span class="material-icons-round" slot="icon">shopping_cart</span>
        </app-stat-card>
      </div>
      <div class="dashboard__panel dashboard__panel--full">
        <div class="dashboard__panel-header">
          <h2>Lots certifiés disponibles à l'achat</h2>
          <a routerLink="/lots" class="dashboard__btn-all">Voir tout</a>
        </div>
        <div class="dashboard__table-wrap">
          <table class="dashboard__table">
            <thead><tr><th>Lot ID</th><th>Région</th><th>Orpailleur</th><th>Poids (kg)</th><th>Statut</th></tr></thead>
            <tbody>
              <tr *ngFor="let lot of availableLots" class="dashboard__row-link">
                <td><a [routerLink]="['/lots', getLotRouteId(lot.id)]" class="dashboard__lot-id dashboard__lot-link">{{ lot.id }}</a></td>
                <td>{{ lot.region }}</td>
                <td>{{ lot.orpailleurName }}</td>
                <td class="dashboard__lot-poids">{{ lot.poids }}</td>
                <td><app-badge [type]="lot.status"></app-badge></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </ng-container>

    <!-- ══ TRANSPORTEUR ══ -->
    <ng-container *ngIf="currentUser && isTransporteur">
      <div class="dashboard__stats">
        <app-stat-card variant="gold" [value]="myTransports.length.toString()" label="Livraisons en cours" trendValue="1" trendDirection="up">
          <span class="material-icons-round" slot="icon">local_shipping</span>
        </app-stat-card>
        <app-stat-card variant="green" [value]="transportPoids.toFixed(1)" unit="kg" label="Or en transit" trendValue="8%" trendDirection="up">
          <span class="material-icons-round" slot="icon">diamond</span>
        </app-stat-card>
        <app-stat-card variant="blue" value="0" label="Anomalies détectées" trendValue="0" trendDirection="up">
          <span class="material-icons-round" slot="icon">warning</span>
        </app-stat-card>
        <app-stat-card variant="amber" value="12" label="Livraisons complétées" trendValue="4" trendDirection="up">
          <span class="material-icons-round" slot="icon">verified</span>
        </app-stat-card>
      </div>
      <div class="dashboard__panel dashboard__panel--full">
        <div class="dashboard__panel-header">
          <h2>Mes livraisons en transit</h2>
          <a routerLink="/lots" class="dashboard__btn-all">Voir tout</a>
        </div>
        <div class="dashboard__table-wrap">
          <table class="dashboard__table">
            <thead><tr><th>Lot ID</th><th>Région</th><th>Orpailleur</th><th>Poids (kg)</th><th>Statut</th><th>Date</th></tr></thead>
            <tbody>
              <tr *ngFor="let lot of myTransports" class="dashboard__row-link">
                <td><a [routerLink]="['/lots', getLotRouteId(lot.id)]" class="dashboard__lot-id dashboard__lot-link">{{ lot.id }}</a></td>
                <td>{{ lot.region }}</td>
                <td>{{ lot.orpailleurName }}</td>
                <td class="dashboard__lot-poids">{{ lot.poids }}</td>
                <td><app-badge [type]="lot.status"></app-badge></td>
                <td class="dashboard__lot-date">{{ lot.date }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </ng-container>
  `,
  styles: [`
    :host { display: block; }

    .dashboard__loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 320px;
      color: var(--earth-500);
      gap: var(--space-md);
    }
    .dashboard__loading .material-icons-round { font-size: 48px; opacity: 0.7; }
    .dashboard__loading p { margin: 0; font-size: 1rem; }

    .dashboard__stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-lg);
      margin-bottom: var(--space-xl);
    }

    .dashboard__grid {
      display: grid;
      grid-template-columns: 1.6fr 1fr;
      gap: var(--space-lg);
      margin-bottom: var(--space-xl);
    }

    .dashboard__panel {
      background: var(--earth-0);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow);
      border: 1px solid var(--earth-100);
      overflow: hidden;
    }

    .dashboard__panel-header {
      padding: var(--space-lg) var(--space-xl);
      border-bottom: 1px solid var(--earth-100);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: var(--space-md);
    }

    .dashboard__panel-header h2 {
      font-family: 'Playfair Display', serif;
      font-size: 1.15rem;
      font-weight: 600;
      color: var(--earth-800);
      margin: 0;
    }

    .dashboard__chart {
      padding: var(--space-xl);
      position: relative;
      height: 280px;
    }

    .dashboard__chart--clickable { cursor: pointer; }
    .dashboard__chart-hint {
      font-size: 0.8rem;
      color: var(--earth-500);
      margin: 0 var(--space-xl) var(--space-md);
    }

    .dashboard__chart--doughnut {
      display: flex;
      align-items: center;
      gap: var(--space-xl);
      height: auto;
      min-height: 260px;
    }

    .dashboard__chart--doughnut canvas {
      max-width: 200px;
      max-height: 200px;
    }

    .dashboard__legend {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }

    .legend__item {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }

    .legend__color {
      width: 12px;
      height: 12px;
      border-radius: 4px;
      flex-shrink: 0;
    }

    .legend__label {
      font-size: 0.85rem;
      color: var(--earth-600);
      flex: 1;
    }

    .legend__value {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--earth-800);
    }

    .dashboard__table-wrap {
      overflow-x: auto;
    }

    .dashboard__table {
      width: 100%;
      border-collapse: collapse;
    }

    .dashboard__table th {
      text-align: left;
      font-size: 0.7rem;
      color: var(--earth-500);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
      padding: var(--space-md) var(--space-xl);
      border-bottom: 1px solid var(--earth-200);
      background: var(--earth-50);
    }

    .dashboard__table td {
      padding: var(--space-md) var(--space-xl);
      font-size: 0.875rem;
      color: var(--earth-700);
      border-bottom: 1px solid var(--earth-50);
      vertical-align: middle;
    }

    .dashboard__table tbody tr {
      transition: background var(--transition);
    }

    .dashboard__table tbody tr:hover {
      background: var(--primary-50);
    }

    .dashboard__table tbody tr:last-child td {
      border-bottom: none;
    }

    .dashboard__row-link { cursor: pointer; }
    .dashboard__lot-link {
      font-family: 'Playfair Display', serif;
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--primary-600);
      text-decoration: none;
      transition: color var(--transition);
    }
    .dashboard__lot-link:hover { color: var(--primary-700); text-decoration: underline; }
    .dashboard__lot-id {
      font-family: 'Playfair Display', serif;
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--earth-800);
    }

    .dashboard__lot-poids {
      font-weight: 600;
      color: var(--earth-800);
    }

    .dashboard__lot-date {
      font-size: 0.8rem;
      color: var(--earth-500);
    }

    .dashboard__btn-all {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--primary-600);
      text-decoration: none;
      padding: var(--space-xs) var(--space-sm);
      border-radius: var(--radius);
      transition: background var(--transition), color var(--transition);
    }
    .dashboard__btn-all:hover { color: var(--primary-700); background: var(--primary-50); }

    @media (max-width: 1280px) {
      .dashboard__stats {
        grid-template-columns: repeat(2, 1fr);
      }

      .dashboard__grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 600px) {
      .dashboard__stats {
        grid-template-columns: 1fr;
        gap: var(--space-md);
      }

      .dashboard__chart,
      .dashboard__chart--doughnut {
        padding: var(--space-md);
        flex-direction: column;
      }

      .dashboard__table th,
      .dashboard__table td {
        padding: var(--space-sm) var(--space-md);
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;

  get isGouvernement(): boolean {
    return this.currentUser?.role === Role.GOUVERNEMENT;
  }
  get isMineur(): boolean {
    return this.currentUser?.role === Role.MINEUR;
  }
  get isCommercant(): boolean {
    return this.currentUser?.role === Role.COMMERÇANT;
  }
  get isTransporteur(): boolean {
    return this.currentUser?.role === Role.TRANSPORTEUR;
  }

  recentLots: Lot[] = [];
  allLotsGov: Lot[] = [];
  acteursGov: Acteur[] = [];
  certCountGov = 0;
  get totalPoidsGov(): number {
    return this.allLotsGov.reduce((s, l) => s + l.poids, 0);
  }
  private regionColors: Record<string, string> = {
    'Kédougou': '#D4A843',
    'Sabodala': '#B07D1A',
    'Mako': '#E8960C',
    'Dakar': '#2E7D32',
    'Thiès': '#1565C0',
    'Tambacounda': '#FF8F00',
    'Ziguinchor': '#7B1FA2',
    'Autre': '#6B5B4E'
  };

  /** Répartition par région — calculée à partir des lots (fidèle aux données) */
  get regionData(): { region: string; percent: string; color: string }[] {
    const total = this.allLotsGov.reduce((s, l) => s + l.poids, 0);
    if (total === 0) return [];
    const byRegion: Record<string, number> = {};
    this.allLotsGov.forEach(l => {
      const r = l.region || 'Autre';
      byRegion[r] = (byRegion[r] || 0) + l.poids;
    });
    return Object.entries(byRegion)
      .map(([region, poids]) => ({
        region,
        percent: ((poids / total) * 100).toFixed(1) + '%',
        color: this.regionColors[region] || '#6B5B4E'
      }))
      .sort((a, b) => parseFloat(b.percent) - parseFloat(a.percent));
  }

  /** Stats par région pour la carte — 100 % issues des données (lots + acteurs) */
  get regionStatsForMap(): { region: string; kg: number; acteurs: number; lotsTransit: number }[] {
    const byRegion: Record<string, { kg: number; acteurs: number; lotsTransit: number }> = {};
    this.acteursGov.forEach(a => {
      const r = a.region || 'Autre';
      if (!byRegion[r]) byRegion[r] = { kg: 0, acteurs: 0, lotsTransit: 0 };
      byRegion[r].acteurs++;
    });
    this.allLotsGov.forEach(l => {
      const r = l.region || 'Autre';
      if (!byRegion[r]) byRegion[r] = { kg: 0, acteurs: 0, lotsTransit: 0 };
      byRegion[r].kg += l.poids;
      if (l.status === LotStatus.EN_TRANSIT) byRegion[r].lotsTransit++;
    });
    return Object.entries(byRegion)
      .filter(([, v]) => v.kg > 0 || v.acteurs > 0)
      .map(([region, v]) => ({ region, kg: Math.round(v.kg * 10) / 10, acteurs: v.acteurs, lotsTransit: v.lotsTransit }));
  }

  barChartData: ChartData<'bar'> = {
    labels: ['Août', 'Sep', 'Oct', 'Nov', 'Déc', 'Jan'],
    datasets: [{
      label: 'Production (kg)',
      data: [620, 740, 580, 810, 690, 847],
      backgroundColor: 'rgba(212, 168, 67, 0.7)',
      borderColor: '#B07D1A',
      borderWidth: 1,
      borderRadius: 6,
    }]
  };

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (evt, elements, chart) => this.onBarChartClick({ event: evt, elements, chart }),
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(44, 36, 32, 0.9)',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          afterLabel: () => 'Cliquer pour le rapport du mois'
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 12 }, color: '#6B5B4E' }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.06)' },
        ticks: { font: { size: 12 }, color: '#6B5B4E' }
      }
    }
  };

  get doughnutChartData(): ChartData<'doughnut'> {
    const rd = this.regionData;
    return {
      labels: rd.map(r => r.region),
      datasets: [{
        data: rd.map(r => parseFloat(r.percent)),
        backgroundColor: rd.map(r => r.color),
        borderWidth: 0,
        hoverOffset: 8,
      }]
    };
  }

  doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '60%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(44, 36, 32, 0.9)',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${ctx.raw}%`
        }
      }
    }
  };

  myLots: Lot[] = [];
  certifiedCount = 0;
  totalPoids = 0;
  certifiedPoids = 0;
  alerteCount = 0;
  get myLotsEnAttente(): number {
    return this.myLots.filter(l => l.status === LotStatus.EN_ATTENTE).length;
  }
  availableLots: Lot[] = [];
  availablePoids = 0;
  myTransports: Lot[] = [];
  transportPoids = 0;

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private router: Router
  ) {}

  /** Clic sur une barre du graphique production → rapport mensuel détaillé */
  onBarChartClick(e: { event: unknown; elements: unknown[]; chart: Chart }): void {
    if (!e.elements?.length) return;
    const idx = (e.elements[0] as { index: number }).index;
    if (idx >= 0 && idx <= 5) this.router.navigate(['/rapports/mois', idx]);
  }

  ngOnInit(): void {
    try {
      if (registerables?.length) Chart.register(...registerables);
    } catch {
      // Chart.js non disponible
    }
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
      if (!user) return;
      this.loadDataForRole(user);
    });
  }

  /** ID sans # pour la route /lots/:id */
  getLotRouteId(id: string): string {
    return (id || '').replace(/^#/, '');
  }

  private loadDataForRole(user: User): void {
    switch (user.role) {
      case Role.GOUVERNEMENT:
        this.dataService.getAllLots().subscribe(lots => {
          this.allLotsGov = lots;
          this.recentLots = lots.slice(0, 5);
        });
        this.dataService.getActeurs().subscribe(acteurs => {
          this.acteursGov = acteurs;
        });
        this.dataService.getCertificates().subscribe(certs => {
          this.certCountGov = certs.length;
        });
        break;
      case Role.MINEUR:
        this.dataService.getLots().subscribe(lots => {
          this.myLots = lots;
          const certified = lots.filter(l => l.status === LotStatus.CERTIFIED);
          this.certifiedCount = certified.length;
          this.certifiedPoids = certified.reduce((sum, l) => sum + l.poids, 0);
          this.totalPoids = lots.reduce((sum, l) => sum + l.poids, 0);
          this.alerteCount = lots.filter(l => l.status === LotStatus.ALERTE).length;
        });
        break;
      case Role.COMMERÇANT:
        this.dataService.getLots().subscribe(lots => {
          this.availableLots = lots;
          this.availablePoids = lots.reduce((sum, l) => sum + l.poids, 0);
        });
        break;
      case Role.TRANSPORTEUR:
        this.dataService.getLots().subscribe(lots => {
          this.myTransports = lots;
          this.transportPoids = lots.reduce((sum, l) => sum + l.poids, 0);
        });
        break;
    }
  }
}
