import { Role } from './user.model';

export enum KycStatus {
  VERIFIED = 'verified',
  PENDING  = 'pending',
  REJECTED = 'rejected'
}

export interface Acteur {
  id: string;
  name: string;
  role: Role;
  subtitle: string;     // ex: 'Mineur indépendant', 'Coopérative minière'
  region: string;
  kyc: KycStatus;
  activeLots: number;
  lastActivity: string; // label relatif: 'Aujourd\'hui', 'Hier', etc.
  // Informations personnelles (page détail)
  phone?: string;
  email?: string;
  address?: string;
  registeredAt?: string; // date d'inscription
}
