import { createServer } from "node:http";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import {
  randomBytes, randomUUID
} from "node:crypto";
import { extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)));
const port = Number.parseInt(process.env.PORT || "3000", 10);
const host = process.env.HOST || "127.0.0.1";
const model = process.env.OPENROUTER_MODEL || "openai/gpt-4.1";
const apiKey = process.env.OPENROUTER_API_KEY?.trim();
const supabaseUrl = process.env.SUPABASE_URL?.trim().replace(/\/+$/, "");
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();
const supabaseSiteUrl = (process.env.SUPABASE_SITE_URL || `http://${host}:${port}`).trim().replace(/\/+$/, "");
const dataDir = resolve(process.env.ELMANAR_DATA_DIR || resolve(root, ".data"));
const dataFile = resolve(dataDir, "elmanar.json");
const maxBodyBytes = 5 * 1024 * 1024;
const sessionLifetimeMs = 7 * 24 * 60 * 60 * 1000;
const inviteAlphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const sessions = new Map();
const publicFiles = new Map([
  ["/", "index.html"],
  ["/index.html", "index.html"],
  ["/styles.css", "styles.css"],
  ["/app.js", "app.js"],
  ["/elmanar-logo.jpg", "public/elmanar-logo.jpg"],
  ["/elmanar-classroom.jpg", "public/elmanar-classroom.jpg"],
  ["/background.jpg", "public/background.jpg"]
]);
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg"
};
let database = { users: [], quizzes: [] };
let writes = Promise.resolve();

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  response.end(JSON.stringify(payload));
}

function fail(message, status = 400) {
  return Object.assign(new Error(message), { status });
}

async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBodyBytes) throw fail("The request is too large. Shorten the lesson and try again.", 413);
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw fail("The request must contain valid JSON.");
  }
}

function createInviteCode() {
  const bytes = randomBytes(8);
  return Array.from(bytes, (byte) => inviteAlphabet[byte % inviteAlphabet.length]).join("").slice(0, 8);
}

function createUniqueCode(existingCodes) {
  let code;
  do { code = createInviteCode(); } while (existingCodes.has(code));
  existingCodes.add(code);
  return code;
}

function safeUser(user) {
  return {
    id: user.id, name: user.name, email: user.email, role: user.role,
    familyCode: user.role === "student" ? user.familyCode : undefined,
    education: user.role === "student" ? user.education || null : undefined
  };
}

function educationMatches(learner, quiz) {
  if (!learner || !quiz || learner.stage !== quiz.stage || learner.year !== quiz.year) return false;
  const learnerSubjects = learner.subject.toLowerCase().split(/[,\s/]+/).filter(Boolean);
  const quizSubjects = quiz.subject.toLowerCase().split(/[,\s/]+/).filter(Boolean);
  return learnerSubjects.some((subject) => quizSubjects.includes(subject));
}

function tokenFor(request) {
  const cookies = request.headers.cookie || "";
  const token = cookies.match(/(?:^|;\s*)elmanar_session=([A-Za-z0-9_-]+)/)?.[1];
  if (!token) return null;
  const session = sessions.get(token);
  if (!session || session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return null;
  }
  const user = database.users.find((entry) => entry.id === session.userId);
  if (!user) {
    sessions.delete(token);
    return null;
  }
  return { token, session, user };
}

function requireUser(request, role) {
  const auth = tokenFor(request);
  if (!auth) throw fail("Sign in to continue.", 401);
  if (role && auth.user.role !== role) throw fail("This page is for a different Elmanar portal.", 403);
  return auth.user;
}

function setSessionCookie(response, token, request) {
  const secure = request.socket.encrypted ? "; Secure" : "";
  response.setHeader("Set-Cookie", `elmanar_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(sessionLifetimeMs / 1000)}${secure}`);
}

function clearSessionCookie(response, request) {
  const secure = request.socket.encrypted ? "; Secure" : "";
  response.setHeader("Set-Cookie", `elmanar_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
}

async function persistDatabase() {
  const snapshot = JSON.stringify(database, null, 2);
  writes = writes.then(async () => {
    await mkdir(dataDir, { recursive: true });
    const temporaryFile = resolve(dataDir, `elmanar-${randomUUID()}.tmp`);
    await writeFile(temporaryFile, snapshot, { encoding: "utf8", mode: 0o600 });
    await rename(temporaryFile, dataFile);
  });
  await writes;
}

function validateQuiz(quiz) {
  if (!quiz || typeof quiz !== "object" || Array.isArray(quiz) ||
      typeof quiz.topic !== "string" || !quiz.topic.trim() || quiz.topic.length > 120 ||
      !Array.isArray(quiz.questions) || quiz.questions.length < 1 || quiz.questions.length > 10) {
    throw fail("Add a topic and between one and ten complete quiz questions.");
  }
  const questions = quiz.questions.map((question, index) => {
    const prompt = typeof question?.prompt === "string" ? question.prompt.trim() : "";
    const options = Array.isArray(question?.options) ? question.options.map((option) => typeof option === "string" ? option.trim() : "") : [];
    const answerIndex = question?.answerIndex;
    const topic = typeof question?.topic === "string" ? question.topic.trim() : "";
    const explanation = typeof question?.explanation === "string" ? question.explanation.trim() : "";
    if (!prompt || prompt.length > 500 || options.length !== 4 || options.some((option) => !option || option.length > 240) ||
        !Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex > 3 || !explanation || explanation.length > 800) {
      throw fail(`Finish question ${index + 1}, its four answer choices, correct answer, and explanation.`);
    }
    return { prompt, options, answerIndex, topic: topic.slice(0, 100) || quiz.topic, explanation };
  });
  return { topic: quiz.topic.trim(), education: validateEducation(quiz.education), questions };
}

const educationStages = {
  primary: { label: "Primary · الابتدائي", maxYear: 5 },
  middle: { label: "Middle · المتوسط", maxYear: 4 },
  secondary: { label: "Secondary · الثانوي", maxYear: 3 },
  university: { label: "University · الجامعي", maxYear: 8 }
};

function validateEducation(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw fail("Choose an education stage, year, and subject.");
  }
  const stage = typeof value.stage === "string" ? value.stage : "";
  const year = Number(value.year);
  const subject = typeof value.subject === "string" ? value.subject.trim() : "";
  const specialty = typeof value.specialty === "string" ? value.specialty.trim() : "";
  const stageInfo = educationStages[stage];
  if (!stageInfo || !Number.isInteger(year) || year < 1 || year > stageInfo.maxYear) {
    throw fail("Choose a valid education stage and year.");
  }
  if (!subject || subject.length > 80) throw fail("Enter a subject or module, up to 80 characters.");
  if (specialty.length > 100) throw fail("Keep your specialty under 100 characters.");
  return {
    stage, stageLabel: stageInfo.label, year,
    yearLabel: `Year ${year} · السنة ${year}`,
    subject, specialty
  };
}

function createSession(response, request, user) {
  const token = randomBytes(32).toString("base64url");
  sessions.set(token, { userId: user.id, expiresAt: Date.now() + sessionLifetimeMs });
  setSessionCookie(response, token, request);
}

function requireSupabase() {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw fail("Supabase authentication is not configured. Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in .env.", 503);
  }
}

async function supabaseAuth(path, { method = "POST", body, accessToken } = {}) {
  requireSupabase();
  const response = await fetch(`${supabaseUrl}/auth/v1/${path}`, {
    method,
    headers: {
      "apikey": supabasePublishableKey,
      ...(accessToken ? { "Authorization": `Bearer ${accessToken}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(15000)
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const reason = `${payload?.error || ""} ${payload?.error_description || ""} ${payload?.msg || ""} ${payload?.message || ""}`.toLowerCase();
    if (reason.includes("email not confirmed")) throw fail("Please confirm your email using the link we sent you before signing in.", 403);
    if (reason.includes("invalid login credentials") || reason.includes("invalid grant")) {
      throw fail("We couldn't sign you in. Check your email and password, and confirm your email address.", 401);
    }
    if (response.status === 409 || reason.includes("already registered") || reason.includes("already been registered")) {
      throw fail("That email already has an Elmanar account. Sign in instead.", 409);
    }
    if (response.status === 429) throw fail("Too many attempts. Please wait a little and try again.", 429);
    console.error(`Supabase authentication request failed (${response.status}):`, payload?.code || payload?.error || "unknown error");
    throw fail("Supabase could not complete that request. Check the project Auth settings and try again.", response.status >= 500 ? 502 : 400);
  }
  return payload || {};
}

