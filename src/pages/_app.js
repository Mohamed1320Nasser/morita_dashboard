import Head from 'next/head'
import { RouteGuard } from '@/config/routeGuard';
import Layout from '@/components/templates/layout';
import { useRouter } from 'next/router';
import 'react-toastify/dist/ReactToastify.css';
import '@/styles/globals.scss'
import 'react-loading-skeleton/dist/skeleton.css'


export default function App({ Component, pageProps }) {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>Morita - admin</title>
      </Head>
      {router.pathname === '/login' ?
        <RouteGuard>
          <Component {...pageProps} />
        </RouteGuard>
        :
        <Layout>
          <RouteGuard>
            <Component {...pageProps} />
          </RouteGuard>
        </Layout>
      }
    </>
  )
}
