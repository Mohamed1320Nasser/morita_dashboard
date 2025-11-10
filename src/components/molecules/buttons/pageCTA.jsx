import Button from '@/components/atoms/buttons/button'
import React from 'react'

const PageCta = ({children,primary,onClick}) => {
  return (
    <Button onClick={onClick} primary={primary}>{children}</Button>
  )
}

export default PageCta