function accountFromSupabase(supabaseUser, role, name, education) {
  if (!supabaseUser || typeof supabaseUser.id !== "string" ||
      typeof supabaseUser.email !== "string" || !["teacher", "student", "parent"].includes(role)) {
    throw fail("Supabase returned an incomplete account. Please try again.", 502);
  }
  let user = database.users.find((entry) => entry.id === supabaseUser.id);
  if (user) {
    if (user.role !== role || user.email.toLowerCase() !== supabaseUser.email.toLowerCase()) {
      throw fail("This email is already connected to a different Elmanar role. Sign in to its original portal.", 409);
    }
    if (role === "student" && education) user.education = validateEducation(education);
    return user;
  }
  if (database.users.some((entry) => entry.email.toLowerCase() === supabaseUser.email.toLowerCase())) {
    throw fail("That email is already linked to an older Elmanar account. Contact the project owner to migrate it.", 409);
  }
  user = {
    id: supabaseUser.id,
    name: name.trim(),
    email: supabaseUser.email.toLowerCase(),
    role,
    joinedQuizIds: [],
    linkedStudentIds: [],
    ...(role === "student" ? {
      education: validateEducation(education || supabaseUser.user_metadata?.education),
      familyCode: createUniqueCode(new Set(database.users.map((entry) => entry.familyCode).filter(Boolean)))
    } : {})
  };
  database.users.push(user);
  return user;
}

function topicBreakdown(quiz, answers) {
  const totals = new Map();
  for (const [index, question] of quiz.questions.entries()) {
    const name = question.topic || quiz.topic;
    const current = totals.get(name) || { topic: name, correct: 0, total: 0 };
    current.total += 1;
    if (answers[index] === question.answerIndex) current.correct += 1;
    totals.set(name, current);
  }
  return [...totals.values()]
    .map((topic) => ({ ...topic, percent: Math.round(topic.correct / topic.total * 100) }))
    .sort((left, right) => left.percent - right.percent || left.topic.localeCompare(right.topic));
}

