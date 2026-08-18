"use client";
import React, { useState, useRef } from 'react';
import { countries } from 'https://esm.sh/countries-list';

const countryOptions = Object.entries(countries)
  .map(([code, data]) => ({
    code,
    name: data.name,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const EmailVerificationForm = () => {
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

  const backendUrl = "https://get-featured.vercel.app"
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

      const resData = await fetch(backendUrl + '/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const res = await resData.json();

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

    const resData = await fetch(backendUrl + '/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp: otpString })
    });
    const res = await resData.json();

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
      <div className={"tf-form"}>
        <div className={"tf-otpFieldParent"}>
          <div className={"tf-otpInner"}>
            <div className={"tf-emailField"}>
              <div className={"tf-otpHeader"}>
                <div className={"tf-emailLabel"}>Verify your email</div>
                <div className={"tf-submittedEmail"}>{email}</div>
              </div>
              <div className={"tf-otpInputsContainer"}>
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
                    className={"tf-otpInput"}
                  />
                ))}
              </div>
            </div>
            <div className={"tf-buttonText"}>
              <button onClick={handleVerifyOtp} disabled={isLoading} className={`${"tf-button"} ${!isLoading ? "tf-buttonActive" : ''}`}>
                {isLoading ? 'Verifying...' : 'Verify email'}
              </button>
              <div className={"tf-resendCode"} onClick={() => alert('Code resent!')}>
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
      <div className={"tf-app-form"}>
        <div className={"tf-app-emailField"}>
          <div className={"tf-app-emailLabel"}>Full name</div>
          <div className={"tf-app-emailInputParent"}>
            <div className={"tf-app-emailInput"}>
              <input type="text" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', width: '100%', fontFamily: 'Inter', fontSize: '16px' }} />
            </div>
            <div className={"tf-app-emailInput"}>
              <input type="text" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', width: '100%', fontFamily: 'Inter', fontSize: '16px' }} />
            </div>
          </div>
        </div>

        <div className={"tf-app-emailField"}>
          <div className={"tf-app-emailLabel"}>Email</div>
          <div className={"tf-app-fullNameInput"}>
            <input type="email" value={email} disabled style={{ background: 'transparent', border: 'none', outline: 'none', color: '#525252', width: '100%', fontFamily: 'Inter', fontSize: '16px' }} />
          </div>
        </div>

        <div className={"tf-app-emailField"}>
          <div className={"tf-app-emailLabel"}>Where are you from?</div>
          <div className={"tf-selectWrapper"}>
            {!isDropdownOpen ? (
              <div
                className={"tf-app-countryInput"}
                onClick={() => setIsDropdownOpen(true)}
                style={{ cursor: 'pointer' }}
              >
                {selectedCountry ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, color: 'white' }}>
                    <span className={`fi fi-${selectedCountry.toLowerCase()}`} />
                    {countryOptions.find(c => c.code === selectedCountry)?.name}
                  </div>
                ) : (
                  <div style={{ flex: 1 }}>Select country</div>
                )}
                <img
                  src={`https://cdn.travingat.com/landingpage-assets/get-featured/dropdown-icon.svg`}
                  alt="Toggle Dropdown"
                  className={`${"tf-app-dropdownIcon"} ${isDropdownOpen ? "tf-selectIconOpen" : ''}`}
                />
              </div>
            ) : (
              <div style={{ width: '100%', paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, position: 'relative', background: 'black', borderRadius: 10, outline: '1px #1E1E1E solid', outlineOffset: '-1px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 24, height: 24, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.6 21L13.3 14.7C12.8 15.1 12.225 15.4167 11.575 15.65C10.925 15.8833 10.2333 16 9.5 16C7.68333 16 6.14583 15.3708 4.8875 14.1125C3.62917 12.8542 3 11.3167 3 9.5C3 7.68333 3.62917 6.14583 4.8875 4.8875C6.14583 3.62917 7.68333 3 9.5 3C11.3167 3 12.8542 3.62917 14.1125 4.8875C15.3708 6.14583 16 7.68333 16 9.5C16 10.2333 15.8833 10.925 15.65 11.575C15.4167 12.225 15.1 12.8 14.7 13.3L21 19.6L19.6 21ZM9.5 14C10.75 14 11.8125 13.5625 12.6875 12.6875C13.5625 11.8125 14 10.75 14 9.5C14 8.25 13.5625 7.1875 12.6875 6.3125C11.8125 5.4375 10.75 5 9.5 5C8.25 5 7.1875 5.4375 6.3125 6.3125C5.4375 7.1875 5 8.25 5 9.5C5 10.75 5.4375 11.8125 6.3125 12.6875C7.1875 13.5625 8.25 14 9.5 14Z" fill="#7C7C7C" />
                  </svg>
                </div>
                <div style={{ width: 1, height: 24, background: 'white', opacity: 0.2 }}></div>
                <input
                  autoFocus
                  type="text"
                  placeholder="Search country"
                  value={countrySearchQuery}
                  onChange={(e) => setCountrySearchQuery(e.target.value)}
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: 16, fontFamily: 'Inter', fontWeight: '400', lineHeight: '24px', width: '100%' }}
                />
              </div>
            )}

            {isDropdownOpen && (
              <div className={"tf-dropdownMenu"}>
                {filteredCountries.map(country => (
                  <div
                    key={country.code}
                    className={`${"tf-dropdownItem"} ${selectedCountry === country.code ? "tf-dropdownItemSelected" : ''}`}
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

        <div className={"tf-app-emailField"}>
          <div className={"tf-app-emailLabel"}>How many countries have you visited?</div>
          <div className={"tf-app-fullNameInput"}>
            <input
              type="number"
              placeholder="e.g. 10"
              min={0}
              max={countryOptions.length}
              value={visitedCount}
              onChange={(e) => setVisitedCount(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', width: '100%', fontFamily: 'Inter', fontSize: '16px' }}
            />
          </div>
        </div>

        <div className={"tf-app-emailField"}>
          <div className={"tf-app-emailLabel"}>Share links to your travel photos</div>
          <div className={"tf-app-emailInputContainer"}>
            <div className={"tf-app-emailInput4"}>
              <div className={"tf-app-socialMediainstagram"} />
              <div className={"tf-app-emailPlaceholder4"}>
                <input
                  type="text"
                  placeholder={links.length >= 3 ? "Maximum 3 links reached" : "e.g. instagram.com/username"}
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
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', width: '100%', fontFamily: 'Inter', fontSize: '16px' }}
                />
              </div>
              <div
                className={"tf-app-emailPlaceholderWrapper"}
                onClick={() => {
                  if (linkInput.trim() && isLinkInputValid && links.length < 3 && !links.includes(linkInput.trim())) {
                    setLinks([...links, linkInput.trim()]);
                    setLinkInput('');
                  }
                }}
                style={{
                  cursor: (linkInput.trim() && isLinkInputValid && links.length < 3 && !links.includes(linkInput.trim())) ? 'pointer' : 'not-allowed',
                  opacity: (linkInput.trim() && isLinkInputValid && links.length < 3 && !links.includes(linkInput.trim())) ? 1 : 0.5,
                  backgroundColor: (linkInput.trim() && isLinkInputValid && links.length < 3 && !links.includes(linkInput.trim())) ? 'white' : '#1a1a1a',
                  color: (linkInput.trim() && isLinkInputValid && links.length < 3 && !links.includes(linkInput.trim())) ? '#161616' : '#3d3d3d'
                }}
              >
                <div className={"tf-app-emailPlaceholder5"}>{`Add`}</div>
              </div>
            </div>
            {!isLinkInputValid && (
              <div style={{ width: '100%', color: '#989898', fontSize: '12px', fontFamily: 'Inter', fontWeight: '400', lineHeight: '16px', wordWrap: 'break-word', marginTop: '4px' }}>
                Enter a full link, e.g. instagram.com/username or flickr.com/photos/username
              </div>
            )}
            {links.map((link, index) => (
              <div key={index} className={"tf-addedLinkBadge"} style={{ marginTop: '10px' }}>
                <div className={"tf-addedLinkText"}>{link}</div>
                <div
                  className={"tf-addedLinkRemoveBtn"}
                  onClick={() => setLinks(links.filter((_, i) => i !== index))}
                >
                  <img src={`https://cdn.travingat.com/landingpage-assets/get-featured/close.svg`} alt="Remove link" width={8} height={8} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          className={`${"tf-app-button"} ${isAppValid && !isLoading ? "tf-submitAppBtnActive" : ''}`}
          disabled={!isAppValid || isLoading}
          onClick={async () => {
            setIsLoading(true);

            const resData = await fetch(backendUrl + '/api/auth/submit-application', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email, data: {
                  firstName,
                  lastName,
                  country: selectedCountry || '',
                  visitedCount: parseInt(visitedCount) || 0,
                  links
                }
              })
            });
            const res = await resData.json();

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
          <div className={"tf-app-button2"}>{isLoading ? 'Submitting...' : 'Submit'}</div>
        </button>

        <div className={"tf-app-fullNameLabel2"}>
          Applications are reviewed manually. If selected, we&apos;ll email you a private upload link to create your travel profile before launch.
        </div>
      </div>
    );
  }
return (
    <div className={"tf-form"}>
      <div className={"tf-emailFieldParent"}>
        <div className={"tf-emailField"}>
          <div className={"tf-emailLabel"}>Verify your email to apply</div>
          <div className={"tf-emailInputContainer"}>
            <input
              type="email"
              placeholder="e.g. james@email.com"
              className={"tf-emailInput"}
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
        <div className={"tf-buttonText"}>
          <button
            className={`${"tf-button"} ${isValidEmail && !isLoading ? "tf-buttonActive" : ''}`}
            disabled={!isValidEmail || isLoading}
            onClick={handleSendCode}
          >
            {isLoading ? 'Sending...' : 'Send code'}
          </button>
          <div className={"tf-emailLabel2"}>
            We&apos;ll verify your email before continuing your application.
          </div>
        </div>
      </div>
    </div>
  );
};




export default function FramerFrontend() {
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        .tf-form {
  position: relative;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  text-align: center;
  font-size: 24px;
  color: #fff;
  font-family: 'Inter Display', var(--font-sans);
  width: 100%;
  gap: 24px;
}

.tf-emailFieldParent {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  gap: 24px;
  max-width: 100%;
}

.tf-emailField {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.tf-icon {
  width: 100px;
  height: 100px;
  position: relative;
  border-radius: 16.81px;
  object-fit: cover;
}

.tf-emailLabel {
  align-self: stretch;
  position: relative;
  letter-spacing: -0.5px;
  line-height: 32px;
  font-weight: 500;
  font-size: 24px;
  text-align: center;
}

.tf-emailInputContainer {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  color: #2a2a2a;
}

.tf-emailInput {
  align-self: stretch;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  text-align: center;
  background-color: transparent;
  color: #fff;
  outline: none;
  border: none;
  letter-spacing: -0.5px;
  line-height: 32px;
  font-size: 24px;
  font-family: 'Inter Display', var(--font-sans);
  box-sizing: border-box;
  width: 100%;
}

.tf-emailInput::placeholder {
  color: #2a2a2a;
}

.tf-buttonText {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  text-align: left;
  font-size: 14px;
  color: #ecf0ff;
  font-family: var(--font-secondary);
}

.tf-button {
  width: 100%;
  position: relative;
  align-self: stretch;
  border-radius: 999px;
  background-color: #c0caff;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 18px;
  box-sizing: border-box;
  text-align: left;
  font-size: 16px;
  color: #ecf0ff;
  font-family: Inter, sans-serif;
  font-weight: 500;
  letter-spacing: -0.01em;
  line-height: 24px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tf-buttonActive {
  background-color: #5A45F9;
  color: #FFF;
}

.tf-emailLabel2 {
  align-self: stretch;
  position: relative;
  letter-spacing: -0.01em;
  line-height: 20px;
  color: #7c7c7c;
  text-align: center;
}

.tf-otpFieldParent {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  gap: 32px;
  max-width: 100%;
}

.tf-otpInner {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.tf-otpHeader {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.tf-submittedEmail {
  align-self: stretch;
  text-align: center;
  color: #7C7C7C;
  font-size: 14px;
  font-family: var(--font-secondary);
  font-weight: 400;
  line-height: 20px;
  word-wrap: break-word;
}

.tf-otpInputsContainer {
  height: 60px;
  display: inline-flex;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 10px;
}

.tf-otpInput {
  width: 62px;
  align-self: stretch;
  padding: 12px 16px;
  background-color: #000;
  border-radius: 10px;
  border: 1px solid #252525;
  color: #fff;
  text-align: center;
  font-size: 24px;
  font-family: var(--font-sans);
  box-sizing: border-box;
}

.tf-otpInput:focus {
  outline: none;
  border-color: #fff;
}

.tf-resendCode {
  text-align: center;
  color: #7C7C7C;
  font-size: 14px;
  font-family: var(--font-secondary);
  font-weight: 400;
  line-height: 20px;
  cursor: pointer;
}

.tf-resendCode:hover {
  text-decoration: underline;
}

.tf-appFormParent {
  width: 100%;
  display: inline-flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 20px;
  box-sizing: border-box;
}

.tf-fieldContainer {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 10px;
}

.tf-fieldLabel {
  align-self: stretch;
  color: white;
  font-size: 14px;
  font-family: var(--font-secondary);
  font-weight: 400;
  line-height: 20px;
  word-wrap: break-word;
  text-align: left;
}

.tf-inputRow {
  align-self: stretch;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
}

.tf-textInput {
  flex: 1 1 0;
  padding: 12px 16px;
  background-color: black;
  border-radius: 10px;
  border: 1px solid #1E1E1E;
  color: white;
  font-size: 16px;
  font-family: var(--font-secondary);
  font-weight: 400;
  line-height: 24px;
  outline: none;
  box-sizing: border-box;
  width: 100%;
}

.tf-textInput[type=number]::-webkit-outer-spin-button,
.tf-textInput[type=number]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.tf-textInput[type=number] {
  -moz-appearance: textfield;
}

.tf-textInput::placeholder {
  color: #525252;
}

.tf-textInput:focus {
  border-color: #525252;
}

.tf-textInput:disabled {
  color: #525252;
}

.tf-inputWithButtonWrapper {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
  padding: 12px 8px 12px 16px;
  background-color: black;
  border-radius: 10px;
  border: 1px solid #1E1E1E;
  box-sizing: border-box;
}

.tf-inputWithButtonWrapper:focus-within {
  border-color: #525252;
}

.tf-textInputNoBorder {
  flex: 1 1 0;
  background-color: transparent;
  border: none;
  color: white;
  font-size: 16px;
  font-family: var(--font-secondary);
  font-weight: 400;
  line-height: 24px;
  outline: none;
  padding: 0;
}

.tf-textInputNoBorder::placeholder {
  color: #525252;
}

.tf-addLinkBtn {
  padding: 8px;
  background-color: #1A1A1A;
  border-radius: 6px;
  border: 1px solid #353535;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  color: #3D3D3D;
  font-size: 12px;
  font-family: var(--font-secondary);
  font-weight: 500;
  line-height: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tf-addLinkBtnActive {
  color: #161616;
  background-color: white;
}

.tf-selectWrapper {
  position: relative;
  flex: 1 1 0;
  display: flex;
}

.tf-selectInput {
  width: 100%;
  appearance: none;
  padding: 12px 40px 12px 16px;
  background-color: black;
  border-radius: 10px;
  border: 1px solid #1E1E1E;
  color: white;
  font-size: 16px;
  font-family: var(--font-secondary);
  font-weight: 400;
  line-height: 24px;
  outline: none;
  box-sizing: border-box;
}

.tf-selectInput:invalid {
  color: #525252;
}

.tf-selectIcon {
  width: 24px;
  height: 24px;
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  transition: transform 0.2s ease;
}

.tf-selectIconOpen {
  transform: translateY(-50%) rotate(180deg);
}

.tf-submitAppBtn {
  align-self: stretch;
  padding: 10px 18px;
  background-color: #C0CAFF;
  border-radius: 999px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ECF0FF;
  font-size: 16px;
  font-family: var(--font-secondary);
  font-weight: 500;
  line-height: 24px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tf-submitAppBtnActive {
  background-color: #5A45F9;
  color: white;
}

.tf-addedLinkBadge {
  width: 100%;
  padding: 6px 6px 6px 10px;
  background-color: #1E1E1E;
  border-radius: 8px;
  border: 1px solid #252525;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 12px;
  box-sizing: border-box;
}

.tf-addedLinkText {
  flex: 1 1 0;
  color: white;
  font-size: 14px;
  font-family: var(--font-secondary);
  font-weight: 400;
  line-height: 20px;
  word-wrap: break-word;
  text-align: left;
}

.tf-addedLinkRemoveBtn {
  padding: 6px;
  background-color: #404040;
  border-radius: 99px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.tf-addedLinkRemoveBtn:hover {
  background-color: #525252;
}

.tf-appFooterText {
  align-self: stretch;
  text-align: center;
  color: white;
  font-size: 14px;
  font-family: var(--font-secondary);
  font-weight: 400;
  line-height: 20px;
}


.tf-dropdownMenu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  background-color: #1a1a1a;
  border-radius: 10px;
  border: 1px solid #1E1E1E;
  margin-top: 4px;
  z-index: 10;
  padding: 8px 0;
}

.tf-dropdownItem {
  padding: 10px 16px;
  color: white;
  font-size: 16px;
  font-family: var(--font-secondary);
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tf-dropdownItem:hover {
  background-color: #353535;
}

.tf-dropdownItemSelected {
  background-color: #5A45F9;
}

.tf-form *, .tf-appFormParent * {
  box-sizing: border-box;
}

@media (max-width: 1024px) {
  .tf-icon {
    display: none;
  }
  .tf-emailLabel {
    font-size: 20px;
    line-height: 28px;
  }
}


.tf-app-form {
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  text-align: left;
  font-size: 14px;
  color: #fff;
  font-family: Inter, var(--font-sans);
}
.tf-app-emailField {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}
.tf-app-emailLabel {
  align-self: stretch;
  position: relative;
  letter-spacing: -0.01em;
  line-height: 20px;
}
.tf-app-emailInputParent {
  align-self: stretch;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  color: #525252;
}
.tf-app-emailInput {
  flex: 1;
  border-radius: 10px;
  background-color: #000;
  border: 1px solid #1e1e1e;
  display: flex;
  align-items: center;
  padding: 12px 16px;
}
.tf-app-countryInput {
  align-self: stretch;
  border-radius: 10px;
  background-color: #000;
  border: 1px solid #1e1e1e;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 8px;
  font-size: 16px;
  color: #525252;
}
.tf-app-dropdownIcon {
  height: 24px;
  width: 24px;
  position: relative;
  object-fit: cover;
}
.tf-app-fullNameInput {
  align-self: stretch;
  border-radius: 10px;
  background-color: #000;
  border: 1px solid #1e1e1e;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  font-size: 16px;
  color: #525252;
}
.tf-app-emailInputContainer {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-size: 16px;
  color: #525252;
}
.tf-app-emailInput4 {
  align-self: stretch;
  height: 48px;
  border-radius: 10px;
  background-color: #000;
  border: 1px solid #1e1e1e;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding: 12px 8px 12px 16px;
  gap: 8px;
}
.tf-app-socialMediainstagram {
  height: 24px;
  width: 24px;
  position: relative;
  display: none;
  flex-shrink: 0;
}
.tf-app-emailPlaceholder4 {
  flex: 1;
  position: relative;
  letter-spacing: -0.01em;
  line-height: 24px;
  flex-shrink: 0;
}
.tf-app-emailPlaceholderWrapper {
  border-radius: 6px;
  background-color: #1a1a1a;
  border: 1px solid #353535;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  flex-shrink: 0;
  font-size: 12px;
  color: #3d3d3d;
}
.tf-app-emailPlaceholder5 {
  position: relative;
  letter-spacing: -0.01em;
  line-height: 16px;
  font-weight: 500;
}
.tf-app-button {
  align-self: stretch;
  border-radius: 999px;
  background-color: #c0caff;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 18px;
  font-size: 16px;
  color: #ecf0ff;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}
.tf-app-button2 {
  position: relative;
  letter-spacing: -0.01em;
  line-height: 24px;
  font-weight: 500;
}
.tf-app-fullNameLabel2 {
  align-self: stretch;
  position: relative;
  letter-spacing: -0.01em;
  line-height: 20px;
  text-align: center;
  color: #989898;
}
`}} />
      <EmailVerificationForm />
    </>
  );
}
