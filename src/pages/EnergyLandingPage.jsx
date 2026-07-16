import React, { useEffect, useRef, useState } from 'react';
import {
  Zap, Flame, Leaf, Brain, ShieldCheck, Star, ChevronDown,
  Sparkles, Droplets, ArrowLeft, BatteryCharging,
} from 'lucide-react';

/*
 * VOLT — energy-drink landing page (Hebrew, RTL).
 * Standalone marketing page: brings its own font, palette and animations,
 * and deliberately does not use the koala theme or TopNav.
 */

const PALETTE = {
  bg: '#06060B',
  ink: '#F5F7F2',
  muted: 'rgba(245,247,242,0.62)',
  faint: 'rgba(245,247,242,0.38)',
  lime: '#B6FF3B',
  lime2: '#5DFF7E',
  glass: 'rgba(255,255,255,0.045)',
  stroke: 'rgba(255,255,255,0.09)',
};

const FLAVORS = [
  {
    id: 'lime',
    name: 'Lime Surge',
    hebrew: 'ליים סחוט',
    desc: 'ליים ירוק חמצמץ עם נענע קרירה. הטעם שהתחיל הכול — חד, נקי, ומעיר כל תא בגוף.',
    c1: '#B6FF3B',
    c2: '#2EE96B',
    tags: ['חמצמץ', 'מרענן', 'הקלאסי'],
  },
  {
    id: 'berry',
    name: 'Berry Blast',
    hebrew: 'פיצוץ פירות יער',
    desc: 'אוכמניות, פטל ודובדבן שחור בעוצמה מלאה. מתוק בדיוק במידה, סוער בכל השאר.',
    c1: '#FF4D9E',
    c2: '#A855F7',
    tags: ['פירותי', 'עוצמתי', 'הכי נמכר'],
  },
  {
    id: 'citrus',
    name: 'Citrus Storm',
    hebrew: 'סופת הדרים',
    desc: 'תפוז דם, אשכולית אדומה ונגיעת ג׳ינג׳ר. סערה טרופית בפחית אחת קרה.',
    c1: '#FFB020',
    c2: '#FF5C2B',
    tags: ['הדרים', 'מחודד', 'חדש'],
  },
];

/* `span` keeps the bento grid gap-free on both the sm (2-col) and lg (3-col) layouts. */
const BENEFITS = [
  {
    icon: Zap,
    title: '200 מ״ג קפאין טבעי',
    desc: 'קפאין ממקור צמחי — תה ירוק וגוארנה — שמשתחרר בהדרגה. ערנות חדה שנמשכת שעות, בלי קפיצות ובלי נפילות.',
    span: 'sm:col-span-2 lg:col-span-2',
  },
  {
    icon: Leaf,
    title: 'אפס סוכר. באמת.',
    desc: 'ממותק בסטיביה בלבד. 12 קלוריות לפחית ואף גרם סוכר אחד.',
  },
  {
    icon: Brain,
    title: 'מיקוד מנטלי',
    desc: 'L-תיאנין + טאורין לשילוב הנדיר של רוגע וריכוז בו-זמנית.',
  },
  {
    icon: BatteryCharging,
    title: 'קומפלקס ויטמיני B',
    desc: 'B6 ו-B12 במינון יומי מלא — תמיכה אמיתית בחילוף החומרים של הגוף.',
  },
  {
    icon: Flame,
    title: 'בלי צבעים, בלי כימיה',
    desc: 'ללא צבעי מאכל וללא חומרים משמרים. רשימת רכיבים שאפשר לקרוא בקול רם.',
  },
  {
    icon: ShieldCheck,
    title: 'בלי התרסקות',
    desc: 'הנוסחה מאוזנת כך שהאנרגיה דועכת בעדינות. בלי כאב ראש, בלי צניחת אנרגיה אחרי שעתיים.',
    span: 'sm:col-span-2 lg:col-span-2',
  },
  {
    icon: Droplets,
    title: '330 מ״ל מוגז בעדינות',
    desc: 'קרבונציה עדינה שלא שורפת בגרון. קר מהמקרר — אין דבר כזה בארץ.',
    span: 'sm:col-span-2 lg:col-span-1',
  },
];

