import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        middleName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);

    const { register, isAuthenticated, error } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!formData.email.endsWith('@students.nu-fairview.edu.ph')) {
            newErrors.email = 'Must be a valid NU student email (@students.nu-fairview.edu.ph)';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/[a-z]/.test(formData.password)) {
            newErrors.password = 'Password must contain a lowercase letter';
        } else if (!/[A-Z]/.test(formData.password)) {
            newErrors.password = 'Password must contain an uppercase letter';
        } else if (!/[0-9]/.test(formData.password)) {
            newErrors.password = 'Password must contain a number';
        } else if (!/[!@#$%^&*]/.test(formData.password)) {
            newErrors.password = 'Password must contain a special character (!@#$%^&*)';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const success = await register({
                firstName: formData.firstName,
                lastName: formData.lastName,
                middleName: formData.middleName || undefined,
                email: formData.email,
                password: formData.password
            });

            if (success) {
                navigate('/');
            } else if (error) {
                setErrors({
                    ...errors,
                    form: error
                });
            }
        } catch (err) {
            setErrors({
                ...errors,
                form: 'An unexpected error occurred. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-4">
                            <div className="text-center mb-4">
                                <h2 className="fw-bold">Create an Account</h2>
                                <p className="text-muted">
                                    Join the National University online community
                                </p>
                            </div>

                            {errors.form && (
                                <div className="alert alert-danger" role="alert">
                                    {errors.form}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-4 mb-3">
                                        <label htmlFor="firstName" className="form-label">First Name*</label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                        />
                                        {errors.firstName && (
                                            <div className="invalid-feedback">{errors.firstName}</div>
                                        )}
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <label htmlFor="middleName" className="form-label">Middle Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="middleName"
                                            name="middleName"
                                            value={formData.middleName}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <label htmlFor="lastName" className="form-label">Last Name*</label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                        />
                                        {errors.lastName && (
                                            <div className="invalid-feedback">{errors.lastName}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Student Email*</label>
                                    <input
                                        type="email"
                                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                        id="email"
                                        name="email"
                                        placeholder="student@students.nu-fairview.edu.ph"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.email ? (
                                        <div className="invalid-feedback">{errors.email}</div>
                                    ) : (
                                        <div className="form-text">
                                            Must use your NU student email (@students.nu-fairview.edu.ph)
                                        </div>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">Password*</label>
                                    <input
                                        type="password"
                                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.password ? (
                                        <div className="invalid-feedback">{errors.password}</div>
                                    ) : (
                                        <div className="form-text">
                                            Must be at least 8 characters with lowercase, uppercase, number, and special character
                                        </div>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="confirmPassword" className="form-label">Confirm Password*</label>
                                    <input
                                        type="password"
                                        className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.confirmPassword && (
                                        <div className="invalid-feedback">{errors.confirmPassword}</div>
                                    )}
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
                                                <span className="ms-2">Creating Account...</span>
                                            </span>
                                        ) : (
                                            'Create Account'
                                        )}
                                    </button>
                                </div>
                            </form>

                            <div className="text-center mt-4">
                                <p>
                                    Already have an account?{' '}
                                    <Link to="/login" className="fw-bold" style={{ color: '#1434A4' }}>
                                        Sign In
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

export default Register;