import React from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from './AuthLayout'
import styles from './AuthLayout.module.css'

const ConfirmEmail = () => {
  const handleSubmit = (event) => {
    event.preventDefault()
  }

  const footer = (
    <>
      <span>Didn&apos;t get a code?</span>
      <Link to='check-email'>Resend</Link>
    </>
  )

  return (
    <AuthLayout
      title='Confirm Email'
      subtitle='Enter the 6-digit verification code we sent to your inbox.'
      footer={footer}
    >
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label htmlFor='code'>Verification code</label>
          <div className={styles.codeInputs}>
            {Array.from({ length: 6 }).map((_, index) => (
              <input key={index} type='text' inputMode='numeric' maxLength={1} name={`code-${index}`} required />
            ))}
          </div>
        </div>
        <button type='submit' className={styles.buttonPrimary}>
          Verify account
        </button>
      </form>
    </AuthLayout>
  )
}

export default ConfirmEmail