function teacherData(user) {
  return database.quizzes.filter((quiz) => quiz.ownerId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((quiz) => {
      const participants = database.users.filter((student) =>
        student.role === "student" && student.joinedQuizIds.includes(quiz.id)
      );
      const submissions = quiz.submissions.filter((submission) =>
        participants.some((student) => student.id === submission.studentId)
      );
      const topicTotals = new Map();
      for (const submission of submissions) {
        for (const [index, question] of quiz.questions.entries()) {
          const topic = question.topic || quiz.topic;
          const current = topicTotals.get(topic) || { topic, correct: 0, total: 0 };
          current.total += 1;
          if (submission.answers[index] === question.answerIndex) current.correct += 1;
          topicTotals.set(topic, current);
        }
      }
      const focusTopic = [...topicTotals.values()]
        .map((item) => ({ ...item, percent: Math.round(item.correct / item.total * 100) }))
        .sort((left, right) => left.percent - right.percent || left.topic.localeCompare(right.topic))[0] || null;
      return {
        id: quiz.id, topic: quiz.topic, count: quiz.questions.length, code: quiz.code,
        education: quiz.education || null,
        approved: quiz.approved, createdAt: quiz.createdAt, studentCount: participants.length,
        completedCount: submissions.length,
        averagePercent: submissions.length
          ? Math.round(submissions.reduce((total, submission) => total + submission.score, 0) /
            (submissions.length * quiz.questions.length) * 100)
          : null,
        focusTopic: focusTopic && { topic: focusTopic.topic, percent: focusTopic.percent }
      };
    });
}

function studentData(user) {
  return database.quizzes
    .filter((quiz) => quiz.approved && user.joinedQuizIds.includes(quiz.id))
    .map((quiz) => {
      const submission = quiz.submissions.find((entry) => entry.studentId === user.id) || null;
      return {
        id: quiz.id,
        topic: quiz.topic,
        education: quiz.education || null,
        recommended: educationMatches(user.education, quiz.education),
        createdAt: quiz.createdAt,
        submitted: submission ? {
          answers: submission.answers,
          score: submission.score,
          completedAt: submission.completedAt,
          topics: topicBreakdown(quiz, submission.answers)
        } : null,
        questions: quiz.questions.map((question) => submission ? question : ({
          prompt: question.prompt, options: question.options, topic: question.topic
        }))
      };
    });
}

function parentData(user) {
  return user.linkedStudentIds.map((studentId) => {
    const student = database.users.find((entry) => entry.id === studentId && entry.role === "student");
    if (!student) return null;
    const quizzes = database.quizzes.filter((quiz) =>
      quiz.approved && student.joinedQuizIds.includes(quiz.id)
    ).map((quiz) => {
      const submission = quiz.submissions.find((entry) => entry.studentId === student.id) || null;
      return {
        id: quiz.id, topic: quiz.topic, count: quiz.questions.length, completed: Boolean(submission),
        result: submission ? {
          score: submission.score,
          completedAt: submission.completedAt, topics: topicBreakdown(quiz, submission.answers)
        } : null
      };
    }).sort((a, b) => Number(a.completed) - Number(b.completed));
    return { id: student.id, name: student.name, education: student.education || null, quizzes };
  }).filter(Boolean);
}

async function generateQuiz(payload) {
  const topic = typeof payload?.topic === "string" ? payload.topic.trim() : "";
  const lesson = typeof payload?.lesson === "string" ? payload.lesson.trim() : "";
  const count = Number(payload?.count);
  const education = validateEducation(payload?.education);
  const lang = payload?.language === "ar" ? "ar" : payload?.language === "fr" ? "fr" : "en";
  if (!topic || topic.length > 120) throw fail("Add a lesson topic of 1–120 characters.");
  if (!lesson || lesson.length < 40 || lesson.length > 18000) throw fail("Lesson notes must be between 40 and 18,000 characters.");
  if (![3, 5, 7, 10].includes(count)) throw fail("Choose 3, 5, 7, or 10 questions.");

  const langPrompt = lang === "ar"
    ? "IMPORTANT: Every question, answer option, and explanation MUST be written in fluent, correct Arabic (اللغة العربية الفصحى)."
    : lang === "fr"
      ? "IMPORTANT: Every question, answer option, and explanation MUST be written in natural, clear French (Français)."
      : "Write in natural, clear English.";

  if (apiKey) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost",
          "X-Title": "Elmanar"
        },
        signal: AbortSignal.timeout(60000),
        body: JSON.stringify({
          model,
          response_format: { type: "json_object" },
          temperature: 0.35,
          max_completion_tokens: 2600,
          messages: [
            {
              role: "system",
              content: `You are an experienced, encouraging classroom teacher. Create a thoughtful, age-appropriate multiple-choice quiz strictly grounded in the provided lesson. Adapt language and difficulty for ${education.stageLabel}, year ${education.year}, subject/module ${education.subject}${education.specialty ? `, specialty ${education.specialty}` : ""}. ${langPrompt} Return only a JSON object with this shape: {"topic":"string","questions":[{"prompt":"string","options":["A","B","C","D"],"answerIndex":0,"topic":"short learning concept","explanation":"one or two student-friendly sentences explaining why the correct answer is right"}]}. Produce exactly ${count} questions. Every question must have exactly four distinct, plausible answer choices and exactly one correct answer. answerIndex must be the zero-based index of that correct answer. Vary recall and understanding; do not invent facts not present in the lesson. Make each explanation clear, kind, and tied to the lesson. Do not include markdown or any text outside the JSON object.`
            },
            { role: "user", content: `Lesson topic: ${topic}\nEducation context: ${education.stageLabel}, year ${education.year}, subject/module ${education.subject}${education.specialty ? `, specialty ${education.specialty}` : ""}\n\nLesson content:\n${lesson}` }
          ]
        })
      });
      if (response.ok) {
        const result = await response.json();
        const content = result?.choices?.[0]?.message?.content;
        if (typeof content === "string") {
          const parsed = JSON.parse(content);
          const quiz = validateQuiz({ ...parsed, education, questions: parsed.questions?.slice(0, count) });
          if (quiz.questions.length === count) return quiz;
        }
      }
    } catch (apiError) {
      console.warn("OpenRouter quiz generation attempt failed, using smart prototype builder:", apiError.message);
    }
  }

  // Fallback prototype quiz generator if API key is absent or request times out
  return fallbackQuizGenerator(topic, lesson, education, count, lang);
}

function fallbackQuizGenerator(topic, lesson, education, count, lang) {
  const isAr = lang === "ar" || /[\u0600-\u06FF]/.test(topic + lesson);
  const isFr = lang === "fr";

  const questions = [];
  const sentences = lesson.split(/[.!?؟\n]+/).map((s) => s.trim()).filter((s) => s.length > 25);
  for (let i = 0; i < count; i++) {
    const s = sentences[i % sentences.length] || lesson.slice(0, 100);
    if (isAr) {
      questions.push({
        prompt: `بناءً على درس "${topic}"، ما هي النقطة الأساسية المتعلقة بهذه الفكرة؟`,
        options: [
          s.length > 80 ? s.slice(0, 75) + "..." : s,
          "تطبيق معاكس تماماً لا يتوافق مع ما ورد في الدرس",
          "فكرة ثانوية غير مؤكدة علمياً في هذا السياق",
          "استنتاج لا علاقة له بالموضوع الأساسي"
        ],
        answerIndex: 0,
        topic: topic.slice(0, 60),
        explanation: `الإجابة الصحيحة مؤكدة في الدرس: ${s.slice(0, 120)}.`
      });
    } else if (isFr) {
      questions.push({
        prompt: `D'après la leçon "${topic}", que peut-on affirmer sur ce point ?`,
        options: [
          s.length > 80 ? s.slice(0, 75) + "..." : s,
          "Une hypothèse contraire non vérifiée dans la leçon",
          "Un résultat secondaire qui ne s'applique pas ici",
          "Une conclusion sans rapport avec le sujet"
        ],
        answerIndex: 0,
        topic: topic.slice(0, 60),
        explanation: `La bonne réponse est confirmée par le cours : ${s.slice(0, 120)}.`
      });
    } else {
      questions.push({
        prompt: `Based on the lesson on "${topic}", which of the following is correct?`,
        options: [
          s.length > 80 ? s.slice(0, 75) + "..." : s,
          "An opposite conclusion that contradicts the lesson notes",
          "A secondary detail that is not scientifically relevant here",
          "An unrelated assumption not mentioned in the lesson"
        ],
        answerIndex: 0,
        topic: topic.slice(0, 60),
        explanation: `This is directly supported by the lesson: ${s.slice(0, 120)}.`
      });
    }
  }
  return validateQuiz({ topic, education, questions });
}

