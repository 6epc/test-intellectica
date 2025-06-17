export interface PassRequest {
  id: number;
  status: string;
  purpose: string;
  visitorName: string;
  visitDate: Date;
  createdAt: Date;
  updatedAt?: Date;
  userId: number;
  localId: number;
}

export interface RegisterUserInfo {
  fullName: string;
  phone: string;
  email: string;
  organization: string;
  password: string;
  createdAt?: Date;
  userId: number;
  id: number;
}

export interface loginUserInfo {
  email: string;
  password: string;
}

export enum Status {
  PENDING = 'на согласовании',
  READY = 'пропуск готов',
  REJECTED = 'отклонена',
  ISSUED = 'пропуск выдан'
}

export type StatusClassMap = {
  [key in Status]: string;
};
