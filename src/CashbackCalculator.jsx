import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";

/* ============================================================================
   الفئات — لإضافة فئة جديدة أضفها هنا ثم أضف نسبتها داخل كل بطاقة
   ========================================================================== */
const CATEGORIES = [
  { id: "fuel", label: "محطات الوقود", icon: "Fuel" },
  { id: "dining", label: "المطاعم والمقاهي", icon: "UtensilsCrossed" },
  { id: "delivery", label: "تطبيقات التوصيل", icon: "Bike" },
  { id: "grocery", label: "السوبرماركت والتموينات", icon: "ShoppingCart" },
  { id: "pharmacy", label: "الصيدليات والرعاية الطبية", icon: "Pill" },
  { id: "travel", label: "السفر والفنادق", icon: "Plane" },
  { id: "education", label: "التعليم", icon: "GraduationCap" },
  { id: "intl", label: "المشتريات الدولية", icon: "Globe" },
  { id: "other", label: "مشتريات أخرى محلية", icon: "Wallet" },
];

const SAMPLE = {
  fuel: 700, dining: 1200, delivery: 900, grocery: 2500, pharmacy: 300,
  travel: 800, education: 0, intl: 1000, other: 1500,
};

/* ============================================================================
   البطاقات — لإضافة بطاقة جديدة انسخ أي كائن هنا وعدّل قيمه
   rate: النسبة | cap: سقف الكاش باك الشهري | capGroup: فئات تتشارك سقفًا
   perks.lounges: عدد زيارات الصالات المجانية سنويًا (999 = بلا حد عمليًا)
   ========================================================================== */
const CARDS = [
  {
    id: "snb-premium",
    name: "الاسترداد النقدي المميزة",
    short: "الأهلي المميزة",
    issuer: "البنك الأهلي السعودي",
    kind: "ائتمانية · ماستركارد وورلد",
    fee: 230,
    feeNote: "شاملة ضريبة القيمة المضافة",
    fx: 2.85,
    totalCap: null,
    accent: "#0E7A4A",
    perks: { lounges: 999, travelInsurance: true, note: "دخول صالات في مطارات مختارة · تأمين سفر حتى ٧٥٠٬٠٠٠ ريال · ٣ بطاقات إضافية مجانية" },
    terms: "https://www.alahli.com/ar/pages/personal-banking/credit-cards/alahli-cashback-premium-credit-card",
    notes: [
      "لا يُحتسب كاش باك على العمليات التي تتجاوز الحد الائتماني.",
      "المطاعم وتطبيقات التوصيل تتشارك سقف ٢٠٠ ريال واحد.",
      "نسبة الدولي ٢٪ تشمل كل العملات ما عدا اليورو.",
    ],
    rates: {
      fuel: { rate: 0.11, cap: 100 },
      dining: { rate: 0.05, cap: 200, capGroup: "food" },
      delivery: { rate: 0.05, cap: 200, capGroup: "food" },
      grocery: { rate: 0.05, cap: 200 },
      pharmacy: { rate: 0.05, cap: 200 },
      travel: { rate: 0.007, cap: null },
      education: { rate: 0.007, cap: null },
      intl: { rate: 0.02, cap: null },
      other: { rate: 0.007, cap: null },
    },
  },
  {
    id: "bsf-lifestyle",
    name: "لايف ستايل",
    short: "الفرنسي لايف ستايل",
    issuer: "البنك السعودي الفرنسي",
    kind: "ائتمانية · فيزا بلاتينيوم",
    fee: 287.5,
    feeNote: "شاملة الضريبة · تُعفى عند صرف ٢٠٬٠٠٠ ريال سنويًا",
    feeWaiverAnnualSpend: 20000,
    fx: 2,
    totalCap: null,
    accent: "#12507E",
    dynamic: true,
    perks: { lounges: 25, travelInsurance: false, note: "أكثر من ٢٥ دخولًا للصالات · فنادق فيزا الفاخرة · بطاقتان إضافيتان مجانًا" },
    terms: "https://bsf.sa/arabic/personal/cards/credit/lifestyle-credit-card/lifestyle",
    notes: [
      "تختار كل شهر من التطبيق: فئة واحدة ١٠٪، فئتين ٣٪، فئتين ٢٪ — والحاسبة تختار لك أفضل توزيع.",
      "الفئات القابلة للاختيار: المطاعم، التموينات، السفر، الرعاية الطبية، التعليم.",
      "تطبيقات التوصيل محسوبة ضمن فئة المطاعم وتتشارك سقفها.",
      "سداد والسحب النقدي والمحافظ الإلكترونية غير مؤهلة للكاش باك.",
    ],
    baseRate: 0.005,
    selectable: ["dining", "grocery", "travel", "pharmacy", "education"],
    tierRates: [0.1, 0.03, 0.03, 0.02, 0.02],
    tierCap: 250,
  },
  {
    id: "rajhi-platinum",
    name: "كاش باك بلس بلاتينيوم",
    short: "الراجحي بلاتينيوم",
    issuer: "مصرف الراجحي",
    kind: "ائتمانية · فيزا بلاتينيوم",
    fee: 287.5,
    feeNote: "شاملة الضريبة — يُفضّل تأكيدها من المصرف",
    fx: 2.75,
    fxUncertain: true,
    totalCap: 500,
    accent: "#0038FF",
    perks: { lounges: 25, travelInsurance: false, note: "٢٥ صالة مطار · حماية المشتريات والضمان الممتد · تقسيط تساهيل ٠٪" },
    terms: "https://www.alrajhibank.com.sa/-/media/Project/AlrajhiPWS/Shared/Home/Personal/Cards/Cashback-Cards/Cash-Back-EN.pdf",
    notes: [
      "الشروط محدّثة من ٣ أغسطس ٢٠٢٦: أُلغيت المتاجر الإلكترونية وأُضيفت تطبيقات التوصيل ١٠٪.",
      "الوقود والصيدليات والسفر والتعليم ضمن «مشتريات محلية أخرى» ٠٫٥٪ بسقف ٢٠٠ مشترك.",
      "سقف إجمالي ٥٠٠ ريال شهريًا لكل الفئات مجتمعة.",
      "الكاش باك ينزل في محفظة منفصلة وتحتاج تطلب استرداده (الحد الأدنى ٥٠ ريال).",
    ],
    rates: {
      fuel: { rate: 0.005, cap: 200, capGroup: "otherLocal" },
      dining: { rate: 0.05, cap: 200 },
      delivery: { rate: 0.1, cap: 200 },
      grocery: { rate: 0.05, cap: 200 },
      pharmacy: { rate: 0.005, cap: 200, capGroup: "otherLocal" },
      travel: { rate: 0.005, cap: 200, capGroup: "otherLocal" },
      education: { rate: 0.005, cap: 200, capGroup: "otherLocal" },
      intl: { rate: 0.02, cap: 200 },
      other: { rate: 0.005, cap: 200, capGroup: "otherLocal" },
    },
  },
  {
    id: "rajhi-signature",
    name: "كاش باك بلس سيجنتشر",
    short: "الراجحي سيجنتشر",
    issuer: "مصرف الراجحي",
    kind: "ائتمانية · فيزا سيجنتشر",
    fee: 517.5,
    feeNote: "شاملة الضريبة — يُفضّل تأكيدها من المصرف",
    fx: 2.75,
    fxUncertain: true,
    totalCap: 500,
    accent: "#0A2472",
    perks: { lounges: 999, travelInsurance: true, note: "أكثر من ١٢٠٠ صالة مطار · تأمين سفر شامل ٩٠ يومًا · كونسيرج ٢٤/٧" },
    terms: "https://www.alrajhibank.com.sa/-/media/Project/AlrajhiPWS/Shared/Home/Personal/Cards/Cashback-Cards/Cash-Back-EN.pdf",
    notes: [
      "تتفوق على البلاتينيوم بالمطاعم ١٠٪ بدل ٥٪، ودخول أكثر من ١٢٠٠ صالة مطار.",
      "الوقود والصيدليات والسفر والتعليم ضمن «مشتريات محلية أخرى» ٠٫٥٪ بسقف ٢٠٠ مشترك.",
      "سقف إجمالي ٥٠٠ ريال شهريًا — فرق الرسوم عن البلاتينيوم ٢٣٠ ريال سنويًا.",
      "عرض هنقرستيشن يضيف ٥٪ في محفظة التطبيق خارج هذي الحسبة.",
    ],
    rates: {
      fuel: { rate: 0.005, cap: 200, capGroup: "otherLocal" },
      dining: { rate: 0.1, cap: 200 },
      delivery: { rate: 0.1, cap: 200 },
      grocery: { rate: 0.05, cap: 200 },
      pharmacy: { rate: 0.005, cap: 200, capGroup: "otherLocal" },
      travel: { rate: 0.005, cap: 200, capGroup: "otherLocal" },
      education: { rate: 0.005, cap: 200, capGroup: "otherLocal" },
      intl: { rate: 0.02, cap: 200 },
      other: { rate: 0.005, cap: 200, capGroup: "otherLocal" },
    },
  },
  {
    id: "mobily-platinum",
    name: "البطاقة البلاتينية",
    short: "موبايلي باي",
    issuer: "موبايلي باي",
    kind: "مسبقة الدفع · فيزا",
    fee: 0,
    feeNote: "بدون رسوم إصدار أو تجديد",
    fx: 1.99,
    totalCap: null,
    accent: "#6B2FA0",
    perks: { lounges: 0, travelInsurance: false, note: "خصومات فيزا فقط — بدون صالات ولا تأمين" },
    terms: "https://mobilypay.sa/ar/cashback.html",
    notes: [
      "النسب مخفّضة من ١٥ يونيو ٢٠٢٦: سوبرماركت ومطاعم ٠٫٧٥٪، وجبات سريعة ٠٫٥٪، تعليم ٠٫٢٥٪.",
      "مستثنى: الوقود، فواتير الخدمات، المدفوعات الحكومية، الجمعيات الخيرية، المحافظ الإلكترونية، معارض السيارات، والاتصالات.",
      "بدون سقف على الكاش باك.",
    ],
    rates: {
      fuel: { rate: 0, cap: null, excluded: true },
      dining: { rate: 0.0075, cap: null },
      delivery: { rate: 0.005, cap: null },
      grocery: { rate: 0.0075, cap: null },
      pharmacy: { rate: 0.01, cap: null },
      travel: { rate: 0.01, cap: null },
      education: { rate: 0.0025, cap: null },
      intl: { rate: 0.015, cap: null },
      other: { rate: 0.01, cap: null },
    },
  },
  {
    id: "iz-cashback",
    name: "بطاقة عز كاش باك",
    short: "عز",
    issuer: "عز — مصرف الإنماء",
    kind: "مسبقة الدفع · رقمية",
    fee: 0,
    feeNote: "بدون رسوم إصدار أو تجديد أو استبدال",
    fx: 2.5,
    totalCap: null,
    accent: "#7A1F5C",
    perks: { lounges: 0, travelInsurance: false, note: "بدون مزايا سفر — بطاقة كاش باك صافية" },
    terms: "https://iz.com.sa/cashback-card",
    notes: [
      "١٪ ثابتة على المشتريات المحلية والدولية بدون سقف، وتشمل السحب من الصراف.",
      "مستثنى: الوقود، النقل العام، المواقف والجسور، المرافق، المدفوعات الحكومية والضرائب والغرامات، التأمين، الجمعيات الخيرية، معارض السيارات، والمتاجر المتنوعة.",
      "استثناء المتاجر المتنوعة (5331 و5399) واسع ويشمل كثيرًا من محلات التجزئة العامة.",
    ],
    rates: {
      fuel: { rate: 0, cap: null, excluded: true },
      dining: { rate: 0.01, cap: null },
      delivery: { rate: 0.01, cap: null },
      grocery: { rate: 0.01, cap: null },
      pharmacy: { rate: 0.01, cap: null },
      travel: { rate: 0.01, cap: null },
      education: { rate: 0.01, cap: null },
      intl: { rate: 0.01, cap: null },
      other: { rate: 0.01, cap: null },
    },
  },
];