async function simplifyLesson(payload) {
  const topic = typeof payload?.topic === "string" ? payload.topic.trim() : "Lesson Summary";
  const lesson = typeof payload?.lesson === "string" ? payload.lesson.trim() : "";
  const lang = payload?.language === "ar" ? "ar" : payload?.language === "fr" ? "fr" : "en";
  let education;
  try {
    education = validateEducation(payload?.education);
  } catch {
    education = { stage: "primary", stageLabel: "Primary · الابتدائي", year: 4, subject: "General", specialty: "" };
  }
  if (!lesson || lesson.length < 15) throw fail("Provide lesson text to summarize and simplify.", 400);

  const langDirectives = {
    ar: "اللغة الإجبارية: العربية الفصحى الواضحة والمبسطة. اجعل العبارات سهلة ومباشرة وتشرح الصعوبات بأسلوب لطيف وممتع.",
    fr: "Langue obligatoire: Français clair, élégant et simple. Expliquez les difficultés avec bienveillance et analogies.",
    en: "Required language: Clear, friendly, accessible English with relatable real-world analogies."
  };

  if (apiKey) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost",
          "X-Title": "Elmanar"
        },
        signal: AbortSignal.timeout(60000),
        body: JSON.stringify({
          model,
          response_format: { type: "json_object" },
          temperature: 0.3,
          max_completion_tokens: 3000,
          messages: [
            {
              role: "system",
              content: `You are an expert pedagogical AI teacher whose superpower is making complex, dense, long educational lessons small, simple, and crystal clear ("make the long small and simple", تبسيط الصعوبات وتلخيص الدروس).
Adapt explanations for ${education.stageLabel}, year ${education.year}, subject ${education.subject}${education.specialty ? `, specialty ${education.specialty}` : ""}.
${langDirectives[lang]}
Return ONLY a JSON object with this exact shape:
{
  "topic": "Clean refined title",
  "tldr": "A 2 to 3 sentence crystal-clear, high-level summary that captures the essence in simple words.",
  "keyPoints": [
    "Short punchy bullet point 1",
    "Short punchy bullet point 2",
    "Short punchy bullet point 3",
    "Short punchy bullet point 4"
  ],
  "difficulties": [
    {
      "concept": "Name of difficult concept or tricky step",
      "whyHard": "Why students stumble on it",
      "simplified": "How to understand it simply using plain language",
      "analogy": "A memorable real-world analogy (e.g. like a kitchen recipe, like solar panels on a house, etc.)"
    }
  ],
  "vocabulary": [
    {
      "term": "Difficult or technical word",
      "meaning": "Simple, friendly definition"
    }
  ],
  "quickCheck": {
    "question": "A friendly concept-check question to test understanding",
    "answer": "The correct concise answer",
    "tip": "A quick memory trick or mnemonic"
  }
}
Identify at least 2 distinct difficulties from the text and explain them with relatable analogies. Keep language concise and engaging.`
            },
            {
              role: "user",
              content: `Topic: ${topic}\nLesson Content:\n${lesson.slice(0, 18000)}`
            }
          ]
        })
      });

      if (response.ok) {
        const result = await response.json();
        const content = result?.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          if (parsed && parsed.tldr && Array.isArray(parsed.keyPoints)) {
            return {
              ...parsed,
              source: "ai",
              topic: parsed.topic || topic,
              education
            };
          }
        }
      }
    } catch (err) {
      console.warn("OpenRouter simplify request failed, activating smart engine fallback:", err.message);
    }
  }

  return fallbackSimplify(topic, lesson, education, lang);
}

function fallbackSimplify(topic, lesson, education, lang) {
  const isAr = lang === "ar" || /[\u0600-\u06FF]/.test(topic + lesson);
  const isFr = lang === "fr";

  if (isAr) {
    return {
      topic: topic || "ملخص وتبسيط الدرس",
      tldr: `يركّز هذا الدرس على الفكرة الجوهرية: فهم مكونات ومبادئ ${topic || "الموضوع"} خطوة بخطوة، مع توضيح كيفية ترابط عناصره بسلاسة دون تعقيد.`,
      keyPoints: [
        `المفهوم الرئيسي: فهم جوهر ${topic || "الدرس"} وتطبيقاته الواقعية`,
        "تسلسل الخطوات: كيف تبدأ الظاهرة وما الذي يحدث في كل مرحلة",
        "العلاقة بين المدخلات والنتائج: ما الذي يحرّك العملية ولماذا",
        "الخلاصة المستفادة: ما يجب تثبيته في الذاكرة للامتحانات والمشاريع"
      ],
      difficulties: [
        {
          concept: `تشابك العمليات أو المفاهيم في ${topic || "الدرس"}`,
          whyHard: "تراكم الكثير من المصطلحات والمعلومات المتزامنة في وقت واحد.",
          simplified: "قسّم الظاهرة إلى 3 مراحل: مدخلات، ما يحدث في الوسط، والنتيجة النهائية.",
          analogy: "مثل إعداد وصفة كعكة: المقادير تدخل، الفرن يغيّرها، فنحصل على كعكة لذيذة!"
        },
        {
          concept: "حفظ المصطلحات العلمية الدقيقة والربط بينها",
          whyHard: "تشابه الأسماء أحياناً ونسيان وظيفة كل جزء.",
          simplified: "اربط كل مصطلح بوظيفته وليس فقط بحروفه، واستخدم بطاقات التذكر.",
          analogy: "مثل فريق كرة القدم: كل لاعب له موقع محدد ووظيفة لا يستغني عنها الفريق."
        }
      ],
      vocabulary: [
        { term: topic || "المفهوم الأساسي", meaning: "الفكرة المركزية التي يدور حولها الدرس بأكمله." },
        { term: "الآلية / العملية", meaning: "مجموعة الخطوات المتتالية التي تؤدي إلى النتيجة المطلوبة." }
      ],
      quickCheck: {
        question: `ما هي أهم فكرة يجب أن تتذكرها دائماً عن ${topic || "هذا الدرس"}؟`,
        answer: "التركيز على الفهم العملي وتتبع تسلسل الخطوات بدل الحفظ الصم.",
        tip: "قاعدة 3 ثوانٍ: اشرح الفكرة لشخص آخر بجملة واحدة بسيطة!"
      },
      source: "prototype"
    };
  }

  if (isFr) {
    return {
      topic: topic || "Résumé & Simplification",
      tldr: `Ce cours met en lumière les fondamentaux de ${topic || "la leçon"} : comprendre son mécanisme essentiel de façon limpide, sans jargon inutile.`,
      keyPoints: [
        `Idée clé : comprendre le principe moteur de ${topic || "ce thème"}`,
        "Le déroulement étape par étape des mécanismes observés",
        "Les causes et leurs conséquences directes sur le système",
        "Ce qu'il faut absolument retenir pour réussir ses exercices"
      ],
      difficulties: [
        {
          concept: `Complexité des interactions dans ${topic || "le cours"}`,
          whyHard: "Trop d'informations nouvelles présentées en même temps.",
          simplified: "Décomposez le processus en 3 phases simples : Départ → Transformation → Résultat.",
          analogy: "Comme une usine miniature : les matières premières entrent, la machine assemble, le produit fini sort."
        },
        {
          concept: "Mémorisation des termes techniques précis",
          whyHard: "Les définitions se ressemblent et prêtent à confusion.",
          simplified: "Associez chaque mot clé à son rôle concret plutôt que d'apprendre par cœur.",
          analogy: "Comme les outils d'un artisan : chaque outil a un usage unique et précis."
        }
      ],
      vocabulary: [
        { term: topic || "Concept central", meaning: "Le pilier sur lequel repose toute la démonstration du cours." },
        { term: "Mécanisme", meaning: "Enchaînement ordonné d'étapes produisant un effet précis." }
      ],
      quickCheck: {
        question: `Quel est l'élément le plus important à retenir sur ${topic || "ce sujet"} ?`,
        answer: "Retenir la chaîne logique plutôt que d'apprendre des définitions isolées.",
        tip: "Astuce mémoire : essayez d'expliquer ce cours en une seule phrase à un ami."
      },
      source: "prototype"
    };
  }

  return {
    topic: topic || "Lesson Simplifier & Summary",
    tldr: `This lesson breaks down the core fundamentals of ${topic || "the lesson"} into simple, easy-to-digest steps without confusing terminology.`,
    keyPoints: [
      `Core principle: What ${topic || "this topic"} is really about at its heart`,
      "The step-by-step mechanism and how each part connects",
      "Cause and effect: why things happen the way they do",
      "Essential insights that make test questions easy to answer"
    ],
    difficulties: [
      {
        concept: `Understanding the complex mechanisms in ${topic || "the lesson"}`,
        whyHard: "Lots of new concepts happening simultaneously can feel overwhelming.",
        simplified: "Break it down into three simple beats: What goes in, what changes, and what comes out.",
        analogy: "Like a bicycle chain: pedaling transfers motion to the gears, which moves the wheel forward smoothly."
      },
      {
        concept: "Remembering specific technical terms and roles",
        whyHard: "Terms can sound abstract and disconnected from reality.",
        simplified: "Connect each term directly to its single practical job.",
        analogy: "Like a smartphone: the screen displays, the battery powers, and the processor thinks."
      }
    ],
    vocabulary: [
      { term: topic || "Core Concept", meaning: "The central idea upon which everything else in the lesson depends." },
      { term: "Mechanism", meaning: "The sequence of natural actions that produce a specific result." }
    ],
    quickCheck: {
      question: `What is the single most important takeaway from ${topic || "this lesson"}?`,
      answer: "Understanding the cause-and-effect flow rather than pure rote memorization.",
      tip: "Memory anchor: picture the entire process as a 3-step comic strip!"
    },
    source: "prototype"
  };
}

