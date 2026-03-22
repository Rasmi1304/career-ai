import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addSkill } from '../api';
import { Send, CheckCircle } from 'lucide-react';

export default function AddSkill() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    proficiency: 'Beginner'
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addSkill(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      console.error(err);
      alert('Failed to add skill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in delay-1" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 className="gradient-text" style={{ marginBottom: '8px' }}>Add a New Skill</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
        Track your technical and soft skills to let AI analyze your gaps and recommend corresponding roles.
      </p>

      <div className="glass-panel">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="input-label">Skill Name</label>
            <input 
              required
              name="name"
              className="input-field" 
              placeholder="e.g. React.js, Python, System Design"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="input-label">Proficiency</label>
            <select 
              name="proficiency"
              className="input-field"
              value={formData.proficiency}
              onChange={handleChange}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
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
              <><Send size={18} /> Log Skill</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
