import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatCardVariant = 'gold' | 'green' | 'blue' | 'amber';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.component.html',
  styleUrls: ['./stat-card.component.scss']
})
export class StatCardComponent {
  @Input() variant: StatCardVariant = 'gold';
  @Input() value: string = '';
  @Input() unit: string = '';
  @Input() label: string = '';
  @Input() trendValue: string = '';
  @Input() trendDirection: 'up' | 'down' = 'up';
}
