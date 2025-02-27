import React, { createContext, useState, useEffect, ReactNode } from "react";
import { auth, database, ref } from "../config/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { get } from "firebase/database";

interface AdminContextType {
    admin: User | null;
    loading: boolean;
    logoutAdmin: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [admin, setAdmin] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const userRef = ref(database, `users/${currentUser.uid}`);
                const snapshot = await get(userRef);

                if (snapshot.exists() && snapshot.val().role === "admin") {
                    setAdmin(currentUser);
                } else {
                    setAdmin(null);
                }
            } else {
                setAdmin(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logoutAdmin = async () => {
        await signOut(auth);
    };

    return (
        <AdminContext.Provider value={{ admin, loading, logoutAdmin }}>
            {children}
        </AdminContext.Provider>
    );
};

export default AdminContext;
