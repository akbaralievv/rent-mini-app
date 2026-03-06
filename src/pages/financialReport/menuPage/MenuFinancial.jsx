import React, { useEffect, useState } from 'react'
import styles from './MenuFinancial.module.css'
import AppLayout from '../../../layouts/AppLayout'
import { useNavigate } from 'react-router-dom'
import ButtonSection from '../../../components/ButtonSection/ButtonSection'
import DuoButtons from '../../../components/DuoButtons/DuoButtons'
import { deposit, transactions } from '../../../common/mockData'
import ReportCard from '../../../components/ReportCard/ReportCard'
import { BadgeDollarSign, BadgeDollarSignIcon, BarChart3, FolderDown, Landmark, 
  ListFilter, PiggyBank, Receipt, ShieldCheck, Tags, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { useGetFinanceSummaryQuery } from '../../../redux/services/financeApi'

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
  const { data: financeSummary } = useGetFinanceSummaryQuery({
    period: 'all_time',
  })

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
  const [totalDeposit, setTotalDeposit] = useState(0);

  const getData = () => {
    const increaseSum = transactions
      .filter((t) => t.increse === true)
      .reduce((acc, t) => acc + Number(t.sum || 0), 0);

    const depositReturnSum = deposit
      .filter((t) => t.increse === false)
      .reduce((acc, t) => acc + Number(t.sum || 0), 0);

    const decreaseSum = transactions
      .filter((t) => t.increse === false)
      .reduce((acc, t) => acc + Number(t.sum || 0), 0);

    const depositSum = deposit
      .filter((t) => t.increse === true)
      .reduce((acc, t) => acc + Number(t.sum || 0), 0);

    setDepositPlus(depositSum)
    setTotalDeposit(depositSum - depositReturnSum)
    // setIncrease(increaseSum);
    setDecrease(decreaseSum);
    setBalance(increaseSum - decreaseSum);
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (!financeSummary) return;

    setDepositPlus(financeSummary.income ?? 0);
    setDecrease(financeSummary.expense ?? 0);
    setBalance(financeSummary.balance ?? 0);
    setTotalDeposit(financeSummary.total_deposit ?? 0);
  }, [financeSummary]);

  return (
    <AppLayout onBack={() => navigate(-1)}
      title={'Финансовый отчет'}
    >
      <div className={styles.main}>

        {/* ===== Card ===== */}
        <div>
          <ReportCard
            title="Финансовый отчет за все время"
            balance={balance}
            income={depositPlus}
            expense={decrease}
            totalDeposit={totalDeposit}
          />
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
                state: { key: "income" },
              }),
            },
            {
              icon: <TrendingDown />,
              text: 'Расходы',
              onClick: () => navigate('/financial-main/operation', {
                state: { key: "expense" },
              }),
            },
            {
              icon: <Wallet />,
              text: 'Депозиты',
              onClick: () => navigate('/financial-main/operation', {
                state: { key: "deposit_add" },
              }),
            },
            {
              icon: <Wallet />,
              text: 'Депозиты возврат',
              onClick: () => navigate('/financial-main/operation', {
                state: { key: "deposit_return" },
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
            {
              icon: <ListFilter strokeWidth={1.5} />,
              text: 'Экспорт по фильтрам',
              onClick: () => handleClick(() => navigate('/financial-main/export-filters')),
            },
          ]}
        />
      </div>

    </AppLayout>
  )
}
