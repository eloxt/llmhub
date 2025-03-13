import { createContext } from "react";
import { InitialUserState, UserReducerProps } from "./user";

export const UserContext = createContext<UserReducerProps>({ user: InitialUserState, setUser: () => {} });