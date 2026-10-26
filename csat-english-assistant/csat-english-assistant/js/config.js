/* =========================================================
   CSAT English Assistant - 공용 설정 (브라우저 + Node 겸용)
   - 학년/유형 분류의 "단일 출처(single source of truth)".
   - tools/build-bank.mjs 도 이 파일을 불러와 문제 번호 → 유형을 자동 판정합니다.
   ========================================================= */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.CEA = api;
})(typeof self !== "undefined" ? self : this, function () {
  const GRADES = ["고1", "고2", "고3"];

  const GRADE_STYLES = {
    "고1": "bg-emerald-100 text-emerald-700",
    "고2": "bg-sky-100 text-sky-700",
    "고3": "bg-violet-100 text-violet-700",
  };

  // 문제 번호 구간별 유형 (from~to 포함)
  const TYPES = [
    { key: "purpose", name: "목적 및 심경변화",        from: 18, to: 19 },
    { key: "gist",    name: "지문 요지 및 함의추론",    from: 20, to: 24 },
    { key: "data",    name: "도표 및 일치·불일치",      from: 25, to: 28 },
    { key: "grammar", name: "어법·어휘 적절성",         from: 29, to: 30 },
    { key: "blank",   name: "빈칸추론",                 from: 31, to: 34 },
    { key: "order",   name: "무관 문장 및 글의 순서",   from: 35, to: 37 },
    { key: "insert",  name: "문장삽입",                 from: 38, to: 39 },
    { key: "summary", name: "요약 완성 및 장문 독해",   from: 40, to: 42 },
    { key: "story",   name: "소설 독해",                from: 43, to: 45 },
  ];
  TYPES.forEach((t) => { t.range = t.from + "~" + t.to; });

  function typeByKey(key) {
    return TYPES.find((t) => t.key === key) || null;
  }
  function typeKeyByNumber(n) {
    const t = TYPES.find((t) => n >= t.from && n <= t.to);
    return t ? t.key : null;
  }

  return { GRADES, GRADE_STYLES, TYPES, typeByKey, typeKeyByNumber };
});
