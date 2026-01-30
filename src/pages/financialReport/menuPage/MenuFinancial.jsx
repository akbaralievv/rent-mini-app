import React, { useEffect, useState } from 'react'
import styles from './MenuFinancial.module.css'
import AppLayout from '../../../layouts/AppLayout'
import { useNavigate } from 'react-router-dom'
import ButtonSection from '../../../components/ButtonSection/ButtonSection'
import DuoButtons from '../../../components/DuoButtons/DuoButtons'
import { deposit, transactions } from '../../../common/mockData'
import ReportCard from '../../../components/ReportCard/ReportCard'
import { BadgeDollarSign, BadgeDollarSignIcon, BarChart3, FolderDown, Landmark, PiggyBank, Receipt, ShieldCheck, Tags, TrendingDown, TrendingUp, Wallet } from 'lucide-react'

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
        <div>
          <ReportCard title="Финансовый отчет за все время" items={[
            { key: "balance", label: "Баланс", value: balance, variant: "income" },
            { key: "decrease", label: "Расходы", value: decrease, variant: "expense" },
            { key: "deposit", label: "Депозиты", value: depositPlus, variant: "balance" },
          ]} />
          <div className={'miniBlock'}>
            <span className="font13w400" style={{ color: "var(--tg-text-secondary)" }}>
              Детализация доступна в разделах ниже — выберите нужный тип операций.</span>
          </div>
        </div>
        <ButtonSection
          title='Финансы'
          buttons={[
            {
              icon: <TrendingUp />,
              text: 'Доходы',
              onClick: () => navigate('/financial-main/operation', {
                state: { key: "increase" },
              }),
            },
            {
              icon: <TrendingDown />,
              text: 'Расходы',
              onClick: () => navigate('/financial-main/operation', {
                state: { key: "decrease" },
              }),
            },
            {
              icon: <Wallet />,
              text: 'Депозиты',
              onClick: () => navigate('/financial-main/operation', {
                state: { key: "deposit" },
              }),
            },
          ]} />
        <ButtonSection
          title='Инструменты'
          buttons={[
            {
              icon: <Tags strokeWidth={1.5} />,
              text: 'Теги финансов',
              onClick: () => handleClick(navigate('/financial-main/tags'))
            },
            {
              icon: <BarChart3 strokeWidth={1.5} />,
              text: 'Статистика',
              onClick: () => handleClick(navigate('/financial-main/statistics'))
            },
            {
              icon: <FolderDown strokeWidth={1.5} />,
              text: 'Экспорт отчета',
              onClick: () => handleClick(navigate('/financial-main/reports'))
            },
          ]}
        />
      </div>

    </AppLayout>
  )
}
