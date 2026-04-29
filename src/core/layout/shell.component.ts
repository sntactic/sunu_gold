import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { TopbarComponent } from './topbar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, TopbarComponent],
  template: `
    <div class="shell">
      <app-sidebar></app-sidebar>
      <div class="shell__main">
        <app-topbar></app-topbar>
        <main class="shell__content" role="main">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; }

    .shell {
      display: flex;
      height: 100vh;
      background: var(--earth-50);
    }

    .shell__main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-width: 0;
    }

    .shell__content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: var(--space-xl) var(--space-xl) var(--space-3xl);
      animation: shellFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes shellFadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 960px) {
      .shell__content {
        padding: var(--space-lg) var(--space-md) var(--space-2xl);
      }
    }
  `]
})
export class ShellComponent {}
