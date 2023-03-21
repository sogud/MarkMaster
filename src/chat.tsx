import React, { useState, KeyboardEvent } from 'react';
import openai from 'openai';

interface ChatProps {
  apiKey: string;
}

interface ChatMessage {
  message: string;
  response: string;
}

const Chat: React.FC<ChatProps> = ({ apiKey }) => {
  const [message, setMessage] = useState<string>('');
  const [chat, setChat] = useState<ChatMessage[]>([]);

  const callChatGPT = async (message: string, apiKey: string) => {
    // const response = await openai.completions.create({
    //   engine: 'text-davinci-002',
    //   prompt: `chat with GPT: ${message}`,
    //   maxTokens: 60,
    //   temperature: 0.7,
    //   n: 1,
    //   stop: ['\n']
    // }, {
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${apiKey}`
    //   }
    // });
    // const answer = response.choices[0].text.trim();
    // setChat([...chat, { message, response: answer }]);
  }

  const handleKeyPress = async (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      await callChatGPT(message, apiKey);
      setMessage('');
    }
  }

  return (
    <div>
      <input type="text" onChange={(e) => setMessage(e.target.value)} onKeyPress={handleKeyPress} />
      <button onClick={async () => {
        await callChatGPT(message, apiKey);
        setMessage('');
      }}>Send</button>
      {chat.map((item, index) => (
        <div key={index}>
          <p>You: {item.message}</p>
          <p>Bot: {item.response}</p>
        </div>
      ))}
    </div>
  );
}

export default Chat;
