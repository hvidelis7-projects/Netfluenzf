/**
 * Campaign-thread chat: renders `messages`, sends text via `onSendMessage`.
 * Bubbles are “mine” when `senderRole === currentUserRole`. Enter sends, Shift+Enter could be extended for newline.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Message, UserRole } from '../types';
import { playSound } from '../audio.ts';

interface ChatInterfaceProps {
  currentUserRole: UserRole;
  recipientName: string;
  messages: Message[];
  onSendMessage: (text: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ currentUserRole, recipientName, messages, onSendMessage }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    playSound('message');
    onSendMessage(inputText);
    setInputText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col min-h-[320px] max-h-[520px] bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/50 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-white/30 bg-white/20 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="relative">
             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xs">
                {recipientName.charAt(0)}
             </div>
             <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">{recipientName}</h3>
            <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Direct messages</p>
          </div>
        </div>
        <div className="flex gap-1">
           <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
           <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse delay-75"></div>
           <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse delay-150"></div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-grow p-5 overflow-y-auto custom-scroll space-y-4">
        {messages.map((msg) => {
          const isMe = msg.senderRole === currentUserRole;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 fade-in duration-300 fill-mode-backwards`}>
              <div className={`max-w-[80%] space-y-1 ${isMe ? 'items-end flex flex-col' : 'items-start flex flex-col'}`}>
                <div 
                  className={`p-4 rounded-2xl text-sm font-medium shadow-sm relative ${
                    isMe 
                      ? 'bg-gradient-to-br from-[#FF5500] to-[#FF7700] text-white rounded-br-none' 
                      : 'bg-white/80 backdrop-blur-md text-gray-800 rounded-bl-none border border-white/50'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-gray-500 font-bold opacity-60 px-1">{msg.timestamp}</span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/30 border-t border-white/30">
        <div className="relative flex items-center gap-2">
          <input 
            type="text" 
            className="w-full bg-white/60 border border-white/50 rounded-full pl-5 pr-12 py-3 text-sm focus:outline-none focus:bg-white/90 focus:border-[#FF5500] transition-all placeholder:text-gray-500 shadow-inner"
            placeholder="Type your secure message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button 
            onClick={handleSend}
            className="absolute right-1.5 p-2 bg-[#FF5500] text-white rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
