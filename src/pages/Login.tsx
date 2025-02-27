import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const authContext = useContext(AuthContext);
    const navigate = useNavigate();

    if (!authContext) {
        throw new Error("Auth context must be used within an AuthProvider");
    }

    const { user, loginUser } = authContext;
    const isAuthenticated = !!user;

    useEffect(() => {
        console.log("🔍 Checking user:", user);
        console.log("🔍 Checking role:", authContext.role);

        if (user && authContext.role) {  // Ensure role is not null
            if (authContext.role === "admin") {
                console.log("✅ Redirecting to Admin Dashboard");
                navigate('/admin/dashboard');
            } else {
                console.log("✅ Redirecting to Home Page");
                navigate('/');
            }
        }
    }, [user, authContext.role, navigate]);



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        if (!email || !password) {
            setErrorMessage('Please enter both email and password');
            return;
        }

        setIsLoading(true);

        try {
            await loginUser(email, password);
            console.log("✅ Login successful, waiting for role to be fetched...");
        } catch (err: any) {
            setErrorMessage(err.message || 'Invalid credentials. Please try again.');
        } finally {
            setIsLoading(false);
        }

    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-4">
                            <div className="text-center mb-4">
                                <h2 className="fw-bold">Sign In</h2>
                                <p className="text-muted">
                                    Access your National University - Fairview branch student account
                                </p>
                            </div>

                            {errorMessage && (
                                <div className="alert alert-danger" role="alert">
                                    {errorMessage}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Student Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        placeholder="student@students.nu-fairview.edu.ph"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <div className="form-text">
                                        Must be a valid NU student email
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="d-grid gap-2">
                                    <button
                                        type="submit"
                                        className="btn btn-lg"
                                        style={{ backgroundColor: '#1434A4', color: '#FEE055' }}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <span>
                                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                <span className="ms-2">Signing in...</span>
                                            </span>
                                        ) : (
                                            'Sign In'
                                        )}
                                    </button>
                                </div>
                            </form>

                            <div className="text-center mt-4">
                                <p>
                                    Don't have an account?{' '}
                                    <Link to="/register" className="fw-bold" style={{ color: '#1434A4' }}>
                                        Sign Up
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;