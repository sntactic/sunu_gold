import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * AuthGuard
 * ---------
 * Protège les routes qui nécessitent une authentification.
 * Si l'utilisateur n'est pas connecté, il est redirigé vers /login.
 *
 * Usage dans les routes :
 *   { path: 'dashboard', component: ..., canActivate: [AuthGuard] }
 */
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
