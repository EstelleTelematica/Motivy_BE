import {UUID} from "crypto";

export interface User{
    id: UUID;
    createdAt: Date;
    lastUptade: Date;
    firstName: string;
    lastName: string;
    hashPassword: string;
    email: string;
    phoneNumber: string;
    birthday: Date; 
}