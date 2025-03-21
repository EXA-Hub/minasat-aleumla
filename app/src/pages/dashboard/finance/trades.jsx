// app/src/pages/dashboard/finance/trades.jsx
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { ar } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { useOutletContext } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, XCircle } from 'lucide-react';
import CommentDialog from '../../../components/shared/commentDialog.jsx';
import Username from '../../../components/explore/widgets/Username';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Skeleton } from '../../../components/ui/skeleton';
import CoinIcon from '../../../components/ui/CoinIcon';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import LoadingPage from '../../core/loading.jsx';
import wss from '../../../services/wss.js';
import { cn } from '../../../lib/utils';
import api from '../../../utils/api';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '../../../components/ui/avatar';
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '../../../components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';

const translateStage = {
  buyer_offered: 'صفقة جديدة',
  seller_accepted: 'صفقة مفتوحة',
  buyer_confirmed: 'تم الإستلام',
};

// Updated chat area with new styling
const RenderTradeChat = ({
  setAskCommentAndRateDialog,
  selectedTrade,
  sendMessage,
  setSelectedTrade,
  user,
  chats,
}) => {
  const chatContainerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);

  useEffect(() => {
    if (
      chatContainerRef &&
      chatContainerRef.current &&
      chatContainerRef.current.scrollHeight
    )
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight + 100;
  }, [chatContainerRef, chatContainerRef.current?.scrollHeight]);

  if (loading)
    return (
      <div className="flex flex-1 items-center justify-center">
        <LoadingPage text="جاري التحميل" />
      </div>
    );

  if (!selectedTrade)
    return (
      <div className="text-card-foreground hidden flex-1 items-center justify-center md:flex">
        اختر صفقة
      </div>
    );

  const isSeller = selectedTrade.isSellTrade;
  const otherParty = isSeller ? 'المشتري' : 'البائع';
  const ourParty = isSeller ? 'البائع' : 'المشتري';
  const otherUser = selectedTrade.seller || selectedTrade.buyer;

  function mergeMessages(messages) {
    const merged = [];
    let currentUser = null;
    let contents = [];
    let minDate = null;

    const parseMessage = (msg) => {
      const colonIndex = msg.indexOf(':');
      if (colonIndex === -1) return { username: '', content: msg, date: null };

      const username = msg.slice(0, colonIndex).trim();
      const rest = msg.slice(colonIndex + 1).trim();
      const parts = rest.split('\n');
      let date = null;
      let contentLines = [];

      // Extract date from last numeric part
      for (let i = parts.length - 1; i >= 0; i--) {
        if (/^\d+$/.test(parts[i])) {
          date = parts[i];
          contentLines = parts.slice(0, i);
          break;
        }
      }
      if (date === null) contentLines = parts;

      return {
        username,
        content: contentLines.join('\n'),
        date,
        isSpecial:
          contentLines.length === 1 &&
          contentLines[0].startsWith('[') &&
          contentLines[0].endsWith(']'),
      };
    };

    for (const msg of messages) {
      if (!msg.trim()) continue;

      // Handle system messages
      if (msg.startsWith('النظام:')) {
        if (currentUser !== null) {
          merged.push({
            username: currentUser,
            content: contents.join('\n'),
            date: minDate,
          });
          currentUser = null;
          contents = [];
          minDate = null;
        }
        merged.push(parseMessage(msg));
        continue;
      }

      const parsed = parseMessage(msg);

      // Merge logic
      if (parsed.isSpecial) {
        if (currentUser !== null) {
          merged.push({
            username: currentUser,
            content: contents.join('\n'),
            date: minDate,
          });
        }
        merged.push(parsed);
        currentUser = null;
        contents = [];
        minDate = null;
      } else if (parsed.username === currentUser) {
        contents.push(parsed.content);
        if (parsed.date && (!minDate || parsed.date < minDate)) {
          minDate = parsed.date;
        }
      } else {
        if (currentUser !== null) {
          merged.push({
            username: currentUser,
            content: contents.join('\n'),
            date: minDate,
          });
        }
        currentUser = parsed.username;
        contents = [parsed.content];
        minDate = parsed.date;
      }
    }

    // Add remaining messages
    if (currentUser !== null) {
      merged.push({
        username: currentUser,
        content: contents.join('\n'),
        date: minDate,
      });
    }

    return merged;
  }

  return (
    <div className="rtl relative min-h-[500px] flex-1 overflow-hidden pt-4 md:p-4 md:pt-0">
      <div className="hover:bg-50primary absolute top-0 left-0 h-full w-1 cursor-ew-resize transition-colors" />
      <div className="bg-card flex h-full flex-col rounded-lg shadow-md">
        {/* Header */}
        {/* selectedTrade.quantity */}
        <p className="bg-40foreground text-foreground absolute flex h-8 w-8 items-center justify-center rounded-full rounded-tr-lg text-sm font-semibold md:right-4">
          {selectedTrade.quantity}
        </p>
        <header className="border-border flex items-center justify-between border-b p-4">
          {/* Left Section: Avatar & Username */}
          <div className="hover:bg-50muted flex items-center gap-3 rounded-lg p-2 transition-colors duration-200">
            <Avatar className="border-border ring-background h-8 w-8 border-2 ring-2 shadow-xs md:h-10 md:w-10">
              <AvatarImage
                src={otherUser.profilePicture || '/avatar.jpg'}
                alt={otherUser.username || 'User Avatar'}
                className="object-cover"
              />
              <AvatarFallback>{otherUser.username?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            {otherUser && otherUser.username && (
              <Username username={otherUser.username} />
            )}
          </div>

          {/* Close Button */}
          <XCircle
            onClick={() => setSelectedTrade(null)}
            aria-label="Close Trade"
            className="text-muted-foreground cursor-pointer transition-colors duration-200 hover:text-red-500"
          />
        </header>

        {/* Chat Messages */}
        <div
          ref={chatContainerRef}
          className="scrollbar-thin scrollbar-thumb-primary scrollbar-track-background grow overflow-y-auto p-4">
          <div className="flex flex-col gap-6 px-2 py-4">
            {mergeMessages([...chats[selectedTrade._id]]).map(
              ({ username, content, date, isSpecial }, index) => {
                const msgAuthor =
                  username === 'النظام'
                    ? { profile: { profilePicture: '/icon.svg' } }
                    : username === 'البائع'
                      ? isSeller
                        ? user
                        : otherUser
                      : username === 'المشتري'
                        ? !isSeller
                          ? user
                          : otherUser
                        : username === user.username
                          ? user
                          : otherUser;

                const isSystem = username === 'النظام';
                const isError = content === '[حدث خطأ]';
                const isGreen = content === '[تم إرسالها بالفعل]';
                const isSent = username === ourParty;

                return (
                  <div
                    key={index}
                    className={cn(
                      'group flex items-start gap-3',
                      isSent ? 'flex-row-reverse' : 'flex-row'
                    )}>
                    <Avatar
                      className={cn(
                        'h-8 w-8 shrink-0 select-none md:h-10 md:w-10',
                        'border-border ring-background border-2 ring-2 shadow-xs transition-transform duration-200',
                        'group-hover:scale-105'
                      )}>
                      <AvatarImage
                        src={
                          msgAuthor.profile?.profilePicture ||
                          msgAuthor.profilePicture ||
                          '/avatar.jpg'
                        }
                        alt={msgAuthor.username || 'User Avatar'}
                        className="object-cover"
                      />
                      <AvatarFallback>
                        {msgAuthor.username?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>

                    <div
                      className={cn(
                        'flex max-w-[80%] flex-col gap-1 md:max-w-[70%]',
                        isSent && 'items-end'
                      )}>
                      {msgAuthor &&
                        msgAuthor.username &&
                        (user.username === msgAuthor.username ? (
                          <div className="flex items-center gap-2 px-1">
                            <span className="text-muted-foreground text-xs">
                              {format(parseInt(date) || new Date(), 'p', {
                                locale: ar,
                              }).toString()}
                            </span>
                            <Username username={msgAuthor.username} />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-1">
                            <Username username={msgAuthor.username} />
                            <span className="text-muted-foreground text-xs">
                              {format(parseInt(date) || new Date(), 'p', {
                                locale: ar,
                              }).toString()}
                            </span>
                          </div>
                        ))}

                      <p
                        className={cn(
                          'w-fit rounded-2xl px-4 py-2.5 text-sm',
                          'shadow-xs transition-colors duration-200',
                          'whitespace-pre-line',
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
                        {content}
                      </p>
                      {isSpecial && content.includes('[تم إرسال المنتج]') && (
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
                              [...chats[selectedTrade._id]].some((msg) =>
                                msg.includes('المشتري:[تم استلام المنتج]')
                              )
                            }
                            onClick={async () => {
                              setSendingMsg(true);
                              await sendMessage('[تم استلام المنتج]', ourParty);
                              setSendingMsg(false);
                              toast.success('تم استلام المنتج بنجاح');
                              setAskCommentAndRateDialog(true);
                            }}>
                            تأكيد الاستلام
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>

          {/* Skeleton Chat Messages Loader */}
          {(!chats[selectedTrade._id] ||
            chats[selectedTrade._id].length === 0) && (
            <div className="flex flex-col gap-2">
              {[...Array(30)].map((_, index) => (
                <Skeleton
                  key={index}
                  className="bg-accent h-6"
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
            <div className="border-border flex justify-between border-t p-4">
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
            <div className="border-border flex justify-between border-t p-4">
              <span className="text-muted-foreground">
                انتظر حتى يتم قبول الصفقة
              </span>
            </div>
          ))}
        {selectedTrade.stage !== 'buyer_offered' && (
          <div className="border-border flex flex-col gap-2 border-t p-4 sm:flex-row">
            {sendingMsg ? (
              <div className="bg-card flex items-center justify-center p-4 opacity-50">
                <span className="text-card-foreground text-sm">
                  جاري الارسال...
                </span>
              </div>
            ) : (
              <input
                type="text"
                className="border-border bg-background text-foreground grow rounded-sm border p-2"
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
              ![...chats[selectedTrade._id]]?.some((someMsg) =>
                someMsg.includes('البائع:[تم إرسال المنتج]')
              ) && (
                <button
                  className="bg-primary text-primary-foreground hover:bg-90primary rounded-sm px-4 py-2"
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
  setAskCommentAndRateDialog: PropTypes.func.isRequired,
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

const RenderSellTradesSidebar = ({
  activeTab,
  sellTrades,
  selectedTrade,
  handleTradeSelect,
  translateStage,
}) => {
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');

  const sortedTrades = [...sellTrades].sort((a, b) => {
    if (sortBy === 'name') {
      return order === 'asc'
        ? a.product.name.localeCompare(b.product.name)
        : b.product.name.localeCompare(a.product.name);
    } else if (sortBy === 'price') {
      return order === 'asc'
        ? a.product.price - b.product.price
        : b.product.price - a.product.price;
    } else if (sortBy === 'trades') {
      return order === 'asc'
        ? a.trades.length - b.trades.length
        : b.trades.length - a.trades.length;
    }
    return 0;
  });

  return (
    <Card
      className={` ${activeTab === 'sell' ? 'block' : 'hidden'} w-full shrink-0 rounded-none border-0 md:w-80`}>
      <CardHeader className="space-y-1.5 p-4">
        <CardTitle className="text-xl font-bold">صفقات منتجاتي</CardTitle>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="text-sm font-medium">الترتيب بحسب:</span>

          <div className="flex flex-wrap gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-8 w-[110px]">
                <SelectValue placeholder="اختر الترتيب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">الاسم</SelectItem>
                <SelectItem value="price">السعر</SelectItem>
                <SelectItem value="trades">عدد الصفقات</SelectItem>
              </SelectContent>
            </Select>

            <Select value={order} onValueChange={setOrder}>
              <SelectTrigger className="h-8 w-[110px]">
                <SelectValue placeholder="اختر الاتجاه" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">تصاعدي</SelectItem>
                <SelectItem value="desc">تنازلي</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <ScrollArea>
        <CardContent className="p-4">
          {sortedTrades.map((productTrade) => (
            <Card
              key={productTrade.product._id}
              className="mb-4 overflow-hidden">
              <CardHeader className="space-y-0 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium">
                    {productTrade.product.name}
                  </span>
                  <div className="flex shrink-0 items-center gap-2">
                    <CoinIcon amount={productTrade.product.price} />
                    {productTrade.product.isLocked ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <Unlock className="h-4 w-4" />
                    )}
                    <Badge variant="secondary" className="h-6">
                      {productTrade.trades.length}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {productTrade.trades.map((trade) => (
                  <div
                    key={trade._id}
                    onClick={() => handleTradeSelect(trade, true)}
                    className={`hover:bg-primary hover:text-primary-foreground cursor-pointer p-3 transition-colors ${
                      selectedTrade?._id === trade._id &&
                      selectedTrade?.isSellTrade
                        ? 'bg-10primary text-primary'
                        : ''
                    } `}>
                    <div className="flex flex-col gap-1 text-sm">
                      <p className="flex items-center gap-2">
                        <span className="text-muted-foreground">المشتري:</span>
                        <span className="font-medium">
                          {trade.buyer?.username}
                        </span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="text-muted-foreground">الحالة:</span>
                        <span>{translateStage[trade.stage]}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </ScrollArea>
    </Card>
  );
};

RenderSellTradesSidebar.propTypes = {
  activeTab: PropTypes.string.isRequired,
  sellTrades: PropTypes.arrayOf(
    PropTypes.shape({
      product: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired,
        isLocked: PropTypes.bool.isRequired,
      }).isRequired,
      trades: PropTypes.arrayOf(
        PropTypes.shape({
          _id: PropTypes.string.isRequired,
          buyer: PropTypes.shape({
            username: PropTypes.string,
          }),
          stage: PropTypes.string.isRequired,
        })
      ).isRequired,
    })
  ).isRequired,
  selectedTrade: PropTypes.shape({
    _id: PropTypes.string,
    isSellTrade: PropTypes.bool,
  }),
  handleTradeSelect: PropTypes.func.isRequired,
  translateStage: PropTypes.object.isRequired,
};

const TradesPage = () => {
  const { user } = useOutletContext();
  const [buyTrades, setBuyTrades] = useState([]);
  const [sellTrades, setSellTrades] = useState([]);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [activeTab, setActiveTab] = useState('buy');
  const [chats, setChats] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [askCommentAndRateDialog, setAskCommentAndRateDialog] = useState(false);

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
        /^[[\]].*[[\]]$/.test(message.trim()) &&
        (([...chats[selectedTrade._id]].includes('البائع:[تم إرسال المنتج]') &&
          sender === 'البائع') ||
          ([...chats[selectedTrade._id]].includes(
            'المشتري:[تم استلام المنتج]'
          ) &&
            sender === 'المشتري'))
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

  const renderBuyTradesSidebar = () => (
    <div
      className={`${activeTab === 'buy' ? 'block' : 'hidden'} rtl bg-card shrink-0 overflow-y-auto md:w-80`}>
      <div className="p-4">
        <h2 className="text-card-foreground mb-4 text-xl font-bold">
          الصفقات التي أشتريها
        </h2>
        {buyTrades.map((trade) => (
          <div
            key={trade._id}
            onClick={() => handleTradeSelect(trade, false)}
            className={`border-border hover:bg-primary hover:text-primary-foreground mb-2 cursor-pointer rounded-none border p-3 transition-colors ${
              selectedTrade?._id === trade._id && !selectedTrade?.isSellTrade
                ? 'bg-primary text-primary-foreground'
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
    </div>
  );

  // Mobile navigation tabs
  const renderMobileTabs = () => (
    <header className="border-border bg-background sticky top-0 z-10 w-full border-b">
      <nav className="flex items-center justify-between">
        <button
          className={`flex-1 px-4 py-2 transition-colors ${
            activeTab === 'buy'
              ? 'bg-primary text-primary-foreground'
              : 'bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          }`}
          onClick={() => setActiveTab('buy')}>
          المشتريات
        </button>
        <button
          className={`flex-1 px-4 py-2 transition-colors ${
            activeTab === 'sell'
              ? 'bg-primary text-primary-foreground'
              : 'bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          }`}
          onClick={() => setActiveTab('sell')}>
          المبيعات
        </button>
      </nav>
    </header>
  );

  return (
    <div className="rtl bg-background flex h-screen min-h-[50rem] flex-col overflow-hidden md:flex-row">
      {askCommentAndRateDialog && (
        <CommentDialog
          productId={selectedTrade?.productId}
          otherId={selectedTrade?._id}
          onSuccess={() => setAskCommentAndRateDialog(false)}
        />
      )}
      <div className="flex flex-1 flex-col overflow-hidden md:h-full md:min-h-[50rem] md:w-1/2 md:flex-row">
        <div className="flex-col overflow-y-auto md:flex">
          {renderMobileTabs()}
          {renderBuyTradesSidebar()}
          <RenderSellTradesSidebar
            activeTab={activeTab}
            sellTrades={sellTrades}
            selectedTrade={selectedTrade}
            handleTradeSelect={handleTradeSelect}
            translateStage={translateStage}
          />
        </div>
        <RenderTradeChat
          selectedTrade={selectedTrade}
          sendMessage={sendMessage}
          setSelectedTrade={setSelectedTrade}
          user={user}
          chats={chats}
          setAskCommentAndRateDialog={setAskCommentAndRateDialog}
        />
      </div>
    </div>
  );
};

export default TradesPage;