const TESTIMONIALS = [
  {
    name: 'עומר לוי',
    role: 'מאמן כושר, תל אביב',
    quote: 'ניסיתי כל משקה אנרגיה שקיים בארץ. VOLT הוא היחיד שנותן לי אנרגיה לאימון של שעתיים בלי שאני מרגיש את הנפילה אחר כך.',
  },
  {
    name: 'נועה ברק',
    role: 'מפתחת תוכנה',
    quote: 'ה-Berry Blast מחליף לי את הקפה של אחר הצהריים. ריכוז מטורף בלי לחץ בחזה ובלי סוכר — בדיוק מה שחיפשתי.',
  },
  {
    name: 'דניאל אזולאי',
    role: 'סטודנט לרפואה',
    quote: 'תקופת מבחנים שלמה על VOLT. הקטע של הקפאין המדורג עובד — ערנות יציבה לאורך כל הלילה, וישנתי מצוין אחרי.',
  },
];

const FAQ = [
  {
    q: 'כמה קפאין יש בפחית ולמי זה מתאים?',
    a: 'כל פחית מכילה 200 מ״ג קפאין ממקור טבעי — כמו שתי כוסות קפה. המשקה מיועד לגילאי 18 ומעלה, ולא מומלץ לנשים בהריון או לרגישים לקפאין. מומלץ לא לעבור פחית אחת ביום.',
  },
  {
    q: 'באמת אין סוכר בכלל?',
    a: 'אפס גרם סוכר, אפס ממתיקים מלאכותיים. המתיקות מגיעה מסטיביה בלבד — צמח מתוק טבעי. סך הכול 12 קלוריות לפחית.',
  },
  {
    q: 'מה ההבדל בין VOLT למשקאות אנרגיה אחרים?',
    a: 'שלושה דברים: קפאין טבעי בשחרור מדורג במקום קפאין סינתטי שמרסק אחרי שעתיים, אפס סוכר במקום 11 כפיות, ו-L-תיאנין שמאזן את הקפאין כך שמקבלים מיקוד רגוע במקום עצבנות.',
  },
  {
    q: 'איפה אפשר לקנות ותוך כמה זמן זה מגיע?',
    a: 'ההזמנה באתר בלבד בשלב זה — מארזי 12 או 24 פחיות. משלוח עד הבית תוך 1–3 ימי עסקים לכל הארץ, וחינם בהזמנה מעל ₪149.',
  },
  {
    q: 'אפשר להחזיר אם לא אהבתי?',
    a: 'כן. אם המארז הראשון לא עשה לכם את זה — מחזירים לכם את הכסף עד 30 יום, בלי שאלות ובלי לבקש את הפחיות בחזרה.',
  },
];

