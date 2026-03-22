const express = require('express');
const router = express.Router();
const { addApplication, getApplications, addData, getData, removeData } = require('../services/memoryService');
const { generateAdvice } = require('../services/aiService');
const { analyzeRole } = require('../services/analyzerService');
const { Groq } = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

router.post('/add-application', (req, res) => {
    try {
        const { role, company, result, reason } = req.body;
        if (!role || !company || !result) {
            return res.status(400).json({ error: "Missing required fields: role, company, result." });
        }
        
        const newApp = addApplication({ role, company, result, reason });
        res.status(201).json(newApp);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to add application." });
    }
});

router.post('/analyze-role', (req, res) => {
    try {
        const { role } = req.body;
        const profile = getData();
        const analysis = analyzeRole(role, profile.skills || [], profile.projects || [], profile.applications || []);
        res.status(200).json(analysis);
    } catch(err) {
        res.status(500).json({ error: "Failed to analyze role." });
    }
});

router.post('/add-skill', (req, res) => {
    try {
        const { name, proficiency } = req.body;
        if (!name) return res.status(400).json({ error: "Missing required field: name" });
        const newSkill = addData('skills', { name, proficiency });
        res.status(201).json(newSkill);
    } catch (err) {
        res.status(500).json({ error: "Failed to add skill." });
    }
});

router.post('/add-project', (req, res) => {
    try {
        const { title, description, tools } = req.body;
        if (!title) return res.status(400).json({ error: "Missing required field: title" });
        const newProject = addData('projects', { title, description, tools });
        res.status(201).json(newProject);
    } catch (err) {
        res.status(500).json({ error: "Failed to add project." });
    }
});

router.get('/profile', (req, res) => {
    try {
        res.status(200).json(getData());
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch profile data." });
    }
});

router.get('/applications', (req, res) => {
    try {
        res.status(200).json(getApplications());
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch applications." });
    }
});

router.post('/get-advice', async (req, res) => {
    try {
        const fullProfile = getData();
        const advice = await generateAdvice(fullProfile);
        res.status(200).json({ advice });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get advice." });
    }
});

router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const profile = getData();
        const { applications = [], skills = [], projects = [] } = profile;

        const hrFailures = applications.filter(a => a.result === 'rejected' && (a.reason || '').toLowerCase().includes('hr')).length;
        const oaFailures = applications.filter(a => a.result === 'rejected' && (a.reason || '').toLowerCase().includes('oa')).length;
        const techFailures = applications.filter(a => a.result === 'rejected' && (a.reason || '').toLowerCase().includes('tech')).length;

        let patterns = [];
        if (hrFailures >= 2) patterns.push("Consistently fails in HR rounds.");
        if (oaFailures >= 2) patterns.push("Consistently fails in Online Assessments.");
        if (techFailures >= 2) patterns.push("Consistently fails in Technical rounds.");

        const rolesCount = applications.reduce((acc, a) => { acc[a.role] = (acc[a.role] || 0) + 1; return acc; }, {});
        const maxRoleCount = Math.max(...Object.values(rolesCount), 0);
        if (maxRoleCount >= 2 && applications.filter(a => a.result === 'rejected').length >= 2) {
             patterns.push("Targeting the same role repeatedly without improved outcomes.");
        }

        const systemPrompt = `You are a strict data-driven career analyst. 
You can ONLY answer based on the following user data:

Applications: ${JSON.stringify(applications)}
Skills: ${JSON.stringify(skills)}
Projects: ${JSON.stringify(projects)}
Detected Historical Patterns: ${patterns.join(' | ')}

Rules:
- Do NOT give generic advice.
- You MUST respond in EXACTLY this structured format:
🔍 Analysis:
- (bullet 1)
- (bullet 2)

💡 Suggestions:
- (bullet 1)
- (bullet 2)

- Analyze the user request directly against the Data. Expand abbreviations if needed.
- If the question is NOT related to career strategy or their data, reply EXACTLY: "I can only answer based on your career data and application history."`;

        const response = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message }
            ],
            model: 'llama-3.1-8b-instant',
            temperature: 0.3,
        });

        res.status(200).json({ reply: response.choices[0]?.message?.content || "Could not generate chat reply." });
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: "Chat failed." });
    }
});

module.exports = router;
