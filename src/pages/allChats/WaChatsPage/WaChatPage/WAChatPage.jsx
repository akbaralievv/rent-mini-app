import React, { useEffect, useRef, useState } from 'react'
import AppLayout from '../../../../layouts/AppLayout'
import { useNavigate, useParams } from 'react-router-dom'
import styles from './WAChatPage.module.css'
import { useGetHistoryQuery, useSendImageMutation, useSendMessageMutation } from '../../../../redux/services/waApi';
import { useGetTemplatesQuery } from '../../../../redux/services/waTemplatesApi';
import { tgTheme } from '../../../../common/commonStyle';
import { SendHorizonal, Zap } from 'lucide-react';
import { Car } from 'phosphor-react';
import LoaderCustom from '../../../../components/LoaderCustom/LoaderCustom';
import { useGetCarsQuery } from '../../../../redux/services/carAction';
import BackdropModal from '../../../../components/BackdropModal/BackdropModal';

export default function WAChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const chatRef = useRef(null)
  const {
    data: messages = [],
    isLoading, isFetching
  } = useGetHistoryQuery({ chatId: id, limit: 100 }, {
    skip: !id,
    refetchOnMountOrArgChange: false
  })

  const [sendMessage] = useSendMessageMutation();
  const [sendMessageWithImage] = useSendImageMutation();
  const { data: templatesData } = useGetTemplatesQuery();
  const { data: carsData } = useGetCarsQuery({})
  const templates = templatesData?.data || [];
  const cars = carsData?.cars || [];


  const [inputValue, setInputValue] = useState('');
  const [quickAnswersListVisible, setQuickAnswersListVisible] = useState(false);
  const [carListVisible, setCarListVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState([])

  useEffect(() => {
    if (messages.length > 0) {
      setChatMessages(messages);
    }
  }, [messages]);

  const handleSend = async (text) => {
    setInputValue('')
    try {
      await sendMessage({
        chatId: id,
        text: text ?? inputValue,
        media: null,
      }).unwrap();
    } catch (error) {
      console.log(error)
    }
  }
  const MediaMessage = ({ el }) => {
    const [error, setError] = useState(false)

    if (error) return null;

    return (
      <img
        src={`data:${el.media.mimetype};base64,${el.media.data}`}
        alt="media"
        onError={() => setError(true)}
        style={{
          width: 250,
          height: 'auto',
          borderRadius: 8,
          marginTop: 4
        }}
      />
    )
  }


  const MessageItem = ({ el, isSenderChanged }) => {
    if (el.body == '' && !['image/jpeg', 'image/png'].includes(el.media?.mimetype)) return null;
    return <div className={`${styles.messageCard} ${el.fromMe && styles.myMessage} ${isSenderChanged && styles.isSenderChanged}`}>
      {
        el.media && <MediaMessage el={el} />
      }
      <span className='font14w500' style={{ color: tgTheme.textSecondary, whiteSpace: 'pre-line' }}>
        {el.body}
      </span>
    </div>
  }

  const bottomRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3002')

    ws.onmessage = (event) => {
      const newMessage = JSON.parse(event.data)
      setChatMessages(prev => {
        return [...prev, newMessage];
      });
    }

    return () => ws.close()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [chatMessages]);

  const sendAuto = async (item) => {
    try {
      const images = item.car_images || [];

      const lines = [
        `🚗 ${item.car_name}`,
        `Номер: ${item.car_number}`,
        item.car_price_3 ? `💰 ${item.car_price_3} AED / день` : null,
        item.car_price_7 ? `📅 ${item.car_price_7} AED / неделя` : null,
        item.car_price_30 ? `🗓 ${item.car_price_30} AED / месяц` : null,
        item.car_description ? `ℹ️ ${item.car_description}` : null
      ].filter(Boolean);

      const messageText = lines.join('\n');

      if (images.length > 0) {
        setTimeout(async () => {
          await sendMessageWithImage({
            chatId: id,
            media: images[0],
            text: messageText
          }).unwrap();
        }, 0);
        for (let i = 1; i < images.length; i++) {
          setTimeout(async () => {
            await sendMessageWithImage({
              chatId: id,
              media: images[i],
              text: null
            }).unwrap();
          }, 0);
        }
      } else {
        await sendMessageWithImage({
          chatId: id,
          text: messageText,
          media: null
        }).unwrap();
      }

    } catch (e) {
      console.error("Ошибка отправки авто:", e);
    }

    setCarListVisible(false);
  };

  return (
    <AppLayout title={'Чат с ' + id} onBack={() => navigate(-1)}>
      {console.log(chatMessages)}
      <div className={styles.contentMain}>
        {
          (isLoading) ? <div className={styles.mainLoaderBlock}><LoaderCustom size={24} /></div>
            : <div ref={chatRef} className={styles.chatBlock}>

              {
                chatMessages.map((el, index) => {
                  const prev = chatMessages[index - 1];
                  const isSenderChanged = prev && prev.fromMe !== el.fromMe;
                  return <MessageItem el={el} isSenderChanged={isSenderChanged} key={index} />
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

          {
            isFetching ? <LoaderCustom size={20} /> :
              <div onClick={() => {
                if (inputValue.trim().length > 0) {
                  handleSend()
                }
              }}>

                <SendHorizonal size={20} color={inputValue.trim().length > 0 ? tgTheme.accent : tgTheme.white} /></div>
          }
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
              {cars.map((item, index) => (
                <div
                  key={index}
                  className={styles.popupItem}
                  onClick={() => {
                    sendAuto(item)
                    setCarListVisible(false)
                  }}
                >
                  <span className='font12w500'>
                    {item.car_name}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </AppLayout>
  )

}
