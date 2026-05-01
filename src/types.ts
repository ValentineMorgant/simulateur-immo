// src/types.ts
export type AcheteurData = {
  nom: string
  revenuFixe: number
  revenuVariable: number
}

export type Simulation = {
  id: string
  nom: string
  acheteur1: AcheteurData
  acheteur2: AcheteurData
  loyerActuel: number
  aideCaf: number
  apport: number
  taux: number
  duree: number
  budgetTravaux: number
  tauxCible: number
  tauxAssurance: number
  ptzActif: boolean
  ptzMontant: number
  nbOccupants: number
  prixM2Ancien: number
  prixM2Neuf: number
  dossier: Record<string, boolean>
}

export type Resultats = {
  revenusMensuels: number
  revenusAnnuels: number
  mensualiteMax: number
  mensualiteAssurance: number
  capitalMax: number
  prixMaxBien: number
  tauxEndettement: number
  coutTotal: number
  interetsTotaux: number
  surfaceAncien: number
  surfaceNeuf: number
  fraisNotaireAncien: number
  fraisNotaireNeuf: number
}

export type DocumentItem = {
  id: string
  label: string
  categorie: 'identite' | 'revenus' | 'bancaire' | 'projet'
}

export const DOCUMENTS: DocumentItem[] = [
  { id: 'id-a1',           label: "Pièce d'identité (Acheteur 1)",               categorie: 'identite' },
  { id: 'id-a2',           label: "Pièce d'identité (Acheteur 2)",               categorie: 'identite' },
  { id: 'domicile',        label: 'Justificatif de domicile',                     categorie: 'identite' },
  { id: 'pacs',            label: 'Contrat de PACS / mariage',                    categorie: 'identite' },
  { id: 'bulletins-a1',   label: '3 derniers bulletins de salaire (Acheteur 1)', categorie: 'revenus'  },
  { id: 'bulletins-a2',   label: '3 derniers bulletins de salaire (Acheteur 2)', categorie: 'revenus'  },
  { id: 'avis-impo',       label: "2 derniers avis d'imposition",                 categorie: 'revenus'  },
  { id: 'contrat-a1',      label: 'Contrat de travail (Acheteur 1)',              categorie: 'revenus'  },
  { id: 'contrat-a2',      label: 'Contrat de travail (Acheteur 2)',              categorie: 'revenus'  },
  { id: 'attestation-emp', label: 'Attestation employeur',                        categorie: 'revenus'  },
  { id: 'releves',         label: '3 derniers relevés de compte',                 categorie: 'bancaire' },
  { id: 'epargne',         label: 'Relevés épargne (livret A, PEL…)',             categorie: 'bancaire' },
  { id: 'amortissement',   label: "Tableau d'amortissement crédit en cours",      categorie: 'bancaire' },
  { id: 'cpt-joint',       label: 'Relevés compte joint (si applicable)',         categorie: 'bancaire' },
  { id: 'caf',             label: 'Attestation CAF',                              categorie: 'bancaire' },
  { id: 'compromis',       label: 'Compromis ou promesse de vente',               categorie: 'projet'   },
  { id: 'descriptif',      label: 'Descriptif du bien (surface, DPE…)',           categorie: 'projet'   },
  { id: 'copro',           label: 'Règlement de copropriété (si applicable)',     categorie: 'projet'   },
]
