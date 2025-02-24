import React, { createContext, useState, useEffect, ReactNode } from "react";
import { auth, database, ref, set } from "../config/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { get } from "firebase/database";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    registerUser: (email: string, password: string, userData: any) => Promise<void>;
    loginUser: (email: string, password: string) => Promise<void>;
    logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const registerUser = async (email: string, password: string, userData: any) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;

        await set(ref(database, `users/${userId}`), {
            email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            middleName: userData.middleName || "",
            id: userData.studentId,
            phoneNumber: userData.phoneNumber,
        });

        const userRef = ref(database, `users/${userId}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
            console.log("User data inserted successfully:", snapshot.val());
        } else {
            console.log("No data available for this user.");
        }
    };

    const loginUser = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const logoutUser = async () => {
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, loading, registerUser, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
