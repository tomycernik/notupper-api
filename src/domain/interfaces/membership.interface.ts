export interface IMembership {
    membership_id: number
    membership_start_date?: string
    membership_end_date?: string
}

export interface IMembershipTier {
  id: number;
  name: string;
  duration_months: number;
}

export interface IMembershipFeature {
  name: string;
  allowed: boolean;
}