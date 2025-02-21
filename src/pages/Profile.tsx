import React, { useContext } from "react";
import AuthContext from "../context/AuthContext";

const Profile: React.FC = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <div className="container py-5">
            <h2>My Profile</h2>
            <p><strong>Email:</strong> {user?.email}</p>
            <button className="btn btn-danger" onClick={logout}>
                Logout
            </button>
        </div>
    );
};

export default Profile;
