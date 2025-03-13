import { Dispatch } from "react";

export interface User {
    id: string;
    username: string;
    displayName: string;
    quota: number;
    used_quota: number;
    request_quota: number;
    type: number;
    key: string;
    login: boolean
}

export const InitialUserState: User = {
    id: "",
    username: "",
    displayName: "",
    quota: 0,
    used_quota: 0,
    request_quota: 0,
    type: 0,
    key: "",
    login: false
};

export interface UserReducerProps {
    user: User;
    setUser: React.ActionDispatch<[action: any]>;
}