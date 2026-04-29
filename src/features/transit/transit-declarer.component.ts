import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'core/services/auth.service';
import { DataService } from 'core/services/data.service';
import { Lot } from 'core/models/lot.model';
import { TransitDeclaration } from 'core/models/transit.model';

@Component({
  selector: 'app-transit-declarer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="transit">
      <a href="/dashboard" class="transit__back" (click)="goToDashboard($event)">
        <span class="material-icons-round">arrow_back</span>
        Retour au tableau de bord
      </a>

      <h1 class="transit__title">Déclarer un transit</h1>
      <p class="transit__intro">Sélectionnez un lot en attente de transport et renseignez les informations pour une traçabilité complète.</p>

      <form *ngIf="!success" class="transit__form" (ngSubmit)="submit()">
        <section class="transit__card">
          <h2 class="transit__card-title">1. Lot à transporter</h2>
          <label for="lot" class="transit__label">Lot</label>
          <select id="lot" class="transit__select" [(ngModel)]="form.lotId" name="lotId" required (ngModelChange)="onLotChange()">
            <option value="">Choisir un lot</option>
            <option *ngFor="let l of lotsEnAttente" [value]="l.id">{{ l.id }} — {{ l.region }} — {{ l.poids }} kg</option>
          </select>
          <p *ngIf="lotsEnAttente.length === 0" class="transit__hint">Aucun lot en attente de transport pour le moment.</p>
        </section>

        <section class="transit__card">
          <h2 class="transit__card-title">2. Lieux</h2>
          <label for="chargement" class="transit__label">Lieu de chargement</label>
          <input id="chargement" type="text" class="transit__input" [(ngModel)]="form.lieuChargement" name="lieuChargement" placeholder="Ex. Sabodala, Kédougou" required />
          <label for="livraison" class="transit__label">Lieu de livraison prévu</label>
          <input id="livraison" type="text" class="transit__input" [(ngModel)]="form.lieuLivraison" name="lieuLivraison" placeholder="Ex. Raffinerie Dakar" required />
        </section>

        <section class="transit__card">
          <h2 class="transit__card-title">3. Véhicule et chauffeur</h2>
          <label for="vehicule" class="transit__label">Immatriculation ou identifiant du véhicule</label>
          <input id="vehicule" type="text" class="transit__input" [(ngModel)]="form.vehicule" name="vehicule" placeholder="Ex. DK-1234-A-1" required />
          <label for="chauffeur" class="transit__label">Nom du chauffeur</label>
          <input id="chauffeur" type="text" class="transit__input" [(ngModel)]="form.chauffeur" name="chauffeur" placeholder="Ex. M. Diallo" />
        </section>

        <section class="transit__card">
          <h2 class="transit__card-title">4. Dates et horaires prévus</h2>
          <label for="depart" class="transit__label">Date et heure de départ</label>
          <input id="depart" type="datetime-local" class="transit__input" [(ngModel)]="form.dateHeureDepart" name="dateHeureDepart" required />
          <label for="arrivee" class="transit__label">Date et heure d'arrivée prévue</label>
          <input id="arrivee" type="datetime-local" class="transit__input" [(ngModel)]="form.dateHeureArriveePrevue" name="dateHeureArriveePrevue" required />
        </section>

        <section class="transit__card">
          <label for="refDoc" class="transit__label">Référence du document de transport (optionnel)</label>
          <input id="refDoc" type="text" class="transit__input" [(ngModel)]="form.refDocument" name="refDocument" placeholder="Ex. BL-2026-001" />
        </section>

        <div class="transit__actions">
          <button type="button" class="transit__btn transit__btn--secondary" routerLink="/lots">Annuler</button>
          <button type="submit" class="transit__btn transit__btn--primary" [disabled]="!canSubmit()">Enregistrer la déclaration de transit</button>
        </div>
      </form>

      <div *ngIf="success" class="transit__success">
        <span class="material-icons-round transit__success-icon">check_circle</span>
        <h2>Transit déclaré</h2>
        <p>Votre déclaration de transit a été enregistrée. Le lot sera visible dans vos livraisons en cours.</p>
        <a routerLink="/lots" class="transit__btn transit__btn--primary">Voir mes livraisons</a>
      </div>
    </div>
  `,
  styles: [`
    .transit { max-width: 640px; margin: 0 auto; }
    .transit__back {
      display: inline-flex;
      align-items: center;
      gap: var(--space-sm);
      color: var(--earth-600);
      text-decoration: none;
      font-size: 0.9rem;
      margin-bottom: var(--space-lg);
    }
    .transit__back:hover { color: var(--primary-600); }
    .transit__title { font-size: 1.5rem; color: var(--earth-800); margin: 0 0 var(--space-sm); }
    .transit__intro { color: var(--earth-500); margin: 0 0 var(--space-xl); }
    .transit__card {
      background: var(--earth-0);
      border-radius: var(--radius-lg);
      padding: var(--space-xl);
      margin-bottom: var(--space-lg);
      box-shadow: var(--shadow);
      border: 1px solid var(--earth-100);
    }
    .transit__card-title { font-size: 1rem; color: var(--earth-800); margin: 0 0 var(--space-md); }
    .transit__label { display: block; font-weight: 600; font-size: 0.85rem; color: var(--earth-700); margin-bottom: var(--space-xs); }
    .transit__input, .transit__select {
      width: 100%;
      padding: var(--space-md);
      border: 1px solid var(--earth-200);
      border-radius: var(--radius);
      font-size: 1rem;
      margin-bottom: var(--space-md);
    }
    .transit__input:focus, .transit__select:focus {
      outline: none;
      border-color: var(--primary-400);
      box-shadow: 0 0 0 3px rgba(212, 168, 67, 0.15);
    }
    .transit__hint { font-size: 0.85rem; color: var(--earth-500); margin: 0; }
    .transit__actions { display: flex; gap: var(--space-md); flex-wrap: wrap; }
    .transit__btn {
      padding: var(--space-md) var(--space-xl);
      border-radius: var(--radius);
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      text-decoration: none;
      border: none;
      font-family: inherit;
    }
    .transit__btn--primary { background: linear-gradient(135deg, var(--primary-300), var(--primary-500)); color: var(--earth-900); }
    .transit__btn--primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .transit__btn--secondary { background: var(--earth-100); color: var(--earth-700); }
    .transit__success { text-align: center; padding: var(--space-2xl); background: var(--earth-0); border-radius: var(--radius-lg); border: 1px solid var(--green-200); }
    .transit__success-icon { font-size: 64px; color: var(--green-500); margin-bottom: var(--space-md); }
    .transit__success h2 { margin: 0 0 var(--space-sm); }
    .transit__success p { color: var(--earth-500); margin: 0 0 var(--space-xl); }
  `]
})
export class TransitDeclarerComponent implements OnInit {
  lotsEnAttente: Lot[] = [];
  success = false;
  form: Partial<TransitDeclaration> & {
    lotId: string;
    lieuChargement: string;
    lieuLivraison: string;
    vehicule: string;
    chauffeur: string;
    dateHeureDepart: string;
    dateHeureArriveePrevue: string;
    refDocument: string;
  } = {
    lotId: '',
    lieuChargement: '',
    lieuLivraison: '',
    vehicule: '',
    chauffeur: '',
    dateHeureDepart: '',
    dateHeureArriveePrevue: '',
    refDocument: ''
  };

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private router: Router
  ) {}

  goToDashboard(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/dashboard'], { replaceUrl: true });
  }

  ngOnInit(): void {
    this.dataService.getLotsEnAttenteSansTransporteur().subscribe(lots => {
      this.lotsEnAttente = lots;
    });
  }

  onLotChange(): void {
    const lot = this.lotsEnAttente.find(l => l.id === this.form.lotId);
    if (lot) this.form.lieuChargement = lot.region;
  }

  canSubmit(): boolean {
    return !!(
      this.form.lotId &&
      this.form.lieuChargement &&
      this.form.lieuLivraison &&
      this.form.vehicule &&
      this.form.dateHeureDepart &&
      this.form.dateHeureArriveePrevue
    );
  }

  submit(): void {
    if (!this.canSubmit()) return;
    const user = this.authService.getCurrentUser();
    if (!user) return;
    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const declaration: TransitDeclaration = {
      id: 'TR-' + Date.now(),
      lotId: this.form.lotId!,
      transporteurId: user.id,
      transporteurName: user.name,
      lieuChargement: this.form.lieuChargement!,
      lieuLivraison: this.form.lieuLivraison!,
      vehicule: this.form.vehicule!,
      dateHeureDepart: this.form.dateHeureDepart!,
      dateHeureArriveePrevue: this.form.dateHeureArriveePrevue!,
      chauffeur: this.form.chauffeur || undefined,
      refDocument: this.form.refDocument || undefined,
      dateDeclaration: dateStr,
      statut: 'en_cours'
    };
    this.dataService.declareTransit(declaration).subscribe(() => {
      this.success = true;
    });
  }
}