/* Stylised aluminium can, parameterised per flavour. */
function Can({ c1, c2, label = 'VOLT', sub = 'ENERGY', className = '', style }) {
  const uid = label.replace(/\W/g, '') + c1.replace('#', '');
  return (
    <svg viewBox="0 0 200 420" className={className} style={style} role="img" aria-label={`פחית ${label}`}>
      <defs>
        <linearGradient id={`body-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#101018" />
          <stop offset="0.18" stopColor="#23232e" />
          <stop offset="0.42" stopColor="#0c0c13" />
          <stop offset="0.62" stopColor="#2b2b38" />
          <stop offset="0.85" stopColor="#12121a" />
          <stop offset="1" stopColor="#08080d" />
        </linearGradient>
        <linearGradient id={`band-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </linearGradient>
        <linearGradient id={`lid-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9a9aa8" />
          <stop offset="0.5" stopColor="#d8d8e2" />
          <stop offset="1" stopColor="#7d7d8c" />
        </linearGradient>
        <linearGradient id={`shine-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(255,255,255,0.5)" />
          <stop offset="1" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      {/* body */}
      <path d="M38 52 C38 40 66 34 100 34 C134 34 162 40 162 52 L166 340 C166 372 138 388 100 388 C62 388 34 372 34 340 Z" fill={`url(#body-${uid})`} />
      {/* flavour band */}
      <path d="M36.4 150 L164.6 150 L165.6 260 L35.4 260 Z" fill={`url(#band-${uid})`} opacity="0.92" />
      {/* bolt mark on band */}
      <path d="M108 162 L82 212 L100 212 L88 250 L120 196 L102 196 L114 162 Z" fill="#07070c" opacity="0.88" />
      {/* wordmark */}
      <text x="100" y="122" textAnchor="middle" fontFamily="Rubik, sans-serif" fontWeight="800" fontSize="34" letterSpacing="6" fill="#F5F7F2">{label}</text>
      <text x="100" y="296" textAnchor="middle" fontFamily="Rubik, sans-serif" fontWeight="600" fontSize="15" letterSpacing="10" fill="rgba(245,247,242,0.75)">{sub}</text>
      <text x="100" y="330" textAnchor="middle" fontFamily="Rubik, sans-serif" fontWeight="500" fontSize="11" letterSpacing="2" fill="rgba(245,247,242,0.4)">ZERO SUGAR · 330ml</text>
      {/* lid */}
      <ellipse cx="100" cy="52" rx="62" ry="16" fill={`url(#lid-${uid})`} />
      <ellipse cx="100" cy="52" rx="46" ry="11" fill="#3c3c48" />
      <ellipse cx="100" cy="51" rx="46" ry="10" fill="#55555f" />
      <rect x="88" y="42" width="24" height="9" rx="4.5" fill="#8b8b98" />
      {/* vertical sheen */}
      <path d="M56 60 C54 56 60 48 66 48 L70 370 C64 368 58 362 57 354 Z" fill={`url(#shine-${uid})`} opacity="0.35" />
    </svg>
  );
}

/* Reveal-on-scroll: tags children with .v-reveal, flips .v-in when visible. */
function useReveal() {
  const rootRef = useRef(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const els = root.querySelectorAll('.v-reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('v-in'));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('v-in');
          io.unobserve(e.target);
        }
      }),
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return rootRef;
}

function SectionHeading({ eyebrow, title, sub }) {
  return (
    <div className="v-reveal mx-auto mb-14 max-w-2xl text-center">
      <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[rgba(182,255,59,0.25)] bg-[rgba(182,255,59,0.07)] px-4 py-1.5 text-xs font-semibold tracking-wide text-[#B6FF3B]">
        <Sparkles size={13} />
        {eyebrow}
      </span>
      <h2 className="text-3xl font-extrabold leading-tight text-[#F5F7F2] sm:text-5xl">{title}</h2>
      {sub && <p className="mt-4 text-base leading-relaxed text-[rgba(245,247,242,0.62)] sm:text-lg">{sub}</p>}
    </div>
  );
}

function FlavorCard({ flavor, index }) {
  return (
    <div
      className="v-reveal volt-tilt group relative overflow-hidden rounded-3xl border border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.03)] p-8 pt-10 text-center backdrop-blur-sm"
      style={{ transitionDelay: `${index * 90}ms` }}
    >
      {/* hover glow */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full opacity-25 blur-3xl transition-opacity duration-500 group-hover:opacity-60"
        style={{ background: `radial-gradient(circle, ${flavor.c1}, transparent 70%)` }}
      />
      <Can
        c1={flavor.c1}
        c2={flavor.c2}
        label="VOLT"
        sub={flavor.name.split(' ')[0].toUpperCase()}
        className="mx-auto h-56 w-auto transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-[1.04]"
        style={{ filter: `drop-shadow(0 24px 44px ${flavor.c1}44)` }}
      />
      <div className="relative mt-6">
        <div className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: flavor.c1 }}>{flavor.name}</div>
        <h3 className="mt-2 text-2xl font-extrabold text-[#F5F7F2]">{flavor.hebrew}</h3>
        <p className="mt-3 min-h-[72px] text-sm leading-relaxed text-[rgba(245,247,242,0.62)]">{flavor.desc}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {flavor.tags.map((t) => (
            <span key={t} className="rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] px-3 py-1 text-xs text-[rgba(245,247,242,0.7)]">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function FaqItem({ item, open, onToggle }) {
  return (
    <div className="v-reveal overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.03)]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-right"
      >
        <span className="text-base font-bold text-[#F5F7F2] sm:text-lg">{item.q}</span>
        <ChevronDown
          size={20}
          className={`shrink-0 text-[#B6FF3B] transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-6 text-sm leading-relaxed text-[rgba(245,247,242,0.62)] sm:text-base">{item.a}</p>
        </div>
      </div>
    </div>
  );
}

const MARQUEE_ITEMS = ['ZERO SUGAR', '200MG NATURAL CAFFEINE', 'TAURINE', 'B6 + B12', 'L-THEANINE', 'ZERO CRASH', '12 CALORIES', 'NO ARTIFICIAL COLORS', 'BORN IN TLV'];

export default function EnergyLandingPage() {
  const rootRef = useReveal();
  const [openFaq, setOpenFaq] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'VOLT — משקה אנרגיה בלי סוכר, בלי התרסקות';
    return () => { document.title = prevTitle; };
  }, []);

  const scrollTo = (id) => (e) => {
    e.preventDefault();
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const navLinks = [
    { id: 'flavors', label: 'הטעמים' },
    { id: 'benefits', label: 'מה בפנים' },
    { id: 'reviews', label: 'ביקורות' },
    { id: 'faq', label: 'שאלות' },
  ];

  return (
    <div ref={rootRef} dir="rtl" lang="he" className="volt-page min-h-screen overflow-x-hidden" style={{ background: PALETTE.bg, color: PALETTE.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800;900&display=swap');
        .volt-page { font-family: 'Rubik', system-ui, sans-serif; }
        .volt-page ::selection { background: rgba(182,255,59,0.3); }

        /* Applied to a dedicated wrapper with no other transforms, so the
           keyframe never fights Tailwind translate utilities. */
        @keyframes volt-float { 0%,100% { transform: translateY(0) rotate(-4deg); } 50% { transform: translateY(-16px) rotate(-2deg); } }
        @keyframes volt-float-chip { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes volt-pulse { 0%,100% { opacity: .55; transform: scale(1); } 50% { opacity: .95; transform: scale(1.08); } }
        @keyframes volt-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes volt-grad { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }

        .volt-hero-can { animation: volt-float 7s ease-in-out infinite; }
        .volt-chip-f { animation: volt-float-chip 5s ease-in-out infinite; }
        .volt-orb { animation: volt-pulse 9s ease-in-out infinite; }
        .volt-marquee-track { animation: volt-marquee 28s linear infinite; }
        .volt-marquee:hover .volt-marquee-track { animation-play-state: paused; }

        .volt-grad-text {
          background: linear-gradient(100deg, #B6FF3B, #5DFF7E, #35E0C2, #B6FF3B);
          background-size: 220% 220%;
          animation: volt-grad 6s ease infinite;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .v-reveal { opacity: 0; transform: translateY(26px); transition: opacity .7s ease, transform .7s cubic-bezier(.21,.65,.36,1); }
        .v-reveal.v-in { opacity: 1; transform: none; }

        .volt-tilt { transition: transform .45s cubic-bezier(.21,.65,.36,1), border-color .45s ease, opacity .7s ease; }
        .volt-tilt.v-in:hover { transform: translateY(-8px); border-color: rgba(255,255,255,0.22); }

        .volt-btn-primary {
          background: linear-gradient(120deg, #B6FF3B, #5DFF7E);
          box-shadow: 0 8px 32px rgba(182,255,59,0.35), inset 0 1px 0 rgba(255,255,255,0.5);
          transition: transform .25s ease, box-shadow .25s ease;
        }
        .volt-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 14px 44px rgba(182,255,59,0.5), inset 0 1px 0 rgba(255,255,255,0.5); }
        .volt-btn-ghost { transition: border-color .25s ease, background .25s ease, transform .25s ease; }
        .volt-btn-ghost:hover { border-color: rgba(255,255,255,0.35); background: rgba(255,255,255,0.06); transform: translateY(-2px); }

        @media (prefers-reduced-motion: reduce) {
          .volt-hero-can, .volt-chip-f, .volt-orb, .volt-marquee-track, .volt-grad-text { animation: none; }
          .v-reveal { opacity: 1; transform: none; transition: none; }
        }
      `}</style>

      {/* ambient orbs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="volt-orb absolute -top-40 right-[8%] h-[480px] w-[480px] rounded-full blur-[140px]" style={{ background: 'radial-gradient(circle, rgba(182,255,59,0.16), transparent 70%)' }} />
        <div className="volt-orb absolute top-[45%] -left-40 h-[420px] w-[420px] rounded-full blur-[140px]" style={{ background: 'radial-gradient(circle, rgba(53,224,194,0.12), transparent 70%)', animationDelay: '-4s' }} />
        <div className="volt-orb absolute bottom-[-15%] right-[30%] h-[380px] w-[380px] rounded-full blur-[140px]" style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.10), transparent 70%)', animationDelay: '-7s' }} />
      </div>

      {/* ─── Nav ─── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[rgba(255,255,255,0.07)] bg-[rgba(6,6,11,0.72)] backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <a href="#top" onClick={scrollTo('top')} className="flex items-center gap-2 text-xl font-black tracking-wide text-[#F5F7F2]">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[#B6FF3B] to-[#5DFF7E] text-[#06060B]">
              <Zap size={18} strokeWidth={2.6} />
            </span>
            VOLT
          </a>
          <div className="hidden items-center gap-7 md:flex">
            {navLinks.map((l) => (
              <a key={l.id} href={`#${l.id}`} onClick={scrollTo(l.id)} className="text-sm font-medium text-[rgba(245,247,242,0.62)] transition-colors hover:text-[#F5F7F2]">
                {l.label}
              </a>
            ))}
            <a href="#order" onClick={scrollTo('order')} className="volt-btn-primary rounded-full px-5 py-2 text-sm font-bold text-[#06060B]">
              להזמנה
            </a>
          </div>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-lg border border-[rgba(255,255,255,0.12)] md:hidden" onClick={() => setMenuOpen((v) => !v)} aria-label="תפריט" aria-expanded={menuOpen}>
            <div className="space-y-1.5">
              <span className={`block h-0.5 w-5 bg-[#F5F7F2] transition-transform ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
              <span className={`block h-0.5 w-5 bg-[#F5F7F2] transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-5 bg-[#F5F7F2] transition-transform ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
            </div>
          </button>
        </nav>
        {menuOpen && (
          <div className="border-t border-[rgba(255,255,255,0.07)] px-5 py-4 md:hidden">
            {navLinks.map((l) => (
              <a key={l.id} href={`#${l.id}`} onClick={scrollTo(l.id)} className="block py-2.5 text-base font-medium text-[rgba(245,247,242,0.8)]">
                {l.label}
              </a>
            ))}
            <a href="#order" onClick={scrollTo('order')} className="volt-btn-primary mt-3 block rounded-full px-5 py-2.5 text-center text-sm font-bold text-[#06060B]">
              להזמנה
            </a>
          </div>
        )}
      </header>

      {/* ─── Hero ─── */}
      <section id="top" className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-32 lg:grid-cols-[1.1fr_0.9fr] lg:pb-28 lg:pt-40">
        <div className="relative z-10 text-center lg:text-right">
          <div className="v-reveal v-in mb-6 inline-flex items-center gap-2 rounded-full border border-[rgba(182,255,59,0.3)] bg-[rgba(182,255,59,0.08)] px-4 py-1.5 text-sm font-semibold text-[#B6FF3B]">
            <Flame size={15} />
            משקה האנרגיה החדש של ישראל
          </div>
          <h1 className="v-reveal v-in text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            אנרגיה
            {' '}
            <span className="volt-grad-text">שמרגישים</span>
            <br />
            בכל לגימה
          </h1>
          <p className="v-reveal v-in mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[rgba(245,247,242,0.62)] lg:mx-0">
            200 מ״ג קפאין טבעי, אפס סוכר, ומיקוד שנשאר איתך שעות — בלי ההתרסקות של אחרי.
            שלושה טעמים, פחית אחת קרה, ואתם במצב טיסה.
          </p>
          <div className="v-reveal v-in mt-9 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
            <a href="#order" onClick={scrollTo('order')} className="volt-btn-primary inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-extrabold text-[#06060B]">
              <Zap size={18} strokeWidth={2.6} />
              להזמין עכשיו
            </a>
            <a href="#flavors" onClick={scrollTo('flavors')} className="volt-btn-ghost inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.18)] px-8 py-4 text-base font-bold text-[#F5F7F2]">
              לגלות את הטעמים
              <ArrowLeft size={17} />
            </a>
          </div>
          <dl className="v-reveal v-in mt-12 grid grid-cols-2 gap-6 border-t border-[rgba(255,255,255,0.08)] pt-8 sm:grid-cols-4">
            {[
              ['200mg', 'קפאין טבעי'],
              ['0g', 'סוכר'],
              ['12', 'קלוריות בלבד'],
              ['330ml', 'פחית מוגזת'],
            ].map(([v, l]) => (
              <div key={l} className="text-center lg:text-right">
                <dd className="text-2xl font-extrabold text-[#B6FF3B] sm:text-3xl" style={{ fontVariantNumeric: 'tabular-nums' }}>{v}</dd>
                <dt className="mt-1 block text-xs text-[rgba(245,247,242,0.5)]">{l}</dt>
              </div>
            ))}
          </dl>
        </div>

        {/* hero can + floating chips */}
        <div className="relative mx-auto flex h-[460px] w-[320px] items-center justify-center sm:h-[540px] sm:w-[380px]">
          <div aria-hidden className="absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(182,255,59,0.28), transparent 65%)' }} />
          <div className="volt-hero-can">
            <Can
              c1="#B6FF3B"
              c2="#2EE96B"
              label="VOLT"
              sub="ENERGY"
              className="h-[420px] w-auto sm:h-[500px]"
              style={{ filter: 'drop-shadow(0 40px 70px rgba(182,255,59,0.35))' }}
            />
          </div>
          <div className="volt-chip-f absolute right-[-3%] top-[9%] z-10 flex items-center gap-2 rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(12,12,20,0.85)] px-4 py-2.5 text-sm font-bold backdrop-blur-md">
            <Zap size={15} className="text-[#B6FF3B]" /> בוסט מיידי
          </div>
          <div className="volt-chip-f absolute bottom-[10%] right-[-6%] z-10 flex items-center gap-2 rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(12,12,20,0.85)] px-4 py-2.5 text-sm font-bold backdrop-blur-md" style={{ animationDelay: '-1.6s' }}>
            <Leaf size={15} className="text-[#5DFF7E]" /> 0 סוכר
          </div>
          <div className="volt-chip-f absolute left-[-6%] top-[42%] z-10 flex items-center gap-2 rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(12,12,20,0.85)] px-4 py-2.5 text-sm font-bold backdrop-blur-md" style={{ animationDelay: '-3.2s' }}>
            <Brain size={15} className="text-[#35E0C2]" /> מיקוד מלא
          </div>
        </div>
      </section>

      {/* ─── Marquee ─── */}
      <div className="volt-marquee relative z-10 overflow-hidden border-y border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] py-4" dir="ltr">
        <div className="volt-marquee-track flex w-max items-center gap-10 whitespace-nowrap pl-10">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="flex items-center gap-10 text-sm font-bold uppercase tracking-[0.25em] text-[rgba(245,247,242,0.45)]">
              {item}
              <Zap size={13} className="text-[#B6FF3B]" />
            </span>
          ))}
        </div>
      </div>

      {/* ─── Flavors ─── */}
      <section id="flavors" className="relative z-10 mx-auto max-w-6xl scroll-mt-24 px-5 py-24">
        <SectionHeading
          eyebrow="שלושה טעמים, אפס פשרות"
          title="בחרו את הזרם שלכם"
          sub="כל טעם פותח במשך שנה עם טעימות עיוורות של יותר מ-2,000 אנשים. נשארו רק השלושה שניצחו."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {FLAVORS.map((f, i) => <FlavorCard key={f.id} flavor={f} index={i} />)}
        </div>
      </section>

      {/* ─── Benefits bento ─── */}
      <section id="benefits" className="relative z-10 mx-auto max-w-6xl scroll-mt-24 px-5 py-24">
        <SectionHeading
          eyebrow="שקיפות מלאה על התווית"
          title="מה באמת יש בפנים"
          sub="בלי אותיות קטנות: כל רכיב בפחית נבחר בקפידה, וכל מה שלא צריך — נשאר בחוץ."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b, i) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className={`v-reveal volt-tilt group rounded-3xl border border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.03)] p-7 ${b.span || ''}`}
                style={{ transitionDelay: `${(i % 3) * 80}ms` }}
              >
                <div className="mb-5 inline-grid h-12 w-12 place-items-center rounded-2xl border border-[rgba(182,255,59,0.3)] bg-[rgba(182,255,59,0.08)] text-[#B6FF3B] transition-transform duration-300 group-hover:scale-110">
                  <Icon size={22} />
                </div>
                <h3 className="text-xl font-extrabold text-[#F5F7F2]">{b.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[rgba(245,247,242,0.62)] sm:text-[15px]">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section id="reviews" className="relative z-10 mx-auto max-w-6xl scroll-mt-24 px-5 py-24">
        <SectionHeading
          eyebrow="4.9 מתוך 5 · מעל 3,000 ביקורות"
          title="אל תאמינו לנו. תאמינו להם."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <figure
              key={t.name}
              className="v-reveal volt-tilt flex flex-col rounded-3xl border border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.03)] p-7"
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <div className="mb-4 flex gap-1 text-[#B6FF3B]">
                {Array.from({ length: 5 }).map((_, s) => <Star key={s} size={15} fill="currentColor" />)}
              </div>
              <blockquote className="flex-1 text-[15px] leading-relaxed text-[rgba(245,247,242,0.82)]">
                ״{t.quote}״
              </blockquote>
              <figcaption className="mt-6 border-t border-[rgba(255,255,255,0.08)] pt-4">
                <div className="font-bold text-[#F5F7F2]">{t.name}</div>
                <div className="text-xs text-[rgba(245,247,242,0.5)]">{t.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="relative z-10 mx-auto max-w-3xl scroll-mt-24 px-5 py-24">
        <SectionHeading eyebrow="יש שאלות? יש תשובות" title="שאלות נפוצות" />
        <div className="space-y-4">
          {FAQ.map((item, i) => (
            <FaqItem
              key={item.q}
              item={item}
              open={openFaq === i}
              onToggle={() => setOpenFaq(openFaq === i ? -1 : i)}
            />
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section id="order" className="relative z-10 mx-auto max-w-6xl scroll-mt-24 px-5 pb-28 pt-8">
        <div className="v-reveal relative overflow-hidden rounded-[2.5rem] border border-[rgba(182,255,59,0.25)] px-6 py-16 text-center sm:px-12 sm:py-20">
          <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(80% 120% at 50% 0%, rgba(182,255,59,0.16), rgba(6,6,11,0.4) 60%)' }} />
          <div aria-hidden className="volt-orb absolute -bottom-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(93,255,126,0.3), transparent 70%)' }} />
          <div className="relative">
            <h2 className="text-4xl font-black leading-tight sm:text-6xl">
              מוכנים להרגיש
              {' '}
              <span className="volt-grad-text">את הזרם?</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[rgba(245,247,242,0.62)] sm:text-lg">
              מארז היכרות: 12 פחיות בשלושת הטעמים ב-₪129 במקום ₪178, עם משלוח חינם עד הבית.
              לא התאהבתם? מחזירים לכם הכול עד 30 יום.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <a href="#top" onClick={scrollTo('top')} className="volt-btn-primary inline-flex items-center gap-2 rounded-full px-10 py-4 text-lg font-extrabold text-[#06060B]">
                <Zap size={19} strokeWidth={2.6} />
                להזמין מארז היכרות
              </a>
            </div>
            <p className="mt-5 text-xs text-[rgba(245,247,242,0.4)]">
              משלוח 1–3 ימי עסקים · תשלום מאובטח · החזר כספי מלא עד 30 יום
            </p>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="relative z-10 border-t border-[rgba(255,255,255,0.07)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-5 py-10 sm:flex-row">
          <div className="flex items-center gap-2 text-lg font-black text-[#F5F7F2]">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-[#B6FF3B] to-[#5DFF7E] text-[#06060B]">
              <Zap size={15} strokeWidth={2.6} />
            </span>
            VOLT
          </div>
          <p className="text-xs text-[rgba(245,247,242,0.4)]">
            לא מיועד מתחת לגיל 18, לנשים בהריון או לרגישים לקפאין · עד פחית אחת ביום
          </p>
          <p className="text-xs text-[rgba(245,247,242,0.4)]">© {new Date().getFullYear()} VOLT Energy</p>
        </div>
      </footer>
    </div>
  );
}
