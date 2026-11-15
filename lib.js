// Pure helpers (no network), so they can be unit-tested.
export const clean = s => String(s ?? "").replace(/[\r\n]+/g, " ").trim(); // blocks header injection

const ONE = "[^\\s@,;<>]+@[^\\s@,;<>]+\\.[^\\s@,;<>]+";
export const EMAILS = new RegExp(`^${ONE}(\\s*,\\s*${ONE})*$`);

// Offset (ms) of a time zone from UTC at a given moment.
export function tzOffsetMs(tz, d = new Date()) {
  const t = Math.floor(d.getTime() / 1000) * 1000;
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(new Date(t)).map(x => [x.type, x.value]));
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - t;
}

// 00:00 of "today" in the given time zone, as a real Date.
export function dayStart(tz, now = new Date()) {
  const o = tzOffsetMs(tz, now);
  const local = new Date(now.getTime() + o);
  local.setUTCHours(0, 0, 0, 0);
  return new Date(local.getTime() - o);
}

// RFC 2047 encoded-word subject, split so no word exceeds the 75-char limit.
function encSubject(s) {
  const words = []; let cur = "";
  for (const ch of s) {
    if (Buffer.byteLength(cur + ch) > 36) { words.push(cur); cur = ""; }
    cur += ch;
  }
  if (cur) words.push(cur);
  return words.map(w => `=?UTF-8?B?${Buffer.from(w).toString("base64")}?=`).join("\r\n ");
}

// Gmail API wants the whole RFC 2822 message as base64url.
export function buildRaw({ to, subject, body }) {
  const b64 = Buffer.from(String(body ?? "")).toString("base64").replace(/.{76}/g, "$&\r\n");
  return Buffer.from([
    `To: ${clean(to)}`,
    `Subject: ${encSubject(clean(subject))}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    b64,
  ].join("\r\n")).toString("base64url");
}
