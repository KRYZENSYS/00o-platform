// 00o.uz - SMS service (Eskiz.uz)
const ESKIZ_BASE = 'https://notify.eskiz.uz/api';

let token: string | null = null;
let tokenExpires = 0;

async function getToken() {
  if (token && Date.now() < tokenExpires) return token;
  const res = await fetch(`${ESKIZ_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.ESKIZ_EMAIL,
      password: process.env.ESKIZ_PASSWORD,
    }),
  });
  const data = await res.json();
  token = data.data.token;
  tokenExpires = Date.now() + 25 * 24 * 3600 * 1000; // 25 days
  return token;
}

export async function sendSMS(phone: string, message: string) {
  if (!process.env.ESKIZ_EMAIL) {
    console.log(`📱 [DEV] To: ${phone}, Message: ${message}`);
    return { id: 'dev' };
  }
  const tk = await getToken();
  const res = await fetch(`${ESKIZ_BASE}/message/sms/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tk}` },
    body: JSON.stringify({
      mobile_phone: phone.replace('+', ''),
      message,
      from: process.env.ESKIZ_FROM || '4546',
    }),
  });
  return res.json();
}
