export enum AlertLevel {
  HIGH   = 'high',
  MEDIUM = 'medium',
  LOW    = 'low'
}

export const ALERT_LEVEL_META: Record<AlertLevel, { label: string; color: string }> = {
  [AlertLevel.HIGH]:   { label: 'Haute',    color: '#D64045' },
  [AlertLevel.MEDIUM]: { label: 'Moyenne',  color: '#E8960C' },
  [AlertLevel.LOW]:    { label: 'Faible',   color: '#2E7DB8' }
};

export interface Alert {
  id: string;
  level: AlertLevel;
  title: string;
  description: string;
  lotId?: string;       // lié optionnellement à un lot
  createdAt: string;    // timestamp ISO ou label relatif
  read: boolean;
}
