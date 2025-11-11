import React from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from './AuthLayout'
import styles from './AuthLayout.module.css'

const Signup = () => {
  const handleSubmit = (event) => {
    event.preventDefault()
  }

  const helper = (
    <>
      <span className={styles.helperTitle}>Invite your team</span>
      <p className={styles.note}>Create an account to add teammates, manage storefronts, and automate reporting.</p>
    </>
  )

  const footer = (
    <>
      <span>Already have an account?</span>
      <Link to='login'>Sign in</Link>
    </>
  )

  return (
    <AuthLayout title='Create an Account' subtitle='Start managing Fastcart in minutes.' helper={helper} footer={footer}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label htmlFor='signup-name'>Full name</label>
          <input id='signup-name' name='name' placeholder='Taylor Morris' required />
        </div>
        <div className={styles.field}>
          <label htmlFor='signup-email'>Work email</label>
          <input id='signup-email' type='email' name='email' placeholder='you@company.com' required />
        </div>
        <div className={styles.field}>
          <label htmlFor='signup-password'>Password</label>
          <input id='signup-password' type='password' name='password' placeholder='Create a secure password' required />
          <span className={styles.note}>At least 8 characters with a number and symbol.</span>
        </div>
        <button type='submit' className={styles.buttonPrimary}>
          Create account
        </button>
        <div className={styles.helperLinks}>
          <Link to='login'>Use SSO instead</Link>
          <Link to='confirm-email'>Verify email</Link>
        </div>
      </form>
    </AuthLayout>
  )
}

export default Signup
