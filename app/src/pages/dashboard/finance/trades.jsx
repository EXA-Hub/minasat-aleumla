// app/src/pages/dashboard/finance/trades.jsx
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { ar } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { useOutletContext } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import Username from '../../../components/explore/widgets/Username';
import { Skeleton } from '../../../components/ui/skeleton';
import LoadingPage from '../../autoRouting/loading.jsx';
import { Button } from '../../../components/ui/button';
import wss from '../../../services/wss.js';
import { cn } from '../../../lib/utils';
import api from '../../../utils/api';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '../../../components/ui/avatar';

const translateStage = {
  buyer_offered: 'صفقة جديدة',
  seller_accepted: 'صفقة مفتوحة',
  buyer_confirmed: 'تم الإستلام',
};

// Updated chat area with new styling
const RenderTradeChat = ({
  selectedTrade,
  sendMessage,
  setSelectedTrade,
  user,
  chats,
}) => {
  const chatContainerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);

  if (
    chatContainerRef &&
    chatContainerRef.current &&
    chatContainerRef.current.scrollHeight
  )
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;

  if (loading)
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingPage text="جاري التحميل" />
      </div>
    );

  if (!selectedTrade)
    return (
      <div className="hidden md:flex items-center justify-center flex-1 text-card-foreground">
        اختر صفقة
      </div>
    );

  const isSeller = selectedTrade.isSellTrade;
  const otherParty = isSeller ? 'المشتري' : 'البائع';
  const ourParty = isSeller ? 'البائع' : 'المشتري';
  const otherUser = selectedTrade.seller || selectedTrade.buyer;

  return (
    <div className="flex-1 p-4 rtl overflow-hidden">
      <div className="bg-card shadow-md rounded-lg h-full flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-border">
          {/* Left Section: Avatar & Username */}
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors duration-200">
            <Avatar className="h-8 w-8 md:h-10 md:w-10 border-2 border-border shadow-sm ring-2 ring-background">
              <AvatarImage
                src={otherUser.profile?.profilePicture || '/avatar.jpg'}
                alt={otherUser.username || 'User Avatar'}
                className="object-cover"
              />
              <AvatarFallback
                src="/avatar.jpg"
                alt="Default Avatar"
                className="w-full h-full object-cover rounded-full"
              />
            </Avatar>
            {otherUser && otherUser.username && (
              <Username username={otherUser.username} />
            )}
          </div>

          {/* selectedTrade.quantity */}
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors duration-200">
            {/* <CoinIcon amount={selectedTrade.quantity} /> */}
            <p className="text-muted-foreground text-sm">
              الكمية: {selectedTrade.quantity}
            </p>
          </div>

          {/* Close Button */}
          <Button
            variant="danger"
            onClick={() => setSelectedTrade(null)}
            aria-label="Close Trade"
            dir="rtl" // Ensures Arabic text aligns correctly
            className="px-3 py-1 text-white bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-400">
            إغلاق
          </Button>
        </header>

        {/* Chat Messages */}
        <div
          ref={chatContainerRef}
          className="flex-grow overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-primary scrollbar-track-background">
          <div className="flex flex-col gap-6 py-4 px-2">
            {chats[selectedTrade._id]?.map((msg, index) => {
              const msgAuthor = msg.startsWith('النظام:')
                ? {
                    profile: {
                      profilePicture: '/icon.svg',
                    },
                  }
                : msg.startsWith('البائع:')
                  ? isSeller
                    ? user
                    : otherUser
                  : msg.startsWith('المشتري:')
                    ? !isSeller
                      ? user
                      : otherUser
                    : msg.split(':')[0] === user.username
                      ? user
                      : otherUser;

              const isSystem = msg.startsWith('النظام:');
              const isError = msg === 'النظام:[حدث خطأ]';
              const isGreen = msg === 'النظام:[تم إرسالها بالفعل]';
              const isSent = msg.startsWith(ourParty + ':');
              const messageContent = msg.split(':')[1] || msg;

              return (
                <div
                  key={index}
                  className={cn(
                    'group flex items-start gap-3',
                    isSent ? 'flex-row-reverse' : 'flex-row'
                  )}>
                  <Avatar
                    className={cn(
                      'h-8 w-8 md:h-10 md:w-10 flex-shrink-0 select-none',
                      'border-2 border-border shadow-sm ring-2 ring-background transition-transform duration-200',
                      'group-hover:scale-105'
                    )}>
                    <AvatarImage
                      src={msgAuthor.profile?.profilePicture || '/avatar.jpg'}
                      alt={msgAuthor.username || 'User Avatar'}
                      className="object-cover"
                    />
                    <AvatarFallback>
                      <img
                        src="/avatar.jpg"
                        alt="Default Avatar"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={cn(
                      'flex flex-col gap-1 max-w-[80%] md:max-w-[70%]',
                      isSent && 'items-end'
                    )}>
                    {msgAuthor &&
                      msgAuthor.username &&
                      (user.username === msgAuthor.username ? (
                        <div className="flex items-center gap-2 px-1">
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(), 'p', { locale: ar })}
                          </span>
                          <Username username={msgAuthor.username} />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-1">
                          <Username username={msgAuthor.username} />
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(), 'p', { locale: ar })}
                          </span>
                        </div>
                      ))}

                    <div
                      className={cn(
                        'rounded-2xl px-4 py-2.5 text-sm',
                        'shadow-sm transition-colors duration-200',
                        isSystem &&
                          !isError &&
                          'bg-yellow-500/10 text-yellow-600',
                        isGreen && 'bg-green-500/10 text-green-600',
                        isError && 'bg-red-500/10 text-red-600',
                        !isSystem &&
                          !isError &&
                          cn(
                            isSent
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-accent text-foreground'
                          )
                      )}>
                      {messageContent}
                    </div>

                    {msg.split(':')[1] === '[تم إرسال المنتج]' && (
                      <div className="mt-2">
                        <Button
                          variant="success"
                          size="sm"
                          className={cn(
                            'transition-all duration-200',
                            'hover:scale-105 active:scale-95',
                            'disabled:opacity-50 disabled:hover:scale-100'
                          )}
                          disabled={
                            isSeller ||
                            [...chats[selectedTrade._id]].includes(
                              'المشتري:[تم استلام المنتج]'
                            )
                          }
                          onClick={async () => {
                            setSendingMsg(true);
                            await sendMessage('[تم استلام المنتج]', ourParty);
                            setSendingMsg(false);
                          }}>
                          تأكيد الاستلام
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Skeleton Chat Messages Loader */}
          {(!chats[selectedTrade._id] ||
            chats[selectedTrade._id].length === 0) && (
            <div className="flex flex-col gap-2">
              {[...Array(30)].map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-6 bg-accent"
                  style={{
                    borderRadius: '8px',
                    width: `${Math.floor(Math.random() * 51) + 50}%`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {selectedTrade.stage === 'buyer_offered' &&
          (isSeller ? (
            <div className="p-4 border-t border-border flex justify-between">
              <Button
                variant="success"
                onClick={() => {
                  setLoading(true);
                  api.trade
                    .sellerAccept(selectedTrade._id)
                    .then(() => {
                      toast.success('تم قبول الصفقة بنجاح');
                    })
                    .catch((error) => {
                      console.error('خطاء في قبول الصفقة', error);
                      toast.error('حدث خطاء في قبول الصفقة');
                    })
                    .finally(() => {
                      setSelectedTrade(null);
                      toast('تستغرق التحديثات 10 دقيقة', {
                        icon: '⏳',
                        duration: 10000,
                      });
                      setLoading(false);
                    });
                }}>
                قبول
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setLoading(true);
                  api.trade
                    .sellerCancel(selectedTrade._id)
                    .then(() => {
                      toast.success('تم الغاء الصفقة بنجاح');
                    })
                    .catch((error) => {
                      console.error('خطاء في الغاء الصفقة', error);
                      toast.error('حدث خطاء في الغاء الصفقة');
                    })
                    .finally(() => {
                      setSelectedTrade(null);
                      toast('تستغرق التحديثات 10 دقيقة', {
                        icon: '⏳',
                        duration: 10000,
                      });
                      setLoading(false);
                    });
                }}>
                رفض
              </Button>
            </div>
          ) : (
            <div className="p-4 border-t border-border flex justify-between">
              <span className="text-muted-foreground">
                انتظر حتى يتم قبول الصفقة
              </span>
            </div>
          ))}
        {console.log(sendingMsg)}
        {selectedTrade.stage !== 'buyer_offered' && (
          <div className="p-4 border-t border-border flex flex-col sm:flex-row gap-2">
            {sendingMsg ? (
              <div className="flex items-center justify-center bg-card p-4 opacity-50">
                <span className="text-card-foreground text-sm">
                  جاري الارسال...
                </span>
              </div>
            ) : (
              <input
                type="text"
                className="flex-grow border border-border rounded p-2 bg-background text-foreground"
                maxLength={100}
                max={100}
                placeholder={`اكتب رسالة إلى ${otherParty}`}
                onKeyUp={async (e) => {
                  if (e.key === 'Enter') {
                    setSendingMsg(true);
                    await sendMessage(e.target.value, ourParty);
                    setSendingMsg(false);
                    e.target.value = '';
                  }
                }}
              />
            )}
            {isSeller &&
              ![...chats[selectedTrade._id]]?.includes(
                'البائع:[تم إرسال المنتج]'
              ) && (
                <button
                  className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
                  onClick={async () => {
                    setSendingMsg(true);
                    await sendMessage('[تم إرسال المنتج]', ourParty);
                    setSendingMsg(false);
                  }}>
                  إرسال المنتج
                </button>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

RenderTradeChat.propTypes = {
  selectedTrade: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    isSellTrade: PropTypes.bool.isRequired,
    quantity: PropTypes.number.isRequired,
    stage: PropTypes.oneOf([
      'buyer_offered',
      'seller_accepted',
      'buyer_confirmed',
    ]).isRequired,
    seller: PropTypes.shape({
      username: PropTypes.string,
      profile: PropTypes.shape({
        profilePicture: PropTypes.string,
      }),
    }),
    buyer: PropTypes.shape({
      username: PropTypes.string,
      profile: PropTypes.shape({
        profilePicture: PropTypes.string,
      }),
    }),
  }),
  sendMessage: PropTypes.func.isRequired,
  setSelectedTrade: PropTypes.func.isRequired,
  user: PropTypes.shape({
    username: PropTypes.string.isRequired,
    profile: PropTypes.shape({
      profilePicture: PropTypes.string,
    }),
  }).isRequired,
  chats: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
};

const TradesPage = () => {
  const { user } = useOutletContext();
  const [buyTrades, setBuyTrades] = useState([]);
  const [sellTrades, setSellTrades] = useState([]);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [activeTab, setActiveTab] = useState('buy');
  const [chats, setChats] = useState({});
  const [loaded, setLoaded] = useState(false);

  // Existing fetch trades effect and handlers remain the same
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const buyResponse = await api.trade.getMyTrades();
        const sellResponse = await api.trade.getProductsTrades();
        setBuyTrades(buyResponse);
        setSellTrades(sellResponse);
      } catch (error) {
        console.error('خطأ في جلب الصفقات', error);
      } finally {
        setLoaded(true);
      }
    };

    fetchTrades();
  }, []);

  const handleTradeSelect = (trade, isSellTrade) => {
    setSelectedTrade({ ...trade, isSellTrade });
    if (!chats[trade._id]) {
      setChats({ ...chats, [trade._id]: [] });
      if (trade.stage !== 'buyer_offered')
        api.chat
          .getMsgs(trade._id)
          .then((chat) => {
            setChats({
              ...chats,
              [trade._id]:
                [...chat.messages].length > 0
                  ? chat.messages
                  : [
                      'النظام:[يمكنكم البدء بالدردشة]',
                      'النظام:[الدردشة فارغة]',
                    ],
            });
          })
          .catch((error) => {
            console.error('خطاء في جلب الدردشات', error);
            setChats({
              ...chats,
              [trade._id]: ['النظام:[حدث خطأ]'],
            });
            toast.error('خطاء في جلب الدردشات');
          });
    }
  };

  // WebSocket connection and message handling
  useEffect(() => {
    const wsListener = (event, data) => {
      if (event === 'message') {
        const message = JSON.parse(data);
        console.log(buyTrades, sellTrades);
        if (message.type === 'msg' && message.tradeId) {
          if (
            ![...buyTrades].some((trade) => trade._id === message.tradeId) &
            ![...sellTrades].some((productTrades) =>
              [...productTrades.trades].some(
                (trade) => trade._id === message.tradeId
              )
            )
          )
            return;
          setChats((prev) => {
            const updatedChats = { ...prev };
            if (!updatedChats[message.tradeId])
              updatedChats[message.tradeId] = [];
            updatedChats[message.tradeId].push(
              `${message.sender}: ${message.text}`
            );
            return updatedChats;
          });
        }
      }
    };

    const unsubscribe = wss.addListener(wsListener);
    wss.connect();

    return () => {
      unsubscribe();
    };
  }, [buyTrades, sellTrades]);

  if (!loaded) return <LoadingPage text="جار تحميل الصفقات" />;

  const sendMessage = async (message, sender) => {
    try {
      if (!selectedTrade && !message) return;
      if (message === '')
        return setChats((prev) => ({
          ...prev,
          [selectedTrade._id]: [
            ...prev[selectedTrade._id],
            'النظام:[الرسائل الفارغة ممنوعة]',
          ],
        }));
      if (
        [...chats[selectedTrade._id]]
          .filter((msg) =>
            !msg.startsWith('النظام') & selectedTrade.isSellTrade
              ? msg.startsWith('البائع')
              : msg.startsWith('المشتري')
          )
          .pop() === `${sender}:${message}`
      )
        return setChats((prev) => ({
          ...prev,
          [selectedTrade._id]: [
            ...prev[selectedTrade._id],
            'النظام:[يمنع تكرار نفس الرسالة]',
          ],
        }));
      if (
        ([...chats[selectedTrade._id]].includes('البائع:[تم إرسال المنتج]') &&
          sender === 'البائع' &&
          /^[[\]].*[[\]]$/.test(message)) ||
        ([...chats[selectedTrade._id]].includes('المشتري:[تم استلام المنتج]') &&
          sender === 'المشتري' &&
          /^[[\]].*[[\]]$/.test(message))
      )
        return setChats((prev) => ({
          ...prev,
          [selectedTrade._id]: [
            ...prev[selectedTrade._id],
            'النظام:[تم إرسالها بالفعل]',
          ],
        }));
      if (message.length > 100) return toast.error('الرسالة طويلة جداً');

      const send = async () => {
        try {
          await api.chat.sendMsg(selectedTrade._id, `${sender}:${message}`);

          setChats((prev) => ({
            ...prev,
            [selectedTrade._id]: [
              ...prev[selectedTrade._id],
              `${sender}:${message}`,
            ],
          }));

          wss.send({
            type: 'msg',
            text: message,
            tradeId: selectedTrade._id,
            target: selectedTrade.isSellTrade
              ? selectedTrade.buyer.username
              : selectedTrade.seller.username,
          });
        } catch (error) {
          console.error('خطاء في ارسال الرسالة', error);
          toast.error('خطاء في ارسال الرسالة');
        }
      };

      if (`${sender}:${message}` === 'المشتري:[تم استلام المنتج]') {
        try {
          await api.trade.buyerConfirmed(selectedTrade._id);
          toast.success('تم استلام المنتج');
        } catch (e) {
          console.error('Error confirming trade:', e);
          toast.error('خطاء في استلام المنتج');
        } finally {
          await send();
        }
      } else await send();
    } catch (error) {
      console.error('خطاء في ارسال الرسالة', error);
      toast.error('خطاء في ارسال الرسالة');
    }
  };

  // Updated sidebar components with new styling
  const renderBuyTradesSidebar = () => (
    <div
      className={`${activeTab === 'buy' ? 'block' : 'hidden'} md:block md:w-1/2 bg-card p-4 overflow-y-auto rtl md:border-l border-border`}>
      <h2 className="text-xl font-bold mb-4 text-card-foreground">
        الصفقات التي أشتريها
      </h2>
      {buyTrades.map((trade) => (
        <div
          key={trade._id}
          onClick={() => handleTradeSelect(trade, false)}
          className={`cursor-pointer p-2 hover:bg-primary hover:text-primary-foreground rounded-lg mb-2 transition-colors ${
            selectedTrade?._id === trade._id && !selectedTrade?.isSellTrade
              ? ' bg-20primary text-20foreground'
              : ''
          }`}>
          <h3 className="text-card-foreground">{trade.product?.name}</h3>
          <p className="text-muted-foreground text-sm">
            البائع: {trade.seller?.username}
          </p>
          <p className="text-muted-foreground text-sm">
            الحالة: {translateStage[trade.stage]}
          </p>
        </div>
      ))}
    </div>
  );

  const renderSellTradesSidebar = () => (
    <div
      className={`${activeTab === 'sell' ? 'block' : 'hidden'} md:block md:w-1/2 bg-card p-4 overflow-y-auto rtl border-border`}>
      <h2 className="text-xl font-bold mb-4 text-card-foreground">
        صفقات منتجاتي
      </h2>
      {sellTrades.map((productTrade) => (
        <div key={productTrade.product._id} className="mb-4">
          <h3 className="font-semibold text-card-foreground">
            {productTrade.product.name}
          </h3>
          {productTrade.trades.map((trade) => (
            <div
              key={trade._id}
              onClick={() => handleTradeSelect(trade, true)}
              className={`cursor-pointer p-2 hover:bg-primary hover:text-primary-foreground rounded-lg mb-2 transition-colors ${
                selectedTrade?._id === trade._id && selectedTrade?.isSellTrade
                  ? ' bg-20primary text-20foreground'
                  : ''
              }`}>
              <p className="text-muted-foreground text-sm">
                المشتري: {trade.buyer?.username}
              </p>
              <p className="text-muted-foreground text-sm">
                الحالة: {translateStage[trade.stage]}
              </p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  // Mobile navigation tabs
  const renderMobileTabs = () => (
    <div className="md:hidden flex border-b border-border mb-4">
      <button
        className={`flex-1 py-2 px-4 ${
          activeTab === 'buy'
            ? 'border-b-2 border-primary text-primary'
            : 'text-muted-foreground'
        }`}
        onClick={() => setActiveTab('buy')}>
        المشتريات
      </button>
      <button
        className={`flex-1 py-2 px-4 ${
          activeTab === 'sell'
            ? 'border-b-2 border-primary text-primary'
            : 'text-muted-foreground'
        }`}
        onClick={() => setActiveTab('sell')}>
        المبيعات
      </button>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background rtl overflow-hidden">
      {renderMobileTabs()}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <div className="md:flex border border-border rounded-lg overflow-y-auto max-h-[50vh] md:max-h-full">
          {renderBuyTradesSidebar()}
          {renderSellTradesSidebar()}
        </div>
        <RenderTradeChat
          selectedTrade={selectedTrade}
          sendMessage={sendMessage}
          setSelectedTrade={setSelectedTrade}
          user={user}
          chats={chats}
        />
      </div>
    </div>
  );
};

export default TradesPage;
