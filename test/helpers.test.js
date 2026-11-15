import test from "node:test";
import assert from "node:assert/strict";
import { dayStart, buildRaw, EMAILS, clean } from "../lib.js";

test("dayStart respects the time zone", () => {
  assert.equal(dayStart("Asia/Kolkata", new Date("2026-11-14T20:00:00Z")).toISOString(), "2026-11-14T18:30:00.000Z");
  assert.equal(dayStart("America/New_York", new Date("2026-11-14T03:00:00Z")).toISOString(), "2026-11-13T05:00:00.000Z");
  assert.equal(dayStart("UTC", new Date("2026-11-14T23:59:59Z")).toISOString(), "2026-11-14T00:00:00.000Z");
});

test("email list validation", () => {
  for (const ok of ["a@b.co", "a@b.co, c.d@e.org"]) assert.ok(EMAILS.test(ok), ok);
  for (const bad of ["", "rohit", "a@b", "a@b.co\nBcc: x@y.z", "a@b.co;c@d.ef", "<a@b.co>"]) assert.ok(!EMAILS.test(bad), bad);
});

test("buildRaw: headers, folding, no injection", () => {
  const subject = "डेमो की तारीख़ पक्की करनी है, कृपया इस हफ़्ते के अंदर बताइए " + "x".repeat(40);
  const raw = Buffer.from(buildRaw({ to: "a@b.co\r\nBcc: evil@x.y", subject: subject + "\r\nBcc: evil@x.y", body: "नमस्ते ".repeat(200) }), "base64url").toString();
  const [head, body] = raw.split("\r\n\r\n");
  assert.ok(!/^Bcc:/im.test(raw));
  assert.ok(head.split("\r\n").every(l => l.length <= 78));
  const words = [...head.matchAll(/=\?UTF-8\?B\?([^?]+)\?=/g)].map(m => Buffer.from(m[1], "base64").toString());
  assert.ok(words.join("").startsWith("डेमो की तारीख़"));
  assert.ok(body.split("\r\n").every(l => l.length <= 76));
  assert.equal(Buffer.from(body.replace(/\r\n/g, ""), "base64").toString(), "नमस्ते ".repeat(200));
});

test("clean strips newlines", () => assert.equal(clean("a\r\nb\nc"), "a b c"));
