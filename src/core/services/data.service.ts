import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, delay } from 'rxjs/operators';

import { Lot, LotStatus, filterLotsForRole } from '../models/lot.model';
import { Certificate, CertificateStatus } from '../models/certificate.model';
import { Alert, AlertLevel } from '../models/alert.model';
import { Acteur, KycStatus } from '../models/acteur.model';
import { Role } from '../models/user.model';
import { TransitDeclaration } from '../models/transit.model';
import { AuthService } from './auth.service';
import { Transaction, TransactionType, filterTransactionsForRole } from '../models/transaction.model';

// ═══════════════════════════════════════════════════════════
// DONNÉES MOCK — En production, ces tableaux seraient remplacés
// par des appels HTTP vers l'API back-end.
// ═══════════════════════════════════════════════════════════

const LOTS: Lot[] = [
  {
    id: '#LOT-2026-0847', region: 'Kédougou',
    orpailleurId: 'mineur-001', orpailleurName: 'Jean-Baptiste Diallo',
    transporteurId: 'transport-001', transporteurName: 'Samba Kouyaté',
    poids: 12.4, status: LotStatus.CERTIFIED, progression: 100,
    date: '31/01/2026', qrCode: 'QR-LOT-0847',
    trace: [
      { etape: 'Extraction',     completed: true,  date: '28/01/2026', acteur: 'J. Diallo' },
      { etape: 'Transport',      completed: true,  date: '29/01/2026', acteur: 'S. Kouyaté' },
      { etape: 'Certification',  completed: true,  date: '30/01/2026', acteur: 'Autorités' },
      { etape: 'Export',         completed: true,  date: '31/01/2026', acteur: 'Douanes' }
    ]
  },
  {
    id: '#LOT-2026-0846', region: 'Kédougou',
    orpailleurId: 'mineur-002', orpailleurName: 'Coopérative Sabodala',
    transporteurId: 'transport-001', transporteurName: 'Samba Kouyaté',
    poids: 8.1, status: LotStatus.EN_TRANSIT, progression: 65,
    date: '30/01/2026', qrCode: 'QR-LOT-0846',
    trace: [
      { etape: 'Extraction',     completed: true,  date: '28/01/2026', acteur: 'Coop. Sabodala' },
      { etape: 'Transport',      completed: false },
      { etape: 'Certification',  completed: false },
      { etape: 'Export',         completed: false }
    ]
  },
  {
    id: '#LOT-2026-0845', region: 'Kédougou',
    orpailleurId: 'mineur-001', orpailleurName: 'Jean-Baptiste Diallo',
    poids: 5.7, status: LotStatus.EN_ATTENTE, progression: 30,
    date: '29/01/2026', qrCode: 'QR-LOT-0845',
    trace: [
      { etape: 'Extraction',     completed: true,  date: '29/01/2026', acteur: 'J. Diallo' },
      { etape: 'Transport',      completed: false },
      { etape: 'Certification',  completed: false },
      { etape: 'Export',         completed: false }
    ]
  },
  {
    id: '#LOT-2026-0844', region: 'Thiès',
    orpailleurId: 'mineur-003', orpailleurName: 'Marie Diallo',
    transporteurId: 'transport-002', transporteurName: 'Amadou Fall',
    poids: 3.2, status: LotStatus.CERTIFIED, progression: 100,
    date: '28/01/2026', qrCode: 'QR-LOT-0844',
    trace: [
      { etape: 'Extraction',     completed: true,  date: '25/01/2026', acteur: 'M. Diallo' },
      { etape: 'Transport',      completed: true,  date: '26/01/2026', acteur: 'A. Fall' },
      { etape: 'Certification',  completed: true,  date: '27/01/2026', acteur: 'Autorités' },
      { etape: 'Export',         completed: true,  date: '28/01/2026', acteur: 'Douanes' }
    ]
  },
  {
    id: '#LOT-2026-0843', region: 'Dakar',
    orpailleurId: 'mineur-004', orpailleurName: 'Oumar Bah',
    poids: 18.9, status: LotStatus.ALERTE, progression: 45,
    date: '27/01/2026', qrCode: 'QR-LOT-0843',
    trace: [
      { etape: 'Extraction',     completed: true,  date: '25/01/2026', acteur: 'O. Bah' },
      { etape: 'Transport',      completed: false },
      { etape: 'Certification',  completed: false },
      { etape: 'Export',         completed: false }
    ]
  },
  {
    id: '#LOT-2026-0842', region: 'Kédougou',
    orpailleurId: 'mineur-004', orpailleurName: 'Oumar Bah',
    transporteurId: 'transport-001', transporteurName: 'Samba Kouyaté',
    poids: 9.3, status: LotStatus.CERTIFIED, progression: 100,
    date: '26/01/2026', qrCode: 'QR-LOT-0842',
    trace: [
      { etape: 'Extraction',     completed: true,  date: '23/01/2026', acteur: 'O. Bah' },
      { etape: 'Transport',      completed: true,  date: '24/01/2026', acteur: 'S. Kouyaté' },
      { etape: 'Certification',  completed: true,  date: '25/01/2026', acteur: 'Autorités' },
      { etape: 'Export',         completed: true,  date: '26/01/2026', acteur: 'Douanes' }
    ]
  },
  {
    id: '#LOT-2026-0841', region: 'Thiès',
    orpailleurId: 'mineur-003', orpailleurName: 'Marie Diallo',
    transporteurId: 'transport-001', transporteurName: 'Samba Kouyaté',
    poids: 2.1, status: LotStatus.EN_TRANSIT, progression: 70,
    date: '25/01/2026', qrCode: 'QR-LOT-0841',
    trace: [
      { etape: 'Extraction',     completed: true,  date: '24/01/2026', acteur: 'M. Diallo' },
      { etape: 'Transport',      completed: false },
      { etape: 'Certification',  completed: false },
      { etape: 'Export',         completed: false }
    ]
  },
  {
    id: '#LOT-2026-0840', region: 'Kédougou',
    orpailleurId: 'mineur-002', orpailleurName: 'Coopérative Sabodala',
    poids: 15.6, status: LotStatus.EN_ATTENTE, progression: 20,
    date: '24/01/2026', qrCode: 'QR-LOT-0840',
    trace: [
      { etape: 'Extraction',     completed: true,  date: '24/01/2026', acteur: 'Coop. Sabodala' },
      { etape: 'Transport',      completed: false },
      { etape: 'Certification',  completed: false },
      { etape: 'Export',         completed: false }
    ]
  },
  // Lots référencés par les certificats (cohérence complète)
  {
    id: '#LOT-2026-0839', region: 'Kédougou',
    orpailleurId: 'mineur-004', orpailleurName: 'Oumar Bah',
    transporteurId: 'transport-001', transporteurName: 'Samba Kouyaté',
    poids: 7.8, status: LotStatus.CERTIFIED, progression: 100,
    date: '23/01/2026', qrCode: 'QR-LOT-0839',
    trace: [
      { etape: 'Extraction', completed: true, date: '20/01/2026', acteur: 'O. Bah' },
      { etape: 'Transport', completed: true, date: '21/01/2026', acteur: 'S. Kouyaté' },
      { etape: 'Certification', completed: true, date: '22/01/2026', acteur: 'Autorités' },
      { etape: 'Export', completed: true, date: '23/01/2026', acteur: 'Douanes' }
    ]
  },
  {
    id: '#LOT-2026-0835', region: 'Kédougou',
    orpailleurId: 'mineur-001', orpailleurName: 'Jean-Baptiste Diallo',
    transporteurId: 'transport-001', transporteurName: 'Samba Kouyaté',
    poids: 11.2, status: LotStatus.CERTIFIED, progression: 100,
    date: '19/01/2026', qrCode: 'QR-LOT-0835',
    trace: [
      { etape: 'Extraction', completed: true, date: '16/01/2026', acteur: 'J. Diallo' },
      { etape: 'Transport', completed: true, date: '17/01/2026', acteur: 'S. Kouyaté' },
      { etape: 'Certification', completed: true, date: '18/01/2026', acteur: 'Autorités' },
      { etape: 'Export', completed: true, date: '19/01/2026', acteur: 'Douanes' }
    ]
  },
  {
    id: '#LOT-2026-0831', region: 'Thiès',
    orpailleurId: 'mineur-003', orpailleurName: 'Marie Diallo',
    transporteurId: 'transport-002', transporteurName: 'Amadou Fall',
    poids: 4.5, status: LotStatus.CERTIFIED, progression: 100,
    date: '15/01/2026', qrCode: 'QR-LOT-0831',
    trace: [
      { etape: 'Extraction', completed: true, date: '12/01/2026', acteur: 'M. Diallo' },
      { etape: 'Transport', completed: true, date: '13/01/2026', acteur: 'A. Fall' },
      { etape: 'Certification', completed: true, date: '14/01/2026', acteur: 'Autorités' },
      { etape: 'Export', completed: true, date: '15/01/2026', acteur: 'Douanes' }
    ]
  },
  // Données enrichies — autres régions
  {
    id: '#LOT-2026-0830', region: 'Tambacounda',
    orpailleurId: 'mineur-005', orpailleurName: 'Abdoulaye Sow',
    poids: 6.2, status: LotStatus.EN_ATTENTE, progression: 25,
    date: '22/01/2026', qrCode: 'QR-LOT-0830',
    trace: [
      { etape: 'Extraction', completed: true, date: '22/01/2026', acteur: 'A. Sow' },
      { etape: 'Transport', completed: false },
      { etape: 'Certification', completed: false },
      { etape: 'Export', completed: false }
    ]
  },
  {
    id: '#LOT-2026-0829', region: 'Ziguinchor',
    orpailleurId: 'mineur-006', orpailleurName: 'Moussa Diatta',
    transporteurId: 'transport-002', transporteurName: 'Amadou Fall',
    poids: 4.8, status: LotStatus.EN_TRANSIT, progression: 60,
    date: '21/01/2026', qrCode: 'QR-LOT-0829',
    trace: [
      { etape: 'Extraction', completed: true, date: '18/01/2026', acteur: 'M. Diatta' },
      { etape: 'Transport', completed: false },
      { etape: 'Certification', completed: false },
      { etape: 'Export', completed: false }
    ]
  },
  {
    id: '#LOT-2026-0828', region: 'Dakar',
    orpailleurId: 'mineur-002', orpailleurName: 'Coopérative Sabodala',
    transporteurId: 'transport-001', transporteurName: 'Samba Kouyaté',
    poids: 14.1, status: LotStatus.CERTIFIED, progression: 100,
    date: '20/01/2026', qrCode: 'QR-LOT-0828',
    trace: [
      { etape: 'Extraction', completed: true, date: '17/01/2026', acteur: 'Coop. Sabodala' },
      { etape: 'Transport', completed: true, date: '18/01/2026', acteur: 'S. Kouyaté' },
      { etape: 'Certification', completed: true, date: '19/01/2026', acteur: 'Autorités' },
      { etape: 'Export', completed: true, date: '20/01/2026', acteur: 'Douanes' }
    ]
  },
  {
    id: '#LOT-2026-0827', region: 'Tambacounda',
    orpailleurId: 'mineur-005', orpailleurName: 'Abdoulaye Sow',
    transporteurId: 'transport-003', transporteurName: 'Mamadou Seck',
    poids: 10.3, status: LotStatus.EN_TRANSIT, progression: 55,
    date: '18/01/2026', qrCode: 'QR-LOT-0827',
    trace: [
      { etape: 'Extraction', completed: true, date: '15/01/2026', acteur: 'A. Sow' },
      { etape: 'Transport', completed: false },
      { etape: 'Certification', completed: false },
      { etape: 'Export', completed: false }
    ]
  },
  {
    id: '#LOT-2026-0826', region: 'Kédougou',
    orpailleurId: 'mineur-001', orpailleurName: 'Jean-Baptiste Diallo',
    poids: 7.5, status: LotStatus.EN_ATTENTE, progression: 30,
    date: '17/01/2026', qrCode: 'QR-LOT-0826',
    trace: [
      { etape: 'Extraction', completed: true, date: '17/01/2026', acteur: 'J. Diallo' },
      { etape: 'Transport', completed: false },
      { etape: 'Certification', completed: false },
      { etape: 'Export', completed: false }
    ]
  },
  {
    id: '#LOT-2026-0825', region: 'Thiès',
    orpailleurId: 'mineur-003', orpailleurName: 'Marie Diallo',
    poids: 3.0, status: LotStatus.EN_ATTENTE, progression: 20,
    date: '16/01/2026', qrCode: 'QR-LOT-0825',
    trace: [
      { etape: 'Extraction', completed: true, date: '16/01/2026', acteur: 'M. Diallo' },
      { etape: 'Transport', completed: false },
      { etape: 'Certification', completed: false },
      { etape: 'Export', completed: false }
    ]
  },
  {
    id: '#LOT-2026-0824', region: 'Kédougou',
    orpailleurId: 'mineur-007', orpailleurName: 'Fatou Kanté',
    transporteurId: 'transport-001', transporteurName: 'Samba Kouyaté',
    poids: 5.1, status: LotStatus.EN_TRANSIT, progression: 60,
    date: '15/01/2026', qrCode: 'QR-LOT-0824',
    trace: [
      { etape: 'Extraction', completed: true, date: '12/01/2026', acteur: 'F. Kanté' },
      { etape: 'Transport', completed: false },
      { etape: 'Certification', completed: false },
      { etape: 'Export', completed: false }
    ]
  },
  {
    id: '#LOT-2026-0823', region: 'Kédougou',
    orpailleurId: 'mineur-008', orpailleurName: 'Ibrahima Baldé',
    poids: 2.8, status: LotStatus.EN_ATTENTE, progression: 25,
    date: '14/01/2026', qrCode: 'QR-LOT-0823',
    trace: [
      { etape: 'Extraction', completed: true, date: '14/01/2026', acteur: 'I. Baldé' },
      { etape: 'Transport', completed: false },
      { etape: 'Certification', completed: false },
      { etape: 'Export', completed: false }
    ]
  }
];

