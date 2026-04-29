import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

/**
 * Wizard de déclaration de production (orpailleurs).
 * Formulaire progressif : Région → Poids → Récapitulatif → Confirmation.
 */
@Component({
  selector: 'app-declaration-wizard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="wizard">
      <a href="/dashboard" class="wizard__back" (click)="goToDashboard($event)">
        <span class="material-icons-round">arrow_back</span>
        Retour au tableau de bord
      </a>

      <header class="wizard__header">
        <h1 class="wizard__title">Déclarer une production</h1>
        <p class="wizard__subtitle">Renseignez les informations de votre lot d'or. Les champs sont courts et guidés.</p>
        <div class="wizard__steps" role="tablist">
          <div class="wizard__step" [class.wizard__step--active]="step >= 1" [class.wizard__step--done]="step > 1">
            <span class="wizard__step-num">1</span>
            <span class="wizard__step-label">Région</span>
          </div>
          <div class="wizard__step" [class.wizard__step--active]="step >= 2" [class.wizard__step--done]="step > 2">
            <span class="wizard__step-num">2</span>
            <span class="wizard__step-label">Poids</span>
          </div>
          <div class="wizard__step" [class.wizard__step--active]="step >= 3" [class.wizard__step--done]="step > 3">
            <span class="wizard__step-num">3</span>
            <span class="wizard__step-label">Confirmation</span>
          </div>
        </div>
      </header>

      <form class="wizard__form" (ngSubmit)="submit()">
        <!-- Étape 1 : Région -->
        <section class="wizard__panel" *ngIf="step === 1">
          <label for="region" class="wizard__label">Région d'extraction</label>
          <select id="region" class="wizard__select" [(ngModel)]="form.region" name="region" required>
            <option value="">Choisir une région</option>
            <option value="Kédougou">Kédougou</option>
            <option value="Dakar">Dakar</option>
            <option value="Thiès">Thiès</option>
            <option value="Tambacounda">Tambacounda</option>
            <option value="Autre">Autre</option>
          </select>
          <p class="wizard__hint">Lieu où l'or a été extrait.</p>
        </section>

        <!-- Étape 2 : Poids -->
        <section class="wizard__panel" *ngIf="step === 2">
          <label for="poids" class="wizard__label">Poids du lot (kg)</label>
          <input
            id="poids"
            type="number"
            class="wizard__input"
            [(ngModel)]="form.poids"
            name="poids"
            min="0.1"
            max="999"
            step="0.1"
            placeholder="Ex. 12.5"
            required
          />
          <p class="wizard__hint">Poids total du lot en kilogrammes.</p>
        </section>

        <!-- Étape 3 : Récap -->
        <section class="wizard__panel wizard__panel--recap" *ngIf="step === 3">
          <h2 class="wizard__recap-title">Récapitulatif</h2>
          <div class="wizard__recap-row">
            <span class="wizard__recap-label">Région</span>
            <span class="wizard__recap-value">{{ form.region }}</span>
          </div>
          <div class="wizard__recap-row">
            <span class="wizard__recap-label">Poids</span>
            <span class="wizard__recap-value">{{ form.poids }} kg</span>
          </div>
          <p class="wizard__recap-hint">En envoyant, vous déclarez que ces informations sont exactes.</p>
        </section>

        <div class="wizard__actions">
          <button type="button" class="wizard__btn wizard__btn--secondary" *ngIf="step > 1" (click)="prev()">
            Précédent
          </button>
          <button type="button" class="wizard__btn wizard__btn--primary" *ngIf="step < 3" (click)="next()" [disabled]="!canNext()">
            Suivant
          </button>
          <button type="submit" class="wizard__btn wizard__btn--primary" *ngIf="step === 3">
            <span class="material-icons-round">check</span>
            Envoyer la déclaration
          </button>
        </div>
      </form>

      <div class="wizard__success" *ngIf="success">
        <span class="material-icons-round wizard__success-icon">check_circle</span>
        <h2>Déclaration enregistrée</h2>
        <p>Votre production a été déclarée. Vous la retrouverez dans la liste de vos lots.</p>
        <a routerLink="/lots" class="wizard__btn wizard__btn--primary">Voir mes lots</a>
      </div>
    </div>
  `,
  styles: [`
    .wizard { max-width: 560px; margin: 0 auto; }

    .wizard__back {
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
    .wizard__back:hover { color: var(--primary-600); }
    .wizard__back .material-icons-round { font-size: 20px; }

    .wizard__header { margin-bottom: var(--space-xl); }
    .wizard__title {
      font-family: 'Playfair Display', serif;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--earth-800);
      margin: 0 0 var(--space-sm);
    }
    .wizard__subtitle { font-size: 0.9rem; color: var(--earth-500); margin: 0 0 var(--space-lg); line-height: 1.5; }

    .wizard__steps {
      display: flex;
      gap: var(--space-sm);
      flex-wrap: wrap;
    }
    .wizard__step {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-sm) var(--space-md);
      border-radius: var(--radius);
      background: var(--earth-100);
      color: var(--earth-500);
      font-size: 0.85rem;
      font-weight: 500;
    }
    .wizard__step--active {
      background: var(--primary-50);
      color: var(--primary-700);
      border: 1px solid var(--primary-200);
    }
    .wizard__step--done {
      background: var(--green-100);
      color: var(--green-600);
    }
    .wizard__step-num {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: currentColor;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .wizard__step--done .wizard__step-num { background: var(--green-500); }

    .wizard__form { margin-bottom: var(--space-xl); }
    .wizard__panel {
      background: var(--earth-0);
      border-radius: var(--radius-lg);
      padding: var(--space-xl);
      box-shadow: var(--shadow);
      border: 1px solid var(--earth-100);
      margin-bottom: var(--space-lg);
    }
    .wizard__label {
      display: block;
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--earth-700);
      margin-bottom: var(--space-sm);
    }
    .wizard__select,
    .wizard__input {
      width: 100%;
      padding: var(--space-md) var(--space-lg);
      border: 1px solid var(--earth-200);
      border-radius: var(--radius);
      font-size: 1rem;
      font-family: inherit;
      transition: border-color var(--transition);
    }
    .wizard__select:focus,
    .wizard__input:focus {
      outline: none;
      border-color: var(--primary-400);
      box-shadow: 0 0 0 3px rgba(212, 168, 67, 0.15);
    }
    .wizard__hint { font-size: 0.8rem; color: var(--earth-400); margin: var(--space-sm) 0 0; }

    .wizard__panel--recap { padding: var(--space-lg); }
    .wizard__recap-title { font-size: 1rem; font-weight: 600; color: var(--earth-800); margin: 0 0 var(--space-md); }
    .wizard__recap-row { display: flex; justify-content: space-between; padding: var(--space-sm) 0; border-bottom: 1px solid var(--earth-100); }
    .wizard__recap-label { color: var(--earth-500); font-size: 0.9rem; }
    .wizard__recap-value { font-weight: 600; color: var(--earth-800); }
    .wizard__recap-hint { font-size: 0.8rem; color: var(--earth-400); margin: var(--space-md) 0 0; }

    .wizard__actions {
      display: flex;
      gap: var(--space-md);
      flex-wrap: wrap;
    }
    .wizard__btn {
      display: inline-flex;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-md) var(--space-xl);
      border-radius: var(--radius);
      font-size: 1rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: all var(--transition);
      border: none;
      text-decoration: none;
    }
    .wizard__btn--primary {
      background: linear-gradient(135deg, var(--primary-300), var(--primary-500));
      color: var(--earth-900);
      box-shadow: var(--shadow);
    }
    .wizard__btn--primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: var(--shadow-lg);
    }
    .wizard__btn--primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .wizard__btn--secondary {
      background: var(--earth-0);
      color: var(--earth-600);
      border: 1px solid var(--earth-200);
    }
    .wizard__btn--secondary:hover { background: var(--earth-50); color: var(--earth-800); }

    .wizard__success {
      text-align: center;
      padding: var(--space-2xl);
      background: var(--earth-0);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow);
      border: 1px solid var(--green-200);
    }
    .wizard__success-icon { font-size: 64px; color: var(--green-500); margin-bottom: var(--space-md); }
    .wizard__success h2 { font-size: 1.25rem; font-weight: 600; color: var(--earth-800); margin: 0 0 var(--space-sm); }
    .wizard__success p { color: var(--earth-500); margin: 0 0 var(--space-xl); }
  `]
})
export class DeclarationWizardComponent {
  step = 1;
  success = false;
  form = {
    region: '',
    poids: null as number | null
  };

  constructor(private router: Router) {}

  goToDashboard(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/dashboard'], { replaceUrl: true });
  }

  canNext(): boolean {
    if (this.step === 1) return !!this.form.region;
    if (this.step === 2) return this.form.poids != null && this.form.poids > 0;
    return true;
  }

  next(): void {
    if (this.step < 3 && this.canNext()) this.step++;
  }

  prev(): void {
    if (this.step > 1) this.step--;
  }

  submit(): void {
    if (this.step !== 3) return;
    // En production : appel API pour créer le lot
    this.success = true;
  }
}
