import React, {useState, useEffect} from 'react';
import {Eye, EyeOff, AlertTriangle} from 'lucide-react'; // lucide-react에서 아이콘 가져오기
import styles from './LoginPage.module.css'

// 로고 컴포넌트
const Logo = () => (
    <img src="/public/favicon.png" alt="Logo" className={styles.logo}/>
);

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [csrfToken, setCsrfToken] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [view, setView] = useState('signIn'); // 'signIn' or 'forgotPassword'

    // CSRF 토큰을 가져오는 로직
    useEffect(() => {
        const fetchCsrfToken = async () => {
            try {
                const res = await fetch('/api/auth/csrf');
                if (!res.ok) throw new Error("CSRF token fetch failed");
                const data = await res.json();
                setCsrfToken(data.csrfToken);
            } catch (e) {
                console.error("CSRF 토큰을 가져오는데 실패했습니다.", e);
                setError("페이지를 로드하는데 실패했습니다. 새로고침 해주세요.");
            }
        };
        if (view === 'signIn') {
            fetchCsrfToken();
        }
    }, [view]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!csrfToken) {
            setError("인증 토큰이 없습니다. 페이지를 새로고침 해주세요.");
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/callback/credentials', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    email,
                    password,
                    csrfToken,
                    json: 'true',
                }),
            });

            if (res.ok) {
                console.log("로그인 성공!");
                window.location.href = '/';
            } else {
                const data = await res.json();
                setError(data.message || "이메일 또는 비밀번호가 틀렸습니다.");
            }
        } catch (e) {
            setError("로그인 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.");
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPasswordClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setView('forgotPassword');
    };

    const handleBackToSignInClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setView('signIn');
        setError('');
    };

    return (
        <div className={styles.container}>
            {view === 'signIn' ? (
                <div className={styles.loginBox}>
                    <Logo/>
                    <h1 className={styles.title}>Sign in to your account</h1>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="email" className="label">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="jsdoe@example.com"
                                className={styles.input}
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <div className={styles.passwordLabelContainer}>
                                <label htmlFor="password" className={styles.label}>Password</label>
                                <a href="#" onClick={handleForgotPasswordClick} className={styles.forgotPassword}>forgot
                                    password?</a>
                            </div>
                            <div className={styles.passwordInputWrapper}>
                                <input
                                    id="password"
                                    type={isPasswordVisible ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={styles.input}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                    className={styles.eyeIcon}
                                >
                                    {isPasswordVisible ? <EyeOff size={20}/> : <Eye size={20}/>}
                                </button>
                            </div>
                        </div>
                        {error && <p className="error">{error}</p>}
                        <button type="submit" className={styles.signInButton} disabled={isLoading}>
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>
                    <p className={styles.signUpText}>
                        No account yet? <a href="/auth/sign-up" className={styles.signUpLink}>Sign up</a>
                    </p>
                </div>
            ) : (
                <div className={`${styles.loginBox} ${styles.forgotPasswordBox}`}>
                    <AlertTriangle size={48} color="#F56565"/>
                    <h2 className={styles.forgotPasswordTitle}>Not available</h2>
                    <p className={styles.forgotPasswordText}>Password reset is not configured on this instance</p>
                    <div className={styles.buttonGroup}>
                        <button onClick={handleBackToSignInClick} className={styles.signInButton}>Sign In</button>
                        <button className={`${styles.signInButton} ${styles.secondaryButton}`}>Setup instructions</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoginPage;