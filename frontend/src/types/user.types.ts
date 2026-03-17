export interface User {
  name: string;
  login: string;
  password: string;
}

export interface UsersMap {
  [key: string]: {
    name: string;
    password: string;
  };
}