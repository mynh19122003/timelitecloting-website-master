import React, { useMemo, useState } from 'react';
import { FiLock, FiUser, FiGlobe } from 'react-icons/fi';
import Card from '../components/Card/Card';
import Button from '../components/Button/Button';
import styles from './Settings.module.css';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword } from '../services/authService';

const Settings = () => {
  const { user, setUser } = useAuth()

  const [name, setName] = useState(() => user?.name || '')
  const [email] = useState(() => user?.email || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState(null)

  const canSaveProfile = useMemo(() => {
    return (name || '').trim() && name !== (user?.name || '')
  }, [name, user])

  const canChangePassword = useMemo(() => {
    return (currentPassword || '').length > 0 && (newPassword || '').length >= 8
  }, [currentPassword, newPassword])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSaving) return
    setIsSaving(true)
    setStatus(null)

    try {
      // Update profile name if changed
      if (canSaveProfile) {
        const updated = await updateProfile({ name })
        setUser(updated)
      }
      // Change password if provided
      if (canChangePassword) {
        await changePassword({ currentPassword, newPassword })
        setCurrentPassword('')
        setNewPassword('')
      }

      setStatus({ type: 'success', message: 'Settings saved successfully.' })
    } catch (err) {
      setStatus({ type: 'error', message: err?.message || 'Failed to save settings.' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.grid}>
        <Card title="Profile & Security" subtitle="Manage your profile and security preferences.">
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.sectionHeader}>
              <FiUser />
              <h4>Profile</h4>
            </div>
            <label>
              Name
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your display name" />
            </label>
            <label>
              Email Address
              <input type="email" value={email} readOnly />
            </label>
            <div className={styles.sectionHeader}>
              <FiLock />
              <h4>Password & Security</h4>
            </div>
            <label>
              Current Password
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" />
            </label>
            <label>
              New Password
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters" />
            </label>
            <div className={styles.formActions}>
              <Button type="submit" variant='primary' disabled={isSaving || (!canSaveProfile && !canChangePassword)}>
                {isSaving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </form>
          {status && (
            <div
              className={`${styles.statusMessage} ${status.type === 'success' ? styles.statusSuccess : styles.statusError}`}
              role="alert"
              aria-live="assertive"
              style={{ marginTop: 12 }}
            >
              {status.message}
            </div>
          )}
        </Card>

        <Card title="Global Settings" subtitle="Manage store-wide settings and integrations.">
          <ul className={styles.globalList}>
            <li>
              <div>
                <h4>Storefront status</h4>
                <p>Pause or resume the ecommerce storefront for maintenance.</p>
              </div>
              <label className={styles.switch}>
                <input type="checkbox" defaultChecked />
                <span />
              </label>
            </li>
            <li>
              <div>
                <h4>Automatic tax collection</h4>
                <p>Calculate taxes automatically based on customer location.</p>
              </div>
              <label className={styles.switch}>
                <input type="checkbox" defaultChecked />
                <span />
              </label>
            </li>
            <li>
              <div>
                <h4>Two-factor authentication</h4>
                <p>Require SMS or authenticator app during sign in.</p>
              </div>
              <label className={styles.switch}>
                <input type="checkbox" />
                <span />
              </label>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
