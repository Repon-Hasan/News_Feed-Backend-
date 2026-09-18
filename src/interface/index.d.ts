
import type { IRequestUser } from "../modules/Auth/auth.interface";


declare global {
    namespace Express{
        interface Request {
            user : IRequestUser
        }
    }
}

export {};