/* ============================ محرّك الحساب ============================ */

function permutations(arr) {
  if (arr.length <= 1) return [arr];
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const p of permutations(rest)) out.push([arr[i], ...p]);
  }
  return out;
}
const LIFESTYLE_PERMS = permutations(["dining", "grocery", "travel", "pharmacy", "education"]);

function bestLifestyleRates(card, spend) {
  const gs = {
    dining: (spend.dining || 0) + (spend.delivery || 0),
    grocery: spend.grocery || 0,
    travel: spend.travel || 0,
    pharmacy: spend.pharmacy || 0,
    education: spend.education || 0,
  };
  let best = null;
  for (const perm of LIFESTYLE_PERMS) {
    let t = 0;
    for (let i = 0; i < perm.length; i++) {
      t += Math.min(gs[perm[i]] * card.tierRates[i], card.tierCap);
    }
    if (!best || t > best.total) best = { total: t, perm };
  }
  const rates = {};
  CATEGORIES.forEach((c) => (rates[c.id] = { rate: card.baseRate, cap: null }));
  best.perm.forEach((cat, i) => {
    rates[cat] = { rate: card.tierRates[i], cap: card.tierCap, capGroup: cat };
  });
  rates.delivery = { rate: rates.dining.rate, cap: card.tierCap, capGroup: "dining" };
  return { rates, allocation: best.perm };
}

function computeCard(card, spend) {
  let rates = card.rates;
  let allocation = null;
  if (card.dynamic) {
    const r = bestLifestyleRates(card, spend);
    rates = r.rates;
    allocation = r.allocation;
  }

  const rows = CATEGORIES.map((cat) => {
    const conf = rates[cat.id] || { rate: 0, cap: null };
    const amount = spend[cat.id] || 0;
    return {
      cat, amount, rate: conf.rate, excluded: !!conf.excluded, cap: conf.cap,
      group: conf.capGroup || cat.id, raw: amount * conf.rate, earned: amount * conf.rate,
    };
  });

  const groups = {};
  rows.forEach((r) => {
    if (r.cap == null) return;
    groups[r.group] = groups[r.group] || { cap: r.cap, raw: 0, rows: [] };
    groups[r.group].raw += r.raw;
    groups[r.group].rows.push(r);
  });
  let lostToCaps = 0;
  Object.values(groups).forEach((g) => {
    g.active = g.rows.filter((r) => r.rate > 0).length;
    g.hit = g.raw > g.cap + 1e-9;
    if (g.hit) {
      const f = g.cap / g.raw;
      g.rows.forEach((r) => { r.earned = r.raw * f; r.cappedGroup = g; });
      lostToCaps += g.raw - g.cap;
    } else {
      g.rows.forEach((r) => (r.cappedGroup = g));
    }
  });

  let monthly = rows.reduce((s, r) => s + r.earned, 0);
  let lostToTotalCap = 0;
  if (card.totalCap != null && monthly > card.totalCap) {
    const f = card.totalCap / monthly;
    rows.forEach((r) => (r.earned *= f));
    lostToTotalCap = monthly - card.totalCap;
    monthly = card.totalCap;
  }

  const monthlySpend = CATEGORIES.reduce((s, c) => s + (spend[c.id] || 0), 0);
  const feeWaived =
    card.feeWaiverAnnualSpend != null && monthlySpend * 12 >= card.feeWaiverAnnualSpend;
  return {
    card, rows, monthly, monthlySpend,
    effectiveFee: feeWaived ? 0 : card.fee,
    feeWaived,
    fxCost: ((spend.intl || 0) * card.fx) / 100,
    lostToCaps, lostToTotalCap, allocation,
  };
}

/* ---------------------- قيمة المزايا غير النقدية ---------------------- */
function perkValue(cardsUsed, opts) {
  if (!opts.on || !cardsUsed.length) return 0;
  const maxLounge = Math.max(0, ...cardsUsed.map((c) => c.perks.lounges || 0));
  const visits = Math.min(opts.visits || 0, maxLounge);
  const ins = cardsUsed.some((c) => c.perks.travelInsurance) ? opts.insurance || 0 : 0;
  return visits * (opts.visitValue || 0) + ins;
}

/* ---------------------- مُحسِّن الخليط (عدة بطاقات) ---------------------- */
function optimizeMix(cards, spend, fxOn, perkOpts) {
  const cats = CATEGORIES.filter((c) => (spend[c.id] || 0) > 0);
  if (!cards.length || !cats.length) return null;

  const cache = new Map();
  const run = (card, sub) => {
    const key = card.id + "|" + CATEGORIES.map((c) => sub[c.id] || 0).join(",");
    let v = cache.get(key);
    if (!v) { v = computeCard(card, sub); cache.set(key, v); }
    return v;
  };
  const subFor = (assign, cardId) => {
    const o = {};
    CATEGORIES.forEach((c) => (o[c.id] = assign[c.id] === cardId ? spend[c.id] || 0 : 0));
    return o;
  };
  const usedOf = (assign, pool) =>
    pool.filter((c) => cats.some((cat) => assign[cat.id] === c.id));

  const cashback = (assign, pool) => {
    let m = 0;
    for (const c of pool) {
      const sub = subFor(assign, c.id);
      if (!CATEGORIES.some((x) => sub[x.id] > 0)) continue;
      const r = run(c, sub);
      m += fxOn ? r.monthly - r.fxCost : r.monthly;
    }
    return m;
  };
  const netAnnual = (assign, pool) => {
    let m = 0, fees = 0;
    for (const c of pool) {
      const sub = subFor(assign, c.id);
      if (!CATEGORIES.some((x) => sub[x.id] > 0)) continue;
      const r = run(c, sub);
      m += fxOn ? r.monthly - r.fxCost : r.monthly;
      fees += r.effectiveFee;
    }
    return m * 12 - fees + perkValue(usedOf(assign, pool), perkOpts);
  };

  const build = (pool) => {
    const assign = {};
    const order = [...cats].sort((a, b) => (spend[b.id] || 0) - (spend[a.id] || 0));
    for (const cat of order) {
      let bestId = pool[0].id, bestV = -Infinity;
      for (const c of pool) {
        assign[cat.id] = c.id;
        const v = cashback(assign, pool);
        if (v > bestV + 1e-9) { bestV = v; bestId = c.id; }
      }
      assign[cat.id] = bestId;
    }
    for (let pass = 0; pass < 3; pass++) {
      let moved = false;
      for (const cat of cats) {
        const cur = assign[cat.id];
        let bestId = cur, bestV = cashback(assign, pool);
        for (const c of pool) {
          if (c.id === cur) continue;
          assign[cat.id] = c.id;
          const v = cashback(assign, pool);
          if (v > bestV + 1e-9) { bestV = v; bestId = c.id; }
        }
        assign[cat.id] = bestId;
        if (bestId !== cur) moved = true;
      }
      if (!moved) break;
    }
    return assign;
  };

  let pool = [...cards];
  let assign = build(pool);
  let net = netAnnual(assign, pool);

  // إسقاط أي بطاقة رسومها أكبر من إضافتها
  let go = true;
  while (go && pool.length > 1) {
    go = false;
    let best = null;
    for (const c of usedOf(assign, pool)) {
      const np = pool.filter((x) => x.id !== c.id);
      if (!np.length) continue;
      const na = build(np);
      const nn = netAnnual(na, np);
      if (nn > net + 1e-6 && (!best || nn > best.net)) best = { pool: np, assign: na, net: nn };
    }
    if (best) { pool = best.pool; assign = best.assign; net = best.net; go = true; }
  }

  const used = usedOf(assign, pool).map((c) => {
    const sub = subFor(assign, c.id);
    const r = run(c, sub);
    return {
      ...r,
      assigned: cats.filter((cat) => assign[cat.id] === c.id).map((cat) => cat.id),
      finalMonthly: fxOn ? r.monthly - r.fxCost : r.monthly,
    };
  }).sort((a, b) => b.finalMonthly - a.finalMonthly);

  return {
    used,
    unused: cards.filter((c) => !used.some((u) => u.card.id === c.id)),
    monthly: used.reduce((s, u) => s + u.finalMonthly, 0),
    fees: used.reduce((s, u) => s + u.effectiveFee, 0),
    perks: perkValue(used.map((u) => u.card), perkOpts),
    netAnnual: net,
  };
}