async function analyzeDocumentContent(payload) {
  const filename = typeof payload?.filename === "string" ? payload.filename.trim() : "Document";
  const rawText = typeof payload?.text === "string" ? payload.text.trim() : "";
  const lang = payload?.language === "ar" ? "ar" : payload?.language === "fr" ? "fr" : "en";
  let education;
  try {
    education = validateEducation(payload?.education);
  } catch {
    education = { stage: "primary", stageLabel: "Primary · الابتدائي", year: 4, subject: "General", specialty: "" };
  }

  if (!rawText || rawText.length < 15) {
    throw fail("The uploaded document contains too little text to analyze.", 400);
  }

  if (apiKey) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost",
          "X-Title": "Elmanar"
        },
        signal: AbortSignal.timeout(60000),
        body: JSON.stringify({
          model,
          response_format: { type: "json_object" },
          temperature: 0.3,
          max_completion_tokens: 2800,
          messages: [
            {
              role: "system",
              content: `You are an educational document analyzer. The user has uploaded a document/PDF (${filename}).
Extract the key lesson topic, provide a clean educational lesson text suitable for classroom quizzes (300-800 words), summarize the core concept, and generate 3 core quiz questions based on the document.
Language: ${lang === "ar" ? "Arabic (العربية الفصحى)" : lang === "fr" ? "French (Français)" : "English"}.
Return ONLY JSON:
{
  "topic": "Accurate topic name",
  "summary": "Concise summary of the document (2-3 sentences)",
  "cleanLesson": "Well-structured educational text extracted from the document",
  "keyConcepts": ["Concept 1", "Concept 2", "Concept 3"],
  "questions": [
    {
      "prompt": "Question text?",
      "options": ["Correct option", "Distractor 1", "Distractor 2", "Distractor 3"],
      "answerIndex": 0,
      "topic": "Concept name",
      "explanation": "Why correct"
    }
  ]
}`
            },
            {
              role: "user",
              content: `Filename: ${filename}\nDocument Text:\n${rawText.slice(0, 16000)}`
            }
          ]
        })
      });

      if (response.ok) {
        const result = await response.json();
        const content = result?.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          if (parsed && parsed.topic && parsed.cleanLesson) {
            return {
              ...parsed,
              filename,
              source: "ai"
            };
          }
        }
      }
    } catch (err) {
      console.warn("OpenRouter document analysis failed, falling back to prototype engine:", err.message);
    }
  }

  return fallbackDocumentAnalysis(filename, rawText, education, lang);
}

