import { createContext, ReactNode, useEffect, useState } from "react";
import { auth, firestore } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";

interface AdminContextType {
    isAdmin: boolean;
    adminLogin: (email: string, password: string) => Promise<void>;
    adminLogout: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdmin = async () => {
            const user = auth.currentUser;
            if (user) {
                const adminRef = doc(firestore, "admins", user.uid);
                const adminSnap = await getDoc(adminRef);
                setIsAdmin(adminSnap.exists()); // ✅ If doc exists, user is an admin
            }
        };
        checkAdmin();
    }, []);

    const adminLogin = async (email: string, password: string) => {
        try {
            // await auth.signInWithEmailAndPassword(email, password);
            // await checkAdmin();
        } catch (error) {
            console.error("Admin login failed:", error);
        }
    };

    const adminLogout = async () => {
        await auth.signOut();
        setIsAdmin(false);
    };

    return (
        <AdminContext.Provider value={{ isAdmin, adminLogin, adminLogout }}>
            {children}
        </AdminContext.Provider>
    );
};

export default AdminContext;