/* ============================================================================
   طبقة العرض — لا تمسّ أي حساب أعلاه
   ========================================================================== */

const nf = (n, d = 0) =>
  (Number.isFinite(n) ? n : 0).toLocaleString("en-US", {
    minimumFractionDigits: d, maximumFractionDigits: d,
  });
const pct = (r) => `${(r * 100) % 1 === 0 ? r * 100 : (r * 100).toFixed(2)}%`;
const catOf = (id) => CATEGORIES.find((x) => x.id === id);
const catLabel = (id) => catOf(id).label;
const STORE_KEY = "cashback:scenarios";
const MIX_THRESHOLD = 120; // أقل فرق سنوي يجعل تعدد البطاقات يستحق العناء

const reduceMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* رمز الريال السعودي الرسمي (SAMA) — يُوضع يسار الرقم بمسافة، وبارتفاع النص */
const RIYAL_D1 = "M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z";
const RIYAL_D2 = "M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z";
function Riyal({ className = "" }) {
  return (
    <svg className={`ryl ${className}`} viewBox="0 0 1124.14 1256.39" role="img" aria-label="ريال سعودي">
      <path d={RIYAL_D1} /><path d={RIYAL_D2} />
    </svg>
  );
}
function Amount({ value, dec = 0, prefix = "", className = "" }) {
  return (
    <span className={`amt ${className}`} dir="ltr">
      {prefix && <span className="amt-sign">{prefix}</span>}
      <Riyal />
      <span>{nf(value, dec)}</span>
    </span>
  );
}

/* أيقونات مضمّنة — بلا اعتماديات خارجية */
const ICONS = {
  Fuel: '<path d="M4 20V4a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v16"/><path d="M3 20h11"/><path d="M6 8h5"/><path d="M14 8h3a2 2 0 0 1 2 2v6a1.5 1.5 0 0 0 3 0v-6l-2.5-3"/>',
  UtensilsCrossed: '<path d="M6 3v6a3 3 0 0 0 6 0V3"/><path d="M9 12v9"/><path d="M18 3c-1.7 1.2-2.5 3-2.5 5.5 0 2 .8 3 2.5 3.5v9"/>',
  Bike: '<circle cx="6" cy="17" r="3.5"/><circle cx="18" cy="17" r="3.5"/><path d="M6 17l4-8h5"/><path d="M10 9l4 8"/><path d="M14 6h3"/>',
  ShoppingCart: '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h2.5l2.6 12.4a1.5 1.5 0 0 0 1.5 1.1h8.6a1.5 1.5 0 0 0 1.5-1.2L21 7H6"/>',
  Pill: '<path d="M11 3.5 3.5 11a4.95 4.95 0 0 0 7 7L18 10.5a4.95 4.95 0 0 0-7-7Z"/><path d="M7.5 7.5l7 7"/>',
  Plane: '<path d="M21.5 2.5 2 10l7 3 3 7 9.5-17.5Z"/><path d="M9 13l4.5-4.5"/>',
  GraduationCap: '<path d="M22 8 12 4 2 8l10 4 10-4Z"/><path d="M6 10.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-5.5"/>',
  Globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18"/>',
  Wallet: '<path d="M20 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6"/><path d="M17 13h.01"/>',
  CreditCard: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  SlidersHorizontal: '<path d="M3 7h11"/><path d="M18 7h3"/><circle cx="16" cy="7" r="2"/><path d="M3 17h5"/><path d="M12 17h9"/><circle cx="10" cy="17" r="2"/>',
  Bookmark: '<path d="M19 21 12 16 5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z"/>',
  X: '<path d="M18 6 6 18"/><path d="M6 6l12 12"/>',
  Sparkles: '<path d="M12 3 13.8 8.2 19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z"/><path d="M19 15v4"/><path d="M17 17h4"/>',
  RotateCcw: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  TrendingUp: '<path d="M22 7 13.5 15.5 8.5 10.5 2 17"/><path d="M16 7h6v6"/>',
  Layers: '<path d="M12 2 2 7l10 5 10-5Z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>',
  Check: '<path d="M20 6 9 17l-5-5"/>',
  AlertTriangle: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  Wand2: '<path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8 19 13"/><path d="M15 9h.01"/><path d="M17.8 6.2 19 5"/><path d="M3 21l9-9"/><path d="M12.2 6.2 11 5"/>',
  HelpCircle: '<circle cx="12" cy="12" r="9"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  ArrowUpDown: '<path d="M7 3v18"/><path d="M3 7l4-4 4 4"/><path d="M17 21V3"/><path d="M13 17l4 4 4-4"/>',
  ChevronLeft: '<path d="M15 18 9 12l6-6"/>',
  FileText: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h5"/>',
  Trash2: '<path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6"/><path d="M14 11v6"/>',
  ExternalLink: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  Calculator: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8"/><path d="M8 11h.01"/><path d="M12 11h.01"/><path d="M16 11h.01"/><path d="M8 15h.01"/><path d="M12 15h.01"/><path d="M16 15v4"/>',
  Circle: '<circle cx="12" cy="12" r="9"/>',
};

function Icon({ name, size = 18, className, strokeWidth = 1.6 }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round"
      className={className} aria-hidden="true" focusable="false"
      dangerouslySetInnerHTML={{ __html: ICONS[name] || ICONS.Circle }}
    />
  );
}

/* رقم يتحرّك بلطف عند تغيّر النتيجة */
function useCountUp(target, ms = 450) {
  const [v, setV] = useState(target);
  const cur = useRef(target);
  useEffect(() => {
    if (reduceMotion()) { cur.current = target; setV(target); return; }
    const from = cur.current, t0 = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / ms);
      const e = 1 - Math.pow(1 - p, 3);
      const val = from + (target - from) * e;
      cur.current = val; setV(val);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

/* مجموعات السقوف — الشكل الذي يفهمه المستخدم فعلًا */
function capGroupsOf(res) {
  const map = new Map();
  const loose = [];
  res.rows.forEach((r) => {
    if (r.amount <= 0) return;
    if (r.cap == null) {
      loose.push({
        key: r.cat.id, label: r.cat.label, icons: [r.cat.icon], rate: r.rate,
        earned: r.earned, cap: null, excluded: r.excluded, spend: r.amount,
      });
      return;
    }
    const g = r.cappedGroup;
    let e = map.get(r.group);
    if (!e) {
      e = { key: r.group, labels: [], icons: [], cap: r.cap, raw: g ? g.raw : 0,
            hit: g ? g.hit : false, earned: 0, rates: new Set(), spend: 0 };
      map.set(r.group, e);
    }
    e.labels.push(r.cat.label); e.icons.push(r.cat.icon);
    e.earned += r.earned; e.spend += r.amount; e.rates.add(r.rate);
  });
  const groups = [...map.values()].map((e) => {
    const rates = [...e.rates];
    const one = rates.length === 1 ? rates[0] : null;
    return {
      ...e,
      label: e.labels.join(" + "),
      shared: e.labels.length > 1,
      rate: one,
      lost: Math.max(0, e.raw - e.cap),
      stopAt: one > 0 ? e.cap / one : null,
      fill: Math.min(100, (e.raw / e.cap) * 100),
    };
  });
  return [...groups, ...loose].sort((a, b) => b.earned - a.earned);
}

/* سطر السبب — مبني على أرقام المستخدم لا على نص جاهز */
function reasonFor(res) {
  const top = res.rows.filter((r) => r.earned > 0.5)
    .sort((a, b) => b.earned - a.earned).slice(0, 2);
  const bits = [];
  if (top.length) bits.push(`أكبر عائد يجيك من ${top.map((r) => r.cat.label).join(" و")}`);
  if (res.card.fee === 0) bits.push("وبدون أي رسوم سنوية");
  else if (res.feeWaived) bits.push("ورسومها معفاة عند صرفك هذا");
  return bits.length ? bits.join("، ") + "." : "";
}

/* ------------------------------ عناصر أساسية ------------------------------ */

function Bar({ value, tone = "accent", height = 8, label }) {
  const w = Math.max(0, Math.min(100, value));
  const deco = tone === "ghost" || tone === "soft";
  return (
    <div className={`bar bar-${tone}`} style={{ height }}
      {...(deco
        ? { "aria-hidden": "true" }
        : { role: "progressbar", "aria-valuenow": Math.round(w), "aria-valuemin": 0,
            "aria-valuemax": 100, "aria-label": label })}>
      <span style={{ width: `${w}%` }} />
    </div>
  );
}

function Sheet({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title}
        onClick={(e) => e.stopPropagation()}>
        <div className="sheet-hd">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="إغلاق">
            <Icon name="X" size={19} />
          </button>
        </div>
        <div className="sheet-bd">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------ لوحة الصرف ------------------------------ */

function SpendingPanel({ spend, total, onChange, onSample, onReset }) {
  const focusNext = (i) => {
    const nxt = CATEGORIES[i + 1];
    const el = nxt && document.getElementById(`sp-${nxt.id}`);
    if (el) el.focus(); else document.activeElement && document.activeElement.blur();
  };
  return (
    <section className="panel" aria-label="صرفي الشهري">
      <header className="panel-hd">
        <div>
          <p className="eyebrow">الخطوة الأولى</p>
          <h2 className="panel-t">صرفي الشهري</h2>
          <p className="panel-hint">
            {total > 0
              ? "عدّل أي مبلغ والنتيجة تتحدث فورًا."
              : "اضغط على أي خانة واكتب مبلغك الشهري التقريبي — ما يحتاج دقة."}
          </p>
        </div>
        <div className="panel-total"><Amount value={total} /></div>
      </header>

      <div className="cats">
        {CATEGORIES.map((c, i) => {
          const v = spend[c.id] || 0;
          const share = total > 0 ? (v / total) * 100 : 0;
          return (
            <div className={`cat${v > 0 ? " has" : ""}`} key={c.id}>
              <label className="cat-main" htmlFor={`sp-${c.id}`}>
                <span className="cat-ic"><Icon name={c.icon} size={17} /></span>
                <span className="cat-lb">{c.label}</span>
                <span className="cat-in">
                  <input
                    id={`sp-${c.id}`} dir="ltr" inputMode="numeric" placeholder="0"
                    enterKeyHint={i < CATEGORIES.length - 1 ? "next" : "done"}
                    aria-label={`صرفك الشهري على ${c.label} بالريال`}
                    value={v === 0 ? "" : v}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => onChange(c.id, e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); focusNext(i); } }}
                  />
                  <Riyal className="cat-ryl" />
                </span>
              </label>
              <Bar value={share} tone="ghost" height={2} label={`نسبة ${c.label} من صرفك`} />
            </div>
          );
        })}
      </div>

      <div className="panel-ft">
        <button className="ghost-btn" onClick={onSample}>
          <Icon name="Sparkles" size={15} /> مثال جاهز
        </button>
        <button className="ghost-btn" onClick={onReset}>
          <Icon name="RotateCcw" size={15} /> تصفير
        </button>
      </div>
    </section>
  );
}