function fallbackDocumentAnalysis(filename, rawText, education, lang) {
  const isAr = lang === "ar" || /[\u0600-\u06FF]/.test(rawText + filename);
  const isFr = lang === "fr";

  const cleanName = filename.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ");
  const cleanLesson = rawText.slice(0, 3000).trim();

  if (isAr) {
    return {
      topic: cleanName || "تحليل المستند التعليمي",
      summary: `تم تحليل المستند بنجاح واستخراج الأفكار الرئيسية والمفاهيم التعليمية الأساسية المناسبة للدراسة والاختبار.`,
      cleanLesson,
      keyConcepts: ["المفهوم الأساسي في المستند", "التطبيقات والآليات الرئيسية", "المصطلحات العلمية المحددة"],
      questions: [
        {
          prompt: `ما هي الفكرة الأساسية التي يتناولها هذا المستند (${cleanName})؟`,
          options: [
            "توضيح وشرح المبادئ والعمليات الأساسية المذكورة في المحتوى",
            "نفي الحقائق العلمية دون تقديم أدلة وبراهين",
            "طرح فرضيات تاريخية قديمة لم تعد مستخدمة",
            "لا توجد فكرة محددة في النص"
          ],
          answerIndex: 0,
          topic: cleanName,
          explanation: "المستند يركز بشكل محوري على تبسيط وتوضيح هذه المبادئ التعليمية."
        },
        {
          prompt: "كيف يمكن للدارس الاستفادة القصوى من المعلومات الواردة في هذا الملف؟",
          options: [
            "مراجعة التسلسل المنطقي وربط كل جزء بوظيفته وتطبيقه العملي",
            "الحفظ العشوائي بدون ربط الأفكار ببعضها",
            "تجاهل المصطلحات التخصصية والتركيز على العناوين فقط",
            "قراءة النص مرة واحدة دون اختبار الفهم"
          ],
          answerIndex: 0,
          topic: cleanName,
          explanation: "الربط المنطقي والتطبيق العملي هو السبيل الأفضل لترسيخ الفهم."
        }
      ],
      filename,
      source: "prototype"
    };
  }

  if (isFr) {
    return {
      topic: cleanName || "Analyse de document",
      summary: `Le document a été analysé avec succès. Les notions clés et les points d'apprentissage majeurs ont été extraits.`,
      cleanLesson,
      keyConcepts: ["Concept principal du document", "Mécanismes et applications", "Vocabulaire technique"],
      questions: [
        {
          prompt: `Quelle est l'idée directrice développée dans ce document (${cleanName}) ?`,
          options: [
            "L'explication claire des principes et mécanismes abordés dans le cours",
            "Une simple énumération de faits sans rapport logique",
            "Une hypothèse abandonnée par les programmes modernes",
            "Aucune information pédagogique exploitable"
          ],
          answerIndex: 0,
          topic: cleanName,
          explanation: "Le document est centré sur la clarification des concepts fondamentaux."
        },
        {
          prompt: "Quelle est la méthode recommandée pour assimiler ces notions ?",
          options: [
            "Comprendre l'enchaînement logique et tester ses connaissances avec le quiz",
            "Mémoriser mot à mot sans chercher à comprendre le sens",
            "Sauter les explications pour ne lire que les titres",
            "Reléguer la révision sans faire d'auto-évaluation"
          ],
          answerIndex: 0,
          topic: cleanName,
          explanation: "L'apprentissage actif par questionnement garantit une mémorisation pérenne."
        }
      ],
      filename,
      source: "prototype"
    };
  }

  return {
    topic: cleanName || "Document Study Guide",
    summary: `The document was successfully analyzed and structured into clear lesson notes and core concepts.`,
    cleanLesson,
    keyConcepts: ["Primary Lesson Topic", "Key Mechanisms & Facts", "Core Academic Vocabulary"],
    questions: [
      {
        prompt: `What is the central focus of this document (${cleanName})?`,
        options: [
          "Explaining and exploring the core ideas and principles presented in the text",
          "An outdated hypothesis that has been disproven",
          "An unconnected list of definitions with no logical structure",
          "A fictional narrative with no educational relevance"
        ],
        answerIndex: 0,
        topic: cleanName,
        explanation: "The document builds an educational foundation around this central concept."
      },
      {
        prompt: "What is the best way to master the material from this document?",
        options: [
          "Follow the step-by-step breakdown and practice with concept questions",
          "Memorize the exact wording without grasping the meaning",
          "Ignore key vocabulary and read passively",
          "Skip the explanations and only read the titles"
        ],
        answerIndex: 0,
        topic: cleanName,
        explanation: "Active recall and understanding the underlying mechanisms ensures long-term mastery."
      }
    ],
    filename,
    source: "prototype"
  };
}

