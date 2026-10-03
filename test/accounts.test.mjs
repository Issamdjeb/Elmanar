import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const serverFile = resolve(root, "server.mjs");

async function unusedPort() {
  const server = net.createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  server.close();
  await once(server, "close");
  return address.port;
}

function createMockSupabase(expectedRedirect) {
  const users = new Map();
  const accessTokens = new Map();
  const refreshTokens = new Map();
  let confirmEmails = false;
  const server = createServer(async (request, response) => {
    const url = new URL(request.url || "/", "http://localhost");
    const send = (status, payload) => {
      response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
      response.end(JSON.stringify(payload));
    };
    if (request.headers.apikey !== "test-publishable-key") {
      send(401, { message: "Invalid API key." });
      return;
    }
    if (url.pathname === "/auth/v1/signup" && request.method === "POST") {
      const payload = JSON.parse(await new Promise((resolve) => {
        let body = "";
        request.on("data", (chunk) => { body += chunk; });
        request.on("end", () => resolve(body));
      }));
      const email = payload.email.toLowerCase();
      if (users.has(email)) {
        send(409, { message: "User already registered" });
        return;
      }
      const user = {
        id: randomUUID(), email, user_metadata: payload.data,
        identities: [{ id: randomUUID(), identity_data: { email } }],
        ...(confirmEmails ? {} : { email_confirmed_at: new Date().toISOString() })
      };
      users.set(email, { user, password: payload.password });
      assert.equal(url.searchParams.get("redirect_to"), expectedRedirect);
      if (confirmEmails) {
        send(200, { user, session: null });
        return;
      }
      const accessToken = randomUUID();
      const refreshToken = randomUUID();
      accessTokens.set(accessToken, user);
      refreshTokens.set(refreshToken, user);
      send(200, { user, access_token: accessToken, refresh_token: refreshToken, token_type: "bearer", expires_in: 3600 });
      return;
    }
    if (url.pathname === "/auth/v1/token" && request.method === "POST") {
      const payload = JSON.parse(await new Promise((resolve) => {
        let body = "";
        request.on("data", (chunk) => { body += chunk; });
        request.on("end", () => resolve(body));
      }));
      let user;
      if (url.searchParams.get("grant_type") === "password") {
        const entry = users.get(payload.email.toLowerCase());
        if (!entry || entry.password !== payload.password) {
          send(400, { error_description: "Invalid login credentials" });
          return;
        }
        if (!entry.user.email_confirmed_at) {
          send(400, { error_description: "Email not confirmed" });
          return;
        }
        user = entry.user;
      } else {
        user = refreshTokens.get(payload.refresh_token);
        if (!user) {
          send(400, { error_description: "Invalid refresh token" });
          return;
        }
      }
      const accessToken = randomUUID();
      const refreshToken = randomUUID();
      accessTokens.set(accessToken, user);
      refreshTokens.set(refreshToken, user);
      send(200, { user, access_token: accessToken, refresh_token: refreshToken, token_type: "bearer", expires_in: 3600 });
      return;
    }
    if (url.pathname === "/auth/v1/user" && request.method === "GET") {
      const user = accessTokens.get(request.headers.authorization?.replace(/^Bearer\s+/i, ""));
      if (!user) {
        send(401, { message: "Invalid JWT" });
        return;
      }
      send(200, user);
      return;
    }
    if (url.pathname === "/auth/v1/user" && request.method === "PUT") {
      const user = accessTokens.get(request.headers.authorization?.replace(/^Bearer\s+/i, ""));
      if (!user) {
        send(401, { message: "Invalid JWT" });
        return;
      }
      const payload = JSON.parse(await new Promise((resolve) => {
        let body = "";
        request.on("data", (chunk) => { body += chunk; });
        request.on("end", () => resolve(body));
      }));
      user.user_metadata = { ...user.user_metadata, ...payload.data };
      send(200, user);
      return;
    }
    if (url.pathname === "/auth/v1/logout" && request.method === "POST") {
      response.writeHead(204);
      response.end();
      return;
    }
    if (url.pathname === "/auth/v1/resend" && request.method === "POST") {
      response.writeHead(200);
      response.end("{}");
      return;
    }
    send(404, { message: "Unknown mock Supabase endpoint." });
  });
  return {
    server,
    users,
    setConfirmEmails(value) { confirmEmails = value; }
  };
}

