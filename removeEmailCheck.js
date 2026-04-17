const fs = require('fs');

function revertEmailCheck() {
    let content = fs.readFileSync('c:\\Users\\Dilkhush\\OneDrive\\Desktop\\demo\\routes\\api.js', 'utf8');

    // 1. Remove the dns import and verifyRealEmailExists function entirely
    content = content.replace(/const dns = require\('dns'\)\.promises;\s*async function verifyRealEmailExists.*?}\s*}/s, '');

    // 2. Remove the check from the POST /users route
    content = content.replace(
        "    const isReal = await verifyRealEmailExists(req.body.email);\n    if (!isReal) return res.status(400).json({ error: 'this email is not exist in real world.' });\n\n    const newUser = new User(req.body);",
        "    const newUser = new User(req.body);"
    );

    // 3. Remove the check from the POST /login route
    content = content.replace(
        "    const isReal = await verifyRealEmailExists(req.body.email);\n    if (!isReal) return res.status(400).json({ error: 'this email is not exist in real world.' });\n\n    const { email, password } = req.body;",
        "    const { email, password } = req.body;"
    );

    fs.writeFileSync('c:\\Users\\Dilkhush\\OneDrive\\Desktop\\demo\\routes\\api.js', content.trim() + '\n');
    console.log("Successfully removed email verification.");
}

revertEmailCheck();
