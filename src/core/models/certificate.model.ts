export enum CertificateStatus {
  VALID   = 'valid',
  EXPIRED = 'expired',
  PENDING = 'pending'
}

export const CERT_STATUS_META: Record<CertificateStatus, { label: string; cssClass: string }> = {
  [CertificateStatus.VALID]:   { label: 'Valide',  cssClass: 'certified' },
  [CertificateStatus.EXPIRED]: { label: 'Expiré',  cssClass: 'alerte' },
  [CertificateStatus.PENDING]: { label: 'En cours', cssClass: 'en-attente' }
};

export interface Certificate {
  id: string;
  lotId: string;
  orpailleurId: string;     // pour filtrer "mes certificats" (mineur)
  lotRegion: string;
  lotPoids: number;         // kg
  orpailleurName: string;
  emissionDate: string;
  expirationDate: string;
  status: CertificateStatus;
  qrCode: string;            // même QR que le lot — vérifié par les acheteurs internationaux
}
