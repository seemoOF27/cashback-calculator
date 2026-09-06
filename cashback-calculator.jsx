import React, { useState, useMemo } from "react";

/* ============================================================================
   الفئات — لإضافة فئة جديدة أضفها هنا ثم أضف نسبتها داخل كل بطاقة
   ========================================================================== */
const CATEGORIES = [
  { id: "fuel", label: "محطات الوقود" },
  { id: "dining", label: "المطاعم والمقاهي" },
  { id: "delivery", label: "تطبيقات التوصيل" },
  { id: "grocery", label: "السوبرماركت والتموينات" },
  { id: "pharmacy", label: "الصيدليات والرعاية الطبية" },
  { id: "travel", label: "السفر والفنادق" },
  { id: "education", label: "التعليم" },
  { id: "intl", label: "المشتريات الدولية" },
  { id: "other", label: "مشتريات أخرى محلية" },
];

const SAMPLE = {
  fuel: 700, dining: 1200, delivery: 900, grocery: 2500, pharmacy: 300,
  travel: 800, education: 0, intl: 1000, other: 1500,
};

/* ============================================================================
   البطاقات — لإضافة بطاقة جديدة انسخ أي كائن هنا وعدّل قيمه
   rate: النسبة | cap: سقف الكاش باك الشهري للفئة | capGroup: فئات تتشارك سقفًا
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
    terms:
      "https://www.alahli.com/ar/pages/personal-banking/credit-cards/alahli-cashback-premium-credit-card",
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
    terms:
      "https://bsf.sa/arabic/personal/cards/credit/lifestyle-credit-card/lifestyle",
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
    terms:
      "https://www.alrajhibank.com.sa/-/media/Project/AlrajhiPWS/Shared/Home/Personal/Cards/Cashback-Cards/Cash-Back-EN.pdf",
    notes: [
      "الشروط محدّثة من ٣ أغسطس ٢٠٢٦: أُلغيت المتاجر الإلكترونية وأُضيفت تطبيقات التوصيل ١٠٪.",
      "الوقود والصيدليات والسفر والتعليم كلها ضمن «مشتريات محلية أخرى» ٠٫٥٪ بسقف ٢٠٠ مشترك.",
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
    terms:
      "https://www.alrajhibank.com.sa/-/media/Project/AlrajhiPWS/Shared/Home/Personal/Cards/Cashback-Cards/Cash-Back-EN.pdf",
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

function bestLifestyleRates(card, spend) {
  const groupSpend = {
    dining: (spend.dining || 0) + (spend.delivery || 0),
    grocery: spend.grocery || 0,
    travel: spend.travel || 0,
    pharmacy: spend.pharmacy || 0,
    education: spend.education || 0,
  };
  let best = null;
  for (const perm of permutations(card.selectable)) {
    let total = 0;
    perm.forEach((cat, i) => {
      total += Math.min(groupSpend[cat] * card.tierRates[i], card.tierCap);
    });
    if (!best || total > best.total) best = { total, perm };
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
  const annualSpend = monthlySpend * 12;
  const feeWaived =
    card.feeWaiverAnnualSpend != null && annualSpend >= card.feeWaiverAnnualSpend;
  const effectiveFee = feeWaived ? 0 : card.fee;
  const fxCost = ((spend.intl || 0) * card.fx) / 100;

  return { card, rows, monthly, monthlySpend, effectiveFee, feeWaived, fxCost, lostToCaps, lostToTotalCap, allocation };
}

/* ============================ العرض ============================ */

const money = (n, dec = 0) =>
  n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const pct = (r) => `${((r * 100) % 1 === 0 ? r * 100 : (r * 100).toFixed(2))}%`;
const catLabel = (id) => CATEGORIES.find((x) => x.id === id).label;

