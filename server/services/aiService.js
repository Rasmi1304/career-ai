const { Groq } = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const generateAdvice = async (profile) => {
    const { applications = [], skills = [], projects = [] } = profile;

    if (applications.length === 0 && skills.length === 0 && projects.length === 0) {
        return "Your profile is empty. Add your skills, projects, and applications to get personalized career advice!";
    }

    const applicationsStr = applications.map(app => 
        `- Role: ${app.role}, Company: ${app.company}, Result: ${app.result}${app.reason ? `, Reason: ${app.reason}` : ''}`
    ).join('\n') || "No applications submitted yet.";

    const skillsStr = skills.map(skill => 
        `- ${skill.name} (Proficiency: ${skill.proficiency})`
    ).join('\n') || "No skills logged yet.";

    const projectsStr = projects.map(proj => 
        `- ${proj.title}: ${proj.description} (Tools: ${proj.tools})`
    ).join('\n') || "No projects logged yet.";

    const systemPrompt = `You are an elite AI Career Mentor and Hiring Analyst.

Your task is analyzing historical application data to generate hindsight-driven insights.
Focus on identifying patterns from past failures and using them to improve future outcomes.

Your job is NOT to give generic advice.
Your job is to analyze deeply, identify patterns, and give sharp, actionable insights.

You will be given:
1. Applications data (role, company, result, reason)
2. Skills (with levels)
3. Projects

---

### YOUR TASK:

Analyze the data and produce structured output in EXACTLY the following format and strict order. DO NOT change the order.

## 🚨 TOP PROBLEM
- First major insight
- Second supporting insight
👉 Action: One direct actionable fix inside this section.

## 📉 FAILURE PATTERNS
- Pattern 1 backed by data
- Pattern 2 backed by data
👉 Action: Specific recommendation to break this pattern.

## 🧠 SKILL GAP ANALYSIS
- Weak skill 1 affecting results
- Missing skill 2 affecting results
👉 Action: Single specific learning focus.

## ⚠️ RISKS & WARNINGS
- Risk 1 if behavior continues
- Risk 2 if behavior continues
👉 Action: Single strong warning mitigation.

## 💡 STRATEGY SHIFT
- Shift 1 recommendation
- Shift 2 recommendation
👉 Action: Direct next step to pivot cleanly.

## 🎯 ACTION PLAN (7 DAYS)
Day 1-2:
- Task 1
- Task 2
Day 3-4:
- Task 1
- Task 2
Day 5-7:
- Task 1
- Task 2

---

### RULES:
- NEVER output cross-references like "Check Action Plan" or "See Below". Sections must be completely self-contained.
- The Action Plan MUST ALWAYS be the absolute last section and spanned fully.
- NO paragraphs. ONLY short bullet points (max 3 bullets per card).
- Each bullet MUST be a single line under 10 words.
- Use bullet points exclusively for content.
- NEVER use '##' or '#' subheadings inside sections to prevent rendering bugs.
- Every section (except Action Plan) MUST end with exactly one line starting with '👉 Action:'. Do NOT add any extra recommendation blocks.
- Base everything directly on given data without hallucination.

---

### INPUT DATA:
Applications:
${applicationsStr}

Skills:
${skillsStr}

Projects:
${projectsStr}

Respond in clean, modern markdown tracking ONLY the block headers requested.`;

    try {
        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: 'Please analyze my profile and tell me what I should do next.'
                }
            ],
            model: 'llama-3.1-8b-instant',
            temperature: 0.7,
        });

        return response.choices[0]?.message?.content || "Could not generate advice.";
    } catch (error) {
        console.error("AI Service Error:", error);
        throw new Error("Failed to communicate with AI");
    }
}

module.exports = {
    generateAdvice
};
