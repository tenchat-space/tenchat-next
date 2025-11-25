export interface PredictionOption {
  id: string;
  text: string;
  votes: number;
  poolAmount: number; // In tokens
}

export interface PredictionMarket {
  id: string;
  question: string;
  creatorId: string;
  createdAt: string;
  expiresAt: string;
  options: PredictionOption[];
  totalPool: number;
  status: 'active' | 'closed' | 'resolved';
  resolvedOptionId?: string;
  tokenSymbol: string;
}
