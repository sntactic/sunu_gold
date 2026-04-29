import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { NavigationService, NavItem } from '../services/navigation.service';
import { User, ROLE_META } from '../models/user.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLinkActive],
  template: `
    <aside class="sidebar" role="navigation" aria-label="Navigation principale">
      <div class="sidebar__header">
        <div class="sidebar__logo" aria-hidden="true">
          <span class="material-icons-round">diamond</span>
        </div>
        <div class="sidebar__brand">
          <span class="sidebar__title">SunuGOLD</span>
          <span class="sidebar__role" [style.color]="roleMeta?.color">
            <span class="material-icons-round sidebar__role-icon" aria-hidden="true">{{ roleMeta?.icon }}</span>
            {{ roleMeta?.label }}
          </span>
        </div>
      </div>

      <nav class="sidebar__nav">
        <a
          *ngFor="let item of navItems"
          [routerLink]="[item.route]"
          routerLinkActive="sidebar__nav-item--active"
          class="sidebar__nav-item"
        >
          <span class="material-icons-round sidebar__nav-icon">{{ getIconName(item.icon) }}</span>
          <span class="sidebar__nav-label">{{ item.label }}</span>
          <span *ngIf="item.badgeCount > 0" class="sidebar__nav-badge">{{ item.badgeCount }}</span>
        </a>

      </nav>

      <div class="sidebar__bottom" *ngIf="currentUser">
        <div class="sidebar__user">
          <div class="sidebar__avatar" [attr.aria-hidden]="true">{{ currentUser.avatar }}</div>
          <div class="sidebar__user-info">
            <span class="sidebar__user-name">{{ currentUser.name }}</span>
            <span class="sidebar__user-email">{{ currentUser.email }}</span>
          </div>
        </div>
        <button class="sidebar__logout" (click)="logout()" type="button" aria-label="Se déconnecter">
          <span class="material-icons-round">logout</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    :host { display: block; }

    .sidebar {
      width: 280px;
      min-width: 280px;
      height: 100vh;
      background: var(--earth-900);
      border-right: 1px solid rgba(212, 168, 67, 0.08);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      transition: transform var(--transition), box-shadow var(--transition);
    }

    .sidebar__header {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-lg) var(--space-lg) var(--space-xl);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .sidebar__logo {
      width: 44px;
      height: 44px;
      border-radius: var(--radius);
      background: linear-gradient(135deg, var(--primary-300), var(--primary-500));
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--earth-900);
      flex-shrink: 0;
      box-shadow: var(--shadow);
    }

    .sidebar__logo .material-icons-round {
      font-size: 24px;
    }

    .sidebar__title {
      font-family: 'Playfair Display', serif;
      font-size: 1.35rem;
      font-weight: 600;
      color: var(--primary-200);
      display: block;
      letter-spacing: -0.02em;
    }

    .sidebar__role {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 600;
      display: block;
      margin-top: 2px;
      opacity: 0.9;
    }

    .sidebar__nav {
      padding: var(--space-md);
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }

    .sidebar__nav-item {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-sm) var(--space-md);
      border-radius: var(--radius-sm);
      color: var(--earth-300);
      font-size: 0.9rem;
      font-weight: 500;
      text-decoration: none;
      transition: background var(--transition), color var(--transition);
    }

    .sidebar__nav-item:hover {
      background: rgba(212, 168, 67, 0.08);
      color: var(--earth-100);
    }

    .sidebar__nav-item--active {
      background: rgba(212, 168, 67, 0.14);
      color: var(--primary-200);
    }

    .sidebar__nav-item--active .sidebar__nav-icon {
      color: var(--primary-300);
    }

    .sidebar__nav-icon {
      font-size: 22px;
      width: 28px;
      text-align: center;
      color: var(--earth-500);
      transition: color var(--transition);
      flex-shrink: 0;
    }

    .sidebar__nav-item:hover .sidebar__nav-icon {
      color: var(--earth-200);
    }

    .sidebar__bottom {
      padding: var(--space-md);
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }

    .sidebar__user {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-sm) var(--space-md);
      border-radius: var(--radius-sm);
      margin-bottom: var(--space-sm);
    }

    .sidebar__avatar {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-sm);
      background: linear-gradient(135deg, var(--primary-400), var(--primary-600));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--earth-900);
      flex-shrink: 0;
    }

    .sidebar__user-name {
      font-size: 0.85rem;
      color: var(--earth-200);
      font-weight: 500;
      display: block;
    }

    .sidebar__user-email {
      font-size: 0.7rem;
      color: var(--earth-500);
      display: block;
    }

    .sidebar__logout {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-sm);
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: var(--earth-400);
      padding: var(--space-sm) var(--space-md);
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      font-family: inherit;
      cursor: pointer;
      transition: background var(--transition), color var(--transition);
    }

    .sidebar__logout:hover {
      background: rgba(198, 40, 40, 0.15);
      color: #ef9a9a;
    }

    .sidebar__logout .material-icons-round {
      font-size: 20px;
    }

    @media (max-width: 960px) {
      .sidebar {
        width: 72px;
        min-width: 72px;
      }

      .sidebar__brand,
      .sidebar__nav-label,
      .sidebar__user-info,
      .sidebar__logout span:not(.material-icons-round) {
        display: none !important;
      }

      .sidebar__header {
        justify-content: center;
        padding: var(--space-md);
      }

      .sidebar__nav-item {
        justify-content: center;
        padding: var(--space-md);
      }

      .sidebar__nav-icon {
        margin: 0;
      }

      .sidebar__user {
        justify-content: center;
      }

      .sidebar__logout {
        padding: var(--space-md);
      }
    }
  `]
})
export class SidebarComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  navItems: NavItem[] = [];
  roleMeta: { label: string; icon: string; color: string } | null = null;

  private sub = new Subscription();

  constructor(
    private authService: AuthService,
    private navigationService: NavigationService
  ) {}

  ngOnInit(): void {
    this.sub.add(
      this.authService.user$.subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.navItems = this.navigationService.getNavItemsForRole(user.role);
          this.roleMeta = ROLE_META[user.role];
        }
      })
    );
  }

  getIconName(icon: string): string {
    const map: Record<string, string> = {
      dashboard: 'dashboard',
      verifier: 'verified_user',
      lots: 'inventory_2',
      declaration: 'add_circle',
      transit: 'local_shipping',
      history: 'history',
      certification: 'verified',
      licences: 'gavel',
      acteurs: 'groups',
      alertes: 'notifications_active'
    };
    return map[icon] || 'circle';
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