/* ------------------------------ الحكم ------------------------------ */

function Verdict({ view, single, mix, runnerUp, totalSpend }) {
  const isMix = view === "mix" && mix;
  const net = isMix ? mix.netAnnual : single.netAnnual;
  const monthly = isMix ? mix.monthly : single.finalMonthly;
  const fees = isMix ? mix.fees : single.effectiveFee;
  const perks = isMix ? mix.perks : single.perks;
  const shown = useCountUp(Math.round(net));
  const effRate = totalSpend > 0 ? monthly / totalSpend : 0;

  return (
    <section className="verdict" aria-label="النتيجة">
      <p className="eyebrow on-dark">
        {isMix ? `أفضل توزيع لك — ${mix.used.length} بطاقات` : "أفضل بطاقة لك"}
      </p>
      {isMix ? (
        <div className="v-mixnames">
          {mix.used.map((u) => (
            <span className="v-mixname" key={u.card.id}>
              <i style={{ background: u.card.accent }} />
              {u.card.short}
            </span>
          ))}
        </div>
      ) : (
        <h2 className="v-name">
          <span className="v-line"><i className="v-dot" style={{ background: single.card.accent }} />{single.card.name}</span>
          <small>{single.card.issuer} · {single.card.kind}</small>
        </h2>
      )}

      <div className="v-hero">
        <Amount value={shown} className="v-num" />
        <span className="v-unit">صافي في السنة</span>
      </div>

      <div className="v-break">
        <div className="v-cell">
          <span className="v-k">كاش باك</span>
          <b className="pos"><Amount value={monthly * 12} prefix="+" /></b>
        </div>
        {perks > 0 && (
          <div className="v-cell">
            <span className="v-k">مزايا</span>
            <b className="pos"><Amount value={perks} prefix="+" /></b>
          </div>
        )}
        <div className="v-cell">
          <span className="v-k">رسوم</span>
          <b className={fees > 0 ? "neg" : ""}>{fees > 0 ? <Amount value={fees} prefix="−" /> : "بدون"}</b>
        </div>
        <div className="v-cell">
          <span className="v-k">شهريًا</span>
          <b><Amount value={monthly} /></b>
        </div>
      </div>

      <div className="v-foot">
        <div className="v-rate">
          <span className="v-ratev">{(effRate * 100).toFixed(2)}%</span>
          <span className="v-ratek">عائدك الفعلي على كل صرفك — لا النسبة المعلنة</span>
        </div>
        {!isMix && reasonFor(single) && <p className="v-why">{reasonFor(single)}</p>}
        {!isMix && runnerUp && single.netAnnual - runnerUp.netAnnual > 1 && (
          <p className="v-gap">
            <Icon name="TrendingUp" size={14} />
            تسبق {runnerUp.card.short} بـ <Amount value={single.netAnnual - runnerUp.netAnnual} /> سنويًا
          </p>
        )}
      </div>
    </section>
  );
}

/* --------------------- قرار: بطاقة واحدة أم توزيع؟ --------------------- */

function MixCallout({ mix, single, view, onView }) {
  if (!mix || !single) return null;
  const gain = mix.netAnnual - single.netAnnual;
  const worth = gain >= MIX_THRESHOLD && mix.used.length > 1;

  return (
    <div className={`callout${worth ? " good" : ""}`}>
      <span className="callout-ic">
        <Icon name={worth ? "Layers" : "Check"} size={17} />
      </span>
      <div className="callout-tx">
        <b>{worth ? `${mix.used.length} بطاقات تعطيك أكثر` : "بطاقة واحدة تكفيك"}</b>
        <p>
          {worth
            ? <>توزيع صرفك يزيدك <Amount value={gain} /> سنويًا على استخدام {single.card.short} وحدها.</>
            : gain > 1
            ? <>توزيع صرفك على أكثر من بطاقة يزيدك <Amount value={gain} /> فقط سنويًا — ما يستاهل التعب.</>
            : `ما فيه توزيع يتفوق على ${single.card.short} وحدها.`}
        </p>
      </div>
      {mix.used.length > 1 && gain > 1 && (
        <button className="callout-btn" onClick={() => onView(view === "mix" ? "single" : "mix")}>
          {view === "mix" ? "أرني بطاقة واحدة" : "شوف التوزيع"}
        </button>
      )}
    </div>
  );
}

/* ------------------------------ ليش؟ ------------------------------ */

function CapRow({ g, accent }) {
  const capped = g.cap != null;
  return (
    <li className={`cap${g.hit ? " hit" : ""}`}>
      <div className="cap-hd">
        <span className="cap-ics">
          {g.icons.slice(0, 2).map((n, i) => <Icon key={i} name={n} size={15} />)}
        </span>
        <span className="cap-lb">
          {g.label}
          {g.shared && <em className="cap-tag">سقف مشترك</em>}
        </span>
        <span className="cap-v">
          {g.excluded ? <em className="cap-out">مستثناة</em> : <Amount value={g.earned} dec={1} />}
        </span>
      </div>
      {capped ? (
        <>
          <Bar value={g.fill} tone={g.hit ? "warn" : "accent"} label={`استهلاك سقف ${g.label}`} />
          <div className="cap-ft">
            <span>
              {g.rate != null && <b>{pct(g.rate)}</b>} {nf(Math.min(g.raw, g.cap), 0)} من <Amount value={g.cap} />
            </span>
            {g.hit ? (
              <span className="cap-loss">
                <Icon name="AlertTriangle" size={13} /> فاتك <Amount value={g.lost} />
              </span>
            ) : g.stopAt ? (
              <span>يقف عند صرف <Amount value={g.stopAt} /></span>
            ) : null}
          </div>
        </>
      ) : (
        <div className="cap-ft loose">
          <span>{g.excluded ? "ما تعطي كاش باك على هذي البطاقة" : `${pct(g.rate)} بدون سقف`}</span>
        </div>
      )}
    </li>
  );
}

function WhyPanel({ res, accent, allocation }) {
  const groups = useMemo(() => capGroupsOf(res), [res]);
  const totalLost = res.lostToCaps + res.lostToTotalCap;
  return (
    <div className="why">
      {totalLost > 0.5 && (
        <div className="lossbox">
          <Icon name="AlertTriangle" size={17} />
          <div>
            <b>فاتك <Amount value={totalLost} /> هذا الشهر بسبب السقوف</b>
            <p>
              الصرف فوق السقف ما يعطي كاش باك — وهذا سبب أن النسبة المعلنة أعلى من عائدك الفعلي.
              {res.lostToTotalCap > 0.5 &&
                ` منها ${nf(res.lostToTotalCap, 0)} ريال بسبب السقف الإجمالي (${nf(res.card.totalCap)} شهريًا).`}
            </p>
          </div>
        </div>
      )}

      {allocation && (
        <div className="allocbox">
          <Icon name="Wand2" size={16} />
          <div>
            <b>اخترنا لك أفضل توزيع للفئات</b>
            <div className="alloc-pills">
              {allocation.map((id, i) => (
                <span className="pill" key={id}>
                  {catLabel(id)} <b>{i === 0 ? "١٠٪" : i < 3 ? "٣٪" : "٢٪"}</b>
                </span>
              ))}
            </div>
            <p>طبّقه يدويًا من تطبيق البنك في بداية الشهر.</p>
          </div>
        </div>
      )}

      <ul className="caps">
        {groups.map((g) => <CapRow key={g.key} g={g} accent={accent} />)}
      </ul>
    </div>
  );
}

/* ------------------------------ البدائل ------------------------------ */

function AltRow({ res, rank, best, onOpen }) {
  const gap = best.netAnnual - res.netAnnual;
  const share = best.netAnnual > 0 ? Math.max(0, (res.netAnnual / best.netAnnual) * 100) : 0;
  return (
    <button className="alt" onClick={onOpen}>
      <span className="alt-rank">{rank}</span>
      <span className="alt-body">
        <span className="alt-top">
          <i className="v-dot sm" style={{ background: res.card.accent }} />
          <span className="alt-name">{res.card.name}</span>
          <span className={`alt-net${res.netAnnual < 0 ? " neg" : ""}`}><Amount value={res.netAnnual} /></span>
        </span>
        <Bar value={share} tone="soft" height={4} label={`${res.card.name} مقارنة بالأفضل`} />
        <span className="alt-meta">
          <span><Amount value={res.finalMonthly} /> شهريًا</span>
          <span className="dot">·</span>
          <span>
            {res.card.fee === 0 ? "بدون رسوم" : res.feeWaived ? "رسوم معفاة" : `رسوم ${nf(res.effectiveFee)}`}
          </span>
          {gap > 1 && <><span className="dot">·</span><span className="alt-gap"><Amount value={gap} prefix="−" /> سنويًا</span></>}
        </span>
      </span>
      <Icon name="ChevronLeft" size={17} className="alt-arrow" />
    </button>
  );
}

