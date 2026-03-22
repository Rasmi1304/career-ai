import { useState, useRef, useEffect } from 'react';
import { chat } from '../api';
import { MessageSquare, Send, X, ShieldAlert, User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function SmartChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'bot', text: "I am your personal career analyst.\n\nAsk me about your data, e.g. *Why am I getting rejected?*" }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const response = await chat(userMessage);
      setMessages(prev => [...prev, { role: 'bot', text: response.reply }]);
    } catch (error) {
       console.error(error);
       setMessages(prev => [...prev, { role: 'bot', text: 'Error connecting to the intelligence engine.' }]);
    } finally {
       setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="btn"
        style={{ position: 'fixed', bottom: '24px', right: '24px', borderRadius: '50%', width: '56px', height: '56px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.3)', zIndex: 1000 }}
      >
        <MessageSquare size={24} />
      </button>
    );
  }

  return (
    <div style={{
        position: 'fixed', bottom: '24px', right: '24px', width: '380px', height: '540px',
        background: 'rgba(15, 23, 42, 0.98)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px', boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column', zIndex: 1000, overflow: 'hidden', backdropFilter: 'blur(10px)'
    }}>
      <div style={{ background: 'var(--primary-color)', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '1rem' }}>
              <ShieldAlert size={18} /> Analyst Databot
          </span>
          <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.8 }}>
             <X size={20} />
          </button>
      </div>

      <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((m, idx) => (
             <div key={idx} style={{ 
                 alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                 display: 'flex', gap: '8px', maxWidth: '85%', alignItems: 'flex-start'
             }}>
                 {m.role === 'bot' && (
                     <div style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '6px', borderRadius: '50%', flexShrink: 0 }}>
                        <Bot size={16} color="#8b5cf6" />
                     </div>
                 )}
                 
                 <div style={{ 
                     background: m.role === 'user' ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
                     color: '#fff', padding: '12px 16px', borderRadius: '12px',
                     borderTopRightRadius: m.role === 'user' ? '2px' : '12px',
                     borderTopLeftRadius: m.role === 'bot' ? '2px' : '12px',
                     fontSize: '0.85rem', lineHeight: '1.5',
                     border: m.role === 'bot' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                     boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                 }}>
                     {m.role === 'bot' ? (
                        <div className="markdown-content advice-bullets" style={{ margin: 0 }}>
                           <ReactMarkdown>{m.text}</ReactMarkdown>
                        </div>
                     ) : (
                         m.text
                     )}
                 </div>

                 {m.role === 'user' && (
                     <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '6px', borderRadius: '50%', flexShrink: 0 }}>
                        <User size={16} color="#3b82f6" />
                     </div>
                 )}
             </div>
          ))}
          {loading && (
             <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '8px', maxWidth: '85%', alignItems: 'center' }}>
                 <div style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '6px', borderRadius: '50%', flexShrink: 0 }}>
                    <Bot size={16} color="#8b5cf6" />
                 </div>
                 <div style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', padding: '12px 16px', borderRadius: '12px', borderTopLeftRadius: '2px', fontSize: '0.8rem' }}>
                     Analyzing Patterns... <div className="spinner" style={{display:'inline-block', width:'10px', height:'10px'}}></div>
                 </div>
             </div>
          )}
          <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)' }}>
          <input 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="E.g. What is my biggest weakness?"
              className="input-field"
              style={{ flex: 1, padding: '10px 14px', fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
          <button type="submit" disabled={loading || !input.trim()} className="btn" style={{ padding: '10px 14px', minWidth: 'auto', background: 'var(--primary-color)' }}>
              <Send size={18} />
          </button>
      </form>
    </div>
  );
}
