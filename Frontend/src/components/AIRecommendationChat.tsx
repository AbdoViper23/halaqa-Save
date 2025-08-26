import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, MessageCircle, Send, X, Minimize2, Maximize2 } from 'lucide-react';
import { geminiService } from '@/services/geminiService';
import { useGroupsStore } from '@/stores/useGroupsStore';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const AIRecommendationChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm your savings advisor. I can help you find the perfect savings group based on your goals, budget, and timeline. What are you looking to save for?",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get available groups from store
  const { backendGroups } = useGroupsStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      console.log('🤖 Processing AI request with Gemini...');
      console.log('📊 Available groups count:', backendGroups.length);
      
      if (!geminiService.isAvailable()) {
        throw new Error('Gemini service not available');
      }
      
      console.log('📝 Sending to Gemini:', { message: currentInput, groupsCount: backendGroups.length });
      const aiResponseText = await geminiService.getSavingsRecommendation(currentInput, backendGroups);
      console.log('✅ Received response from Gemini');
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponseText,
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('❌ Gemini AI Error:', error);
      
      // Show error message to user
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble connecting to the AI service right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <div className="relative">
            <Bot className="w-8 h-8 text-primary-foreground" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
        </Button>
        <div className="absolute -top-12 right-0 bg-foreground text-background px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          Get AI recommendations
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`
        transition-all duration-300 shadow-2xl
        ${isMaximized 
          ? 'fixed top-4 left-4 right-4 bottom-20 w-auto h-auto' 
          : isMinimized 
            ? 'w-96 h-16' 
            : 'w-96 h-[600px]'
        }
      `}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Bot className="w-6 h-6 text-primary" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <CardTitle className="text-lg">AI Advisor</CardTitle>
                <Badge variant="secondary" className="text-xs">Online</Badge>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsMaximized(!isMaximized);
                  setIsMinimized(false);
                }}
                className="h-8 w-8 p-0"
                title={isMaximized ? "Restore window" : "Maximize window"}
              >
                <Maximize2 className={`w-4 h-4 ${isMaximized ? 'rotate-180' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsMinimized(!isMinimized);
                  setIsMaximized(false);
                }}
                className="h-8 w-8 p-0"
                title={isMinimized ? "Restore window" : "Minimize window"}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className={`
            flex flex-col p-0
            ${isMaximized ? 'h-full max-h-[calc(100vh-200px)]' : 'h-[520px]'}
          `}>
            {/* Messages Area */}
            <div className={`
              flex-1 overflow-y-auto space-y-4
              ${isMaximized ? 'p-6' : 'p-4'}
            `}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`
                      ${isMaximized ? 'max-w-[70%] p-4' : 'max-w-[80%] p-3'} 
                      rounded-lg 
                      ${message.isUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                      }
                    `}
                  >
                    <p className={`${isMaximized ? 'text-base leading-relaxed' : 'text-sm'}`}>
                      {message.content}
                    </p>
                    <p className={`opacity-70 mt-1 ${isMaximized ? 'text-sm' : 'text-xs'}`}>
                      {message.timestamp.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className={`
                    bg-muted text-foreground rounded-lg flex items-center space-x-3
                    ${isMaximized ? 'p-4' : 'p-3'}
                  `}>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className={`text-muted-foreground ${isMaximized ? 'text-base' : 'text-sm'}`}>
                      AI is analyzing your request...
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={`
              border-t bg-background/95 backdrop-blur-sm
              ${isMaximized ? 'p-4 sticky bottom-0' : 'p-4'}
            `}>
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about savings groups, budgets, goals..."
                  className={`flex-1 ${isMaximized ? 'text-base py-3' : ''}`}
                  disabled={isTyping}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  size={isMaximized ? "default" : "sm"}
                  className={isMaximized ? "px-6" : ""}
                >
                  <Send className={`${isMaximized ? 'w-5 h-5' : 'w-4 h-4'}`} />
                </Button>
              </div>
              <div className={`flex items-center justify-between mt-3 ${isMaximized ? 'text-sm' : 'text-xs'} text-muted-foreground`}>
                <span>💡 Ask about your savings goals, budget planning, or group recommendations</span>
                {isMaximized && <span>{backendGroups.length} groups available</span>}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default AIRecommendationChat;
