import React, { useEffect, useRef, useState } from "react";
import Logo from "../../atoms/logo";
import styles from "./sideBar.module.scss";
import Link from "next/link";

import { LuLayoutDashboard, LuChevronUp, LuChevronDown } from "react-icons/lu";
import { MdCategory } from "react-icons/md";
import { LuGamepad2 } from "react-icons/lu";
import { MdPriceCheck } from "react-icons/md";
import { IoFlashSharp, IoWallet, IoCart, IoPeople, IoStatsChart, IoSettings, IoSwapHorizontal, IoPersonCircle, IoGift, IoRibbon, IoLink, IoCash, IoCard, IoTrophy } from "react-icons/io5";
import { SiBlockchaindotcom } from "react-icons/si";
import { BsCreditCard2Front } from "react-icons/bs";
import { RiDiscordFill } from "react-icons/ri";
import { TbTicket } from "react-icons/tb";
import { FaScroll, FaQuestion, FaUsers, FaClipboardList, FaTrophy } from "react-icons/fa";
import { Collapse } from 'react-bootstrap';
import { useRouter } from "next/router";

const SideBar = () => {
  const router = useRouter()

  const links = [
    // Dashboard & Quick Actions
    { label: 'Dashboard', icon: <LuLayoutDashboard />, href: '/' },
    { label: 'Quick Create Service', icon: <IoFlashSharp />, href: '/quick-create', isSpecial: true },

    // Business Operations
    { label: 'Orders', icon: <IoCart />, href: '/orders' },
    {
      label: 'Tickets',
      groupKey: 'tickets',
      icon: <TbTicket />,
      links: [
        { label: 'All Tickets', icon: <TbTicket />, href: '/tickets' },
        { label: 'Ticket Types', icon: <IoSettings />, href: '/tickets/types' },
      ]
    },
    { label: 'Users', icon: <IoPeople />, href: '/users' },

    // Financials
    { label: 'Wallets', icon: <IoWallet />, href: '/wallets' },
    { label: 'Transactions', icon: <IoSwapHorizontal />, href: '/transactions' },
    { label: 'Accounts', icon: <IoPersonCircle />, href: '/accounts' },
    { label: 'Loyalty Tiers', icon: <IoTrophy />, href: '/loyalty-tiers' },
    {
      label: 'Daily Reward',
      groupKey: 'daily-reward',
      icon: <IoGift />,
      links: [
        { label: 'Configuration', icon: <IoSettings />, href: '/daily-reward' },
        { label: 'Claims', icon: <FaClipboardList />, href: '/daily-reward/claims' },
        { label: 'Leaderboard', icon: <FaTrophy />, href: '/daily-reward/leaderboard' },
      ]
    },
    {
      label: 'Order Reward',
      groupKey: 'order-reward',
      icon: <IoRibbon />,
      links: [
        { label: 'Configuration', icon: <IoSettings />, href: '/order-reward' },
        { label: 'Claims', icon: <FaClipboardList />, href: '/order-reward/claims' },
      ]
    },
    {
      label: 'Payments',
      groupKey: 'payments',
      icon: <IoCash />,
      links: [
        { label: 'Crypto Wallets', icon: <SiBlockchaindotcom />, href: '/blockchain' },
        { label: 'Verify Transaction', icon: <IoLink />, href: '/blockchain/verify' },
        { label: 'Payment Methods', icon: <BsCreditCard2Front />, href: '/payments/methods' },
        { label: 'Discord Config', icon: <RiDiscordFill />, href: '/payments/discord-config' },
      ]
    },

    // Catalog Management
    { label: 'Services', icon: <LuGamepad2 />, href: '/services' },
    { label: 'Categories', icon: <MdCategory />, href: '/categories' },
    { label: 'Pricing Methods', icon: <MdPriceCheck />, href: '/pricing/methods' },
    {
      label: 'Onboarding',
      groupKey: 'onboarding',
      icon: <FaClipboardList />,
      links: [
        { label: 'Terms of Service', icon: <FaScroll />, href: '/onboarding/terms-of-service' },
        { label: 'Questions', icon: <FaQuestion />, href: '/onboarding/questions' },
        { label: 'User Answers', icon: <FaUsers />, href: '/onboarding/user-answers' },
      ]
    },

    // System & Reports
    { label: 'Reports & Analytics', icon: <IoStatsChart />, href: '/reports' },
    { label: 'Service Analytics', icon: <IoStatsChart />, href: '/service-analytics' },
    { label: 'System Settings', icon: <IoSettings />, href: '/settings' },
  ]



  const [openGroupKey, setOpenGroupKey] = useState(null);
  const groupRefs = useRef({});

  useEffect(() => {
    for (const link of links) {
      if (link.links && Array.isArray(link.links)) {
        if (link.links.some(sublink => sublink.href === router.pathname)) {
          setOpenGroupKey(link.groupKey);
          break;
        }
      }
    }
  }, [links, router.pathname]);


  useEffect(() => {
    if (openGroupKey && groupRefs.current[openGroupKey]) {
      const elem = groupRefs.current[openGroupKey];
      const rect = elem.getBoundingClientRect();
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [openGroupKey]);


  const toggleGroup = (key) => {
    setOpenGroupKey(prevKey => (prevKey === key ? null : key));
  };

  return (
    <aside className={styles.sideBar}>
      <div className={styles.logoView}>
        <Link href="/">
          <Logo />
        </Link>
      </div>
      <div className={styles.sideLinks}>
        {links.map((link, index) => {
          const isGroup = link.hasOwnProperty('links') && Array.isArray(link.links);

          if (isGroup) {
            const isExpanded = openGroupKey === link.groupKey;
            return (
              <div
                key={index}
                ref={el => (groupRefs.current[link.groupKey] = el)}
                className={styles.group}
              >
                <button
                  onClick={() => toggleGroup(link.groupKey)}
                  className={`${styles.groupBtn} ${isExpanded ? styles.open : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {link.icon}
                    <span>{link.label}</span>
                  </div>
                  <div className={styles.arrow}>
                    <LuChevronDown />
                  </div>
                </button>
                <Collapse in={isExpanded}>
                  <div className={styles.sublinks}>
                    {link.links.map((sublink, subIndex) => {
                      return (
                        <Link
                          href={sublink.href}
                          key={subIndex}
                          className={`${styles.tab} ${router.pathname === sublink.href ? styles.active : ''}`}
                        // onClick={toggle}
                        >
                          {/* {sublink.icon} - Optional: Hide sub-icons if too cluttered, but user might like them */}
                          {sublink.icon}
                          <span>{sublink.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </Collapse>
              </div>
            );
          } else {
            return (
              <Link
                href={link.href}
                key={index}
                className={`${styles.tab} ${router.pathname === link.href ? styles.active : ''} ${link.isSpecial ? styles.special : ''}`}
              // onClick={toggle}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          }
        })}
      </div>
    </aside>
  );
};

export default SideBar;
