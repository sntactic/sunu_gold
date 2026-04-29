import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TraceStep } from 'core/models/lot.model';

/** Icônes Material par étape (extraction, transport, certification, export) */
const STEP_ICONS: Record<string, string> = {
  'Extraction': 'landscape',
  'Transport': 'local_shipping',
  'Certification': 'verified',
  'Export': 'flight_takeoff',
  'Vente': 'shopping_cart',
};

@Component({
  selector: 'app-lot-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lot-timeline.component.html',
  styleUrls: ['./lot-timeline.component.scss']
})
export class LotTimelineComponent {
  @Input() trace: TraceStep[] = [];
  @Input() compact = false;

  getIcon(etape: string): string {
    return STEP_ICONS[etape] || 'circle';
  }
}
