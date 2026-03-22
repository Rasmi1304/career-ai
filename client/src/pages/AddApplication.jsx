import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addApplication, analyzeRole } from '../api';
import { Send, CheckCircle, AlertTriangle, ShieldCheck, Zap, Activity } from 'lucide-react';

export default function AddApplication() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    role: '',
    company: '',
    result: 'pending',
    reason: ''
  });

  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (formData.role.length > 2) {
        setAnalyzing(true);
        analyzeRole(formData.role)
          .then(data => setAnalysis(data))
          .catch(err => console.error(err))
          .finally(() => setAnalyzing(false));
      } else {
        setAnalysis(null);
      }
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [formData.role]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addApplication(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      console.error(err);
      alert('Failed to add application');
    } finally {
      setLoading(false);
    }
  };

  const renderAnalysis = () => {
      if (analyzing) return <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '12px' }}>Running Hindsight Intelligence... <div className="spinner" style={{display:'inline-block', width:'10px', height:'10px'}}></div></div>;
      if (!analysis) return null;

      const riskColor = analysis.riskLevel === 'High' ? 'var(--danger-color)' : analysis.riskLevel === 'Medium' ? 'var(--warning-color)' : 'var(--success-color)';
      const probColor = analysis.successProbability < 30 ? 'var(--danger-color)' : analysis.successProbability < 70 ? 'var(--warning-color)' : 'var(--success-color)';

      return (
          <div className="animate-in" style={{
              background: 'rgba(0,0,0,0.3)', border: `1px solid ${riskColor}33`, 
              borderRadius: '8px', padding: '16px', marginTop: '12px', fontSize: '0.9rem'
          }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                         <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Match Score</span>
                         <span style={{ color: riskColor, fontWeight: 'bold', fontSize: '1rem' }}>{analysis.matchScore}%</span>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '4px', overflow: 'hidden', width: '100%' }}>
                          <div style={{ background: riskColor, width: `${analysis.matchScore}%`, height: '100%' }}></div>
                      </div>
                  </div>
                  
                  <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                         <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Success Prob.</span>
                         <span style={{ color: probColor, fontWeight: 'bold', fontSize: '1rem' }}>{analysis.successProbability}%</span>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '4px', overflow: 'hidden', width: '100%' }}>
                          <div style={{ background: probColor, width: `${analysis.successProbability}%`, height: '100%' }}></div>
                      </div>
                  </div>
                  
                  <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Predicted Fail Stage</p>
                      <h3 style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#fff' }}>{analysis.predictedFailureStage}</h3>
                  </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                      <strong style={{ color: 'var(--success-color)', fontSize: '0.8rem' }}>STRONG SKILLS</strong>
                      <ul style={{ margin: '4px 0 0', paddingLeft: '16px', color: '#fff', fontSize: '0.8rem' }}>
                          {analysis.strongAreas.length === 0 ? <li>None detected</li> : analysis.strongAreas.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                  </div>
                  <div>
                      <strong style={{ color: 'var(--danger-color)', fontSize: '0.8rem' }}>MISSING SKILLS</strong>
                      <ul style={{ margin: '4px 0 0', paddingLeft: '16px', color: '#fff', fontSize: '0.8rem' }}>
                          {analysis.missingSkills.length === 0 ? <li>Looks good!</li> : analysis.missingSkills.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                  </div>
              </div>

              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px', borderRadius: '4px', marginBottom: '8px' }}>
                  <strong style={{ display: 'block', fontSize: '0.8rem', color: 'var(--danger-color)', marginBottom: '4px' }}>Hindsight Reason:</strong>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#ddd' }}>{analysis.riskReason}</p>
              </div>

          </div>
      );
  };

  return (
    <div className="animate-in delay-1" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 className="gradient-text" style={{ marginBottom: '8px' }}>Application Tracker</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
        Log your applications. The system will predict failure stages based on past historical patterns.
      </p>

      <div className="glass-panel">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="input-label">Target Role</label>
            <input 
              required
              name="role"
              className="input-field" 
              placeholder="e.g. Frontend Engineering Intern"
              value={formData.role}
              onChange={handleChange}
            />
            {renderAnalysis()}
          </div>

          <div className="form-group">
            <label className="input-label">Target Company</label>
            <input 
              required
              name="company"
              className="input-field" 
              placeholder="e.g. Stripe"
              value={formData.company}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="input-label">Outcome / Status</label>
            <select 
              name="result"
              className="input-field"
              value={formData.result}
              onChange={handleChange}
            >
              <option value="pending">Pending</option>
              <option value="selected">Selected</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {(formData.result === 'rejected' || formData.result === 'selected') && (
            <div className="form-group animate-in">
              <label className="input-label">Feedback / Reason (Crucial for Hindsight Analysis)</label>
              <textarea 
                name="reason"
                className="input-field"
                style={{ minHeight: '100px', resize: 'vertical' }}
                placeholder="e.g. Rejected after DSA round focusing on graph algorithms..."
                value={formData.reason}
                onChange={handleChange}
              />
            </div>
          )}

          <button 
            type="submit" 
            className={`btn ${loading ? 'loading' : ''}`} 
            style={{ width: '100%', marginTop: '16px' }}
            disabled={loading || success}
          >
            {success ? (
              <><CheckCircle size={18} /> Recorded Successfully</>
            ) : loading ? (
              <div className="spinner"></div>
            ) : (
              <><Send size={18} /> Analyze & Log Application</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
