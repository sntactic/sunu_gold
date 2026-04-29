import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Page Licences & Audit pour le gouvernement (document SunuGOLD : douanes et gouvernement
 * « délivrent les licences, collectent les taxes et disposent d'outils d'audit »).
 */
@Component({
  selector: 'app-licences-audit',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="licences">
      <h1 class="licences__title">Licences & Audit</h1>
      <p class="licences__intro">Gestion des licences d'export et journal d'audit des opérations sur la plateforme.</p>

      <section class="licences__section card">
        <h2 class="licences__heading">
          <span class="material-icons-round">badge</span>
          Licences délivrées
        </h2>
        <div class="licences__table-wrap">
          <table class="licences__table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Bénéficiaire</th>
                <th>Type</th>
                <th>Date émission</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let l of licences">
                <td>{{ l.ref }}</td>
                <td>{{ l.beneficiaire }}</td>
                <td>{{ l.type }}</td>
                <td>{{ l.date }}</td>
                <td><span class="licences__badge" [class.licences__badge--active]="l.actif">{{ l.actif ? 'Active' : 'Expirée' }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="licences__section card">
        <h2 class="licences__heading">
          <span class="material-icons-round">history</span>
          Journal d'audit
        </h2>
        <ul class="licences__audit-list">
          <li *ngFor="let e of auditEntries" class="licences__audit-item">
            <span class="licences__audit-time">{{ e.time }}</span>
            <span class="licences__audit-action">{{ e.action }}</span>
            <span class="licences__audit-actor">{{ e.actor }}</span>
          </li>
        </ul>
      </section>
    </div>
  `,
  styles: [`
    .licences { padding: var(--space-xl); max-width: 1000px; }

    .licences__title { font-size: 1.75rem; color: var(--earth-100); margin: 0 0 var(--space-sm); }
    .licences__intro { color: var(--earth-400); font-size: 0.95rem; margin: 0 0 var(--space-2xl); }

    .card {
      background: var(--earth-800);
      border: 1px solid rgba(212, 168, 67, 0.1);
      border-radius: var(--radius-lg);
      padding: var(--space-xl);
      margin-bottom: var(--space-xl);
    }

    .licences__heading {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      font-size: 1.1rem;
      color: var(--primary-200);
      margin: 0 0 var(--space-lg);
    }

    .licences__heading .material-icons-round { font-size: 22px; color: var(--primary-400); }

    .licences__table-wrap { overflow-x: auto; }
    .licences__table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    .licences__table th,
    .licences__table td { padding: var(--space-sm) var(--space-md); text-align: left; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .licences__table th { color: var(--earth-400); font-weight: 600; }
    .licences__table td { color: var(--earth-200); }
    .licences__badge { padding: 2px 8px; border-radius: var(--radius-sm); font-size: 0.8rem; background: var(--earth-600); color: var(--earth-400); }
    .licences__badge--active { background: rgba(76, 175, 80, 0.2); color: var(--green-400); }

    .licences__audit-list { list-style: none; padding: 0; margin: 0; }
    .licences__audit-item {
      display: grid;
      grid-template-columns: 120px 1fr auto;
      gap: var(--space-md);
      padding: var(--space-sm) 0;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      font-size: 0.9rem;
    }
    .licences__audit-time { color: var(--earth-500); }
    .licences__audit-action { color: var(--earth-200); }
    .licences__audit-actor { color: var(--earth-400); }
  `]
})
export class LicencesAuditComponent {
  licences = [
    { ref: 'LIC-EXP-2026-001', beneficiaire: 'Sabodala Refining Co.', type: 'Export or', date: '30/01/2026', actif: true },
    { ref: 'LIC-EXP-2026-002', beneficiaire: 'Raffinerie Dakar S.A.', type: 'Export or', date: '28/01/2026', actif: true },
    { ref: 'LIC-EXP-2025-089', beneficiaire: 'Coop. Mako', type: 'Export or', date: '15/12/2025', actif: false },
  ];

  auditEntries = [
    { time: '02/02/2026 14:32', action: 'Émission certificat CERT-SG-2026-0215 pour lot #LOT-2026-0847', actor: 'Admin Dakar' },
    { time: '02/02/2026 11:20', action: 'Consultation journal d\'audit', actor: 'Admin Dakar' },
    { time: '02/02/2026 09:15', action: 'Validation licence LIC-EXP-2026-002', actor: 'Douanes' },
    { time: '01/02/2026 16:45', action: 'Nouvelle déclaration production — J. Diallo, Kédougou, 12.4 kg', actor: 'Système' },
    { time: '01/02/2026 10:00', action: 'Connexion rôle Gouvernement', actor: 'Admin Dakar' },
  ];
}
