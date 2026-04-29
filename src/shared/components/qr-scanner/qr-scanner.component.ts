import { Component, Output, EventEmitter, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Scanner QR via la caméra (ZXing).
 * Émet le contenu scanné (URL ou identifiant de lot).
 */
@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './qr-scanner.component.html',
  styleUrls: ['./qr-scanner.component.scss']
})
export class QrScannerComponent implements OnDestroy {
  @Output() scanSuccess = new EventEmitter<string>();
  @ViewChild('videoEl') videoRef: ElementRef<HTMLVideoElement> | null = null;

  streamActive = false;
  scanning = false;
  error = '';

  private reader: any = null;
  private stream: MediaStream | null = null;

  async startScan(): Promise<void> {
    this.error = '';
    this.scanning = true;
    try {
      const lib = await import('@zxing/library');
      this.reader = new lib.BrowserMultiFormatReader();
      const devices = await this.reader.listVideoInputDevices();
      this.streamActive = true;
      this.scanning = false;
      // Laisser Angular rendre le <video> puis attacher le flux
      setTimeout(() => this.attachStream(devices), 100);
    } catch (e: any) {
      this.error = e?.message || 'Scanner indisponible.';
      this.scanning = false;
    }
  }

  private attachStream(devices: MediaDeviceInfo[]): void {
    const video = this.videoRef?.nativeElement;
    if (!this.reader || !video) {
      this.error = 'Élément vidéo indisponible.';
      this.streamActive = false;
      return;
    }
    const deviceId = devices.length > 0 ? devices[0].deviceId : undefined;
    this.reader
      .decodeFromVideoDevice(deviceId, video, (result: any) => {
        if (result) this.onDecoded(result.getText());
      })
      .then(() => {
        this.stream = video.srcObject as MediaStream | null;
      })
      .catch((e: any) => {
        this.error = e?.message || 'Impossible d\'accéder à la caméra. Vérifiez les autorisations.';
        this.streamActive = false;
      });
  }

  private onDecoded(text: string): void {
    let lotId = text;
    try {
      if (text.startsWith('http') && text.includes('verifier')) {
        const u = new URL(text);
        lotId = u.searchParams.get('id') || text;
      }
    } catch {}
    this.scanSuccess.emit(lotId.trim());
    this.stopScan();
  }

  stopScan(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    this.streamActive = false;
    this.reader = null;
  }

  ngOnDestroy(): void {
    this.stopScan();
  }
}
