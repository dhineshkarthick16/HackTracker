export type CompetitionStatus = 'Upcoming' | 'Ongoing' | 'Completed';

export type PaymentStatus = 'Not Required' | 'Not Paid' | 'Paid' | 'Refunded';

export type RoundStatus = 'Upcoming' | 'Ongoing' | 'Completed' | 'Eliminated';

export type ResultStatus = 
  | 'Pending'
  | 'Winner'
  | 'Runner-up'
  | 'Finalist'
  | 'Shortlisted'
  | 'Participated'
  | 'Lost'
  | 'Disqualified'
  | 'Other';

export interface Round {
  id: string;
  competition_id: string;
  name: string;
  date?: string | null;
  status: RoundStatus;
  round_order: number;
  created_at?: string;
}

export type RoundInput = {
  id?: string;
  name: string;
  date?: string | null;
  status: RoundStatus;
  round_order?: number;
};

export interface Competition {
  id: string;
  user_id: string;
  name: string;
  organizer: string;
  status: CompetitionStatus;
  registration_deadline?: string | null; // ISO string with time
  registration_fee: number; // 0 for Free
  payment_status: PaymentStatus;
  problem_statement?: string;
  result: ResultStatus;
  position?: string;
  prize?: string;
  result_notes?: string;
  competition_url?: string;
  github_url?: string;
  linkedin_url?: string;
  rounds?: Round[];
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  created_at?: string;
}

export interface DashboardStats {
  totalCompetitions: number;
  ongoingCompetitions: number;
  completedCompetitions: number;
  wins: number;
  finalists: number;
  upcomingDeadlines: number;
  totalFeesPaid: number;
}

export interface FilterOptions {
  status: 'All' | CompetitionStatus;
  result: 'All' | ResultStatus;
  payment: 'All' | 'Paid' | 'Not Paid' | 'Free / Not Required' | PaymentStatus;
  searchQuery: string;
}

export type SortField = 'latest' | 'oldest' | 'deadline' | 'name' | 'status' | 'result';
