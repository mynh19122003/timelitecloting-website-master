import React from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from './AuthLayout'
import styles from './AuthLayout.module.css'

const CheckEmail = () => {
  const footer = (
    <>
      <span>Ready to proceed?</span>
      <Link to='login'>Back to sign in</Link>
    </>
  )

  return (
    <AuthLayout
      title='Almost there!'
      subtitle='We sent a confirmation link to your email. Click it to activate your account.'
      footer={footer}
    >
      <div className={styles.helper} style={{ borderTop: 'none', paddingTop: 0 }}>
        <span className={styles.helperTitle}>Didn&apos;t receive the email?</span>
        <div className={styles.helperLinks}>
          <Link to='confirm-email'>Enter code manually</Link>
          <Link to='reset-password'>Use a different email</Link>
        </div>
      </div>
    </AuthLayout>
  )
}

export default CheckEmail
