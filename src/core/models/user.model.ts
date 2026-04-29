export enum Role {
  GOUVERNEMENT = 'gouvernement',
  MINEUR       = 'mineur',
  COMMERÇANT   = 'commerçant',
  TRANSPORTEUR = 'transporteur'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  region: string;
  avatar: string; // initiales ex: 'AD'
}

/** Métadonnées d'affichage par rôle — icônes Material (professionnelles), utilisées par Sidebar et Login */
export const ROLE_META: Record<Role, { label: string; icon: string; color: string }> = {
  [Role.GOUVERNEMENT]: { label: 'Gouvernement', icon: 'account_balance', color: '#D4A843' },
  [Role.MINEUR]:       { label: 'Orpailleur',   icon: 'engineering', color: '#E8960C' },
  [Role.COMMERÇANT]:   { label: 'Commerçant',   icon: 'store', color: '#2E7DB8' },
  [Role.TRANSPORTEUR]: { label: 'Transporteur', icon: 'local_shipping', color: '#7C4DFF' }
};