/* ------------------------------ التطبيق ------------------------------ */

export default function CashbackCalculator() {
  const [spend, setSpend] = useState(() => Object.fromEntries(CATEGORIES.map((c) => [c.id, 0])));
  const [view, setView] = useState(null); // null = دع المنتج يقرر
  const [fxOn, setFxOn] = useState(false);
  const [perkOpts, setPerkOpts] = useState({ on: false, visits: 4, visitValue: 150, insurance: 250 });
  const [hidden, setHidden] = useState({});
  const [sheet, setSheet] = useState(null); // options | scenarios | card:<id>
  const [scenarios, setScenarios] = useState([]);
  const [scenName, setScenName] = useState("");
  const [storeMsg, setStoreMsg] = useState("");

  const visibleCards = useMemo(() => CARDS.filter((c) => !hidden[c.id]), [hidden]);
  const total = CATEGORIES.reduce((s, c) => s + (spend[c.id] || 0), 0);
  const ready = total > 0 && visibleCards.length > 0;

  /* ---- حسابات (المنطق كما هو) ---- */
  const singles = useMemo(() => {
    const r = visibleCards.map((c) => computeCard(c, spend));
    r.forEach((x) => {
      x.finalMonthly = fxOn ? x.monthly - x.fxCost : x.monthly;
      x.perks = perkValue([x.card], perkOpts);
      x.netAnnual = x.finalMonthly * 12 - x.effectiveFee + x.perks;
      x.breakeven = x.effectiveFee === 0 ? 0
        : x.finalMonthly > 0 ? Math.ceil(x.effectiveFee / x.finalMonthly) : null;
    });
    return r.sort((a, b) => b.netAnnual - a.netAnnual);
  }, [visibleCards, spend, fxOn, perkOpts]);

  const mix = useMemo(
    () => (ready && visibleCards.length > 1 ? optimizeMix(visibleCards, spend, fxOn, perkOpts) : null),
    [ready, visibleCards, spend, fxOn, perkOpts]
  );

  const best = singles[0];
  const runnerUp = singles[1];
  const recommend =
    mix && best && mix.netAnnual - best.netAnnual >= MIX_THRESHOLD && mix.used.length > 1
      ? "mix" : "single";
  const effView = view || recommend;

  /* ---- سيناريوهات ---- */
  useEffect(() => {
    let alive = true;
    (async () => {
      if (typeof window === "undefined" || !window.localStorage) return;
      try {
        const raw = window.localStorage.getItem(STORE_KEY);
        if (alive && raw) setScenarios(JSON.parse(raw));
      } catch { if (alive) setScenarios([]); }
    })();
    return () => { alive = false; };
  }, []);

  const persist = async (next) => {
    setScenarios(next);
    if (typeof window === "undefined" || !window.localStorage) {
      setStoreMsg("الحفظ غير متاح في هذا المتصفح."); return;
    }
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(next)); setStoreMsg(""); }
    catch { setStoreMsg("ما نجح الحفظ — قد تكون مساحة المتصفح ممتلئة."); }
  };
  const saveScenario = () => {
    const name = scenName.trim() || `سيناريو ${scenarios.length + 1}`;
    const entry = { id: Date.now(), name, spend, mode: effView, fxOn, perkOpts, hidden };
    persist([entry, ...scenarios.filter((s) => s.name !== name)].slice(0, 12));
    setScenName("");
  };
  const loadScenario = (s) => {
    setSpend(s.spend); setView(null); setFxOn(!!s.fxOn);
    setPerkOpts(s.perkOpts || { on: false, visits: 4, visitValue: 150, insurance: 250 });
    setHidden(s.hidden || {}); setSheet(null);
  };
  const scenarioPreview = useCallback((s) => {
    const cards = CARDS.filter((c) => !(s.hidden || {})[c.id]);
    const tot = CATEGORIES.reduce((a, c) => a + (s.spend[c.id] || 0), 0);
    if (!cards.length || !tot) return { tot, best: null, net: 0 };
    const rs = cards.map((c) => {
      const r = computeCard(c, s.spend);
      const m = s.fxOn ? r.monthly - r.fxCost : r.monthly;
      return { c, net: m * 12 - r.effectiveFee + perkValue([c], s.perkOpts || { on: false }) };
    }).sort((a, b) => b.net - a.net);
    return { tot, best: rs[0].c, net: rs[0].net };
  }, []);

  /* ---- إدخال ---- */
  const setVal = (id, v) => {
    const n = v.replace(/[^\d.]/g, "");
    setSpend((s) => ({ ...s, [id]: n === "" ? 0 : parseFloat(n) || 0 }));
  };
  const setPerk = (k, v) =>
    setPerkOpts((p) => ({ ...p, [k]: v === "" ? 0 : parseFloat(String(v).replace(/[^\d.]/g, "")) || 0 }));

  const sheetCard = sheet && sheet.startsWith("card:")
    ? singles.find((r) => r.card.id === sheet.slice(5)) : null;
  const advOn = fxOn || perkOpts.on || Object.values(hidden).some(Boolean);

  return (
    <div dir="rtl" className="app">
      <style>{CSS}</style>

      <header className="topbar">
        <div className="brand">
          <Icon name="CreditCard" size={19} />
          <span>مردود | حاسبة الكاش باك</span>
        </div>
        <div className="topbar-act">
          <button className={`icon-btn${advOn ? " on" : ""}`} onClick={() => setSheet("options")}
            aria-label="خيارات متقدمة">
            <Icon name="SlidersHorizontal" size={18} />
          </button>
          <button className="icon-btn" onClick={() => setSheet("scenarios")} aria-label="سيناريوهاتي">
            <Icon name="Bookmark" size={18} />
          </button>
        </div>
      </header>

      <main className="stage">
        <div className="col-input">
          <SpendingPanel
            spend={spend} total={total} onChange={setVal}
            onSample={() => setSpend(SAMPLE)}
            onReset={() => setSpend(Object.fromEntries(CATEGORIES.map((c) => [c.id, 0])))}
          />
        </div>

        <div className="col-result">
          {!ready ? (
            <div className="empty">
              <Icon name="Calculator" size={26} />
              <b>عبّي صرفك الشهري</b>
              <p>
                نحسب لك العائد الحقيقي لكل بطاقة بعد السقوف والرسوم والاستثناءات — لا النسبة
                المعلنة على الإعلان.
              </p>
            </div>
          ) : (
            <>
              <Verdict view={effView} single={best} mix={mix} runnerUp={runnerUp} totalSpend={total} />
              <MixCallout mix={mix} single={best} view={effView} onView={setView} />

              <section className="block">
                <h3 className="block-t">
                  <Icon name="HelpCircle" size={17} />
                  {effView === "mix" ? "كيف يتوزع صرفك" : "ليش هذي البطاقة؟"}
                </h3>

                {effView === "mix" ? (
                  <div className="mixlist">
                    {mix.used.map((u) => (
                      <div className="mixcard" key={u.card.id}>
                        <div className="mixcard-hd">
                          <i className="v-dot sm" style={{ background: u.card.accent }} />
                          <b>{u.card.name}</b>
                          <span className="mixcard-n"><Amount value={u.finalMonthly} /> / شهر</span>
                        </div>
                        <div className="alloc-pills">
                          {u.assigned.map((id) => (
                            <span className="pill" key={id}>
                              <Icon name={catOf(id).icon} size={13} /> {catLabel(id)}
                            </span>
                          ))}
                        </div>
                        {u.lostToCaps + u.lostToTotalCap > 0.5 && (
                          <p className="mixcard-loss">
                            <Icon name="AlertTriangle" size={13} />
                            فاتك <Amount value={u.lostToCaps + u.lostToTotalCap} /> بسبب سقوفها
                          </p>
                        )}
                      </div>
                    ))}
                    {mix.unused.length > 0 && (
                      <p className="mixout">
                        خارج التوزيع: {mix.unused.map((c) => c.short).join("، ")} — رسومها أكبر من
                        إضافتها، أو تتفوق عليها بطاقة أخرى في كل فئة.
                      </p>
                    )}
                  </div>
                ) : (
                  <WhyPanel res={best} accent={best.card.accent} allocation={best.allocation} />
                )}
              </section>

              <section className="block">
                {singles.length > 1 && (
                  <>
                    <h3 className="block-t">
                      <Icon name="ArrowUpDown" size={17} /> البدائل
                    </h3>
                    <div className="alts">
                      {singles.slice(1).map((r, i) => (
                        <AltRow key={r.card.id} res={r} rank={i + 2} best={best}
                          onOpen={() => setSheet(`card:${r.card.id}`)} />
                      ))}
                    </div>
                  </>
                )}
                <button className="ghost-btn wide" onClick={() => setSheet(`card:${best.card.id}`)}
                  style={singles.length > 1 ? undefined : { marginTop: 0 }}>
                  <Icon name="FileText" size={15} /> تفاصيل وشروط {best.card.short}
                </button>
              </section>

              <p className="disc">
                الكاش باك الفعلي يعتمد على تصنيف التاجر (MCC) لا على اسمه، والبنوك تعدّل النسب
                والسقوف بإشعار مسبق. الحساب يفترض أنك تسدد فاتورتك كاملة كل شهر.
              </p>
            </>
          )}
        </div>
      </main>

      {/* ---------------- لوح الخيارات ---------------- */}
      <Sheet open={sheet === "options"} onClose={() => setSheet(null)} title="خيارات متقدمة">
        <label className="opt">
          <input type="checkbox" checked={fxOn} onChange={(e) => setFxOn(e.target.checked)} />
          <span>
            <b>اخصم رسوم العمليات الدولية</b>
            <em>١٫٩٩٪–٢٫٨٥٪ حسب البطاقة، وغالبًا تبتلع عائد الشراء الدولي كاملًا.</em>
          </span>
        </label>

        <label className="opt">
          <input type="checkbox" checked={perkOpts.on}
            onChange={(e) => setPerkOpts((p) => ({ ...p, on: e.target.checked }))} />
          <span>
            <b>احسب المزايا غير النقدية</b>
            <em>صالات المطارات وتأمين السفر تُضاف للصافي بقيمتها عندك أنت.</em>
          </span>
        </label>

        {perkOpts.on && (
          <div className="opt-sub">
            {[["visits", "زيارات الصالات سنويًا"], ["visitValue", "قيمة الزيارة الواحدة"],
              ["insurance", "قيمة تأمين السفر سنويًا"]].map(([k, lb]) => (
              <div className="field" key={k}>
                <label htmlFor={`pk-${k}`}>{lb}</label>
                <input id={`pk-${k}`} dir="ltr" inputMode="numeric" value={perkOpts[k]}
                  onFocus={(e) => e.target.select()} onChange={(e) => setPerk(k, e.target.value)} />
              </div>
            ))}
            <p className="hint">
              في التوزيع تُحسب الصالات مرة واحدة بأعلى بطاقة — لأنك تدخل الصالة ببطاقة وحدة.
            </p>
          </div>
        )}

        <div className="opt-head">
          <b>البطاقات المشمولة</b>
          {visibleCards.length < CARDS.length && (
            <button className="lnk" onClick={() => setHidden({})}>إظهار الكل</button>
          )}
        </div>
        {CARDS.map((c) => {
          const on = !hidden[c.id];
          return (
            <label className={`pickrow${on ? "" : " off"}`} key={c.id}>
              <input type="checkbox" checked={on}
                onChange={() => setHidden((h) => ({ ...h, [c.id]: on }))} />
              <i className="v-dot sm" style={{ background: c.accent }} />
              <span>
                <b>{c.short}</b>
                <em>{c.kind}</em>
              </span>
            </label>
          );
        })}
      </Sheet>

      {/* ---------------- لوح السيناريوهات ---------------- */}
      <Sheet open={sheet === "scenarios"} onClose={() => setSheet(null)} title="سيناريوهاتي">
        <p className="hint top">
          احفظ حالتك الحالية باسم — «مصروفي اليوم»، «بعد الزواج»، «شهر السفر» — وقارن بينها لاحقًا.
        </p>
        <div className="saverow">
          <input value={scenName} placeholder="اسم السيناريو"
            onChange={(e) => setScenName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ready && saveScenario()} />
          <button className="solid-btn" onClick={saveScenario} disabled={!ready}>احفظ</button>
        </div>
        {storeMsg && <p className="err">{storeMsg}</p>}
        {scenarios.length === 0 ? (
          <p className="hint">ما فيه سيناريوهات محفوظة بعد.</p>
        ) : (
          scenarios.map((s) => {
            const p = scenarioPreview(s);
            return (
              <div className="scen" key={s.id}>
                <button className="scen-main" onClick={() => loadScenario(s)}>
                  <b>{s.name}</b>
                  <span>
                    <Amount value={p.tot} /> شهريًا
                    {p.best && <> · {p.best.short}</>}
                  </span>
                </button>
                <span className="scen-net"><Amount value={p.net} /></span>
                <button className="icon-btn sm" onClick={() => persist(scenarios.filter((x) => x.id !== s.id))}
                  aria-label={`حذف ${s.name}`}>
                  <Icon name="Trash2" size={16} />
                </button>
              </div>
            );
          })
        )}
      </Sheet>

      {/* ---------------- لوح تفاصيل بطاقة ---------------- */}
      <Sheet open={!!sheetCard} onClose={() => setSheet(null)} title={sheetCard ? sheetCard.card.name : ""}>
        {sheetCard && (
          <>
            <div className="cardhead">
              <i className="v-dot" style={{ background: sheetCard.card.accent }} />
              <div>
                <b>{sheetCard.card.issuer}</b>
                <em>{sheetCard.card.kind}</em>
              </div>
            </div>
            <div className="statrow">
              <div><span>شهريًا</span><b><Amount value={sheetCard.finalMonthly} /></b></div>
              <div><span>صافي سنوي</span><b><Amount value={sheetCard.netAnnual} /></b></div>
              <div>
                <span>تغطية الرسوم</span>
                <b>
                  {sheetCard.breakeven === 0 ? "—"
                    : sheetCard.breakeven == null ? "—"
                    : sheetCard.breakeven > 12 ? "أكثر من سنة" : `${sheetCard.breakeven} شهر`}
                </b>
              </div>
            </div>
            <WhyPanel res={sheetCard} accent={sheetCard.card.accent} allocation={sheetCard.allocation} />
            {perkOpts.on && (
              <p className="hint">المزايا: {sheetCard.card.perks.note} — قدّرناها بـ <Amount value={sheetCard.perks} /> سنويًا.</p>
            )}
            <ul className="notes">
              {sheetCard.card.notes.map((n, i) => <li key={i}>{n}</li>)}
              <li>{sheetCard.card.feeNote}</li>
            </ul>
            <a className="termslink" href={sheetCard.card.terms} target="_blank" rel="noreferrer">
              الشروط والأحكام <Icon name="ExternalLink" size={14} />
            </a>
          </>
        )}
      </Sheet>
    </div>
  );
}

