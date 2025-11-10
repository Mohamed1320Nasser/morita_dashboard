import React from 'react'
import styles from './loaders.module.scss'
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
import uploadingLottie from "./uploading.json";
import Typewriter from 'typewriter-effect';

const Uploading = ({ state }) => {
  return (
    <div className={styles.loader}>
      <Lottie style={{ width: 200, height: 200 }} animationData={uploadingLottie} />
      {state === 1 ?
        <h6 className={styles.sub}><Typewriter options={{ strings: ['Hold tight, your Article data is on its way!', "Uploading your Article data... It's almost there!", "Uploading Article data... This won't take long!"], deleteSpeed: 10, delay: 40, autoStart: true, loop: true, cursor: ".." }} /></h6>
        : state === 2 ?
          <h6 className={styles.sub}><Typewriter options={{ strings: ["Uploading your data."], deleteSpeed: 10, delay: 40, autoStart: true, loop: true, cursor: ".." }} /></h6>
          :
          <h6 className={styles.sub}><Typewriter options={{ strings: ["Uploading user data now."], deleteSpeed: 10, delay: 40, autoStart: true, loop: true, cursor: ".." }} /></h6>
      }
    </div>
  )
}

export default Uploading