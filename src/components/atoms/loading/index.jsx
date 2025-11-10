import React from 'react'
import search from "./search.json";
import dynamic from 'next/dynamic'
const Lottie = dynamic(
  import('lottie-react').then((Lottie) => {
    return Lottie
  }),
  {
    ssr: false,
    loading: () => <p>Loading ...</p>,
  },
)
import styles from './loading.module.scss'
const Loading = () => {
  return (
    <div className={styles.loading}>
      <Lottie animationData={search} loop={true} />
    </div>
  )
}

export default Loading