import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login.component';
import { VerificationComponent } from './features/verification/verification.component';
import { ShellComponent } from './core/layout/shell.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LotsListComponent } from './features/lots/lots-list.component';
import { LotDetailComponent } from './features/lots/lot-detail.component';
import { CertificationListComponent } from './features/certification/certification-list.component';
import { LicencesAuditComponent } from './features/licences/licences-audit.component';
import { ActeursListComponent } from './features/acteurs/acteurs-list.component';
import { ActeurDetailComponent } from './features/acteurs/acteur-detail.component';
import { AlertesListComponent } from './features/alertes/alertes-list.component';
import { DeclarationWizardComponent } from './features/declaration/declaration-wizard.component';
import { HistoriqueComponent } from './features/historique/historique.component';
import { TransitDeclarerComponent } from './features/transit/transit-declarer.component';
import { RapportMensuelComponent } from './features/rapports/rapport-mensuel.component';

/**
 * Routes de l'application
 * ─────────────────────────
 * - /login           → Page publique (pas de guard)
 * - /                → Routes protégées par AuthGuard
 *                       └── Layout global via ShellComponent (sidebar + topbar)
 *                           └── Chaque feature charge son composant via children
 *
 * Pour ajouter une nouvelle page :
 *   1. Créer le composant dans features/
 *   2. Ajouter une route dans children ci-dessous
 *   3. Ajouter un NavItem dans navigation.service.ts
 */
export const appRoutes: Routes = [
  // Routes publiques (sans auth)
  { path: 'login', component: LoginComponent },
  { path: 'verifier', component: VerificationComponent },

  // Routes protégées — wrappées dans ShellComponent
  {
    path: '',
    component: ShellComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '',              component: DashboardComponent, pathMatch: 'full' },
      { path: 'dashboard',     component: DashboardComponent },
      { path: 'lots',          component: LotsListComponent },
      { path: 'lots/declarer', component: DeclarationWizardComponent },
      { path: 'lots/:id',      component: LotDetailComponent },
      { path: 'certification', component: CertificationListComponent },
      { path: 'licences',      component: LicencesAuditComponent },
      { path: 'acteurs',       component: ActeursListComponent },
      { path: 'acteurs/:id',   component: ActeurDetailComponent },
      { path: 'historique',    component: HistoriqueComponent },
      { path: 'transit/declarer', component: TransitDeclarerComponent },
      { path: 'rapports/mois/:mois', component: RapportMensuelComponent },
      { path: 'alertes',       component: AlertesListComponent },
    ]
  },

  { path: '**', redirectTo: 'dashboard' }
];