/** Transactions (achats de lots par les commerçants) */
const TRANSACTIONS: Transaction[] = [
  {
    id: 'TX-2026-0001',
    lotId: '#LOT-2026-0828',
    vendeurId: 'mineur-002',
    acheteurId: 'commerce-001',
    vendeurName: 'Coopérative Sabodala',
    acheteurName: 'Ibrahima Touré',
    date: '01/02/2026',
    type: TransactionType.ACHAT,
    montant: 3200000
  }
];

const CERTIFICATES: Certificate[] = [
  { id: 'CERT-SG-2026-0214', lotId: '#LOT-2026-0847', orpailleurId: 'mineur-001', lotRegion: 'Kédougou', lotPoids: 12.4, orpailleurName: 'Jean-Baptiste Diallo', emissionDate: '30/01/2026', expirationDate: '30/04/2026', status: CertificateStatus.VALID,   qrCode: 'QR-LOT-0847' },
  { id: 'CERT-SG-2026-0213', lotId: '#LOT-2026-0844', orpailleurId: 'mineur-003', lotRegion: 'Thiès',    lotPoids: 3.2,  orpailleurName: 'Marie Diallo',     emissionDate: '27/01/2026', expirationDate: '27/04/2026', status: CertificateStatus.VALID,   qrCode: 'QR-LOT-0844' },
  { id: 'CERT-SG-2026-0212', lotId: '#LOT-2026-0842', orpailleurId: 'mineur-004', lotRegion: 'Kédougou', lotPoids: 9.3,  orpailleurName: 'Oumar Bah',        emissionDate: '25/01/2026', expirationDate: '25/04/2026', status: CertificateStatus.VALID,   qrCode: 'QR-LOT-0842' },
  { id: 'CERT-SG-2026-0211', lotId: '#LOT-2026-0839', orpailleurId: 'mineur-004', lotRegion: 'Kédougou', lotPoids: 7.8,  orpailleurName: 'Oumar Bah',        emissionDate: '23/01/2026', expirationDate: '23/04/2026', status: CertificateStatus.VALID,   qrCode: 'QR-LOT-0839' },
  { id: 'CERT-SG-2026-0210', lotId: '#LOT-2026-0835', orpailleurId: 'mineur-001', lotRegion: 'Kédougou', lotPoids: 11.2, orpailleurName: 'Jean-Baptiste Diallo', emissionDate: '19/01/2026', expirationDate: '19/01/2026', status: CertificateStatus.EXPIRED, qrCode: 'QR-LOT-0835' },
  { id: 'CERT-SG-2026-0209', lotId: '#LOT-2026-0831', orpailleurId: 'mineur-003', lotRegion: 'Thiès',    lotPoids: 4.5,  orpailleurName: 'Marie Diallo',     emissionDate: '15/01/2026', expirationDate: '15/01/2026', status: CertificateStatus.EXPIRED, qrCode: 'QR-LOT-0831' },
  { id: 'CERT-SG-2026-0215', lotId: '#LOT-2026-0828', orpailleurId: 'mineur-002', lotRegion: 'Dakar',    lotPoids: 14.1, orpailleurName: 'Coopérative Sabodala', emissionDate: '19/01/2026', expirationDate: '19/04/2026', status: CertificateStatus.VALID, qrCode: 'QR-LOT-0828' }
];

