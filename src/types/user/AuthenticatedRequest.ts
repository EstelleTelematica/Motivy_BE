import { UUID } from "crypto";
import { Request } from "express";
import { User } from "../../models/User";
 
export interface AuthenticatedRequest extends Request {
  email: string;
  userId: UUID | string;
  user: User;
}

//è un estensione custom per estendere l'oggetto Request che è defautl di Express, 
//ci serve per riconoscere quali richieste arrivano da utenti che hanno già fatto login e quali no
