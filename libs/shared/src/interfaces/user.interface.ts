export enum Role {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER',
  VENDOR = 'VENDOR',
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface JwtPayload {
  id: number;
  email: string;
  role: Role;
}
