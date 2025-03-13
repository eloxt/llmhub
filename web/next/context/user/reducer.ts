import { User } from "./user";

export const UserReducer = (state: User, action: any) => {
    switch (action.type) {
        case "LOGIN":
            return {
                ...action.payload,
                login: true
            };
        case "LOGOUT":
            return {
                login: false
            };
        case "KEY-LOGIN":
            return {
                ...action.payload.key,
                login: true
            };
        default:
            return state;
    }
}