/* ============================================================================
   نظام التصميم — موبايل أولًا، ثم تكبير
   ========================================================================== */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap');

.app{
  /* اللون: حبر + لون عائد واحد. ألوان البنوك نقاط هوية فقط */
  --page:#EFF1F2; --surface:#FFFFFF; --raised:#F7F9FA; --sunken:#E7EBED;
  --ink:#0D1117; --ink2:#39434D; --muted:#68737E; --faint:#98A2AB;
  --line:#E2E7EA; --line2:#EDF0F2;
  --accent:#0A6E52; --accent-2:#0E8A67; --accent-soft:#E6F1EC; --accent-line:#BFDDD1;
  --warn:#9E3B22; --warn-soft:#FBEDE8; --warn-line:#EFCFC4;
  --focus:#1D6FE0;
  --dark:#0F1A17;

  /* فراغ */
  --s1:4px; --s2:8px; --s3:12px; --s4:16px; --s5:22px; --s6:32px;
  /* استدارة */
  --r1:10px; --r2:14px; --r3:20px; --rp:999px;

  font-family:'IBM Plex Sans Arabic',system-ui,'Segoe UI',Tahoma,sans-serif;
  background:var(--page); color:var(--ink);
  font-variant-numeric:tabular-nums; font-feature-settings:"tnum";
  -webkit-font-smoothing:antialiased; text-rendering:optimizeLegibility;
  min-height:100dvh; padding-bottom:var(--s6);
}
.app *{box-sizing:border-box}
.app button{font:inherit;color:var(--ink)}
.app input{font:inherit}
.app :focus-visible{outline:2px solid var(--focus);outline-offset:2px;border-radius:6px}

/* ------------------------------ الريال والمبالغ ------------------------------ */
.ryl{height:.8em;width:auto;fill:currentColor;display:inline-block;vertical-align:-.04em;
  flex-shrink:0}
.amt{display:inline-flex;align-items:baseline;gap:.24em;white-space:nowrap;
  unicode-bidi:isolate}
.amt-sign{margin-inline-end:-.08em}
.v-num.amt{gap:.18em}
.v-num .ryl{height:.62em;vertical-align:0;align-self:center;fill:rgba(255,255,255,.85)}

/* ------------------------------ شريط علوي ------------------------------ */
.topbar{position:sticky;top:0;z-index:30;display:flex;align-items:center;
  justify-content:space-between;gap:var(--s3);padding:10px var(--s4);
  background:rgba(239,241,242,.9);backdrop-filter:blur(12px);
  border-bottom:1px solid var(--line)}
.brand{display:flex;align-items:center;gap:var(--s2);font-size:15px;font-weight:700;
  letter-spacing:-.01em}
.brand svg{color:var(--accent)}
.topbar-act{display:flex;gap:var(--s2)}
.icon-btn{display:grid;place-items:center;width:42px;height:42px;border-radius:var(--r1);
  background:var(--surface);border:1px solid var(--line);color:var(--ink2);cursor:pointer;
  transition:background .15s,border-color .15s,color .15s}
.icon-btn:hover{border-color:var(--faint);color:var(--ink)}
.icon-btn.on{background:var(--accent-soft);border-color:var(--accent-line);color:var(--accent)}
.icon-btn.sm{width:36px;height:36px;background:none;border:none;color:var(--faint)}
.icon-btn.sm:hover{color:var(--warn)}

/* ------------------------------ التخطيط ------------------------------ */
.stage{padding:var(--s4);display:flex;flex-direction:column;gap:var(--s4);
  max-width:1240px;margin:0 auto}
.col-input,.col-result{display:flex;flex-direction:column;gap:var(--s4);min-width:0}

/* ------------------------------ نصوص مشتركة ------------------------------ */
.eyebrow{font-size:11px;font-weight:600;letter-spacing:.06em;color:var(--muted);
  margin:0 0 3px;text-transform:none}
.eyebrow.on-dark{color:rgba(255,255,255,.62)}
.block{background:var(--surface);border:1px solid var(--line);border-radius:var(--r3);
  padding:var(--s4)}
.block-t{display:flex;align-items:center;gap:var(--s2);font-size:14px;font-weight:600;
  margin:0 0 var(--s4);color:var(--ink)}
.block-t svg{color:var(--muted)}
.disc{font-size:11.5px;line-height:1.85;color:var(--faint);margin:0;padding:0 var(--s2)}

