import React from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from './AuthLayout'
import styles from './AuthLayout.module.css'

const ResetPassword = () => {
  const handleSubmit = (event) => {
    event.preventDefault()
  }

  const footer = (
    <>
      <span>Remembered your password?</span>
      <Link to='login'>Back to sign in</Link>
    </>
  )

  return (
    <AuthLayout
      title='Password Reset'
      subtitle='Enter the email associated with your Fastcart account.'
      footer={footer}
    >
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label htmlFor='reset-email'>Email</label>
          <input id='reset-email' type='email' name='email' placeholder='you@company.com' required />
        </div>
        <button type='submit' className={styles.buttonPrimary}>
          Send reset link
        </button>
        <div className={styles.alert}>
          <strong>Tip:</strong> Check spam and promotions folders if you don&apos;t see the email within a few minutes.
        </div>
      </form>
    </AuthLayout>
  )
}

export default ResetPassword
