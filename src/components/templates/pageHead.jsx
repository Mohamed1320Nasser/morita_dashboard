import React from 'react'
import Breadcrumbs from '../atoms/breadcrumbs'
import Container from './container'
import styles from './templates.module.scss'

const PageHead = ({parent,parentUrl,current,children}) => {
  return (
    <div className={styles.pageHead}>
      <Container>
        <Breadcrumbs parent={parent} parentUrl={parentUrl}  current={current}/>
        {children}
      </Container>
    </div>
  )
}

export default PageHead