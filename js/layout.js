/* =========================================================
   공용 레이아웃: Header / Footer / Toast
   각 페이지의 <div id="site-header">, <div id="site-footer"> 를 채웁니다.
   ========================================================= */
(function () {
  const headerHtml = `
  <header class="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200">
    <div class="max-w-6xl mx-auto px-4 h-14 flex items-center gap-2 sm:gap-3">
      <a href="index.html" class="flex items-center gap-2 min-w-0" aria-label="CSAT English Assistant 홈">
        <span class="shrink-0 w-8 h-8 rounded-lg bg-brand-600 text-white grid place-items-center font-bold text-xs">CE</span>
        <span class="truncate font-bold text-[13px] sm:text-lg tracking-tight">CSAT English <span class="text-brand-600">Assistant</span></span>
      </a>
      <div class="ml-auto shrink-0 flex items-center gap-1.5 sm:gap-2">
        <button id="btnLogin" class="text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 transition">로그인</button>
        <button id="btnMy" class="text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition">마이페이지</button>
      </div>
    </div>
  </header>`;

  const footerHtml = `
  <footer class="border-t border-slate-200 bg-white mt-8">
    <div class="max-w-6xl mx-auto px-4 py-6 text-center text-xs sm:text-sm text-slate-500 leading-relaxed">
      <p>본 사이트는 비상업적 학습 목적으로 제작된 비영리 웹사이트입니다. 제공되는 모의고사 문항 및 지문의 저작권은 한국교육과정평가원 및 각 시도교육청에 있습니다.</p>
      <p class="mt-2 text-slate-400">&copy; CSAT English Assistant · Non-profit educational project</p>
    </div>
  </footer>`;

  const h = document.getElementById("site-header");
  if (h) h.innerHTML = headerHtml;
  const f = document.getElementById("site-footer");
  if (f) f.innerHTML = footerHtml;

  // Toast
  const t = document.createElement("div");
  t.id = "toast";
  t.className =
    "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[90vw] px-4 py-2 rounded-lg bg-slate-900 text-white text-sm shadow-lg opacity-0 pointer-events-none transition-opacity duration-300";
  document.body.appendChild(t);

  let timer;
  window.toast = function (msg) {
    t.textContent = msg;
    t.classList.remove("opacity-0");
    clearTimeout(timer);
    timer = setTimeout(() => t.classList.add("opacity-0"), 2400);
  };

  // 로그인/마이페이지는 Step 3(Firebase)에서 연결 예정
  const login = document.getElementById("btnLogin");
  const my = document.getElementById("btnMy");
  if (login) login.addEventListener("click", () => window.toast("로그인 기능은 Step 3(Firebase)에서 연결됩니다."));
  if (my) my.addEventListener("click", () => window.toast("마이페이지는 Step 3에서 제공됩니다."));
})();