const ALERTS: Alert[] = [
  { id: 'ALT-001', level: AlertLevel.HIGH,   title: 'Anomalie de poids — Lot #0843',       description: 'Le poids déclaré (18.9 kg) dépasse de 40% la moyenne régionale. Vérification physique recommandée.',                     lotId: '#LOT-2026-0843', createdAt: 'Il y a 6h',  read: false },
  { id: 'ALT-002', level: AlertLevel.HIGH,   title: 'Tentative d\'export non autorisé',     description: 'Un lot non certifié a été détecté à la frontière Sénégal–Mali. Les douanes ont été alertées immédiatement.',              lotId: undefined,        createdAt: 'Il y a 12h', read: false },
  { id: 'ALT-003', level: AlertLevel.MEDIUM, title: 'KYC en attente — Marie Diallo',        description: 'Le dossier de vérification d\'identité est en cours depuis 5 jours. Une relance est suggérée.',                          lotId: undefined,        createdAt: 'Il y a 1j',  read: true  },
  { id: 'ALT-004', level: AlertLevel.MEDIUM, title: 'Certificat approchant expiration',     description: 'Le certificat CERT-SG-2026-0209 expire dans 3 jours. Un renouvellement doit être initié avant la date limite.',          lotId: '#LOT-2026-0831', createdAt: 'Il y a 2j',  read: true  },
  { id: 'ALT-005', level: AlertLevel.LOW,    title: 'Maintenance du système — 5 février',   description: 'Une maintenance est prévue entre 02h et 06h. Les services seront temporairement indisponibles pour tous les utilisateurs.', lotId: undefined,        createdAt: 'Il y a 3j',  read: true  },
  { id: 'ALT-006', level: AlertLevel.MEDIUM, title: 'Lot sans transporteur assigné',        description: 'Le lot #LOT-2026-0840 (Kédougou, 15.6 kg) est en attente d\'un transporteur pour la livraison vers la raffinerie.',         lotId: '#LOT-2026-0840', createdAt: 'Il y a 1j',  read: false }
];

