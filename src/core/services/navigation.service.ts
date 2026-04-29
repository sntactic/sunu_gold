import { Injectable } from '@angular/core';
import { Role } from '../models/user.model';

export interface NavItem {
  label: string;
  icon: string;        // nom du svg inline à utiliser
  route: string;
  visibleForRoles: Role[];  // quels rôles peuvent voir cet item
  badgeCount?: number; // nombre de notifications (optionnel)
}

/**
 * Navigation stricte par rôle : chaque profil ne voit que les entrées qui lui sont destinées.
 * - Gouvernement : tout sauf déclaration
 * - Orpailleur : dashboard, vérifier, lots, déclaration, certification
 * - Commerçant : dashboard, vérifier, lots, certification
 * - Transporteur : dashboard, vérifier, lots uniquement
 */
const NAV_ITEMS: NavItem[] = [
  { label: 'Tableau de bord', icon: 'dashboard', route: '/dashboard', visibleForRoles: [Role.GOUVERNEMENT, Role.MINEUR, Role.COMMERÇANT, Role.TRANSPORTEUR] },
  { label: 'Vérifier un lot', icon: 'verifier', route: '/verifier', visibleForRoles: [Role.GOUVERNEMENT, Role.MINEUR, Role.COMMERÇANT, Role.TRANSPORTEUR] },
  { label: 'Suivi des lots', icon: 'lots', route: '/lots', visibleForRoles: [Role.GOUVERNEMENT, Role.MINEUR, Role.COMMERÇANT, Role.TRANSPORTEUR] },
  { label: 'Déclarer une production', icon: 'declaration', route: '/lots/declarer', visibleForRoles: [Role.MINEUR] },
  { label: 'Déclarer un transit', icon: 'transit', route: '/transit/declarer', visibleForRoles: [Role.TRANSPORTEUR] },
  { label: 'Mon historique', icon: 'history', route: '/historique', visibleForRoles: [Role.MINEUR, Role.COMMERÇANT, Role.TRANSPORTEUR] },
  { label: 'Certification', icon: 'certification', route: '/certification', visibleForRoles: [Role.GOUVERNEMENT, Role.MINEUR, Role.COMMERÇANT] },
  { label: 'Licences & Audit', icon: 'licences', route: '/licences', visibleForRoles: [Role.GOUVERNEMENT] },
  { label: 'Acteurs', icon: 'acteurs', route: '/acteurs', visibleForRoles: [Role.GOUVERNEMENT] },
  { label: 'Alertes', icon: 'alertes', route: '/alertes', visibleForRoles: [Role.GOUVERNEMENT] }
];

@Injectable({ providedIn: 'root' })
export class NavigationService {
  /**
   * Retourne uniquement les NavItems autorisés pour un rôle donné.
   * Appelé par SidebarComponent à chaque changement d'utilisateur.
   */
  getNavItemsForRole(role: Role): NavItem[] {
    return NAV_ITEMS.filter(item => item.visibleForRoles.includes(role));
  }
}
