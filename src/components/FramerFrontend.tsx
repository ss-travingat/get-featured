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
              <img className={"tf-icon"} width={100} height={100} alt="Email Icon" src={`https://cdn.travingat.com/landingpage-assets/get-featured/mail-icon.png`} />
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
      <div className={"tf-appFormParent"}>
        <div className={"tf-fieldContainer"}>
          <div className={"tf-fieldLabel"}>Full name</div>
          <div className={"tf-inputRow"}>
            <input type="text" placeholder="First name" className={"tf-textInput"} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <input type="text" placeholder="Last name" className={"tf-textInput"} value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
        </div>

        <div className={"tf-fieldContainer"}>
          <div className={"tf-fieldLabel"}>Email</div>
          <div className={"tf-inputRow"}>
            <input type="email" value={email} disabled className={"tf-textInput"} />
          </div>
        </div>

        <div className={"tf-fieldContainer"}>
          <div className={"tf-fieldLabel"}>Where are you from?</div>
          <div className={"tf-inputRow"}>
            <div className={"tf-selectWrapper"}>
              <div
                className={"tf-selectInput"}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
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
              <img
                src={`https://cdn.travingat.com/landingpage-assets/get-featured/dropdown-icon.svg`}
                alt="Toggle Dropdown"
                width={24}
                height={24}
                className={`${"tf-selectIcon"} ${isDropdownOpen ? "tf-selectIconOpen" : ''}`}
              />

              {isDropdownOpen && (
                <div className={"tf-dropdownMenu"}>
                  {countryOptions.map(country => (
                    <div
                      key={country.code}
                      className={`${"tf-dropdownItem"} ${selectedCountry === country.code ? "tf-dropdownItemSelected" : ''}`}
                      onClick={() => {
                        setSelectedCountry(country.code);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <span className={`fi fi-${country.code.toLowerCase()}`} />
                      {country.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={"tf-fieldContainer"}>
          <div className={"tf-fieldLabel"}>How many countries have you visited?</div>
          <div className={"tf-inputRow"}>
            <input
              type="number"
              placeholder="e.g. 10"
              className={"tf-textInput"}
              min={0}
              max={countryOptions.length}
              value={visitedCount}
              onChange={(e) => setVisitedCount(e.target.value)}
            />
          </div>
        </div>

        <div className={"tf-fieldContainer"}>
          <div className={"tf-fieldLabel"}>Share links to your travel photos</div>
          <div className={"tf-inputRow"}>
            <div className={"tf-inputWithButtonWrapper"}>
              <input
                type="text"
                placeholder={links.length >= 3 ? "Maximum 3 links reached" : "e.g. instagram.com/username"}
                className={"tf-textInputNoBorder"}
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (linkInput.trim() && links.length < 3 && !links.includes(linkInput.trim())) {
                      setLinks([...links, linkInput.trim()]);
                      setLinkInput('');
                    }
                  }
                }}
                disabled={links.length >= 3}
              />
              <button
                className={`${"tf-addLinkBtn"} ${linkInput.length > 0 && links.length < 3 && !links.includes(linkInput.trim()) ? "tf-addLinkBtnActive" : ''}`}
                disabled={linkInput.length === 0 || links.length >= 3 || links.includes(linkInput.trim())}
                onClick={() => {
                  if (linkInput.trim() && links.length < 3 && !links.includes(linkInput.trim())) {
                    setLinks([...links, linkInput.trim()]);
                    setLinkInput('');
                  }
                }}
              >
                Add
              </button>
            </div>
          </div>

          {links.map((link, index) => (
            <div key={index} className={"tf-addedLinkBadge"}>
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

        <button
          className={`${"tf-submitAppBtn"} ${isAppValid && !isLoading ? "tf-submitAppBtnActive" : ''}`}
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
          {isLoading ? 'Submitting...' : 'Submit'}
        </button>

        <div className={"tf-appFooterText"}>
          Applications are reviewed manually. If selected, we&apos;ll email you a private upload link to create your travel profile before launch.
        </div>
      </div>
    );
  }

  return (
    <div className={"tf-form"}>
      <div className={"tf-emailFieldParent"}>
        <div className={"tf-emailField"}>
          <img className={"tf-icon"} width={100} height={100} alt="Email Icon" src={`https://cdn.travingat.com/landingpage-assets/get-featured/mail-icon.png`} />
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
    <div className="tf-wrapper" style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'black', fontFamily: 'sans-serif', padding: '16px' }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        .tf-form {
  height: 678px;
  position: relative;
  border-radius: 20px;
  background-color: #111;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  box-sizing: border-box;
  text-align: center;
  font-size: 24px;
  color: #fff;
  font-family: var(--font-sans);
}

.tf-emailFieldParent {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
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
}

.tf-emailInputContainer {
  display: flex;
  padding: 12px 16px;
  justify-content: center;
  align-items: center;
  align-self: stretch;
}

.tf-emailInput {
  text-align: center;
  background-color: transparent;
  color: #fff;
  outline: none;
  letter-spacing: -0.5px;
  line-height: 32px;
  font-family: var(--font-sans);
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
  align-self: stretch;
  border-radius: 999px;
  background-color: #c0caff;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  color: #ECF0FF;
  font-weight: 500;
  letter-spacing: -0.01em;
  line-height: 20px;
  border: none;
  cursor: pointer;
  width: 100%;
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
  padding: 32px;
  box-sizing: border-box;
  gap: 32px;
  max-width: 100%;
  border-radius: 12px;
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
  padding: 32px;
  background-color: #111111;
  overflow: hidden;
  border-radius: 20px;
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

        .tf-wrapper * {
          box-sizing: border-box;
        }
      `}} />
      <div style={{ width: '100%', maxWidth: '28rem' }}>
        <EmailVerificationForm />
      </div>
    </div>
  );
}
