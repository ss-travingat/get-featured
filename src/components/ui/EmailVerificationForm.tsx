"use client";

import { useState, useRef } from 'react';
import type { NextPage } from 'next';
import Image from "next/image";
import { countries } from 'countries-list';
import styles from './form.module.css';
import { requestOtpAction, verifyOtpAction, submitApplicationAction } from '@/app/actions/auth';

const countryOptions = Object.entries(countries)
  .map(([code, data]) => ({
    code,
    name: data.name,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const EmailVerificationForm: NextPage = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'otp' | 'application'>('email');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [linkInput, setLinkInput] = useState('');
  const [links, setLinks] = useState<string[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [visitedCount, setVisitedCount] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Basic email validation regex
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const filteredCountries = countryOptions.filter(c => c.name.toLowerCase().includes(countrySearchQuery.toLowerCase()));

  const isLinkInputValid = linkInput.trim().length === 0 || (linkInput.trim().includes('.') && !linkInput.trim().includes(' '));

  const isAppValid = firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    selectedCountry !== null &&
    visitedCount !== '' &&
    links.length > 0;

  const handleSendCode = async () => {
    if (isValidEmail) {
      setIsLoading(true);
      const res = await requestOtpAction(email);
      setIsLoading(false);
      
      if (res.error) {
        alert(res.error);
        return;
      }
      
      setStep('otp');
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    const otpString = otp.join('');
    const res = await verifyOtpAction(email, otpString);
    setIsLoading(false);
    
    if (res.error) {
      alert(res.error);
      return;
    }
    
    setStep('application');
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
    // Submit OTP on enter
    if (e.key === 'Enter') {
      handleVerifyOtp();
    }
  };

  if (step === 'otp') {
    return (
      <div className={styles.form}>
        <div className={styles.otpFieldParent}>
          <div className={styles.otpInner}>
            <div className={styles.emailField}>
              <Image className={styles.icon} width={100} height={100} sizes="100vw" alt="Email Icon" src={`${process.env.NEXT_PUBLIC_LANDING_ASSETS_CDN_BASE}/get-featured/mail-icon.png`} />
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
              <button onClick={handleVerifyOtp} disabled={isLoading} className={`${styles.button} ${!isLoading ? styles.buttonActive : ''}`}>
                {isLoading ? 'Verifying...' : 'Verify email'}
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
  if (step === 'application') {
    return (
      <div className={styles.appFormParent}>
        <div className={styles.fieldContainer}>
          <div className={styles.fieldLabel}>Full name</div>
          <div className={styles.inputRow}>
            <input type="text" placeholder="First name" className={styles.textInput} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <input type="text" placeholder="Last name" className={styles.textInput} value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
        </div>

        <div className={styles.fieldContainer}>
          <div className={styles.fieldLabel}>Email</div>
          <div className={styles.inputRow}>
            <input type="email" value={email} disabled className={styles.textInput} />
          </div>
        </div>

        <div className={styles.fieldContainer}>
          <div className={styles.fieldLabel}>Where are you from?</div>
          <div className={styles.inputRow}>
            <div className={styles.selectWrapper}>
              {!isDropdownOpen ? (
                <>
                  <div
                    className={styles.selectInput}
                    onClick={() => setIsDropdownOpen(true)}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    {selectedCountry ? (
                      <>
                        <span className={`fi fi-${selectedCountry.toLowerCase()}`} />
                        {countryOptions.find(c => c.code === selectedCountry)?.name}
                      </>
                    ) : (
                      <span style={{ color: '#525252' }}>Select country</span>
                    )}
                  </div>
                  <Image
                    src={`${process.env.NEXT_PUBLIC_LANDING_ASSETS_CDN_BASE}/get-featured/dropdown-icon.svg`}
                    alt="Toggle Dropdown"
                    width={24}
                    height={24}
                    className={`${styles.selectIcon} ${isDropdownOpen ? styles.selectIconOpen : ''}`}
                  />
                </>
              ) : (
                <div style={{width: '100%', paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, position: 'relative', background: 'black', borderRadius: 10, outline: '1px #989898 solid', outlineOffset: '-1px', display: 'flex', alignItems: 'center', gap: 12}}>
                    <div style={{width: 24, height: 24, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19.6 21L13.3 14.7C12.8 15.1 12.225 15.4167 11.575 15.65C10.925 15.8833 10.2333 16 9.5 16C7.68333 16 6.14583 15.3708 4.8875 14.1125C3.62917 12.8542 3 11.3167 3 9.5C3 7.68333 3.62917 6.14583 4.8875 4.8875C6.14583 3.62917 7.68333 3 9.5 3C11.3167 3 12.8542 3.62917 14.1125 4.8875C15.3708 6.14583 16 7.68333 16 9.5C16 10.2333 15.8833 10.925 15.65 11.575C15.4167 12.225 15.1 12.8 14.7 13.3L21 19.6L19.6 21ZM9.5 14C10.75 14 11.8125 13.5625 12.6875 12.6875C13.5625 11.8125 14 10.75 14 9.5C14 8.25 13.5625 7.1875 12.6875 6.3125C11.8125 5.4375 10.75 5 9.5 5C8.25 5 7.1875 5.4375 6.3125 6.3125C5.4375 7.1875 5 8.25 5 9.5C5 10.75 5.4375 11.8125 6.3125 12.6875C7.1875 13.5625 8.25 14 9.5 14Z" fill="#7C7C7C"/>
                        </svg>
                    </div>
                    <div style={{width: 1, height: 24, background: 'white', opacity: 0.2}}></div>
                    <input 
                        autoFocus
                        type="text"
                        placeholder="Search country"
                        value={countrySearchQuery}
                        onChange={(e) => setCountrySearchQuery(e.target.value)}
                        style={{background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: 16, fontFamily: 'Inter', fontWeight: '400', lineHeight: '24px', width: '100%'}}
                    />
                </div>
              )}

              {isDropdownOpen && (
                <div className={styles.dropdownMenu}>
                  {filteredCountries.map(country => (
                    <div
                      key={country.code}
                      className={`${styles.dropdownItem} ${selectedCountry === country.code ? styles.dropdownItemSelected : ''}`}
                      onClick={() => {
                        setSelectedCountry(country.code);
                        setIsDropdownOpen(false);
                        setCountrySearchQuery('');
                      }}
                    >
                      <span className={`fi fi-${country.code.toLowerCase()}`} />
                      {country.name}
                    </div>
                  ))}
                  {filteredCountries.length === 0 && (
                    <div style={{ padding: '10px 16px', color: '#7C7C7C' }}>No countries found</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.fieldContainer}>
          <div className={styles.fieldLabel}>How many countries have you visited?</div>
          <div className={styles.inputRow}>
            <input
              type="number"
              placeholder="e.g. 10"
              className={styles.textInput}
              min={0}
              max={countryOptions.length}
              value={visitedCount}
              onChange={(e) => setVisitedCount(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.fieldContainer}>
          <div className={styles.fieldLabel}>Share links to your travel photos</div>
          <div className={styles.inputRow}>
            <div className={styles.inputWithButtonWrapper}>
              <input
                type="text"
                placeholder={links.length >= 3 ? "Maximum 3 links reached" : "e.g. instagram.com/username"}
                className={styles.textInputNoBorder}
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (linkInput.trim() && isLinkInputValid && links.length < 3 && !links.includes(linkInput.trim())) {
                      setLinks([...links, linkInput.trim()]);
                      setLinkInput('');
                    }
                  }
                }}
                disabled={links.length >= 3}
              />
              <button
                className={`${styles.addLinkBtn} ${linkInput.trim().length > 0 && isLinkInputValid && links.length < 3 && !links.includes(linkInput.trim()) ? styles.addLinkBtnActive : ''}`}
                disabled={!isLinkInputValid || linkInput.trim().length === 0 || links.length >= 3 || links.includes(linkInput.trim())}
                onClick={() => {
                  if (linkInput.trim() && isLinkInputValid && links.length < 3 && !links.includes(linkInput.trim())) {
                    setLinks([...links, linkInput.trim()]);
                    setLinkInput('');
                  }
                }}
              >
                Add
              </button>
            </div>
          </div>
          {!isLinkInputValid && (
            <div style={{width: '100%', color: '#F0526A', fontSize: 12, fontFamily: 'Inter', fontWeight: '400', lineHeight: '16px', wordWrap: 'break-word', marginTop: '4px'}}>
              Enter a full link, e.g. instagram.com/username or flickr.com/photos/username
            </div>
          )}

          {links.map((link, index) => (
            <div key={index} className={styles.addedLinkBadge}>
              <div className={styles.addedLinkText}>{link}</div>
              <div
                className={styles.addedLinkRemoveBtn}
                onClick={() => setLinks(links.filter((_, i) => i !== index))}
              >
                <Image src={`${process.env.NEXT_PUBLIC_LANDING_ASSETS_CDN_BASE}/get-featured/close.svg`} alt="Remove link" width={8} height={8} />
              </div>
            </div>
          ))}
        </div>

        <button
          className={`${styles.submitAppBtn} ${isAppValid && !isLoading ? styles.submitAppBtnActive : ''}`}
          disabled={!isAppValid || isLoading}
          onClick={async () => {
            setIsLoading(true);
            const res = await submitApplicationAction(email, {
              firstName,
              lastName,
              country: selectedCountry || '',
              visitedCount: parseInt(visitedCount) || 0,
              links
            });
            setIsLoading(false);
            
            if (res.error) {
              alert(res.error);
              return;
            }
            
            alert('Your application has been submitted successfully!');
            // Reset form state to return to home page view
            setStep('email');
            setEmail('');
            setOtp(['', '', '', '']);
            setFirstName('');
            setLastName('');
            setVisitedCount('');
            setLinks([]);
            setSelectedCountry(null);
          }}
        >
          {isLoading ? 'Submitting...' : 'Submit'}
        </button>

        <div className={styles.appFooterText}>
          Applications are reviewed manually. If selected, we&apos;ll email you a private upload link to create your travel profile before launch.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.form}>
      <div className={styles.emailFieldParent}>
        <div className={styles.emailField}>
          <Image className={styles.icon} width={100} height={100} sizes="100vw" alt="Email Icon" src={`${process.env.NEXT_PUBLIC_LANDING_ASSETS_CDN_BASE}/get-featured/mail-icon.png`} />
          <div className={styles.emailLabel}>Verify your email to apply</div>
          <div className={styles.emailInputContainer}>
            <input
              type="email"
              placeholder="e.g. james@email.com"
              className={styles.emailInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && isValidEmail) {
                  e.preventDefault();
                  handleSendCode();
                }
              }}
            />
          </div>
        </div>
        <div className={styles.buttonText}>
          <button
            className={`${styles.button} ${isValidEmail && !isLoading ? styles.buttonActive : ''}`}
            disabled={!isValidEmail || isLoading}
            onClick={handleSendCode}
          >
            {isLoading ? 'Sending...' : 'Send code'}
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
