import axios from 'axios'
// import customAlert from '@/components/tmp/alert'
import { API } from '@/const'
import { ForberidenAlert } from '@/components/atoms/alerts'

const instance = axios.create({
  baseURL: API,
})

const headers = {
  "Accept-Language": "*",
  Authorization: "*",

}

export const getData = async (url, token) => {
  try {
    const res = await axios.get(`${API}${url}`, {
      headers: {
        Authorization: `${sessionStorage.getItem('token')}`,
        "Accept-Language": "*",
      },
    })

    if (res && res.status === 200) {
      return res.data
    } else {
      console.log('خطأ', 'حدث خطأ اثناء جلب البيانات ', 'error')
      return false
    }
  } catch (err) {
    if (err.response?.status === 403) {
      ForberidenAlert()
    }
    console.log(err);
    console.log('خطأ', 'قم بالتحقق من الاتصال ', 'error')
    return false
  }
}

export const getPuplicData = async (url, token) => {
  try {
    const res = await axios.get(`${API}${url}`, {
      headers: {
        // ...(token !== null && { Authorization:token }),
        // Authorization: `${process.env.NEXT_PUBLIC_AUTHORIZATION_KEY}${sessionStorage.getItem('token')}`,

        "Accept-Language": "*",
      },
    })

    if (res && res.status === 200) {
      return res.data
    } else {
      console.log('خطأ', 'حدث خطأ اثناء جلب البيانات ', 'error')
      return false
    }
  } catch (err) {
    console.log(err)
    console.log('خطأ', 'قم بالتحقق من الاتصال ', 'error')
    return false
  }
}

export const postPuplicData = async (url, data) => {
  try {
    const res = await axios.post(`${API}${url}`, data)
    if (res && res.status === 200) {
      return res.data
    } else {
      return false
    }
  } catch (err) {
    console.log(err)
    return err
  }
}
export const postData = async (url, data) => {
  try {
    const res = await axios.post(`${API}${url}`, data, {
      headers: {
        Authorization: `${sessionStorage.getItem('token')}`,
      },
    })
    if (res && res.status === 200) {
      return res.data
    } else {
      return res.data
    }
  } catch (err) {
    if (err.response?.status === 403) {
      ForberidenAlert()
    }
    console.log(err)
    return err
  }
}

export const putData = async (url, data) => {
  try {
    const res = await axios.put(`${API}${url}`, data, {
      headers: {
        Authorization: `${sessionStorage.getItem('token')}`,
      },
    })

    if (res && res.status === 200) {
      return res.data
    } else {
      return false
    }
  } catch (err) {
    if (err.response?.status === 403) {
      ForberidenAlert()
    }
    console.log(err)
    return err
  }
}

export const patchData = async (url, data) => {
  try {
    const res = await axios.patch(encodeURI(`${API}${url}`), data, {
      headers: {
        Authorization: `${sessionStorage.getItem('token')}`,
      },
    })

    if (res && res.status === 200) {
      return res.data
    } else {
      return res.data
    }
  } catch (err) {
    if (err.response?.status === 403) {
      ForberidenAlert()
    }
    console.log(err)
    return err
  }
}

export const deleteData = async (url) => {
  try {

    const res = await axios.delete(`${API}${url}`, {
      headers: {
        Authorization: `${sessionStorage.getItem('token')}`,
      },
    })
    if (res && res.status === 200) {
      return res.data
    } else {
      return res.data
    }
  } catch (err) {
    if (err.response?.status === 403) {
      ForberidenAlert()
    }
    console.log(err)
    return err
  }
}

export default instance
