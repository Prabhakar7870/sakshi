# Sakshi server (Gmail + Calendar + Telegram + Claude)

## Chalane ke steps
1. Node 20.6+ install karo, phir is folder me: `npm install`
2. `.env.example` ko `.env` naam se copy karo aur bharo.
   - `ANTHROPIC_API_KEY`: console.anthropic.com se
   - `APP_TOKEN`: lamba random code (`openssl rand -hex 24`). Web app kholte hi yahi "Access code" maangega.
3. **Google**: console.cloud.google.com par naya project -> "Gmail API" aur "Google Calendar API" enable karo ->
   OAuth consent screen (External) -> apna email "Test users" me daalo -> Credentials -> OAuth client ID (Web application) ->
   Authorized redirect URI: `BASE_URL/auth/callback` (local ke liye `http://localhost:3000/auth/callback`) ->
   Client ID aur Secret `.env` me daalo.
   - Dhyan: consent screen "Testing" me rahe to refresh token **7 din** me expire hota hai. Personal use ke liye
     "Publish app" (In production) kar do; Google "unverified app" warning dikhayega, Advanced -> Go to app se aage badho.
4. **Telegram** (optional): @BotFather se `/newbot` -> token. @userinfobot se apna numeric ID. Dono `.env` me.
   Bot sirf is ID ko jawab dega. Server start par bot ka webhook hata deta hai (long polling ke liye zaroori).
5. `npm test` (optional, helper tests) aur `npm start` (isi folder me se) -> http://localhost:3000 kholo -> screen par tap -> mic/notification permissions -> access code -> Google login.

## Deploy
- Mic ke liye HTTPS chahiye (localhost ko chhoot hai). Render/Railway/Fly/VPS par deploy karo, `BASE_URL` https wala rakho,
  aur wahi redirect URI Google console me jodo.
- `tokens.json` (Google login) disk par save hota hai. Hosting par persistent disk/volume lagao, warna har restart par dobara login.

## Suraksha
- `.env` aur `tokens.json` kabhi git/share mat karo.
- Email bhejna ya event banana hamesha tumhari "Approve" ke baad hota hai (web card ya Telegram button).
- Email ka text Claude ko "untrusted" bata kar diya jaata hai, taaki kisi email me chhupe nirdesh na chalein. Phir bhi Approve se pehle draft padho.
- Chrome ki Hindi voice recognition audio Google ke server par bhejti hai. Isse bachna ho to bol-kar na likhkar type karo.

## Agar kuch atke
- "Google login expired": refresh token khatam ho gaya (Testing mode ka 7-din ka limit). Screen par tap karke dobara login karo.
- Mic nahi chal raha: HTTPS/localhost par hi chalta hai, aur browser site-settings me Microphone Allow hona chahiye.
- Kuch bhi galat access code se 8 baar fail hua to 10 minute ke liye lock.

## Sakshi kya nahi karti
- WhatsApp ki nijee chat: koi official raasta nahi.
- Telegram bot sirf tumse baat karta hai; dusron ko tumhari taraf se message bhejna bot se nahi hota.
- Fingerprint/face lock aur speaker verification: sirf phone app me (android/SakshiPermissions.kt se shuruaat).
