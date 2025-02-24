import React, { useContext, useState, useEffect } from "react";
import AuthContext from "../context/AuthContext";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth, database } from "../config/firebase"; // ✅ Use Realtime Database
import { ref, get } from "firebase/database";

const Profile: React.FC = () => {
    const authContext = useContext(AuthContext);
    const [resetStatus, setResetStatus] = useState<string | null>(null);
    const [userData, setUserData] = useState<{ fullName?: string; userId?: string; phoneNumber?: string }>({});

    if (!authContext) {
        return <p className="text-center py-5">Loading profile...</p>;
    }

    const { user, logoutUser } = authContext;

    useEffect(() => {
        if (!user) return;

        const fetchUserData = async () => {
            try {
                const userRef = ref(database, `users/${user.uid}`);
                const snapshot = await get(userRef);

                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const fullName = `${data.firstName || ""} ${data.middleName ? data.middleName + " " : ""}${data.lastName || ""}`.trim();

                    setUserData({
                        fullName,
                        userId: data.id || "Not available",
                        phoneNumber: data.phoneNumber || "Not provided",
                    });
                } else {
                    console.warn("⚠ No user data found.");
                }
            } catch (error) {
                console.error("❌ Error fetching user details:", error);
            }
        };

        fetchUserData();
    }, [user]);

    const handleResetPassword = async () => {
        if (!user?.email) return;

        try {
            await sendPasswordResetEmail(auth, user.email);
            setResetStatus("✅ Password reset email sent! Check your inbox.");
        } catch (error) {
            console.error("❌ Error sending password reset email:", error);
            setResetStatus("❌ Failed to send reset email. Try again later.");
        }
    };

    return (
        <div className="container py-5">
            <div className="card border-0 shadow-sm p-4 mx-auto" style={{ maxWidth: "500px" }}>
                <h2 className="text-center mb-4">👤 My Profile</h2>

                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Full Name:</strong> {userData.fullName || "Not provided"}</p>
                <p><strong>Student ID:</strong> {userData.userId || "Not available"}</p>
                <p><strong>Phone Number:</strong> {userData.phoneNumber || "Not provided"}</p>

                <hr />

                <button className="btn btn-warning w-100 mb-2" onClick={handleResetPassword}>
                    🔑 Reset Password
                </button>

                {resetStatus && <p className="text-center mt-2">{resetStatus}</p>}

                <button className="btn btn-danger w-100" onClick={logoutUser}>
                    🚪 Logout
                </button>
            </div>
        </div>
    );
};

export default Profile;
