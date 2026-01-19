import React, { useEffect, useState } from 'react'
import styles from './MenuFinancial.module.css'
import AppLayout from '../../../layouts/AppLayout'
import { useNavigate } from 'react-router-dom'
import ButtonSection from '../../../components/ButtonSection/ButtonSection'
import DuoButtons from '../../../components/DuoButtons/DuoButtons'
import { deposit, transactions } from '../../../common/mockData'
import ReportCard from '../../../components/ReportCard/ReportCard'

const delay = (ms) => new Promise(res => setTimeout(res, ms))

const fakeRequest = () =>
  new Promise(res => {
    const randomTime = Math.random() * 1500 // 0–1.5 сек
    setTimeout(() => res(true), randomTime)
  })

const requestWithMinDelay = async (requestFn, minTime = 1000) => {
  await Promise.all([
    requestFn(),
    delay(minTime)
  ])
}

export default function MenuFinancial() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleClick = async (cb) => {
    if (loading) return

    setLoading(true)

    try {
      await requestWithMinDelay(fakeRequest, 1000)
      cb?.()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // const [increase, setIncrease] = useState(0);
  const [decrease, setDecrease] = useState(0);
  const [balance, setBalance] = useState(0);
  const [depositPlus, setDepositPlus] = useState(0);

  const getData = () => {
    const increaseSum = transactions
      .filter((t) => t.increse === true)
      .reduce((acc, t) => acc + Number(t.sum || 0), 0);

    const decreaseSum = transactions
      .filter((t) => t.increse === false)
      .reduce((acc, t) => acc + Number(t.sum || 0), 0);

    const depositSum = deposit
      .filter((t) => t.increse === true)
      .reduce((acc, t) => acc + Number(t.sum || 0), 0);

    setDepositPlus(depositSum)
    // setIncrease(increaseSum);
    setDecrease(decreaseSum);
    setBalance(increaseSum - decreaseSum);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <AppLayout onBack={() => navigate(-1)}
      title={'Финансовый отчет'}
    >
      <div className={styles.main}>

        {/* ===== Card ===== */}

        <ReportCard title="Финансовый отчет за все время" items={[
          { key: "balance", label: "Баланс", value: balance, variant: "income" },
          { key: "decrease", label: "Расходы", value: decrease, variant: "expense" },
          { key: "deposit", label: "Депозиты", value: depositPlus, variant: "balance" },
        ]} />

        <DuoButtons buttons={[
          {
            text: '✅ Доходы',
            onClick: () => navigate('/financial-main/operation', {
              state: { key: "increase" },
            }),
          },
          {
            text: '💸 Расходы',
            onClick: () => navigate('/financial-main/operation', {
              state: { key: "decrease" },
            }),
          },
          {
            text: '📋 Депозиты',
            onClick: () => navigate('/financial-main/operation', {
              state: { key: "deposit" },
            }),
          },
        ]} />
        <ButtonSection
          buttons={[
            {
              icon: '📊',
              text: 'Статистика',
              onClick: () => handleClick(navigate('/financial-main/statistics'))
            },
            {
              icon: '🗂️',
              text: 'Экспорт отчета',
              onClick: () => handleClick(navigate('/financial-main/reports'))
            },
          ]}
        />

        <div className={styles.section}>
          <button
            className={styles.itemBack}
            onClick={() => handleClick(() => navigate(-1))}
          >
            ⬅ В меню
          </button>
        </div>

      </div>

      {/* ===== Bottom Loader ===== */}
      {loading && <div className={styles.loader} />}
    </AppLayout>
  )
}
