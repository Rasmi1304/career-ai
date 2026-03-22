import ReactMarkdown from 'react-markdown';
import { AlertCircle, Target, Zap, CheckCircle, ShieldAlert, BookOpen, ArrowRight } from 'lucide-react';

export default function AdviceCards({ markdown }) {
  if (!markdown) return null;

  const regex = /##\s+([^\n]+)\n([\s\S]*?)(?=##|$)/g;
  let matches = [...markdown.matchAll(regex)];

  if (matches.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '24px' }}>
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </div>
    );
  }

  const expectedOrder = [
    'TOP PROBLEM', 
    'FAILURE PATTERNS', 
    'SKILL GAP', 
    'RISKS', 
    'STRATEGY SHIFT', 
    'ACTION PLAN'
  ];

  const getOrderIndex = (title) => {
    const t = title.toUpperCase();
    for (let i = 0; i < expectedOrder.length; i++) {
        if (t.includes(expectedOrder[i])) return i;
    }
    return 99;
  };

  matches = matches.sort((a, b) => {
      const aIndex = getOrderIndex(a[1]);
      const bIndex = getOrderIndex(b[1]);
      if (aIndex === 5) return 1;
      if (bIndex === 5) return -1;
      return aIndex - bIndex;
  });

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
      gap: '24px', 
      width: '100%',
      paddingBottom: '32px' 
    }}>
      {matches.map((match, idx) => {
        const rawTitle = match[1].trim();
        let content = match[2].trim();

        content = content.replace(/^---+$/gm, '').trim();

        const titleText = rawTitle.replace(/🚨|📉|🧠|🎯|⚠️|💡/g, '').trim();
        const tUpper = titleText.toUpperCase();

        const isTopProblem = tUpper.includes('TOP PROBLEM');
        const isActionPlan = tUpper.includes('ACTION PLAN') || tUpper.includes('7 DAYS');

        let borderColor = 'rgba(255,255,255,0.05)';
        let titleColor = '#fff';
        let IconElement = BookOpen;

        if (isTopProblem) {
          borderColor = 'rgba(239, 68, 68, 0.5)'; // Red Heavy
          titleColor = 'var(--danger-color)';
          IconElement = AlertCircle;
        } else if (tUpper.includes('RISK')) {
          borderColor = 'rgba(239, 68, 68, 0.3)'; // Red Light
          titleColor = 'var(--danger-color)';
          IconElement = ShieldAlert;
        } else if (isActionPlan) {
          borderColor = 'rgba(16, 185, 129, 0.4)'; // Green
          titleColor = 'var(--success-color)';
          IconElement = Target;
        } else if (tUpper.includes('STRATEGY SHIFT')) {
          borderColor = 'rgba(59, 130, 246, 0.4)'; // Blue
          titleColor = '#3b82f6';
          IconElement = Zap;
        } else if (tUpper.includes('GAP')) {
          borderColor = 'rgba(139, 92, 246, 0.4)'; // Purple
          titleColor = '#8b5cf6';
          IconElement = BookOpen;
        } else if (tUpper.includes('PATTERN')) {
          borderColor = 'rgba(245, 158, 11, 0.4)'; // Yellow
          titleColor = 'var(--warning-color)';
          IconElement = CheckCircle;
        }

        // Dynamically extract the explicit action to prevent duplication or empty lines
        let extractedAction = null;
        
        // Ensure Day X-Y headers are forced onto new lines and bolded inside the Action Plan
        if (isActionPlan) {
            content = content.replace(/(Day\s*\d+\s*[-–]\s*\d+\s*:)/gi, '\n\n**$1**\n\n');
            // Clean up any excessive newlines created if the AI already spaced it
            content = content.replace(/\n{3,}/g, '\n\n');
        }

        // Remove nested 'Recommendations' or 'Action' labels the AI sometimes outputs randomly
        content = content.replace(/\*\*Recommendation[s]?:\*\*.*/gi, '');
        content = content.replace(/\*\*Action[s]?:\*\*.*/gi, '');

        const actionMatch = content.match(/👉\s*(Action|Fix):\s*(.*)/i);
        if (actionMatch) {
            extractedAction = actionMatch[2].trim();
            content = content.replace(/👉\s*(Action|Fix):\s*(.*)/gi, '').trim();
        }

        // Hard parse bullet points into strict array (Max 3 lines, strict one liners)
        const allLines = content.split('\n').filter(l => l.trim().length > 0);
        let bulletPoints = [];
        let fallbackText = [];
        
        if (!isActionPlan) {
            allLines.forEach(line => {
                 const cleaned = line.trim();
                 if (cleaned.startsWith('-') || cleaned.startsWith('*') || cleaned.startsWith('•')) {
                     bulletPoints.push(cleaned.replace(/^[-*•]\s*/, '').replace(/^[0-9]+\./, '').trim());
                 } else {
                     if (cleaned.length > 3) fallbackText.push(cleaned);
                 }
            });
            // Constraint: max 3 bullet points per card to prevent overwhelming height
            bulletPoints = bulletPoints.slice(0, 3);
        }

        const cardBg = isTopProblem ? 'rgba(239, 68, 68, 0.05)' : 'rgba(15, 23, 42, 0.65)';
        const cardShadow = isTopProblem ? '0 12px 24px rgba(239, 68, 68, 0.15)' : '0 8px 16px rgba(0,0,0,0.2)';
        
        // Layout Hierarchy scaling
        const titleFontSize = isTopProblem ? '1.1rem' : '0.95rem';
        const titleIconSize = isTopProblem ? 20 : 16;
        const fontWe    = isTopProblem ? '800' : '700';

        return (
          <div key={idx} style={{ 
            background: cardBg, 
            border: `1px solid ${borderColor}`, 
            borderRadius: '12px', 
            padding: isTopProblem ? '24px' : '20px',
            boxShadow: cardShadow,
            display: 'block', // STRICT requirement to prevent unexpected flex collapses
            height: 'auto',
            wordWrap: 'break-word',
            whiteSpace: 'normal',
            position: 'relative', // Force normal stacking flow safely
            gridColumn: isActionPlan ? '1 / -1' : 'auto' 
          }}>
            <h3 style={{ 
              margin: '0 0 16px 0', fontSize: titleFontSize, color: titleColor, 
              borderBottom: `1px solid ${borderColor}`, paddingBottom: '12px', 
              display: 'flex', alignItems: 'center', gap: '8px',
              fontWeight: fontWe,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              wordWrap: 'break-word',
              whiteSpace: 'normal'
            }}>
              <IconElement size={titleIconSize} />
              {titleText}
            </h3>
            
            <div style={{ marginBottom: extractedAction ? '16px' : '0' }}>
                {isActionPlan ? (
                    <div className="markdown-content advice-bullets-expanded" style={{
                        color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.95rem', lineHeight: '1.7', 
                        wordWrap: 'break-word', whiteSpace: 'normal', display: 'block', letterSpacing: '0.2px'
                    }}>
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                ) : bulletPoints.length > 0 ? (
                    <ul style={{ 
                        margin: 0, paddingLeft: '18px', color: isTopProblem ? '#fff' : 'rgba(255, 255, 255, 0.85)', 
                        fontSize: isTopProblem ? '1rem' : '0.95rem', lineHeight: '1.7',
                        display: 'block',
                        wordWrap: 'break-word', whiteSpace: 'normal', letterSpacing: '0.2px'
                    }}>
                        {bulletPoints.map((bp, i) => (
                           <li key={i} style={{ marginBottom: '10px' }}>
                               <span style={{ fontWeight: isTopProblem ? 'bold' : 'normal' }}>{bp}</span>
                           </li>
                        ))}
                    </ul>
                ) : (
                    <div style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.85)', lineHeight: '1.6' }}>
                        <ReactMarkdown>{fallbackText.join('\n')}</ReactMarkdown>
                    </div>
                )}
            </div>

            {extractedAction && (
               <div style={{ 
                 paddingTop: '16px', borderTop: `1px solid ${borderColor}`, 
                 fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'flex-start', gap: '8px',
                 background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px',
                 wordWrap: 'break-word', whiteSpace: 'normal',
                 display: 'block'
               }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                     <ArrowRight size={16} color={titleColor} style={{ flexShrink: 0, marginTop: '3px' }} /> 
                     <span style={{ lineHeight: '1.6', display: 'block', letterSpacing: '0.2px' }}>
                       <strong style={{ color: titleColor, marginRight: '4px' }}>Action:</strong> 
                       {extractedAction}
                     </span>
                  </div>
               </div>
            )}
          </div>
        )
      })}
    </div>
  );
}
