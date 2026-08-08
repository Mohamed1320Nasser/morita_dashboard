import Image from 'next/image'
import React from 'react'

const DEFAULT_AVATAR = '/images/user/default.svg'

const UserImg = ({ inTable, img, userPage }) => {
  return (
    <>
      {userPage ?
        <Image style={{ borderRadius: "50%" }} src={img || DEFAULT_AVATAR} alt="user" width={70} height={70} />
        :
        <Image style={{ borderRadius: "50%" }} src={img || DEFAULT_AVATAR} alt="user" width={!inTable ? 40 : 35} height={!inTable ? 40 : 35} />
      }
    </>
  )
}

export default UserImg