const ACTEURS: Acteur[] = [
  { id: 'mineur-001',     name: 'Jean-Baptiste Diallo', role: Role.MINEUR,       subtitle: 'Mineur indépendant',    region: 'Sabodala',   kyc: KycStatus.VERIFIED, activeLots: 4, lastActivity: 'Aujourd\'hui', phone: '+221 77 123 45 67', email: 'jb.diallo@email.sn', address: 'Sabodala, Kédougou', registeredAt: '15/03/2024' },
  { id: 'mineur-002',     name: 'Coopérative Sabodala', role: Role.MINEUR,       subtitle: 'Coopérative minière',   region: 'Sabodala',   kyc: KycStatus.VERIFIED, activeLots: 8, lastActivity: 'Aujourd\'hui', phone: '+221 76 987 65 43', email: 'contact@coop-sabodala.sn', address: 'Siège Sabodala, Kédougou', registeredAt: '22/01/2024' },
  { id: 'mineur-003',     name: 'Marie Diallo',         role: Role.MINEUR,       subtitle: 'Mineur artisanal',      region: 'Thiès',      kyc: KycStatus.PENDING,  activeLots: 3, lastActivity: 'Hier', phone: '+221 70 111 22 33', email: 'marie.diallo@email.sn', address: 'Thiès Nord', registeredAt: '10/08/2025' },
  { id: 'mineur-004',     name: 'Oumar Bah',            role: Role.MINEUR,       subtitle: 'Coopérative Mako',      region: 'Mako',       kyc: KycStatus.VERIFIED, activeLots: 3, lastActivity: '2 jours', phone: '+221 77 666 55 44', email: 'o.bah@coop-mako.sn', address: 'Mako, Kédougou', registeredAt: '18/11/2024' },
  { id: 'mineur-005',     name: 'Abdoulaye Sow',        role: Role.MINEUR,       subtitle: 'Mineur artisanal',      region: 'Tambacounda', kyc: KycStatus.VERIFIED, activeLots: 2, lastActivity: 'Hier', phone: '+221 76 444 55 66', email: 'a.sow@email.sn', address: 'Tambacounda', registeredAt: '01/06/2025' },
  { id: 'mineur-006',     name: 'Moussa Diatta',        role: Role.MINEUR,       subtitle: 'Mineur indépendant',  region: 'Ziguinchor',  kyc: KycStatus.VERIFIED, activeLots: 1, lastActivity: '2 jours', phone: '+221 77 333 22 11', email: 'm.diatta@email.sn', address: 'Ziguinchor', registeredAt: '15/09/2025' },
  { id: 'mineur-007',     name: 'Fatou Kanté',         role: Role.MINEUR,       subtitle: 'Mineur artisanal',      region: 'Mako',       kyc: KycStatus.VERIFIED, activeLots: 2, lastActivity: 'Hier', phone: '+221 76 222 11 00', email: 'f.kante@email.sn', address: 'Mako, Saraya', registeredAt: '12/05/2025' },
  { id: 'mineur-008',     name: 'Ibrahima Baldé',      role: Role.MINEUR,       subtitle: 'Mineur indépendant',  region: 'Sabodala',   kyc: KycStatus.PENDING,  activeLots: 1, lastActivity: '3 jours', phone: '+221 77 999 88 77', email: 'i.balde@email.sn', address: 'Sabodala', registeredAt: '20/10/2025' },
  { id: 'commerce-001',   name: 'Ibrahima Touré',       role: Role.COMMERÇANT,   subtitle: 'Acheteur régional',     region: 'Dakar',      kyc: KycStatus.VERIFIED, activeLots: 6, lastActivity: 'Hier', phone: '+221 77 555 44 33', email: 'i.toure@commerce.sn', address: 'Almadies, Dakar', registeredAt: '05/06/2024' },
  { id: 'commerce-002',   name: 'Awa Ndiaye',           role: Role.COMMERÇANT,   subtitle: 'Acheteuse export',     region: 'Dakar',      kyc: KycStatus.VERIFIED, activeLots: 4, lastActivity: 'Aujourd\'hui', phone: '+221 76 888 99 00', email: 'a.ndiaye@commerce.sn', address: 'Plateau, Dakar', registeredAt: '20/04/2025' },
  { id: 'transport-001',  name: 'Samba Kouyaté',        role: Role.TRANSPORTEUR, subtitle: 'Transporteur agréé',    region: 'Dakar',      kyc: KycStatus.VERIFIED, activeLots: 5, lastActivity: 'Aujourd\'hui', phone: '+221 76 777 88 99', email: 's.kouyate@transit.sn', address: 'Parcelles Assainies, Dakar', registeredAt: '12/04/2024' },
  { id: 'transport-002',  name: 'Amadou Fall',          role: Role.TRANSPORTEUR, subtitle: 'Transporteur régional', region: 'Thiès',      kyc: KycStatus.VERIFIED, activeLots: 3, lastActivity: '2 jours', phone: '+221 70 222 33 44', email: 'a.fall@transit.sn', address: 'Thiès', registeredAt: '30/09/2024' },
  { id: 'transport-003',  name: 'Mamadou Seck',         role: Role.TRANSPORTEUR, subtitle: 'Transporteur Est',      region: 'Tambacounda', kyc: KycStatus.VERIFIED, activeLots: 2, lastActivity: '3 jours', phone: '+221 77 111 00 99', email: 'm.seck@transit.sn', address: 'Tambacounda', registeredAt: '08/07/2025' }
];

