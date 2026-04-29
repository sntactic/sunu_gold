import { Role } from './user.model';

export enum TransactionType {
  ACHAT = 'achat',
}

export interface Transaction {
  id: string;
  lotId: string;
  vendeurId: string;
  acheteurId: string;
  vendeurName: string;
  acheteurName: string;
  date: string;
  type: TransactionType;
  montant?: number;
}

/** Filtre les transactions visibles selon le rôle */
export function filterTransactionsForRole(
  txs: Transaction[],
  role: Role,
  userId: string
): Transaction[] {
  switch (role) {
    case Role.GOUVERNEMENT:
      return txs; // voit tout
    case Role.MINEUR:
      return txs.filter(t => t.vendeurId === userId);
    case Role.COMMERÇANT:
      return txs.filter(t => t.acheteurId === userId);
    case Role.TRANSPORTEUR:
      // Pour un transporteur on pourrait filtrer via les lots liés,
      // ici on retourne tout et l'historique des livraisons reste basé sur les lots.
      return txs;
  }
}

