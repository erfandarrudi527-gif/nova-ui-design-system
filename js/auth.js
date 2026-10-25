/* ============ Login & Register logic ============ */

// اگر قبلاً وارد شده‌ای، دیگر نیازی به این صفحات نیست → مستقیم داشبورد
if (DB.session()) {
  toast(`قبلاً وارد شده‌ای، ${DB.session().name.split(' ')[0]} 👋`, 'info');
  setTimeout(() => (location.href = 'dashboard.html'), 700);
}

const emailOK = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

function setError(input, on) {
  input.closest('.field').classList.toggle('error', on);
}

// show/hide password toggles
document.querySelectorAll('.toggle-pass').forEach((btn) => {
  btn.addEventListener('click', () => {
    const inp = btn.closest('.field').querySelector('input');
    inp.type = inp.type === 'password' ? 'text' : 'password';
    btn.textContent = inp.type === 'password' ? '👁' : '🙈';
  });
});

// ---------- REGISTER ----------
const regForm = document.getElementById('registerForm');
if (regForm) {
  const pass = regForm.querySelector('#password');
  const meter = document.querySelector('.strength i');

  pass.addEventListener('input', () => {
    const v = pass.value;
    let s = 0;
    if (v.length >= 8) s++;
    if (/[A-Z]/.test(v)) s++;
    if (/[0-9]/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;
    const pct = [0, 25, 55, 80, 100][s];
    if (meter) {
      meter.style.width = pct + '%';
      meter.style.background = s <= 1 ? '#f43f5e' : s === 2 ? '#eab308' : s === 3 ? '#22d3ee' : 'var(--grad)';
    }
  });

  regForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = regForm.querySelector('#name');
    const email = regForm.querySelector('#email');
    const repass = regForm.querySelector('#repassword');
    let ok = true;

    setError(name, name.value.trim().length < 3); ok = ok && name.value.trim().length >= 3;
    setError(email, !emailOK(email.value)); ok = ok && emailOK(email.value);
    setError(pass, pass.value.length < 8); ok = ok && pass.value.length >= 8;
    setError(repass, repass.value !== pass.value || !repass.value); ok = ok && repass.value === pass.value && !!repass.value;

    if (!ok) { toast('لطفاً خطاهای فرم را برطرف کن', 'error'); return; }

    const users = DB.users();
    if (users.some((u) => u.email === email.value.trim().toLowerCase())) {
      setError(email, true);
      toast('این ایمیل قبلاً ثبت‌نام کرده است', 'error');
      return;
    }

    const btn = regForm.querySelector('button[type=submit]');
    btn.classList.add('loading');
    setTimeout(() => { // fake network latency for demo feel
      users.push({ name: name.value.trim(), email: email.value.trim().toLowerCase(), pass: hash(pass.value) });
      DB.saveUsers(users);
      DB.setSession({ name: name.value.trim(), email: email.value.trim().toLowerCase(), at: Date.now() });
      toast('🎉 خوش آمدی! در حال انتقال به داشبورد…', 'success');
      setTimeout(() => (location.href = 'dashboard.html'), 1200);
    }, 900);
  });
}

// ---------- LOGIN ----------
const logForm = document.getElementById('loginForm');
if (logForm) {
  logForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = logForm.querySelector('#email');
    const pass = logForm.querySelector('#password');
    let ok = true;
    setError(email, !emailOK(email.value)); ok = ok && emailOK(email.value);
    setError(pass, pass.value.length < 8); ok = ok && pass.value.length >= 8;
    if (!ok) { toast('ایمیل یا رمز عبور نامعتبر است', 'error'); return; }

    const btn = logForm.querySelector('button[type=submit]');
    btn.classList.add('loading');
    setTimeout(() => {
      const user = DB.users().find((u) => u.email === email.value.trim().toLowerCase());
      if (!user || user.pass !== hash(pass.value)) {
        btn.classList.remove('loading');
        setError(pass, true);
        toast('ایمیل یا رمز عبور اشتباه است ❌', 'error');
        return;
      }
      DB.setSession({ name: user.name, email: user.email, at: Date.now() });
      toast(`خوش برگشتی ${user.name}! ✨`, 'success');
      setTimeout(() => (location.href = 'dashboard.html'), 1000);
    }, 900);
  });
}