export default function CashbackCalculator() {
  const [spend, setSpend] = useState(() =>
    Object.fromEntries(CATEGORIES.map((c) => [c.id, 0]))
  );
  const [fxOn, setFxOn] = useState(false);
  const [hidden, setHidden] = useState({});
  const [open, setOpen] = useState(null);

  const visibleCards = CARDS.filter((c) => !hidden[c.id]);

  const results = useMemo(() => {
    const r = visibleCards.map((c) => computeCard(c, spend));
    r.forEach((x) => {
      x.finalMonthly = fxOn ? x.monthly - x.fxCost : x.monthly;
      x.netAnnual = x.finalMonthly * 12 - x.effectiveFee;
      x.breakeven =
        x.effectiveFee === 0 ? 0 : x.finalMonthly > 0 ? Math.ceil(x.effectiveFee / x.finalMonthly) : null;
    });
    return r.sort((a, b) => b.netAnnual - a.netAnnual);
  }, [spend, fxOn, hidden]);

  const totalSpend = CATEGORIES.reduce((s, c) => s + (spend[c.id] || 0), 0);
  const hasInput = totalSpend > 0;
  const maxNet = Math.max(1, ...results.map((r) => r.netAnnual));

  const setVal = (id, v) => {
    const n = v.replace(/[^\d.]/g, "");
    setSpend((s) => ({ ...s, [id]: n === "" ? 0 : parseFloat(n) || 0 }));
  };

  return (
    <div dir="rtl" className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap');
        .app{
          --ink:#0F1418; --muted:#5C6771; --faint:#909AA2;
          --bg:#E9ECEF; --surface:#fff; --rule:#D9DEE3; --hair:#EEF1F3;
          --money:#0C7256; --loss:#A6462F; --focus:#2B6CB0;
          font-family:'IBM Plex Sans Arabic',system-ui,'Segoe UI',Tahoma,sans-serif;
          background:var(--bg); color:var(--ink);
          font-variant-numeric:tabular-nums; font-feature-settings:"tnum";
          height:100vh; display:flex; flex-direction:column; overflow:hidden;
          -webkit-font-smoothing:antialiased;
        }
        .app *{box-sizing:border-box}
        .app button{font:inherit}

        /* ---------- شريط علوي ---------- */
        .bar{display:flex;align-items:center;gap:16px;padding:12px 16px 11px;
          border-bottom:1px solid var(--rule);background:var(--surface);flex-shrink:0}
        .bar h1{font-size:15px;font-weight:700;margin:0;letter-spacing:-.01em;white-space:nowrap}
        .spacer{flex:1}
        .kpi{display:flex;align-items:baseline;gap:6px;white-space:nowrap}
        .kpi .k{font-size:11.5px;color:var(--muted)}
        .kpi .v{font-size:15px;font-weight:600}
        .kpi.win .v{color:var(--money)}
        .bar .sep{width:1px;height:22px;background:var(--rule)}

        /* ---------- الأعمدة ---------- */
        .cols{flex:1;display:flex;gap:12px;padding:12px;overflow:hidden;min-height:0}
        .col{min-height:0;overflow-y:auto;overscroll-behavior:contain}
        .col::-webkit-scrollbar{width:7px}
        .col::-webkit-scrollbar-thumb{background:#C6CCD2;border-radius:4px}
        .results{flex:1}
        .inputs{width:296px;flex-shrink:0}

        .box{background:var(--surface);border:1px solid var(--rule);border-radius:12px;
          padding:0 13px;margin-bottom:10px}
        .box:last-child{margin-bottom:0}
        .bh{display:flex;align-items:center;justify-content:space-between;gap:8px;
          padding:11px 0 9px;border-bottom:1px solid var(--rule)}
        .bh h2{font-size:12.5px;font-weight:600;margin:0;color:var(--muted)}
        .lnk{background:none;border:none;padding:2px 0;font-size:12px;color:var(--muted);
          cursor:pointer;text-decoration:underline;text-underline-offset:3px}
        .lnk:hover{color:var(--ink)}
        .lnk:focus-visible{outline:2px solid var(--focus);outline-offset:2px;border-radius:3px}

        /* ---------- إدخال ---------- */
        .irow{display:flex;align-items:center;gap:8px;padding:5px 0;
          border-bottom:1px solid var(--hair)}
        .irow:last-of-type{border-bottom:none}
        .irow label{flex:1;font-size:12.5px;line-height:1.3}
        .irow input{width:82px;padding:5px 8px;font:inherit;font-size:13px;
          border:1px solid var(--rule);border-radius:7px;background:#FAFBFC;
          font-variant-numeric:tabular-nums;color:var(--ink)}
        .irow input::placeholder{color:#B4BCC3}
        .irow input:focus{outline:2px solid var(--focus);outline-offset:1px;background:#fff}
        .sum{display:flex;justify-content:space-between;font-size:12.5px;padding:9px 0;
          border-top:1px solid var(--rule)}
        .sum b{font-weight:600}
        .sum.soft{border-top:none;padding-top:0;color:var(--muted)}

        .check{display:flex;align-items:flex-start;gap:8px;padding:9px 0;
          font-size:11.5px;color:var(--muted);line-height:1.55;cursor:pointer;
          border-top:1px solid var(--rule)}
        .check input{width:15px;height:15px;flex-shrink:0;margin-top:1px;accent-color:var(--focus)}

        /* ---------- اختيار البطاقات ---------- */
        .pick{display:flex;align-items:center;gap:8px;padding:6px 0;
          font-size:12.5px;cursor:pointer;border-bottom:1px solid var(--hair)}
        .pick:last-child{border-bottom:none}
        .pick input{width:15px;height:15px;accent-color:var(--focus);flex-shrink:0}
        .pick .dot{width:8px;height:8px;border-radius:2px;flex-shrink:0}
        .pick span{flex:1}
        .pick.off span,.pick.off .dot{opacity:.42}

        /* ---------- بطاقة نتيجة ---------- */
        .res{background:var(--surface);border:1px solid var(--rule);border-radius:12px;
          margin-bottom:8px;overflow:hidden;position:relative}
        .res.first{border-color:#B9C6C1;box-shadow:0 0 0 1px #DCE6E2}
        .head{display:flex;align-items:center;gap:11px;padding:11px 13px;width:100%;
          background:none;border:none;text-align:start;cursor:pointer}
        .head:hover{background:#FAFBFC}
        .head:focus-visible{outline:2px solid var(--focus);outline-offset:-2px}
        .chip{width:4px;height:34px;border-radius:2px;flex-shrink:0}
        .who{flex:1;min-width:0}
        .who .n{font-size:13.5px;font-weight:600;margin:0;white-space:nowrap;
          overflow:hidden;text-overflow:ellipsis}
        .who .i{font-size:11.5px;color:var(--muted);margin:1px 0 0}
        .nums{display:flex;align-items:baseline;gap:14px;flex-shrink:0}
        .nums .cell{text-align:end}
        .nums .big{font-size:17px;font-weight:700;color:var(--money);line-height:1.15}
        .nums .big.dim{color:var(--faint)}
        .nums .big.neg{color:var(--loss)}
        .nums .cap{font-size:10.5px;color:var(--muted);margin-top:1px}
        .caret{color:var(--faint);font-size:11px;flex-shrink:0}

        .track{height:3px;background:var(--hair)}
        .track span{display:block;height:100%;transition:width .2s ease}

        /* ---------- تفاصيل ---------- */
        .det{padding:11px 13px 14px;border-top:1px solid var(--rule);background:#FCFDFD}
        .alloc{font-size:12px;color:var(--muted);line-height:1.7;margin:0 0 10px}
        .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(212px,1fr));
          gap:0 20px}
        .dr{padding:7px 0;border-bottom:1px solid var(--hair)}
        .dtop{display:flex;align-items:baseline;gap:8px;font-size:12.5px}
        .dtop .c{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .dtop .r{color:var(--faint);font-size:11px;white-space:nowrap}
        .dtop .v{font-weight:600;min-width:46px;text-align:end}
        .mini{height:2px;background:#E5E9ED;border-radius:1px;margin-top:5px;overflow:hidden}
        .mini span{display:block;height:100%;transition:width .2s ease}
        .warn{font-size:11.5px;color:var(--loss);line-height:1.65;margin:10px 0 0}
        .warn.q{color:var(--muted)}
        ul.notes{margin:11px 0 0;padding:0;list-style:none}
        ul.notes li{font-size:11.5px;color:var(--muted);line-height:1.7;
          padding-inline-start:11px;position:relative}
        ul.notes li::before{content:"";position:absolute;inset-inline-start:0;top:9px;
          width:4px;height:1px;background:var(--faint)}
        .terms{display:inline-block;margin-top:10px;font-size:12px;color:var(--focus)}

        .blank{background:var(--surface);border:1px solid var(--rule);border-radius:12px;
          padding:22px 16px;font-size:13px;color:var(--muted);line-height:1.75}
        .foot{font-size:11px;color:var(--faint);line-height:1.75;padding:10px 2px 0}

        /* ---------- جوال ---------- */
        @media (max-width:880px){
          .app{height:auto;min-height:100vh;overflow:visible}
          .cols{flex-direction:column;overflow:visible;padding:10px}
          .col{overflow:visible}
          .inputs{width:auto;order:-1}
          .bar{flex-wrap:wrap;gap:10px 14px}
          .bar h1{width:100%}
          .bar .sep{display:none}
        }
        @media (prefers-reduced-motion:reduce){
          .track span,.mini span{transition:none}
        }
      `}</style>

      {/* ---------- شريط علوي ---------- */}
      <div className="bar">
        <h1>حاسبة الكاش باك</h1>
        <div className="kpi">
          <span className="k">الصرف الشهري</span>
          <span className="v">{money(totalSpend)}</span>
        </div>
        <div className="sep" />
        <div className="kpi">
          <span className="k">سنويًا</span>
          <span className="v">{money(totalSpend * 12)}</span>
        </div>
        {hasInput && results.length > 0 && (
          <>
            <div className="sep" />
            <div className="kpi win">
              <span className="k">أفضل بطاقة</span>
              <span className="v">
                {results[0].card.short} · {money(Math.max(0, results[0].netAnnual))} صافي سنوي
              </span>
            </div>
          </>
        )}
        <div className="spacer" />
        <button className="lnk" onClick={() => setSpend(SAMPLE)}>مثال</button>
        <button
          className="lnk"
          onClick={() => setSpend(Object.fromEntries(CATEGORIES.map((c) => [c.id, 0])))}
        >
          تصفير
        </button>
      </div>

      <div className="cols">
        {/* ---------- النتائج (يمين) ---------- */}
        <div className="col results">
          {!hasInput ? (
            <div className="blank">
              عبّي صرفك الشهري في اللوحة على اليسار وبتشوف الترتيب هنا مباشرة.
              كل بطاقة تنفتح على تفصيل الفئات وسقوفها.
            </div>
          ) : results.length === 0 ? (
            <div className="blank">ما فيه بطاقات معروضة — فعّل واحدة على الأقل من اللوحة اليسرى.</div>
          ) : (
            results.map((res, i) => {
              const c = res.card;
              const isOpen = open === c.id;
              const gap = results[0].netAnnual - res.netAnnual;
              return (
                <div className={`res${i === 0 ? " first" : ""}`} key={c.id}>
                  <button className="head" onClick={() => setOpen(isOpen ? null : c.id)}>
                    <span className="chip" style={{ background: c.accent }} />
                    <span className="who">
                      <p className="n">{c.name}</p>
                      <p className="i">
                        {c.issuer} ·{" "}
                        {c.fee === 0
                          ? "بدون رسوم"
                          : res.feeWaived
                          ? `رسوم ${money(c.fee, 1)} معفاة`
                          : `رسوم ${money(c.fee, 1)}`}
                        {res.breakeven > 0 &&
                          res.breakeven <= 12 &&
                          ` · تُغطّى في ${res.breakeven} شهر`}
                        {res.breakeven > 12 && " · ما تُغطّى خلال سنة"}
                        {i > 0 && gap > 0 && ` · أقل بـ ${money(gap)} سنويًا`}
                      </p>
                    </span>
                    <span className="nums">
                      <span className="cell">
                        <span
                          className={`big${res.finalMonthly <= 0 ? " dim" : ""}`}
                        >
                          {money(Math.max(0, res.finalMonthly), 1)}
                        </span>
                        <span className="cap">ريال / شهر</span>
                      </span>
                      <span className="cell">
                        <span className={`big${res.netAnnual < 0 ? " neg" : ""}`}>
                          {money(res.netAnnual)}
                        </span>
                        <span className="cap">صافي سنوي</span>
                      </span>
                    </span>
                    <span className="caret">{isOpen ? "▲" : "▼"}</span>
                  </button>

                  <div className="track">
                    <span
                      style={{
                        width: `${Math.max(0, (res.netAnnual / maxNet) * 100)}%`,
                        background: c.accent,
                      }}
                    />
                  </div>

                  {isOpen && (
                    <div className="det">
                      {res.allocation && (
                        <p className="alloc">
                          أفضل توزيع لك هذا الشهر: {catLabel(res.allocation[0])} ١٠٪، ثم{" "}
                          {catLabel(res.allocation[1])} و{catLabel(res.allocation[2])} ٣٪، ثم{" "}
                          {catLabel(res.allocation[3])} و{catLabel(res.allocation[4])} ٢٪.
                        </p>
                      )}

                      <div className="grid">
                        {res.rows.map((r) => {
                          const g = r.cappedGroup;
                          const fill = g ? Math.min(100, (g.raw / g.cap) * 100) : 0;
                          return (
                            <div className="dr" key={r.cat.id}>
                              <div className="dtop">
                                <span className="c">{r.cat.label}</span>
                                <span className="r">
                                  {r.excluded ? "مستثناة" : pct(r.rate)}
                                  {r.cap != null ? ` · ${money(r.cap)}` : ""}
                                </span>
                                <span
                                  className="v"
                                  style={{ color: r.earned > 0 ? "var(--money)" : "var(--faint)" }}
                                >
                                  {money(r.earned, 1)}
                                </span>
                              </div>
                              {r.cap != null && r.amount > 0 && (
                                <div className="mini">
                                  <span
                                    style={{
                                      width: `${fill}%`,
                                      background: g && g.hit ? "var(--loss)" : c.accent,
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {res.lostToCaps > 0.5 && (
                        <p className="warn">
                          ضاع {money(res.lostToCaps, 1)} ريال شهريًا بسبب سقوف الفئات — الصرف فوق
                          السقف ما يعطي كاش باك.
                        </p>
                      )}
                      {res.lostToTotalCap > 0.5 && (
                        <p className="warn">
                          و{money(res.lostToTotalCap, 1)} ريال إضافية بسبب السقف الإجمالي (
                          {money(c.totalCap)} شهريًا).
                        </p>
                      )}
                      {fxOn && res.fxCost > 0 && (
                        <p className="warn q">
                          رسوم العمليات الدولية {c.fx}%{c.fxUncertain ? " (تقديرية)" : ""} ={" "}
                          {money(res.fxCost, 1)} ريال، مخصومة أعلاه.
                        </p>
                      )}

                      <ul className="notes">
                        {c.notes.map((n, k) => (
                          <li key={k}>{n}</li>
                        ))}
                        <li>{c.feeNote}</li>
                      </ul>

                      <a className="terms" href={c.terms} target="_blank" rel="noreferrer">
                        الشروط والأحكام ↗
                      </a>
                    </div>
                  )}
                </div>
              );
            })
          )}
          <p className="foot">
            الأرقام تقديرية ومبنية على الشروط المنشورة حتى سبتمبر ٢٠٢٦. الكاش باك الفعلي يعتمد
            على تصنيف التاجر (MCC) لا على اسمه، والبنوك تعدّل النسب والسقوف بإشعار مسبق.
          </p>
        </div>

        {/* ---------- الإدخال (يسار) ---------- */}
        <div className="col inputs">
          <div className="box">
            <div className="bh">
              <h2>صرفك الشهري</h2>
            </div>
            {CATEGORIES.map((c) => (
              <div className="irow" key={c.id}>
                <label htmlFor={`in-${c.id}`}>{c.label}</label>
                <input
                  id={`in-${c.id}`}
                  inputMode="numeric"
                  placeholder="0"
                  value={spend[c.id] === 0 ? "" : spend[c.id]}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setVal(c.id, e.target.value)}
                />
              </div>
            ))}
            <div className="sum">
              <span>الإجمالي</span>
              <b>{money(totalSpend)} ر.س</b>
            </div>
            <label className="check">
              <input type="checkbox" checked={fxOn} onChange={(e) => setFxOn(e.target.checked)} />
              <span>
                اخصم رسوم العمليات الدولية (١٫٩٩٪–٢٫٨٥٪ حسب البطاقة) — غالبًا تبتلع عائد الشراء
                الدولي كاملًا.
              </span>
            </label>
          </div>

          <div className="box">
            <div className="bh">
              <h2>البطاقات المعروضة</h2>
              <button
                className="lnk"
                onClick={() =>
                  setHidden(
                    Object.keys(hidden).length && visibleCards.length < CARDS.length ? {} : hidden
                  )
                }
                style={{ visibility: visibleCards.length < CARDS.length ? "visible" : "hidden" }}
              >
                إظهار الكل
              </button>
            </div>
            {CARDS.map((c) => {
              const on = !hidden[c.id];
              return (
                <label className={`pick${on ? "" : " off"}`} key={c.id}>
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => setHidden((h) => ({ ...h, [c.id]: on }))}
                  />
                  <span className="dot" style={{ background: c.accent }} />
                  <span>{c.short}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
