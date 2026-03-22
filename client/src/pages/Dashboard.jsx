import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProfile, getAdvice } from '../api';
import AdviceCards from '../components/AdviceCards';
import SmartChatbot from '../components/SmartChatbot';
import { Sparkles, Briefcase, PlusCircle, Target, Code, Cpu, Activity, AlertCircle, BarChart2, TrendingUp, AlertTriangle, ShieldCheck, Map, ArrowRight, CheckCircle } from 'lucide-react';

export default function Dashboard() {
  const [apps, setApps] = useState([]);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [advice, setAdvice] = useState('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  useEffect(() => {
    getProfile().then(data => {
      setApps(data.applications || []);
      setSkills(data.skills || []);
      setProjects(data.projects || []);
    }).catch(console.error);
  }, []);

  const handleGetAdvice = async () => {
    setLoadingAdvice(true);
    try {
      const { advice } = await getAdvice();
      setAdvice(advice);
    } catch (err) {
      console.error(err);
      setAdvice('Error fetching advice. Please ensure the backend is running and Groq API key is set.');
    } finally {
      setLoadingAdvice(false);
    }
  };

  const hasData = apps.length > 0 || skills.length > 0 || projects.length > 0;

  const getStatusClass = (status) => {
    if (status === 'rejected') return 'status-rejected';
    if (status === 'selected') return 'status-selected';
    return 'status-pending';
  };

  // Performance Dashboard Computations (Pure JS)
  const totalApps = apps.length;
  const rejections = apps.filter(a => a.result === 'rejected').length;
  const pending = apps.filter(a => a.result === 'pending').length;
  const selected = apps.filter(a => a.result === 'selected').length;
  const rejectionRate = totalApps ? Math.round((rejections / totalApps) * 100) : 0;
  
  const rolesCount = apps.reduce((acc, a) => { acc[a.role] = (acc[a.role] || 0) + 1; return acc; }, {});
  const mostAppliedRole = totalApps > 0 ? Object.keys(rolesCount).sort((a,b) => rolesCount[b] - rolesCount[a])[0] : 'N/A';
  
  const failReasons = apps.filter(a => a.result === 'rejected').map(a => (a.reason || '').toLowerCase());
  let mostFailedStage = 'Unknown';
  if (failReasons.some(r => r.includes('hr') || r.includes('behavior'))) mostFailedStage = 'HR Round';
  else if (failReasons.some(r => r.includes('oa') || r.includes('online'))) mostFailedStage = 'Online Assessment';
  else if (failReasons.some(r => r.includes('tech') || r.includes('dsa') || r.includes('interview'))) mostFailedStage = 'Technical Interview';
  else if (rejections > 0) mostFailedStage = 'Resume Screening';

  // Hindsight Logic Patterns
  const patternsList = [];
  if (mostFailedStage !== 'Unknown' && rejections >= 2) {
      patternsList.push(`You fail mostly in ${mostFailedStage}s`);
  }
  const maxRoleCount = Math.max(...Object.values(rolesCount), 0);
  if (maxRoleCount >= 2 && rejections >= 2) {
      patternsList.push(`Narrow role targeting (${mostAppliedRole})`);
  }
  const beginners = skills.filter(s => s.proficiency === 'Beginner').map(s => s.name);
  if (beginners.length > 0) {
      patternsList.push(`${beginners[0]} skill is low (Beginner)`);
  }

  // Next Action Synthesizer
  let nextAction = "Log your first application to track insights.";
  if (mostFailedStage !== 'Unknown') {
      nextAction = `Practice ${mostFailedStage}s`;
      if (beginners.length > 0) nextAction += ` + improve ${beginners[0]}`;
  } else if (totalApps > 0 && selected > 0) {
      nextAction = "Keep applying! Your pipeline is converting.";
  } else if (totalApps > 0 && rejections === 0) {
      nextAction = "Monitor pending apps closely and prepare for OAs.";
  } else if (skills.length === 0) {
      nextAction = "Add your skills to calculate Career Readiness.";
  }

  // Career Readiness Score Calculation (0 - 100)
  const profMap = { 'Beginner': 0.5, 'Intermediate': 1, 'Advanced': 1.5, 'Expert': 2 };
  const skillPoints = skills.reduce((sum, s) => sum + (profMap[s.proficiency] || 1), 0) * 5; 
  const projPoints = projects.length * 10; 
  const successPoints = totalApps > 0 ? ((totalApps - rejections) / totalApps) * 30 : 5; 
  
  let careerScore = Math.min(100, Math.round(skillPoints + projPoints + successPoints));
  if (totalApps === 0 && (skills.length > 0 || projects.length > 0)) {
       careerScore = Math.min(100, Math.round(skillPoints + projPoints + 20));
  }
  const scoreColor = careerScore < 40 ? 'var(--danger-color)' : careerScore < 75 ? 'var(--warning-color)' : 'var(--success-color)';

  const skillWidth = (prof) => {
      if (prof === 'Beginner') return '25%';
      if (prof === 'Intermediate') return '50%';
      if (prof === 'Advanced') return '75%';
      return '100%';
  };

  return (
    <div className="animate-in delay-1" style={{ paddingBottom: '40px' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2rem' }}>Career Intelligence Engine</h1>
          <p style={{ color: 'var(--text-muted)' }}>Analyze applications, predict risk, and generate actionable strategy.</p>
        </div>
        <button className={`btn ${loadingAdvice ? 'loading' : ''}`} onClick={handleGetAdvice} disabled={loadingAdvice || !hasData} style={{ padding: '12px 24px', fontSize: '1rem', fontWeight: 'bold' }}>
          {loadingAdvice ? (
            <div className="spinner"></div>
          ) : (
            <Sparkles size={18} />
          )}
          {loadingAdvice ? 'Running Analysis...' : 'Generate Career Strategy'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr)', gap: '32px' }}>
        
        {/* =========================================
            LEFT COLUMN: PROFILE SUMMARY PANEL
            ========================================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <h2 style={{ fontSize: '1.2rem', margin: '0 0 -8px 0', color: '#fff' }}>Your Career Profile</h2>

           {/* SUMMARY METRICS BLOCK */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="glass-panel" style={{ padding: '16px', border: `1px solid ${scoreColor}33`, background: `rgba(${scoreColor === 'var(--success-color)' ? '16, 185, 129' : scoreColor === 'var(--warning-color)' ? '245, 158, 11' : '239, 68, 68'}, 0.05)` }}>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Career Score</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0 8px 0' }}>
                   <ShieldCheck size={20} color={scoreColor} />
                   <h3 style={{ margin: 0, fontSize: '1.4rem', color: scoreColor, fontWeight: 'bold' }}>{careerScore}%</h3>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ background: scoreColor, width: `${careerScore}%`, height: '100%' }}></div>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '16px' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target Role</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', mt: '4px' }}>
                   <Target size={20} color="#3b82f6" />
                   <h3 style={{ margin: '4px 0', fontSize: '1rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mostAppliedRole}</h3>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '16px' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rejection Rate</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', mt: '4px' }}>
                   <AlertCircle size={20} color="var(--danger-color)" />
                   <h3 style={{ margin: '4px 0', fontSize: '1.2rem', color: '#fff' }}>{rejectionRate}%</h3>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '16px' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Most Failed Stage</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', mt: '4px' }}>
                   <BarChart2 size={20} color="var(--warning-color)" />
                   <h3 style={{ margin: '4px 0', fontSize: '0.9rem', color: '#fff' }}>{mostFailedStage}</h3>
                </div>
              </div>
          </div>

          {/* 📌 QUICK INSIGHTS NATIVE PANEL */}
          {patternsList.length > 0 && (
             <div className="glass-panel animate-in" style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0', color: 'var(--danger-color)', fontSize: '1rem', fontWeight: 'bold' }}>
                  <AlertTriangle size={18} /> 📌 Quick Insights
                </h3>
                <ul style={{ margin: 0, paddingLeft: '24px', fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.9)', display: 'flex', flexDirection: 'column', gap: '10px', lineHeight: '1.6', letterSpacing: '0.2px' }}>
                   {patternsList.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
             </div>
          )}

          {/* 👉 NEXT ACTION SYNTHESIZED */}
          <div className="glass-panel" style={{ padding: '24px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <ArrowRight size={22} color="#3b82f6" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                      <strong style={{ color: '#3b82f6', fontSize: '0.95rem', display: 'block', marginBottom: '6px' }}>👉 Next Step:</strong>
                      <span style={{ color: '#fff', fontSize: '1rem', lineHeight: '1.6', letterSpacing: '0.3px', fontWeight: '500' }}>{nextAction}</span>
                  </div>
              </div>
          </div>

          {/* APPLICATIONS TRACKER */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem', margin: 0 }}>
                <Briefcase size={18} color="var(--primary-color)" /> Applications
              </h2>
              <Link to="/add" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                <PlusCircle size={14} /> Add
              </Link>
            </div>
            
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
               {totalApps} Total • {rejections} Rejected • {pending} Pending • {selected} Selected
            </p>

            {apps.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto', padding: '24px 0', fontSize: '0.85rem' }}>No applications yet.</div>
            ) : (
               <div style={{ overflowY: 'auto', maxHeight: '240px', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '8px' }}>
                  {apps.slice().reverse().map(app => (
                    <div key={app.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#fff', fontWeight: 'bold' }}>{app.role}</h3>
                        <span className={`status-badge ${getStatusClass(app.result)}`} style={{ padding: '2px 8px', fontSize: '0.7rem', fontWeight: 'bold' }}>{app.result.toUpperCase()}</span>
                      </div>
                      <p style={{ margin: '0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{app.company}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* SKILLS SECTION */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem', margin: 0 }}>
                <Cpu size={18} color="var(--success-color)" /> Skills Mastery
              </h2>
              <Link to="/add-skill" className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>Add</Link>
            </div>
            {skills.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No skills logged.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {skills.slice().reverse().map(skill => (
                    <div key={skill.id}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                           <span style={{ color: '#fff', fontWeight: 'bold' }}>{skill.name}</span>
                           <span style={{ color: 'var(--text-muted)' }}>{skill.proficiency}</span>
                       </div>
                       <div style={{ background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ background: 'var(--success-color)', width: skillWidth(skill.proficiency), height: '100%', borderRadius: '4px' }}></div>
                       </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* PROJECTS SECTION */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem', margin: 0 }}>
                <Code size={18} color="#3b82f6" /> Projects Portfolio
              </h2>
              <Link to="/add-project" className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>Add</Link>
            </div>
            {projects.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>No projects logged.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {projects.slice().reverse().map(proj => (
                    <div key={proj.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#fff', fontWeight: 'bold' }}>{proj.title}</h3>
                      <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>{proj.description}</p>
                      <div style={{ display: 'inline-block', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', padding: '6px 12px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                         {proj.tools}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

        </div>

        {/* =========================================
            RIGHT COLUMN: DEEP ANALYSIS ENGINE
            ========================================= */}
        <div style={{ display: 'flex', flexDirection: 'column', height: 'auto', flex: 1 }}>
            
            <h2 style={{ fontSize: '1.2rem', margin: '0 0 24px 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={20} color="var(--primary-color)" /> Deep Analysis Engine
            </h2>

            {advice ? (
              <AdviceCards markdown={advice} />
            ) : (
              <div className="glass-panel" style={{ flex: 1, minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', gap: '16px' }}>
                <Map size={48} color="rgba(139, 92, 246, 0.3)" />
                <div>
                   <h3 style={{ color: '#fff', margin: '0 0 8px 0' }}>Engine Standby</h3>
                   <p style={{ margin: 0, maxWidth: '280px', lineHeight: '1.5' }}>Awaiting your command to dissect the profile and generate the 7-day strategy sequence.</p>
                </div>
              </div>
            )}
        </div>

      </div>

      <SmartChatbot />
    </div>
  );
}
