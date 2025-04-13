import React, { useState, useRef, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Input, Button, Card, List, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import styles from './index.less';
import {streamChatUsingPost} from "@/services/yubi/deepSeekController";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);

  // 滚动到底部
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 发送消息
  const handleSend = async () => {
    if (!input.trim()) {
      message.warning('请输入消息内容');
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8101/api/ai/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: input }),
      });

      // console.log(response.body)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No readable stream in response');
      }

      const reader = response.body.getReader();

      // console.log(reader)

      const decoder = new TextDecoder('utf-8');
      let assistantMessage = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          setLoading(false);
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        assistantMessage += chunk; // 直接拼接内容

        // 更新 UI
        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg?.role === 'assistant') {
            return [...prev.slice(0, -1), { role: 'assistant', content: assistantMessage }];
          }
          return [...prev, { role: 'assistant', content: assistantMessage }];
        });

        // console.log('当前内容:', assistantMessage); // 调试用
      }
    } catch (error) {
      console.error('请求失败:', error);
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <Card className={styles.chatContainer}>
        <div className={styles.messageList}>
          <List
            dataSource={messages}
            renderItem={(item) => (
              <List.Item className={item.role === 'user' ? styles.userMessage : styles.assistantMessage}>
                <div className={styles.messageContent}>
                  <strong>{item.role === 'user' ? '你' : 'AI助手'}:</strong>
                  <div>{item.content}</div>
                </div>
              </List.Item>
            )}
          />
          <div ref={messageEndRef} />
        </div>

        <div className={styles.inputArea}>
          <Input.TextArea
            rows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="输入消息..."
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            loading={loading}
            className={styles.sendButton}
          >
            发送
          </Button>
        </div>
      </Card>
    </PageContainer>
  );
};

export default ChatPage;

