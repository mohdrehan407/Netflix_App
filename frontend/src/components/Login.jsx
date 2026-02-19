import React, { useState } from 'react';
import './Login.css';
import api from '../services/api';

const Login = ({ onLoginSuccess }) => {
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [uname, setUname] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        try {
            if (isSignup) {
                await api.signup(uname, email, password, phone);
                // After signup: stay on login page, switch to Sign In form
                setUname('');
                setPhone('');
                setPassword('');
                setIsSignup(false);
                setSuccessMsg('Account created! Please sign in.');
            } else {
                const data = await api.login(email, password);
                const userData = data.user || { email };
                onLoginSuccess(userData);
            }
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Something went wrong. Please try again.';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="netflix-login">
            {/* Background collage overlay */}
            <div className="netflix-bg-overlay"></div>

            {/* Netflix Navbar */}
            <div className="netflix-nav">
                <img
                    className="netflix-logo"
                    src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
                    alt="Netflix"
                />
                <div className="netflix-nav-right">
                    <button className="netflix-nav-btn" onClick={() => { setIsSignup(false); setError(''); setSuccessMsg(''); }}>Sign In</button>
                    <button className="netflix-nav-btn red" onClick={() => { setIsSignup(true); setError(''); setSuccessMsg(''); }}>Sign Up</button>
                </div>
            </div>

            {/* Login Form Card */}
            <div className="netflix-form-wrapper">
                <div className="netflix-form-card">
                    <form onSubmit={handleSubmit}>
                        <h1>{isSignup ? 'Sign Up' : 'Sign In'}</h1>

                        {error && <div className="netflix-error">{error}</div>}
                        {successMsg && <div className="netflix-success">{successMsg}</div>}

                        {isSignup && (
                            <div className="netflix-input-group">
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={uname}
                                    onChange={(e) => setUname(e.target.value)}
                                    required={isSignup}
                                    className="netflix-input"
                                    id="signup-name"
                                />
                            </div>
                        )}

                        {isSignup && (
                            <div className="netflix-input-group">
                                <input
                                    type="tel"
                                    placeholder="Mobile Number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required={isSignup}
                                    className="netflix-input"
                                    id="signup-phone"
                                />
                            </div>
                        )}

                        <div className="netflix-input-group">
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="netflix-input"
                                id="login-email"
                            />
                        </div>

                        <div className="netflix-input-group">
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="netflix-input"
                                id="login-password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="netflix-submit-btn"
                            disabled={loading}
                            id="submit-btn"
                        >
                            {loading ? 'Please Wait...' : (isSignup ? 'Sign Up' : 'Sign In')}
                        </button>

                        {!isSignup && (
                            <div className="netflix-options">
                                <label className="netflix-remember">
                                    <input type="checkbox" id="remember-me" />
                                    <span>Remember me</span>
                                </label>
                                <span className="netflix-help">Need Help?</span>
                            </div>
                        )}

                        <div className="netflix-switch">
                            {isSignup
                                ? <p>Already subscribed to Netflix? <span onClick={() => { setIsSignup(false); setError(''); setSuccessMsg(''); }}>Sign In</span></p>
                                : <p>New to Netflix? <span onClick={() => { setIsSignup(true); setError(''); setSuccessMsg(''); }}>Sign up now</span></p>
                            }
                        </div>

                        {!isSignup && (
                            <p className="netflix-recaptcha">
                                This page is protected by Google reCAPTCHA to ensure you're not a bot.
                                <span className="netflix-link"> Learn more.</span>
                            </p>
                        )}
                    </form>
                </div>
            </div>

            {/* Footer */}
            <div className="netflix-footer">
                <p>Questions? Call <a href="tel:000-800-919-1694">000-800-919-1694</a></p>
                <div className="netflix-footer-links">
                    <span>FAQ</span>
                    <span>Help Centre</span>
                    <span>Terms of Use</span>
                    <span>Privacy</span>
                    <span>Cookie Preferences</span>
                    <span>Corporate Information</span>
                </div>
            </div>
        </div>
    );
};

export default Login;
