export interface Student {
  id: number;
  name: string;
  surname: string;
  n_room?: number;
  role: string;
}

export interface Duty {
  id: number;
  duty_type: string;
  room_number: number;
  floor: number;
  assigned_to_ids: number[];
  assigned_to: Student[];
  date_assigned: string;
  date_due: string;
  status: string;
}

export const dutyTypes = [
  { value: 'kitchen', label: '🍽️ Кухня' },
  { value: 'shower', label: '🚿 Душевая' },
] as const;