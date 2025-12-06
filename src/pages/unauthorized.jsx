import React from 'react';
import { useRouter } from 'next/router';
import styles from './error.module.scss';

const UnauthorizedPage = () => {
  const router = useRouter();

  return (
    <div className={styles.errorPage}>
      <div className={styles.errorContent}>
        <div className={styles.errorCode}>403</div>
        <h1 className={styles.errorTitle}>Access Denied</h1>
        <p className={styles.errorMessage}>
          You don't have permission to access this page.
        </p>
        <p className={styles.errorDescription}>
          This page requires admin privileges. Please contact your system administrator if you believe you should have access.
        </p>
        <div className={styles.errorActions}>
          <button
            className="btn btn-primary"
            onClick={() => router.push('/')}
          >
            Go to Dashboard
          </button>
          <button
            className="btn btn-outline-secondary"
            onClick={() => router.back()}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
