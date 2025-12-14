import NavBtn from '@/components/atoms/buttons/navBtn'
import SearchInput from '@/components/atoms/inputs/searchInput'
import User from '@/components/molecules/user'
import Container from '@/components/templates/container'
import { Site } from '@/const'
import { useRouter } from 'next/router'
import React, { useEffect, useRef, useState } from 'react'
import styles from './navbar.module.scss'
import { BiLogOut } from 'react-icons/bi'
import { TbUsers, TbTicket } from 'react-icons/tb'
import { LuFilePlus2, LuGamepad2 } from 'react-icons/lu'
import { MdCategory } from 'react-icons/md'
import { IoFlashSharp, IoSettingsSharp } from 'react-icons/io5'

const Navbar = () => {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [menu, setMenu] = useState(false)
  useEffect(() => {
    const user = JSON.parse(sessionStorage?.getItem('user'))
    setUser(user)
  }, [])
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("isAuthed");
    router.push('/login')
  }
  const [dashPages, setDashPages] = useState([
    { title: "Quick Create", href: "/quick-create", icon: <IoFlashSharp />, isSpecial: true },
    { title: "Categories", href: "/categories", icon: <MdCategory /> },
    { title: "New Category", href: "/categories/new", icon: <LuFilePlus2 /> },
    { title: "Services", href: "/services", icon: <LuGamepad2 /> },
    { title: "New Service", href: "/services/new", icon: <LuFilePlus2 /> },
    { title: "Ticket Types", href: "/tickets/types", icon: <IoSettingsSharp /> },
    { title: "Manage Tickets", href: "/tickets", icon: <TbTicket /> },
  ])
  const [search, setSearch] = useState('')

  const handleSearchChange = (event) => {
    setSearch(event);
  };
  const filteredData = dashPages.filter(item =>
    item.title.toLowerCase().includes(search?.toLowerCase())
  );

  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      setTimeout(() => {
        if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
          setMenu(false);
        }
      }, 100);
    };

    if (menu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [menu]);

  return (
    <div className={styles.navbar}>
      <Container>
        <nav className={styles.navbarContent}>
          <div className={styles.searchSection}>
            <SearchInput valueChange={handleSearchChange} value={search} />

            {search?.length ?
              <div className={styles.searchMenu}>
                {filteredData.map((item, i) => (
                  <div className={styles.searchItem} key={i}>
                    <a href={item.href}></a>
                    {item.icon}
                    <span>{item.title}</span>
                  </div>
                ))}
              </div>
              : null
            }
          </div>
          <div className={styles.useSide}>
            <NavBtn newNotification />
            {user && <div onClick={() => setMenu(!menu)}><User role={user.role} img={user.profile.url ? `${Site}/cdn/${user.profile.folder}/${user.profile.title}` : '/images/user/2.png'} name={user.fullname} /> </div>}
            {menu &&
              <div className="userMenu" ref={userMenuRef}>
                <button onClick={handleLogout}><BiLogOut /> Logout</button>
              </div>
            }
          </div>
        </nav>
      </Container>
    </div>
  )
}

export default Navbar