export interface Notification {
  time: string;
  title: string;
  message: string;
  read: boolean;
}

export interface DutyDetails {
  dorm: string;
  floor: string;
  room: string;
  place: string;
  time: string;
}