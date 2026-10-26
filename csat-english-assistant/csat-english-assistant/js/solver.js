/* =========================================================
   문제 풀이 엔진 (학년 페이지 · 유형 페이지 공용)
   - <body data-mode="grade" data-grade="고1">   → 해당 학년 문제
   - <body data-mode="type">  + ?t=blank          → 해당 유형 문제
   데이터는 data/bank.js (window.QUESTION_BANK) 에서 읽습니다.
   ========================================================= */
(function () {
  "use strict";

  const CEA = window.CEA;
  const bank = window.QUESTION_BANK;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const ds = document.body.dataset;
  const area = $("#questionArea");

  if (!Array.isArray(bank)) {
    area.innerHTML = `<div class="p-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
      <b>data/bank.js</b>를 불러오지 못했습니다. <code>npm run build:data</code> 로 문제 데이터를 생성했는지 확인하세요.</div>`;
    return;
  }

  /* ---------- 페이지 구성 ---------- */
  const ALL = { key: "all", label: "전체", test: () => true };
  let pool, filters, head;

  if (ds.mode === "type") {
    const type = CEA.typeByKey(new URLSearchParams(location.search).get("t"));
    if (!type) {
      area.innerHTML = `<div class="p-8 text-center bg-white border border-slate-200 rounded-2xl">
        <p class="font-semibold">알 수 없는 유형입니다.</p>
        <a href="types.html" class="inline-block mt-4 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm">유형 목록으로</a></div>`;
      return;
    }
    pool = bank.filter((q) => q.typeKey === type.key);
    filters = [ALL].concat(CEA.GRADES.map((g) => ({ key: g, label: g, test: (q) => q.grade === g })));
    head = { href: "types.html", back: "← 유형별", title: type.name, sub: "(" + type.range + ")" };
    document.title = type.name + " | CSAT English Assistant";
  } else {
    const grade = ds.grade;
    pool = bank.filter((q) => q.grade === grade);
    filters = [ALL].concat(
      CEA.TYPES.map((t) => ({ key: t.key, label: t.name, sub: t.range, test: (q) => q.typeKey === t.key }))
    );
    head = { href: "index.html", back: "← 홈", title: grade + " 모의고사", sub: "" };
    document.title = grade + " 모의고사 | CSAT English Assistant";
  }

  /* ---------- 상태 ---------- */
  const KEY = "cea.results.v1"; // 세션 동안만 유지 (로그인 연동 전)
  const results = (() => { try { return JSON.parse(sessionStorage.getItem(KEY)) || {}; } catch (e) { return {}; } })();
  const saveResults = () => { try { sessionStorage.setItem(KEY, JSON.stringify(results)); } catch (e) {} };

  const state = { filter: "all", list: [], idx: 0, selected: null, submitted: false, showExp: false, showTr: false };
  const noted = new Set(); // 오답노트 담기 (UI 전용, Step 4에서 저장 연결)

  const activeFilter = () => filters.find((f) => f.key === state.filter) || ALL;
  const current = () => state.list[state.idx];

  /* ---------- 렌더: 상단 ---------- */
  function renderHead() {
    $("#pageHead").innerHTML = `
      <a href="${head.href}" class="text-sm text-slate-500 hover:text-brand-600 transition">${head.back}</a>
      <div class="mt-2 flex flex-wrap items-end justify-between gap-2">
        <h1 class="text-2xl font-bold tracking-tight">${esc(head.title)} <span class="text-sm font-normal text-slate-400">${esc(head.sub)}</span></h1>
        <p id="stats" class="text-sm text-slate-500"></p>
      </div>`;
  }

  function renderFilters() {
    if (!pool.length) { $("#filterBar").innerHTML = ""; return; }
    $("#filterBar").innerHTML = `
      <div class="mt-4 flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap md:overflow-visible pb-1">
        ${filters.map((f) => {
          const on = f.key === state.filter;
          const n = pool.filter(f.test).length;
          return `<button data-filter="${f.key}" class="shrink-0 px-3.5 py-1.5 rounded-full text-sm border transition ${
            on ? "bg-brand-600 border-brand-600 text-white shadow-sm"
               : "bg-white border-slate-200 text-slate-600 hover:border-brand-500 hover:text-brand-600"
          }">${esc(f.label)} <span class="text-xs ${on ? "text-brand-100" : "text-slate-400"}">${n}</span></button>`;
        }).join("")}
      </div>`;
  }

  function updateStats() {
    const vals = Object.values(results);
    const solved = vals.length;
    const ok = vals.filter((r) => r.correct).length;
    const el = $("#stats");
    if (el) el.textContent = solved ? `푼 문제 ${solved} · 정답률 ${Math.round((ok / solved) * 100)}%` : "";
  }

  /* ---------- 렌더: 문제 ---------- */
  function renderPassage(text) {
    return esc(text).replace(/\[\[BLANK\]\]/g, '<span class="blank" aria-label="빈칸">&nbsp;</span>');
  }

  function renderEmpty() {
    const none = !pool.length;
    area.innerHTML = `
      <div class="mt-6 bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center fade-up">
        <div class="text-4xl mb-3">📭</div>
        <p class="font-semibold text-slate-700">${none ? "아직 등록된 문제가 없어요." : "선택한 조건에 해당하는 문제가 없어요."}</p>
        <p class="text-sm text-slate-500 mt-1">${none ? "문제가 추가되면 이곳에서 바로 풀 수 있어요." : "다른 필터를 선택해 보세요."}</p>
        ${none
          ? `<a href="${head.href}" class="inline-block mt-5 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm hover:bg-brand-700 transition">${head.back.replace("← ", "")}(으)로 돌아가기</a>`
          : `<button data-action="reset" class="mt-5 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm hover:bg-brand-700 transition">필터 초기화</button>`}
      </div>`;
  }

  function renderQuestion() {
    const q = current();
    if (!q) { renderEmpty(); updateStats(); return; }

    const type = CEA.typeByKey(q.typeKey);
    const res = results[q.id];
    const isNoted = noted.has(q.id);

    const optionsHtml = q.options.map((opt, i) => {
      const n = i + 1;
      let cls = "border-slate-200 bg-white hover:border-brand-500 hover:bg-brand-50";
      let badge = "bg-slate-100 text-slate-600";
      let icon = "";
      if (!state.submitted && state.selected === n) {
        cls = "border-brand-600 bg-brand-50 ring-2 ring-brand-500/30";
        badge = "bg-brand-600 text-white";
      }
      if (state.submitted) {
        cls = "border-slate-200 bg-white opacity-60 cursor-default";
        if (n === q.answer) { cls = "border-emerald-500 bg-emerald-50 cursor-default"; badge = "bg-emerald-600 text-white"; icon = "✓"; }
        else if (n === state.selected) { cls = "border-rose-500 bg-rose-50 cursor-default"; badge = "bg-rose-600 text-white"; icon = "✗"; }
      }
      return `
        <button data-opt="${n}" ${state.submitted ? "disabled" : ""} role="radio" aria-checked="${state.selected === n}"
          class="w-full text-left flex items-start gap-3 px-4 py-3 rounded-xl border transition ${cls}">
          <span class="shrink-0 w-7 h-7 rounded-full grid place-items-center text-sm font-semibold ${badge}">${n}</span>
          <span class="flex-1 font-passage text-[15px] sm:text-base leading-relaxed pt-0.5">${esc(opt)}</span>
          <span class="shrink-0 font-bold ${n === q.answer ? "text-emerald-600" : "text-rose-600"}">${icon}</span>
        </button>`;
    }).join("");

    const resultHtml = state.submitted ? `
      <div class="mt-6 fade-up">
        <div class="flex items-center gap-3 p-4 rounded-xl ${res.correct ? "bg-emerald-50 border border-emerald-200" : "bg-rose-50 border border-rose-200"}">
          <span class="text-2xl">${res.correct ? "🎉" : "😢"}</span>
          <div>
            <p class="font-bold ${res.correct ? "text-emerald-700" : "text-rose-700"}">${res.correct ? "정답입니다!" : "오답입니다."}</p>
            <p class="text-sm text-slate-600">정답: ${q.answer}번${res.correct ? "" : ` · 내가 고른 답: ${res.selected}번`}</p>
          </div>
        </div>
        <div class="flex flex-wrap gap-2 mt-4">
          <button data-action="toggle-exp" class="px-4 py-2 rounded-lg text-sm font-medium border transition ${state.showExp ? "bg-brand-600 border-brand-600 text-white" : "bg-white border-slate-300 hover:bg-slate-100"}">
            ${state.showExp ? "해설 닫기" : "해설 보기"} <span class="inline-block transition-transform ${state.showExp ? "rotate-180" : ""}">▾</span>
          </button>
          <button data-action="toggle-tr" class="px-4 py-2 rounded-lg text-sm font-medium border transition ${state.showTr ? "bg-brand-600 border-brand-600 text-white" : "bg-white border-slate-300 hover:bg-slate-100"}">
            ${state.showTr ? "번역 닫기" : "지문 번역 보기"} <span class="inline-block transition-transform ${state.showTr ? "rotate-180" : ""}">▾</span>
          </button>
        </div>
        <div id="expBox" class="collapsible ${state.showExp ? "open" : ""}">
          <div class="inner"><div class="mt-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm sm:text-base leading-relaxed whitespace-pre-line"><p class="font-semibold text-amber-800 mb-1">📘 해설</p>${esc(q.explanation || "해설이 아직 등록되지 않았습니다.")}</div></div>
        </div>
        <div id="trBox" class="collapsible ${state.showTr ? "open" : ""}">
          <div class="inner"><div class="mt-3 p-4 rounded-xl bg-sky-50 border border-sky-200 text-sm sm:text-base leading-relaxed whitespace-pre-line"><p class="font-semibold text-sky-800 mb-1">🈶 지문 번역</p>${esc(q.translation || "번역이 아직 등록되지 않았습니다.")}</div></div>
        </div>
      </div>` : "";

    area.innerHTML = `
      <article class="mt-5 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden fade-up">
        <div class="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-slate-100 bg-slate-50/60">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold ${CEA.GRADE_STYLES[q.grade] || "bg-slate-100 text-slate-700"}">${esc(q.grade)}</span>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-100 text-brand-700">${esc(type ? type.name : "")}</span>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">${q.number}번</span>
          <span class="ml-auto text-sm text-slate-500">${state.idx + 1} <span class="text-slate-300">/</span> ${state.list.length}</span>
        </div>
        <div class="p-5 sm:p-7">
          <h2 class="font-semibold text-base sm:text-lg text-slate-900 mb-1">${q.number}. ${esc(q.title)}</h2>
          <p class="text-xs text-slate-400 mb-4">${esc(q.examLabel || "")}</p>
          ${q.image ? `<img src="${esc(q.image)}" alt="문제 도표/그림" class="mb-4 w-full max-w-xl mx-auto rounded-lg border border-slate-200" />` : ""}
          ${q.passage ? `<div class="font-passage text-base lg:text-lg leading-relaxed text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-6 whitespace-pre-line">${renderPassage(q.passage)}</div>` : ""}
          <div role="radiogroup" aria-label="선지" class="mt-5 space-y-2.5">${optionsHtml}</div>
          <div class="mt-6 flex flex-wrap items-center gap-2">
            <button data-action="prev" ${state.idx === 0 ? "disabled" : ""} class="px-3.5 py-2.5 rounded-lg text-sm border border-slate-300 hover:bg-slate-100 transition disabled:opacity-40 disabled:cursor-not-allowed">← 이전</button>
            <button data-action="submit" ${state.submitted || state.selected === null ? "disabled" : ""} class="flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed">정답 제출</button>
            <button data-action="next" class="px-4 py-2.5 rounded-lg text-sm font-medium border border-slate-300 hover:bg-slate-100 transition">다음 문제 →</button>
            <button data-action="note" class="sm:ml-auto px-4 py-2.5 rounded-lg text-sm font-medium border transition ${isNoted ? "bg-amber-100 border-amber-300 text-amber-800" : "border-slate-300 hover:bg-slate-100"}">${isNoted ? "★ 오답노트에 담음" : "☆ 오답노트 담기"}</button>
          </div>
          <p class="mt-2 text-xs text-slate-400 hidden sm:block">단축키: 1~5 선택 · Enter 제출 · ←/→ 이동</p>
          ${resultHtml}
        </div>
      </article>`;
    updateStats();
  }

  /* ---------- 동작 ---------- */
  function loadQuestionState() {
    const q = current();
    const prev = q && results[q.id];
    state.selected = prev ? prev.selected : null;
    state.submitted = !!prev;
    state.showExp = false;
    state.showTr = false;
  }

  function applyFilter(key) {
    state.filter = key;
    state.list = pool.filter(activeFilter().test);
    state.idx = 0;
    loadQuestionState();
    renderFilters();
    renderQuestion();
  }

  function selectOption(n) {
    if (state.submitted || !current()) return;
    state.selected = n;
    renderQuestion();
  }

  function submitAnswer() {
    const q = current();
    if (!q || state.submitted || state.selected === null) return;
    results[q.id] = { selected: state.selected, correct: state.selected === q.answer };
    saveResults();
    state.submitted = true;
    renderQuestion();
  }

  function go(delta) {
    const n = state.list.length;
    if (!n) return;
    state.idx = (state.idx + delta + n) % n;
    loadQuestionState();
    renderQuestion();
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (delta > 0 && n > 1 && state.idx === 0) window.toast("마지막 문제입니다. 처음으로 돌아갑니다.");
    if (delta > 0 && n === 1) window.toast("이 조건에는 문제가 1개뿐이에요.");
  }

  function toggleBox(which) {
    const key = which === "exp" ? "showExp" : "showTr";
    state[key] = !state[key];
    $(which === "exp" ? "#expBox" : "#trBox").classList.toggle("open", state[key]);
    const btn = document.querySelector(`[data-action="toggle-${which}"]`);
    const label = which === "exp" ? "해설" : "번역";
    const openText = which === "exp" ? "해설 보기" : "지문 번역 보기";
    btn.className = "px-4 py-2 rounded-lg text-sm font-medium border transition " +
      (state[key] ? "bg-brand-600 border-brand-600 text-white" : "bg-white border-slate-300 hover:bg-slate-100");
    btn.innerHTML = `${state[key] ? label + " 닫기" : openText} <span class="inline-block transition-transform ${state[key] ? "rotate-180" : ""}">▾</span>`;
  }

  function toggleNote() {
    const q = current();
    if (!q) return;
    if (noted.has(q.id)) { noted.delete(q.id); window.toast("오답노트에서 뺐어요."); }
    else { noted.add(q.id); window.toast("오답노트 담기는 UI 미리보기입니다. (Step 4에서 저장 연결)"); }
    renderQuestion();
    if (state.showExp) $("#expBox") && $("#expBox").classList.add("open");
    if (state.showTr) $("#trBox") && $("#trBox").classList.add("open");
  }

  document.addEventListener("click", (e) => {
    const f = e.target.closest("[data-filter]");
    if (f) { applyFilter(f.dataset.filter); return; }
    const o = e.target.closest("[data-opt]");
    if (o) { selectOption(Number(o.dataset.opt)); return; }
    const a = e.target.closest("[data-action]");
    if (!a) return;
    switch (a.dataset.action) {
      case "submit": submitAnswer(); break;
      case "next": go(1); break;
      case "prev": go(-1); break;
      case "toggle-exp": toggleBox("exp"); break;
      case "toggle-tr": toggleBox("tr"); break;
      case "note": toggleNote(); break;
      case "reset": applyFilter("all"); break;
    }
  });

  document.addEventListener("keydown", (e) => {
    if (["INPUT", "SELECT", "TEXTAREA"].includes(e.target.tagName)) return;
    if (e.key >= "1" && e.key <= "5") selectOption(Number(e.key));
    else if (e.key === "Enter") submitAnswer();
    else if (e.key === "ArrowRight") go(1);
    else if (e.key === "ArrowLeft") go(-1);
  });

  /* ---------- 시작 ---------- */
  renderHead();
  applyFilter("all");
})();
