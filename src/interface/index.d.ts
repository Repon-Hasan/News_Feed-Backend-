import { IRequestUser } from "../auth/auth.interface";

declare global {
    namespace Express{
        interface Request {
            user : IRequestUser
        }
    }
}

