const fs = require('fs');

function patchApi() {
    let content = fs.readFileSync('c:\\Users\\Dilkhush\\OneDrive\\Desktop\\demo\\routes\\api.js', 'utf8');

    // Add dns at top and the helper function
    if (!content.includes("const dns = require('dns').promises;")) {
        const topImports = "const express = require('express');\nconst router = express.Router();\nconst Destination = require('../models/Destination');\nconst User = require('../models/User');\nconst Booking = require('../models/Booking');\nconst dns = require('dns').promises;\n\nasync function verifyRealEmailExists(email) {\n  try {\n    if (!email || !email.includes('@')) return false;\n    const domain = email.split('@')[1];\n    if (!domain) return false;\n    const mxRecords = await dns.resolveMx(domain);\n    return mxRecords && mxRecords.length > 0;\n  } catch (err) {\n    return false;\n  }\n}\n";
        
        content = content.replace(
            "const express = require('express');\nconst router = express.Router();\nconst Destination = require('../models/Destination');\nconst User = require('../models/User');\nconst Booking = require('../models/Booking');", 
            topImports
        );
    }

    // Patch POST /users
    const regOri = "router.post('/users', async (req, res) => {\n  try {\n    const newUser = new User(req.body);";
    const regNew = "router.post('/users', async (req, res) => {\n  try {\n    const isReal = await verifyRealEmailExists(req.body.email);\n    if (!isReal) return res.status(400).json({ error: 'this email is not exist in real world.' });\n\n    const newUser = new User(req.body);";
    content = content.replace(regOri, regNew);

    // Patch POST /login
    const loginOri = "router.post('/login', async (req, res) => {\n  try {\n    const { email, password } = req.body;";
    const loginNew = "router.post('/login', async (req, res) => {\n  try {\n    const isReal = await verifyRealEmailExists(req.body.email);\n    if (!isReal) return res.status(400).json({ error: 'this email is not exist in real world.' });\n\n    const { email, password } = req.body;";
    content = content.replace(loginOri, loginNew);

    fs.writeFileSync('c:\\Users\\Dilkhush\\OneDrive\\Desktop\\demo\\routes\\api.js', content);
    console.log("Patched api.js successfully.");
}

patchApi();