// ═══════════════════════════════════════════════════════════

@Injectable({ providedIn: 'root' })
export class DataService {
  constructor(private authService: AuthService) {}

  /**
   * Retourne les lots filtrés selon le rôle de l'utilisateur connecté.
   * Le filtre est appliqué dans le modèle (filterLotsForRole)
   * pour garder la logique métier proche de la donnée.
   */
  getLots(): Observable<Lot[]> {
    const user = this.authService.getCurrentUser();
    if (!user) return of([]);
    return of(filterLotsForRole(LOTS, user.role, user.id));
  }

  /** Tous les lots — utilisé en interne (ex: pour les stats du dashboard gouvernemental) */
  getAllLots(): Observable<Lot[]> {
    return of(LOTS);
  }

  /** Un lot par ID ou code QR — utilisable sans auth (vérification publique) */
  getLotById(id: string): Observable<Lot | undefined> {
    if (!id?.trim()) return of(undefined);
    const raw = id.trim();
    const idWithHash = raw.startsWith('#') ? raw : '#' + raw;
    return of(
      LOTS.find(l => l.id === raw || l.id === idWithHash || l.qrCode === raw)
    );
  }

  /** Certificats : Gouvernement = tous ; Mineur = uniquement ceux de ses lots ; Commerçant = certificats des lots certifiés (visibles pour achat) */
  getCertificates(): Observable<Certificate[]> {
    const user = this.authService.getCurrentUser();
    if (!user) return of([]);
    if (user.role === Role.GOUVERNEMENT) return of(CERTIFICATES);
    if (user.role === Role.MINEUR) {
      const filtered = CERTIFICATES.filter(c => c.orpailleurId === user.id);
      return of(filtered);
    }
    if (user.role === Role.COMMERÇANT) {
      const certified = CERTIFICATES.filter(c => c.status === CertificateStatus.VALID);
      return of(certified);
    }
    return of([]);
  }

