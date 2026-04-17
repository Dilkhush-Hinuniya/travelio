const fs = require('fs');

function replaceFunc(content, funcStart, funcEndMarker, newFuncStr) {
    let startIdx = content.indexOf(funcStart);
    if(startIdx === -1) return content;
    let endIdx = content.indexOf(funcEndMarker, startIdx);
    if(endIdx === -1) return content;
    return content.substring(0, startIdx) + newFuncStr + content.substring(endIdx);
}

function processUserHtml() {
    let content = fs.readFileSync('c:\\Users\\Dilkhush\\OneDrive\\Desktop\\demo\\user.html', 'utf8');

    // handleLogin
    const uLoginOrigStart = "function handleLogin(e)";
    const uLoginNew = `async function handleLogin(e) { 
        e.preventDefault(); 
        const em = document.getElementById('loginEmail').value.trim(), pw = document.getElementById('loginPass').value; 
        let v = true; 
        if (!em || !/^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$/.test(em)) { document.getElementById('loginEmail').classList.add('error'); document.getElementById('loginEmailErr').classList.add('visible'); v = false } 
        if (!pw) { document.getElementById('loginPass').classList.add('error'); document.getElementById('loginPassErr').classList.add('visible'); v = false } 
        if (!v) return; 

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: em, password: pw })
            });
            const data = await res.json();
            if (!res.ok) { toast(data.error || 'Invalid credentials.', 'error'); return; }
            const u = data.user;
            currentUser = { name: u.name, email: u.email, id: u._id }; 
            localStorage.setItem(UAUTH, JSON.stringify(currentUser)); 
            loadUserData(); initDefaultData(); 
            toast('Welcome back, ' + u.name.split(' ')[0] + '!', 'success'); 
            showApp();
        } catch (err) {
            toast('Failed to login. Please try again.', 'error');
        }
    }\n        `;

    content = replaceFunc(content, uLoginOrigStart, "function handleRegister(e)", uLoginNew);

    // handleRegister
    const uRegOrigStart = "function handleRegister(e)";
    const uRegNew = `async function handleRegister(e) { 
        e.preventDefault(); 
        const nm = document.getElementById('regName').value.trim(), em = document.getElementById('regEmail').value.trim(), pw = document.getElementById('regPass').value, cf = document.getElementById('regConfirm').value; 
        let v = true; 
        if (!nm) { document.getElementById('regName').classList.add('error'); document.getElementById('regNameErr').classList.add('visible'); v = false } 
        if (!em || !/^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$/.test(em)) { document.getElementById('regEmail').classList.add('error'); document.getElementById('regEmailErr').classList.add('visible'); v = false } 
        if (!pw || pw.length < 6) { document.getElementById('regPass').classList.add('error'); document.getElementById('regPassErr').classList.add('visible'); v = false } 
        if (pw !== cf) { document.getElementById('regConfirm').classList.add('error'); document.getElementById('regConfirmErr').classList.add('visible'); v = false } 
        if (!v) return; 

        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: nm, email: em, password: pw })
            });
            const data = await res.json();
            if (!res.ok) { toast(data.error || 'Failed to create account.', 'error'); return; }
            
            currentUser = { name: nm, email: em, id: data._id }; 
            localStorage.setItem(UAUTH, JSON.stringify(currentUser)); 
            loadUserData(); initDefaultData(); 
            gamification.earlyBird = true; addPoints(10, 'Welcome bonus'); 
            toast('Account created! Welcome aboard.', 'success'); 
            showApp();
        } catch(err) {
            toast('Server error during registration.', 'error');
        }
    }\n        `;
    content = replaceFunc(content, uRegOrigStart, "function handleLogout()", uRegNew);

    fs.writeFileSync('c:\\Users\\Dilkhush\\OneDrive\\Desktop\\demo\\user.html', content);
    console.log('User auth patched.');
}

function processAdminHtml() {
    let content = fs.readFileSync('c:\\Users\\Dilkhush\\OneDrive\\Desktop\\demo\\admin.html', 'utf8');

    // handleLogin
    const aLoginStart = "function handleLogin(e)";
    const aLoginNew = `async function handleLogin(e) { 
      e.preventDefault(); 
      clearErrors(); 
      const em = document.getElementById('loginEmail').value.trim(), pw = document.getElementById('loginPassword').value; 
      let v = true; 
      if (!em || !/^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$/.test(em)) { showErr('loginEmail', 'loginEmailError'); v = false } 
      if (!pw) { showErr('loginPassword', 'loginPassError'); v = false } 
      if (!v) return; 
      
      try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: em, password: pw })
        });
        const data = await res.json();
        if (!res.ok) { toast(data.error || 'Invalid credentials.', 'error'); return; }
        const u = data.user;
        if (!u.isAdmin) { toast('Access Denied: Admin privileges required.', 'error'); return; }

        currentUser = { name: u.name, email: u.email, id: u._id }; 
        localStorage.setItem(ADMIN_AUTH, JSON.stringify(currentUser)); 
        toast('Welcome back, ' + u.name.split(' ')[0] + '!', 'success'); 
        showDashboard();
      } catch (err) {
        toast('Server error during login.', 'error');
      }
    }\n    `;

    content = replaceFunc(content, aLoginStart, "function handleRegister(e)", aLoginNew);

    // handleRegister
    const aRegStart = "function handleRegister(e)";
    const aRegNew = `async function handleRegister(e) { 
      e.preventDefault(); 
      clearErrors(); 
      const nm = document.getElementById('regName').value.trim(), em = document.getElementById('regEmail').value.trim(), pw = document.getElementById('regPassword').value, cf = document.getElementById('regConfirm').value; 
      let v = true; 
      if (!nm) { showErr('regName', 'regNameError'); v = false } 
      if (!em || !/^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$/.test(em)) { showErr('regEmail', 'regEmailError'); v = false } 
      if (!pw || pw.length < 6) { showErr('regPassword', 'regPassError'); v = false } 
      if (pw !== cf) { showErr('regConfirm', 'regConfirmError'); v = false } 
      if (!v) return; 
      
      try {
        const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: nm, email: em, password: pw, isAdmin: true }) // Set isAdmin: true exclusively here
        });
        const data = await res.json();
        if (!res.ok) { toast(data.error || 'Failed to create account.', 'error'); return; }

        currentUser = { name: nm, email: em, id: data._id }; 
        localStorage.setItem(ADMIN_AUTH, JSON.stringify(currentUser)); 
        toast('Account created! Welcome aboard.', 'success'); 
        showDashboard();
      } catch (err) {
        toast('Server error during registration.', 'error');
      }
    }\n    `;

    content = replaceFunc(content, aRegStart, "function handleLogout()", aRegNew);

    fs.writeFileSync('c:\\Users\\Dilkhush\\OneDrive\\Desktop\\demo\\admin.html', content);
    console.log('Admin auth patched.');
}

processUserHtml();
processAdminHtml();