/* ------------------------------ لوحة الصرف ------------------------------ */
.panel{background:var(--surface);border:1px solid var(--line);border-radius:var(--r3);
  overflow:hidden}
.panel-hd{display:flex;align-items:flex-end;justify-content:space-between;gap:var(--s3);
  padding:var(--s4) var(--s4) var(--s3)}
.panel-t{font-size:17px;font-weight:700;margin:0;letter-spacing:-.015em}
.panel-total{display:flex;align-items:baseline;gap:4px;color:var(--ink)}
.panel-total b{font-size:22px;font-weight:700;letter-spacing:-.02em}
.panel-total span{font-size:12px;color:var(--muted)}
.cats{border-top:1px solid var(--line2)}
.cat{border-bottom:1px solid var(--line2)}
.cat:last-child{border-bottom:none}
.panel-hint{font-size:12px;line-height:1.7;color:var(--muted);margin:5px 0 0}
.cat-main{display:flex;align-items:center;gap:var(--s3);padding:8px var(--s4);
  min-height:62px;cursor:text;transition:background .12s}
.cat-main:hover{background:var(--raised)}
.cat-ic{display:grid;place-items:center;width:34px;height:34px;border-radius:var(--r1);
  background:var(--raised);color:var(--faint);flex-shrink:0;transition:.15s}
.cat.has .cat-ic{background:var(--accent-soft);color:var(--accent)}
.cat-lb{flex:1;font-size:13.5px;color:var(--muted);line-height:1.4;transition:.15s;min-width:0}
.cat.has .cat-lb{color:var(--ink);font-weight:500}

/* الخانة: صندوق واضح، عملة داخلية، قلم يختفي عند الكتابة */
.cat-in{position:relative;direction:ltr;flex-shrink:0}
.cat-in input{width:134px;height:46px;padding:0 12px 0 32px;text-align:right;
  border:1.5px solid var(--line);border-radius:var(--r1);background:var(--raised);
  font-size:18px;font-weight:600;color:var(--ink);letter-spacing:-.01em;
  transition:border-color .15s,background .15s,box-shadow .15s;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.7)}
