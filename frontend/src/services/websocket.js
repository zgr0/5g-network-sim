import { useEffect, useState } from 'react';

export const useWebSocket = (url) => {
  const [ws, setWs] = useState(null);
  
  useEffect(() => {
    const webSocket = new WebSocket(url);
    
    webSocket.onopen = () => {
      console.log('WebSocket connected');
      setWs(webSocket);
    };
    
    webSocket.onclose = () => {
      console.log('WebSocket disconnected');
      setWs(null);
    };
    
    return () => {
      webSocket.close();
    };
  }, [url]);
  
  return ws;
};