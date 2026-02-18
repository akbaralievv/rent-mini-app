import React, { useEffect, useRef, useState } from 'react'
import AppLayout from '../../../layouts/AppLayout'
import { useNavigate } from 'react-router-dom'
import { useGetChatsQuery, useGetHistoryQuery, useSendMessageMutation } from '../../../redux/services/waApi'
import { Car, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, CircleUser, Send, SendHorizonal, Zap } from 'lucide-react'
import CustomButton from '../../../components/CustomButton/CustomButton'
import { tgTheme } from '../../../common/commonStyle'
import BackdropModal from '../../../components/BackdropModal/BackdropModal'
import styles from './WaChatsPage.module.css'
import LoaderCustom from '../../../components/LoaderCustom/LoaderCustom'
import { useGetTemplatesQuery } from '../../../redux/services/waTemplatesApi'

export default function WaChatsPage() {
  const navigate = useNavigate()

  const [page, setPage] = useState(0)
  const limit = 10

  const [selectedChat, setSelectedChat] = useState(null)
  const { data } = useGetChatsQuery({ page, limit })
  const { data: messages = [], isLoading, isFetching } =
    useGetHistoryQuery(selectedChat?.id, {
      skip: !selectedChat
    });

  const [sendMessage] = useSendMessageMutation();
  const { data: templatesData } = useGetTemplatesQuery();
  const templates = templatesData?.data || [];

  const chats = data?.chats || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / limit)

  const [dropdownOpen, setDropdownOpen] = useState(false)

  const [inputValue, setInputValue] = useState('');
  const [quickAnswersListVisible, setQuickAnswersListVisible] = useState(false);
  const [carListVisible, setCarListVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState([])
  console.log(messages)

  useEffect(() => {
    setChatMessages(messages);
  }, [messages])

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3002')

    ws.onmessage = (event) => {
      const newMessage = JSON.parse(event.data)
      setChatMessages(prev => {
        if (newMessage.chatId !== selectedChat?.id) return prev;

        return [...prev, newMessage];
      });
    }

    return () => ws.close()
  }, [selectedChat])

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [chatMessages]);

  const handleSend = async (text) => {
    setInputValue('')
    try {
      await sendMessage({
        chatId: selectedChat.id,
        text: text ?? inputValue,
        media: null,
      }).unwrap();
    } catch (error) {
      console.log(error)
    }
  }
  const MediaMessage = ({ el }) => {
    return <img
      src={`data:${el.media.mimetype};base64,${el.media.data}`}
      alt="media"
      style={{ maxWidth: 250, borderRadius: 8, marginTop: 20 }}
    />
  }

  const MessageItem = ({ el, isSenderChanged }) => {
    if (el.body == '' && !['image/jpeg', 'image/png'].includes(el.media?.mimetype)) return null;
    return <div className={`${styles.messageCard} ${el.fromMe && styles.myMessage} ${isSenderChanged && styles.isSenderChanged}`}>
      {
        el.media && <MediaMessage el={el} />
      }
      <span className='font14w500' style={{ color: tgTheme.textSecondary }}>
        {el.body}
      </span>
    </div>
  }
  console.log(messages)

  return (
    <AppLayout title={'Чаты Whatsapp'} onBack={() => navigate(-1)}>

      <div className={styles.main}>
        <div className={styles.btnChat}>
          <CustomButton
            icon={!dropdownOpen ? <ChevronDown size={16} color={tgTheme.white} />
              : <ChevronUp size={16} color={tgTheme.white} />}
            text={selectedChat?.name || 'Выберите чат'}
            onClick={() => setDropdownOpen(prev => !prev)}
          />
        </div>
        {dropdownOpen && (
          <div>
            <BackdropModal onClick={() => setDropdownOpen(false)} />
            <div className={styles.options}>
              <div className={styles.optionItems}>
                {chats.map(chat => (
                  <div
                    key={chat.id}
                    className={styles.optionItem}
                    onClick={() => {
                      setChatMessages([]);
                      setSelectedChat(chat)
                      setDropdownOpen(false)
                    }}
                  >
                    <div className={styles.optionItemIcon}>
                      <CircleUser color={tgTheme.white} size={16} />
                    </div>
                    <span className='font14w500'>
                      {chat.name}
                    </span>
                  </div>
                ))}
              </div>

              <div className={styles.pagination}>
                <button
                  disabled={page === 0}
                  onClick={() => setPage(prev => prev - 1)}
                  className={`${styles.pageBtn} ${page === 0 ? styles.disabled : ''}`}
                >
                  <ChevronLeft color={page === 0 ? tgTheme.textSecondary : tgTheme.white} size={22} />
                </button>

                <div className={styles.navIndicator}>
                  <span className={'font12w500'} style={{ color: tgTheme.textSecondary }}>
                    {page + 1} / {totalPages || 1}
                  </span>
                </div>

                <button
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage(prev => prev + 1)}
                  className={`${styles.pageBtn} ${page + 1 >= totalPages ? styles.disabled : ''}`}
                >
                  <ChevronRight color={page + 1 >= totalPages ? tgTheme.textSecondary : tgTheme.white} size={22} />
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
      {
        selectedChat ? <div className={styles.contentMain}>
          {
            (isLoading) ? <div className={styles.mainLoaderBlock}><LoaderCustom size={24} /></div>
              : <div className={styles.chatBlock}>

                {
                  chatMessages.map((el, index) => {
                    const prev = messages[index - 1];
                    const isSenderChanged = prev && prev.fromMe !== el.fromMe;
                    return <MessageItem el={el} isSenderChanged={isSenderChanged} />
                  })
                }
                <div ref={bottomRef} />
              </div>
          }
          <div className={styles.inputBlock}>
            <div
              onClick={() => {
                setCarListVisible(false)
                setQuickAnswersListVisible(prev => !prev)
              }}
            >
              <Zap size={20} color={quickAnswersListVisible ? tgTheme.accent : tgTheme.white} />
            </div>

            <div
              onClick={() => {
                setQuickAnswersListVisible(false)
                setCarListVisible(prev => !prev)
              }}
            >
              <Car size={20} color={carListVisible ? tgTheme.accent : tgTheme.white} />
            </div>

            <input
              placeholder='Сообщение...'
              className={`${styles.input} font14w500`}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
              }}
            />
            <div onClick={() => {
              if (inputValue.trim().length > 0) {
                handleSend()
              }
            }}>
              <SendHorizonal size={20} color={inputValue.trim().length > 0 ? tgTheme.accent : tgTheme.white} /></div>
          </div>

          {quickAnswersListVisible && (
            <>
              <div className={styles.popupList}>
                {templates.map((item, index) => (
                  <div
                    key={index}
                    className={styles.popupItem}
                    onClick={() => {
                      handleSend(item.body)
                      setQuickAnswersListVisible(false)
                    }}
                  >
                    <span className='font12w500'>
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {carListVisible && (
            <>
              <div className={styles.popupList}>
                {['Машина 1', 'Машина 2', 'Машина 3'].map((item, index) => (
                  <div
                    key={index}
                    className={styles.popupItem}
                    onClick={() => {
                      setInputValue(prev => prev + ' ' + item)
                      setCarListVisible(false)
                    }}
                  >
                    <span className='font12w500'>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
          : <div className={styles.emptyBlock}>
            <span className='font14w500' style={{ color: tgTheme.textSecondary }}>
              Для взаимодействия с чатом выберите чат.
            </span>
          </div>
      }

    </AppLayout>
  )
}
