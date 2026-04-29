import { Component, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Acteur } from 'core/models/acteur.model';
import { Lot } from 'core/models/lot.model';
import { Role } from 'core/models/user.model';

/** Coordonnées approximatives des régions (Sénégal) pour la carte */
/** Zones de concentration aurifère (recherche : Sabodala, Mako, Kédougou, etc.) */
const REGION_COORDS: Record<string, [number, number]> = {
  'Kédougou': [12.55, -12.18],
  'Sabodala': [12.82, -12.05],
  'Mako': [12.72, -12.38],
  'Dakar': [14.72, -17.47],
  'Thiès': [14.78, -16.95],
  'Tambacounda': [13.77, -13.67],
  'Ziguinchor': [12.58, -16.27],
  'Autre': [14.5, -15.5]
};
const DEFAULT_COORDS: [number, number] = [14.5, -15.5];
/** Espacement en degrés entre marqueurs (évite le chevauchement) */
const MARKER_STEP_LAT = 0.14;
const MARKER_STEP_LNG = 0.18;
const COLS_PER_REGION = 4;

@Component({
  selector: 'app-senegal-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './senegal-map.component.html',
  styleUrls: ['./senegal-map.component.scss']
})
export class SenegalMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() acteurs: Acteur[] = [];
  @Input() lots: Lot[] = [];
  @Input() showLiveBadge = true;
  @Input() regionStats: { region: string; kg: number; acteurs: number; lotsTransit: number }[] = [];
  @ViewChild('mapContainer') mapContainerRef!: ElementRef<HTMLDivElement>;

  private map: any = null;
  private markers: any[] = [];

  ngAfterViewInit(): void {
    this.initMap();
    this.updateMarkers();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.map && (changes['acteurs'] || changes['lots'])) {
      this.updateMarkers();
    }
  }

  ngOnDestroy(): void {
    this.clearMarkers();
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private initMap(): void {
    const el = this.mapContainerRef?.nativeElement;
    if (!el || typeof window === 'undefined') return;
    import('leaflet').then(leaflet => {
      const L = leaflet;
      this.map = L.map(el).setView([14.5, -15.5], 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(this.map);
      this.updateMarkers();
    });
  }

  /** Répartit les marqueurs en grille pour éviter qu’ils se superposent */
  private getCoordsForActeur(acteur: Acteur, indexInRegion: number): [number, number] {
    const base = REGION_COORDS[acteur.region] || DEFAULT_COORDS;
    const col = indexInRegion % COLS_PER_REGION;
    const row = Math.floor(indexInRegion / COLS_PER_REGION);
    const lat = base[0] + row * MARKER_STEP_LAT;
    const lng = base[1] + col * MARKER_STEP_LNG;
    return [lat, lng];
  }

  private getMarkerColor(role: Role): string {
    switch (role) {
      case Role.MINEUR: return '#E8960C';
      case Role.COMMERÇANT: return '#2E7DB8';
      case Role.TRANSPORTEUR: return '#7C4DFF';
      default: return '#6B5B4E';
    }
  }

  private updateMarkers(): void {
    this.clearMarkers();
    if (!this.map || typeof window === 'undefined') return;
    import('leaflet').then(leaflet => {
      const L = leaflet;
      const regionCount: Record<string, number> = {};
      this.acteurs.forEach(acteur => {
        const key = acteur.region;
        regionCount[key] = (regionCount[key] || 0);
        const coords = this.getCoordsForActeur(acteur, regionCount[key]++);
        const color = this.getMarkerColor(acteur.role);
        const icon = L.divIcon({
          className: 'senegal-map-marker',
          html: `<span style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.3);display:block;"></span>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });
        const regionStats = this.regionStats.find(rs => rs.region === acteur.region);
        const statsLine = regionStats ? ` · ${regionStats.kg} kg, ${regionStats.acteurs} acteur(s), ${regionStats.lotsTransit} en transit` : '';
        const marker = L.marker(coords, { icon })
          .bindPopup(`<strong>${acteur.name}</strong><br/>${acteur.subtitle}<br/>${acteur.region}${statsLine}<br/><small>${acteur.id}</small>`);
        marker.addTo(this.map!);
        this.markers.push(marker);
      });
    });
  }

  private clearMarkers(): void {
    this.markers.forEach(m => m.remove());
    this.markers = [];
  }
}
