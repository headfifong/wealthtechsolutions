import React, { useState, useEffect, useRef } from 'react';
import { useMessaging } from '../context/MessagingContext';
import { MessageSquare, Send, ArrowLeft, User, Search, Clock } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Messages: React.FC = () => {
  const { conversations, currentUser, sendMessage, markAsRead } = useMessaging();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [searchParams] = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  // Initialize from URL param
  useEffect(() => {
    const idParam = searchParams.get('id');
    if (idParam) {
      setActiveId(idParam);
      markAsRead(idParam);
    }
  }, [searchParams]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (activeId && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeId, conversations]);

  const activeConversation = conversations.find(c => c.id === activeId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeId || !inputText.trim()) return;
    sendMessage(activeId, inputText.trim());
    setInputText('');
  };

  const handleSelectConversation = (id: string) => {
    setActiveId(id);
    markAsRead(id);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Helper to get the other party's name
  const getOtherPartyName = (conv: typeof conversations[0]) => {
      if (!currentUser) return 'Unknown';
      if (currentUser.id === conv.sellerId) return conv.buyerName;
      return conv.sellerName;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="flex-grow flex overflow-hidden">
        {/* Conversation List */}
        <div className={`w-full md:w-1/3 lg:w-1/4 ${activeId ? 'hidden md:block' : 'block'}`}>
          <div className="flex flex-col h-full bg-white border-r border-gray-200">
            <div className="p-4 border-b border-gray-100">
              <h1 className="text-2xl font-bold text-prepro-dark mb-4">{t('msg.title')}</h1>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder={t('msg.search')}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-prepro-blue/50 text-sm"
                />
                <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
              </div>
            </div>
            
            <div className="flex-grow overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MessageSquare size={32} className="mx-auto mb-2 opacity-20" />
                  <p>{t('msg.empty')}</p>
                </div>
              ) : (
                conversations.map(conv => (
                  <div 
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${activeId === conv.id ? 'bg-blue-50 border-l-4 border-l-prepro-blue' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-prepro-dark truncate max-w-[70%]">{getOtherPartyName(conv)}</span>
                      <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(conv.lastMessageTimestamp)}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                       <span className="text-xs font-bold text-prepro-blue bg-blue-100 px-1.5 py-0.5 rounded">{conv.listingId}</span>
                       <span className="text-xs text-gray-500">{conv.listingName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <p className="text-sm text-gray-600 truncate max-w-[85%]">
                          {conv.messages[conv.messages.length - 1]?.text || t('msg.start')}
                       </p>
                       {conv.unreadCount > 0 && (
                          <span className="ml-2 bg-red-500 text-white text-xs font-bold min-w-[1.25rem] h-5 flex items-center justify-center rounded-full flex-shrink-0 shadow-sm">
                              {conv.unreadCount}
                          </span>
                       )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Chat Window */}
        <div className={`w-full md:w-2/3 lg:w-3/4 ${!activeId ? 'hidden md:block' : 'block'}`}>
          {!activeId || !activeConversation ? (
            <div className="hidden md:flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                 <MessageSquare size={40} className="opacity-50" />
              </div>
              <p className="text-lg">{t('msg.select')}</p>
            </div>
          ) : (
            <div className="flex flex-col h-full bg-gray-50">
              {/* Chat Header */}
              <div className="bg-white p-4 border-b border-gray-200 flex items-center shadow-sm z-10">
                <button onClick={() => setActiveId(null)} className="mr-3 md:hidden p-1 hover:bg-gray-100 rounded-full">
                  <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-prepro-blue to-teal-500 rounded-full flex items-center justify-center text-white font-bold mr-3 shadow-md">
                  {getOtherPartyName(activeConversation).charAt(0)}
                </div>
                <div className="flex-grow min-w-0">
                  <h2 className="font-bold text-prepro-dark truncate">{activeConversation.listingName}</h2>
                  <div className="flex items-center text-xs text-gray-500">
                     <User size={12} className="mr-1" />
                     <span className="mr-2">{getOtherPartyName(activeConversation)}</span>
                     <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{activeConversation.company}</span>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                   <p className="text-xs font-bold text-prepro-blue">{activeConversation.listingId}</p>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-grow overflow-y-auto p-4 space-y-4">
                  {activeConversation.messages.map((msg, index) => {
                      const isMe = msg.senderId === currentUser?.id;
                      const showTime = index === 0 || (msg.timestamp.getTime() - activeConversation.messages[index-1].timestamp.getTime() > 1000 * 60 * 10);

                      return (
                          <React.Fragment key={msg.id}>
                              {showTime && (
                                  <div className="flex justify-center my-4">
                                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1">
                                          <Clock size={10} /> {msg.timestamp.toLocaleDateString()} {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                      </span>
                                  </div>
                              )}
                              <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-[80%] sm:max-w-[70%] p-3 shadow-sm ${
                                      isMe 
                                      ? 'bg-prepro-blue text-white rounded-2xl rounded-tr-none' 
                                      : 'bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-tl-none whitespace-pre-line'
                                  }`}>
                                      <p className="text-sm leading-relaxed">{msg.text}</p>
                                      <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                          {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                      </div>
                                  </div>
                              </div>
                          </React.Fragment>
                      );
                  })}
                  <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="bg-white p-3 md:p-4 border-t border-gray-200">
                  <form onSubmit={handleSend} className="flex gap-2">
                      <input
                          type="text"
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          placeholder={t('msg.input')}
                          className="flex-grow bg-gray-50 border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-prepro-blue focus:border-transparent"
                      />
                      <button 
                          type="submit" 
                          disabled={!inputText.trim()}
                          className="bg-prepro-blue text-white p-2.5 rounded-full hover:bg-prepro-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                      >
                          <Send size={20} />
                      </button>
                  </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;