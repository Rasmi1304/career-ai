const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, 'data.json');

let db = { applications: [], skills: [], projects: [] };

try {
    if (fs.existsSync(FILE_PATH)) {
        const fileContent = fs.readFileSync(FILE_PATH, 'utf8');
        const data = JSON.parse(fileContent);
        if (Array.isArray(data)) {
            // Migrating from old format
            db.applications = data;
        } else {
            db = { ...db, ...data };
        }
    } else {
        // Look for applications.json to migrate from
        const OLD_FILE_PATH = path.join(__dirname, 'applications.json');
        if (fs.existsSync(OLD_FILE_PATH)) {
            const fileContent = fs.readFileSync(OLD_FILE_PATH, 'utf8');
            db.applications = JSON.parse(fileContent);
        }
    }
} catch (error) {
    console.error("Error reading DB JSON", error);
}

const saveData = () => {
    try {
        fs.writeFileSync(FILE_PATH, JSON.stringify(db, null, 2), 'utf8');
    } catch (error) {
        console.error("Error saving DB JSON", error);
    }
};

const addData = (type, item) => {
    if (!db[type]) db[type] = [];
    const newItem = {
        id: Math.random().toString(36).substr(2, 9),
        ...item,
        timestamp: new Date().toISOString()
    };
    db[type].push(newItem);
    saveData();
    return newItem;
};

const removeData = (type, id) => {
    if (!db[type]) return;
    db[type] = db[type].filter(item => item.id !== id);
    saveData();
};

const getData = () => {
    return db;
};

// Legacy support
const addApplication = (app) => addData('applications', app);
const getApplications = () => db.applications;

module.exports = {
    addData,
    removeData,
    getData,
    addApplication,
    getApplications
};
