import { useRouter } from 'next/router'
import styles from '../molecules/sideLink/sidelink.module.scss'
function ActiveLink({ children, href }) {
  const router = useRouter()

  const handleClick = (e) => {
    e.preventDefault();
    if (router.asPath !== href) {
      router.push(href);
    }
  }


  return (
    <a
      href={href}
      onClick={handleClick}
      style={{ textDecoration: "none" }}
      className={router.asPath === href ? styles.active : ''} >
      {children}
    </a>
  )
}

export default ActiveLink