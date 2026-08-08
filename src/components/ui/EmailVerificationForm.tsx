"use client";

import { useState } from 'react';
import type { NextPage } from 'next';
import Image from "next/image";
import styles from './form.module.css';

const EmailVerificationForm: NextPage = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [otp, setOtp] = useState(['', '', '', '']);
  
  // Basic email validation regex
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSendCode = () => {
    if (isValidEmail) {
      setStep('otp');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d+$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
  };

  if (step === 'otp') {
    return (
      <div className={styles.form}>
        <div className={styles.otpFieldParent}>
          <div className={styles.otpInner}>
            <div className={styles.emailField}>
              <Image className={styles.icon} width={100} height={100} sizes="100vw" alt="Email Icon" src="/mail-icon.png" />
              <div className={styles.otpHeader}>
                <div className={styles.emailLabel}>Verify your email</div>
                <div className={styles.submittedEmail}>{email}</div>
              </div>
              <div className={styles.otpInputsContainer}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    className={styles.otpInput}
                  />
                ))}
              </div>
            </div>
            <div className={styles.buttonText}>
              <button className={`${styles.button} ${styles.buttonActive}`}>
                Verify email
              </button>
              <div className={styles.resendCode} onClick={() => alert('Code resent!')}>
                Resend code
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.form}>
      <div className={styles.emailFieldParent}>
        <div className={styles.emailField}>
          <Image className={styles.icon} width={100} height={100} sizes="100vw" alt="Email Icon" src="/mail-icon.png" />
          <div className={styles.emailLabel}>Verify your email to apply</div>
          <div className={styles.emailInputContainer}>
            <input
              type="email"
              placeholder="e.g. james@email.com"
              className={styles.emailInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div className={styles.buttonText}>
          <button 
            className={`${styles.button} ${isValidEmail ? styles.buttonActive : ''}`}
            disabled={!isValidEmail}
            onClick={handleSendCode}
          >
            Send code
          </button>
          <div className={styles.emailLabel2}>
            We&apos;ll verify your email before continuing your application.
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationForm;
