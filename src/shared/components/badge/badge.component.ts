import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeType = 'certified' | 'en-transit' | 'en-attente' | 'alerte' | 'valid' | 'expired' | 'bloque' | 'vendu';

const BADGE_LABELS: Record<BadgeType, string> = {
  'certified':  'Certifié',
  'en-transit': 'En transit',
  'en-attente': 'En attente',
  'alerte':     'Alerte',
  'valid':      'Valide',
  'expired':    'Expiré',
  'bloque':     'Bloqué',
  'vendu':      'Vendu'
};

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss']
})
export class BadgeComponent {
  @Input() type: BadgeType = 'certified';

  get label(): string {
    return BADGE_LABELS[this.type];
  }
}
