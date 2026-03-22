const API_BASE = `${import.meta.env.VITE_API_URL}/api`;
export const addApplication = async (data) => {
    const res = await fetch(`${API_BASE}/add-application`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to add application');
    return res.json();
};

export const analyzeRole = async (role) => {
    const res = await fetch(`${API_BASE}/analyze-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
    });
    if (!res.ok) throw new Error('Failed to analyze role');
    return res.json();
};

export const addSkill = async (data) => {
    const res = await fetch(`${API_BASE}/add-skill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to add skill');
    return res.json();
};

export const addProject = async (data) => {
    const res = await fetch(`${API_BASE}/add-project`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to add project');
    return res.json();
};

export const getProfile = async () => {
    const res = await fetch(`${API_BASE}/profile`);
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
};

export const getApplications = async () => {
    const res = await fetch(`${API_BASE}/applications`);
    if (!res.ok) throw new Error('Failed to fetch applications');
    return res.json();
};

export const getAdvice = async () => {
    const res = await fetch(`${API_BASE}/get-advice`, {
        method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to get advice');
    return res.json();
};

export const chat = async (message) => {
    const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
    });
    if (!res.ok) throw new Error('Failed to chat');
    return res.json();
};
