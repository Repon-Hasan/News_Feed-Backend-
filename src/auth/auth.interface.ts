import { Role } from "../generated/prisma/enums";


export interface ILoginUserPayload {
    email: string;
    password: string;
}

export interface IRegisterPatientPayload {
    name: string;
    email: string;
    password: string;
    role:string
}

export interface IChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
}


export interface IUpdateProfilePayload {
  currentPassword: string;

  // User fields
  name?: string;
  image?: string | null;

  // ReporterProfile fields
  bio?: string;
  designation?: string;
  phone?: string;
  twitter?: string;
  facebook?: string;
}


export interface IRequestUser{
    id: string;
    userId : string;
    role : Role;
    email : string;
}