  /** Alertes — uniquement pour le GOUVERNEMENT (vérifié dans le guard/component) */
  getAlerts(): Observable<Alert[]> {
    return of(ALERTS);
  }

  /** Nombre d'alertes non lues — utilisé par le topbar */
  getUnreadAlertsCount(): number {
    return ALERTS.filter(a => !a.read).length;
  }

  /** Acteurs — uniquement pour le GOUVERNEMENT */
  getActeurs(): Observable<Acteur[]> {
    return of(ACTEURS);
  }

  /** Un acteur par identifiant exact (pour la page détail) */
  getActeurById(id: string): Observable<Acteur | undefined> {
    if (!id?.trim()) return of(undefined);
    const found = ACTEURS.find(a => a.id === id.trim());
    return of(found);
  }

  /** Lots liés à un acteur (orpailleur ou transporteur) — pour l'historique d'activité */
  getLotsByActeurId(acteurId: string): Observable<Lot[]> {
    if (!acteurId?.trim()) return of([]);
    const list = LOTS.filter(
      l => l.orpailleurId === acteurId || l.transporteurId === acteurId
    );
    return of(list);
  }

  /** Lots en attente sans transporteur assigné — pour que le transporteur déclare un transit */
  getLotsEnAttenteSansTransporteur(): Observable<Lot[]> {
    const list = LOTS.filter(
      l => l.status === LotStatus.EN_ATTENTE && !l.transporteurId
    );
    return of(list);
  }

