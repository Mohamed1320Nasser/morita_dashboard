import React, { useEffect, useState } from 'react'
import styles from './langMenu.module.scss'
import { BiCheckCircle } from 'react-icons/bi'
import languages from '@/controllers/languages'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

const LangMenu = ({ className, noShadow, lang, originalTitle, originalDescription, isLangDone, isOrignialDone, langChange }) => {
    const [loading, setLoading] = useState(true)
    const [langs, setLangs] = useState([])
    const getLangs = async () => {
        let search = ''
        let limit = 10
        let page = 1
        let active = 1
        const response = await languages.getLanguageList(search, limit, page, active)
        if (response && !response.error) {
            setLangs(response.data.list)
            setLoading(false)
        }
    }
    useEffect(() => {
        getLangs()
    }, [])

    return (
        <div className={`${styles.langCard} ${noShadow ? styles.noShadow : ''} ${className || ''}`}>
            <div className={styles.langs}>

                {loading ?
                    <div className={styles.loading}>
                        <Skeleton count={1} height={55} width={100} />
                        <Skeleton count={1} height={55} width={100} />
                        <Skeleton count={1} height={55} width={100} />
                    </div>
                    :
                    <>
                        <button onClick={() => langChange(1)} className={`${lang === 1 ? styles.active : ''}`}>
                            Any {isOrignialDone() && <BiCheckCircle />}
                        </button>
                        {langs.map((item, i) => (
                            <button key={i} onClick={() => langChange(item.code)} className={`${lang === item.code ? styles.active : ''}`}>
                                {item.title}
                                {isLangDone(item.code) && <BiCheckCircle />}
                            </button>
                        ))}
                    </>
                }

            </div>
        </div>
    )
}

export default LangMenu