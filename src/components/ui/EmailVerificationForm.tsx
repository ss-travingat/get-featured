"use client";

import { useState, useRef } from 'react';
import type { NextPage } from 'next';
import Image from "next/image";
import styles from './form.module.css';

const EmailVerificationForm: NextPage = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Basic email validation regex
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSendCode = () => {
    if (isValidEmail) {
      setStep('otp');
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      const focusIndex = Math.min(pastedData.length, 3);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits && value) return; // ignore non-digits

    const newOtp = [...otp];
    // Take the last character in case they type over an existing digit without selecting it
    const lastChar = digits.slice(-1);
    newOtp[index] = lastChar;
    setOtp(newOtp);

    // Auto-focus next input
    if (lastChar && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
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
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    maxLength={2} // Using 2 so overtyping produces a new character
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
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
