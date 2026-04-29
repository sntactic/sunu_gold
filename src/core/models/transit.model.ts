/** Déclaration de transit par un transporteur — pour traçabilité absolue */
export interface TransitDeclaration {
  id: string;
  lotId: string;
  transporteurId: string;
  transporteurName: string;
  /** Lieu de chargement (région ou adresse) */
  lieuChargement: string;
  /** Lieu de livraison prévu */
  lieuLivraison: string;
  /** Immatriculation ou identifiant du véhicule */
  vehicule: string;
  /** Date et heure de départ prévues */
  dateHeureDepart: string;
  /** Date et heure d'arrivée prévues */
  dateHeureArriveePrevue: string;
  /** Chauffeur(s) */
  chauffeur?: string;
  /** Référence du document de transport */
  refDocument?: string;
  dateDeclaration: string;
  statut: 'en_cours' | 'termine' | 'annule';
}
