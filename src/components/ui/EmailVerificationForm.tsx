import type { NextPage } from 'next';
import Image from "next/image";
import styles from './form.module.css';

const EmailVerificationForm: NextPage = () => {
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
            />
          </div>
        </div>
        <div className={styles.buttonText}>
          <button className={styles.button}>
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
