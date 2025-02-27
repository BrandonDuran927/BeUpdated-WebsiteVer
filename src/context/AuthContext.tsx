import { doc, setDoc } from "firebase/firestore";
import { firestore } from "../config/firebase";
import React, { createContext, useState, useEffect, ReactNode } from "react";
import { auth, database, ref, set } from "../config/firebase";
import { get } from "firebase/database";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User
} from "firebase/auth";

interface AuthContextType {
    user: User | null;
    role: string | null;  // 🔹 Track role from Firebase
    loading: boolean;
    registerUser: (email: string, password: string, userData: any) => Promise<void>;
    loginUser: (email: string, password: string) => Promise<void>;
    logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<string | null>(null);  // 🔹 Store role
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const userRef = ref(database, `users/${currentUser.uid}/role`);
                const snapshot = await get(userRef);

                if (snapshot.exists()) {
                    setRole(snapshot.val());
                } else {
                    setRole(null);
                }
                setUser(currentUser);
            } else {
                setRole(null);
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const registerUser = async (email: string, password: string, userData: any) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const userId = userCredential.user.uid;

            console.log("✅ User registered with UID:", userId);

            // Store in Realtime Database (your existing code)
            await set(ref(database, `users/${userId}`), {
                email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                middleName: userData.middleName || "",
                id: userData.studentId,
                phoneNumber: userData.phoneNumber,
                role: "student",
            });

            // Also store in Firestore
            await setDoc(doc(firestore, "users", userId), { exists: true });

            console.log("✅ User data written to both databases for UID:", userId);
        } catch (error) {
            console.error("❌ Error during user registration:", error);
            throw error; // Re-throw to handle in the component
        }
    };

    const loginUser = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const logoutUser = async () => {
        await signOut(auth);
        setUser(null);
        setRole(null);
    };

    return (
        <AuthContext.Provider value={{ user, role, loading, registerUser, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