test("role accounts, education profiles, quiz matching, parent privacy, and public assets", async (t) => {
  const port = await unusedPort();
  const authPort = await unusedPort();
  const dataDir = await mkdtemp(resolve(os.tmpdir(), "elmanar-accounts-test-"));
  const origin = `http://127.0.0.1:${port}`;
  const mockSupabase = createMockSupabase(`${origin}/`);
  mockSupabase.server.listen(authPort, "127.0.0.1");
  await once(mockSupabase.server, "listening");
  const server = spawn(process.execPath, [serverFile], {
    cwd: root,
    env: {
      ...process.env, HOST: "127.0.0.1", PORT: String(port), ELMANAR_DATA_DIR: dataDir,
      SUPABASE_URL: `http://127.0.0.1:${authPort}`,
      SUPABASE_PUBLISHABLE_KEY: "test-publishable-key",
      SUPABASE_SITE_URL: origin
    },
    stdio: "ignore"
  });
  t.after(async () => {
    if (server.exitCode === null && server.signalCode === null) {
      await new Promise((resolve) => {
        const timeout = setTimeout(resolve, 3000);
        server.once("exit", () => {
          clearTimeout(timeout);
          resolve();
        });
        server.kill();
      });
    }
    mockSupabase.server.close();
    await once(mockSupabase.server, "close");
    await rm(dataDir, { recursive: true, force: true });
  });

  let ready = false;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (server.exitCode !== null) assert.fail(`Elmanar exited before starting (${server.exitCode}).`);
    try {
      const response = await fetch(`${origin}/api/status`);
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.equal(ready, true, "Elmanar server should start for the account flow test.");

  async function api(path, { method = "GET", payload, cookie, accessToken } = {}) {
    const response = await fetch(`${origin}${path}`, {
      method,
      headers: {
        ...(payload ? { "Content-Type": "application/json" } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
      },
      body: payload ? JSON.stringify(payload) : undefined
    });
    const body = response.headers.get("content-type")?.includes("application/json")
      ? await response.json()
      : await response.arrayBuffer();
    return { response, body };
  }

  async function register(role, suffix) {
    const education = role === "student"
      ? { stage: "primary", year: 4, subject: "Science", specialty: "" }
      : undefined;
    const { response, body } = await api("/api/register", {
      method: "POST",
      payload: { name: `${role} ${suffix}`, email: `${role}-${suffix}@example.test`, password: "strong-password-123", role, ...(education ? { education } : {}) }
    });
    assert.equal(response.status, 201, JSON.stringify(body));
    const cookie = response.headers.get("set-cookie")?.match(/^elmanar_session=[^;]+/)?.[0];
    assert.ok(cookie, "Successful registration should create a private session cookie.");
    return { cookie, user: body.user, session: body.session };
  }

  const config = await api("/api/config");
  assert.equal(config.body.supabaseConfigured, true);
  assert.equal(config.body.supabasePublishableKey, "test-publishable-key");

  const unauthenticated = await api("/api/data");
  assert.equal(unauthenticated.response.status, 401);

  const invalidStudyYear = await api("/api/register", {
    method: "POST",
    payload: {
      name: "Invalid student", email: "invalid-student@example.test",
      password: "strong-password-123", role: "student",
      education: { stage: "secondary", year: 4, subject: "Physics" }
    }
  });
  assert.equal(invalidStudyYear.response.status, 400);
  assert.equal(mockSupabase.users.has("invalid-student@example.test"), false);

  mockSupabase.setConfirmEmails(true);
  const pending = await api("/api/register", {
    method: "POST",
    payload: { name: "Pending teacher", email: "pending@example.test", password: "strong-password-123", role: "teacher" }
  });
  assert.equal(pending.response.status, 202);
  assert.equal(pending.body.requiresEmailConfirmation, true);
  assert.equal(pending.response.headers.get("set-cookie"), null);
  const notConfirmed = await api("/api/login", {
    method: "POST",
    payload: { email: "pending@example.test", password: "strong-password-123", role: "teacher" }
  });
  assert.equal(notConfirmed.response.status, 403);
  mockSupabase.users.get("pending@example.test").user.email_confirmed_at = new Date().toISOString();
  const confirmedLogin = await api("/api/login", {
    method: "POST",
    payload: { email: "pending@example.test", password: "strong-password-123", role: "teacher" }
  });
  assert.equal(confirmedLogin.response.status, 200);
  assert.ok(confirmedLogin.body.session.refresh_token);
  assert.match(confirmedLogin.response.headers.get("set-cookie"), /^elmanar_session=/);
  const refreshed = await api("/api/auth/refresh", {
    method: "POST",
    payload: { refresh_token: confirmedLogin.body.session.refresh_token }
  });
  assert.equal(refreshed.response.status, 200);
  const restored = await api("/api/session", {
    method: "POST", payload: {}, accessToken: refreshed.body.access_token
  });
  assert.equal(restored.response.status, 200);
  assert.equal(restored.body.user.id, pending.body.user.id);
  mockSupabase.setConfirmEmails(false);

  const teacher = await register("teacher", "one");
  const quiz = {
    topic: "Plants",
    education: { stage: "primary", year: 4, subject: "Science", specialty: "" },
    questions: [
      { prompt: "What captures sunlight?", options: ["Chlorophyll", "Roots", "Soil", "Seeds"], answerIndex: 0, topic: "Photosynthesis", explanation: "Chlorophyll captures light." },
      { prompt: "What gas is released?", options: ["Nitrogen", "Oxygen", "Helium", "Hydrogen"], answerIndex: 1, topic: "Photosynthesis", explanation: "Plants release oxygen." }
    ]
  };
  const draft = await api("/api/quizzes", {
    method: "POST", cookie: teacher.cookie, payload: { quiz, lesson: "Plants use sunlight to make food and release oxygen." }
  });
  assert.equal(draft.response.status, 201);
  const quizId = draft.body.quiz.id;

  const published = await api(`/api/quizzes/${quizId}/publish`, {
    method: "POST", cookie: teacher.cookie, payload: { quiz }
  });
  assert.equal(published.response.status, 200);
  assert.match(published.body.quiz.code, /^[A-Z2-9]{8}$/);
  const savedDraft = await api(`/api/quizzes/${quizId}`, { cookie: teacher.cookie });
  assert.equal(savedDraft.body.quiz.education.subject, "Science");

  const duplicateRole = await api("/api/register", {
    method: "POST",
    payload: { name: "Wrong role", email: teacher.user.email, password: "strong-password-123", role: "student" }
  });
  assert.equal(duplicateRole.response.status, 409);

  const student = await register("student", "one");
  assert.equal(student.user.education.subject, "Science");
  const studentBeforeJoin = await api("/api/data", { cookie: student.cookie });
  assert.equal(studentBeforeJoin.body.quizzes.length, 0);
  const joined = await api("/api/join", {
    method: "POST", cookie: student.cookie, payload: { code: published.body.quiz.code }
  });
  assert.equal(joined.response.status, 200);
  const assigned = await api("/api/data", { cookie: student.cookie });
  assert.equal(assigned.body.quizzes.length, 1);
  assert.equal(assigned.body.quizzes[0].recommended, true);
  assert.equal("answerIndex" in assigned.body.quizzes[0].questions[0], false);
  const wrongProfileToken = await api("/api/profile", {
    method: "PUT", cookie: student.cookie, accessToken: teacher.session.access_token,
    payload: { education: { stage: "university", year: 2, subject: "Physics" } }
  });
  assert.equal(wrongProfileToken.response.status, 403);
  const updatedProfile = await api("/api/profile", {
    method: "PUT", cookie: student.cookie, accessToken: student.session.access_token,
    payload: { education: { stage: "university", year: 2, subject: "Physics", specialty: "Engineering" } }
  });
  assert.equal(updatedProfile.response.status, 200, JSON.stringify(updatedProfile.body));
  assert.equal(updatedProfile.body.user.education.stage, "university");
  assert.equal(mockSupabase.users.get(student.user.email).user.user_metadata.role, "student");
  assert.equal(mockSupabase.users.get(student.user.email).user.user_metadata.name, student.user.name);
  const updatedAssignments = await api("/api/data", { cookie: student.cookie });
  assert.equal(updatedAssignments.body.quizzes[0].recommended, false);

  const submitted = await api(`/api/quizzes/${quizId}/submit`, {
    method: "POST", cookie: student.cookie, payload: { answers: [0, 1] }
  });
  assert.equal(submitted.response.status, 200);
  assert.equal(submitted.body.result.score, 2);
  const teacherProgress = await api("/api/data", { cookie: teacher.cookie });
  assert.equal(teacherProgress.body.quizzes[0].studentCount, 1);
  assert.equal(teacherProgress.body.quizzes[0].completedCount, 1);
  assert.equal(teacherProgress.body.quizzes[0].education.stage, "primary");
  assert.equal(teacherProgress.body.quizzes[0].averagePercent, 100);
  assert.equal(teacherProgress.body.quizzes[0].focusTopic.topic, "Photosynthesis");

  const otherTeacher = await register("teacher", "two");
  const otherTeacherData = await api("/api/data", { cookie: otherTeacher.cookie });
  assert.equal(otherTeacherData.body.quizzes.length, 0);
  const privateDraft = await api(`/api/quizzes/${quizId}`, { cookie: otherTeacher.cookie });
  assert.equal(privateDraft.response.status, 404);

  const parent = await register("parent", "one");
  const connected = await api("/api/family/connect", {
    method: "POST", cookie: parent.cookie, payload: { code: student.user.familyCode }
  });
  assert.equal(connected.response.status, 200);
  const family = await api("/api/data", { cookie: parent.cookie });
  assert.equal(family.body.students.length, 1);
  assert.equal(family.body.students[0].education.subject, "Physics");
  assert.equal(family.body.students[0].quizzes[0].result.score, 2);
  assert.deepEqual(family.body.students[0].quizzes[0].result.topics.map((item) => item.topic), ["Photosynthesis"]);
  assert.equal("answers" in family.body.students[0].quizzes[0].result, false);

  const editedQuiz = structuredClone(quiz);
  editedQuiz.questions[0].prompt = "Which pigment captures sunlight?";
  const edited = await api(`/api/quizzes/${quizId}`, {
    method: "PUT", cookie: teacher.cookie, payload: { quiz: editedQuiz }
  });
  assert.equal(edited.response.status, 200);
  const studentAfterEdit = await api("/api/data", { cookie: student.cookie });
  assert.equal(studentAfterEdit.body.quizzes.length, 0, "Editing a published quiz should invalidate old memberships and results.");
  const revisedPublish = await api(`/api/quizzes/${quizId}/publish`, {
    method: "POST", cookie: teacher.cookie, payload: { quiz: editedQuiz }
  });
  assert.equal(revisedPublish.response.status, 200);
  assert.notEqual(revisedPublish.body.quiz.code, published.body.quiz.code, "A revised quiz should receive a new class code.");

  const logo = await fetch(`${origin}/elmanar-logo.jpg`);
  assert.equal(logo.status, 200);
  assert.equal(logo.headers.get("content-type"), "image/jpeg");
  assert.ok((await logo.arrayBuffer()).byteLength > 1000);
  const classroom = await fetch(`${origin}/elmanar-classroom.jpg`);
  assert.equal(classroom.status, 200);
  assert.equal(classroom.headers.get("content-type"), "image/jpeg");
  assert.ok((await classroom.arrayBuffer()).byteLength > 1000);
});
