export type DutyType = 'kitchen' | 'shower' | 'cleaning' | 'saturday';
export type DutyStatus = 'pending' | 'assigned' | 'confirmed' | 'completed' | 'reported' | 'verified';

export interface Duty {
  id: number;
  duty_type: DutyType;
  room_number: string; // 201-212, 901-912
  floor: number; // 2-9
  assigned_to?: {
    id: number;
    name: string;
    surname: string;
    phone: string;
  };
  assigned_by?: {
    id: number;
    name: string;
    surname: string;
  };
  commandant?: {
    id: number;
    name: string;
    surname: string;
  };
  date_assigned: string;
  date_due: string;
  status: DutyStatus;
  description?: string;
  photos?: string[];
}

export interface DutyReport {
  id: number;
  duty_id: number;
  description: string;
  photos: string[];
  submitted_at: string;
  submitted_by: number;
  verified_by?: number;
  verified_at?: string;
}