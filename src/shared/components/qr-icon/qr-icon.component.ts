import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QRCodeModule } from 'angularx-qrcode';

/**
 * Affiche un vrai QR code (encodant l’URL de vérification du lot).
 * Clic : ouvre un overlay avec le QR en grand et un bouton Fermer.
 */
@Component({
  selector: 'app-qr-icon',
  standalone: true,
  imports: [CommonModule, QRCodeModule],
  templateUrl: './qr-icon.component.html',
  styleUrls: ['./qr-icon.component.scss']
})
export class QrIconComponent {
  @Input() lotId: string = '';
  @Output() onClick = new EventEmitter<string>();

  showOverlay = false;

  get verificationUrl(): string {
    if (typeof window !== 'undefined') {
      return window.location.origin + '/verifier?id=' + encodeURIComponent(this.lotId || '');
    }
    return '/verifier?id=' + encodeURIComponent(this.lotId || '');
  }

  openOverlay(): void {
    this.showOverlay = true;
    this.onClick.emit(this.lotId);
  }

  closeOverlay(): void {
    this.showOverlay = false;
  }
}
