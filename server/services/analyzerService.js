const analyzeRole = (role, skills, projects, applications) => {
    if (!role) return null;
    
    let matchScore = 0;
    const roleLower = role.toLowerCase();
    
    let strongAreas = [];
    let missingSkills = [];
    
    if (roleLower.includes('frontend') || roleLower.includes('ui') || roleLower.includes('react')) {
        const hasReact = skills.some(s => s.name.toLowerCase().includes('react'));
        const hasJS = skills.some(s => s.name.toLowerCase().includes('javascript') || s.name.toLowerCase() === 'js');
        if (hasReact) { matchScore += 40; strongAreas.push('React.js'); } else { missingSkills.push('React'); }
        if (hasJS) { matchScore += 30; strongAreas.push('JavaScript'); } else { missingSkills.push('JavaScript'); }
        
        const reactExp = skills.find(s => s.name.toLowerCase().includes('react'))?.proficiency;
        if (reactExp === 'Advanced' || reactExp === 'Expert') matchScore += 10;
        
        const projMatch = projects.some(p => p.tools.toLowerCase().includes('react') || p.tools.toLowerCase().includes('js'));
        if (projMatch) { matchScore += 20; strongAreas.push('Frontend Portfolio'); } else { missingSkills.push('Relevant UI Projects'); }
    } else if (roleLower.includes('backend') || roleLower.includes('node') || roleLower.includes('api')) {
        const hasNode = skills.some(s => s.name.toLowerCase().includes('node'));
        if (hasNode) { matchScore += 50; strongAreas.push('Node.js'); } else { missingSkills.push('Node.js / Backend Logic'); }
        const hasDB = skills.some(s => s.name.toLowerCase().includes('sql') || s.name.toLowerCase().includes('mongo'));
        if (hasDB) { matchScore += 20; strongAreas.push('Databases'); } else { missingSkills.push('DB Queries / NoSQL'); }
        
        const projMatch = projects.some(p => p.tools.toLowerCase().includes('node') || p.tools.toLowerCase().includes('api'));
        if (projMatch) { matchScore += 30; strongAreas.push('Backend Projects'); } else { missingSkills.push('Backend Portfolio Context'); }
    } else if (roleLower.includes('data') || roleLower.includes('ml') || roleLower.includes('ai')) {
        const hasPython = skills.some(s => s.name.toLowerCase().includes('python'));
        if (hasPython) { matchScore += 50; strongAreas.push('Python'); } else { missingSkills.push('Python / R'); }
        const projMatch = projects.some(p => p.tools.toLowerCase().includes('python') || p.tools.toLowerCase().includes('data'));
        if (projMatch) { matchScore += 50; strongAreas.push('Data/ML Projects'); } else { missingSkills.push('Data Pipeline/Model Portfolio'); }
    } else {
        matchScore = Math.min(100, (skills.length * 15) + (projects.length * 20));
        if (skills.length > 2) strongAreas.push('General Competency');
        if (projects.length > 1) strongAreas.push('Execution Ability');
        if (skills.length < 2) missingSkills.push('Core Domain Skills');
    }
    
    matchScore = Math.min(100, Math.max(0, matchScore));
    
    let riskLevel = 'High';
    if (matchScore >= 70) riskLevel = 'Low';
    else if (matchScore >= 40) riskLevel = 'Medium';
    
    let riskReason = riskLevel === 'High' ? 'Severe lack of required technical skills or portfolio evidence.' :
                     riskLevel === 'Medium' ? 'Partial skill match, but lacks depth or specific project evidence.' :
                     'Strong match with required skills and solid portfolio presence.';
                     
    let suggestions = [];
    if (riskLevel === 'High') {
        suggestions = [`Build a project demonstrating ${missingSkills[0] || 'core technologies'}.`, 'Upskill in missing areas before applying to this specific role heavily.'];
    } else if (riskLevel === 'Medium') {
        suggestions = ['Highlight your transferable skills prominently.', `Try to acquire ${missingSkills[0] || 'advanced topic'} to stand out.`];
    } else {
        suggestions = ['Tailor your resume wording to match the job description perfectly.', 'Reach out directly to a recruiter or engineering manager.'];
    }

    // --- NEW: FAILURE PREDICTOR (HINDSIGHT DRIVEN) ---
    const sameRoleRejections = applications.filter(a => a.role.toLowerCase().includes(roleLower) && a.result === 'rejected');
    let predictedFailureStage = 'Resume Screening';
    let successProbability = matchScore; 
    
    if (sameRoleRejections.length >= 2) {
        // Heavy penalty for repeating the same failure
        successProbability = Math.max(5, successProbability - 35);
        
        const reasons = sameRoleRejections.map(a => (a.reason || '').toLowerCase());
        if (reasons.some(r => r.includes('hr') || r.includes('behavior'))) predictedFailureStage = 'HR / Behavioral Round';
        else if (reasons.some(r => r.includes('oa') || r.includes('online'))) predictedFailureStage = 'Online Assessment';
        else if (reasons.some(r => r.includes('tech') || r.includes('dsa'))) predictedFailureStage = 'Technical Interview';
        
        riskReason = `You have failed this exact role ${sameRoleRejections.length} times recently. High risk of repeating failure at ${predictedFailureStage}.`;
    } else {
        // Check general weaknesses
        const allReasons = applications.filter(a => a.result === 'rejected').map(a => (a.reason || '').toLowerCase());
        if (allReasons.filter(r => r.includes('hr') || r.includes('behavior')).length >= 2) {
            predictedFailureStage = 'HR Round (Historical Weakness)';
            successProbability -= 15;
        } else if (allReasons.filter(r => r.includes('oa') || r.includes('online')).length >= 2) {
            predictedFailureStage = 'OA (Historical Weakness)';
            successProbability -= 15;
        } else if (allReasons.filter(r => r.includes('tech') || r.includes('dsa')).length >= 2) {
            predictedFailureStage = 'Technical (Historical Weakness)';
            successProbability -= 10;
        }
    }
    
    // Normalize success probability
    successProbability = Math.min(99, Math.max(1, successProbability));

    return {
        matchScore,
        strongAreas,
        missingSkills,
        riskLevel,
        riskReason,
        suggestions,
        successProbability,
        predictedFailureStage
    };
};

module.exports = { analyzeRole };
