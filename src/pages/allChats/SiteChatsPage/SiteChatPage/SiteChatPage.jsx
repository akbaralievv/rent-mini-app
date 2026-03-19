import React, { useEffect, useMemo, useRef, useState } from 'react'
import AppLayout from '../../../../layouts/AppLayout'
import { useNavigate, useParams } from 'react-router-dom'
import styles from './SiteChatPage.module.css'
import {
  useGetSiteChatQuery,
  useSendAdminMessageMutation,
  useDeleteSiteChatMutation,
} from '../../../../redux/services/siteChatsApi'
import { tgTheme } from '../../../../common/commonStyle'
import { SendHorizonal } from 'lucide-react'
import LoaderCustom from '../../../../components/LoaderCustom/LoaderCustom'

export default function SiteChatPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: chat, isLoading, refetch } = useGetSiteChatQuery(id, { skip: !id, pollingInterval: 10000 })
  const [sendMessage, { isLoading: isSending }] = useSendAdminMessageMutation()
  const [deleteChat] = useDeleteSiteChatMutation()

  const messages = useMemo(() => chat?.messages || [], [chat?.messages])
  const [inputValue, setInputValue] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const text = inputValue.trim()
    if (!text) return
    setInputValue('')
    try {
      await sendMessage({ id, content: text }).unwrap()
      refetch()
    } catch (e) {
      console.error(e)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleDelete = async () => {
    try {
      await deleteChat(id).unwrap()
      navigate('/all-chats/site')
    } catch (e) {
      console.error(e)
    }
  }

  const formatTime = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return '??:??'
    }
  }

  return (
    <AppLayout title={`Чат #${id}`} onBack={() => navigate('/all-chats/site')}>
      <div className={styles.actions}>
        <button
          className={`${styles.actionBtn} ${styles.deleteBtn} font12w500`}
          onClick={handleDelete}
        >
          Удалить чат
        </button>
      </div>

      <div className={styles.contentMain}>
        {isLoading ? (
          <div className={styles.mainLoaderBlock}>
            <LoaderCustom size={24} />
          </div>
        ) : (
          <div className={styles.chatBlock}>
            {messages.map((msg, index) => {
              const isAdmin = msg.sender !== 'visitor'
              const prev = messages[index - 1]
              const isSenderChanged = prev && (prev.sender === 'visitor') !== (msg.sender === 'visitor')

              return (
                <div
                  key={msg.id || index}
                  className={`${styles.messageCard} ${isAdmin ? styles.myMessage : ''} ${isSenderChanged ? styles.isSenderChanged : ''}`}
                >
                  <div
                    className={`${styles.senderLabel} font12w400`}
                    style={{ color: isAdmin ? tgTheme.accent : tgTheme.success }}
                  >
                    {isAdmin ? 'Оператор' : 'Посетитель'} · {formatTime(msg.created_at)}
                  </div>
                  <span className='font14w500' style={{ color: tgTheme.textSecondary, whiteSpace: 'pre-line' }}>
                    {msg.body}
                  </span>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>
        )}

        <div className={styles.inputBlock}>
          <input
            placeholder='Ответ...'
            className={`${styles.input} font14w500`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {isSending ? (
            <LoaderCustom size={20} />
          ) : (
            <div onClick={handleSend}>
              <SendHorizonal
                size={20}
                color={inputValue.trim().length > 0 ? tgTheme.accent : tgTheme.white}
              />
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
