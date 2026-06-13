import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api';
import { toast } from 'react-toastify';
import Input from '../components/atoms/Input/Input';
import Button from '../components/atoms/Button/Button';
import styles from './AuthPage.module.css';

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const AtIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = ({ show }) =>
  show ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

const PasswordStrengthBar = ({ password }) => {
  const getStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    return Math.min(score, 4);
  };

  const strength = getStrength();
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', '#ff4444', '#ffab00', '#2196f3', '#00c853'];

  if (!password) return null;

  return (
    <div className={styles.strengthWrap}>
      <div className={styles.strengthBars}>
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={styles.strengthSegment}
            style={{
              backgroundColor:
                level <= strength ? colors[strength] : 'var(--bg-hover)',
            }}
          />
        ))}
      </div>
      <span className={styles.strengthLabel} style={{ color: colors[strength] }}>
        {labels[strength]}
      </span>
    </div>
  );
};

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validate = () => {
    const errs = {};

    if (!formData.firstName.trim()) {
      errs.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 5) {
      errs.firstName = 'First name must be at least 5 characters';
    } else if (!/^[A-Za-z]+$/.test(formData.firstName.trim())) {
      errs.firstName = 'First name can only contain letters';
    }

    if (!formData.lastName.trim()) {
      errs.lastName = 'Last name is required';
    } else if (!/^[A-Za-z]+$/.test(formData.lastName.trim())) {
      errs.lastName = 'Last name can only contain letters';
    }

    if (!formData.username.trim()) {
      errs.username = 'Username is required';
    } else if (formData.username.trim().length < 3) {
      errs.username = 'Username must be at least 3 characters';
    } else if (formData.username.trim().length > 20) {
      errs.username = 'Username must be at most 20 characters';
    } else if (!/^[A-Za-z0-9_]+$/.test(formData.username.trim())) {
      errs.username = 'Username can only contain letters, numbers and underscores';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 8 || formData.password.length > 15) {
      errs.password = 'Password must be between 8 and 15 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      errs.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(formData.password)) {
      errs.password = 'Password must contain at least one lowercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      errs.password = 'Password must contain at least one number';
    }

    return errs;
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await authApi.register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim(),
        password: formData.password,
      });
      toast.success('Account created successfully! Please sign in.');
      navigate('/login');
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logoWrap}>
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#FF0000" />
              <path d="M11 9L23 16L11 23V9Z" fill="white" />
            </svg>
          </div>
          <h1 className={styles.title}>Create your account</h1>
          <p className={styles.subtitle}>Join StreamVault and start streaming today.</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {errors.general && (
            <div className={styles.generalError}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {errors.general}
            </div>
          )}

          <div className={styles.row}>
            <Input
              label="First name"
              type="text"
              placeholder="John"
              value={formData.firstName}
              onChange={handleChange('firstName')}
              error={errors.firstName}
              leftIcon={<UserIcon />}
              autoComplete="given-name"
            />
            <Input
              label="Last name"
              type="text"
              placeholder="Doe"
              value={formData.lastName}
              onChange={handleChange('lastName')}
              error={errors.lastName}
              leftIcon={<UserIcon />}
              autoComplete="family-name"
            />
          </div>

          <Input
            label="Username"
            type="text"
            placeholder="johndoe123"
            value={formData.username}
            onChange={handleChange('username')}
            error={errors.username}
            leftIcon={<AtIcon />}
            hint="3-20 characters, letters, numbers and underscores only. This will be used to sign in."
            autoComplete="username"
          />

          <div>
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange('password')}
              error={errors.password}
              leftIcon={<LockIcon />}
              hint="8-15 characters, must include uppercase, lowercase and numbers"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className={styles.eyeBtn}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon show={showPassword} />
                </button>
              }
              autoComplete="new-password"
            />
            <PasswordStrengthBar password={formData.password} />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          >
            Create Account
          </Button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Already have an account?{' '}
            <Link to="/login" className={styles.footerLink}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
