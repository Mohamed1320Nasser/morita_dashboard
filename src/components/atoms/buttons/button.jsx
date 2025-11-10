import React from 'react'
import styles from './buttons.module.scss'

const Button = ({ children, noClick, success, successLight, primaryLight, dangerLight, disabled, primary, danger, secondary, cancel, fullWidth, active, onClick, fullActive, underline }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${styles.button} 
        ${success && styles.success}
        ${successLight && styles.successLight} 
        ${primaryLight && styles.primaryLight}
        ${dangerLight && styles.dangerLight}
        ${secondary && styles.buttonSecondary} 
        ${cancel && styles.cancel}
        ${danger && styles.danger} 
        ${fullWidth && styles.fullWidth} 
        ${primary && styles.buttonPrimary} 
        ${active && styles.active} 
        ${fullActive && styles.fullActive}
        ${noClick && styles.noClick}
        ${underline && styles.underline}
      `}>
      {children}
    </button>
  )
}

export default Button 