.cat-in input::placeholder{color:#A9B2BA;font-weight:500}
.cat-in input:hover{border-color:var(--faint);background:#fff}
.cat-in input:focus{outline:none;border-color:var(--accent);background:#fff;
  box-shadow:0 0 0 3px var(--accent-soft)}
.cat-ryl{position:absolute;left:12px;top:50%;transform:translateY(-50%);
  height:13px;width:auto;fill:var(--faint);pointer-events:none;transition:fill .15s}
.cat.has .cat-ryl,.cat-in input:focus~.cat-ryl{fill:var(--accent)}
.cat.has .cat-in input{border-color:var(--accent-line);background:#fff}
.panel-ft{display:flex;gap:var(--s2);padding:var(--s3) var(--s4);border-top:1px solid var(--line2);
  background:var(--raised)}

.ghost-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;
  min-height:40px;padding:0 14px;border-radius:var(--r1);background:var(--surface);
  border:1px solid var(--line);font-size:12.5px;color:var(--ink2);cursor:pointer;
  transition:border-color .15s,color .15s}
.ghost-btn:hover{border-color:var(--faint);color:var(--ink)}
.ghost-btn.wide{width:100%;margin-top:var(--s3)}
.app .solid-btn{min-height:42px;padding:0 18px;border-radius:var(--r1);background:var(--ink);
  color:#fff;border:none;font-size:13px;font-weight:500;cursor:pointer}
.app .solid-btn:disabled{background:#C3CAD0;cursor:default}
.lnk{background:none;border:none;padding:4px 0;font-size:12.5px;color:var(--muted);
  cursor:pointer;text-decoration:underline;text-underline-offset:3px}
.lnk:hover{color:var(--ink)}

/* ------------------------------ الحكم ------------------------------ */
.verdict{background:var(--dark);color:#fff;border-radius:var(--r3);padding:var(--s5) var(--s4);
  position:relative;overflow:hidden}
.verdict::after{content:"";position:absolute;inset-block:0;inset-inline-start:0;width:3px;
  background:linear-gradient(180deg,var(--accent-2),transparent)}
.v-name{font-size:19px;font-weight:700;margin:0;letter-spacing:-.02em;line-height:1.35}
.v-line{display:flex;align-items:center;gap:var(--s2)}
.v-name small{display:block;font-size:12px;font-weight:400;color:rgba(255,255,255,.5);
  letter-spacing:0;margin-top:3px;padding-inline-start:17px}
.v-dot{width:9px;height:9px;border-radius:3px;flex-shrink:0;display:inline-block}
.v-dot.sm{width:7px;height:7px;border-radius:2px}
.v-mixnames{display:flex;flex-wrap:wrap;gap:var(--s2)}
.v-mixname{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:600;
  background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.13);
  padding:5px 11px;border-radius:var(--rp)}
.v-mixname i{width:7px;height:7px;border-radius:2px}

.v-hero{display:flex;flex-direction:column;margin:var(--s4) 0 var(--s4)}
.v-num{font-size:clamp(44px,14vw,58px);font-weight:700;line-height:.95;letter-spacing:-.035em;
  color:#fff}
.v-unit{font-size:12.5px;color:rgba(255,255,255,.55);margin-top:7px}

.v-break{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:rgba(255,255,255,.1);
  border:1px solid rgba(255,255,255,.1);border-radius:var(--r2);overflow:hidden}
.v-cell{background:var(--dark);padding:11px var(--s3);display:flex;flex-direction:column;gap:3px}
.v-k{font-size:10.5px;color:rgba(255,255,255,.5)}
.v-cell b{font-size:15px;font-weight:600;color:rgba(255,255,255,.92)}
.v-cell b.pos{color:#6ADFB4}
.v-cell b.neg{color:#F0A392}

.v-foot{margin-top:var(--s4);padding-top:var(--s4);border-top:1px solid rgba(255,255,255,.11)}
.v-rate{display:flex;align-items:baseline;gap:var(--s2);flex-wrap:wrap}
.v-ratev{font-size:24px;font-weight:700;color:#6ADFB4;letter-spacing:-.02em}
.v-ratek{font-size:11.5px;color:rgba(255,255,255,.55);line-height:1.6;flex:1;min-width:150px}
.v-why{font-size:13px;line-height:1.75;color:rgba(255,255,255,.78);margin:var(--s3) 0 0}
.v-gap{display:flex;align-items:center;gap:6px;font-size:12px;color:#6ADFB4;
  margin:var(--s2) 0 0}

/* ------------------------------ قرار التوزيع ------------------------------ */
.callout{display:flex;flex-wrap:wrap;align-items:flex-start;gap:var(--s3);
  background:var(--surface);border:1px solid var(--line);border-radius:var(--r3);
  padding:var(--s4)}
.callout.good{background:var(--accent-soft);border-color:var(--accent-line)}
.callout-ic{display:grid;place-items:center;width:34px;height:34px;border-radius:var(--r1);
  background:var(--raised);color:var(--muted);flex-shrink:0}
.callout.good .callout-ic{background:#fff;color:var(--accent)}
.callout-tx{flex:1;min-width:170px}
.callout-tx b{display:block;font-size:14px;font-weight:600;margin-bottom:3px}
.callout-tx p{font-size:12.5px;line-height:1.7;color:var(--muted);margin:0}
.callout.good .callout-tx p{color:#3D6357}
.app .callout-btn{min-height:40px;padding:0 15px;border-radius:var(--r1);background:var(--ink);
  color:#fff;border:none;font-size:12.5px;font-weight:500;cursor:pointer;flex-shrink:0}
.app .callout.good .callout-btn{background:var(--accent)}

/* ------------------------------ ليش؟ ------------------------------ */
.lossbox,.allocbox{display:flex;gap:var(--s3);border-radius:var(--r2);padding:var(--s3);
  margin-bottom:var(--s4)}
.lossbox{background:var(--warn-soft);border:1px solid var(--warn-line)}
.lossbox svg{color:var(--warn);flex-shrink:0;margin-top:2px}
.lossbox b{display:block;font-size:13.5px;color:var(--warn);margin-bottom:4px}
.lossbox p{font-size:12px;line-height:1.75;color:#7A4232;margin:0}
.allocbox{background:var(--accent-soft);border:1px solid var(--accent-line)}
.allocbox svg{color:var(--accent);flex-shrink:0;margin-top:2px}
.allocbox b{display:block;font-size:13.5px;color:var(--accent);margin-bottom:var(--s2)}
.allocbox p{font-size:11.5px;line-height:1.7;color:#3D6357;margin:var(--s2) 0 0}
.alloc-pills{display:flex;flex-wrap:wrap;gap:6px}
.pill{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;background:#fff;
  border:1px solid var(--line);border-radius:var(--rp);padding:4px 10px;color:var(--ink2)}
.pill b{font-weight:700;color:var(--accent)}

.caps{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:var(--s4)}
.cap-hd{display:flex;align-items:center;gap:var(--s2);margin-bottom:7px}
.cap-ics{display:flex;color:var(--faint)}
.cap-ics svg+svg{margin-inline-start:-5px}
.cap.hit .cap-ics{color:var(--warn)}
.cap-lb{flex:1;font-size:13px;font-weight:500;line-height:1.4}
.cap-tag{display:inline-block;font-style:normal;font-size:10px;color:var(--muted);
  background:var(--sunken);border-radius:var(--rp);padding:2px 7px;margin-inline-start:6px;
  vertical-align:middle}
.cap-v{font-size:14px;font-weight:700;letter-spacing:-.01em}
.cap-out{font-style:normal;font-size:11.5px;font-weight:500;color:var(--faint)}
.cap-ft{display:flex;flex-wrap:wrap;justify-content:space-between;gap:var(--s2);
  font-size:11.5px;color:var(--muted);margin-top:6px;line-height:1.5}
.cap-ft b{font-weight:600;color:var(--ink2)}
.cap-ft.loose{margin-top:0}
.cap-loss{display:inline-flex;align-items:center;gap:4px;color:var(--warn);font-weight:600}

.bar{background:var(--sunken);border-radius:var(--rp);overflow:hidden;width:100%}
.bar span{display:block;height:100%;border-radius:var(--rp);
  transition:width .35s cubic-bezier(.22,.61,.36,1)}
.bar-accent span{background:var(--accent)}
.bar-warn span{background:var(--warn)}
.bar-soft span{background:var(--faint)}
.bar-ghost{background:transparent}
.bar-ghost span{background:var(--accent-line)}

/* ------------------------------ التوزيع ------------------------------ */
.mixlist{display:flex;flex-direction:column;gap:var(--s3)}
.mixcard{border:1px solid var(--line);border-radius:var(--r2);padding:var(--s3)}
.mixcard-hd{display:flex;align-items:center;gap:var(--s2);margin-bottom:var(--s2)}
.mixcard-hd b{flex:1;font-size:13.5px;font-weight:600}
.mixcard-n{font-size:13px;font-weight:700;color:var(--accent)}
.mixcard-loss{display:flex;align-items:center;gap:5px;font-size:11.5px;color:var(--warn);
  margin:var(--s2) 0 0}
.mixout{font-size:11.5px;line-height:1.75;color:var(--muted);margin:0;padding-top:var(--s2)}

/* ------------------------------ البدائل ------------------------------ */
.alts{display:flex;flex-direction:column}
.alt{display:flex;align-items:center;gap:var(--s3);width:100%;text-align:start;
  background:none;border:none;border-top:1px solid var(--line2);padding:var(--s3) 0;
  cursor:pointer;transition:background .12s}
.alt:first-child{border-top:none;padding-top:0}
.alt:hover{background:var(--raised)}
.alt-rank{font-size:11.5px;color:var(--faint);width:14px;flex-shrink:0;font-weight:600}
.alt-body{flex:1;min-width:0}
.alt-top{display:flex;align-items:center;gap:var(--s2);margin-bottom:7px}
.alt-name{flex:1;font-size:13.5px;font-weight:600;white-space:nowrap;overflow:hidden;
  text-overflow:ellipsis}
.alt-net{font-size:15px;font-weight:700;letter-spacing:-.01em}
.alt-net.neg{color:var(--warn)}
.alt-meta{display:flex;flex-wrap:wrap;align-items:center;gap:5px;font-size:11.5px;
  color:var(--muted);margin-top:7px}
.alt-meta .dot{color:var(--faint)}
.alt-gap{color:var(--faint)}
.alt-arrow{color:var(--faint);flex-shrink:0}

/* ------------------------------ حالة فارغة ------------------------------ */
.empty{background:var(--surface);border:1px dashed var(--line);border-radius:var(--r3);
  padding:var(--s6) var(--s4);text-align:center}
.empty svg{color:var(--accent-line);margin-bottom:var(--s3)}
.empty b{display:block;font-size:16px;margin-bottom:var(--s2)}
.empty p{font-size:13px;line-height:1.85;color:var(--muted);margin:0 auto;max-width:34ch}

/* ------------------------------ الألواح ------------------------------ */
.scrim{position:fixed;inset:0;z-index:60;background:rgba(13,17,23,.42);
  display:flex;align-items:flex-end;justify-content:center;
  animation:fade .18s ease}
.sheet{background:var(--surface);width:100%;max-height:88dvh;display:flex;flex-direction:column;
  border-radius:var(--r3) var(--r3) 0 0;animation:rise .26s cubic-bezier(.22,.61,.36,1)}
@keyframes fade{from{opacity:0}}
@keyframes rise{from{transform:translateY(14px);opacity:.6}}
.sheet-hd{display:flex;align-items:center;justify-content:space-between;gap:var(--s3);
  padding:var(--s4);border-bottom:1px solid var(--line);flex-shrink:0}
.sheet-hd h2{font-size:15px;font-weight:700;margin:0;letter-spacing:-.01em}
.sheet-bd{padding:var(--s4);overflow-y:auto;overscroll-behavior:contain;
  -webkit-overflow-scrolling:touch}

.opt{display:flex;gap:var(--s3);padding:var(--s3) 0;border-bottom:1px solid var(--line2);
  cursor:pointer;align-items:flex-start}
.opt input{width:19px;height:19px;flex-shrink:0;margin-top:2px;accent-color:var(--accent)}
.opt b{display:block;font-size:13.5px;font-weight:600;margin-bottom:3px}
.opt em{font-style:normal;font-size:12px;line-height:1.7;color:var(--muted);display:block}
.opt-sub{padding:var(--s3) 0 var(--s3) 0;margin-inline-start:31px;
  border-inline-start:2px solid var(--accent-soft);padding-inline-start:var(--s3)}
.field{display:flex;align-items:center;justify-content:space-between;gap:var(--s3);
  min-height:46px}
.field label{font-size:13px;color:var(--ink2)}
.field input{width:90px;padding:9px 11px;border:1px solid var(--line);border-radius:var(--r1);
  background:var(--raised);text-align:left;font-size:15px;font-weight:600}
.field input:focus{outline:none;border-color:var(--accent);background:#fff}
.hint{font-size:11.5px;line-height:1.75;color:var(--faint);margin:var(--s2) 0 0}
.hint.top{margin:0 0 var(--s3)}
.err{font-size:12px;color:var(--warn);margin:var(--s2) 0 0}

.opt-head{display:flex;align-items:center;justify-content:space-between;
  padding:var(--s5) 0 var(--s2);font-size:13.5px;font-weight:600}
.pickrow{display:flex;align-items:center;gap:var(--s3);min-height:50px;
  border-bottom:1px solid var(--line2);cursor:pointer}
.pickrow:last-child{border-bottom:none}
.pickrow input{width:19px;height:19px;flex-shrink:0;accent-color:var(--accent)}
.pickrow b{display:block;font-size:13.5px;font-weight:500}
.pickrow em{font-style:normal;font-size:11.5px;color:var(--faint)}
.pickrow.off b,.pickrow.off em,.pickrow.off .v-dot{opacity:.4}

.saverow{display:flex;gap:var(--s2)}
.saverow input{flex:1;min-width:0;padding:11px 13px;border:1px solid var(--line);
  border-radius:var(--r1);background:var(--raised);font-size:15px}
.saverow input:focus{outline:none;border-color:var(--accent);background:#fff}
.scen{display:flex;align-items:center;gap:var(--s2);border-top:1px solid var(--line2);
  padding:var(--s2) 0}
.scen-main{flex:1;min-width:0;background:none;border:none;text-align:start;cursor:pointer;
  padding:var(--s2) 0}
.scen-main b{display:block;font-size:13.5px;font-weight:600;margin-bottom:2px}
.scen-main span{font-size:11.5px;color:var(--muted)}
.scen-net{font-size:14px;font-weight:700;color:var(--accent);flex-shrink:0}

.cardhead{display:flex;align-items:center;gap:var(--s3);padding-bottom:var(--s3);
  border-bottom:1px solid var(--line2)}
.cardhead b{display:block;font-size:13.5px;font-weight:600}
.cardhead em{font-style:normal;font-size:11.5px;color:var(--muted)}
.statrow{display:grid;grid-template-columns:repeat(3,1fr);gap:var(--s2);
  padding:var(--s4) 0;border-bottom:1px solid var(--line2);margin-bottom:var(--s4)}
.statrow div{display:flex;flex-direction:column;gap:3px}
.statrow span{font-size:10.5px;color:var(--muted)}
.statrow b{font-size:16px;font-weight:700;letter-spacing:-.01em}
.notes{list-style:none;margin:var(--s4) 0 0;padding:0}
.notes li{font-size:12px;line-height:1.85;color:var(--muted);padding-inline-start:14px;
  position:relative;margin-bottom:5px}
.notes li::before{content:"";position:absolute;inset-inline-start:0;top:11px;width:6px;
  height:1px;background:var(--faint)}
.termslink{display:inline-flex;align-items:center;gap:5px;margin-top:var(--s3);
  font-size:12.5px;color:var(--focus);text-decoration:none}
.termslink:hover{text-decoration:underline}

/* ------------------------------ نقاط التكسّر ------------------------------ */

@media (max-width:359px){
  .cat-in input{width:118px;font-size:16px}
  .cat-lb{font-size:12.5px}
}

/* جوال كبير */
@media (min-width:480px){
  .stage{padding:var(--s5) var(--s4)}
  .v-break{grid-template-columns:repeat(4,1fr)}
  .verdict{padding:var(--s6) var(--s5)}
  .cat-main{min-height:60px}
}

/* لوحي: الصرف عمودان، والألواح تصير نوافذ */
@media (min-width:680px){
  .cats{display:grid;grid-template-columns:1fr 1fr}
  .cat{border-inline-start:1px solid var(--line2)}
  .cat:nth-child(odd){border-inline-start:none}
  .scrim{align-items:center;padding:var(--s4)}
  .sheet{max-width:520px;border-radius:var(--r3);max-height:84dvh}
  @keyframes rise{from{transform:scale(.985);opacity:0}}
}

/* سطح المكتب: عمودان، الصرف ملتصق */
@media (min-width:1024px){
  .stage{flex-direction:row;align-items:flex-start;gap:var(--s5);padding:var(--s5)}
  .col-input{width:376px;flex-shrink:0;position:sticky;top:74px}
  .col-result{flex:1}
  .cats{grid-template-columns:1fr}
  .cat{border-inline-start:none}
  .v-num{font-size:64px}
  .block{padding:var(--s5)}
  .caps{display:grid;grid-template-columns:1fr 1fr;gap:var(--s5) var(--s6)}
  .lossbox,.allocbox{grid-column:1/-1}
}

@media (min-width:1240px){
  .col-input{width:400px}
}

@media (prefers-reduced-motion:reduce){
  .bar span{transition:none}
  .scrim,.sheet{animation:none}
}
`;
