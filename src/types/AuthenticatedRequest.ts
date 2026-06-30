import { UUID } from "crypto";
import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  userId: UUID | string;
}

//è un estensione custom per estendere l'oggetto Request che è defautl di Express, 
//ci serve per riconoscere quali richieste arrivano da utenti che hanno già fatto login e quali no