async function serveStatic(pathname, response) {
  const publicFile = publicFiles.get(pathname);
  if (!publicFile) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }
  try {
    const contents = await readFile(resolve(root, publicFile));
    response.writeHead(200, {
      "Content-Type": mimeTypes[extname(publicFile)] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": publicFile.includes("logo") ? "public, max-age=86400" : "no-cache"
    });
    response.end(contents);
  } catch (error) {
    console.error(`Unable to read public asset "${publicFile}".`, error);
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("The Elmanar asset could not be loaded.");
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", "http://localhost");
  const method = request.method || "GET";
  try {
    if (url.pathname === "/api/config" && method === "GET") {
      sendJson(response, 200, {
        supabaseConfigured: Boolean(supabaseUrl && supabasePublishableKey),
        supabaseUrl: supabaseUrl || null,
        supabasePublishableKey: supabasePublishableKey || null
      });
      return;
    }
    if (url.pathname === "/api/status" && method === "GET") {
      sendJson(response, 200, { configured: Boolean(apiKey), model: apiKey ? model : null });
      return;
    }
    if (url.pathname === "/api/session" && method === "GET") {
      const auth = tokenFor(request);
      sendJson(response, 200, { user: auth ? safeUser(auth.user) : null });
      return;
    }
    if (url.pathname === "/api/session" && method === "POST") {
      requireSupabase();
      const accessToken = request.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
      if (!accessToken) throw fail("Sign in to continue.", 401);
      const payload = await supabaseAuth("user", { method: "GET", accessToken });
      const supabaseUser = payload?.user || payload;
      const role = supabaseUser?.user_metadata?.role;
      const name = typeof supabaseUser?.user_metadata?.name === "string" ? supabaseUser.user_metadata.name.trim() : "";
      const user = accountFromSupabase(supabaseUser, role, name, supabaseUser?.user_metadata?.education);
      await persistDatabase();
      createSession(response, request, user);
      sendJson(response, 200, { user: safeUser(user) });
      return;
    }
    if (url.pathname === "/api/register" && method === "POST") {
      const payload = await readJson(request);
      const name = typeof payload?.name === "string" ? payload.name.trim() : "";
      const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";
      const password = typeof payload?.password === "string" ? payload.password : "";
      const role = payload?.role;
      if (name.length < 2 || name.length > 70) throw fail("Your name must be between 2 and 70 characters.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw fail("Enter a valid email address.");
      if (password.length < 10 || password.length > 128) throw fail("Use a password between 10 and 128 characters.");
      if (!["teacher", "student", "parent"].includes(role)) throw fail("Choose a teacher, student, or parent account.");
      requireSupabase();
      if (database.users.some((user) => user.email.toLowerCase() === email)) throw fail("That email already has an Elmanar account. Sign in instead.", 409);
      const education = role === "student" ? validateEducation(payload?.education) : null;
      const result = await supabaseAuth(`signup?redirect_to=${encodeURIComponent(`${supabaseSiteUrl}/`)}`, {
        body: { email, password, data: { name, role, ...(education ? { education } : {}) } }
      });
      const supabaseUser = result.user || result;
      if (!supabaseUser?.id) throw fail("Supabase did not return an account. Please try again.", 502);
      if (Array.isArray(supabaseUser.identities) && supabaseUser.identities.length === 0) {
        throw fail("That email already has an account. Sign in instead or check your inbox for a confirmation email.", 409);
      }
      const user = accountFromSupabase(supabaseUser, role, name, education);
      await persistDatabase();
      const session = result.access_token ? {
        access_token: result.access_token,
        refresh_token: result.refresh_token,
        token_type: result.token_type,
        expires_in: result.expires_in,
        expires_at: result.expires_at,
        user: result.user
      } : null;
      if (session) createSession(response, request, user);
      sendJson(response, session ? 201 : 202, {
        user: safeUser(user), session,
        requiresEmailConfirmation: !session
      });
      return;
    }
    if (url.pathname === "/api/login" && method === "POST") {
      const payload = await readJson(request);
      const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";
      const password = typeof payload?.password === "string" ? payload.password : "";
      const role = payload?.role;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
          password.length < 1 || password.length > 128 ||
          !["teacher", "student", "parent"].includes(role)) {
        throw fail("Enter your email and password and choose the role you used to create this account.");
      }
      const result = await supabaseAuth("token?grant_type=password", {
        body: { email, password }
      });
      const supabaseUser = result.user;
      const user = database.users.find((entry) => entry.id === supabaseUser?.id);
      if (!user) throw fail("This Supabase account has no Elmanar role yet. Create its Elmanar account first.", 403);
      if (user.role !== role) throw fail(`This email belongs to your ${user.role} account. Choose “I am a ${user.role}”.`, 403);
      createSession(response, request, user);
      sendJson(response, 200, {
        user: safeUser(user),
        session: {
          access_token: result.access_token,
          refresh_token: result.refresh_token,
          token_type: result.token_type,
          expires_in: result.expires_in,
          expires_at: result.expires_at,
          user: result.user
        }
      });
      return;
    }
    if (url.pathname === "/api/auth/refresh" && method === "POST") {
      const payload = await readJson(request);
      const refreshToken = typeof payload?.refresh_token === "string" ? payload.refresh_token : "";
      if (!refreshToken || refreshToken.length > 4096) throw fail("Your saved sign-in expired. Please sign in again.", 401);
      const result = await supabaseAuth("token?grant_type=refresh_token", {
        body: { refresh_token: refreshToken }
      });
      sendJson(response, 200, {
        access_token: result.access_token,
        refresh_token: result.refresh_token,
        token_type: result.token_type,
        expires_in: result.expires_in,
        expires_at: result.expires_at,
        user: result.user
      });
      return;
    }
    if (url.pathname === "/api/auth/resend" && method === "POST") {
      const payload = await readJson(request);
      const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw fail("Enter the email address you used to sign up.");
      await supabaseAuth(`resend?redirect_to=${encodeURIComponent(`${supabaseSiteUrl}/`)}`, {
        body: { type: "signup", email }
      });
      sendJson(response, 200, { ok: true });
      return;
    }
    if (url.pathname === "/api/auth/logout" && method === "POST") {
      const payload = await readJson(request);
      const accessToken = typeof payload?.access_token === "string" ? payload.access_token : "";
      if (!accessToken) throw fail("Your saved sign-in has expired.", 401);
      await supabaseAuth("logout", { accessToken });
      sendJson(response, 200, { ok: true });
      return;
    }
    if (url.pathname === "/api/logout" && method === "POST") {
      const auth = tokenFor(request);
      if (auth) sessions.delete(auth.token);
      clearSessionCookie(response, request);
      sendJson(response, 200, { ok: true });
      return;
    }
    if (url.pathname === "/api/generate" && method === "POST") {
      const user = requireUser(request, "teacher");
      const quiz = await generateQuiz(await readJson(request));
      sendJson(response, 200, { quiz });
      return;
    }
    if (url.pathname === "/api/simplify" && method === "POST") {
      const payload = await readJson(request);
      const simplification = await simplifyLesson(payload);
      sendJson(response, 200, { simplification });
      return;
    }
    if (url.pathname === "/api/analyze-document" && method === "POST") {
      const payload = await readJson(request);
      const document = await analyzeDocumentContent(payload);
      sendJson(response, 200, { document });
      return;
    }
    if (url.pathname === "/api/data" && method === "GET") {
      const user = requireUser(request);
      const data = user.role === "teacher" ? { quizzes: teacherData(user) }
        : user.role === "student" ? { quizzes: studentData(user) }
          : { students: parentData(user) };
      sendJson(response, 200, { user: safeUser(user), ...data });
      return;
    }
    if (url.pathname === "/api/profile" && method === "PUT") {
      const user = requireUser(request, "student");
      const education = validateEducation((await readJson(request))?.education);
      const accessToken = request.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
      if (!accessToken) throw fail("Refresh your sign-in and try again.", 401);
      const supabaseUser = await supabaseAuth("user", { method: "GET", accessToken });
      if (supabaseUser.id !== user.id) throw fail("That sign-in does not belong to this student account.", 403);
      await supabaseAuth("user", {
        method: "PUT", accessToken,
        body: { data: { name: user.name, role: user.role, education } }
      });
      user.education = education;
      await persistDatabase();
      sendJson(response, 200, { user: safeUser(user) });
      return;
    }
    if (url.pathname === "/api/quizzes" && method === "POST") {
      const user = requireUser(request, "teacher");
      const payload = await readJson(request);
      const quiz = validateQuiz(payload?.quiz);
      const entry = {
        id: randomUUID(), ownerId: user.id, ...quiz,
        lesson: typeof payload.lesson === "string" ? payload.lesson.slice(0, 18000) : "",
        approved: false, code: null, submissions: [], createdAt: new Date().toISOString()
      };
      database.quizzes.unshift(entry);
      await persistDatabase();
      sendJson(response, 201, { quiz: { id: entry.id, topic: entry.topic, count: entry.questions.length, approved: false } });
      return;
    }
    const draftMatch = url.pathname.match(/^\/api\/quizzes\/([0-9a-f-]{36})$/i);
    if (draftMatch && method === "GET") {
      const user = requireUser(request, "teacher");
      const entry = database.quizzes.find((quiz) => quiz.id === draftMatch[1] && quiz.ownerId === user.id);
      if (!entry) throw fail("This quiz was not found in your teacher account.", 404);
      sendJson(response, 200, { quiz: { id: entry.id, topic: entry.topic, education: entry.education || null, questions: entry.questions, lesson: entry.lesson, approved: entry.approved, code: entry.code } });
      return;
    }
    if (draftMatch && method === "PUT") {
      const user = requireUser(request, "teacher");
      const entry = database.quizzes.find((quiz) => quiz.id === draftMatch[1] && quiz.ownerId === user.id);
      if (!entry) throw fail("This quiz was not found in your teacher account.", 404);
      const quiz = validateQuiz((await readJson(request)).quiz);
      Object.assign(entry, quiz, { approved: false, code: null });
      entry.submissions = [];
      for (const student of database.users) {
        if (student.role === "student") {
          student.joinedQuizIds = student.joinedQuizIds.filter((quizId) => quizId !== entry.id);
        }
      }
      await persistDatabase();
      sendJson(response, 200, { quiz: { id: entry.id, topic: entry.topic, count: entry.questions.length, approved: false } });
      return;
    }
    const publishMatch = url.pathname.match(/^\/api\/quizzes\/([0-9a-f-]{36})\/publish$/i);
    if (publishMatch && method === "POST") {
      const user = requireUser(request, "teacher");
      const entry = database.quizzes.find((quiz) => quiz.id === publishMatch[1] && quiz.ownerId === user.id);
      if (!entry) throw fail("This quiz was not found in your teacher account.", 404);
      const quiz = validateQuiz((await readJson(request)).quiz);
      const taken = new Set(database.quizzes.filter((item) => item.id !== entry.id && item.code).map((item) => item.code));
      Object.assign(entry, quiz, { approved: true, code: entry.code || createUniqueCode(taken) });
      await persistDatabase();
      sendJson(response, 200, { quiz: { id: entry.id, topic: entry.topic, count: entry.questions.length, approved: true, code: entry.code } });
      return;
    }
    if (url.pathname === "/api/join" && method === "POST") {
      const user = requireUser(request, "student");
      const payload = await readJson(request);
      const code = typeof payload?.code === "string" ? payload.code.trim().toUpperCase() : "";
      const quiz = database.quizzes.find((entry) => entry.code === code && entry.approved);
      if (!quiz) throw fail("That class code isn't active yet. Check the code with your teacher and try again.", 404);
      if (!user.joinedQuizIds.includes(quiz.id)) {
        user.joinedQuizIds.push(quiz.id);
        await persistDatabase();
      }
      sendJson(response, 200, { quizId: quiz.id });
      return;
    }
    const submitMatch = url.pathname.match(/^\/api\/quizzes\/([0-9a-f-]{36})\/submit$/i);
    if (submitMatch && method === "POST") {
      const user = requireUser(request, "student");
      const quiz = database.quizzes.find((entry) =>
        entry.id === submitMatch[1] && entry.approved && user.joinedQuizIds.includes(entry.id)
      );
      if (!quiz) throw fail("This approved quiz isn't in your student account yet. Join it with your teacher's code.", 404);
      const payload = await readJson(request);
      if (!Array.isArray(payload?.answers) || payload.answers.length !== quiz.questions.length ||
          payload.answers.some((answer) => !Number.isInteger(answer) || answer < 0 || answer > 3)) {
        throw fail("Answer every question before submitting.");
      }
      const answers = [...payload.answers];
      const score = quiz.questions.reduce((total, question, index) => total + (payload.answers[index] === question.answerIndex ? 1 : 0), 0);
      const submission = { studentId: user.id, answers, score, completedAt: new Date().toISOString() };
      const existing = quiz.submissions.findIndex((entry) => entry.studentId === user.id);
      if (existing >= 0) quiz.submissions[existing] = submission;
      else quiz.submissions.push(submission);
      await persistDatabase();
      sendJson(response, 200, { result: { ...submission, topics: topicBreakdown(quiz, answers) } });
      return;
    }
    if (url.pathname === "/api/family/connect" && method === "POST") {
      const user = requireUser(request, "parent");
      const payload = await readJson(request);
      const code = typeof payload?.code === "string" ? payload.code.trim().toUpperCase() : "";
      const student = database.users.find((entry) => entry.role === "student" && entry.familyCode === code);
      if (!student) throw fail("We couldn't find a student with that family code. Ask them to check their student portal.", 404);
      if (!user.linkedStudentIds.includes(student.id)) {
        user.linkedStudentIds.push(student.id);
        await persistDatabase();
      }
      sendJson(response, 200, { student: { id: student.id, name: student.name } });
      return;
    }
    if (url.pathname.startsWith("/api/")) {
      response.setHeader("Allow", "GET, POST, PUT");
      throw fail("This API endpoint or method was not found.", 404);
    }
    if (method !== "GET" && method !== "HEAD") {
      response.writeHead(405, { Allow: "GET, HEAD" });
      response.end();
      return;
    }
    if (method === "HEAD") {
      const headResponse = {
        writeHead(status, headers) { this.status = status; this.headers = headers; },
        end() { response.writeHead(this.status, this.headers); response.end(); }
      };
      await serveStatic(url.pathname, headResponse);
      return;
    }
    await serveStatic(url.pathname, response);
  } catch (error) {
    const status = Number.isInteger(error?.status) ? error.status : 500;
    if (status >= 500) console.error("Elmanar request failed:", error);
    if (!response.headersSent) sendJson(response, status, { error: error instanceof Error ? error.message : "Something went wrong." });
    else response.destroy(error);
  }
});

await mkdir(dataDir, { recursive: true });
try {
  const persisted = JSON.parse(await readFile(dataFile, "utf8"));
  if (!persisted || !Array.isArray(persisted.users) || !Array.isArray(persisted.quizzes)) {
    throw new Error("The account store does not have a valid Elmanar data format.");
  }
  database = persisted;
} catch (error) {
  if (error?.code !== "ENOENT") {
    console.error("Unable to load the Elmanar account database.", error);
    process.exitCode = 1;
    throw error;
  }
}

server.listen(port, host, () => {
  const address = server.address();
  console.log(`Elmanar is ready at http://${host}:${typeof address === "object" && address ? address.port : port}`);
  if (!apiKey) console.log("Sample mode: add OPENROUTER_API_KEY to .env to enable AI-generated quizzes.");
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
