import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Role, User } from '../models/user.model';

/**
 * AuthService
 * -----------
 * Responsabilités :
 *   1. Gérer l'état de connexion (connecté / déconnecté)
 *   2. Stocker l'utilisateur actif avec son rôle
 *   3. Exposer ces données comme des Observables pour que
 *      tous les composants puissent réagir en temps réel
 *
 * En production, login() appellerait une API REST.
 * Ici on simule avec des données mock.
 */

/** Simulated user database — un jour ce sera l'API */
const MOCK_USERS: Record<Role, User> = {
  [Role.GOUVERNEMENT]: {
    id: 'gov-001',
    name: 'Admin Dakar',
    email: 'admin@sunugold.sn',
    role: Role.GOUVERNEMENT,
    region: 'Dakar',
    avatar: 'AD'
  },
  [Role.MINEUR]: {
    id: 'mineur-001',
    name: 'Jean-Baptiste Diallo',
    email: 'jb.diallo@sunugold.sn',
    role: Role.MINEUR,
    region: 'Kédougou',
    avatar: 'JD'
  },
  [Role.COMMERÇANT]: {
    id: 'commerce-001',
    name: 'Ibrahima Touré',
    email: 'i.toure@sunugold.sn',
    role: Role.COMMERÇANT,
    region: 'Dakar',
    avatar: 'IT'
  },
  [Role.TRANSPORTEUR]: {
    id: 'transport-001',
    name: 'Samba Kouyaté',
    email: 's.kouyate@sunugold.sn',
    role: Role.TRANSPORTEUR,
    region: 'Dakar',
    avatar: 'SK'
  }
};

@Injectable({ providedIn: 'root' })
export class AuthService {
    /**
     * Retourne la route du dashboard selon le rôle
     */
    getDashboardRouteForRole(role: Role): string {
      return '/dashboard';
    }
  /** Utilisateur connecté — null si pas de session */
  private currentUser$ = new BehaviorSubject<User | null>(null);

  /** Observable publiquement lisible (pas d'écriture externe) */
  readonly user$: Observable<User | null> = this.currentUser$.asObservable();

  /** Connexion simulée : on choisit l'utilisateur selon le rôle sélectionné */
  login(role: Role): void {
    const user = MOCK_USERS[role];
    this.currentUser$.next(user);
  }

  /** Déconnexion — réinitialise l'état */
  logout(): void {
    this.currentUser$.next(null);
  }

  /** Raccourci synchrone pour les guards — vérifie si quelqu'un est connecté */
  isAuthenticated(): boolean {
    return this.currentUser$.getValue() !== null;
  }

  /** Raccourci synchrone pour récupérer l'utilisateur courant */
  getCurrentUser(): User | null {
    return this.currentUser$.getValue();
  }
}
