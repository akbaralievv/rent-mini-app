import React, { useEffect, useRef, useState } from 'react'
import AppLayout from '../../../layouts/AppLayout'
import { useNavigate } from 'react-router-dom'
import { useGetChatsQuery } from '../../../redux/services/waApi'
import { CircleUser } from 'lucide-react'
import { tgTheme } from '../../../common/commonStyle'
import styles from './WaChatsPage.module.css'
import LoaderCustom from '../../../components/LoaderCustom/LoaderCustom'

export default function WaChatsPage() {
  const navigate = useNavigate()

  const limit = 20
  const [page, setPage] = useState(0)
  const [allChats, setAllChats] = useState([])

  const { data, isFetching, } = useGetChatsQuery({ page, limit },)


  // eslint-disable-next-line react-hooks/exhaustive-deps
  const chats = data?.chats || []
  const total = data?.total || 0

  useEffect(() => {
    if (chats.length > 0) {
      setAllChats(prev =>
        [...prev, ...chats].sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        )
      )
    }
  }, [chats])

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3002')

    ws.onmessage = (event) => {
      const newMessage = JSON.parse(event.data)

      setAllChats(prev => {
        const existingIndex = prev.findIndex(
          chat => chat.id === newMessage.chatId
        )

        let updatedChat

        if (existingIndex !== -1) {
          updatedChat = {
            ...prev[existingIndex],
            lastMessage: newMessage.text,
            updatedAt: newMessage.timestamp,
            hasNewMessage: true
          }

          const newList = [...prev]
          newList.splice(existingIndex, 1)

          return [updatedChat, ...newList]
        }

        updatedChat = {
          id: newMessage.chatId,
          name: newMessage.chatName,
          lastMessage: newMessage.text,
          updatedAt: newMessage.timestamp,
          hasNewMessage: true
        }

        return [updatedChat, ...prev]
      })
    }

    return () => ws.close()
  }, [])

  const bottomRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (
          entries[0].isIntersecting &&
          !isFetching &&
          allChats.length < total
        ) {
          setPage(prev => prev + 1)
        }
      },
      { threshold: 1 }
    )

    if (bottomRef.current) observer.observe(bottomRef.current)

    return () => observer.disconnect()
  }, [isFetching, allChats, total])

  const openChat = (chat) => {
    setAllChats(prev =>
      prev.map(c =>
        c.id === chat.id
          ? { ...c, hasNewMessage: false }
          : c
      )
    )

    navigate('/all-chats/wa/' + chat.id)
  }

  return (
    <AppLayout title={'Чаты Whatsapp'} onBack={() => navigate(-1)}>

      <div className={styles.list}>

        {allChats.map(chat => (
          <div
            key={chat.id}
            className={styles.chatItem}
            onClick={() => openChat(chat)}
          >
            <CircleUser color={tgTheme.white} size={22} />

            <div className={styles.chatContent}>
              <span className={`${styles.chatName} font14w500`}>
                {chat.name}
              </span>

              <div>
                {chat.hasNewMessage && (
                  <span className={styles.newBadge}>
                    Новое сообщение
                  </span>
                )}
              </div>
            </div>

          </div>
        ))}

        {isFetching && (
          <div className={styles.loader}>
            <LoaderCustom size={24} />
          </div>
        )}

        <div ref={bottomRef} />

      </div>

    </AppLayout>
  )
}
