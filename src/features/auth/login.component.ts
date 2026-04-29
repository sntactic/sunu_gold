import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Role, ROLE_META } from 'core/models/user.model';
import { AuthService } from 'core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="login">
      <div class="login__bg" aria-hidden="true"></div>

      <section class="login__card" role="main" aria-labelledby="login-title">
        <div class="login__logo">
          <div class="login__logo-icon" aria-hidden="true">
            <span class="material-icons-round">diamond</span>
          </div>
          <h1 id="login-title" class="login__title">SunuGOLD</h1>
          <p class="login__subtitle">Plateforme de Traçabilité Aurifère du Sénégal</p>
        </div>

        <div class="login__section">
          <label for="role-select" class="login__label">Choisissez votre rôle</label>
          <div class="login__roles" id="role-select" role="group">
            <button
              *ngFor="let role of roles"
              type="button"
              class="login__role-btn"
              [ngClass]="{ 'login__role-btn--active': selectedRole === role }"
              (click)="selectRole(role)"
              [attr.aria-pressed]="selectedRole === role"
              [attr.aria-label]="'Se connecter en tant que ' + meta(role).label"
            >
              <span class="material-icons-round login__role-icon" aria-hidden="true">{{ meta(role).icon }}</span>
              <span class="login__role-label">{{ meta(role).label }}</span>
            </button>
          </div>
        </div>

        <div class="login__role-desc" *ngIf="selectedRole" role="status">
          <p>{{ roleDescriptions[selectedRole] }}</p>
        </div>

        <button class="login__btn" (click)="login()" type="button">
          Se connecter
        </button>

        <p class="login__hint">Mode démonstration — aucune authentification réelle</p>
        <p class="login__verif-link">
          <a routerLink="/verifier">Acheteurs internationaux : vérifier l'origine d'un lot</a>
        </p>
      </section>
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; }

    .login {
      position: relative;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-xl);
      background: var(--earth-900);
    }

    .login__bg {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse 90% 70% at 30% 90%, rgba(212, 168, 67, 0.15) 0%, transparent 55%),
        radial-gradient(ellipse 70% 60% at 80% 20%, rgba(212, 168, 67, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse 50% 40% at 50% 50%, rgba(196, 147, 40, 0.05) 0%, transparent 60%);
      pointer-events: none;
    }

    .login__card {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 440px;
      background: rgba(44, 36, 32, 0.85);
      backdrop-filter: blur(24px);
      border: 1px solid rgba(212, 168, 67, 0.12);
      border-radius: var(--radius-xl);
      padding: var(--space-2xl) var(--space-xl);
      box-shadow: var(--shadow-xl);
      animation: loginCardIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
    }

    @keyframes loginCardIn {
      from { opacity: 0; transform: translateY(24px) scale(0.98); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    .login__logo {
      text-align: center;
      margin-bottom: var(--space-xl);
    }

    .login__logo-icon {
      width: 72px;
      height: 72px;
      margin: 0 auto var(--space-md);
      background: linear-gradient(135deg, var(--primary-300), var(--primary-500));
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--earth-900);
      box-shadow: 0 8px 32px rgba(196, 147, 40, 0.35);
    }

    .login__logo-icon .material-icons-round {
      font-size: 36px;
    }

    .login__title {
      font-family: 'Playfair Display', serif;
      font-size: 2rem;
      font-weight: 600;
      color: var(--primary-200);
      margin: 0;
      letter-spacing: -0.02em;
    }

    .login__subtitle {
      color: var(--earth-400);
      font-size: 0.85rem;
      margin: var(--space-sm) 0 0;
      letter-spacing: 0.02em;
      font-weight: 500;
    }

    .login__section {
      margin-bottom: var(--space-lg);
    }

    .login__label {
      display: block;
      color: var(--earth-300);
      font-size: 0.8rem;
      font-weight: 600;
      margin-bottom: var(--space-sm);
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .login__roles {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-sm);
    }

    .login__role-btn {
      padding: var(--space-md) var(--space-sm);
      border-radius: var(--radius);
      border: 2px solid rgba(212, 168, 67, 0.2);
      background: rgba(61, 51, 43, 0.4);
      cursor: pointer;
      text-align: center;
      transition: all var(--transition);
      color: var(--earth-300);
      font-family: inherit;
    }

    .login__role-btn:hover {
      border-color: rgba(212, 168, 67, 0.5);
      background: rgba(61, 51, 43, 0.6);
      color: var(--earth-200);
    }

    .login__role-btn--active {
      border-color: var(--primary-300);
      background: rgba(196, 147, 40, 0.15);
      color: var(--primary-200);
      box-shadow: 0 0 0 1px rgba(212, 168, 67, 0.2);
    }

    .login__role-icon {
      display: block;
      font-size: 1.5rem;
      margin-bottom: var(--space-xs);
    }

    .login__role-label {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .login__role-desc {
      margin-bottom: var(--space-lg);
      padding: var(--space-md) var(--space-lg);
      background: rgba(61, 51, 43, 0.35);
      border-radius: var(--radius);
      border: 1px solid rgba(212, 168, 67, 0.1);
    }

    .login__role-desc p {
      color: var(--earth-300);
      font-size: 0.8rem;
      line-height: 1.6;
      margin: 0;
    }

    .login__btn {
      width: 100%;
      padding: var(--space-md) var(--space-lg);
      background: linear-gradient(135deg, var(--primary-300), var(--primary-500));
      border: none;
      border-radius: var(--radius);
      color: var(--earth-900);
      font-size: 1rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(196, 147, 40, 0.35);
      transition: transform var(--transition), box-shadow var(--transition);
    }

    .login__btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 28px rgba(196, 147, 40, 0.4);
    }

    .login__btn:focus-visible {
      outline: 2px solid var(--primary-200);
      outline-offset: 2px;
    }

    .login__hint {
      text-align: center;
      color: var(--earth-500);
      font-size: 0.75rem;
      margin: var(--space-lg) 0 0;
      font-style: italic;
    }
    .login__verif-link {
      text-align: center;
      margin: var(--space-md) 0 0;
      font-size: 0.8rem;
    }
    .login__verif-link a {
      color: var(--primary-200);
      text-decoration: none;
      font-weight: 500;
    }
    .login__verif-link a:hover { text-decoration: underline; }

    @media (max-width: 480px) {
      .login {
        padding: var(--space-md);
      }

      .login__card {
        padding: var(--space-xl) var(--space-lg);
      }

      .login__roles {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LoginComponent {
  roles = [Role.GOUVERNEMENT, Role.MINEUR, Role.COMMERÇANT, Role.TRANSPORTEUR];
  selectedRole: Role = Role.GOUVERNEMENT;

  roleDescriptions: Record<Role, string> = {
    [Role.GOUVERNEMENT]: 'Tableau de bord national, licences, audit, acteurs, alertes, supervision des lots et certificats.',
    [Role.MINEUR]:       'Déclarer vos productions et suivre vos lots jusqu\'à la certification.',
    [Role.COMMERÇANT]:   'Consulter les lots certifiés disponibles à l\'achat et vérifier les certificats.',
    [Role.TRANSPORTEUR]: 'Suivre les lots en transit qui vous sont assignés et mettre à jour les livraisons.',
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  meta(role: Role) {
    return ROLE_META[role];
  }

  selectRole(role: Role): void {
    this.selectedRole = role;
  }

  login(): void {
    this.authService.login(this.selectedRole);
    const dashboardRoute = this.authService.getDashboardRouteForRole(this.selectedRole);
    this.router.navigate([dashboardRoute]);
  }
}
