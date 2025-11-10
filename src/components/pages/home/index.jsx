import React, { useEffect, useState } from 'react'
import Head from '@/components/molecules/head/head'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import StatisticsCard from '@/components/atoms/cards/statisticsCard'
import statistics from '@/controllers/statistics'
import { LuGamepad2, LuHeadphones, LuUserPlus } from 'react-icons/lu'
import { MdCategory } from 'react-icons/md'

const HomePage = () => {
  const [counts, setCounts] = useState({})
  const getStatistics = async () => {
    const response = await statistics.getStatisticsList()
    if (response) {
      const categoriesCount = response.categoriesCount || response.data?.categoriesCount || 0
      const servicesCount = response.servicesCount || response.data?.servicesCount || 0
      setCounts({
        blogsCount: categoriesCount,
        newsletterCount: servicesCount,
        requests: { totalCount: 0 },
        contactUs: { totalCount: 0 },
      })
    }
  }
  useEffect(() => {
    getStatistics()
  }, [])

  return (
    <div>
      <PageHead current="Dashboard">
        <Head title="Dashboard" />
      </PageHead>
      <Container>
        <div className="row mb-4">
          <div className="col-md-4">
            <StatisticsCard
              link="/categories"
              color="#1B3250"
              icon={<MdCategory />}
              title="Categories"
              count={counts?.blogsCount || 0}
            />
          </div>
          <div className="col-md-4">
            <StatisticsCard
              link="/services"
              color="#FFCA31"
              icon={<LuGamepad2 />}
              title="Services"
              count={counts?.newsletterCount || 0}
            />
          </div>
          <div className="col-md-4">
            <StatisticsCard
              link="/requests"
              color="#10B981"
              icon={<LuUserPlus />}
              title="The total number of Requests"
              count={counts?.requests?.totalCount || 0}
            />
          </div>
          <div className="col-md-4">
            <StatisticsCard
              link="/conatctus"
              color="#9b59b6"
              icon={<LuHeadphones />}
              title="The total number of Contact us"
              count={counts?.contactUs?.totalCount || 0}
            />
          </div>
        </div>
      </Container>
    </div>
  )
}

export default HomePage