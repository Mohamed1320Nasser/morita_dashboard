import Navbar from "../organisms/navbar";
import SideBar from "../organisms/sideBar";
import styles from './templates.module.scss'

export default function Layout({ children }) {
  return (
    <>
        <Navbar />
        <SideBar/>
        <main className={styles.page}>
          {children}
        </main>  
    </>
  )
}