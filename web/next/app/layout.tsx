"use client"
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import React, { useReducer, useEffect } from "react";
import { UserContext } from "@/context/user";
import { UserReducer } from "@/context/user/reducer";
import { InitialUserState } from "@/context/user/user";
import { Toaster } from "sonner";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const [user, setUser] = useReducer(UserReducer, InitialUserState);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser({ type: "LOGIN", payload: userData });
        }
    }, []);

    return (
        <html lang="en">
            <body>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    storageKey="theme"
                >
                    <UserContext.Provider value={{ user, setUser }}>
                        <SidebarProvider>
                            <AppSidebar />
                            <SidebarInset>
                                <Toaster position="top-center" richColors />
                                {children}
                            </SidebarInset>
                        </SidebarProvider>
                    </UserContext.Provider>
                </ThemeProvider>
            </body>
        </html>
    );
}
