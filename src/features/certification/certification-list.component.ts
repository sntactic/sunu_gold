import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from 'core/services/data.service';
import { AuthService } from 'core/services/auth.service';
import { Certificate, CertificateStatus } from 'core/models/certificate.model';
import { Role } from 'core/models/user.model';
import { BadgeComponent } from 'shared/components/badge/badge.component';
import { QrIconComponent } from 'shared/components/qr-icon/qr-icon.component';

@Component({
  selector: 'app-certification-list',
  standalone: true,
  imports: [CommonModule, RouterLink, BadgeComponent, QrIconComponent],
  template: `
    <!-- Bloc explicatif selon le rôle : à quoi sert cette section -->
    <div class="cert__hero" [class.cert__hero--mineur]="isMineur" [class.cert__hero--commercant]="isCommercant" [class.cert__hero--gouv]="isGouvernement">
      <h1 class="cert__hero-title">{{ heroTitle }}</h1>
      <p class="cert__hero-desc">{{ heroDescription }}</p>
    </div>

    <!-- Toolbar -->
    <div class="cert__toolbar">
      <div class="cert__filters">
        <button class="cert__filter" [ngClass]="{ 'cert__filter--active': activeFilter === null }" (click)="setFilter(null)">Tous</button>
        <button class="cert__filter" [ngClass]="{ 'cert__filter--active': activeFilter === CertificateStatus.VALID }" (click)="setFilter(CertificateStatus.VALID)">Valides</button>
        <button class="cert__filter" [ngClass]="{ 'cert__filter--active': activeFilter === CertificateStatus.EXPIRED }" (click)="setFilter(CertificateStatus.EXPIRED)">Expirés</button>
      </div>
    </div>

    <!-- Grille de certificats -->
    <div class="cert__grid" *ngIf="filteredCerts.length > 0">
      <div class="cert__card" *ngFor="let cert of filteredCerts">
        <!-- Header avec bouton QR (clic = afficher le QR code) -->
        <div class="cert__card-header">
          <div class="cert__card-info">
            <div class="cert__card-id">{{ cert.id }}</div>
            <div class="cert__card-lot">Lot {{ cert.lotId }}</div>
          </div>
          <div class="cert__card-qr">
            <app-qr-icon [lotId]="cert.lotId"></app-qr-icon>
          </div>
        </div>

        <!-- Body -->
        <div class="cert__card-body">
          <div class="cert__card-meta">
            <span><span class="material-icons-round cert__meta-icon">person</span> {{ cert.orpailleurName }}</span>
            <span><span class="material-icons-round cert__meta-icon">location_on</span> {{ cert.lotRegion }} · {{ cert.lotPoids }} kg</span>
            <span><span class="material-icons-round cert__meta-icon">event</span> Émis le {{ cert.emissionDate }}</span>
            <span><span class="material-icons-round cert__meta-icon">schedule</span> Expire le {{ cert.expirationDate }}</span>
          </div>
        </div>

        <!-- Footer : statut + actions utiles -->
        <div class="cert__card-footer">
          <app-badge [type]="getStatusBadge(cert.status)"></app-badge>
          <div class="cert__card-actions">
            <a [routerLink]="['/lots', getLotRouteId(cert.lotId)]" class="cert__card-verify">Voir le lot</a>
            <a [routerLink]="['/verifier']" [queryParams]="{ id: cert.lotId }" class="cert__card-verify" target="_blank" rel="noopener">
              <span class="material-icons-round">verified_user</span> Vérifier
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- État vide : message cohérent avec le rôle -->
    <div class="cert__empty" *ngIf="filteredCerts.length === 0">
      <span class="material-icons-round cert__empty-icon">verified</span>
      <h2 class="cert__empty-title">{{ emptyTitle }}</h2>
      <p class="cert__empty-desc">{{ emptyDescription }}</p>
      <a *ngIf="isMineur" routerLink="/lots" class="cert__empty-link">Voir mes lots</a>
      <a *ngIf="isCommercant" routerLink="/lots" class="cert__empty-link">Voir les lots certifiés</a>
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* Hero selon rôle */
    .cert__hero {
      background: var(--earth-0);
      border-radius: var(--radius-lg);
      padding: var(--space-xl);
      margin-bottom: var(--space-xl);
      border: 1px solid var(--earth-100);
      border-left: 4px solid var(--primary-500);
    }
    .cert__hero--mineur { border-left-color: #E8960C; }
    .cert__hero--commercant { border-left-color: #2E7DB8; }
    .cert__hero--gouv { border-left-color: var(--primary-500); }
    .cert__hero-title { font-size: 1.25rem; color: var(--earth-800); margin: 0 0 var(--space-sm); }
    .cert__hero-desc { font-size: 0.9rem; color: var(--earth-500); margin: 0; line-height: 1.5; }

    /* Empty state */
    .cert__empty {
      text-align: center;
      padding: var(--space-2xl);
      background: var(--earth-0);
      border-radius: var(--radius-lg);
      border: 1px dashed var(--earth-200);
    }
    .cert__empty-icon { font-size: 64px; color: var(--earth-300); display: block; margin-bottom: var(--space-md); }
    .cert__empty-title { font-size: 1.1rem; color: var(--earth-700); margin: 0 0 var(--space-sm); }
    .cert__empty-desc { font-size: 0.9rem; color: var(--earth-500); margin: 0 0 var(--space-lg); max-width: 420px; margin-left: auto; margin-right: auto; }
    .cert__empty-link {
      display: inline-block;
      padding: var(--space-sm) var(--space-lg);
      background: var(--primary-500);
      color: var(--earth-900);
      font-weight: 600;
      border-radius: var(--radius);
      text-decoration: none;
    }
    .cert__empty-link:hover { background: var(--primary-600); }

    /* Toolbar */
    .cert__toolbar { margin-bottom: var(--space-lg); }
    .cert__filters { display: flex; gap: var(--space-sm); flex-wrap: wrap; }
    .cert__filter {
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
    .cert__filter:hover { border-color: var(--primary-300); color: var(--primary-600); background: var(--primary-50); }
    .cert__filter--active {
      border-color: var(--primary-400);
      background: var(--primary-50);
      color: var(--primary-700);
    }

    /* Grid */
    .cert__grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--space-lg);
    }

    /* Card */
    .cert__card {
      background: var(--earth-0);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow);
      border: 1px solid var(--earth-100);
      overflow: hidden;
      transition: transform var(--transition), box-shadow var(--transition);
      display: flex;
      flex-direction: column;
    }
    .cert__card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    /* Card Header */
    .cert__card-header {
      padding: var(--space-lg);
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      background: linear-gradient(135deg, var(--primary-50), var(--earth-0));
    }
    .cert__card-id {
      font-family: 'Playfair Display', serif;
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--earth-800);
    }
    .cert__card-lot {
      font-size: 0.8rem;
      color: var(--earth-500);
      margin-top: 2px;
    }
    .cert__card-qr {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Card Body */
    .cert__card-body { padding: 0 var(--space-lg); flex: 1; }
    .cert__card-meta { display: flex; flex-direction: column; gap: var(--space-xs); }
    .cert__card-meta span { display: flex; align-items: center; gap: var(--space-xs); font-size: 0.8rem; color: var(--earth-500); line-height: 1.5; }
.cert__meta-icon { font-size: 16px !important; color: var(--earth-600); }

    /* Card Footer */
    .cert__card-footer {
      padding: var(--space-md) var(--space-lg);
      border-top: 1px solid var(--earth-100);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: var(--space-sm);
      margin-top: var(--space-md);
    }
    .cert__card-actions { display: flex; align-items: center; gap: var(--space-sm); flex-wrap: wrap; }
    .cert__card-verify {
      display: inline-flex;
      align-items: center;
      gap: var(--space-xs);
      font-size: 0.8rem;
      color: var(--primary-600);
      text-decoration: none;
      font-weight: 600;
      transition: color var(--transition);
    }
    .cert__card-verify:hover { color: var(--primary-700); }
    .cert__card-verify .material-icons-round { font-size: 18px; }
  `]
})
export class CertificationListComponent implements OnInit {
  CertificateStatus = CertificateStatus;

