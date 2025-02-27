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
    User,
    setPersistence,
    browserLocalPersistence
} from "firebase/auth";

interface AuthContextType {
    user: User | null;
    role: string | null;
    loading: boolean;
    isInitializing: boolean;
    registerUser: (email: string, password: string, userData: any) => Promise<void>;
    loginUser: (email: string, password: string) => Promise<void>;
    logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isInitializing, setIsInitializing] = useState(true);

    // Set up auth persistence when the provider mounts
    useEffect(() => {
        setPersistence(auth, browserLocalPersistence)
            .then(() => console.log("✅ Firebase Auth persistence set to LOCAL"))
            .catch((error) => console.error("❌ Error setting persistence:", error));
    }, []);

    // Set up user auth state listener
    useEffect(() => {
        console.log("🔄 Setting up auth state listener");

        // Try to load role from localStorage first (for faster UI updates)
        const cachedRole = localStorage.getItem("userRole");
        if (cachedRole) {
            console.log("🔄 Using cached role from localStorage:", cachedRole);
            setRole(cachedRole);
        }

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            console.log("🔐 Auth state changed:", currentUser ? `User ${currentUser.uid}` : "No user");

            try {
                if (currentUser) {
                    setUser(currentUser);

                    // If role already exists from localStorage, avoid redundant fetching
                    if (!cachedRole) {
                        const userRef = ref(database, `users/${currentUser.uid}/role`);
                        console.log("📡 Fetching role for user:", currentUser.uid);

                        const snapshot = await get(userRef);
                        if (snapshot.exists()) {
                            const userRole = snapshot.val();
                            console.log("✅ User role fetched:", userRole);
                            setRole(userRole);
                            localStorage.setItem("userRole", userRole); // Save role for persistence
                        } else {
                            console.warn("⚠️ No role found for user");
                            setRole(null);
                            localStorage.removeItem("userRole");
                        }
                    }
                } else {
                    console.log("🔒 No user logged in");
                    setUser(null);
                    setRole(null);
                    localStorage.removeItem("userRole");
                }
            } catch (error) {
                console.error("❌ Error checking auth state:", error);
            } finally {
                setIsInitializing(false); // Ensures the app renders after Firebase restores auth
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const registerUser = async (email: string, password: string, userData: any) => {
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const userId = userCredential.user.uid;

            console.log("✅ User registered with UID:", userId);

            await set(ref(database, `users/${userId}`), {
                email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                middleName: userData.middleName || "",
                id: userData.studentId,
                phoneNumber: userData.phoneNumber,
                role: "student",
            });

            localStorage.setItem("userRole", "student");
            await setDoc(doc(firestore, "users", userId), { exists: true });

            console.log("✅ User data written to both databases for UID:", userId);
        } catch (error) {
            console.error("❌ Error during user registration:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const loginUser = async (email: string, password: string) => {
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const userId = userCredential.user.uid;

            const userRef = ref(database, `users/${userId}/role`);
            const snapshot = await get(userRef);

            if (snapshot.exists()) {
                const userRole = snapshot.val();
                setRole(userRole);
                localStorage.setItem("userRole", userRole);
                console.log("✅ Login successful, role set to:", userRole);
            }
        } catch (error) {
            console.error("❌ Error during login:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logoutUser = async () => {
        setLoading(true);
        try {
            await signOut(auth);
            setUser(null);
            setRole(null);
            localStorage.removeItem("userRole");
            console.log("✅ User logged out successfully");
        } catch (error) {
            console.error("❌ Error during logout:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            role,
            loading,
            isInitializing,
            registerUser,
            loginUser,
            logoutUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
