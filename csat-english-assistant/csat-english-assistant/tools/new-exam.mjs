#!/usr/bin/env node
/**
 * 새 시험지 뼈대(18~45번, 미작성 상태)를 data/src/ 에 만들어 줍니다.
 *
 * 사용:  node tools/new-exam.mjs <examId> <학년> "<시험 이름>"
 * 예)    node tools/new-exam.mjs 2025-06-g3 고3 "2025학년도 6월 고3 모의고사"
 *
 * 생성된 문항은 "status": "todo" 이므로 빌드에서 제외됩니다.
 * 문항을 채운 뒤 "status" 줄을 지우면 사이트에 반영됩니다.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const CFG = require("../js/config.js");
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const [id, grade, label] = process.argv.slice(2);
if (!id || !grade || !label) {
  console.error('사용법: node tools/new-exam.mjs <examId> <고1|고2|고3> "<시험 이름>"');
  process.exit(1);
}
if (!CFG.GRADES.includes(grade)) {
  console.error(`학년은 ${CFG.GRADES.join(", ")} 중 하나여야 합니다.`);
  process.exit(1);
}

const file = path.join(ROOT, "data", "src", `${id}.json`);
if (fs.existsSync(file)) {
  console.error("이미 존재하는 파일입니다: " + path.relative(ROOT, file));
  process.exit(1);
}

const questions = [];
for (let n = 18; n <= 45; n++) {
  questions.push({
    number: n,
    status: "todo",
    title: "",
    passage: "",
    options: ["", "", "", "", ""],
    answer: 1,
    explanation: "",
    translation: "",
  });
}

fs.writeFileSync(file, JSON.stringify({ exam: { id, grade, label }, questions }, null, 2) + "\n");
console.log("생성: " + path.relative(ROOT, file));
console.log("다음: 문항을 채우고 status 줄을 지운 뒤  npm run build:data");
