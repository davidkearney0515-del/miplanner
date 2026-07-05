const {
  useState,
  useEffect,
  useMemo,
  useRef,
  Fragment
} = React;
const SUPA_URL = "https://snfedklqaalhwooqyzbf.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuZmVka2xxYWFsaHdvb3F5emJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3ODQzMTcsImV4cCI6MjA5ODM2MDMxN30.yj9di1yRZXI5h7U-woNg-oe1EqyEQeRXAVTqgooNF4Y";
const SUPA_TABLE = "mi_planner_state";
const SUPA_ROW = "v2_main";
const SUPA_CRE = "v2_creatives";
const V1_MAIN = "default";
const V1_CRE = "creatives";
const SUPA_HDRS = {
  "apikey": SUPA_KEY,
  "Authorization": "Bearer " + SUPA_KEY,
  "Content-Type": "application/json"
};
const XLSX_NPM = window.XLSX;
if (typeof window !== "undefined" && !window.storage) {
  var storagePrefix = "pointsbet-mi-planner:";
  window.storage = {
    get: async function (key) {
      var value = window.localStorage.getItem(storagePrefix + key);
      return value === null ? null : {
        value: value
      };
    },
    set: async function (key, value) {
      window.localStorage.setItem(storagePrefix + key, String(value));
    },
    delete: async function (key) {
      window.localStorage.removeItem(storagePrefix + key);
    }
  };
}
function localISO(d) {
  var y = d.getFullYear(),
    m = ('0' + (d.getMonth() + 1)).slice(-2),
    dd = ('0' + d.getDate()).slice(-2);
  return y + '-' + m + '-' + dd;
}
const TODAY = localISO(new Date());
function currentWeekSunday() {
  var d = new Date();
  d.setDate(d.getDate() - d.getDay());
  return localISO(d);
}
const SV = "5";
const fmt = s => s ? s.split('-').reverse().join('/') : '—';
const fmtShort = s => s ? s.split('-').reverse().join('/').slice(0, 5) : '';
const CATS = ["AFL", "NRL", "NBA", "MLB", "Racing", "Foxcatcher/StatMate", "World Cup", "Other"];
const CAT_ORDER = ["NRL", "AFL", "NBA", "MLB", "Racing", "Foxcatcher/StatMate", "World Cup", "Other"];
const CAT_COL = {
  NRL: '#dc2626',
  AFL: '#2563eb',
  NBA: '#7c3aed',
  MLB: '#0891b2',
  Racing: '#059669',
  'Foxcatcher/StatMate': '#d97706',
  'World Cup': '#0369a1',
  Other: '#6b7280'
};
const PLATFORMS = [{
  k: 'tv',
  label: '📺 TV'
}, {
  k: 'radio',
  label: '📻 Radio'
}];
const NETS = [{
  k: 'fox',
  label: 'Fox Footy',
  platform: 'tv',
  geo: 'National'
}, {
  k: 'espn',
  label: 'ESPN/Disney',
  platform: 'tv',
  geo: 'National'
}, {
  k: 'rdc',
  label: 'RDC',
  platform: 'tv',
  geo: 'National',
  customMI: true
}, {
  k: 'nine',
  label: 'Nine Radio',
  platform: 'radio',
  geo: 'NSW + QLD'
}, {
  k: 'sen',
  label: 'SEN Radio',
  platform: 'radio',
  geo: 'VIC / SA / TAS'
}, {
  k: 'triplem',
  label: 'Triple M',
  platform: 'radio',
  geo: 'Sydney metro'
}];
const ALL_NET_KEYS = NETS.map(function (n) {
  return n.k;
});
const BLANK_NETS = function () {
  var o = {};
  ALL_NET_KEYS.forEach(function (k) {
    o[k] = false;
  });
  return o;
}();
const BLANK = {
  keyNumber: '',
  title: '',
  dur: '30',
  cat: 'AFL',
  air: '',
  end: '',
  nets: {
    ...BLANK_NETS
  }
};
const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const DAY_L = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const RDC_DAYPARTS = [{
  k: 'morning',
  label: 'Morning Programming',
  time: '8am-11am AEST/AEDT',
  booked: function () {
    return '2.5 minutes';
  }
}, {
  k: 'liveRaceday',
  label: 'Live Raceday Broadcast',
  time: '11am - 6:00pm AEST/AEDT',
  booked: function (d) {
    return d === 'sat' ? '2 minutes' : '2.5 minutes';
  }
}, {
  k: 'liveRacenight',
  label: 'Live Racenight Broadcast',
  time: 'Start of Live racenight \u2013 until the conclusion',
  booked: function () {
    return '1min';
  },
  daysOnly: ['thu', 'fri']
}, {
  k: 'evening',
  label: 'Evening Programing',
  time: '6:00pm - 11:00pm AEST/AEDT',
  booked: function () {
    return '2.5 minutes';
  }
}, {
  k: 'lateNight',
  label: 'Late Night Programming',
  time: '11pm - 8am : RG Advertising',
  booked: function () {
    return 'BONUS';
  }
}];
const RDC_DP_COL = {
  morning: '#1e3a5f',
  liveRaceday: '#0f5132',
  liveRacenight: '#4a1a6e',
  evening: '#7c2d12',
  lateNight: '#374151'
};
function ordinal(n) {
  var s = ['th', 'st', 'nd', 'rd'],
    v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
var FULL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function fmtRDC(ds) {
  if (!ds) return '';
  var d = new Date(ds + 'T00:00:00');
  return FULL_DAYS[d.getDay()] + ' ' + ordinal(d.getDate()) + ' ' + MONTH_NAMES[d.getMonth()] + ' ' + d.getFullYear();
}
function addDaysISO(iso, n) {
  var d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n);
  var y = d.getFullYear(),
    m = ('0' + (d.getMonth() + 1)).slice(-2),
    dd = ('0' + d.getDate()).slice(-2);
  return y + '-' + m + '-' + dd;
}
function getDueDate(wcStr, di) {
  var d = new Date(wcStr + 'T00:00:00');
  d.setDate(d.getDate() + (di <= 2 ? -4 : -2));
  return d.toISOString().split('T')[0];
}
function stripDur(t) {
  return t ? t.replace(/\s*:?\d+s?\s*$/, '').trim() : '';
}
function getXLSX() {
  return typeof window !== 'undefined' && window.__xlsxStyleLoaded && window.XLSX ? window.XLSX : XLSX_NPM;
}
// Parse booked labels ("2.5 minutes","1min","30 seconds") to total seconds; null for non-numeric (BONUS)
function parseBooked(label) {
  if (!label) return null;
  var s = String(label).toLowerCase();
  if (s.indexOf('bonus') >= 0) return null;
  var m = s.match(/([\d.]+)\s*min/);
  if (m) return Math.round(parseFloat(m[1]) * 60);
  var sec = s.match(/([\d.]+)\s*sec/);
  if (sec) return Math.round(parseFloat(sec[1]));
  var n = s.match(/([\d.]+)/);
  return n ? Math.round(parseFloat(n[1])) : null;
}
function fmtSecs(sec) {
  if (sec == null) return '';
  if (sec < 60) return sec + 's';
  var m = sec / 60;
  return (m === Math.floor(m) ? m : m.toFixed(1).replace(/\.0$/, '')) + 'min' + (sec % 60 ? ' ' + sec % 60 + 's' : '');
}
function spotDur(spot, creatives) {
  for (var i = 0; i < creatives.length; i++) {
    if (creatives[i].keyNumber === spot.k) return parseInt(creatives[i].dur) || 0;
  }
  return 0;
}
function spotQty(spot) {
  var q = parseInt(spot.q);
  return q > 0 ? q : spot.k ? 1 : 0;
}
function dpTotalSecs(spots, creatives) {
  if (!spots) return 0;
  return spots.reduce(function (s, sp) {
    return s + spotQty(sp) * spotDur(sp, creatives);
  }, 0);
}
function initRdcWeek() {
  var w = {};
  DAYS.forEach(function (day) {
    w[day] = {};
    RDC_DAYPARTS.forEach(function (dp) {
      if (dp.daysOnly && !dp.daysOnly.includes(day)) return;
      w[day][dp.k] = dp.k === 'lateNight' ? [{
        k: 'FXC26BRPA30',
        q: '1',
        i: '',
        t: 'Follow Foxcatcher'
      }] : [];
    });
  });
  return w;
}
const getWeekDates = function (wc) {
  try {
    return DAYS.map(function (_, i) {
      var d = new Date(wc);
      d.setDate(d.getDate() + i);
      return d.toISOString().split('T')[0];
    });
  } catch (e) {
    return DAYS.map(function () {
      return '';
    });
  }
};
const dayEnabled = function (c, date) {
  if (!date) return false;
  return (c.air || '0000-00-00') <= date && date <= (c.end || '9999-12-31');
};
const clamp = function (v) {
  return v === '' ? '' : String(Math.max(0, Math.min(100, parseInt(v) || 0)));
};
function weeklyState(nr, em) {
  if (!nr || !em) return {
    val: '',
    mix: false
  };
  var en = DAYS.filter(function (d) {
    return em[d];
  });
  if (!en.length) return {
    val: '',
    mix: false
  };
  var vals = en.map(function (d) {
    return nr[d] || '';
  }).filter(function (v) {
    return v !== '';
  });
  if (!vals.length) return {
    val: '',
    mix: false
  };
  var f = vals[0];
  if (vals.length === en.length && vals.every(function (v) {
    return v === f;
  })) return {
    val: f,
    mix: false
  };
  return {
    val: '',
    mix: true
  };
}
function cStatus(c) {
  if (!c) return 'active';
  if (c.end && c.end < TODAY) return 'expired';
  if (c.air && c.air > TODAY) return 'upcoming';
  if (c.end && (new Date(c.end) - new Date(TODAY)) / 864e5 <= 7) return 'expiring';
  return 'active';
}
var ST = {
  expired: {
    bg: '#f3f4f6',
    tx: '#9ca3af',
    badge: 'Expired'
  },
  upcoming: {
    bg: '#dbeafe',
    tx: '#1e40af',
    badge: 'Not yet live'
  },
  expiring: {
    bg: '#fef3c7',
    tx: '#92400e',
    badge: 'Expiring soon'
  },
  active: {
    bg: '#fff',
    tx: '#111827',
    badge: null
  }
};
var TH = {
  padding: '6px 8px',
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 700,
  color: '#374151',
  borderBottom: '1px solid #e5e7eb',
  whiteSpace: 'nowrap',
  backgroundColor: '#f9fafb'
};
var TD = {
  padding: '6px 8px',
  fontSize: 12,
  verticalAlign: 'middle'
};
function totStyle(v) {
  if (v === 100) return {
    co: '#166534',
    bg: '#dcfce7',
    bo: '#86efac'
  };
  if (v > 0) return {
    co: '#991b1b',
    bg: '#fee2e2',
    bo: '#fca5a5'
  };
  return {
    co: '#9ca3af',
    bg: '#f9fafb',
    bo: '#e5e7eb'
  };
}
function CatBadge(props) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      padding: '1px 6px',
      borderRadius: 8,
      backgroundColor: CAT_COL[props.cat] + '22',
      color: CAT_COL[props.cat],
      fontWeight: 700,
      border: '1px solid ' + CAT_COL[props.cat] + '44'
    }
  }, props.cat);
}
const DEFAULT_EMAILS = {
  fox: {
    to: 'Fiorella.Alvarez@foxtel.com.au',
    cc: 'Caterina.Imbro@foxtel.com.au,FoxtelMediaTraffic@foxtel.com.au',
    subject: 'PointsBet \u2014 Fox Footy Material Instructions WC [WC_DATE]',
    body: 'Hi Fiorella,\n\nPlease find attached the Material Instructions for the week commencing [WC_DATE].\n\nRegards'
  },
  espn: {
    to: 'Krista.Jenkins@disney.com',
    cc: 'Peter.X.Pavlakis@disney.com',
    subject: 'PointsBet \u2014 ESPN/Disney Material Instructions WC [WC_DATE]',
    body: 'Hi Krista,\n\nPlease find attached the Material Instructions for the week commencing [WC_DATE].\n\nRegards'
  },
  rdc: {
    to: 'LBateman@racing.com',
    cc: 'SMiller@racing.com',
    subject: 'PointsBet \u2014 RDC Material Instructions WC [WC_DATE]',
    body: 'Hi Lucy,\n\nPlease find attached the Material Instructions for the week commencing [WC_DATE].\n\nSome material will need to be fed through over the coming days.\n\nRegards'
  },
  nine: {
    to: '',
    cc: '',
    subject: 'PointsBet \u2014 Nine Radio Material Instructions WC [WC_DATE]',
    body: 'Hi,\n\nPlease find attached the Material Instructions for the week commencing [WC_DATE].\n\nRegards'
  },
  sen: {
    to: 'sophie.healy@sen.com.au,darcy.kennelly@sen.com.au',
    cc: '',
    subject: 'PointsBet \u2014 SEN Radio Material Instructions WC [WC_DATE]',
    body: 'Hi Sophie and Darcy,\n\nPlease find attached the Material Instructions for the week commencing [WC_DATE].\n\nRegards'
  },
  triplem: {
    to: 'stella.dakin@sca.com.au,samantha.valk@sca.com.au',
    cc: '',
    subject: 'PointsBet \u2014 Triple M Material Instructions WC [WC_DATE]',
    body: 'Hi Stella and Sam,\n\nPlease find attached the Material Instructions for the week commencing [WC_DATE].\n\nRegards'
  }
};
const DEFAULTS = [{
  id: 1,
  keyNumber: "PB26NS1FN30C1",
  title: "NRL Origin G1 - First Try NSW :30",
  dur: "30",
  cat: "NRL",
  air: "",
  end: "2026-05-27",
  nets: {
    fox: true,
    espn: true,
    rdc: true,
    nine: false,
    sen: false,
    triplem: false
  }
}, {
  id: 2,
  keyNumber: "PB26NS1FN15C1",
  title: "NRL Origin G1 - First Try NSW :15",
  dur: "15",
  cat: "NRL",
  air: "",
  end: "2026-05-27",
  nets: {
    fox: true,
    espn: true,
    rdc: false,
    nine: false,
    sen: false,
    triplem: false
  }
}, {
  id: 3,
  keyNumber: "PB26NS1FQ30C1",
  title: "NRL Origin G1 - First Try QLD :30",
  dur: "30",
  cat: "NRL",
  air: "",
  end: "2026-05-27",
  nets: {
    fox: true,
    espn: true,
    rdc: true,
    nine: false,
    sen: false,
    triplem: false
  }
}, {
  id: 4,
  keyNumber: "PB26NS1FQ15C1",
  title: "NRL Origin G1 - First Try QLD :15",
  dur: "15",
  cat: "NRL",
  air: "",
  end: "2026-05-27",
  nets: {
    fox: true,
    espn: true,
    rdc: false,
    nine: false,
    sen: false,
    triplem: false
  }
}, {
  id: 5,
  keyNumber: "PB26AP11R30C1",
  title: "AFL Pull Em R11 :30",
  dur: "30",
  cat: "AFL",
  air: "",
  end: "2026-05-25",
  nets: {
    fox: true,
    espn: true,
    rdc: true,
    nine: false,
    sen: false,
    triplem: false
  }
}, {
  id: 6,
  keyNumber: "PB26AP11R15C1",
  title: "AFL Pull Em R11 :15",
  dur: "15",
  cat: "AFL",
  air: "",
  end: "2026-05-25",
  nets: {
    fox: true,
    espn: true,
    rdc: true,
    nine: false,
    sen: false,
    triplem: false
  }
}, {
  id: 7,
  keyNumber: "PB26AP12R30C1",
  title: "AFL Pull Em R12 :30",
  dur: "30",
  cat: "AFL",
  air: "2026-05-28",
  end: "2026-06-01",
  nets: {
    fox: true,
    espn: true,
    rdc: true,
    nine: false,
    sen: false,
    triplem: false
  }
}, {
  id: 8,
  keyNumber: "PB26AP12R15C1",
  title: "AFL Pull Em R12 :15",
  dur: "15",
  cat: "AFL",
  air: "2026-05-28",
  end: "2026-06-01",
  nets: {
    fox: true,
    espn: true,
    rdc: true,
    nine: false,
    sen: false,
    triplem: false
  }
}, {
  id: 27,
  keyNumber: "PB26AP13R30C1",
  title: "AFL Pull Em R13 :30",
  dur: "30",
  cat: "AFL",
  air: "2026-05-31",
  end: "2026-06-07",
  nets: {
    fox: true,
    espn: true,
    rdc: true,
    nine: false,
    sen: false,
    triplem: false
  }
}, {
  id: 28,
  keyNumber: "PB26AP13R15C1",
  title: "AFL Pull Em R13 :15",
  dur: "15",
  cat: "AFL",
  air: "2026-05-31",
  end: "2026-06-07",
  nets: {
    fox: true,
    espn: true,
    rdc: true,
    nine: false,
    sen: false,
    triplem: false
  }
}, {
  id: 9,
  keyNumber: "PB25BNSAF30C3",
  title: "SHAQ-5 Boys Night StatMate AFL Finals 1 :30",
  dur: "30",
  cat: "AFL",
  air: "",
  end: "",
  nets: {
    fox: true,
    espn: true,
    rdc: true,
    nine: false,
    sen: false,
    triplem: false
  }
}, {
  id: 10,
  keyNumber: "PB25EKAFL30C3",
  title: "SHAQ-5 Esky Lock Screen AFL Nick Daicos :30",
  dur: "30",
  cat: "AFL",
  air: "",
  end: "",
  nets: {
    fox: true,
    espn: true,
    rdc: true,
    nine: false,
    sen: false,
    triplem: false
  }
}, {
  id: 11,
  keyNumber: "PB25EKAFG30C3",
  title: "SHAQ-5 Esky Lock Screen AFL Bailey Smith :30",
  dur: "30",
  cat: "AFL",
  air: "",
  end: "",
  nets: {
    fox: true,
    espn: true,
    rdc: true,
    nine: false,
    sen: false,
    triplem: false
  }
}, {
  id: 12,
  keyNumber: "PB26NBP3P30C1",
  title: "NBA Pull Em Playoffs R3 :30",
  dur: "30",
  cat: "NBA",
  air: "",
  end: "2026-06-02",
  nets: {
    fox: true,
    espn: true,
    rdc: true,
    nine: false,
    sen: false,
    triplem: false
  }
}, {
  id: 29,
  keyNumber: "PB26NBF1P30C1",
  title: "NBA Pull Em Finals 1 :30",
  dur: "30",
  cat: "NBA",
  air: "2026-06-04",
  end: "2026-07-01",
  nets: {
    fox: true,
    espn: true,
    rdc: true,
    nine: false,
    sen: false,
    triplem: false
  }
}, {
  id: 13,
  keyNumber: "PB26FNB3P30C1",
  title: "SHAQ-5 Brand Fridge NBA Playoffs R3 :30",
  dur: "30",
  cat: "NBA",
  air: "",
  end: "",
  nets: {
    fox: true,
    espn: true,
    rdc: false,
    nine: false,
    sen: false,
    triplem: false
  }
}, {
  id: 30,
  keyNumber: "PB26SNB1F30C1",
  title: "Shopping 5 for $25 NBA Finals 1 :30",
  dur: "30",
  cat: "NBA",
  air: "2026-06-04",
  end: "2026-07-01",
  nets: {
    fox: true,
    espn: true,
    rdc: false,
    nine: false,
    sen: false,
    triplem: false
  }
}, {
  id: 14,
  keyNumber: "PB26SNB3P30C1",
  title: "Shopping 5 for $25 NBA Playoffs R3 :30",
  dur: "30",
  cat: "NBA",
  air: "",
  end: "",
  nets: {
    fox: true,
    espn: true,
    rdc: false,
    nine: false,
    sen: false,
    triplem: false
  }
}, {
  id: 15,
  keyNumber: "PB26BNB3P30C1",
  title: "SHAQ-5 Boys Night StatMate NBA Playoffs R3 :30",
  dur: "30",
  cat: "NBA",
  air: "",
  end: "",
  nets: {
    fox: true,
    espn: true,
    rdc: false,
    nine: false,
    sen: false,
    triplem: false
  }
}, {
  id: 31,
  keyNumber: "PB26BNB1F30C1",
  title: "SHAQ-5 Boys Night StatMate NBA Finals 1 :30",
  dur: "30",
  cat: "NBA",
  air: "2026-06-04",
  end: "2026-07-01",
  nets: {
    fox: true,
    espn: true,
    rdc: false,
    nine: false,
    sen: false,
    triplem: false
  }
}, {
  id: 16,
  keyNumber: "PB26ENB3P30C1",
  title: "SHAQ-5 Esky Lock Screen NBA Playoffs R3 :30",
  dur: "30",
  cat: "NBA",
  air: "",
  end: "",
  nets: {
    fox: true,
    espn: true,
    rdc: false,
    nine: false,
    sen: false,
    triplem: false
  }
}, {
  id: 32,
  keyNumber: "PB26ENB1F30C1",
  title: "SHAQ-5 Esky Lock Screen NBA Finals 1 :30",
  dur: "30",
  cat: "NBA",
  air: "2026-06-04",
  end: "2026-07-01",
  nets: {
    fox: true,
    espn: true,
    rdc: false,
    nine: false,
    sen: false,
    triplem: false
  }
}, {
  id: 17,
  keyNumber: "PB25NBAMP15C4",
  title: "NBA More Points Prop Lines Promo :15",
  dur: "15",
  cat: "NBA",
  air: "",
  end: "",
  nets: {
    fox: true,
    espn: true,
    rdc: false,
    nine: false,
    sen: false,
    triplem: false
  }
}, {
  id: 33,
  keyNumber: "PB26FRMLB30C5",
  title: "Fridge MLB 2026 :30",
  dur: "30",
  cat: "MLB",
  air: "",
  end: "",
  nets: {
    fox: true,
    espn: true,
    rdc: false,
    nine: false,
    sen: false,
    triplem: false
  }
}, {
  id: 34,
  keyNumber: "PB26EKMLB30C5",
  title: "Esky Lock Screen MLB 2026 :30",
  dur: "30",
  cat: "MLB",
  air: "",
  end: "",
  nets: {
    fox: true,
    espn: true,
    rdc: false,
    nine: false,
    sen: false,
    triplem: false
  }
}, {
  id: 18,
  keyNumber: "PB25FRRA30C4",
  title: "SHAQ-5 Brand Fridge Racing :30",
  dur: "30",
  cat: "Racing",
  air: "",
  end: "",
  nets: {
    fox: false,
    espn: false,
    rdc: true,
    nine: false,
    sen: false,
    triplem: false
  }
}, {
  id: 19,
  keyNumber: "PB25SDBMB30C4",
  title: "Beast Mode Generic Brand :30",
  dur: "30",
  cat: "Racing",
  air: "",
  end: "",
  nets: {
    fox: false,
    espn: false,
    rdc: true,
    nine: false,
    sen: false,
    triplem: false
  }
}, {
  id: 20,
  keyNumber: "PB25SHRCB30C4",
  title: "Racing 5for25 Shopping :30",
  dur: "30",
  cat: "Racing",
  air: "",
  end: "",
  nets: {
    fox: false,
    espn: false,
    rdc: true,
    nine: false,
    sen: false,
    triplem: false
  }
}, {
  id: 21,
  keyNumber: "PB25REXM15C3",
  title: "Racing Exclusive Markets :15",
  dur: "15",
  cat: "Racing",
  air: "",
  end: "",
  nets: {
    fox: false,
    espn: false,
    rdc: true,
    nine: false,
    sen: false,
    triplem: false
  }
}, {
  id: 22,
  keyNumber: "PB26RCBMS15C1",
  title: "RDC Beast Mode 27/05 (Today) :15",
  dur: "15",
  cat: "Racing",
  air: "2026-05-27",
  end: "2026-05-27",
  nets: {
    fox: false,
    espn: false,
    rdc: true,
    nine: false,
    sen: false,
    triplem: false
  }
}, {
  id: 23,
  keyNumber: "PB26RCBMT15C1",
  title: "RDC Beast Mode 27/05 (ON NOW) :15",
  dur: "15",
  cat: "Racing",
  air: "2026-05-27",
  end: "2026-05-27",
  nets: {
    fox: false,
    espn: false,
    rdc: true,
    nine: false,
    sen: false,
    triplem: false
  }
}, {
  id: 24,
  keyNumber: "FXC26BRPA30",
  title: "Follow Foxcatcher :30",
  dur: "30",
  cat: "Foxcatcher/StatMate",
  air: "",
  end: "",
  nets: {
    fox: true,
    espn: true,
    rdc: true,
    nine: false,
    sen: false,
    triplem: false
  }
}, {
  id: 25,
  keyNumber: "SM26AFLN30A",
  title: "StatMate AFL 2026 Update :30",
  dur: "30",
  cat: "Foxcatcher/StatMate",
  air: "",
  end: "",
  nets: {
    fox: true,
    espn: true,
    rdc: true,
    nine: false,
    sen: false,
    triplem: false
  }
}, {
  id: 26,
  keyNumber: "SM26NRLN30A",
  title: "StatMate NRL 2026 Update :30",
  dur: "30",
  cat: "Foxcatcher/StatMate",
  air: "",
  end: "",
  nets: {
    fox: true,
    espn: true,
    rdc: true,
    nine: false,
    sen: false,
    triplem: false
  }
}, {
  id: 35,
  keyNumber: "PBET0226-15-2-JZ",
  title: "Pull 'Em :15",
  dur: "15",
  cat: "Other",
  air: "2026-03-12",
  end: "2026-05-06",
  nets: {
    fox: false,
    espn: false,
    rdc: false,
    nine: false,
    sen: true,
    triplem: false
  }
}, {
  id: 36,
  keyNumber: "PBET0525-15-1-JZ",
  title: "5 for 25 :15",
  dur: "15",
  cat: "Other",
  air: "2026-05-07",
  end: "",
  nets: {
    fox: false,
    espn: false,
    rdc: false,
    nine: false,
    sen: true,
    triplem: false
  }
}, {
  id: 37,
  keyNumber: "PB20052026",
  title: "Triple M Commercial :30",
  dur: "30",
  cat: "Other",
  air: "2026-05-21",
  end: "2026-05-26",
  nets: {
    fox: false,
    espn: false,
    rdc: false,
    nine: false,
    sen: false,
    triplem: true
  }
}, {
  id: 38,
  keyNumber: "3PBE120226D",
  title: "Triple M Live Read :30",
  dur: "30",
  cat: "Other",
  air: "2026-02-27",
  end: "",
  nets: {
    fox: false,
    espn: false,
    rdc: false,
    nine: false,
    sen: false,
    triplem: true
  }
}, {
  id: 39,
  keyNumber: "PB190526B",
  title: "State of Origin Promo B :30",
  dur: "30",
  cat: "NRL",
  air: "2026-05-19",
  end: "2026-05-27",
  nets: {
    fox: false,
    espn: false,
    rdc: false,
    nine: true,
    sen: false,
    triplem: false
  }
}, {
  id: 40,
  keyNumber: "PB190526A",
  title: "State of Origin Promo A :30",
  dur: "30",
  cat: "NRL",
  air: "2026-05-19",
  end: "2026-05-27",
  nets: {
    fox: false,
    espn: false,
    rdc: false,
    nine: true,
    sen: false,
    triplem: false
  }
}, {
  id: 41,
  keyNumber: "PB190526L1",
  title: "State of Origin Live Read :45",
  dur: "45",
  cat: "NRL",
  air: "2026-05-19",
  end: "2026-05-27",
  nets: {
    fox: false,
    espn: false,
    rdc: false,
    nine: true,
    sen: false,
    triplem: false
  }
}, {
  id: 42,
  keyNumber: "3PBE300326A",
  title: "Nine Radio Generic Commercial :30",
  dur: "30",
  cat: "Other",
  air: "2026-05-28",
  end: "2026-05-31",
  nets: {
    fox: false,
    espn: false,
    rdc: false,
    nine: true,
    sen: false,
    triplem: false
  }
}, {
  id: 43,
  keyNumber: "PB190226L2",
  title: "Nine Radio Generic Live Read :45",
  dur: "45",
  cat: "Other",
  air: "2026-05-28",
  end: "2026-05-31",
  nets: {
    fox: false,
    espn: false,
    rdc: false,
    nine: true,
    sen: false,
    triplem: false
  }
}, {
  id: 44,
  keyNumber: "PB26WCPA30C1",
  title: "W-CUP - Pull 'Em 1 :30",
  dur: "30",
  cat: "World Cup",
  air: "2026-06-07",
  end: "2026-07-16",
  nets: {
    fox: true,
    espn: true,
    rdc: true,
    nine: false,
    sen: false,
    triplem: false
  }
}, {
  id: 45,
  keyNumber: "PB26WCPA15C1",
  title: "W-CUP - Pull 'Em 1 :15",
  dur: "15",
  cat: "World Cup",
  air: "2026-06-07",
  end: "2026-07-16",
  nets: {
    fox: true,
    espn: true,
    rdc: true,
    nine: false,
    sen: false,
    triplem: false
  }
}, {
  id: 46,
  keyNumber: "PB26AP14R30C1",
  title: "AFL Pull Em R14 :30",
  dur: "30",
  cat: "AFL",
  air: "2026-06-07",
  end: "2026-06-13",
  nets: {
    fox: true,
    espn: true,
    rdc: true,
    nine: false,
    sen: false,
    triplem: false
  }
}, {
  id: 47,
  keyNumber: "PB26AP14R15C1",
  title: "AFL Pull Em R14 :15",
  dur: "15",
  cat: "AFL",
  air: "2026-06-07",
  end: "2026-06-13",
  nets: {
    fox: true,
    espn: true,
    rdc: true,
    nine: false,
    sen: false,
    triplem: false
  }
}];
function PlatformBar(props) {
  var platform = props.platform,
    setPlatform = props.setPlatform,
    platformNets = props.platformNets;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: 16,
      padding: '10px 14px',
      backgroundColor: '#f9fafb',
      borderRadius: 8,
      border: '1px solid #e5e7eb'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      color: '#6b7280',
      marginRight: 4
    }
  }, "Platform:"), PLATFORMS.map(function (p) {
    return /*#__PURE__*/React.createElement("button", {
      key: p.k,
      onClick: function () {
        setPlatform(p.k);
      },
      style: {
        padding: '5px 18px',
        border: 'none',
        borderRadius: 20,
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: platform === p.k ? 700 : 500,
        backgroundColor: platform === p.k ? '#111827' : '#fff',
        color: platform === p.k ? '#fff' : '#6b7280',
        boxShadow: platform === p.k ? 'none' : '0 0 0 1px #e5e7eb'
      }
    }, p.label);
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 8,
      fontSize: 11,
      color: '#9ca3af'
    }
  }, platformNets.map(function (n) {
    return n.label + (n.geo ? ' (' + n.geo + ')' : '');
  }).join(' · ')));
}
function NetToggle(props) {
  var val = props.val,
    onChange = props.onChange,
    nets = props.nets;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      border: '1px solid #d1d5db',
      borderRadius: 6,
      overflow: 'hidden'
    }
  }, nets.map(function (n) {
    return /*#__PURE__*/React.createElement("button", {
      key: n.k,
      onClick: function () {
        onChange(n.k);
      },
      style: {
        padding: '5px 12px',
        border: 'none',
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: val === n.k ? 700 : 400,
        backgroundColor: val === n.k ? '#1d4ed8' : '#fff',
        color: val === n.k ? '#fff' : '#374151',
        borderRight: '1px solid #d1d5db'
      }
    }, n.label);
  }));
}
function CreativeRows(props) {
  var c = props.c,
    weekDates = props.weekDates,
    planNet = props.planNet,
    activeNote = props.activeNote,
    setActiveNote = props.setActiveNote;
  var getDR = props.getDR,
    setDR = props.setDR,
    setWeekly = props.setWeekly,
    getNote = props.getNote,
    setNote = props.setNote,
    hasAnyNote = props.hasAnyNote;
  var ss = ST[cStatus(c)],
    em = {};
  DAYS.forEach(function (d, i) {
    em[d] = dayEnabled(c, weekDates[i] || '');
  });
  var fnr = {};
  DAYS.forEach(function (d) {
    fnr[d] = getDR(c.id, planNet, d);
  });
  var ws = weeklyState(fnr, em),
    noteOpen = activeNote === c.id,
    anyNote = hasAnyNote(c.id);
  return /*#__PURE__*/React.createElement(Fragment, null, /*#__PURE__*/React.createElement("tr", {
    style: {
      backgroundColor: ss.bg,
      borderBottom: noteOpen ? 'none' : '1px solid #e5e7eb',
      color: ss.tx
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      ...TD,
      fontFamily: 'monospace',
      fontWeight: 700,
      fontSize: 10,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, c.keyNumber, ss.badge && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 8,
      marginLeft: 3,
      padding: '1px 3px',
      borderRadius: 5,
      backgroundColor: 'rgba(0,0,0,0.08)'
    }
  }, ss.badge), anyNote && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-block',
      width: 6,
      height: 6,
      borderRadius: '50%',
      backgroundColor: '#f59e0b',
      marginLeft: 4,
      verticalAlign: 'middle'
    }
  })), /*#__PURE__*/React.createElement("td", {
    style: {
      ...TD,
      fontSize: 11,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    title: c.title
  }, c.title), /*#__PURE__*/React.createElement("td", {
    style: {
      ...TD,
      textAlign: 'center',
      fontSize: 11
    }
  }, ":", c.dur), /*#__PURE__*/React.createElement("td", {
    style: {
      ...TD,
      fontSize: 10
    }
  }, c.air ? fmt(c.air) : '—'), /*#__PURE__*/React.createElement("td", {
    style: {
      ...TD,
      fontSize: 10
    }
  }, c.end ? fmt(c.end) : 'Ongoing'), /*#__PURE__*/React.createElement("td", {
    style: {
      ...TD,
      padding: 3,
      textAlign: 'center',
      backgroundColor: '#f0f9ff'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: 0,
    max: 100,
    value: ws.mix ? '' : ws.val,
    onChange: function (e) {
      setWeekly(c.id, planNet, e.target.value, em);
    },
    style: {
      width: 50,
      textAlign: 'center',
      border: '1px solid #93c5fd',
      borderRadius: 4,
      padding: '2px',
      fontSize: 12,
      backgroundColor: '#fff'
    },
    placeholder: ws.mix ? 'MIX' : '%'
  })), DAYS.map(function (day, i) {
    var en = em[day],
      val = getDR(c.id, planNet, day),
      note = getNote(c.id, day);
    return /*#__PURE__*/React.createElement("td", {
      key: day,
      style: {
        ...TD,
        padding: 3,
        textAlign: 'center',
        position: 'relative',
        backgroundColor: en ? 'transparent' : '#f4f4f5'
      }
    }, en ? /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "number",
      min: 0,
      max: 100,
      value: val,
      onChange: function (e) {
        setDR(c.id, planNet, day, e.target.value);
      },
      style: {
        width: 42,
        textAlign: 'center',
        border: '1px solid #d1d5db',
        borderRadius: 4,
        padding: '2px',
        fontSize: 12,
        backgroundColor: '#fff'
      },
      placeholder: "%"
    }), /*#__PURE__*/React.createElement("span", {
      onClick: function () {
        setActiveNote(noteOpen ? null : c.id);
      },
      title: note || 'Add note',
      style: {
        position: 'absolute',
        top: 2,
        right: 0,
        width: 7,
        height: 7,
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'inline-block',
        backgroundColor: note ? '#f59e0b' : val ? '#e5e7eb' : 'transparent',
        border: val && !note ? '1px solid #d1d5db' : 'none'
      }
    })) : /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#d1d5db',
        fontSize: 13
      }
    }, "—"));
  })), noteOpen && /*#__PURE__*/React.createElement("tr", {
    style: {
      backgroundColor: '#fffbeb',
      borderBottom: '1px solid #fde68a'
    }
  }, /*#__PURE__*/React.createElement("td", {
    colSpan: 13,
    style: {
      padding: '8px 12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: '#92400e',
      whiteSpace: 'nowrap',
      marginRight: 4
    }
  }, "📝 ", c.keyNumber, ":"), DAYS.map(function (day, i) {
    var en = dayEnabled(c, weekDates[i] || ''),
      nv = getNote(c.id, day);
    if (!en && !nv) return null;
    return /*#__PURE__*/React.createElement("div", {
      key: day,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        fontWeight: 600,
        color: en ? '#92400e' : '#9ca3af',
        whiteSpace: 'nowrap'
      }
    }, DAY_L[i], ":"), /*#__PURE__*/React.createElement("input", {
      type: "text",
      value: nv,
      onChange: function (e) {
        setNote(c.id, day, e.target.value);
      },
      placeholder: en ? 'Add note…' : '',
      disabled: !en,
      style: {
        width: 150,
        border: '1px solid #fbbf24',
        borderRadius: 4,
        padding: '2px 6px',
        fontSize: 11,
        backgroundColor: en ? '#fff' : '#f9fafb',
        color: en ? '#111' : '#9ca3af'
      }
    }));
  }), /*#__PURE__*/React.createElement("button", {
    onClick: function () {
      setActiveNote(null);
    },
    style: {
      marginLeft: 'auto',
      fontSize: 11,
      color: '#92400e',
      background: 'none',
      border: '1px solid #fbbf24',
      borderRadius: 4,
      padding: '2px 10px',
      cursor: 'pointer',
      fontWeight: 700
    }
  }, "Done")))));
}
function PlannerRows(props) {
  var grouped = props.grouped,
    weekDates = props.weekDates,
    rots = props.rots,
    notes = props.notes;
  var planNet = props.planNet,
    activeNote = props.activeNote,
    setActiveNote = props.setActiveNote,
    setRots = props.setRots,
    setNotes = props.setNotes;
  function getDR(id, net, day) {
    return rots[id] && rots[id][net] ? rots[id][net][day] || '' : '';
  }
  function getNote(id, day) {
    return notes[id] ? notes[id][day] || '' : '';
  }
  function setDR(id, net, day, val) {
    var v = clamp(val);
    setRots(function (p) {
      var r = {
        ...p
      };
      r[id] = {
        ...r[id]
      };
      r[id][net] = {
        ...(r[id][net] || {}),
        [day]: v
      };
      return r;
    });
  }
  function setWeekly(id, net, val, em) {
    var v = clamp(val);
    var cur = rots[id] && rots[id][net] || {};
    var upd = {
      ...cur
    };
    DAYS.forEach(function (d) {
      if (em[d]) upd[d] = v;
    });
    setRots(function (p) {
      return {
        ...p,
        [id]: {
          ...p[id],
          [net]: upd
        }
      };
    });
  }
  function setNote(id, day, text) {
    setNotes(function (p) {
      return {
        ...p,
        [id]: {
          ...(p[id] || {}),
          [day]: text
        }
      };
    });
  }
  function hasAnyNote(id) {
    return DAYS.some(function (d) {
      return !!getNote(id, d);
    });
  }
  var cats = CAT_ORDER.filter(function (cat) {
    return grouped[cat] && grouped[cat].length;
  });
  if (!cats.length) return null;
  return /*#__PURE__*/React.createElement(Fragment, null, cats.map(function (cat) {
    return /*#__PURE__*/React.createElement(Fragment, {
      key: cat
    }, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      colSpan: 13,
      style: {
        padding: '5px 8px',
        backgroundColor: CAT_COL[cat] + '15',
        borderTop: '2px solid ' + CAT_COL[cat] + '55'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 800,
        color: CAT_COL[cat],
        textTransform: 'uppercase',
        letterSpacing: '0.06em'
      }
    }, cat))), grouped[cat].map(function (c) {
      return /*#__PURE__*/React.createElement(CreativeRows, {
        key: c.id,
        c: c,
        weekDates: weekDates,
        planNet: planNet,
        activeNote: activeNote,
        setActiveNote: setActiveNote,
        getDR: getDR,
        setDR: setDR,
        setWeekly: setWeekly,
        getNote: getNote,
        setNote: setNote,
        hasAnyNote: hasAnyNote
      });
    }));
  }));
}
function RdcDaySection(props) {
  var dp = props.dp,
    rdcDay = props.rdcDay,
    spots = props.spots,
    creatives = props.creatives,
    weekDates = props.weekDates;
  var rdcCreatives = props.rdcCreatives,
    onAdd = props.onAdd,
    onRemove = props.onRemove,
    onKey = props.onKey,
    onField = props.onField;
  var copySources = props.copySources,
    onCopyFrom = props.onCopyFrom;
  var booked = dp.booked(rdcDay);
  var colr = RDC_DP_COL[dp.k] || '#374151';
  var bookedSecs = parseBooked(booked);
  var usedSecs = dpTotalSecs(spots, creatives);
  var tally = null;
  if (bookedSecs != null) {
    var st = usedSecs === bookedSecs ? {
      bg: '#dcfce7',
      co: '#166534',
      ic: '✓'
    } : usedSecs > bookedSecs ? {
      bg: '#fee2e2',
      co: '#991b1b',
      ic: '⚠'
    } : {
      bg: '#fef9c3',
      co: '#854d0e',
      ic: ''
    };
    tally = {
      st: st,
      text: fmtSecs(usedSecs) + ' / ' + fmtSecs(bookedSecs)
    };
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20,
      border: '1px solid #e5e7eb',
      borderRadius: 8,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      backgroundColor: colr,
      color: '#fff',
      padding: '8px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      fontSize: 13
    }
  }, dp.label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      opacity: 0.8
    }
  }, dp.time), tally && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      backgroundColor: tally.st.bg,
      color: tally.st.co,
      padding: '2px 10px',
      borderRadius: 12
    }
  }, tally.st.ic, " ", tally.text), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      fontSize: 12,
      fontWeight: 700,
      backgroundColor: 'rgba(255,255,255,0.2)',
      padding: '2px 10px',
      borderRadius: 12
    }
  }, booked)), spots.length > 0 && /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      backgroundColor: '#f9fafb'
    }
  }, /*#__PURE__*/React.createElement("th", {
    style: {
      ...TH,
      width: 200
    }
  }, "Creative"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...TH,
      width: 70,
      textAlign: 'center'
    }
  }, "Cat"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...TH,
      width: 40,
      textAlign: 'center'
    }
  }, "Dur"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...TH,
      width: 130
    }
  }, "Title"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...TH,
      width: 50,
      textAlign: 'center'
    }
  }, "Qty"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...TH,
      width: 55,
      textAlign: 'center'
    }
  }, "Total"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...TH,
      width: 140
    }
  }, "Cut-off note"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...TH,
      width: 90
    }
  }, "Expiry"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...TH,
      width: 30
    }
  }))), /*#__PURE__*/React.createElement("tbody", null, spots.map(function (spot, si) {
    var c = null;
    for (var i = 0; i < creatives.length; i++) {
      if (creatives[i].keyNumber === spot.k) {
        c = creatives[i];
        break;
      }
    }
    var siCopy = si;
    return /*#__PURE__*/React.createElement("tr", {
      key: si,
      style: {
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: si % 2 === 0 ? '#fff' : '#f9fafb'
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        ...TD,
        padding: '4px 8px'
      }
    }, /*#__PURE__*/React.createElement("select", {
      value: spot.k,
      onChange: function (e) {
        onKey(siCopy, e.target.value);
      },
      style: {
        width: '100%',
        border: '1px solid #d1d5db',
        borderRadius: 4,
        padding: '3px 6px',
        fontSize: 11,
        backgroundColor: '#fff'
      }
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "— Select creative —"), spot.k && !rdcCreatives.some(function (rc) {
      return rc.keyNumber === spot.k;
    }) && /*#__PURE__*/React.createElement("option", {
      value: spot.k
    }, "[Expired] ", spot.k, c ? ' — ' + stripDur(c.title) : ''), rdcCreatives.slice().sort(function (a, b) {
      var ai = CAT_ORDER.indexOf(a.cat),
        bi = CAT_ORDER.indexOf(b.cat);
      if (ai !== bi) return ai - bi;
      return a.keyNumber < b.keyNumber ? -1 : 1;
    }).map(function (rc) {
      return /*#__PURE__*/React.createElement("option", {
        key: rc.keyNumber,
        value: rc.keyNumber
      }, "[", rc.cat, "] ", rc.keyNumber, " — ", stripDur(rc.title));
    }))), /*#__PURE__*/React.createElement("td", {
      style: {
        ...TD,
        textAlign: 'center',
        fontSize: 11
      }
    }, c ? /*#__PURE__*/React.createElement(CatBadge, {
      cat: c.cat
    }) : '—'), /*#__PURE__*/React.createElement("td", {
      style: {
        ...TD,
        textAlign: 'center',
        fontSize: 11
      }
    }, c ? ':' + c.dur : '—'), /*#__PURE__*/React.createElement("td", {
      style: {
        ...TD,
        padding: '4px 6px'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      value: spot.t || '',
      onChange: function (e) {
        onField(siCopy, 't', e.target.value);
      },
      placeholder: c ? stripDur(c.title) : 'Title',
      style: {
        width: '100%',
        border: '1px solid #d1d5db',
        borderRadius: 4,
        padding: '3px 6px',
        fontSize: 11
      }
    })), /*#__PURE__*/React.createElement("td", {
      style: {
        ...TD,
        padding: '4px 6px',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "number",
      min: 1,
      value: spot.q == null || spot.q === '' ? spot.k ? 1 : '' : spot.q,
      onChange: function (e) {
        onField(siCopy, 'q', e.target.value);
      },
      style: {
        width: 40,
        textAlign: 'center',
        border: '1px solid #d1d5db',
        borderRadius: 4,
        padding: '3px',
        fontSize: 11
      }
    })), /*#__PURE__*/React.createElement("td", {
      style: {
        ...TD,
        textAlign: 'center',
        fontSize: 11,
        fontWeight: 600,
        color: '#374151'
      }
    }, c ? spotQty(spot) * (parseInt(c.dur) || 0) + 's' : '—'), /*#__PURE__*/React.createElement("td", {
      style: {
        ...TD,
        padding: '4px 6px'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      value: spot.i || '',
      onChange: function (e) {
        onField(siCopy, 'i', e.target.value);
      },
      placeholder: "e.g. Must run before midday",
      style: {
        width: '100%',
        border: '1px solid #d1d5db',
        borderRadius: 4,
        padding: '3px 6px',
        fontSize: 11
      }
    })), /*#__PURE__*/React.createElement("td", {
      style: {
        ...TD,
        fontSize: 11,
        color: '#6b7280'
      }
    }, c && c.end ? fmt(c.end) : '—'), /*#__PURE__*/React.createElement("td", {
      style: {
        ...TD,
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function () {
        onRemove(siCopy);
      },
      style: {
        color: '#ef4444',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: 16,
        lineHeight: 1
      }
    }, "×")));
  }))), spots.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 14px',
      color: '#9ca3af',
      fontSize: 12
    }
  }, "No spots added yet."), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 14px',
      backgroundColor: '#f9fafb',
      borderTop: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onAdd,
    style: {
      fontSize: 12,
      color: colr,
      background: 'none',
      border: '1px solid ' + colr,
      borderRadius: 5,
      padding: '4px 12px',
      cursor: 'pointer',
      fontWeight: 600
    }
  }, "+ Add Spot"), copySources && copySources.length > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: '#9ca3af'
    }
  }, "or copy from:"), /*#__PURE__*/React.createElement("select", {
    value: "",
    onChange: function (e) {
      if (e.target.value) {
        onCopyFrom(e.target.value);
        e.target.value = '';
      }
    },
    style: {
      border: '1px solid #d1d5db',
      borderRadius: 5,
      padding: '3px 6px',
      fontSize: 11,
      backgroundColor: '#fff',
      color: '#374151',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "— previous timeslot —"), copySources.map(function (s) {
    return /*#__PURE__*/React.createElement("option", {
      key: s.k,
      value: s.k
    }, s.label, " (", s.count, ")");
  })))));
}
function ContactEditor(props) {
  var net = props.net,
    cfg = props.cfg || {},
    onSave = props.onSave;
  var st = useState([]),
    rows = st[0],
    setRows = st[1];
  useEffect(function () {
    var r = [];
    (cfg.to || '').split(',').forEach(function (e) {
      e = e.trim();
      if (e) r.push({
        email: e,
        role: 'to'
      });
    });
    (cfg.cc || '').split(',').forEach(function (e) {
      e = e.trim();
      if (e) r.push({
        email: e,
        role: 'cc'
      });
    });
    setRows(r.length ? r : [{
      email: '',
      role: 'to'
    }]);
  }, [net]);
  function commit(next) {
    setRows(next);
    var to = next.filter(function (x) {
      return x.role === 'to' && x.email.trim();
    }).map(function (x) {
      return x.email.trim();
    }).join(',');
    var cc = next.filter(function (x) {
      return x.role === 'cc' && x.email.trim();
    }).map(function (x) {
      return x.email.trim();
    }).join(',');
    onSave(to, cc);
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: '#374151',
      display: 'block',
      marginBottom: 6
    }
  }, "Recipients"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 6
    }
  }, rows.map(function (r, i) {
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        gap: 6,
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("input", {
      value: r.email,
      placeholder: "name@network.com.au",
      onChange: function (e) {
        var v = e.target.value,
          next = rows.slice();
        next[i] = Object.assign({}, next[i], {
          email: v
        });
        commit(next);
      },
      style: {
        flex: 1,
        border: '1px solid #d1d5db',
        borderRadius: 5,
        padding: '6px 8px',
        fontSize: 12
      }
    }), /*#__PURE__*/React.createElement("select", {
      value: r.role,
      onChange: function (e) {
        var v = e.target.value,
          next = rows.slice();
        next[i] = Object.assign({}, next[i], {
          role: v
        });
        commit(next);
      },
      style: {
        border: '1px solid #d1d5db',
        borderRadius: 5,
        padding: '6px 6px',
        fontSize: 12,
        backgroundColor: r.role === 'to' ? '#eff6ff' : '#f9fafb'
      }
    }, /*#__PURE__*/React.createElement("option", {
      value: "to"
    }, "To"), /*#__PURE__*/React.createElement("option", {
      value: "cc"
    }, "CC")), /*#__PURE__*/React.createElement("button", {
      onClick: function () {
        var next = rows.filter(function (_, j) {
          return j !== i;
        });
        commit(next.length ? next : [{
          email: '',
          role: 'to'
        }]);
      },
      title: "Remove",
      style: {
        border: '1px solid #e5e7eb',
        background: '#fff',
        color: '#9ca3af',
        borderRadius: 5,
        padding: '5px 9px',
        fontSize: 12,
        cursor: 'pointer'
      }
    }, "\\u2715"));
  })), /*#__PURE__*/React.createElement("button", {
    onClick: function () {
      commit(rows.concat([{
        email: '',
        role: 'to'
      }]));
    },
    style: {
      marginTop: 8,
      border: '1px dashed #93c5fd',
      background: '#fff',
      color: '#1d4ed8',
      borderRadius: 5,
      padding: '5px 12px',
      fontSize: 12,
      cursor: 'pointer',
      fontWeight: 600
    }
  }, "+ Add person"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: '#9ca3af',
      marginTop: 4
    }
  }, "First \"To\" person\\u2019s name is used for the email greeting and rotation updates."));
}
function App() {
  var stTab = useState('library'),
    tab = stTab[0],
    setTab = stTab[1];
  var stPlatform = useState('tv'),
    platform = stPlatform[0],
    setPlatform = stPlatform[1];
  var stC = useState(DEFAULTS),
    creatives = stC[0],
    setC = stC[1];
  var stWC = useState(currentWeekSunday()),
    wc = stWC[0],
    setWC = stWC[1];
  var stRots = useState({}),
    allRots = stRots[0],
    setAllRots = stRots[1];
  var stNotes = useState({}),
    allNotes = stNotes[0],
    setAllNotes = stNotes[1];
  var stAN = useState(null),
    activeNote = stAN[0],
    setActiveNote = stAN[1];
  var stPN = useState('fox'),
    planNet = stPN[0],
    setPlanNet = stPN[1];
  var stON = useState('fox'),
    outNet = stON[0],
    setOutNet = stON[1];
  var stEN = useState('fox'),
    emailNet = stEN[0],
    setEmailNet = stEN[1];
  var stEC = useState(DEFAULT_EMAILS),
    emailConfig = stEC[0],
    setEmailConfig = stEC[1];
  var stRdcMI = useState({}),
    rdcMI = stRdcMI[0],
    setRdcMI = stRdcMI[1];
  var stRdcDay = useState('sun'),
    rdcDay = stRdcDay[0],
    setRdcDay = stRdcDay[1];
  var stAdd = useState(false),
    showAdd = stAdd[0],
    setShowAdd = stAdd[1];
  var stNewC = useState(BLANK),
    newC = stNewC[0],
    setNewC = stNewC[1];
  var stLoaded = useState(false),
    loaded = stLoaded[0],
    setLoaded = stLoaded[1];
  var stFlash = useState(''),
    flash = stFlash[0],
    setFlash = stFlash[1];
  var stConfirmClear = useState(false),
    confirmClear = stConfirmClear[0],
    setConfirmClear = stConfirmClear[1];
  var stFoxModal = useState(null),
    foxModal = stFoxModal[0],
    setFoxModal = stFoxModal[1];
  var stShowExp = useState(false),
    showExpired = stShowExp[0],
    setShowExpired = stShowExp[1];
  var stSent = useState({}),
    sentMap = stSent[0],
    setSentMap = stSent[1];
  var stDueOv = useState({}),
    dueOv = stDueOv[0],
    setDueOv = stDueOv[1];
  var stSync = useState('connecting'),
    syncStatus = stSync[0],
    setSyncStatus = stSync[1];
  var syncRef = useRef({
    client: Math.random().toString(36).slice(2),
    ready: false
  });
  var stSnaps = useState({}),
    snaps = stSnaps[0],
    setSnaps = stSnaps[1];
  var stViewSnap = useState(null),
    viewSnap = stViewSnap[0],
    setViewSnap = stViewSnap[1];
  function isWeekShape(o) {
    if (!o) return false;
    var ks = Object.keys(o);
    return ks.length > 0 && ks.every(function (k) {
      return /^\d{4}-\d{2}-\d{2}$/.test(k);
    });
  }
  function wrapWeek(o) {
    return isWeekShape(o) ? o : o && Object.keys(o).length ? function () {
      var w = {};
      w[currentWeekSunday()] = o;
      return w;
    }() : {};
  }
  var rots = allRots[wc] || {};
  var notes = allNotes[wc] || {};
  function setRots(updater) {
    setAllRots(function (p) {
      var cur = p[wc] || {};
      var next = typeof updater === 'function' ? updater(cur) : updater;
      var u = Object.assign({}, p);
      u[wc] = next;
      return u;
    });
  }
  function setNotes(updater) {
    setAllNotes(function (p) {
      var cur = p[wc] || {};
      var next = typeof updater === 'function' ? updater(cur) : updater;
      var u = Object.assign({}, p);
      u[wc] = next;
      return u;
    });
  }
  // Carry forward: opening a week with no data clones the most recent earlier week
  useEffect(function () {
    if (!loaded) return;
    function carry(all, setAll) {
      if (all[wc]) return;
      var weeks = Object.keys(all).filter(function (k) {
        return k < wc;
      }).sort();
      var src = weeks.length ? weeks[weeks.length - 1] : Object.keys(all).sort()[0];
      if (!src) return;
      setAll(function (p) {
        if (p[wc]) return p;
        var u = Object.assign({}, p);
        u[wc] = JSON.parse(JSON.stringify(p[src]));
        return u;
      });
    }
    carry(allRots, setAllRots);
    carry(allNotes, setAllNotes);
  }, [wc, loaded]);
  function isExpired(c) {
    return !!(c.end && c.end < TODAY);
  }
  useEffect(function () {
    (async function () {
      try {
        var ver = await window.storage.get('mi_v').catch(function () {
          return null;
        });
        if (!ver || ver.value !== SV) {
          await window.storage.set('mi_v', SV).catch(function () {});
          await window.storage.delete('mi_c').catch(function () {});
          await window.storage.delete('mi_r').catch(function () {});
        } else {
          var r1 = await window.storage.get('mi_c').catch(function () {
            return null;
          });
          if (r1 && r1.value) {
            try {
              var ld = JSON.parse(r1.value);
              var mg = ld.map(function (c) {
                var n = Object.assign({}, BLANK_NETS, c.nets);
                if (c.cat === 'AFL') n.rdc = true;
                return Object.assign({}, c, {
                  nets: n
                });
              });
              setC(mg);
              window.storage.set('mi_c', JSON.stringify(mg)).catch(function () {});
            } catch (e) {}
          }
          var r2 = await window.storage.get('mi2_r').catch(function () {
            return null;
          });
          if (!r2 || !r2.value) r2 = await window.storage.get('mi_r').catch(function () {
            return null;
          });
          if (r2 && r2.value) {
            try {
              setAllRots(wrapWeek(JSON.parse(r2.value)));
            } catch (e) {}
          }
          var r3 = await window.storage.get('mi_wc').catch(function () {
            return null;
          });
          if (r3 && r3.value) setWC(r3.value);
          var r4 = await window.storage.get('mi2_notes').catch(function () {
            return null;
          });
          if (!r4 || !r4.value) r4 = await window.storage.get('mi_notes').catch(function () {
            return null;
          });
          if (r4 && r4.value) {
            try {
              setAllNotes(wrapWeek(JSON.parse(r4.value)));
            } catch (e) {}
          }
          var r5 = await window.storage.get('mi_emails2').catch(function () {
            return null;
          });
          if (r5 && r5.value) {
            try {
              setEmailConfig(Object.assign({}, DEFAULT_EMAILS, JSON.parse(r5.value)));
            } catch (e) {}
          }
          var r6 = await window.storage.get('mi_platform').catch(function () {
            return null;
          });
          if (r6 && r6.value) setPlatform(r6.value);
          var r8 = await window.storage.get('mi_showexp').catch(function () {
            return null;
          });
          if (r8 && r8.value === '1') setShowExpired(true);
          var r9 = await window.storage.get('mi_sent').catch(function () {
            return null;
          });
          if (r9 && r9.value) {
            try {
              setSentMap(JSON.parse(r9.value));
            } catch (e) {}
          }
          var r10 = await window.storage.get('mi_dueov').catch(function () {
            return null;
          });
          if (r10 && r10.value) {
            try {
              setDueOv(JSON.parse(r10.value));
            } catch (e) {}
          }
          var r11 = await window.storage.get('mi2_snaps').catch(function () {
            return null;
          });
          if (r11 && r11.value) {
            try {
              setSnaps(JSON.parse(r11.value));
            } catch (e) {}
          }
          var r7 = await window.storage.get('mi_rdcmi').catch(function () {
            return null;
          });
          if (r7 && r7.value) {
            try {
              var rd = JSON.parse(r7.value);
              Object.keys(rd).forEach(function (wk) {
                var wd = rd[wk];
                if (!wd) return;
                DAYS.forEach(function (dy) {
                  if (!wd[dy]) return;
                  Object.keys(wd[dy]).forEach(function (dpk) {
                    (wd[dy][dpk] || []).forEach(function (sp) {
                      if (sp && sp.q == null) {
                        var m = String(sp.i || '').match(/(\d+)\s*x/i);
                        if (m) {
                          sp.q = m[1];
                          sp.i = String(sp.i).replace(/^\s*\d+\s*x\s*\d*\s*secs?\s*/i, '').replace(/^[\s—-]+/, '').trim();
                        } else if (sp.k) {
                          sp.q = '1';
                        }
                      }
                    });
                  });
                });
              });
              setRdcMI(rd);
            } catch (e) {}
          }
        }
      } catch (e) {}
      setLoaded(true);
    })();
  }, []);
  useEffect(function () {
    if (loaded) window.storage.set('mi_c', JSON.stringify(creatives)).catch(function () {});
  }, [creatives, loaded]);
  useEffect(function () {
    if (loaded) window.storage.set('mi2_r', JSON.stringify(allRots)).catch(function () {});
  }, [allRots, loaded]);
  useEffect(function () {
    if (loaded) window.storage.set('mi_wc', wc).catch(function () {});
  }, [wc, loaded]);
  useEffect(function () {
    if (loaded) window.storage.set('mi2_notes', JSON.stringify(allNotes)).catch(function () {});
  }, [allNotes, loaded]);
  useEffect(function () {
    if (loaded) window.storage.set('mi2_snaps', JSON.stringify(snaps)).catch(function () {});
  }, [snaps, loaded]);
  useEffect(function () {
    if (loaded) window.storage.set('mi_emails2', JSON.stringify(emailConfig)).catch(function () {});
  }, [emailConfig, loaded]);
  useEffect(function () {
    if (loaded) window.storage.set('mi_platform', platform).catch(function () {});
  }, [platform, loaded]);
  useEffect(function () {
    if (loaded) window.storage.set('mi_showexp', showExpired ? '1' : '0').catch(function () {});
  }, [showExpired, loaded]);
  useEffect(function () {
    if (loaded) window.storage.set('mi_sent', JSON.stringify(sentMap)).catch(function () {});
  }, [sentMap, loaded]);
  useEffect(function () {
    if (loaded) window.storage.set('mi_dueov', JSON.stringify(dueOv)).catch(function () {});
  }, [dueOv, loaded]);
  useEffect(function () {
    if (loaded) window.storage.set('mi_rdcmi', JSON.stringify(rdcMI)).catch(function () {});
  }, [rdcMI, loaded]);

  // Load xlsx-js-style (styled fork) from CDN so exports can carry cell colours/borders.
  useEffect(function () {
    if (typeof window === 'undefined' || window.__xlsxStyleLoaded) return;
    var s = document.createElement('script');
    s.src = '../vendor/xlsx.bundle.js';
    s.async = true;
    s.onload = function () {
      window.__xlsxStyleLoaded = true;
    };
    s.onerror = function () {
      var c = document.createElement('script');
      c.src = 'https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js';
      c.async = true;
      c.onload = function () {
        window.__xlsxStyleLoaded = true;
      };
      c.onerror = function () {
        console.warn('xlsx-js-style load failed \u2014 exports will lack styling');
      };
      document.head.appendChild(c);
    };
    document.head.appendChild(s);
  }, []);
  useEffect(function () {
    var pn = NETS.filter(function (n) {
      return n.platform === platform && !n.customMI;
    });
    var an = NETS.filter(function (n) {
      return n.platform === platform;
    });
    var fp = pn[0] ? pn[0].k : null;
    if (fp) {
      if (!pn.find(function (n) {
        return n.k === planNet;
      })) setPlanNet(fp);
      if (!pn.find(function (n) {
        return n.k === outNet;
      })) setOutNet(fp);
    }
    if (!an.find(function (n) {
      return n.k === emailNet;
    }) && an[0]) setEmailNet(an[0].k);
    setActiveNote(null);
  }, [platform]);
  var weekDates = useMemo(function () {
    return getWeekDates(wc);
  }, [wc]);
  var wcEnd = weekDates[6] || '';
  var platformNets = useMemo(function () {
    return NETS.filter(function (n) {
      return n.platform === platform && !n.customMI;
    });
  }, [platform]);
  var allPlatNets = useMemo(function () {
    return NETS.filter(function (n) {
      return n.platform === platform;
    });
  }, [platform]);
  var active = useMemo(function () {
    return creatives.filter(function (c) {
      return (c.air || '0000-00-00') <= wcEnd && (c.end || '9999-12-31') >= wc;
    });
  }, [creatives, wc, wcEnd]);
  function getDR(id, net, day) {
    return rots[id] && rots[id][net] ? rots[id][net][day] || '' : '';
  }
  function getNote(id, day) {
    return notes[id] ? notes[id][day] || '' : '';
  }
  var grouped = useMemo(function () {
    var g = {};
    CAT_ORDER.forEach(function (cat) {
      var it = active.filter(function (c) {
        return c.cat === cat && c.nets && c.nets[planNet] && (showExpired || !isExpired(c));
      });
      if (it.length) g[cat] = it;
    });
    return g;
  }, [active, planNet, showExpired]);
  var expiredCount = useMemo(function () {
    return creatives.filter(function (c) {
      return isExpired(c);
    }).length;
  }, [creatives]);
  var allGrouped = useMemo(function () {
    var g = {};
    CAT_ORDER.forEach(function (cat) {
      var it = creatives.filter(function (c) {
        return c.cat === cat && (showExpired || !isExpired(c));
      });
      if (it.length) g[cat] = it;
    });
    return g;
  }, [creatives, showExpired]);
  function outRows(net) {
    return active.filter(function (c) {
      return c.nets && c.nets[net] && DAYS.some(function (d) {
        return !!getDR(c.id, net, d);
      });
    });
  }
  var dayTotals = useMemo(function () {
    var t = {};
    DAYS.forEach(function (day, i) {
      t[day] = active.filter(function (c) {
        return c.nets && c.nets[planNet] && dayEnabled(c, weekDates[i] || '');
      }).reduce(function (s, c) {
        return s + (parseFloat(getDR(c.id, planNet, day)) || 0);
      }, 0);
    });
    return t;
  }, [active, planNet, rots, weekDates]);
  var rdcCreatives = useMemo(function () {
    return creatives.filter(function (c) {
      return c.nets && c.nets.rdc && (showExpired || !isExpired(c));
    });
  }, [creatives, showExpired]);
  function zap(msg) {
    setFlash(msg);
    setTimeout(function () {
      setFlash('');
    }, 2500);
  }
  function clearAllocations() {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(function () {
        setConfirmClear(false);
      }, 4000);
      return;
    }
    var nl = (NETS.find(function (n) {
      return n.k === planNet;
    }) || {
      label: planNet
    }).label;
    setRots(function (prev) {
      var u = {};
      Object.keys(prev).forEach(function (id) {
        if (prev[id]) {
          var c = Object.assign({}, prev[id]);
          c[planNet] = {};
          u[id] = c;
        }
      });
      return u;
    });
    setConfirmClear(false);
    zap('✓ Cleared all ' + nl + ' allocations');
  }
  function getCurWeek() {
    return rdcMI[wc] || initRdcWeek();
  }
  function updRdcMI(fn) {
    setRdcMI(function (prev) {
      var week = JSON.parse(JSON.stringify(prev[wc] || initRdcWeek()));
      fn(week);
      var next = Object.assign({}, prev);
      next[wc] = week;
      return next;
    });
  }
  function rdcAddSpot(day, dpk) {
    updRdcMI(function (w) {
      if (!w[day]) w[day] = {};
      if (!w[day][dpk]) w[day][dpk] = [];
      w[day][dpk].push({
        k: '',
        q: '1',
        i: '',
        t: ''
      });
    });
  }
  function rdcRemoveSpot(day, dpk, idx) {
    updRdcMI(function (w) {
      w[day][dpk].splice(idx, 1);
    });
  }
  function rdcUpdateKey(day, dpk, idx, newKey) {
    updRdcMI(function (w) {
      var c = null;
      for (var i = 0; i < creatives.length; i++) {
        if (creatives[i].keyNumber === newKey) {
          c = creatives[i];
          break;
        }
      }
      w[day][dpk][idx].k = newKey;
      w[day][dpk][idx].t = c ? stripDur(c.title) : '';
      if (!w[day][dpk][idx].q) w[day][dpk][idx].q = '1';
    });
  }
  function rdcUpdateField(day, dpk, idx, field, val) {
    updRdcMI(function (w) {
      w[day][dpk][idx][field] = val;
    });
  }
  function rdcCopyFromDaypart(day, targetDpk, sourceDpk) {
    var src = rdcMI[wc] && rdcMI[wc][day] && rdcMI[wc][day][sourceDpk] || [];
    var copy = JSON.parse(JSON.stringify(src.filter(function (s) {
      return !!s.k;
    })));
    updRdcMI(function (w) {
      if (!w[day]) w[day] = {};
      w[day][targetDpk] = copy;
    });
    var sl = (RDC_DAYPARTS.find(function (d) {
      return d.k === sourceDpk;
    }) || {
      label: sourceDpk
    }).label;
    zap('✓ Copied ' + copy.length + ' spot' + (copy.length !== 1 ? 's' : '') + ' from ' + sl);
  }
  function rdcCopyFromDay(targetDay, sourceDay) {
    var src = rdcMI[wc] && rdcMI[wc][sourceDay] || {};
    updRdcMI(function (w) {
      if (!w[targetDay]) w[targetDay] = {};
      RDC_DAYPARTS.forEach(function (dp) {
        // only copy dayparts valid on BOTH days
        if (dp.daysOnly && (!dp.daysOnly.includes(targetDay) || !dp.daysOnly.includes(sourceDay))) return;
        var s = (src[dp.k] || []).filter(function (x) {
          return !!x.k;
        });
        w[targetDay][dp.k] = JSON.parse(JSON.stringify(s));
      });
    });
    var sl = DAY_L[DAYS.indexOf(sourceDay)];
    zap('✓ Copied all timeslots from ' + sl);
  }
  function rdcCopyFromLastWeek() {
    var pd = new Date(wc + 'T00:00:00');
    pd.setDate(pd.getDate() - 7);
    var ps = pd.toISOString().split('T')[0];
    var pw = rdcMI[ps];
    if (!pw) {
      zap('⚠ No previous week data found');
      return;
    }
    var nw = {};
    DAYS.forEach(function (day, i) {
      var dd = weekDates[i] || '';
      nw[day] = {};
      RDC_DAYPARTS.forEach(function (dp) {
        if (dp.daysOnly && !dp.daysOnly.includes(day)) return;
        var prev = pw[day] && pw[day][dp.k] || [];
        var filtered = prev.filter(function (spot) {
          if (!spot.k) return false;
          var c = null;
          for (var j = 0; j < creatives.length; j++) {
            if (creatives[j].keyNumber === spot.k) {
              c = creatives[j];
              break;
            }
          }
          if (!c) return true;
          if (c.air && c.end && c.air === c.end) return false;
          return !c.end || c.end >= dd;
        });
        nw[day][dp.k] = dp.k === 'lateNight' && filtered.length === 0 ? [{
          k: 'FXC26BRPA30',
          q: '1',
          i: '',
          t: 'Follow Foxcatcher'
        }] : filtered;
      });
    });
    setRdcMI(function (prev) {
      var next = Object.assign({}, prev);
      next[wc] = nw;
      return next;
    });
    zap('✓ Copied from previous week — expired spots removed');
  }
  function exportRDCMI(daysSubset, label) {
    var exportDays = daysSubset && daysSubset.length ? daysSubset : DAYS;
    var cw = rdcMI[wc] || initRdcWeek();
    var XLSX = getXLSX();
    var hasStyles = XLSX !== XLSX_NPM;
    // 11 columns: DayPart, Time, Booked, (Pointsbet), (Category), Duration, Key Number, EVS ID, Title, Instructions, Expiry
    var rows = [];
    var meta = []; // per-row: {type:'date'|'header'|'spot'|'dpEmpty'|'blank', booked?, dpLabel?}
    function pushRow(arr, m) {
      rows.push(arr);
      meta.push(m || {
        type: 'blank'
      });
    }
    DAYS.forEach(function (day, i) {
      if (exportDays.indexOf(day) < 0) return;
      var dd = weekDates[i] || '';
      pushRow([fmtRDC(dd), '', '', '', '', '', '', '', '', '', ''], {
        type: 'date'
      });
      pushRow(['Day Part', 'Time', 'Booked', '', '', 'Duration', 'Key Number', 'EVS ID', 'Title', 'Instructions/Cut Offs', 'Expiry Date'], {
        type: 'header'
      });
      var dayData = cw[day] || {};
      RDC_DAYPARTS.forEach(function (dp) {
        if (dp.daysOnly && !dp.daysOnly.includes(day)) return;
        var booked = dp.booked(day);
        var spots = (dayData[dp.k] || []).filter(function (spot) {
          return spot && spot.k;
        });
        if (!spots.length) {
          pushRow([dp.label, dp.time, booked, '', '', '', '', '', '', '', ''], {
            type: 'spot',
            dpLabel: true,
            booked: booked
          });
        } else {
          spots.forEach(function (spot, si) {
            var c = null;
            for (var j = 0; j < creatives.length; j++) {
              if (creatives[j].keyNumber === spot.k) {
                c = creatives[j];
                break;
              }
            }
            var qty = spotQty(spot);
            var instr = c ? qty + ' x ' + c.dur + 'secs' : '';
            if (spot.i) instr = instr ? instr + ' — ' + spot.i : spot.i;
            pushRow([si === 0 ? dp.label : '', dp.time, si === 0 ? booked : '', 'Pointsbet', c ? c.cat : '', c ? c.dur : '', spot.k, '', spot.t || (c ? stripDur(c.title) : spot.k), instr, c && c.end ? fmt(c.end) : ''], {
              type: 'spot',
              dpLabel: si === 0,
              booked: si === 0 ? booked : ''
            });
          });
        }
        pushRow([], {
          type: 'blank'
        });
      });
      pushRow([], {
        type: 'blank'
      });
    });
    try {
      var ws = XLSX.utils.aoa_to_sheet(rows);
      ws['!cols'] = [{
        wch: 26
      }, {
        wch: 30
      }, {
        wch: 13
      }, {
        wch: 11
      }, {
        wch: 20
      }, {
        wch: 10
      }, {
        wch: 18
      }, {
        wch: 9
      }, {
        wch: 42
      }, {
        wch: 22
      }, {
        wch: 13
      }];
      if (hasStyles) {
        var thin = {
          style: 'thin',
          color: {
            rgb: '000000'
          }
        };
        var border = {
          top: thin,
          bottom: thin,
          left: thin,
          right: thin
        };
        var BLACK = '000000',
          WHITE = 'FFFFFF',
          RED = 'C00000';
        function cell(r, c) {
          var a = XLSX.utils.encode_cell({
            r: r,
            c: c
          });
          if (!ws[a]) ws[a] = {
            t: 's',
            v: ''
          };
          return ws[a];
        }
        for (var r = 0; r < meta.length; r++) {
          var m = meta[r];
          if (m.type === 'date') {
            var d0 = cell(r, 0);
            d0.s = {
              font: {
                bold: true,
                sz: 13,
                color: {
                  rgb: RED
                }
              }
            };
          } else if (m.type === 'header') {
            for (var c = 0; c < 11; c++) {
              var hc = cell(r, c);
              hc.s = {
                font: {
                  bold: true,
                  color: {
                    rgb: WHITE
                  },
                  sz: 11
                },
                fill: {
                  fgColor: {
                    rgb: BLACK
                  }
                },
                alignment: {
                  horizontal: c === 0 ? 'left' : 'center',
                  vertical: 'center'
                },
                border: border
              };
            }
          } else if (m.type === 'spot') {
            for (var c2 = 0; c2 < 11; c2++) {
              var sc = cell(r, c2);
              var isBooked = c2 === 2 && /bonus/i.test(String(rows[r][2] || ''));
              sc.s = {
                font: {
                  bold: c2 === 0 && m.dpLabel || isBooked,
                  color: {
                    rgb: isBooked ? RED : BLACK
                  },
                  sz: 11
                },
                alignment: {
                  horizontal: c2 === 0 || c2 === 3 || c2 === 4 || c2 === 6 || c2 === 8 || c2 === 9 ? 'left' : 'center',
                  vertical: 'center'
                },
                border: border
              };
            }
          }
        }
      }
      var wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'RDC MI');
      var wbout = XLSX.write(wb, {
        bookType: 'xlsx',
        type: 'array'
      });
      var blob = new Blob([wbout], {
        type: 'application/octet-stream'
      });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'PointsBet_RDC_MI_WC' + wc + (label ? '_' + label : '') + '.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 150);
      zap(hasStyles ? '✓ RDC MI exported (styled)' : '⚠ RDC MI exported — styling not loaded, formatting plain');
      return true;
    } catch (e) {
      zap('⚠ Export failed');
      return false;
    }
  }
  function foxRotationFor(day, dur) {
    // creatives ticked for fox, active that day, matching duration, with a rotation % > 0
    var di = DAYS.indexOf(day);
    var date = weekDates[di] || '';
    var list = [];
    active.forEach(function (c) {
      if (!c.nets || !c.nets.fox) return;
      if (String(c.dur) !== String(dur)) return;
      if (!dayEnabled(c, date)) return;
      var pct = parseFloat(getDR(c.id, 'fox', day)) || 0;
      if (pct > 0) list.push({
        c: c,
        pct: pct
      });
    });
    return list;
  }
  function weightedSequence(list, n) {
    // weighted round-robin: spread creatives across n slots by their pct, interleaved
    if (!list.length || n <= 0) return [];
    var total = list.reduce(function (s, x) {
      return s + x.pct;
    }, 0);
    if (total <= 0) return [];
    var acc = list.map(function () {
      return 0;
    });
    var out = [];
    for (var i = 0; i < n; i++) {
      // add each weight share, pick the highest accumulator
      var best = -1,
        bestVal = -Infinity;
      for (var j = 0; j < list.length; j++) {
        acc[j] += list[j].pct / total;
        if (acc[j] > bestVal) {
          bestVal = acc[j];
          best = j;
        }
      }
      acc[best] -= 1;
      out.push(list[best].c);
    }
    return out;
  }
  function handleFoxUpload(e) {
    var file = e.target.files && e.target.files[0];
    if (!file) {
      return;
    }
    zap('⏳ Reading Fox file: ' + file.name + '…');
    var reader = new FileReader();
    reader.onload = function (ev) {
      try {
        var XLSX = getXLSX();
        var data = new Uint8Array(ev.target.result);
        var wb = XLSX.read(data, {
          type: 'array',
          cellStyles: true
        });
        var sheetName = wb.SheetNames[0];
        var ws = wb.Sheets[sheetName];
        var aoa = XLSX.utils.sheet_to_json(ws, {
          header: 1,
          defval: ''
        });
        // find header row: look for a row containing "Industry Code" and "Day" and "Length"
        var hdrRow = -1,
          codeCol = -1,
          dayCol = -1,
          lenCol = -1;
        for (var r = 0; r < Math.min(aoa.length, 15); r++) {
          var row = aoa[r].map(function (x) {
            return String(x).toLowerCase().trim();
          });
          var ci = row.findIndex(function (x) {
            return x.indexOf('industry') >= 0 && x.indexOf('code') >= 0;
          });
          var di = row.findIndex(function (x) {
            return x === 'day';
          });
          var li = row.findIndex(function (x) {
            return x === 'length';
          });
          if (ci >= 0 && di >= 0 && li >= 0) {
            hdrRow = r;
            codeCol = ci;
            dayCol = di;
            lenCol = li;
            break;
          }
        }
        if (hdrRow < 0) {
          setFoxModal({
            title: 'Could not read Fox file',
            body: 'Couldn\u2019t find a header row with "Industry Code", "Day" and "Length" columns. Make sure you\u2019re uploading Fox\u2019s clear booking sheet.',
            issues: []
          });
          e.target.value = '';
          return;
        }
        var dayMap = {
          sunday: 'sun',
          monday: 'mon',
          tuesday: 'tue',
          wednesday: 'wed',
          thursday: 'thu',
          friday: 'fri',
          saturday: 'sat',
          sun: 'sun',
          mon: 'mon',
          tue: 'tue',
          wed: 'wed',
          thu: 'thu',
          fri: 'fri',
          sat: 'sat'
        };
        // collect spot rows grouped by day, preserving original sheet row index (0-based for XLSX cells)
        var byDay = {};
        DAYS.forEach(function (d) {
          byDay[d] = [];
        });
        var allSpotRows = [];
        for (var rr = hdrRow + 1; rr < aoa.length; rr++) {
          var row = aoa[rr];
          if (!row) continue;
          var dRaw = String(row[dayCol] || '').toLowerCase().trim();
          var dayKey = dayMap[dRaw];
          var lenRaw = String(row[lenCol] || '').replace(/[^0-9]/g, '');
          if (!dayKey || !lenRaw) continue;
          var spot = {
            rowIdx: rr,
            dur: lenRaw,
            day: dayKey
          };
          byDay[dayKey].push(spot);
          allSpotRows.push(spot);
        }
        // ── ASSIGN creatives per day per duration via weighted round-robin ──
        var usedCreatives = {}; // keyNumber -> creative (for lookup table)
        var assigned = 0,
          unmatched = 0,
          issues = [];
        DAYS.forEach(function (day) {
          var spots = byDay[day];
          if (!spots.length) return;
          var byDur = {};
          spots.forEach(function (s) {
            if (!byDur[s.dur]) byDur[s.dur] = [];
            byDur[s.dur].push(s);
          });
          Object.keys(byDur).forEach(function (dur) {
            var slots = byDur[dur];
            var rot = foxRotationFor(day, dur);
            if (!rot.length) {
              unmatched += slots.length;
              issues.push(DAY_L[DAYS.indexOf(day)] + ' :' + dur + ' — ' + slots.length + ' spot' + (slots.length > 1 ? 's' : '') + ' with no matching Fox rotation %');
              slots.forEach(function (s) {
                s.assignedKey = null;
              });
              return;
            }
            var seq = weightedSequence(rot, slots.length);
            slots.forEach(function (s, i) {
              var c = seq[i];
              if (!c) {
                s.assignedKey = null;
                unmatched++;
                return;
              }
              s.assignedKey = c.keyNumber;
              usedCreatives[c.keyNumber] = c;
              assigned++;
            });
          });
        });
        // ── BUILD lookup table (cols P=16,Q=17,R=18 → 0-based 15,16,17) grouped by category ──
        // group used creatives by our CAT_ORDER, with friendly section headers
        var SECTION_LABEL = {
          NRL: 'NRL 2026 Season:',
          AFL: 'AFL 2026 Season:',
          NBA: 'NBA:',
          MLB: 'MLB:',
          Racing: 'RACING:',
          'Foxcatcher/StatMate': 'FOXCATCHER / STATMATE:',
          'World Cup': 'WORLD CUP:',
          Other: 'OTHER:'
        };
        var lookupRowFor = {}; // keyNumber -> 1-based sheet row of its lookup entry
        var P = 15,
          Q = 16,
          R = 17; // 0-based column indices
        var curRow = hdrRow + 1; // start lookup table aligned just under the header, leaving a gap
        // small gap from header
        curRow = hdrRow + 2;
        function setCell(cIdx, rIdx0, val) {
          var addr = XLSX.utils.encode_cell({
            r: rIdx0,
            c: cIdx
          });
          ws[addr] = {
            t: typeof val === 'number' ? 'n' : 's',
            v: val
          };
        }
        CAT_ORDER.forEach(function (cat) {
          var keys = Object.keys(usedCreatives).filter(function (k) {
            return usedCreatives[k].cat === cat;
          });
          if (!keys.length) return;
          // section header
          setCell(P, curRow, SECTION_LABEL[cat] || cat + ':');
          curRow++;
          keys.forEach(function (k) {
            var c = usedCreatives[k];
            setCell(P, curRow, c.keyNumber);
            setCell(Q, curRow, parseInt(c.dur) || c.dur);
            setCell(R, curRow, c.title);
            lookupRowFor[k] = curRow + 1; // store 1-based for formulas
            curRow++;
          });
          curRow++; // blank gap between sections
        });
        // ── INSERT two columns (E,F) after Industry Code, point D/E/F to lookup via formula ──
        // We do this by writing formulas directly. Industry Code is at codeCol (0-based).
        // Match the example: D=code col=P ref, E(code+1)=Q ref, F(code+2)=R ref.
        // Shift existing columns from codeCol+1 onward right by 2 to make room — but the example
        // simply uses cols 5 & 6 (E,F) for dur/title and Fox's real data starts at col 7.
        // Fox's clear sheet already leaves E,F blank (cols 5,6) before Scheduled Date at col 7,
        // so we write into them directly without shifting.
        var eCol = codeCol + 1,
          fCol = codeCol + 2;
        allSpotRows.forEach(function (s) {
          var lr = s.assignedKey ? lookupRowFor[s.assignedKey] : null;
          if (lr) {
            ws[XLSX.utils.encode_cell({
              r: s.rowIdx,
              c: codeCol
            })] = {
              t: 's',
              f: 'P' + lr
            };
            ws[XLSX.utils.encode_cell({
              r: s.rowIdx,
              c: eCol
            })] = {
              t: 'n',
              f: 'Q' + lr
            };
            ws[XLSX.utils.encode_cell({
              r: s.rowIdx,
              c: fCol
            })] = {
              t: 's',
              f: 'R' + lr
            };
          }
        });
        // header labels for E,F
        ws[XLSX.utils.encode_cell({
          r: hdrRow,
          c: eCol
        })] = {
          t: 's',
          v: 'Duration'
        };
        ws[XLSX.utils.encode_cell({
          r: hdrRow,
          c: fCol
        })] = {
          t: 's',
          v: 'Creative Title'
        };
        // expand range to cover lookup table + new cols
        var range = XLSX.utils.decode_range(ws['!ref']);
        if (R > range.e.c) range.e.c = R;
        if (curRow > range.e.r) range.e.r = curRow;
        ws['!ref'] = XLSX.utils.encode_range(range);
        // write out
        var outName = 'PointsBet_FoxFooty_WC' + wc + '.xlsx';
        var wbout = XLSX.write(wb, {
          bookType: 'xlsx',
          type: 'array'
        });
        var blob = new Blob([wbout], {
          type: 'application/octet-stream'
        });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = outName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () {
          URL.revokeObjectURL(url);
        }, 150);
        zap('\u2713 Fox Footy MI exported \u2014 ' + assigned + ' spots assigned' + (unmatched ? ' \u00b7 ' + unmatched + ' unmatched' : ''));
        if (unmatched > 0) {
          setFoxModal({
            title: 'Fox file generated \u2014 ' + unmatched + ' unmatched spot' + (unmatched > 1 ? 's' : ''),
            body: 'The file downloaded with the lookup table and Duration/Creative Title columns filled in. Some spots couldn\u2019t be auto-assigned because no Fox rotation % was set for that day + duration. Set the % in the Weekly Planner and re-upload, or fill those rows in manually.',
            issues: issues
          });
        }
      } catch (err) {
        setFoxModal({
          title: 'Fox file processing failed',
          body: 'Something went wrong reading the file: ' + (err && err.message ? err.message : String(err)),
          issues: []
        });
      }
      e.target.value = '';
    };
    reader.onerror = function () {
      zap('\u26a0 Could not read file');
      e.target.value = '';
    };
    reader.readAsArrayBuffer(file);
  }
  function buildCSV(net) {
    var rows = outRows(net);
    var lbl = (NETS.find(function (n) {
      return n.k === net;
    }) || {
      label: net
    }).label;
    function esc(v) {
      return '"' + String(v || '').replace(/"/g, '""') + '"';
    }
    var data = [];
    DAYS.forEach(function (day, i) {
      var date = weekDates[i] || '';
      var dayRows = rows.filter(function (r) {
        return dayEnabled(r, date) && (parseFloat(getDR(r.id, net, day)) || 0) > 0;
      });
      if (!dayRows.length) return;
      if (data.length) data.push([]);
      data.push([DAY_L[i] + ' ' + fmtShort(date)]);
      data.push(['Key Number', 'Creative Title', 'Duration', 'Category', 'Allocation', 'Notes']);
      dayRows.forEach(function (r) {
        var raw = getDR(r.id, net, day);
        var alloc = raw + '%';
        return data.push([r.keyNumber, r.title, ':' + r.dur, r.cat, alloc, getNote(r.id, day)]);
      });
    });
    var csv = '\uFEFF' + data.map(function (r) {
      return r.map(esc).join(',');
    }).join('\n');
    return {
      csv: csv,
      fname: 'PointsBet_MI_' + lbl.replace(/[^a-zA-Z0-9]/g, '_') + '_WC' + wc + '.csv'
    };
  }
  function exportCSV(net) {
    try {
      var result = buildCSV(net);
      var blob = new Blob([result.csv], {
        type: 'text/csv;charset=utf-8'
      });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = result.fname;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 150);
      return true;
    } catch (e) {
      zap('⚠ Export failed');
      return false;
    }
  }
  function prepareEmail(net, opts) {
    opts = opts || {};
    var ok = net === 'rdc' ? exportRDCMI(opts.subset, opts.suffix) : exportCSV(net);
    if (!ok) return;
    var cfg = emailConfig[net];
    if (!cfg || !cfg.to) {
      zap('⚠ Add a To address in Email Prep first');
      return;
    }
    var d = fmt(wc);
    var params = [];
    var ccList = (cfg.cc || '').split(',').map(function (s) {
      return s.trim();
    }).filter(function (s) {
      return !!s;
    });
    if (ccList.length) params.push('cc=' + encodeURIComponent(ccList.join(',')));
    var subj = (cfg.subject || '').replace(/\[WC_DATE\]/g, d) + (opts.label ? ' (' + opts.label + ')' : '');
    params.push('subject=' + encodeURIComponent(subj));
    var pending = active.filter(function (c) {
      return c.nets && c.nets[net] && c.mat && c.mat !== 'ok';
    }).map(function (c) {
      return c.keyNumber;
    });
    // Snapshot exactly what this send instructed
    (function () {
      var snapLines = [];
      if (net === 'rdc') {
        var cw = rdcMI[wc] || {};
        var days = opts.subset && opts.subset.length ? opts.subset : DAYS;
        days.forEach(function (day) {
          var dd = cw[day] || {};
          Object.keys(dd).forEach(function (dpk) {
            (dd[dpk] || []).forEach(function (sp) {
              if (sp && sp.k) snapLines.push({
                key: sp.k,
                detail: day.toUpperCase() + ' ' + dpk + ' x' + (sp.q || '1')
              });
            });
          });
        });
      } else {
        active.forEach(function (c) {
          if (!(c.nets && c.nets[net])) return;
          var em = {};
          DAYS.forEach(function (d, i) {
            em[d] = dayEnabled(c, weekDates[i] || '');
          });
          var nr = rots[c.id] && rots[c.id][net] || {};
          var ws = weeklyState(nr, em);
          var det = ws.mix ? DAYS.filter(function (d) {
            return em[d] && nr[d] !== '';
          }).map(function (d) {
            return d.toUpperCase() + ' ' + nr[d] + '%';
          }).join(' · ') : ws.val !== '' ? ws.val + '% all week' : null;
          if (det) snapLines.push({
            key: c.keyNumber,
            detail: det
          });
        });
      }
      var rowKey = opts.rowKey || net;
      setSnaps(function (p) {
        var u = Object.assign({}, p);
        u[wc] = Object.assign({}, u[wc] || {});
        u[wc][rowKey] = {
          at: new Date().toISOString(),
          net: net,
          label: opts.label || '',
          lines: snapLines
        };
        return u;
      });
      if (opts.rowKey) {
        setSentMap(function (p) {
          var u = Object.assign({}, p);
          u[wc] = Object.assign({}, u[wc] || {});
          u[wc][opts.rowKey] = true;
          return u;
        });
      }
    })();
    var bodyTxt = (cfg.body || '').replace(/\[WC_DATE\]/g, d);
    if (pending.length) {
      bodyTxt = bodyTxt.replace(/\n\nRegards\s*$/, '') + '\n\nThe following material will be fed through: ' + pending.join(', ') + '.\n\nRegards';
    }
    params.push('body=' + encodeURIComponent(bodyTxt));
    var toList = (cfg.to || '').split(',').map(function (s) {
      return s.trim();
    }).filter(function (s) {
      return !!s;
    });
    var ma = document.createElement('a');
    ma.href = 'mailto:' + toList.join(',') + (params.length ? '?' + params.join('&') : '');
    document.body.appendChild(ma);
    ma.click();
    document.body.removeChild(ma);
    zap('✓ ' + (net === 'rdc' ? 'RDC MI' : 'CSV') + ' downloaded — email client opening');
  }
  var stRotSel = useState({}),
    rotSel = stRotSel[0],
    setRotSel = stRotSel[1];
  var SEND_ROWS = [{
    k: 'fox',
    net: 'fox',
    label: 'Fox Footy',
    defOff: 2
  }, {
    k: 'espn',
    net: 'espn',
    label: 'ESPN / Disney',
    defOff: 2
  }, {
    k: 'rdc_early',
    net: 'rdc',
    label: 'RDC — Sun–Tue',
    defOff: 4,
    subset: ['sun', 'mon', 'tue'],
    suffix: 'Sun-Tue',
    emailLabel: 'Sun–Tue'
  }, {
    k: 'rdc_late',
    net: 'rdc',
    label: 'RDC — Wed–Sat',
    defOff: 2,
    subset: ['wed', 'thu', 'fri', 'sat'],
    suffix: 'Wed-Sat',
    emailLabel: 'Wed–Sat'
  }, {
    k: 'nine',
    net: 'nine',
    label: 'Nine Radio',
    defOff: 2
  }, {
    k: 'sen',
    net: 'sen',
    label: 'SEN Radio',
    defOff: 2
  }, {
    k: 'triplem',
    net: 'triplem',
    label: 'Triple M',
    defOff: 2
  }];
  function rowDue(row) {
    var off = dueOv[row.k] != null && dueOv[row.k] !== '' ? parseInt(dueOv[row.k]) : row.defOff;
    if (isNaN(off)) off = row.defOff;
    return addDaysISO(wc, -off);
  }
  function rowSent(row) {
    return !!(sentMap[wc] && sentMap[wc][row.k]);
  }
  function toggleSent(row) {
    setSentMap(function (p) {
      var u = Object.assign({}, p);
      u[wc] = Object.assign({}, u[wc] || {});
      u[wc][row.k] = !u[wc][row.k];
      return u;
    });
  }
  function rowStatus(row) {
    if (rowSent(row)) return {
      t: 'Sent ✓',
      bg: '#dcfce7',
      co: '#166534'
    };
    var due = rowDue(row);
    var diff = Math.round((new Date(due + 'T00:00:00') - new Date(TODAY + 'T00:00:00')) / 864e5);
    if (diff < 0) return {
      t: 'Overdue ' + -diff + 'd',
      bg: '#fee2e2',
      co: '#991b1b'
    };
    if (diff === 0) return {
      t: 'Due today',
      bg: '#fef3c7',
      co: '#92400e'
    };
    if (diff <= 2) return {
      t: 'Due in ' + diff + 'd',
      bg: '#fef9c3',
      co: '#854d0e'
    };
    return {
      t: 'Due ' + fmtShort(due),
      bg: '#f3f4f6',
      co: '#6b7280'
    };
  }
  var expiringThisWeek = useMemo(function () {
    var end = weekDates[6] || '';
    return creatives.filter(function (c) {
      return c.end && c.end >= wc && c.end <= end;
    });
  }, [creatives, wc, weekDates]);
  function icsEscape(t) {
    return String(t).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,');
  }
  function downloadICS() {
    var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//PointsBet//MI Planner//EN', 'CALSCALE:GREGORIAN'];
    SEND_ROWS.forEach(function (row) {
      if (rowSent(row)) return;
      var due = rowDue(row).replace(/-/g, '');
      var cfg = emailConfig[row.net] || {};
      lines.push('BEGIN:VEVENT');
      lines.push('UID:mi-' + row.k + '-' + wc + '@pointsbet-mi-planner');
      lines.push('DTSTART:' + due + 'T090000');
      lines.push('DTEND:' + due + 'T091500');
      lines.push('SUMMARY:' + icsEscape('Send ' + row.label + ' MIs — WC ' + fmt(wc)));
      lines.push('DESCRIPTION:' + icsEscape('To: ' + (cfg.to || 'not set') + (cfg.cc ? ' | CC: ' + cfg.cc : '') + ' — export from the MI Planner and send.'));
      lines.push('BEGIN:VALARM');
      lines.push('ACTION:DISPLAY');
      lines.push('DESCRIPTION:' + icsEscape(row.label + ' MIs due'));
      lines.push('TRIGGER:-PT1H');
      lines.push('END:VALARM');
      lines.push('END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    var blob = new Blob([lines.join('\r\n')], {
      type: 'text/calendar'
    });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'MI_Deadlines_WC' + wc + '.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 150);
    zap('✓ Calendar file downloaded — open it to add reminders to Outlook');
  }
  function sendRotationEmail() {
    var cfg = emailConfig[emailNet] || {};
    if (!cfg.to) {
      zap('\u26A0 Add a To address first');
      return;
    }
    var keys = Object.keys(rotSel).filter(function (k) {
      return rotSel[k];
    });
    if (!keys.length) {
      zap('\u26A0 Select at least one creative');
      return;
    }
    var firstName = cfg.to.split(',')[0].split('@')[0].split('.')[0] || '';
    firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
    var nl = (NETS.find(function (n) {
      return n.k === emailNet;
    }) || {
      label: emailNet
    }).label;
    var lines = [],
      anyPct = false,
      anyBlank = false;
    keys.forEach(function (k) {
      var cr = creatives.find(function (c) {
        return c.keyNumber === k;
      });
      var v = '';
      if (cr && rots[cr.id] && rots[cr.id][emailNet]) {
        var em = {};
        DAYS.forEach(function (d, i) {
          em[d] = dayEnabled(cr, weekDates[i] || '');
        });
        var ws = weeklyState(rots[cr.id][emailNet], em);
        if (ws.mix) {
          v = 'varies by day';
          anyPct = true;
        } else if (ws.val !== '') {
          v = ws.val + '%';
          anyPct = true;
        }
      }
      if (!v) anyBlank = true;
      lines.push(k + (v ? ' - ' + v : ''));
    });
    var ask = anyPct ? 'For the below spots can we go with this rotation please?' : 'Can we rotate the below evenly through our booked spots please?';
    var body = 'Hi ' + firstName + ',\n\n' + ask + '\n\n' + lines.join('\n') + (anyPct && anyBlank ? '\n\nAny spots without a percentage can be split evenly.' : '') + '\n\nThanks!';
    var params = [];
    var ccList = (cfg.cc || '').split(',').map(function (x) {
      return x.trim();
    }).filter(function (x) {
      return !!x;
    });
    if (ccList.length) params.push('cc=' + encodeURIComponent(ccList.join(',')));
    params.push('subject=' + encodeURIComponent('PointsBet \u2014 ' + nl + ' Rotation Update'));
    params.push('body=' + encodeURIComponent(body));
    var ma = document.createElement('a');
    ma.href = 'mailto:' + cfg.to + (params.length ? '?' + params.join('&') : '');
    document.body.appendChild(ma);
    ma.click();
    document.body.removeChild(ma);
    setRotSel({});
    zap('\u2713 Rotation update email opening');
  }
  function backupState() {
    var out = {
      v: 'v2',
      exported: new Date().toISOString(),
      creatives: creatives,
      rots: allRots,
      notes: allNotes,
      emails: emailConfig,
      rdcMI: rdcMI,
      sentMap: sentMap,
      dueOv: dueOv,
      snaps: snaps,
      wc: wc,
      platform: platform
    };
    var blob = new Blob([JSON.stringify(out, null, 2)], {
      type: 'application/json'
    });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'mi-planner-backup-' + TODAY + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 150);
    zap('\u2713 Backup downloaded');
  }
  function restoreState(e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (ev) {
      try {
        var d = JSON.parse(ev.target.result);
        if (d.creatives) setC(d.creatives);
        if (d.rots) setAllRots(wrapWeek(d.rots));
        if (d.notes) setAllNotes(wrapWeek(d.notes));
        if (d.snaps) setSnaps(d.snaps);
        if (d.sentMap) setSentMap(d.sentMap);
        if (d.dueOv) setDueOv(d.dueOv);
        if (d.emails) setEmailConfig(Object.assign({}, DEFAULT_EMAILS, d.emails));
        if (d.rdcMI) setRdcMI(d.rdcMI);
        if (d.wc) setWC(d.wc);
        if (d.platform) setPlatform(d.platform);
        zap('\u2713 Backup restored');
      } catch (err) {
        zap('\u26A0 Could not read backup file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }
  function mainPayload() {
    return {
      rots: allRots,
      notes: allNotes,
      rdcMI: rdcMI,
      sentMap: sentMap,
      dueOv: dueOv,
      emails: emailConfig,
      snaps: snaps
    };
  }
  function crePayload() {
    return {
      creatives: creatives
    };
  }
  function applyMain(row) {
    var d = row.data || {};
    syncRef.current.mainJson = JSON.stringify(d);
    syncRef.current.mainStamp = row.updated_at || '';
    if (d.rots) setAllRots(wrapWeek(d.rots));
    if (d.notes) setAllNotes(wrapWeek(d.notes));
    if (d.snaps) setSnaps(d.snaps);
    if (d.rdcMI) setRdcMI(d.rdcMI);
    if (d.sentMap) setSentMap(d.sentMap);
    if (d.dueOv) setDueOv(d.dueOv);
    if (d.emails) setEmailConfig(Object.assign({}, DEFAULT_EMAILS, d.emails));
  }
  function applyCre(row) {
    var d = row.data || {};
    syncRef.current.creJson = JSON.stringify(d);
    syncRef.current.creStamp = row.updated_at || '';
    if (d.creatives) setC(d.creatives.map(function (c) {
      return Object.assign({}, c, {
        nets: Object.assign({}, BLANK_NETS, c.nets)
      });
    }));
  }
  function pushRow(rowId, json, slot) {
    setSyncStatus('saving');
    var stamp = new Date().toISOString();
    fetch(SUPA_URL + '/rest/v1/' + SUPA_TABLE, {
      method: 'POST',
      headers: Object.assign({}, SUPA_HDRS, {
        Prefer: 'resolution=merge-duplicates'
      }),
      body: JSON.stringify([{
        id: rowId,
        data: JSON.parse(json),
        client: syncRef.current.client,
        updated_at: stamp
      }])
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      syncRef.current[slot + 'Json'] = json;
      syncRef.current[slot + 'Stamp'] = stamp;
      setSyncStatus('synced');
    }).catch(function () {
      setSyncStatus('offline');
    });
  }
  // Initial pull once local storage has loaded
  useEffect(function () {
    if (!loaded) return;
    fetch(SUPA_URL + '/rest/v1/' + SUPA_TABLE + '?id=in.(' + SUPA_ROW + ',' + SUPA_CRE + ',' + V1_MAIN + ',' + V1_CRE + ')&select=id,data,client,updated_at', {
      headers: SUPA_HDRS
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (rows) {
      var main = null,
        cre = null,
        v1m = null,
        v1c = null;
      (rows || []).forEach(function (row) {
        if (row.id === SUPA_ROW) main = row;
        if (row.id === SUPA_CRE) cre = row;
        if (row.id === V1_MAIN) v1m = row;
        if (row.id === V1_CRE) v1c = row;
      });
      if (main && main.data) {
        applyMain(main);
      } else if (v1m && v1m.data) {
        // bootstrap v2 from v1 cloud data
        var bd = Object.assign({}, v1m.data);
        bd.rots = wrapWeek(bd.rots || {});
        bd.notes = wrapWeek(bd.notes || {});
        applyMain({
          data: bd,
          updated_at: v1m.updated_at
        });
        pushRow(SUPA_ROW, JSON.stringify({
          rots: bd.rots,
          notes: bd.notes,
          rdcMI: bd.rdcMI || {},
          sentMap: bd.sentMap || {},
          dueOv: bd.dueOv || {},
          emails: bd.emails || {},
          snaps: {}
        }), 'main');
      } else {
        pushRow(SUPA_ROW, JSON.stringify(mainPayload()), 'main');
      }
      if (cre && cre.data) {
        applyCre(cre);
      } else if (v1c && v1c.data) {
        applyCre(v1c);
        pushRow(SUPA_CRE, JSON.stringify(v1c.data), 'cre');
      } else if (v1m && v1m.data && v1m.data.creatives) {
        applyCre({
          data: {
            creatives: v1m.data.creatives
          },
          updated_at: v1m.updated_at
        });
        pushRow(SUPA_CRE, JSON.stringify({
          creatives: v1m.data.creatives
        }), 'cre');
      } else {
        pushRow(SUPA_CRE, JSON.stringify(crePayload()), 'cre');
      }
      if (main || cre) setSyncStatus('synced');
      syncRef.current.ready = true;
    }).catch(function () {
      setSyncStatus('offline');
      syncRef.current.ready = false;
    });
  }, [loaded]);
  // Debounced push — main payload (rotations, RDC, notes, send state, emails)
  useEffect(function () {
    if (!loaded || !syncRef.current.ready) return;
    var json = JSON.stringify(mainPayload());
    if (json === syncRef.current.mainJson) return;
    if (syncRef.current.mainTimer) clearTimeout(syncRef.current.mainTimer);
    syncRef.current.mainTimer = setTimeout(function () {
      pushRow(SUPA_ROW, json, 'main');
    }, 1500);
    return function () {
      if (syncRef.current.mainTimer) clearTimeout(syncRef.current.mainTimer);
    };
  }, [allRots, allNotes, rdcMI, sentMap, dueOv, emailConfig, snaps, loaded]);
  // Debounced push — creatives (separate channel so agency key-adds can't collide with rotation edits)
  useEffect(function () {
    if (!loaded || !syncRef.current.ready) return;
    var json = JSON.stringify(crePayload());
    if (json === syncRef.current.creJson) return;
    if (syncRef.current.creTimer) clearTimeout(syncRef.current.creTimer);
    syncRef.current.creTimer = setTimeout(function () {
      pushRow(SUPA_CRE, json, 'cre');
    }, 1500);
    return function () {
      if (syncRef.current.creTimer) clearTimeout(syncRef.current.creTimer);
    };
  }, [creatives, loaded]);
  // Poll for remote changes on both rows
  useEffect(function () {
    if (!loaded) return;
    var iv = setInterval(function () {
      if (!syncRef.current.ready) return;
      fetch(SUPA_URL + '/rest/v1/' + SUPA_TABLE + '?id=in.(' + SUPA_ROW + ',' + SUPA_CRE + ',' + V1_MAIN + ',' + V1_CRE + ')&select=id,data,client,updated_at', {
        headers: SUPA_HDRS
      }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      }).then(function (rows) {
        (rows || []).forEach(function (row) {
          if (row.client === syncRef.current.client) return;
          if (row.id === SUPA_ROW && row.updated_at && row.updated_at > (syncRef.current.mainStamp || '')) {
            applyMain(row);
            setSyncStatus('synced');
          }
          if (row.id === SUPA_CRE && row.updated_at && row.updated_at > (syncRef.current.creStamp || '')) {
            applyCre(row);
            setSyncStatus('synced');
          }
        });
      }).catch(function () {});
    }, 12000);
    return function () {
      clearInterval(iv);
    };
  }, [loaded]);
  function importCreatives(e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (ev) {
      try {
        var d = JSON.parse(ev.target.result);
        var list = Array.isArray(d) ? d : d.creatives || [];
        if (!list.length) {
          zap('\u26A0 No creatives found in file');
          return;
        }
        var added = 0,
          updated = 0;
        setC(function (prev) {
          var next = prev.slice();
          list.forEach(function (item) {
            if (!item || !item.keyNumber) return;
            var nets = Object.assign({}, BLANK_NETS, item.nets || {});
            var idx = -1;
            for (var i = 0; i < next.length; i++) {
              if (next[i].keyNumber === item.keyNumber) {
                idx = i;
                break;
              }
            }
            if (idx >= 0) {
              next[idx] = Object.assign({}, next[idx], {
                title: item.title != null ? item.title : next[idx].title,
                dur: item.dur != null ? String(item.dur) : next[idx].dur,
                cat: CATS.indexOf(item.cat) >= 0 ? item.cat : next[idx].cat,
                air: item.air != null ? item.air : next[idx].air,
                end: item.end != null ? item.end : next[idx].end,
                nets: item.nets ? nets : next[idx].nets
              });
              updated++;
            } else {
              next.push({
                id: Date.now() + Math.floor(Math.random() * 100000),
                keyNumber: item.keyNumber,
                title: item.title || item.keyNumber,
                dur: String(item.dur || '30'),
                cat: CATS.indexOf(item.cat) >= 0 ? item.cat : 'Other',
                air: item.air || '',
                end: item.end || '',
                mat: item.mat || 'ok',
                nets: nets
              });
              added++;
            }
          });
          return next;
        });
        zap('\u2713 Imported \u2014 ' + added + ' added, ' + updated + ' updated (rotations untouched)');
      } catch (err) {
        zap('\u26A0 Could not read file \u2014 needs to be a creatives JSON');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }
  function addCreative() {
    if (!newC.keyNumber || !newC.title) return;
    setC(function (p) {
      return p.concat([Object.assign({}, newC, {
        id: Date.now()
      })]);
    });
    setNewC(BLANK);
    setShowAdd(false);
    zap('✓ Creative added');
  }
  function updateCreativeField(id, field, value) {
    var oldKey = '';
    if (field === 'keyNumber') {
      for (var i = 0; i < creatives.length; i++) {
        if (creatives[i].id === id) {
          oldKey = creatives[i].keyNumber;
          break;
        }
      }
    }
    setC(function (p) {
      return p.map(function (x) {
        return x.id === id ? Object.assign({}, x, {
          [field]: value
        }) : x;
      });
    });
    if (field === 'keyNumber' && oldKey && oldKey !== value) {
      setRdcMI(function (prev) {
        var next = {};
        Object.keys(prev || {}).forEach(function (wk) {
          var week = prev[wk] || {},
            weekCopy = {};
          Object.keys(week).forEach(function (day) {
            var dayCopy = {};
            Object.keys(week[day] || {}).forEach(function (dp) {
              dayCopy[dp] = (week[day][dp] || []).map(function (sp) {
                return sp && sp.k === oldKey ? Object.assign({}, sp, {
                  k: value
                }) : sp;
              });
            });
            weekCopy[day] = dayCopy;
          });
          next[wk] = weekCopy;
        });
        return next;
      });
    }
  }
  function updateCreativeNetwork(id, net, checked) {
    setC(function (p) {
      return p.map(function (x) {
        if (x.id !== id) return x;
        var nets = Object.assign({}, BLANK_NETS, x.nets);
        nets[net] = checked;
        return Object.assign({}, x, {
          nets: nets
        });
      });
    });
  }
  var inp = {
    width: '100%',
    border: '1px solid #d1d5db',
    borderRadius: 5,
    padding: '5px 8px',
    fontSize: 12,
    boxSizing: 'border-box'
  };
  var editInp = {
    width: '100%',
    border: '1px solid #d1d5db',
    borderRadius: 4,
    padding: '3px 6px',
    fontSize: 11,
    boxSizing: 'border-box',
    backgroundColor: '#fff',
    color: '#111827'
  };
  var lbl = {
    fontSize: 10,
    fontWeight: 700,
    color: '#6b7280',
    marginBottom: 3,
    display: 'block',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  };
  var curWeek = getCurWeek();
  var rdcDayData = curWeek[rdcDay] || {};
  var rdcDueDate = getDueDate(wc, DAYS.indexOf(rdcDay));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'system-ui,sans-serif',
      maxWidth: 1350,
      margin: '0 auto',
      padding: '14px 16px',
      color: '#111827'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 800,
      letterSpacing: '-0.3px'
    }
  }, "PointsBet MI Planner ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 800,
      color: '#fff',
      backgroundColor: '#1d4ed8',
      borderRadius: 4,
      padding: '2px 6px',
      verticalAlign: 'middle',
      letterSpacing: '0.05em'
    }
  }, "V2")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#6b7280',
      marginTop: 2
    }
  }, "Material Instructions · TV · Radio · RDC · ", creatives.length, " creatives")), flash && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: '#059669',
      fontWeight: 700,
      padding: '5px 12px',
      backgroundColor: '#dcfce7',
      borderRadius: 6,
      border: '1px solid #86efac'
    }
  }, flash)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      borderBottom: '2px solid #e5e7eb',
      marginBottom: 16,
      flexWrap: 'wrap'
    }
  }, [['library', '🎬 Creative Library'], ['planner', '📋 Weekly Planner'], ['rdcmi', '📡 RDC MI'], ['outputs', '📤 Network Outputs'], ['send', '🚦 Send Centre'], ['email', '✉ Email Prep']].map(function (item) {
    return /*#__PURE__*/React.createElement("button", {
      key: item[0],
      onClick: function () {
        setTab(item[0]);
      },
      style: {
        padding: '7px 14px',
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        fontWeight: tab === item[0] ? 700 : 400,
        color: tab === item[0] ? '#1d4ed8' : '#374151',
        borderBottom: tab === item[0] ? '2px solid #1d4ed8' : '2px solid transparent',
        marginBottom: -2,
        fontSize: 13
      }
    }, item[1]);
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      display: 'inline-flex',
      gap: 6,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    title: syncStatus === 'synced' ? 'Shared data is live — changes sync to everyone with the link' : syncStatus === 'saving' ? 'Saving to cloud…' : syncStatus === 'connecting' ? 'Connecting to cloud…' : 'Cloud sync unavailable — working locally only',
    style: {
      fontSize: 11,
      fontWeight: 700,
      padding: '3px 10px',
      borderRadius: 12,
      backgroundColor: syncStatus === 'synced' ? '#dcfce7' : syncStatus === 'saving' ? '#fef9c3' : syncStatus === 'connecting' ? '#f3f4f6' : '#fee2e2',
      color: syncStatus === 'synced' ? '#166534' : syncStatus === 'saving' ? '#854d0e' : syncStatus === 'connecting' ? '#6b7280' : '#991b1b'
    }
  }, syncStatus === 'synced' ? '● Synced' : syncStatus === 'saving' ? '● Saving…' : syncStatus === 'connecting' ? '● Connecting' : '● Local only'), /*#__PURE__*/React.createElement("button", {
    onClick: backupState,
    title: "Download a JSON backup of all planner data",
    style: {
      padding: '4px 10px',
      border: '1px solid #d1d5db',
      borderRadius: 5,
      background: '#fff',
      color: '#6b7280',
      fontSize: 11,
      cursor: 'pointer'
    }
  }, "Backup"), /*#__PURE__*/React.createElement("label", {
    style: {
      padding: '4px 10px',
      border: '1px solid #d1d5db',
      borderRadius: 5,
      background: '#fff',
      color: '#6b7280',
      fontSize: 11,
      cursor: 'pointer'
    }
  }, "Restore", /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: ".json",
    onChange: restoreState,
    style: {
      display: 'none'
    }
  })))), tab === 'send' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 14,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600
    }
  }, "Week Commencing:"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: wc,
    onChange: function (e) {
      setWC(e.target.value);
    },
    style: {
      border: '1px solid #d1d5db',
      borderRadius: 5,
      padding: '4px 8px',
      fontSize: 13
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: downloadICS,
    style: {
      backgroundColor: '#fff',
      color: '#1d4ed8',
      border: '1px solid #1d4ed8',
      borderRadius: 6,
      padding: '6px 14px',
      fontSize: 12,
      cursor: 'pointer',
      fontWeight: 700
    }
  }, "📅 Add deadlines to Outlook (.ics)"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: '#9ca3af'
    }
  }, "Reminders fire 1hr before each unsent deadline (9am on the due day).")), expiringThisWeek.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      backgroundColor: '#fffbeb',
      border: '1px solid #fde68a',
      borderRadius: 8,
      padding: '10px 14px',
      marginBottom: 14,
      fontSize: 12,
      color: '#92400e'
    }
  }, /*#__PURE__*/React.createElement("strong", null, "⚠ Expiring this week:"), " ", expiringThisWeek.map(function (c) {
    return c.keyNumber + ' (' + fmt(c.end) + ')';
  }).join(' · '), " — check replacements are booked before sending MIs."), /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      backgroundColor: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: 8
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: TH
  }, "Destination"), /*#__PURE__*/React.createElement("th", {
    style: TH
  }, "Send to"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...TH,
      textAlign: 'center'
    }
  }, "Due"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...TH,
      textAlign: 'center',
      width: 70
    }
  }, "Days before WC"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...TH,
      textAlign: 'center'
    }
  }, "Status"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...TH,
      width: 250
    }
  }))), /*#__PURE__*/React.createElement("tbody", null, SEND_ROWS.map(function (row) {
    var cfg = emailConfig[row.net] || {};
    var st = rowStatus(row);
    var sent = rowSent(row);
    return /*#__PURE__*/React.createElement("tr", {
      key: row.k,
      style: {
        borderTop: '1px solid #e5e7eb',
        backgroundColor: sent ? '#f8fafc' : '#fff'
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        ...TD,
        fontWeight: 700,
        fontSize: 12
      }
    }, row.label), /*#__PURE__*/React.createElement("td", {
      style: {
        ...TD,
        fontSize: 11,
        color: cfg.to ? '#374151' : '#dc2626'
      }
    }, cfg.to || 'No address set — add in Email Prep', function () {
      var pend = active.filter(function (c) {
        return c.nets && c.nets[row.net] && c.mat && c.mat !== 'ok';
      });
      return pend.length ? /*#__PURE__*/React.createElement("div", {
        style: {
          color: '#b45309',
          fontSize: 10,
          marginTop: 2
        }
      }, "⚠ ", pend.length, " key", pend.length > 1 ? 's' : '', " awaiting material: ", pend.map(function (c) {
        return c.keyNumber;
      }).join(', ')) : null;
    }()), /*#__PURE__*/React.createElement("td", {
      style: {
        ...TD,
        textAlign: 'center',
        fontSize: 12
      }
    }, fmt(rowDue(row))), /*#__PURE__*/React.createElement("td", {
      style: {
        ...TD,
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "number",
      min: 0,
      max: 14,
      value: dueOv[row.k] != null ? dueOv[row.k] : row.defOff,
      onChange: function (e) {
        var v = e.target.value,
          k = row.k;
        setDueOv(function (p) {
          var u = Object.assign({}, p);
          u[k] = v;
          return u;
        });
      },
      style: {
        width: 46,
        textAlign: 'center',
        border: '1px solid #d1d5db',
        borderRadius: 4,
        padding: '2px',
        fontSize: 12
      }
    })), /*#__PURE__*/React.createElement("td", {
      style: {
        ...TD,
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        padding: '3px 10px',
        borderRadius: 12,
        backgroundColor: st.bg,
        color: st.co,
        whiteSpace: 'nowrap'
      }
    }, st.t)), /*#__PURE__*/React.createElement("td", {
      style: {
        ...TD,
        textAlign: 'right',
        whiteSpace: 'nowrap'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function () {
        prepareEmail(row.net, {
          subset: row.subset,
          suffix: row.suffix,
          label: row.emailLabel,
          rowKey: row.k
        });
      },
      style: {
        backgroundColor: '#1d4ed8',
        color: '#fff',
        border: 'none',
        borderRadius: 5,
        padding: '5px 12px',
        fontSize: 11,
        cursor: 'pointer',
        fontWeight: 700,
        marginRight: 6
      }
    }, "✉ Export + Email"), /*#__PURE__*/React.createElement("button", {
      onClick: function () {
        toggleSent(row);
      },
      style: {
        backgroundColor: sent ? '#fff' : '#059669',
        color: sent ? '#6b7280' : '#fff',
        border: sent ? '1px solid #d1d5db' : 'none',
        borderRadius: 5,
        padding: '5px 12px',
        fontSize: 11,
        cursor: 'pointer',
        fontWeight: 700
      }
    }, sent ? 'Undo' : 'Mark sent'), snaps[wc] && snaps[wc][row.k] && /*#__PURE__*/React.createElement("button", {
      onClick: function () {
        setViewSnap({
          wc: wc,
          k: row.k,
          label: row.label
        });
      },
      title: "View what was sent",
      style: {
        marginLeft: 6,
        backgroundColor: '#fff',
        color: '#1d4ed8',
        border: '1px solid #bfdbfe',
        borderRadius: 5,
        padding: '5px 10px',
        fontSize: 11,
        cursor: 'pointer',
        fontWeight: 700
      }
    }, "🕓")));
  }))), viewSnap && function () {
    var sn = (snaps[viewSnap.wc] || {})[viewSnap.k];
    if (!sn) return null;
    return /*#__PURE__*/React.createElement("div", {
      onClick: function () {
        setViewSnap(null);
      },
      style: {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: function (e) {
        e.stopPropagation();
      },
      style: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        width: 'min(560px,92vw)',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 800,
        fontSize: 14
      }
    }, viewSnap.label, " — sent record"), /*#__PURE__*/React.createElement("button", {
      onClick: function () {
        setViewSnap(null);
      },
      style: {
        border: 'none',
        background: 'none',
        fontSize: 16,
        cursor: 'pointer',
        color: '#6b7280'
      }
    }, "✕")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: '#6b7280',
        marginBottom: 10
      }
    }, "WC ", fmt(viewSnap.wc), " · exported ", new Date(sn.at).toLocaleString(), sn.label ? ' · ' + sn.label : ''), /*#__PURE__*/React.createElement("table", {
      style: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 12
      }
    }, /*#__PURE__*/React.createElement("tbody", null, sn.lines.map(function (l, i) {
      return /*#__PURE__*/React.createElement("tr", {
        key: i,
        style: {
          borderTop: '1px solid #f3f4f6'
        }
      }, /*#__PURE__*/React.createElement("td", {
        style: {
          padding: '5px 8px',
          fontFamily: 'monospace',
          fontWeight: 700,
          fontSize: 11,
          whiteSpace: 'nowrap'
        }
      }, l.key), /*#__PURE__*/React.createElement("td", {
        style: {
          padding: '5px 8px',
          color: '#374151'
        }
      }, l.detail));
    }), !sn.lines.length && /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '8px',
        color: '#9ca3af'
      }
    }, "No rotation lines captured."))))));
  }(), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#9ca3af',
      marginTop: 10
    }
  }, "Sent status is tracked per week — change the WC date above to see another week's run sheet. Due dates default to the usual lead times (RDC Sun–Tue earlier per Racing.com's split delivery); adjust \"days before WC\" if a network changes its deadline.")), tab === 'planner' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PlatformBar, {
    platform: platform,
    setPlatform: setPlatform,
    platformNets: platformNets
  }), !loaded ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 32,
      textAlign: 'center',
      color: '#9ca3af'
    }
  }, "Loading…") : /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600
    }
  }, "Week Commencing:"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: wc,
    onChange: function (e) {
      setWC(e.target.value);
    },
    style: {
      border: '1px solid #d1d5db',
      borderRadius: 5,
      padding: '4px 8px',
      fontSize: 13
    }
  }), /*#__PURE__*/React.createElement(NetToggle, {
    val: planNet,
    onChange: function (k) {
      setPlanNet(k);
      setActiveNote(null);
    },
    nets: platformNets
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: '#6b7280'
    }
  }, fmt(wc), " – ", fmt(wcEnd)), /*#__PURE__*/React.createElement("button", {
    onClick: clearAllocations,
    style: {
      marginLeft: 'auto',
      padding: '5px 14px',
      border: '1px solid ' + (confirmClear ? '#dc2626' : '#fca5a5'),
      borderRadius: 6,
      cursor: 'pointer',
      fontSize: 12,
      fontWeight: 600,
      backgroundColor: confirmClear ? '#dc2626' : '#fff5f5',
      color: confirmClear ? '#fff' : '#dc2626'
    }
  }, confirmClear ? '⚠ Confirm — cannot be undone' : '🗑 Clear All Allocations')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 5,
      marginBottom: 10,
      flexWrap: 'wrap'
    }
  }, [['● Active', '#fff', '#374151', '#e5e7eb'], ['⚠ Expiring', '#fef3c7', '#92400e', '#fde68a'], ['✕ Expired', '#f3f4f6', '#9ca3af', '#d1d5db'], ['◷ Not yet live', '#dbeafe', '#1e40af', '#bfdbfe'], ['● Amber = note', '#fffbeb', '#92400e', '#fde68a']].map(function (item) {
    return /*#__PURE__*/React.createElement("span", {
      key: item[0],
      style: {
        fontSize: 10,
        padding: '2px 8px',
        borderRadius: 10,
        backgroundColor: item[1],
        color: item[2],
        border: '1px solid ' + item[3]
      }
    }, item[0]);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: 'auto'
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      borderCollapse: 'collapse',
      fontSize: 12,
      width: '100%',
      tableLayout: 'fixed'
    }
  }, /*#__PURE__*/React.createElement("colgroup", null, /*#__PURE__*/React.createElement("col", {
    style: {
      width: 128
    }
  }), /*#__PURE__*/React.createElement("col", {
    style: {
      width: 175
    }
  }), /*#__PURE__*/React.createElement("col", {
    style: {
      width: 36
    }
  }), /*#__PURE__*/React.createElement("col", {
    style: {
      width: 66
    }
  }), /*#__PURE__*/React.createElement("col", {
    style: {
      width: 66
    }
  }), /*#__PURE__*/React.createElement("col", {
    style: {
      width: 62
    }
  }), DAYS.map(function (d) {
    return /*#__PURE__*/React.createElement("col", {
      key: d,
      style: {
        width: 52
      }
    });
  })), /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: TH
  }, "Key Number"), /*#__PURE__*/React.createElement("th", {
    style: TH
  }, "Creative Title"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...TH,
      textAlign: 'center'
    }
  }, "Dur"), /*#__PURE__*/React.createElement("th", {
    style: TH
  }, "Air Date"), /*#__PURE__*/React.createElement("th", {
    style: TH
  }, "End Date"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...TH,
      textAlign: 'center'
    }
  }, "Material"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...TH,
      textAlign: 'center',
      backgroundColor: '#e0f2fe',
      fontSize: 10,
      lineHeight: 1.2
    }
  }, "ALL", /*#__PURE__*/React.createElement("br", null), "WEEK %"), DAY_L.map(function (l, i) {
    return /*#__PURE__*/React.createElement("th", {
      key: l,
      style: {
        ...TH,
        textAlign: 'center',
        fontSize: 10,
        lineHeight: 1.2
      }
    }, l, /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 400,
        color: '#6b7280'
      }
    }, fmtShort(weekDates[i] || '')));
  }))), /*#__PURE__*/React.createElement("tbody", null, Object.keys(grouped).length === 0 ? /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: 13,
    style: {
      textAlign: 'center',
      padding: 24,
      color: '#9ca3af'
    }
  }, "No active creatives for ", (NETS.find(function (n) {
    return n.k === planNet;
  }) || {
    label: planNet
  }).label, " this week.")) : /*#__PURE__*/React.createElement(PlannerRows, {
    grouped: grouped,
    weekDates: weekDates,
    rots: rots,
    notes: notes,
    planNet: planNet,
    activeNote: activeNote,
    setActiveNote: setActiveNote,
    setRots: setRots,
    setNotes: setNotes
  }), /*#__PURE__*/React.createElement("tr", {
    style: {
      borderTop: '2px solid #374151',
      backgroundColor: '#f9fafb'
    }
  }, /*#__PURE__*/React.createElement("td", {
    colSpan: 5,
    style: {
      ...TD,
      textAlign: 'right',
      fontWeight: 700,
      fontSize: 12
    }
  }, "TOTAL PER DAY"), /*#__PURE__*/React.createElement("td", {
    style: {
      ...TD,
      textAlign: 'center',
      color: '#cbd5e1',
      fontSize: 11
    }
  }, "—"), DAYS.map(function (day) {
    var t = dayTotals[day] || 0,
      s = totStyle(t);
    return /*#__PURE__*/React.createElement("td", {
      key: day,
      style: {
        ...TD,
        textAlign: 'center',
        fontWeight: 800,
        fontSize: 12,
        backgroundColor: s.bg,
        color: s.co
      }
    }, t > 0 ? t + '%' : '', t === 100 ? ' ✓' : '');
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 5,
      marginTop: 10,
      flexWrap: 'wrap'
    }
  }, DAY_L.map(function (l, i) {
    var t = dayTotals[DAYS[i]] || 0,
      s = totStyle(t);
    return /*#__PURE__*/React.createElement("div", {
      key: l,
      style: {
        padding: '5px 10px',
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 700,
        backgroundColor: s.bg,
        color: s.co,
        border: '1px solid ' + s.bo
      }
    }, l, ": ", t > 0 ? t + '%' : '—', t === 100 ? ' ✓' : '');
  })))), tab === 'library' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PlatformBar, {
    platform: platform,
    setPlatform: setPlatform,
    platformNets: platformNets
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 700
    }
  }, "Creative Library ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: '#6b7280',
      fontWeight: 400
    }
  }, "(", creatives.length, " creatives", expiredCount > 0 && !showExpired ? ', ' + expiredCount + ' expired hidden' : '', ")")), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      gap: 12,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 12,
      color: '#6b7280',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: showExpired,
    onChange: function (e) {
      setShowExpired(e.target.checked);
    }
  }), "Show expired (", expiredCount, ")"), /*#__PURE__*/React.createElement("label", {
    style: {
      backgroundColor: '#059669',
      color: '#fff',
      border: 'none',
      borderRadius: 6,
      padding: '6px 14px',
      fontSize: 12,
      cursor: 'pointer',
      fontWeight: 700
    }
  }, "⬆ Import Keys", /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: ".json",
    onChange: importCreatives,
    style: {
      display: 'none'
    }
  })), /*#__PURE__*/React.createElement("button", {
    onClick: function () {
      setShowAdd(function (v) {
        return !v;
      });
    },
    style: {
      backgroundColor: '#1d4ed8',
      color: '#fff',
      border: 'none',
      borderRadius: 6,
      padding: '6px 14px',
      fontSize: 12,
      cursor: 'pointer',
      fontWeight: 700
    }
  }, "+ Add Creative"))), showAdd && /*#__PURE__*/React.createElement("div", {
    style: {
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: 8,
      padding: 14,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      marginBottom: 10
    }
  }, "New Creative"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))',
      gap: 8,
      marginBottom: 8
    }
  }, [['Key Number', 'keyNumber', 'text'], ['Title', 'title', 'text'], ['Duration (s)', 'dur', 'number']].map(function (f) {
    return /*#__PURE__*/React.createElement("div", {
      key: f[1]
    }, /*#__PURE__*/React.createElement("label", {
      style: lbl
    }, f[0]), /*#__PURE__*/React.createElement("input", {
      type: f[2],
      value: newC[f[1]],
      onChange: function (e) {
        var v = e.target.value,
          k = f[1];
        setNewC(function (p) {
          var u = Object.assign({}, p);
          u[k] = v;
          return u;
        });
      },
      style: inp
    }));
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "Category"), /*#__PURE__*/React.createElement("select", {
    value: newC.cat,
    onChange: function (e) {
      var v = e.target.value;
      setNewC(function (p) {
        return Object.assign({}, p, {
          cat: v
        });
      });
    },
    style: inp
  }, CATS.map(function (c) {
    return /*#__PURE__*/React.createElement("option", {
      key: c
    }, c);
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "Air Date"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: newC.air,
    onChange: function (e) {
      var v = e.target.value;
      setNewC(function (p) {
        return Object.assign({}, p, {
          air: v
        });
      });
    },
    style: inp
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "End Date (opt.)"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: newC.end,
    onChange: function (e) {
      var v = e.target.value;
      setNewC(function (p) {
        return Object.assign({}, p, {
          end: v
        });
      });
    },
    style: inp
  }))), PLATFORMS.map(function (plat) {
    return /*#__PURE__*/React.createElement("div", {
      key: plat.k,
      style: {
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        fontWeight: 700,
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        marginBottom: 4
      }
    }, plat.label, " Networks"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 14,
        flexWrap: 'wrap'
      }
    }, NETS.filter(function (n) {
      return n.platform === plat.k;
    }).map(function (n) {
      return /*#__PURE__*/React.createElement("label", {
        key: n.k,
        style: {
          fontSize: 12,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 4
        }
      }, /*#__PURE__*/React.createElement("input", {
        type: "checkbox",
        checked: newC.nets[n.k] || false,
        onChange: function (e) {
          var v = e.target.checked,
            k = n.k;
          setNewC(function (p) {
            var nets = Object.assign({}, p.nets);
            nets[k] = v;
            return Object.assign({}, p, {
              nets: nets
            });
          });
        }
      }), n.label, n.geo ? /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 10,
          color: '#9ca3af',
          marginLeft: 2
        }
      }, "(", n.geo, ")") : null);
    })));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: addCreative,
    style: {
      backgroundColor: '#1d4ed8',
      color: '#fff',
      border: 'none',
      borderRadius: 6,
      padding: '5px 12px',
      fontSize: 12,
      cursor: 'pointer',
      fontWeight: 700
    }
  }, "Add"), /*#__PURE__*/React.createElement("button", {
    onClick: function () {
      setShowAdd(false);
    },
    style: {
      backgroundColor: '#fff',
      color: '#374151',
      border: '1px solid #d1d5db',
      borderRadius: 6,
      padding: '5px 12px',
      fontSize: 12,
      cursor: 'pointer'
    }
  }, "Cancel"))), CAT_ORDER.filter(function (cat) {
    return !!allGrouped[cat];
  }).map(function (cat) {
    return /*#__PURE__*/React.createElement("div", {
      key: cat,
      style: {
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '5px 10px',
        backgroundColor: CAT_COL[cat] + '18',
        borderLeft: '3px solid ' + CAT_COL[cat],
        borderRadius: '0 4px 4px 0',
        marginBottom: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 800,
        color: CAT_COL[cat],
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }
    }, cat), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: '#6b7280',
        marginLeft: 8
      }
    }, allGrouped[cat].length, " creative", allGrouped[cat].length !== 1 ? 's' : '')), /*#__PURE__*/React.createElement("table", {
      style: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 12
      }
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
      style: TH
    }, "Status"), /*#__PURE__*/React.createElement("th", {
      style: TH
    }, "Key Number"), /*#__PURE__*/React.createElement("th", {
      style: TH
    }, "Title"), /*#__PURE__*/React.createElement("th", {
      style: {
        ...TH,
        textAlign: 'center'
      }
    }, "Dur"), /*#__PURE__*/React.createElement("th", {
      style: TH
    }, "Air Date", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 400,
        color: '#9ca3af',
        fontSize: 9
      }
    }, "blank = always")), /*#__PURE__*/React.createElement("th", {
      style: TH
    }, "End Date", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 400,
        color: '#9ca3af',
        fontSize: 9
      }
    }, "blank = ongoing")), allPlatNets.map(function (n) {
      return /*#__PURE__*/React.createElement("th", {
        key: n.k,
        style: {
          ...TH,
          textAlign: 'center'
        }
      }, n.label);
    }), /*#__PURE__*/React.createElement("th", {
      style: TH
    }))), /*#__PURE__*/React.createElement("tbody", null, allGrouped[cat].map(function (c) {
      var ss = ST[cStatus(c)];
      return /*#__PURE__*/React.createElement("tr", {
        key: c.id,
        style: {
          backgroundColor: ss.bg,
          borderBottom: '1px solid #e5e7eb',
          color: ss.tx
        }
      }, /*#__PURE__*/React.createElement("td", {
        style: TD
      }, ss.badge ? /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 10,
          padding: '1px 6px',
          borderRadius: 8,
          backgroundColor: 'rgba(0,0,0,0.07)'
        }
      }, ss.badge) : /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 10,
          color: '#16a34a',
          fontWeight: 700
        }
      }, "● Active")), /*#__PURE__*/React.createElement("td", {
        style: {
          ...TD,
          padding: '4px 6px'
        }
      }, /*#__PURE__*/React.createElement("input", {
        type: "text",
        value: c.keyNumber,
        onChange: function (e) {
          updateCreativeField(c.id, 'keyNumber', e.target.value);
        },
        style: {
          ...editInp,
          fontFamily: 'monospace',
          fontWeight: 700
        }
      })), /*#__PURE__*/React.createElement("td", {
        style: {
          ...TD,
          padding: '4px 6px'
        }
      }, /*#__PURE__*/React.createElement("input", {
        type: "text",
        value: c.title,
        onChange: function (e) {
          updateCreativeField(c.id, 'title', e.target.value);
        },
        style: editInp
      })), /*#__PURE__*/React.createElement("td", {
        style: {
          ...TD,
          padding: '4px 6px',
          textAlign: 'center'
        }
      }, /*#__PURE__*/React.createElement("input", {
        type: "number",
        min: 0,
        value: c.dur,
        onChange: function (e) {
          updateCreativeField(c.id, 'dur', e.target.value);
        },
        style: {
          ...editInp,
          width: 54,
          textAlign: 'center'
        }
      })), /*#__PURE__*/React.createElement("td", {
        style: {
          ...TD,
          padding: '4px 6px'
        }
      }, /*#__PURE__*/React.createElement("input", {
        type: "date",
        value: c.air,
        onChange: function (e) {
          updateCreativeField(c.id, 'air', e.target.value);
        },
        style: {
          ...editInp,
          width: 108
        }
      })), /*#__PURE__*/React.createElement("td", {
        style: {
          ...TD,
          padding: '4px 6px'
        }
      }, /*#__PURE__*/React.createElement("input", {
        type: "date",
        value: c.end,
        onChange: function (e) {
          updateCreativeField(c.id, 'end', e.target.value);
        },
        style: {
          ...editInp,
          width: 108
        }
      })), /*#__PURE__*/React.createElement("td", {
        style: {
          ...TD,
          padding: '4px 6px',
          textAlign: 'center'
        }
      }, /*#__PURE__*/React.createElement("select", {
        value: c.mat || 'ok',
        onChange: function (e) {
          updateCreativeField(c.id, 'mat', e.target.value);
        },
        style: {
          ...editInp,
          width: 96,
          backgroundColor: c.mat === 'missing' ? '#fee2e2' : c.mat === 'feeding' ? '#fef3c7' : '#f0fdf4',
          fontWeight: 600
        }
      }, /*#__PURE__*/React.createElement("option", {
        value: "ok"
      }, "Delivered"), /*#__PURE__*/React.createElement("option", {
        value: "feeding"
      }, "Feeding thru"), /*#__PURE__*/React.createElement("option", {
        value: "missing"
      }, "Not arrived"))), allPlatNets.map(function (n) {
        return /*#__PURE__*/React.createElement("td", {
          key: n.k,
          style: {
            ...TD,
            textAlign: 'center'
          }
        }, /*#__PURE__*/React.createElement("input", {
          type: "checkbox",
          checked: !!(c.nets && c.nets[n.k]),
          onChange: function (e) {
            updateCreativeNetwork(c.id, n.k, e.target.checked);
          },
          "aria-label": n.label + ' network for ' + c.keyNumber
        }));
      }), /*#__PURE__*/React.createElement("td", {
        style: TD
      }, /*#__PURE__*/React.createElement("button", {
        onClick: function () {
          var id = c.id;
          setC(function (p) {
            return p.filter(function (x) {
              return x.id !== id;
            });
          });
        },
        style: {
          fontSize: 10,
          color: '#ef4444',
          background: 'none',
          border: 'none',
          cursor: 'pointer'
        }
      }, "Remove")));
    }))));
  })), tab === 'outputs' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PlatformBar, {
    platform: platform,
    setPlatform: setPlatform,
    platformNets: platformNets
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 14,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(NetToggle, {
    val: outNet,
    onChange: setOutNet,
    nets: platformNets
  }), /*#__PURE__*/React.createElement("button", {
    onClick: function () {
      var ok = exportCSV(outNet);
      if (ok) zap('✓ Exported ' + (NETS.find(function (n) {
        return n.k === outNet;
      }) || {
        label: outNet
      }).label);
    },
    style: {
      backgroundColor: '#059669',
      color: '#fff',
      border: 'none',
      borderRadius: 6,
      padding: '6px 14px',
      fontSize: 12,
      cursor: 'pointer',
      fontWeight: 700
    }
  }, "↓ Export CSV"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: '#6b7280'
    }
  }, "WC: ", fmt(wc))), outNet === 'fox' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 12,
      padding: '10px 14px',
      backgroundColor: '#eff6ff',
      border: '1px solid #bfdbfe',
      borderRadius: 8,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '1 1 280px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: '#1d4ed8',
      marginBottom: 2
    }
  }, "📺 Fox Footy Spot-by-Spot Mapping"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#1e40af'
    }
  }, "Upload Fox's clear .xlsx — the tool applies your Fox rotation % for this week to assign creatives spot-by-spot (matched by duration) and downloads a completed file.")), /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-block',
      backgroundColor: '#1d4ed8',
      color: '#fff',
      padding: '8px 14px',
      borderRadius: 6,
      cursor: 'pointer',
      fontSize: 12,
      fontWeight: 700
    }
  }, "📂 Upload & Generate", /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: ".xlsx,.xls",
    onChange: handleFoxUpload,
    style: {
      display: 'none'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      backgroundColor: '#1d4ed8',
      color: '#fff',
      padding: '9px 14px',
      borderRadius: '6px 6px 0 0',
      fontSize: 13,
      fontWeight: 700
    }
  }, (NETS.find(function (n) {
    return n.k === outNet;
  }) || {
    label: outNet
  }).label, " — Material Instructions — WC ", fmt(wc)), /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: 'auto'
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      borderCollapse: 'collapse',
      fontSize: 12,
      border: '1px solid #e5e7eb',
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: TH
  }, "Key Number"), /*#__PURE__*/React.createElement("th", {
    style: TH
  }, "Creative Title"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...TH,
      textAlign: 'center'
    }
  }, "Dur"), /*#__PURE__*/React.createElement("th", {
    style: TH
  }, "Category"), DAY_L.map(function (l, i) {
    return /*#__PURE__*/React.createElement("th", {
      key: l,
      style: {
        ...TH,
        textAlign: 'center',
        fontSize: 10,
        lineHeight: 1.2
      }
    }, l, /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 400,
        color: '#6b7280'
      }
    }, fmtShort(weekDates[i] || '')));
  }))), /*#__PURE__*/React.createElement("tbody", null, outRows(outNet).length === 0 ? /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: 11,
    style: {
      textAlign: 'center',
      padding: 24,
      color: '#9ca3af'
    }
  }, "No creatives assigned this week.")) : outRows(outNet).map(function (r, i) {
    return /*#__PURE__*/React.createElement("tr", {
      key: r.id,
      style: {
        backgroundColor: i % 2 === 0 ? '#fff' : '#f9fafb',
        borderBottom: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        ...TD,
        fontFamily: 'monospace',
        fontWeight: 700,
        fontSize: 11
      }
    }, r.keyNumber), /*#__PURE__*/React.createElement("td", {
      style: TD
    }, r.title), /*#__PURE__*/React.createElement("td", {
      style: {
        ...TD,
        textAlign: 'center'
      }
    }, ":", r.dur), /*#__PURE__*/React.createElement("td", {
      style: TD
    }, /*#__PURE__*/React.createElement(CatBadge, {
      cat: r.cat
    })), DAYS.map(function (day, di) {
      var en = dayEnabled(r, weekDates[di] || ''),
        v = getDR(r.id, outNet, day),
        note = getNote(r.id, day);
      return /*#__PURE__*/React.createElement("td", {
        key: day,
        style: {
          ...TD,
          textAlign: 'center',
          backgroundColor: en ? 'transparent' : '#f4f4f5'
        }
      }, en ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: v ? 700 : 400,
          color: v ? '#1d4ed8' : '#9ca3af'
        }
      }, v ? v + '%' : '0%'), note && /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 9,
          color: '#92400e',
          fontStyle: 'italic'
        }
      }, note)) : '—');
    }));
  }))))), tab === 'rdcmi' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 14,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600
    }
  }, "Week Commencing:"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: wc,
    onChange: function (e) {
      setWC(e.target.value);
    },
    style: {
      border: '1px solid #d1d5db',
      borderRadius: 5,
      padding: '4px 8px',
      fontSize: 13
    }
  }), /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 11,
      color: '#6b7280',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: showExpired,
    onChange: function (e) {
      setShowExpired(e.target.checked);
    }
  }), "Show expired"), /*#__PURE__*/React.createElement("button", {
    onClick: rdcCopyFromLastWeek,
    style: {
      padding: '6px 14px',
      border: '1px solid #d1d5db',
      borderRadius: 6,
      cursor: 'pointer',
      fontSize: 12,
      fontWeight: 600,
      backgroundColor: '#fff',
      color: '#374151'
    }
  }, "⟲ Copy from Last Week"), /*#__PURE__*/React.createElement("button", {
    onClick: function () {
      exportRDCMI();
    },
    style: {
      backgroundColor: '#059669',
      color: '#fff',
      border: 'none',
      borderRadius: 6,
      padding: '6px 14px',
      fontSize: 12,
      cursor: 'pointer',
      fontWeight: 700
    }
  }, "↓ Full Week"), /*#__PURE__*/React.createElement("button", {
    onClick: function () {
      exportRDCMI(['sun', 'mon', 'tue'], 'Sun-Tue');
    },
    style: {
      backgroundColor: '#0369a1',
      color: '#fff',
      border: 'none',
      borderRadius: 6,
      padding: '6px 14px',
      fontSize: 12,
      cursor: 'pointer',
      fontWeight: 700
    }
  }, "↓ Sun–Tue"), /*#__PURE__*/React.createElement("button", {
    onClick: function () {
      exportRDCMI(['wed', 'thu', 'fri', 'sat'], 'Wed-Sat');
    },
    style: {
      backgroundColor: '#0369a1',
      color: '#fff',
      border: 'none',
      borderRadius: 6,
      padding: '6px 14px',
      fontSize: 12,
      cursor: 'pointer',
      fontWeight: 700
    }
  }, "↓ Wed–Sat"), /*#__PURE__*/React.createElement("button", {
    onClick: function () {
      exportRDCMI([rdcDay], DAY_L[DAYS.indexOf(rdcDay)]);
    },
    style: {
      backgroundColor: '#fff',
      color: '#0369a1',
      border: '1px solid #0369a1',
      borderRadius: 6,
      padding: '6px 14px',
      fontSize: 12,
      cursor: 'pointer',
      fontWeight: 700
    }
  }, "↓ ", DAY_L[DAYS.indexOf(rdcDay)], " only")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      borderBottom: '2px solid #e5e7eb',
      marginBottom: 16
    }
  }, DAYS.map(function (day, i) {
    return /*#__PURE__*/React.createElement("button", {
      key: day,
      onClick: function () {
        setRdcDay(day);
      },
      style: {
        padding: '6px 12px',
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: rdcDay === day ? 700 : 400,
        color: rdcDay === day ? '#1d4ed8' : '#374151',
        borderBottom: rdcDay === day ? '2px solid #1d4ed8' : '2px solid transparent',
        marginBottom: -2,
        lineHeight: 1.3
      }
    }, DAY_L[i], /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        fontWeight: 400,
        color: '#6b7280'
      }
    }, fmtShort(weekDates[i] || '')));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 14,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: '#6b7280'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      color: '#374151'
    }
  }, "Due: "), fmtRDC(rdcDueDate)), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      marginLeft: 'auto'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: '#9ca3af'
    }
  }, "Copy all timeslots into ", DAY_L[DAYS.indexOf(rdcDay)], " from:"), /*#__PURE__*/React.createElement("select", {
    value: "",
    onChange: function (e) {
      if (e.target.value) {
        rdcCopyFromDay(rdcDay, e.target.value);
        e.target.value = '';
      }
    },
    style: {
      border: '1px solid #d1d5db',
      borderRadius: 5,
      padding: '4px 7px',
      fontSize: 11,
      backgroundColor: '#fff',
      color: '#374151',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "— another day —"), DAYS.map(function (d, i) {
    if (d === rdcDay) return null;
    var dd = rdcMI[wc] && rdcMI[wc][d] || {};
    var n = 0;
    Object.keys(dd).forEach(function (k) {
      n += (dd[k] || []).filter(function (s) {
        return !!s.k;
      }).length;
    });
    if (!n) return null;
    return /*#__PURE__*/React.createElement("option", {
      key: d,
      value: d
    }, DAY_L[i], " (", n, ")");
  })))), RDC_DAYPARTS.map(function (dp) {
    if (dp.daysOnly && !dp.daysOnly.includes(rdcDay)) return null;
    var spots = rdcDayData[dp.k] || [];
    var dpKey = dp.k;
    var copySources = RDC_DAYPARTS.filter(function (o) {
      if (o.k === dp.k) return false;
      if (o.daysOnly && !o.daysOnly.includes(rdcDay)) return false;
      var os = (rdcDayData[o.k] || []).filter(function (s) {
        return !!s.k;
      });
      return os.length > 0;
    }).map(function (o) {
      return {
        k: o.k,
        label: o.label,
        count: (rdcDayData[o.k] || []).filter(function (s) {
          return !!s.k;
        }).length
      };
    });
    return /*#__PURE__*/React.createElement(RdcDaySection, {
      key: dp.k,
      dp: dp,
      rdcDay: rdcDay,
      spots: spots,
      creatives: creatives,
      weekDates: weekDates,
      rdcCreatives: rdcCreatives,
      copySources: copySources,
      onCopyFrom: function (srcK) {
        rdcCopyFromDaypart(rdcDay, dpKey, srcK);
      },
      onAdd: function () {
        rdcAddSpot(rdcDay, dpKey);
      },
      onRemove: function (idx) {
        rdcRemoveSpot(rdcDay, dpKey, idx);
      },
      onKey: function (idx, newKey) {
        rdcUpdateKey(rdcDay, dpKey, idx, newKey);
      },
      onField: function (idx, field, val) {
        rdcUpdateField(rdcDay, dpKey, idx, field, val);
      }
    });
  })), tab === 'email' && /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 640
    }
  }, /*#__PURE__*/React.createElement(PlatformBar, {
    platform: platform,
    setPlatform: setPlatform,
    platformNets: platformNets
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(NetToggle, {
    val: emailNet,
    onChange: setEmailNet,
    nets: allPlatNets
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: '#6b7280'
    }
  }, "WC: ", fmt(wc))), emailNet === 'rdc' && /*#__PURE__*/React.createElement("div", {
    style: {
      backgroundColor: '#f0f9ff',
      border: '1px solid #bae6fd',
      borderRadius: 6,
      padding: '8px 12px',
      marginBottom: 12,
      fontSize: 12,
      color: '#0369a1'
    }
  }, "RDC uses the daypart MI format — \"Prepare Email\" exports the RDC MI (not a rotation CSV)."), !(emailConfig[emailNet] && emailConfig[emailNet].to) && /*#__PURE__*/React.createElement("div", {
    style: {
      backgroundColor: '#fffbeb',
      border: '1px solid #fde68a',
      borderRadius: 6,
      padding: '8px 12px',
      marginBottom: 12,
      fontSize: 12,
      color: '#92400e'
    }
  }, "⚠ No To address set — add one below."), /*#__PURE__*/React.createElement("div", {
    style: {
      backgroundColor: '#f0f9ff',
      border: '1px solid #bae6fd',
      borderRadius: 6,
      padding: '8px 12px',
      marginBottom: 14,
      fontSize: 12,
      color: '#0369a1'
    }
  }, /*#__PURE__*/React.createElement("strong", null, "[WC_DATE]"), " will be replaced with ", /*#__PURE__*/React.createElement("strong", null, fmt(wc)), ". Templates save automatically."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 12,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(ContactEditor, {
    net: emailNet,
    cfg: emailConfig[emailNet],
    onSave: function (to, cc) {
      var net = emailNet;
      setEmailConfig(function (p) {
        var u = Object.assign({}, p);
        u[net] = Object.assign({}, u[net]);
        u[net].to = to;
        u[net].cc = cc;
        return u;
      });
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "Subject"), /*#__PURE__*/React.createElement("input", {
    value: emailConfig[emailNet] && emailConfig[emailNet].subject || '',
    onChange: function (e) {
      var v = e.target.value,
        net = emailNet;
      setEmailConfig(function (p) {
        var u = Object.assign({}, p);
        u[net] = Object.assign({}, u[net]);
        u[net].subject = v;
        return u;
      });
    },
    style: inp
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "Body"), /*#__PURE__*/React.createElement("textarea", {
    value: emailConfig[emailNet] && emailConfig[emailNet].body || '',
    onChange: function (e) {
      var v = e.target.value,
        net = emailNet;
      setEmailConfig(function (p) {
        var u = Object.assign({}, p);
        u[net] = Object.assign({}, u[net]);
        u[net].body = v;
        return u;
      });
    },
    style: {
      ...inp,
      height: 140,
      resize: 'vertical',
      fontFamily: 'system-ui,sans-serif',
      lineHeight: 1.5
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'center',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function () {
      prepareEmail(emailNet);
    },
    style: {
      backgroundColor: '#1d4ed8',
      color: '#fff',
      border: 'none',
      borderRadius: 6,
      padding: '8px 18px',
      fontSize: 13,
      cursor: 'pointer',
      fontWeight: 700
    }
  }, "✉ Prepare Email & Download ", emailNet === 'rdc' ? 'RDC MI' : 'CSV'), /*#__PURE__*/React.createElement("button", {
    onClick: function () {
      var net = emailNet;
      setEmailConfig(function (p) {
        var u = Object.assign({}, p);
        u[net] = Object.assign({}, DEFAULT_EMAILS[net]);
        return u;
      });
    },
    style: {
      backgroundColor: '#fff',
      color: '#6b7280',
      border: '1px solid #d1d5db',
      borderRadius: 6,
      padding: '8px 12px',
      fontSize: 12,
      cursor: 'pointer'
    }
  }, "Reset to default")), /*#__PURE__*/React.createElement("div", {
    style: {
      backgroundColor: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: 8,
      padding: 14,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: '#374151',
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }
  }, "Quick Rotation Change"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#9ca3af',
      marginBottom: 10
    }
  }, "Mid-week creative swap: tick the key numbers and send a \"rotate these evenly\" email to ", (NETS.find(function (n) {
    return n.k === emailNet;
  }) || {
    label: emailNet
  }).label, "."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 4,
      maxHeight: 220,
      overflow: 'auto',
      marginBottom: 10
    }
  }, active.filter(function (c) {
    return c.nets && c.nets[emailNet];
  }).sort(function (a, b) {
    var ai = CAT_ORDER.indexOf(a.cat),
      bi = CAT_ORDER.indexOf(b.cat);
    if (ai !== bi) return ai - bi;
    return a.keyNumber < b.keyNumber ? -1 : 1;
  }).map(function (c) {
    return /*#__PURE__*/React.createElement("label", {
      key: c.keyNumber,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 12,
        cursor: 'pointer',
        padding: '2px 4px'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: !!rotSel[c.keyNumber],
      onChange: function (e) {
        var k = c.keyNumber,
          v = e.target.checked;
        setRotSel(function (p) {
          var u = Object.assign({}, p);
          u[k] = v;
          return u;
        });
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'monospace',
        fontWeight: 700,
        fontSize: 11
      }
    }, c.keyNumber), /*#__PURE__*/React.createElement(CatBadge, {
      cat: c.cat
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#6b7280'
      }
    }, stripDur(c.title), " :", c.dur));
  })), /*#__PURE__*/React.createElement("button", {
    onClick: sendRotationEmail,
    style: {
      backgroundColor: '#111827',
      color: '#fff',
      border: 'none',
      borderRadius: 6,
      padding: '7px 16px',
      fontSize: 12,
      cursor: 'pointer',
      fontWeight: 700
    }
  }, "✉ Send Rotation Update")), /*#__PURE__*/React.createElement("div", {
    style: {
      backgroundColor: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: 8,
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: '#374151',
      marginBottom: 10,
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }
  }, "Preview"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      display: 'grid',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#6b7280',
      fontWeight: 600
    }
  }, "To: "), emailConfig[emailNet] && emailConfig[emailNet].to || /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#d1d5db'
    }
  }, "Not set")), emailConfig[emailNet] && emailConfig[emailNet].cc && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#6b7280',
      fontWeight: 600
    }
  }, "CC: "), emailConfig[emailNet].cc), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#6b7280',
      fontWeight: 600
    }
  }, "Subject: "), /*#__PURE__*/React.createElement("strong", null, (emailConfig[emailNet] && emailConfig[emailNet].subject || '').replace(/\[WC_DATE\]/g, fmt(wc)))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      paddingTop: 10,
      borderTop: '1px solid #e5e7eb',
      whiteSpace: 'pre-wrap',
      fontSize: 12,
      color: '#374151',
      lineHeight: 1.6
    }
  }, (emailConfig[emailNet] && emailConfig[emailNet].body || '').replace(/\[WC_DATE\]/g, fmt(wc)))))), foxModal && /*#__PURE__*/React.createElement("div", {
    onClick: function () {
      setFoxModal(null);
    },
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: function (e) {
      e.stopPropagation();
    },
    style: {
      backgroundColor: '#fff',
      borderRadius: 10,
      maxWidth: 520,
      width: '100%',
      maxHeight: '80vh',
      overflow: 'auto',
      boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 18px',
      borderBottom: '1px solid #e5e7eb',
      fontSize: 14,
      fontWeight: 800,
      color: '#111827'
    }
  }, foxModal.title), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 18px',
      fontSize: 13,
      color: '#374151',
      lineHeight: 1.5
    }
  }, foxModal.body), foxModal.issues && foxModal.issues.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 18px 14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: '#92400e',
      marginBottom: 6,
      textTransform: 'uppercase',
      letterSpacing: '0.04em'
    }
  }, "Unassigned"), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      paddingLeft: 18,
      fontSize: 12,
      color: '#92400e'
    }
  }, foxModal.issues.map(function (it, i) {
    return /*#__PURE__*/React.createElement("li", {
      key: i,
      style: {
        marginBottom: 3
      }
    }, it);
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 18px',
      borderTop: '1px solid #e5e7eb',
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function () {
      setFoxModal(null);
    },
    style: {
      backgroundColor: '#1d4ed8',
      color: '#fff',
      border: 'none',
      borderRadius: 6,
      padding: '7px 18px',
      fontSize: 13,
      cursor: 'pointer',
      fontWeight: 700
    }
  }, "Got it")))));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));