import { Role } from './user.model';

export enum LotStatus {
  EN_ATTENTE  = 'en-attente',
  EN_TRANSIT  = 'en-transit',
  CERTIFIED   = 'certified',
  VENDU       = 'vendu',
  ALERTE      = 'alerte'
}

export const LOT_STATUS_META: Record<LotStatus, { label: string; cssClass: string }> = {
  [LotStatus.EN_ATTENTE]:  { label: 'En attente',  cssClass: 'en-attente' },
  [LotStatus.EN_TRANSIT]:  { label: 'En transit',  cssClass: 'en-transit' },
  [LotStatus.CERTIFIED]:   { label: 'Certifié',    cssClass: 'certified' },
  [LotStatus.VENDU]:       { label: 'Vendu',       cssClass: 'vendu' },
  [LotStatus.ALERTE]:      { label: 'Alerte',      cssClass: 'alerte' }
};

/** Représente une étape dans la chaîne de traçabilité */
export interface TraceStep {
  etape: string;        // ex: 'Extraction', 'Transport', 'Certification', 'Export'
  completed: boolean;
  date?: string;
  acteur?: string;
}

export interface Lot {
  id: string;
  region: string;
  orpailleurId: string;   // lié à un User (role = MINEUR)
  orpailleurName: string;
  transporteurId?: string;
  transporteurName?: string;
  poids: number;          // en kg
  status: LotStatus;
  progression: number;    // 0–100 : avancement dans la chaîne
  trace: TraceStep[];     // historique détaillé
  date: string;           // date de création
  qrCode: string;         // identifiant unique pour le QR
  certificateId?: string;
  verifications?: LotVerification[]; // traçabilité des vérifications (optionnel)
  metadata?: {
    origin: string;
    purity: number;      // pourcentage d'or pur
    lastVerifiedAt?: string;
    verifiedBy?: string;
  };
}

export interface LotVerification {
  id: string;
  lotId: string;
  verifierId: string;
  verifierName: string;
  verifierRole: Role;
  timestamp: string;
  status: 'approved' | 'rejected' | 'pending';
  notes?: string;
  photos?: string[];    // URLs des photos de vérification
}

/** Filtre appliqué selon le rôle de l'utilisateur connecté */
export function filterLotsForRole(lots: Lot[], role: Role, userId: string): Lot[] {
  switch (role) {
    case Role.GOUVERNEMENT:
      return lots; // voit tout

    case Role.MINEUR:
      return lots.filter(l => l.orpailleurId === userId);

    case Role.COMMERÇANT:
      return lots.filter(l => l.status === LotStatus.CERTIFIED);

    case Role.TRANSPORTEUR:
      return lots.filter(l => l.transporteurId === userId && l.status === LotStatus.EN_TRANSIT);
  }
  return lots;
}
