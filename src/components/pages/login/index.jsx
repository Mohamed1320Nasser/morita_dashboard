import React, { useCallback, useEffect, useState } from 'react'
import Button from '@/components/atoms/buttons/button'
import InputBox from '@/components/molecules/inputBox/inputBox'
import styles from './login.module.scss'
import { notify } from '@/config/error'
import toast, { Toaster } from "react-hot-toast";
import login from '@/controllers/login'
import { useRouter } from 'next/router'
import PulseLoader from "react-spinners/PulseLoader";

const LoginPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false)
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const handleUserNameChange = (event) => {
    setUserName(event);
  };
  const handlePasswrodChange = (event) => {
    setPassword(event);
  };

  const handleLogin = async () => {
    let errors = []
    if (userName.length < 3) {
      errors.push('please write a valid email')
    }
    if (password.length < 3) {
      errors.push('please write a valid password')
    }
    if (errors.length > 0) {
      notify(errors[0]);
    } else {
      setLoading(true)
      const response = await login.submitLogin(userName, password, remember)
      if (response && response.success) {
        notify('Login successful!', 'success')
        router.push('/')
      } else {
        notify(response?.error?.message || 'The Login Credentials are incorrect, please try again');
        setLoading(false)
      }
    }
  }

  const handleEnterKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className={styles.login}>
      <div className={styles.LoginCard}>
        <div className={styles.brandHeader} aria-hidden>
          <img src="/logo2.png" alt="Morita Gaming" className={styles.brandLogo} />
        </div>
        <h2 className={styles.brandName}>MORITA</h2>
        <p className={styles.brandSlogan}>Premium Gaming Services</p>
        <h4 className={styles.loginTitle}>Welcome <span>Back</span></h4>
        <div className={styles.form}>
          <InputBox onKeyPress={handleEnterKeyPress} value={userName} valueChange={handleUserNameChange} type="email" label="Email" placeholder="Enter your email" />
          <InputBox onKeyPress={handleEnterKeyPress} value={password} valueChange={handlePasswrodChange} type="password" label="Password" placeholder="Enter your password" />
        </div>
        <div className={styles.formMeta}>
          <label className={styles.rememberMe}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              aria-label="Remember me"
            />
            <span>Remember me</span>
          </label>
          <a className={styles.forgotLink} role="button" tabIndex={0}>Forgot password?</a>
        </div>
        <Button disabled={loading} onClick={handleLogin} fullWidth primary={true}>
          {loading &&
            <PulseLoader color={"#fff"} size={6} />
          }
          Login
        </Button>
        <div className={styles.subButton}>
          <Button fullWidth secondary={true}>Contact our friendly support</Button>
        </div>
      </div>
      <Toaster position="bottom-right" reverseOrder={true} />

    </div>
  )
}

export default LoginPage