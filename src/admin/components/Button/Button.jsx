import React from 'react'
import styles from './Button.module.css'

const Button = ({ children, variant = 'default', size = 'md', iconOnly = false, className = '', ...props }) => {
  const classList = [styles.btn, styles[variant] || '', styles[size] || '', iconOnly ? styles.iconOnly : '', className]
  const cls = classList.filter(Boolean).join(' ')
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  )
}

export default Button