  allCerts: Certificate[] = [];
  filteredCerts: Certificate[] = [];
  activeFilter: CertificateStatus | null = null;
  currentRole: Role | null = null;

  get isMineur(): boolean { return this.currentRole === Role.MINEUR; }
  get isCommercant(): boolean { return this.currentRole === Role.COMMERÇANT; }
  get isGouvernement(): boolean { return this.currentRole === Role.GOUVERNEMENT; }

  get heroTitle(): string {
    if (this.isMineur) return 'Mes certificats d\'origine';
    if (this.isCommercant) return 'Certificats des lots disponibles à l\'achat';
    return 'Certificats d\'origine — Vue Gouvernement';
  }

  get heroDescription(): string {
    if (this.isMineur) return 'Les certificats émis pour les lots que vous avez déclarés. Ils prouvent l\'origine légale de votre or et permettent sa vente aux acheteurs et à l\'export. Seuls les lots ayant passé la chaîne de traçabilité apparaissent ici.';
    if (this.isCommercant) return 'Certificats des lots certifiés que vous pouvez acheter. Chaque certificat atteste de l\'origine légale du lot. Consultez le détail du lot et scannez le QR pour vérifier avant tout achat.';
    return 'Tous les certificats émis sur la plateforme. Vue de supervision pour les autorités.';
  }

  get emptyTitle(): string {
    if (this.isMineur) return 'Aucun certificat pour le moment';
    if (this.isCommercant) return 'Aucun lot certifié disponible';
    return 'Aucun certificat';
  }

  get emptyDescription(): string {
    if (this.isMineur) return 'Dès qu\'un de vos lots aura été certifié par les autorités après extraction, transport et contrôle, il apparaîtra ici. Vous pourrez alors le proposer aux acheteurs avec une preuve d\'origine légale.';
    if (this.isCommercant) return 'Les lots certifiés disponibles à l\'achat apparaîtront ici. En attendant, consultez le suivi des lots pour voir les lots en cours de certification.';
    return 'Aucun certificat émis sur la plateforme.';
  }

  constructor(
    private dataService: DataService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(u => { this.currentRole = u?.role ?? null; });
    this.dataService.getCertificates().subscribe(certs => {
      this.allCerts = certs;
      this.applyFilter();
    });
  }

  setFilter(status: CertificateStatus | null): void {
    this.activeFilter = status;
    this.applyFilter();
  }

  private applyFilter(): void {
    this.filteredCerts = this.activeFilter
      ? this.allCerts.filter(c => c.status === this.activeFilter)
      : [...this.allCerts];
  }

  /** Convertit le statut du certificat en type de badge compatible */
  getStatusBadge(status: CertificateStatus): 'valid' | 'expired' | 'en-attente' {
    switch (status) {
      case CertificateStatus.VALID:   return 'valid';
      case CertificateStatus.EXPIRED: return 'expired';
      case CertificateStatus.PENDING: return 'en-attente';
    }
  }

  getLotRouteId(lotId: string): string {
    return (lotId || '').replace(/^#/, '');
  }
}
