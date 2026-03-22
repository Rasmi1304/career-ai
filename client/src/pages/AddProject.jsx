import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addProject } from '../api';
import { Send, CheckCircle } from 'lucide-react';

export default function AddProject() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tools: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addProject(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      console.error(err);
      alert('Failed to add project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in delay-1" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 className="gradient-text" style={{ marginBottom: '8px' }}>Log a Project</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
        Describe projects you've built. The AI mentor will review your project portfolio and suggest resume improvements!
      </p>

      <div className="glass-panel">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="input-label">Project Title</label>
            <input 
              required
              name="title"
              className="input-field" 
              placeholder="e.g. AI Career Mentor"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="input-label">Brief Description</label>
            <textarea 
              required
              name="description"
              className="input-field" 
              style={{ minHeight: '80px', resize: 'vertical' }}
              placeholder="e.g. A web app that gives personalized resume feedback based on past history..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="input-label">Tools & Technologies Used</label>
            <input 
              required
              name="tools"
              className="input-field" 
              placeholder="e.g. React, Node.js, Groq API"
              value={formData.tools}
              onChange={handleChange}
            />
          </div>

          <button 
            type="submit" 
            className={`btn ${loading ? 'loading' : ''}`} 
            style={{ width: '100%', marginTop: '16px' }}
            disabled={loading || success}
          >
            {success ? (
              <><CheckCircle size={18} /> Added Successfully</>
            ) : loading ? (
              <div className="spinner"></div>
            ) : (
              <><Send size={18} /> Log Project</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