  /** Déclarer un transit (mock : en production appel API qui assigne le transporteur au lot) */
  declareTransit(transit: TransitDeclaration): Observable<void> {
    return of(void 0);
  }

  /** Transactions : toutes (gouvernement) ou filtrées selon le rôle */
  getTransactions(): Observable<Transaction[]> {
    const user = this.authService.getCurrentUser();
    if (!user) return of([]);
    return of(filterTransactionsForRole(TRANSACTIONS, user.role, user.id));
  }

  /** Transactions complètes — réservé au gouvernement */
  getAllTransactions(): Observable<Transaction[]> {
    return of(TRANSACTIONS);
  }

  /** Achat d'un lot par le commerçant connecté (mock avec simulation réaliste) */
  acheterLot(lotId: string, montant?: number): Observable<void> {
    const user = this.authService.getCurrentUser();

    // Vérifications de sécurité
    if (!user || user.role !== Role.COMMERÇANT) {
      return throwError(() => new Error('Non autorisé : seuls les commerçants peuvent acheter des lots'));
    }

    const lot = LOTS.find(l => l.id === lotId || l.id.replace(/^#/, '') === lotId.replace(/^#/, ''));

    if (!lot) {
      return throwError(() => new Error('Lot introuvable'));
    }

    if (lot.status !== LotStatus.CERTIFIED) {
      return throwError(() => new Error('Seuls les lots certifiés peuvent être achetés'));
    }

    if (!montant || montant <= 0) {
      return throwError(() => new Error('Montant invalide'));
    }

    // Simule un délai réseau (1.5 secondes) pour rendre l'expérience réaliste
    return of(void 0).pipe(
      delay(1500),
      map(() => {
        // Crée la transaction
        const tx: Transaction = {
          id: `TX-${Date.now()}`,
          lotId: lot.id,
          vendeurId: lot.orpailleurId,
          acheteurId: user.id,
          vendeurName: lot.orpailleurName,
          acheteurName: user.name,
          date: new Date().toLocaleDateString('fr-FR'),
          type: TransactionType.ACHAT,
          montant
        };
        TRANSACTIONS.unshift(tx);

        // Met à jour le statut du lot à VENDU
        lot.status = LotStatus.VENDU;
        lot.progression = 100;

        // Ajoute une étape dans la trace
        const existingAchatStep = lot.trace.find(t => t.etape === 'Achat');
        if (!existingAchatStep) {
          lot.trace.push({
            etape: 'Achat',
            completed: true,
            date: new Date().toLocaleDateString('fr-FR'),
            acteur: user.name
          });
        } else {
          existingAchatStep.completed = true;
          existingAchatStep.date = new Date().toLocaleDateString('fr-FR');
          existingAchatStep.acteur = user.name;
        }

        return void 0;
      })
    );
  }
}
