(function () {
  var css = document.createElement('style');
  css.textContent = ["@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');", "html,body{background:linear-gradient(180deg,#f6f7fb 0%,#eef0f6 100%) !important;min-height:100vh;}", "body,button,input,select,textarea{font-family:'Inter',system-ui,-apple-system,'Segoe UI',sans-serif !important;}", "button{transition:all .15s ease;border-radius:8px !important;}", "button:hover{filter:brightness(1.06);transform:translateY(-1px);box-shadow:0 3px 10px rgba(17,24,39,.10);}", "button:active{transform:translateY(0);}", "input,select,textarea{border-radius:8px !important;transition:border-color .15s,box-shadow .15s;}", "input:focus,select:focus,textarea:focus{outline:none !important;border-color:#EE1A42 !important;box-shadow:0 0 0 3px rgba(238,26,66,.12) !important;}", "table{border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(17,24,39,.06);}", "tbody tr{transition:background .12s;}", "tbody tr:hover{background:#f8f9fd !important;}", "::-webkit-scrollbar{width:9px;height:9px;}", "::-webkit-scrollbar-thumb{background:#c9cdd8;border-radius:6px;}", "::-webkit-scrollbar-thumb:hover{background:#aab0bf;}", "::-webkit-scrollbar-track{background:transparent;}", ".mi-shell{animation:miFade .25s ease;}", "@keyframes miFade{from{opacity:.6;transform:translateY(3px);}to{opacity:1;transform:none;}}"].join('\n');
  document.head.appendChild(css);
})();
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
// Snap any date (ISO yyyy-mm-dd) back to the Sunday of that week.
// Keeps "Week Commencing" always a Sunday so day buckets stay aligned with their real dates.
function snapToSunday(iso) {
  if (!iso) return iso;
  var d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return iso;
  d.setDate(d.getDate() - d.getDay());
  return localISO(d);
}
const SV = "5";
const BUILD = "29 Sep 2026";
const fmt = s => s ? s.split('-').reverse().join('/') : '—';
const fmtShort = s => s ? s.split('-').reverse().join('/').slice(0, 5) : '';
const CATS = ["AFL", "NRL", "NFL", "NBA", "MLB", "Racing", "Foxcatcher/StatMate", "World Cup", "Other"];
const CAT_ORDER = ["NRL", "AFL", "NFL", "NBA", "MLB", "Racing", "Foxcatcher/StatMate", "World Cup", "Other"];
const CAT_COL = {
  NRL: '#dc2626',
  AFL: '#2563eb',
  NFL: '#013369',
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
// One show type per sports code. ESPN can only split by code, so Live and Ancillary always ran the
// same keys and are now one bucket. The ids keep the old "Live" keys so saved weeks carry straight
// over; old Ancillary entries (nbaAnc, nflAnc, mlbAnc) are simply no longer read.
const US_SHOWTYPES = [
  { k: 'nbaLive', label: 'NBA', sport: 'NBA', tier: 'live', col: '#C8102E', tint: '#F4C7CE' },
  { k: 'nflLive', label: 'NFL', sport: 'NFL', tier: 'live', col: '#013369', tint: '#B9C6DA' },
  { k: 'mlbLive', label: 'MLB', sport: 'MLB', tier: 'live', col: '#0C7C59', tint: '#BFE3D5' },
  { k: 'other', label: 'Other Programming', sport: 'Other', tier: 'live', col: '#B58A00', tint: '#EFE1B3' }
];
const US_ALL_LABEL = 'ALL PROGRAMMING';
// Light tint per sport for each creative row in the ESPN export, plus a colour key under the title
const US_SPORT_FILL = { NFL: ['DCE6F2', 'NFL'], NBA: ['FADBD8', 'NBA'], MLB: ['D5F0E6', 'MLB'], Racing: ['DDF2DC', 'Racing'],
  FC: ['FDEBD0', 'Foxcatcher'], SM: ['E8DEF8', 'StatMate'], Other: ['EEEEEE', 'Other'] };
// David's rule: every rotation % ends in 0 or 5. Each key in a rotation keeps at least 5%, the rest goes
// to the largest remainders (ties to the bigger share, then the key number), so a column still adds to
// 100. A rotation that doesn't add to 100 is rounded key by key. The MI skill's script rounds the same way.
function usRound5(rot, keyOf) {
  var ids = Object.keys(rot).filter(function (id) { return (parseFloat(rot[id]) || 0) > 0; });
  var val = {}, pct = {}, sum = 0;
  ids.forEach(function (id) { val[id] = parseFloat(rot[id]); sum += val[id]; pct[id] = Math.max(5, Math.floor((val[id] + 1e-9) / 5) * 5); });
  var cmpKey = function (a, b) { var x = keyOf(a), y = keyOf(b); return x < y ? -1 : x > y ? 1 : 0; };
  if (Math.abs(sum - 100) <= 0.5) {
    var left = 100 - ids.reduce(function (t, id) { return t + pct[id]; }, 0);
    while (left > 0) {
      ids.sort(function (a, b) { return ((val[b] - pct[b]) - (val[a] - pct[a])) || (val[b] - val[a]) || cmpKey(a, b); });
      pct[ids[0]] += 5; left -= 5;
    }
    while (left < 0) {
      var over = ids.filter(function (id) { return pct[id] > 5; });
      if (!over.length) break;
      over.sort(function (a, b) { return ((val[a] - pct[a]) - (val[b] - pct[b])) || (val[a] - val[b]) || cmpKey(a, b); });
      pct[over[0]] -= 5; left += 5;
    }
  } else {
    ids.forEach(function (id) { pct[id] = Math.max(5, Math.floor(val[id] / 5 + 0.5) * 5); });
  }
  var out = {};
  ids.forEach(function (id) { out[id] = String(pct[id]); });
  return out;
}
function usSportOf(c) {
  var key = String(c.keyNumber || ''), t = (key + ' ' + (c.title || '')).toUpperCase();
  if (c.cat === 'Foxcatcher/StatMate') return (/^SM/.test(key.toUpperCase()) || t.indexOf('STATMATE') >= 0) ? 'SM' : 'FC';
  if (c.cat === 'NFL' || c.cat === 'NBA' || c.cat === 'MLB' || c.cat === 'Racing') return c.cat;
  if (/^SM/i.test(key)) return 'SM';
  if (/^FXC/i.test(key)) return 'FC';
  if (t.indexOf('NFL') >= 0) return 'NFL';
  if (t.indexOf('NBA') >= 0) return 'NBA';
  if (t.indexOf('MLB') >= 0) return 'MLB';
  if (/^PB\d\dR/i.test(key) || t.indexOf('RACING') >= 0) return 'Racing';
  return 'Other';
}
const US_SPORT_ORDER = ['NFL', 'NBA', 'MLB', 'Racing', 'Foxcatcher/StatMate', 'AFL', 'NRL', 'World Cup', 'Other'];
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
      w[day][dp.k] = [];
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
    title: c.note ? (c.title + ' \u2014 NOTE: ' + c.note) : c.title
  }, c.title, c.note ? /*#__PURE__*/React.createElement("span", { title: c.note, style: { marginLeft: 5, fontSize: 9, color: '#b45309', fontWeight: 700 } }, '\uD83D\uDCDD') : null), /*#__PURE__*/React.createElement("td", {
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
    }, "\u2715"));
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
  }, "First \"To\" person\u2019s name is used for the email greeting and rotation updates."));
}
function USSports(props) {
  var p = props, h = React.createElement;
  var wc = p.wc, setWc = p.setWc, fmt = p.fmt, creatives = p.creatives, isExpired = p.isExpired;
  var US_SHOWTYPES = p.US_SHOWTYPES, US_SPORT_ORDER = p.US_SPORT_ORDER, CAT_COL = p.CAT_COL, stripDur = p.stripDur;
  var DAYS = p.DAYS, DAY_L = p.DAY_L, getWeekDates = p.getWeekDates;
  var isUsOn = p.isUsOn, toggleUsOn = p.toggleUsOn, usActiveShowtypes = p.usActiveShowtypes;
  var daySplit = p.daySplit, setDaySplit = p.setDaySplit, daySections = p.daySections;
  var usPct = p.usPct, setUsPctWithPair = p.setUsPctWithPair, usPoolTotal = p.usPoolTotal;
  var usCopyBucket = p.usCopyBucket, usCopyDay = p.usCopyDay, usCopySection = p.usCopySection;
  var usCreativesFor = p.usCreativesFor, exportUsXLSX = p.exportUsXLSX;

  var stDay = React.useState('sun'); var day = stDay[0], setDay = stDay[1];
  var wd = getWeekDates(wc);
  var active = usActiveShowtypes();
  var espnCre = usCreativesFor();
  var secs = daySections(day);
  var split = daySplit(day);

  // ---- header row: week + export ----
  var header = h('div', { style: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' } },
    h('span', { style: { fontSize: 13, fontWeight: 600 } }, 'Week commencing:'),
    h('input', { type: 'date', value: wc, onChange: function (e) { setWc(snapToSunday(e.target.value)); }, style: { border: '1px solid #d1d5db', borderRadius: 8, padding: '6px 10px', fontSize: 13 } }),
    h('span', { style: { fontSize: 11, color: '#9ca3af' } }, 'ESPN \u00b7 per day, per sports code. 15s and 30s each total 100% separately. The export is a one-page grid: days and sports codes with the same rotation share a column, so it only splits where the material changes. Every % is rounded to 5% steps (at least 5% per key, columns still add to 100%).'),
    active.length ? h('button', { onClick: exportUsXLSX, style: { marginLeft: 'auto', background: '#1d6f42', color: '#fff', border: 'none', borderRadius: 9, padding: '8px 16px', fontSize: 13, fontWeight: 800, cursor: 'pointer' } }, '\u2193 Export ESPN Excel') : null
  );

  // ---- show-type toggle strip ----
  var toggleStrip = h('div', { style: { background: '#fff', borderRadius: 12, padding: '12px 16px', marginBottom: 14, boxShadow: '0 1px 4px rgba(17,24,39,.07)' } },
    h('div', { style: { fontSize: 11, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 } }, 'On-air this week \u2014 toggle the sports codes running'),
    h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
      US_SHOWTYPES.map(function (s) {
        var on = isUsOn(s.k);
        return h('button', { key: s.k, onClick: function () { toggleUsOn(s.k); },
          style: { border: '2px solid ' + s.col, borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', background: on ? s.col : '#fff', color: on ? '#fff' : s.col } },
          (on ? '\u25CF ' : '\u25CB ') + s.label);
      })));

  // ---- day tabs ----
  var dayTabs = h('div', { style: { display: 'flex', borderBottom: '2px solid #e5e7eb', marginBottom: 14, flexWrap: 'wrap' } },
    DAYS.map(function (d, i) {
      var sel = day === d;
      return h('button', { key: d, onClick: function () { setDay(d); },
        style: { padding: '6px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: sel ? 700 : 400, color: sel ? '#EE1A42' : '#374151', borderBottom: sel ? '2px solid #EE1A42' : '2px solid transparent', marginBottom: -2, lineHeight: 1.3 } },
        DAY_L[i], h('br'), h('span', { style: { fontSize: 10, fontWeight: 400, color: '#6b7280' } }, (fmt(wd[i] || '') || '').slice(0, 5)));
    }));

  // ---- split control for the current day ----
  var splitCtl = h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px' } },
    h('label', { style: { fontSize: 12, color: '#374151', display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 600 } },
      h('input', { type: 'checkbox', checked: split.splits > 1, onChange: function (e) { setDaySplit(day, e.target.checked ? { splits: 2, times: ['10:30'] } : null); } }),
      'Split ' + DAY_L[DAYS.indexOf(day)] + ' into time sections'),
    split.splits > 1 ? h('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 6 } },
      h('span', { style: { fontSize: 12, color: '#6b7280' } }, 'Sections:'),
      h('select', { value: split.splits, onChange: function (e) {
          var n = parseInt(e.target.value); var times = (split.times || []).slice(0, n - 1);
          while (times.length < n - 1) times.push('');
          setDaySplit(day, { splits: n, times: times });
        }, style: { border: '1px solid #d1d5db', borderRadius: 6, padding: '4px 8px', fontSize: 12 } },
        [2, 3, 4].map(function (n) { return h('option', { key: n, value: n }, n); }))
    ) : null,
    split.splits > 1 ? (split.times || []).map(function (t, i) {
      return h('span', { key: i, style: { display: 'inline-flex', alignItems: 'center', gap: 4 } },
        h('span', { style: { fontSize: 11, color: '#9ca3af' } }, 'break ' + (i + 1) + ':'),
        h('input', { type: 'time', value: t, onChange: function (e) {
            var times = (split.times || []).slice(); times[i] = e.target.value;
            setDaySplit(day, { splits: split.splits, times: times });
          }, style: { border: '1px solid #d1d5db', borderRadius: 6, padding: '3px 6px', fontSize: 12 } }));
    }) : null,
    h('span', { style: { marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 } },
      h('span', { style: { fontSize: 11, color: '#9ca3af' } }, 'Copy this day to:'),
      h('select', { value: '', onChange: function (e) { if (e.target.value) { usCopyDay(day, e.target.value); e.target.value = ''; } }, style: { border: '1px solid #d1d5db', borderRadius: 6, padding: '4px 6px', fontSize: 11 } },
        [h('option', { key: '', value: '' }, '\u2014 another day \u2014')].concat(DAYS.map(function (d2, i) { return d2 === day ? null : h('option', { key: d2, value: d2 }, DAY_L[i]); })))));

  // ---- the grid: for each section, each active show type, 15s + 30s pools ----
  var body = null;
  if (!active.length) {
    body = h('div', { style: { background: '#fff', borderRadius: 12, padding: '40px 20px', textAlign: 'center', color: '#6b7280', fontSize: 14, boxShadow: '0 1px 4px rgba(17,24,39,.07)' } },
      'No sports codes are on-air. Toggle some on above (e.g. NFL) to start allocating.');
  } else {
    body = h('div', null, secs.map(function (sec) {
      return h('div', { key: sec.id, style: { marginBottom: 18 } },
        secs.length > 1 ? h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 } },
          h('span', { style: { fontSize: 13, fontWeight: 800, color: '#111827', background: '#eef0f6', borderRadius: 6, padding: '4px 12px' } }, '\u23F1 ' + sec.label),
          secs.length > 1 ? h('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 5 } },
            h('span', { style: { fontSize: 11, color: '#9ca3af' } }, 'copy this timeslot to:'),
            h('select', { value: '', onChange: function (e) { if (e.target.value) { usCopySection(day, sec.id, e.target.value); e.target.value = ''; } }, style: { border: '1px solid #d1d5db', borderRadius: 6, padding: '3px 6px', fontSize: 11 } },
              [h('option', { key: '', value: '' }, '\u2014 timeslot \u2014')].concat(secs.map(function (s2) { return s2.id === sec.id ? null : h('option', { key: s2.id, value: s2.id }, s2.label); })))) : null
        ) : null,
        active.map(function (st) {
          return h(USBucket, { key: st.k, st: st, day: day, sec: sec, secs: secs, active: active,
            espnCre: espnCre, usPct: usPct, setUsPctWithPair: setUsPctWithPair, usPoolTotal: usPoolTotal,
            usCopyBucket: usCopyBucket, CAT_COL: CAT_COL, stripDur: stripDur, US_SPORT_ORDER: US_SPORT_ORDER, DAY_L: DAY_L, DAYS: DAYS });
        }));
    }));
  }

  return h('div', null, header, toggleStrip, dayTabs, splitCtl, body);
}

function USBucket(props) {
  var h = React.createElement;
  var st = props.st, day = props.day, sec = props.sec, secs = props.secs, active = props.active;
  var espnCre = props.espnCre, usPct = props.usPct, setUsPctWithPair = props.setUsPctWithPair, usPoolTotal = props.usPoolTotal;
  var usCopyBucket = props.usCopyBucket, CAT_COL = props.CAT_COL, stripDur = props.stripDur, US_SPORT_ORDER = props.US_SPORT_ORDER, DAY_L = props.DAY_L, DAYS = props.DAYS;

  function poolBlock(dur, label) {
    var rows = espnCre.filter(function (c) { return String(c.dur) === dur; });
    if (!rows.length) return null;
    var total = usPoolTotal(day, sec.id, st.k, dur);
    var tc = total === 100 ? '#059669' : (total > 100 ? '#dc2626' : '#b45309');
    var bySport = {};
    rows.forEach(function (c) { (bySport[c.cat] = bySport[c.cat] || []).push(c); });
    var trs = [];
    US_SPORT_ORDER.forEach(function (sport) {
      var grp = (bySport[sport] || []).sort(function (a, b) { return a.keyNumber < b.keyNumber ? -1 : 1; });
      if (!grp.length) return;
      var col = CAT_COL[sport] || '#6b7280';
      trs.push(h('tr', { key: 'sp' + sport }, h('td', { colSpan: 3, style: { background: col + '15', color: col, fontWeight: 700, fontSize: 10, padding: '3px 8px', textTransform: 'uppercase', letterSpacing: '.03em' } }, sport)));
      grp.forEach(function (c) {
        trs.push(h('tr', { key: c.id, style: { borderTop: '1px solid #f4f5f7' } },
          h('td', { style: { padding: '4px 8px', fontFamily: 'ui-monospace,Menlo,monospace', fontWeight: 700, fontSize: 11 } }, c.keyNumber),
          h('td', { style: { padding: '4px 8px', fontSize: 12 } }, stripDur(c.title)),
          h('td', { style: { padding: '4px 8px', textAlign: 'center', width: 70 } },
            h('input', { value: usPct(day, sec.id, st.k, c.id), onChange: function (e) { setUsPctWithPair(day, sec.id, st.k, c.id, e.target.value); },
              placeholder: '%', style: { width: 52, border: '1px solid #d1d5db', borderRadius: 6, padding: '3px 6px', fontSize: 12, textAlign: 'center' } }))));
      });
    });
    return h('div', { style: { flex: '1 1 320px', minWidth: 300 } },
      h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 8px', background: '#fafafa', borderRadius: '6px 6px 0 0' } },
        h('span', { style: { fontSize: 11, fontWeight: 700, color: '#374151' } }, label),
        h('span', { style: { fontSize: 11, fontWeight: 800, color: tc } }, total + '% ' + (total === 100 ? '\u2713' : ''))),
      h('table', { style: { width: '100%', borderCollapse: 'collapse' } }, h('tbody', null, trs)));
  }

  var p15 = poolBlock('15', ':15 spots'), p30 = poolBlock('30', ':30 spots');
  // copy-from picker: sources = every other bucket in this day's sections + same showtype other days is too much; keep to current-day buckets
  var sources = [];
  secs.forEach(function (s2) {
    active.forEach(function (o) {
      if (s2.id === sec.id && o.k === st.k) return;
      sources.push({ day: day, sec: s2.id, st: o.k, label: (secs.length > 1 ? s2.label + ' \u00b7 ' : '') + o.label });
    });
  });

  return h('div', { style: { background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(17,24,39,.07)', overflow: 'hidden', marginBottom: 12 } },
    h('div', { style: { padding: '8px 14px', background: st.col, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' } },
      h('span', { style: { fontWeight: 800, fontSize: 13 } }, st.label),
      h('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 5 } },
        h('span', { style: { fontSize: 10, opacity: .85 } }, 'copy from:'),
        h('select', { value: '', onChange: function (e) { if (e.target.value) { var s = sources[parseInt(e.target.value)]; usCopyBucket(s.day, s.sec, s.st, day, sec.id, st.k); e.target.value = ''; } },
          style: { border: 'none', borderRadius: 6, padding: '3px 6px', fontSize: 11 } },
          [h('option', { key: '', value: '' }, '\u2014 another bucket \u2014')].concat(sources.map(function (s, i) { return h('option', { key: i, value: i }, s.label); }))))),
    h('div', { style: { display: 'flex', gap: 16, flexWrap: 'wrap', padding: 12 } }, p15, p30,
      (!p15 && !p30) ? h('div', { style: { color: '#9ca3af', fontSize: 12, padding: 8 } }, 'No ESPN creatives to allocate.') : null));
}
function PlatformTabHeader(props) {
  var tab = props.tab, planNet = props.planNet, setPlanNet = props.setPlanNet;
  var h = React.createElement;
  if (tab === 'foxfooty') {
    return h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, padding: '10px 14px', backgroundColor: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' } },
      h('span', { style: { fontSize: 13, fontWeight: 700, color: '#111827' } }, '🏈 Fox Footy'),
      h('span', { style: { fontSize: 11, color: '#9ca3af' } }, 'National · TV rotation'));
  }
  // radio: station sub-selector
  var stations = [['nine', 'Nine Radio'], ['sen', 'SEN Radio'], ['triplem', 'Triple M']];
  return h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, padding: '10px 14px', backgroundColor: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb', flexWrap: 'wrap' } },
    h('span', { style: { fontSize: 13, fontWeight: 700, color: '#111827', marginRight: 4 } }, '📻 Radio'),
    stations.map(function (st) {
      var sel = planNet === st[0];
      return h('button', { key: st[0], onClick: function () { setPlanNet(st[0]); },
        style: { padding: '5px 14px', border: 'none', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: sel ? 700 : 500, backgroundColor: sel ? '#111827' : '#fff', color: sel ? '#fff' : '#6b7280', boxShadow: sel ? 'none' : '0 0 0 1px #e5e7eb' } }, st[1]);
    }));
}

// ---- Large format (QMS) ----
// Reads the two spreadsheets QMS sends: the client schedule from sales (one row per panel, a column per
// week marked p = paid, B = bonus, plus a MOVE audience summary sheet) and the production specs export
// that comes with the campaign welcome email (one row per panel booking with pixel size, slot length and
// content restrictions). Both become one campaign: panels, the weeks each is live, and value/audience.
var LF_STATES = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT'];
function lfNorm(s) { return String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9%]+/g, ''); }
function lfISOFromSerial(n) {
  var d = new Date(Date.UTC(1899, 11, 30) + Math.round(n) * 86400000);
  return d.toISOString().slice(0, 10);
}
function lfAddDays(iso, n) {
  var d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10);
}
function lfMonday(iso) {
  var d = new Date(iso + 'T00:00:00Z'); var wd = (d.getUTCDay() + 6) % 7; d.setUTCDate(d.getUTCDate() - wd); return d.toISOString().slice(0, 10);
}
function lfDateCell(v) {
  if (typeof v === 'number' && v > 40000 && v < 60000) return lfISOFromSerial(v);
  if (v instanceof Date && !isNaN(v)) return v.toISOString().slice(0, 10);
  if (typeof v === 'string') {
    var m = v.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/);
    if (m) { var y = m[3].length === 2 ? '20' + m[3] : m[3]; return y + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[1]).slice(-2); }
    if (/^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
  }
  return '';
}
function lfSize(txt, w, h) {
  w = parseInt(w, 10); h = parseInt(h, 10);
  if (!(w > 0 && h > 0)) {
    var m = String(txt == null ? '' : txt).match(/(\d{2,5})\D+?(\d{2,5})/);
    if (m) { w = parseInt(m[1], 10); h = parseInt(m[2], 10); }
  }
  return w > 0 && h > 0 ? { w: w, h: h, px: w + 'x' + h } : { w: 0, h: 0, px: '' };
}
function lfNum(v) {
  if (typeof v === 'number') return v;
  var n = parseFloat(String(v == null ? '' : v).replace(/[$,%\s]/g, ''));
  return isNaN(n) ? null : n;
}
function lfRows(XLSX, ws) { return XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: null, blankrows: true }); }
function lfFindCol(hdr, keys, exact) {
  for (var i = 0; i < hdr.length; i++) {
    var n = lfNorm(hdr[i]);
    if (!n) continue;
    for (var k = 0; k < keys.length; k++) {
      if (exact ? n === keys[k] : n.indexOf(keys[k]) === 0) return i;
    }
  }
  return -1;
}
function lfCleanName(file) {
  return String(file || 'QMS campaign').replace(/\.[a-z0-9]+$/i, '').replace(/^QMS[_ -]+/i, '').replace(/[_ ]+CLIENT$/i, '')
    .replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
}
function lfMark(v) {
  var s = String(v == null ? '' : v).trim();
  if (!s) return '';
  var n = s.toLowerCase();
  if (n === 'n/a' || n === 'na' || n === '-' || n === 'x/a') return 'na';
  if (n === 'b' || n.indexOf('bonus') === 0) return 'b';
  return 'p';
}

// Client schedule: header row holds "SITE NUMBER / NO. OF PANELS"; week columns are dated header cells.
function lfParseSchedule(XLSX, wb, file) {
  var sheetName = null, rows = null, hr = -1;
  wb.SheetNames.some(function (sn) {
    var rs = lfRows(XLSX, wb.Sheets[sn]);
    for (var r = 0; r < Math.min(rs.length, 40); r++) {
      if ((rs[r] || []).some(function (v) { return lfNorm(v).indexOf('sitenumber') === 0; })) { sheetName = sn; rows = rs; hr = r; return true; }
    }
    return false;
  });
  if (!rows) return null;
  var hdr = rows[hr] || [];
  var C = {
    lat: lfFindCol(hdr, ['latitude']), lng: lfFindCol(hdr, ['longitude']), qfmt: lfFindCol(hdr, ['qmsformat']),
    state: lfFindCol(hdr, ['state'], true), site: lfFindCol(hdr, ['sitenumber']), addr: lfFindCol(hdr, ['address']),
    suburb: lfFindCol(hdr, ['suburb']), pc: lfFindCol(hdr, ['postcode']), dir: lfFindCol(hdr, ['direction']),
    fmt: lfFindCol(hdr, ['format'], true), sizem: lfFindCol(hdr, ['size'], true), px: lfFindCol(hdr, ['digitalspecs']),
    sot: lfFindCol(hdr, ['shareoftime', 'sot']), dur: lfFindCol(hdr, ['adduration', 'slotlength']),
    illum: lfFindCol(hdr, ['illumination'], true), rate: lfFindCol(hdr, ['weeklymarketrate']),
    mval: lfFindCol(hdr, ['mediavalueincbonus', 'mediavalue']), mkt: lfFindCol(hdr, ['marketvalue']),
    bval: lfFindCol(hdr, ['bonusmediavalue']), bought: lfFindCol(hdr, ['mediaboughtrate', 'boughtrate', 'nettcost', 'netcost'])
  };
  if (C.site < 0) return null;
  var weekCols = [];
  hdr.forEach(function (v, i) { var iso = lfDateCell(v); if (iso && typeof v !== 'string') weekCols.push({ i: i, wk: lfMonday(iso) }); });
  var panels = {}, order = [], lastPanelRow = hr, value = { media: 0, market: 0, bonus: 0, bought: null };
  for (var r = hr + 1; r < rows.length; r++) {
    var row = rows[r] || [];
    var site = row[C.site];
    var hasFmt = (C.fmt >= 0 && row[C.fmt]) || (C.qfmt >= 0 && row[C.qfmt]) || (C.px >= 0 && row[C.px]);
    if (site == null || String(site).trim() === '' || !hasFmt) continue;
    lastPanelRow = r;
    var id = String(site).trim();
    var sz = lfSize(C.px >= 0 ? row[C.px] : '');
    var p = panels[id];
    if (!p) {
      p = panels[id] = {
        id: id, state: C.state >= 0 ? String(row[C.state] || '').trim().toUpperCase() : '',
        addr: C.addr >= 0 ? String(row[C.addr] || '').trim() : '', suburb: C.suburb >= 0 ? String(row[C.suburb] || '').trim() : '',
        pc: C.pc >= 0 && row[C.pc] != null ? String(row[C.pc]) : '', dir: C.dir >= 0 ? String(row[C.dir] || '').trim() : '',
        type: C.qfmt >= 0 ? String(row[C.qfmt] || '').trim() : (C.fmt >= 0 ? String(row[C.fmt] || '').trim() : ''),
        px: sz.px, w: sz.w, h: sz.h, size: C.sizem >= 0 ? String(row[C.sizem] || '').trim() : '',
        sot: C.sot >= 0 ? lfNum(row[C.sot]) : null, dur: C.dur >= 0 ? lfNum(row[C.dur]) : null,
        illum: C.illum >= 0 ? String(row[C.illum] || '').trim() : '', rate: C.rate >= 0 ? lfNum(row[C.rate]) : null,
        restrict: '', link: '', weeks: {}, na: []
      };
      order.push(id);
    }
    weekCols.forEach(function (wc) {
      var m = lfMark(row[wc.i]);
      if (m === 'na') { if (p.na.indexOf(wc.wk) < 0) p.na.push(wc.wk); }
      else if (m) p.weeks[wc.wk] = m;
    });
    if (C.mval >= 0) value.media += lfNum(row[C.mval]) || 0;
    if (C.mkt >= 0) value.market += lfNum(row[C.mkt]) || 0;
    if (C.bval >= 0) value.bonus += lfNum(row[C.bval]) || 0;
  }
  if (C.bought >= 0) {
    for (var r2 = hr + 1; r2 <= lastPanelRow; r2++) {
      var b = lfNum((rows[r2] || [])[C.bought]);
      if (b) { value.bought = b; break; }
    }
  }
  var camp = lfMakeCampaign(order.map(function (id) { return panels[id]; }), {
    name: lfCleanName(file), source: 'schedule', file: file, sheet: sheetName,
    value: (value.media || value.bought) ? value : null, move: lfParseMove(XLSX, wb)
  });
  return camp;
}

// MOVE audience summary sheet (label in one cell, value in the next).
function lfParseMove(XLSX, wb) {
  var sn = wb.SheetNames.find(function (n) { return /move/i.test(n); });
  if (!sn) return null;
  var rows = lfRows(XLSX, wb.Sheets[sn]), out = {}, markets = null;
  var keys = { 'campaignmarkets': 'markets', 'demographic': 'demo', 'totalpotentials': 'potential', 'campaignreach000s': 'reach',
    'campaignreach%': 'reachPct', 'campaignfrequency': 'freq', 'campaignimpressions': 'impressions', 'neuroimpactfactornif': 'nif' };
  rows.forEach(function (row, r) {
    row = row || [];
    for (var i = 0; i < row.length; i++) {
      var k = keys[lfNorm(row[i])];
      if (k) { for (var j = i + 1; j < row.length; j++) { if (row[j] != null && row[j] !== '') { out[k] = row[j]; break; } } break; }
    }
    var cityCols = [];
    row.forEach(function (v, i) { if (/^(sydney|melbourne|brisbane|adelaide|perth|hobart|canberra|darwin)$/i.test(String(v || '').trim())) cityCols.push(i); });
    if (cityCols.length >= 2 && !markets) {
      markets = {};
      cityCols.forEach(function (i) { markets[String(row[i]).trim()] = {}; });
      for (var r2 = r + 1; r2 < Math.min(rows.length, r + 8); r2++) {
        var lab = lfNorm((rows[r2] || []).find(function (v) { return typeof v === 'string'; }));
        var key = lab === 'potentials' ? 'potential' : lab === 'reach000s' ? 'reach' : lab === 'reach%' ? 'reachPct' : lab === 'averagefrequency' ? 'freq' : lab === 'impressions' ? 'impressions' : null;
        if (!key) continue;
        cityCols.forEach(function (i) { markets[String(row[i]).trim()][key] = lfNum((rows[r2] || [])[i]); });
      }
    }
  });
  if (!Object.keys(out).length && !markets) return null;
  ['potential', 'reach', 'reachPct', 'freq', 'impressions', 'nif'].forEach(function (k) { if (out[k] != null) out[k] = lfNum(out[k]); });
  if (markets) out.marketsBy = markets;
  return out;
}

// Production specs export (system file from QMS campaign delivery). One row per panel booking.
function lfParseSpecs(XLSX, wb, file) {
  var names = wb.SheetNames.filter(function (n) { return /spec/i.test(n); });
  if (!names.length) names = wb.SheetNames.slice();
  var panels = {}, order = [], meta = {};
  var found = false;
  names.forEach(function (sn) {
    var rows = lfRows(XLSX, wb.Sheets[sn]), hr = -1;
    for (var r = 0; r < Math.min(rows.length, 40); r++) {
      var row = rows[r] || [];
      var lab = lfNorm(row[0]);
      if (lab === 'campaignid' && row[1] != null) meta.qmsId = String(row[1]).replace(/^0+/, '');
      if (lab === 'campaignname' && row[1]) meta.name = String(row[1]).trim();
      if (row.some(function (v) { return lfNorm(v) === 'panelid'; })) { hr = r; break; }
    }
    if (hr < 0) return;
    found = true;
    var hdr = rows[hr];
    var C = {
      type: lfFindCol(hdr, ['paneltype']), id: lfFindCol(hdr, ['panelid'], true), addr: lfFindCol(hdr, ['address']),
      suburb: lfFindCol(hdr, ['suburb']), state: lfFindCol(hdr, ['state'], true), pc: lfFindCol(hdr, ['postcode']),
      start: lfFindCol(hdr, ['startdate']), end: lfFindCol(hdr, ['enddate']), pw: lfFindCol(hdr, ['pixelwidth']),
      ph: lfFindCol(hdr, ['pixelheight']), btype: lfFindCol(hdr, ['bookingtype']), dur: lfFindCol(hdr, ['slotlength']),
      sot: lfFindCol(hdr, ['sot%', 'sot', 'shareoftime']), dir: lfFindCol(hdr, ['paneldirection', 'direction']),
      link: lfFindCol(hdr, ['sitecardlink']), restrict: lfFindCol(hdr, ['contentrestrictions']),
      nonstd: lfFindCol(hdr, ['nonstandardspecs'])
    };
    for (var r3 = hr + 1; r3 < rows.length; r3++) {
      var row3 = rows[r3] || [];
      var id = row3[C.id];
      if (id == null || String(id).trim() === '') continue;
      id = String(id).trim();
      var sz = lfSize('', C.pw >= 0 ? row3[C.pw] : 0, C.ph >= 0 ? row3[C.ph] : 0);
      var p = panels[id];
      if (!p) {
        p = panels[id] = {
          id: id, state: C.state >= 0 ? String(row3[C.state] || '').trim().toUpperCase() : '',
          addr: C.addr >= 0 ? String(row3[C.addr] || '').trim() : '', suburb: C.suburb >= 0 ? String(row3[C.suburb] || '').trim() : '',
          pc: C.pc >= 0 && row3[C.pc] != null ? String(row3[C.pc]) : '', dir: C.dir >= 0 ? String(row3[C.dir] || '').trim() : '',
          type: C.type >= 0 ? String(row3[C.type] || '').trim() : '', px: sz.px, w: sz.w, h: sz.h, size: '',
          sot: C.sot >= 0 ? lfNum(row3[C.sot]) : null, dur: C.dur >= 0 ? lfNum(row3[C.dur]) : null, illum: '', rate: null,
          restrict: [C.restrict >= 0 ? row3[C.restrict] : '', C.nonstd >= 0 ? row3[C.nonstd] : ''].filter(Boolean).join('; '),
          link: C.link >= 0 ? String(row3[C.link] || '') : '', weeks: {}, na: []
        };
        order.push(id);
      }
      var s = lfDateCell(C.start >= 0 ? row3[C.start] : null), e = lfDateCell(C.end >= 0 ? row3[C.end] : null) || s;
      var mark = /bonus/i.test(String(C.btype >= 0 ? row3[C.btype] : '')) ? 'b' : 'p';
      if (s) for (var wk = lfMonday(s); wk <= e; wk = lfAddDays(wk, 7)) p.weeks[wk] = mark;
    }
  });
  if (!found) return null;
  return lfMakeCampaign(order.map(function (id) { return panels[id]; }), {
    name: meta.name || lfCleanName(file), qmsId: meta.qmsId || '', source: 'specs', file: file
  });
}

function lfMakeCampaign(panels, o) {
  var weeks = {};
  panels.forEach(function (p) { Object.keys(p.weeks).forEach(function (w) { weeks[w] = 1; }); });
  return {
    id: 'lf' + Date.now().toString(36), name: o.name, owner: 'QMS', qmsId: o.qmsId || '', status: o.source === 'specs' ? 'Booked' : 'Proposed',
    source: o.source, file: o.file || '', imported: new Date().toISOString().slice(0, 10), value: o.value || null, move: o.move || null,
    due: '', plan: {}, panels: panels, weeks: Object.keys(weeks).sort()
  };
}

function lfParseWorkbook(XLSX, wb, file) {
  var c = lfParseSpecs(XLSX, wb, file) || lfParseSchedule(XLSX, wb, file);
  if (!c || !c.panels.length) throw new Error('No QMS panels found. Expecting a QMS client schedule or production specs export.');
  return c;
}

// Re-import onto an existing campaign: panels and weeks come from the new file, panel details are merged
// (a specs export adds restrictions and slot lengths to a schedule's panels), and the creative plan,
// artwork due date, campaign number and value/audience figures are kept unless the new file has them.
function lfMergeCampaign(old, nw) {
  var oldBy = {};
  old.panels.forEach(function (p) { oldBy[p.id] = p; });
  var newIds = {};
  var panels = nw.panels.map(function (p) {
    newIds[p.id] = 1;
    var o = oldBy[p.id];
    if (!o) return p;
    var m = Object.assign({}, o);
    Object.keys(p).forEach(function (k) {
      var v = p[k];
      if (k === 'weeks' || k === 'na') m[k] = v;
      else if (v !== '' && v != null) m[k] = v;
    });
    return m;
  });
  var moved = 0;
  nw.panels.forEach(function (p) {
    var o = oldBy[p.id];
    if (o && JSON.stringify(Object.keys(o.weeks).sort()) !== JSON.stringify(Object.keys(p.weeks).sort())) moved++;
  });
  var diff = {
    added: nw.panels.filter(function (p) { return !oldBy[p.id]; }).map(function (p) { return p.id; }),
    removed: old.panels.filter(function (p) { return !newIds[p.id]; }).map(function (p) { return p.id; }),
    moved: moved
  };
  var merged = Object.assign({}, old, {
    panels: panels, weeks: nw.weeks, file: nw.file, imported: nw.imported,
    qmsId: nw.qmsId || old.qmsId, value: nw.value || old.value, move: nw.move || old.move,
    status: nw.source === 'specs' ? 'Booked' : old.status, source: nw.source
  });
  return { camp: merged, diff: diff };
}

function lfPanelsSorted(camp) {
  var stOrder = function (s) { var i = LF_STATES.indexOf(s); return i < 0 ? 99 : i; };
  var firstWk = function (p) { return Object.keys(p.weeks).sort()[0] || '9999'; };
  return camp.panels.slice().sort(function (a, b) {
    return stOrder(a.state) - stOrder(b.state) || (firstWk(a) < firstWk(b) ? -1 : firstWk(a) > firstWk(b) ? 1 : 0) || (a.id < b.id ? -1 : 1);
  });
}
// Creative for a week and state: a state entry overrides the all-states entry.
function lfConcept(camp, wk, state) {
  var w = (camp.plan || {})[wk] || {};
  return String(w[state] || w.ALL || '').trim();
}
function lfFileName(camp, concept, px) {
  var id = String(camp.qmsId || '').replace(/^0+/, '') || 'CAMPAIGNNO';
  var c = String(concept || '').trim().replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return [id, 'PointsBet', c || 'TBC', px].join('_');
}
// Artwork needed: one file per creative per pixel size, with the panels, states and weeks it covers.
// Due a week before the first Monday it goes live (QMS asks for artwork and MI by then), or the date
// typed against the campaign for the creative that opens it.
function lfArtwork(camp) {
  var by = {}, unassigned = { bookings: 0, weeks: {} };
  camp.panels.forEach(function (p) {
    Object.keys(p.weeks).forEach(function (wk) {
      var c = lfConcept(camp, wk, p.state);
      if (!c) { unassigned.bookings++; unassigned.weeks[wk] = 1; return; }
      var k = c + '|' + p.px;
      var a = by[k] || (by[k] = { concept: c, px: p.px, w: p.w, h: p.h, panels: {}, states: {}, weeks: {} });
      a.panels[p.id] = 1; a.states[p.state] = 1; a.weeks[wk] = 1;
    });
  });
  // A creative's artwork is all due together, a week before its first live week anywhere.
  var conceptFirst = {};
  Object.keys(by).forEach(function (k) {
    var a = by[k], f = Object.keys(a.weeks).sort()[0];
    if (!conceptFirst[a.concept] || f < conceptFirst[a.concept]) conceptFirst[a.concept] = f;
  });
  var list = Object.keys(by).map(function (k) {
    var a = by[k], wks = Object.keys(a.weeks).sort();
    var first = wks[0], cf = conceptFirst[a.concept];
    var due = camp.due && cf === camp.weeks[0] ? camp.due : lfAddDays(cf, -7);
    return {
      concept: a.concept, px: a.px, w: a.w, h: a.h, file: lfFileName(camp, a.concept, a.px),
      panels: Object.keys(a.panels), states: LF_STATES.filter(function (s) { return a.states[s]; }).concat(Object.keys(a.states).filter(function (s) { return LF_STATES.indexOf(s) < 0; })),
      weeks: wks, first: first, due: due
    };
  });
  list.forEach(function (a) { a.conceptFirst = conceptFirst[a.concept]; });
  list.sort(function (x, y) {
    return x.conceptFirst < y.conceptFirst ? -1 : x.conceptFirst > y.conceptFirst ? 1 : x.concept < y.concept ? -1 : x.concept > y.concept ? 1
      : (y.panels.length - x.panels.length) || (x.w * x.h > y.w * y.h ? -1 : 1);
  });
  return { list: list, unassigned: unassigned };
}
// QMS Material Instructions rows: one per panel per run of back-to-back weeks with the same creative.
function lfMIRows(camp) {
  var out = [];
  lfPanelsSorted(camp).forEach(function (p) {
    var wks = Object.keys(p.weeks).sort(), run = null;
    wks.forEach(function (wk) {
      var c = lfConcept(camp, wk, p.state), bt = p.weeks[wk] === 'b' ? 'Bonus' : 'Standard';
      if (run && run.concept === c && run.booking === bt && lfAddDays(run.lastWk, 7) === wk) { run.lastWk = wk; return; }
      run = { panel: p, concept: c, booking: bt, firstWk: wk, lastWk: wk };
      out.push(run);
    });
  });
  return out.map(function (r) {
    var p = r.panel;
    return {
      type: p.type || 'Billboard', id: p.id, addr: p.addr, suburb: p.suburb, state: p.state, pc: p.pc,
      start: r.firstWk, end: lfAddDays(r.lastWk, 6), sot: p.sot, w: p.w, h: p.h, booking: r.booking,
      share: r.concept ? 1 : null, file: r.concept ? lfFileName(camp, r.concept, p.px) : 'TBC', concept: r.concept
    };
  });
}

function lfFmt(iso, withYear) {
  if (!iso) return '';
  var p = iso.split('-');
  return p[2] + '/' + p[1] + (withYear ? '/' + p[0].slice(2) : '');
}
function lfMoney(n) {
  if (n == null || isNaN(n)) return '';
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(2).replace(/\.?0+$/, '') + 'M';
  if (n >= 1e3) return '$' + Math.round(n / 1e3) + 'k';
  return '$' + Math.round(n);
}
function lfStatesOf(camp) {
  var s = {};
  camp.panels.forEach(function (p) { s[p.state] = 1; });
  return LF_STATES.filter(function (x) { return s[x]; }).concat(Object.keys(s).filter(function (x) { return LF_STATES.indexOf(x) < 0; }));
}
var LF_TINTS = [['#fde2e7', '#9f1239'], ['#dbeafe', '#1e3a8a'], ['#d1fae5', '#065f46'], ['#fef3c7', '#92400e'], ['#ede9fe', '#5b21b6'], ['#cffafe', '#155e75'], ['#fce7f3', '#9d174d'], ['#e5e7eb', '#1f2937']];
function lfConceptList(camp) {
  var seen = {}, out = [];
  camp.weeks.forEach(function (wk) {
    var w = (camp.plan || {})[wk] || {};
    ['ALL'].concat(LF_STATES).forEach(function (k) { var c = String(w[k] || '').trim(); if (c && !seen[c]) { seen[c] = 1; out.push(c); } });
  });
  return out;
}

// One workbook for QMS: the artwork list, their Material Instructions layout filled in, and the schedule.
function lfExport(camp, XLSX, zap) {
  try {
    var hasStyles = XLSX !== XLSX_NPM;
    var INK = '1F2937', MID = '4B5563', PAPER = 'F3F4F6', LINE = 'D1D5DB';
    var thin = { style: 'thin', color: { rgb: LINE } }, box = { top: thin, bottom: thin, left: thin, right: thin };
    var font = function (bold, color) { return { name: 'Calibri', sz: 11, bold: !!bold, color: { rgb: color || INK } }; };
    var bg = function (rgb) { return { patternType: 'solid', fgColor: { rgb: rgb } }; };
    var serial = function (iso) { var p = iso.split('-'); return (Date.UTC(+p[0], +p[1] - 1, +p[2]) - Date.UTC(1899, 11, 30)) / 86400000; };
    function sheet(rows, widths, merges) {
      var ws = XLSX.utils.aoa_to_sheet(rows.map(function (r) { return r.map(function (c) { return c && typeof c === 'object' ? (c.v == null ? '' : c.v) : (c == null ? '' : c); }); }));
      rows.forEach(function (r, ri) {
        r.forEach(function (c, ci) {
          var a = XLSX.utils.encode_cell({ r: ri, c: ci });
          if (!ws[a]) ws[a] = { t: 's', v: '' };
          var o = c && typeof c === 'object' ? c : {};
          if (o.date) { ws[a] = { t: 'n', v: serial(o.date), z: 'dd/mm/yyyy' }; }
          if (o.z) ws[a].z = o.z;
          if (hasStyles) ws[a].s = { font: font(o.b, o.color), fill: o.fill ? bg(o.fill) : undefined, border: o.box ? box : undefined, alignment: { vertical: 'center', horizontal: o.align, wrapText: !!o.wrap } };
        });
      });
      ws['!cols'] = widths.map(function (w) { return { wch: w }; });
      if (merges) ws['!merges'] = merges;
      return ws;
    }
    var H = function (t) { return { v: t, b: true, fill: PAPER, box: true }; };
    var C = function (v, o) { return Object.assign({ v: v, box: true }, o || {}); };
    var art = lfArtwork(camp), wb = XLSX.utils.book_new();
    var title = function (t) { return [{ v: t, b: true }]; };

    // Artwork list
    var ar = [title('QMS Large Format ' + String.fromCharCode(8212) + ' Artwork List'), [camp.name + (camp.qmsId ? ' (#' + camp.qmsId + ')' : '')], [],
      [H('Creative'), H('Size (px)'), H('File name'), H('Panels'), H('States'), H('First live'), H('Artwork due')]];
    art.list.forEach(function (a) {
      ar.push([C(a.concept, { b: true }), C(a.px), C(a.file), C(a.panels.length, { align: 'center' }), C(a.states.join(', ')), C('', { date: a.first, box: true }), C('', { date: a.due, box: true })]);
    });
    if (art.unassigned.bookings) ar.push([], [{ v: art.unassigned.bookings + ' panel bookings have no creative yet (' + Object.keys(art.unassigned.weeks).sort().map(function (w) { return 'wc ' + lfFmt(w); }).join(', ') + ')', color: 'C00000', b: true }]);
    XLSX.utils.book_append_sheet(wb, sheet(ar, [26, 12, 52, 9, 22, 13, 13]), 'Artwork List');

    // Material Instructions in QMS's own column order
    var mi = lfMIRows(camp), first = camp.weeks[0], last = lfAddDays(camp.weeks[camp.weeks.length - 1], 6);
    var mr = [title('QMS MEDIA - DIGITAL MATERIAL INSTRUCTIONS'), ['Campaign ID', camp.qmsId || ''], ['Campaign Name', camp.name], ['Client', 'PointsBet'], ['Brand', 'PointsBet'],
      ['Start Date', { date: first }], ['End Date', { date: last }],
      ['Panel Type', 'Panel ID', 'Address', 'Suburb', 'State', 'Postcode', 'Start Date', 'End Date', 'SoT %', 'Pixel Width', 'Pixel Height', 'Booking Type', 'Consecutive Location', 'Code', 'Start Time', 'End Time', 'Share %', 'Key Number/File Name'].map(H)];
    mi.forEach(function (r) {
      mr.push([C(r.type), C(r.id, { b: true }), C(r.addr), C(r.suburb), C(r.state), C(r.pc), C('', { date: r.start, box: true }), C('', { date: r.end, box: true }),
        C(r.sot == null ? '' : r.sot, { z: '0%' }), C(r.w || ''), C(r.h || ''), C(r.booking), C(''), C(''), C(''), C(''), C(r.share == null ? '' : r.share, { z: '0%' }),
        C(r.file, r.concept ? {} : { color: 'C00000', b: true })]);
    });
    XLSX.utils.book_append_sheet(wb, sheet(mr, [20, 12, 34, 18, 7, 9, 12, 12, 7, 11, 11, 13, 10, 7, 10, 9, 8, 48]), 'Material Instructions');

    // Schedule: panels down the side, weeks across, creative in each live week
    var sr = [title('Schedule ' + String.fromCharCode(8212) + ' ' + camp.name), [],
      [H('State'), H('Panel'), H('Location'), H('Size (px)'), H('Slot (s)')].concat(camp.weeks.map(function (w) { return H('wc ' + lfFmt(w, true)); }))];
    var concepts = lfConceptList(camp);
    lfStatesOf(camp).forEach(function (st) {
      lfPanelsSorted(camp).filter(function (p) { return p.state === st; }).forEach(function (p) {
        sr.push([C(st), C(p.id, { b: true }), C([p.addr, p.suburb].filter(Boolean).join(', ')), C(p.px), C(p.dur == null ? '' : p.dur, { align: 'center' })].concat(camp.weeks.map(function (w) {
          var m = p.weeks[w];
          if (!m) return C('');
          var c = lfConcept(camp, w, p.state), ix = concepts.indexOf(c);
          var t = ix >= 0 ? LF_TINTS[ix % LF_TINTS.length] : ['#FFFFFF', '#C00000'];
          return C((c || 'TBC') + (m === 'b' ? ' (B)' : ''), { fill: t[0].slice(1).toUpperCase(), color: t[1].slice(1).toUpperCase(), b: true, align: 'center' });
        })));
      });
    });
    XLSX.utils.book_append_sheet(wb, sheet(sr, [7, 12, 40, 11, 8].concat(camp.weeks.map(function () { return 18; }))), 'Schedule');

    var name = 'QMS MI ' + String(camp.name).replace(/^pointsbet\s*[-:]?\s*/i, '').replace(/[\\\/:*?"<>|]+/g, '-') + '.xlsx';
    var out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    var url = URL.createObjectURL(new Blob([out], { type: 'application/octet-stream' }));
    var a = document.createElement('a'); a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 150);
    var warn = [];
    if (!camp.qmsId) warn.push('no QMS campaign number, file names use CAMPAIGNNO');
    if (art.unassigned.bookings) warn.push(art.unassigned.bookings + ' bookings have no creative');
    zap(warn.length ? '✓ QMS MI exported · ⚠ ' + warn.join(' · ') : '✓ QMS MI exported (' + art.list.length + ' artwork files, ' + mi.length + ' MI rows)');
  } catch (e) { zap('⚠ Export failed: ' + (e && e.message ? e.message : e)); }
}

function LargeFormat(props) {
  var h = React.createElement;
  var camps = props.camps || [], setCamps = props.setCamps, zap = props.zap, getXLSX = props.getXLSX;
  var stSel = React.useState(camps[0] ? camps[0].id : null), sel = stSel[0], setSel = stSel[1];
  var stView = React.useState('plan'), view = stView[0], setView = stView[1];
  var fileRef = React.useRef(null), modeRef = React.useRef('new');
  var camp = camps.find(function (c) { return c.id === sel; }) || camps[0] || null;
  var card = { background: '#fff', borderRadius: 12, padding: '14px 16px', marginBottom: 14, boxShadow: '0 1px 4px rgba(17,24,39,.07)' };
  var lab = { fontSize: 11, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em' };
  var inp = { border: '1px solid #d1d5db', borderRadius: 6, padding: '4px 8px', fontSize: 12 };
  var btn = function (bgc, col) { return { background: bgc, color: col || '#fff', border: bgc === '#fff' ? '1px solid #d1d5db' : 'none', borderRadius: 9, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }; };
  var th = { padding: '6px 8px', fontSize: 11, fontWeight: 800, color: '#374151', background: '#f3f4f6', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' };
  var td = { padding: '5px 8px', fontSize: 12, borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle' };

  function update(id, fn) {
    setCamps(function (prev) { return prev.map(function (c) { return c.id === id ? fn(Object.assign({}, c)) : c; }); });
  }
  function pick(mode) { modeRef.current = mode; if (fileRef.current) { fileRef.current.value = ''; fileRef.current.click(); } }
  function onFile(e) {
    var f = e.target.files && e.target.files[0];
    if (!f) return;
    var reader = new FileReader();
    reader.onload = function (ev) {
      try {
        var XLSX = getXLSX();
        var wb = XLSX.read(new Uint8Array(ev.target.result), { type: 'array' });
        var nw = lfParseWorkbook(XLSX, wb, f.name);
        var target = modeRef.current === 'update' && camp ? camp : camps.find(function (c) { return (nw.qmsId && c.qmsId === nw.qmsId) || c.name === nw.name; });
        if (target) {
          var res = lfMergeCampaign(target, nw);
          res.camp.lastDiff = res.diff;
          setCamps(function (prev) { return prev.map(function (c) { return c.id === target.id ? res.camp : c; }); });
          setSel(target.id);
          zap('✓ ' + target.name + ' updated · ' + res.diff.added.length + ' panels added, ' + res.diff.removed.length + ' removed, ' + res.diff.moved + ' changed weeks');
        } else {
          setCamps(function (prev) { return prev.concat([nw]); });
          setSel(nw.id);
          zap('✓ Imported ' + nw.name + ' · ' + nw.panels.length + ' panels over ' + nw.weeks.length + ' weeks');
        }
      } catch (err) { zap('⚠ ' + (err && err.message ? err.message : 'Could not read that file')); }
    };
    reader.readAsArrayBuffer(f);
  }
  var hidden = h('input', { ref: fileRef, type: 'file', accept: '.xlsx,.xls', onChange: onFile, style: { display: 'none' } });

  var header = h('div', { style: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' } },
    h('span', { style: { fontSize: 15, fontWeight: 800, color: '#111827' } }, 'Large format'),
    h('span', { style: { fontSize: 11, color: '#9ca3af', maxWidth: 560 } }, 'Import a QMS client schedule or the production specs export from the campaign welcome email. Re-import a newer version onto the same campaign to update panels and weeks without losing the creative plan.'),
    h('button', { onClick: function () { pick('new'); }, style: Object.assign(btn('linear-gradient(90deg,#EE1A42,#c8123a)'), { marginLeft: 'auto' }) }, '+ Import QMS file'), hidden);

  if (!camps.length) {
    return h('div', null, header, h('div', { style: Object.assign({}, card, { padding: '36px 24px', textAlign: 'center', color: '#4b5563', fontSize: 13, lineHeight: 1.6 }) },
      h('div', { style: { fontSize: 14, fontWeight: 800, color: '#111827', marginBottom: 6 } }, 'No large format campaigns yet'),
      'Use ', h('b', null, '+ Import QMS file'), ' with either file QMS sends: the client schedule from sales (weeks marked p and B, with the MOVE summary), or the production specs export (pixel sizes, slot lengths, content restrictions).'));
  }

  var pills = h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 } }, camps.map(function (c) {
    var on = camp && c.id === camp.id;
    return h('button', { key: c.id, onClick: function () { setSel(c.id); }, style: { border: '2px solid ' + (on ? '#EE1A42' : '#e5e7eb'), background: on ? '#fff1f3' : '#fff', borderRadius: 10, padding: '6px 12px', cursor: 'pointer', textAlign: 'left' } },
      h('div', { style: { fontSize: 12, fontWeight: 800, color: '#111827' } }, c.name),
      h('div', { style: { fontSize: 10, color: '#6b7280' } }, (c.weeks.length ? lfFmt(c.weeks[0], true) + ' – ' + lfFmt(lfAddDays(c.weeks[c.weeks.length - 1], 6), true) : 'no weeks') + ' · ' + c.panels.length + ' panels · ' + c.status));
  }));

  var states = lfStatesOf(camp), art = lfArtwork(camp), concepts = lfConceptList(camp);
  var paid = 0, bonus = 0;
  camp.panels.forEach(function (p) { Object.keys(p.weeks).forEach(function (w) { if (p.weeks[w] === 'b') bonus++; else paid++; }); });
  var sizes = {};
  camp.panels.forEach(function (p) { sizes[p.px] = (sizes[p.px] || 0) + 1; });
  var nSizes = Object.keys(sizes).length;
  var oneOff = Object.keys(sizes).filter(function (k) { return sizes[k] === 1; }).length;
  var defDue = camp.weeks.length ? lfAddDays(camp.weeks[0], -7) : '';

  function stat(label, value, sub) {
    return h('div', { style: { minWidth: 110 } }, h('div', { style: lab }, label), h('div', { style: { fontSize: 15, fontWeight: 800, color: '#111827', marginTop: 2 } }, value), sub ? h('div', { style: { fontSize: 11, color: '#6b7280' } }, sub) : null);
  }
  var mv = camp.move;
  var summary = h('div', { style: card },
    h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 } },
      h('input', { value: camp.name, onChange: function (e) { var v = e.target.value; update(camp.id, function (c) { c.name = v; return c; }); }, style: Object.assign({}, inp, { fontSize: 14, fontWeight: 800, minWidth: 320 }) }),
      h('span', { style: { fontSize: 12, color: '#6b7280' } }, 'QMS campaign #'),
      h('input', { value: camp.qmsId || '', placeholder: 'e.g. 38271', onChange: function (e) { var v = e.target.value.replace(/[^0-9]/g, ''); update(camp.id, function (c) { c.qmsId = v; return c; }); }, style: Object.assign({}, inp, { width: 90 }) }),
      h('select', { value: camp.status, onChange: function (e) { var v = e.target.value; update(camp.id, function (c) { c.status = v; return c; }); }, style: inp }, ['Proposed', 'Booked', 'Live', 'Complete'].map(function (s) { return h('option', { key: s, value: s }, s); })),
      h('span', { style: { marginLeft: 'auto', display: 'inline-flex', gap: 8 } },
        h('button', { onClick: function () { pick('update'); }, style: btn('#fff', '#374151'), title: 'Load a newer schedule or the production specs export onto this campaign' }, '↻ Re-import file'),
        h('button', { onClick: function () { lfExport(camp, getXLSX(), zap); }, style: btn('#1d6f42') }, '↓ Export QMS MI'),
        h('button', { onClick: function () { if (window.confirm('Delete ' + camp.name + ' from the planner?')) { setCamps(function (prev) { return prev.filter(function (c) { return c.id !== camp.id; }); }); setSel(null); } }, style: btn('#fff', '#9ca3af') }, 'Delete'))),
    h('div', { style: { display: 'flex', gap: 22, flexWrap: 'wrap', alignItems: 'flex-start' } },
      stat('Flight', camp.weeks.length ? lfFmt(camp.weeks[0], true) + ' – ' + lfFmt(lfAddDays(camp.weeks[camp.weeks.length - 1], 6), true) : '–', camp.weeks.length + ' weeks'),
      stat('Panel weeks', paid + bonus, paid + ' paid · ' + bonus + ' bonus'),
      stat('States', states.join(' · ')),
      stat('Artwork sizes', nSizes, oneOff + ' used on one panel only'),
      camp.value ? stat('Media value', lfMoney(camp.value.media), camp.value.bought ? 'bought ' + lfMoney(camp.value.bought) + (camp.value.bonus ? ' · bonus ' + lfMoney(camp.value.bonus) : '') : null) : null,
      mv && mv.reachPct != null ? stat('MOVE reach', Math.round(mv.reachPct * 1000) / 10 + '%', (mv.freq ? 'freq ' + mv.freq.toFixed(1) + ' · ' : '') + (mv.impressions ? (mv.impressions / 1e6).toFixed(1) + 'M impressions' : '') + (mv.demo ? ' · ' + mv.demo : '')) : null,
      h('div', null, h('div', { style: lab }, 'Artwork & MI due'),
        h('input', { type: 'date', value: camp.due || '', onChange: function (e) { var v = e.target.value; update(camp.id, function (c) { c.due = v; return c; }); }, style: Object.assign({}, inp, { marginTop: 3 }) }),
        !camp.due && defDue ? h('div', { style: { fontSize: 11, color: '#6b7280' } }, 'assumed Mon ' + lfFmt(defDue, true) + ', from QMS’s welcome email') : null)));

  // flags
  var flags = [];
  if (!camp.qmsId) flags.push('No QMS campaign number yet, so file names use CAMPAIGNNO. It’s in the welcome email subject (e.g. #38271), or re-import the production specs export.');
  if (art.unassigned.bookings) flags.push(art.unassigned.bookings + ' panel bookings have no creative (' + Object.keys(art.unassigned.weeks).sort().map(function (w) { return 'wc ' + lfFmt(w); }).join(', ') + ').');
  var restricted = camp.panels.filter(function (p) { return p.restrict; });
  if (restricted.length) flags.push('Content restrictions: ' + restricted.map(function (p) { return p.id + ' (' + p.restrict + ')'; }).join('; '));
  var oneAdv = camp.panels.filter(function (p) { return /one advertiser|only/i.test(p.illum || ''); });
  if (oneAdv.length) flags.push('Restricted times: ' + oneAdv.map(function (p) { return p.id + ' ' + p.suburb + ' (' + p.illum + ')'; }).join('; '));
  if (camp.status === 'Proposed') flags.push('This is a proposal schedule. QMS holds nothing until a contract is issued, and pricing has a two-week sunset.');
  if (camp.lastDiff && (camp.lastDiff.added.length || camp.lastDiff.removed.length || camp.lastDiff.moved)) {
    var d = camp.lastDiff;
    flags.push('Last re-import: ' + (d.added.length ? d.added.length + ' added (' + d.added.slice(0, 6).join(', ') + (d.added.length > 6 ? '…' : '') + ') ' : '') + (d.removed.length ? d.removed.length + ' removed (' + d.removed.slice(0, 6).join(', ') + (d.removed.length > 6 ? '…' : '') + ') ' : '') + (d.moved ? d.moved + ' panels changed weeks' : ''));
  }
  var flagBox = flags.length ? h('div', { style: Object.assign({}, card, { background: '#fffbeb', border: '1px solid #fde68a', boxShadow: 'none' }) },
    h('div', { style: Object.assign({}, lab, { color: '#92400e', marginBottom: 6 }) }, 'Check'),
    flags.map(function (f, i) { return h('div', { key: i, style: { fontSize: 12, color: '#78350f', marginBottom: 4, lineHeight: 1.45 } }, '• ' + f); })) : null;

  var tabs = h('div', { style: { display: 'flex', borderBottom: '2px solid #e5e7eb', marginBottom: 14 } }, [['plan', 'Creative plan & artwork'], ['schedule', 'Schedule']].map(function (t) {
    var on = view === t[0];
    return h('button', { key: t[0], onClick: function () { setView(t[0]); }, style: { padding: '7px 14px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: on ? 800 : 500, color: on ? '#EE1A42' : '#374151', borderBottom: on ? '2px solid #EE1A42' : '2px solid transparent', marginBottom: -2 } }, t[1]);
  }));

  // per week x state live counts
  function liveCount(wk, st) {
    var p = 0, b = 0;
    camp.panels.forEach(function (x) { if ((!st || x.state === st) && x.weeks[wk]) { if (x.weeks[wk] === 'b') b++; else p++; } });
    return { p: p, b: b };
  }
  function setPlan(wk, key, v) {
    update(camp.id, function (c) {
      var plan = Object.assign({}, c.plan || {}); var w = Object.assign({}, plan[wk] || {});
      if (v) w[key] = v; else delete w[key];
      plan[wk] = w; c.plan = plan; return c;
    });
  }
  function fillAll(v) {
    update(camp.id, function (c) {
      var plan = Object.assign({}, c.plan || {});
      c.weeks.forEach(function (wk) { var w = Object.assign({}, plan[wk] || {}); w.ALL = v; plan[wk] = w; });
      c.plan = plan; return c;
    });
  }
  var dl = h('datalist', { id: 'lf-concepts-' + camp.id }, concepts.map(function (c) { return h('option', { key: c, value: c }); }));
  var planTable = h('div', { style: card },
    h('div', { style: Object.assign({}, lab, { marginBottom: 4 }) }, 'Creative by week'),
    h('div', { style: { fontSize: 11, color: '#6b7280', marginBottom: 10 } }, 'Type the creative running each week. A state box overrides all states for that week. Paid + bonus panels live are shown under each state.'),
    dl,
    h('div', { style: { overflowX: 'auto' } }, h('table', { style: { borderCollapse: 'collapse', width: '100%' } },
      h('thead', null, h('tr', null, h('th', { style: th }, 'Week'), h('th', { style: th }, 'All states'), states.map(function (s) { return h('th', { key: s, style: th }, s); }))),
      h('tbody', null, camp.weeks.map(function (wk, wi) {
        var w = (camp.plan || {})[wk] || {}, tot = liveCount(wk);
        return h('tr', { key: wk },
          h('td', { style: Object.assign({}, td, { whiteSpace: 'nowrap' }) }, h('div', { style: { fontWeight: 800 } }, 'wc ' + lfFmt(wk, true)), h('div', { style: { fontSize: 10, color: '#6b7280' } }, (tot.p + tot.b) + ((tot.p + tot.b) === 1 ? ' panel' : ' panels'))),
          h('td', { style: td }, h('div', { style: { display: 'flex', gap: 4, alignItems: 'center' } },
            h('input', { list: 'lf-concepts-' + camp.id, value: w.ALL || '', placeholder: 'creative', onChange: function (e) { setPlan(wk, 'ALL', e.target.value); }, style: Object.assign({}, inp, { width: 170 }) }),
            wi === 0 && w.ALL ? h('button', { onClick: function () { fillAll(w.ALL); }, title: 'Use this creative for every week', style: { border: 'none', background: 'none', color: '#2563eb', fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap' } }, '↓ all weeks') : null)),
          states.map(function (s) {
            var n = liveCount(wk, s);
            return h('td', { key: s, style: td },
              n.p + n.b ? h('input', { list: 'lf-concepts-' + camp.id, value: w[s] || '', placeholder: w.ALL || '–', onChange: function (e) { setPlan(wk, s, e.target.value); }, style: Object.assign({}, inp, { width: 120, color: w[s] ? '#111827' : '#6b7280' }) }) : h('span', { style: { color: '#d1d5db' } }, '–'),
              n.p + n.b ? h('div', { style: { fontSize: 10, color: '#6b7280', marginTop: 2 } }, [n.p ? n.p + ' paid' : '', n.b ? n.b + ' bonus' : ''].filter(Boolean).join(' + ')) : null);
          }));
      })))));

  var artTable = h('div', { style: card },
    h('div', { style: { display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 } },
      h('span', { style: lab }, 'Artwork needed'),
      h('span', { style: { fontSize: 11, color: '#6b7280' } }, art.list.length + ' files' + (art.unassigned.bookings ? ' · ' + art.unassigned.bookings + ' bookings still need a creative' : '') + ' · named in QMS’s format (campaign_brand_creative_size)')),
    art.list.length ? h('div', { style: { overflowX: 'auto' } }, h('table', { style: { borderCollapse: 'collapse', width: '100%' } },
      h('thead', null, h('tr', null, ['Creative', 'Size (px)', 'Panels', 'States', 'First live', 'Due', 'File name'].map(function (t) { return h('th', { key: t, style: th }, t); }))),
      h('tbody', null, art.list.map(function (a, i) {
        var ix = concepts.indexOf(a.concept), t = LF_TINTS[(ix < 0 ? 7 : ix) % LF_TINTS.length];
        return h('tr', { key: a.file + i },
          h('td', { style: td }, h('span', { style: { background: t[0], color: t[1], fontWeight: 700, borderRadius: 6, padding: '2px 8px', fontSize: 11 } }, a.concept)),
          h('td', { style: Object.assign({}, td, { fontWeight: 700 }) }, a.px),
          h('td', { style: Object.assign({}, td, { textAlign: 'center' }) }, a.panels.length),
          h('td', { style: td }, a.states.join(', ')),
          h('td', { style: td }, 'wc ' + lfFmt(a.first)),
          h('td', { style: Object.assign({}, td, { color: a.due < new Date().toISOString().slice(0, 10) ? '#b91c1c' : '#111827', fontWeight: 700 }) }, lfFmt(a.due, true)),
          h('td', { style: Object.assign({}, td, { fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11 }) }, a.file));
      })))) : h('div', { style: { fontSize: 12, color: '#6b7280' } }, 'Add a creative to a week above and the files you need appear here, one per creative per pixel size.'));

  // schedule grid
  var stBlocks = states.map(function (st) {
    var ps = lfPanelsSorted(camp).filter(function (p) { return p.state === st; });
    return [h('tr', { key: st + '-h' },
      h('td', { colSpan: 5, style: Object.assign({}, td, { background: '#f9fafb', fontWeight: 800 }) }, st + ' · ' + ps.length + (ps.length === 1 ? ' panel' : ' panels')),
      camp.weeks.map(function (wk) { var n = liveCount(wk, st); return h('td', { key: wk, style: Object.assign({}, td, { background: '#f9fafb', textAlign: 'center', fontSize: 11, color: '#6b7280' }) }, n.p + n.b || ''); }))]
      .concat(ps.map(function (p) {
        return h('tr', { key: p.id },
          h('td', { style: Object.assign({}, td, { fontWeight: 700, whiteSpace: 'nowrap' }) }, p.link ? h('a', { href: p.link, target: '_blank', rel: 'noreferrer', style: { color: '#111827' } }, p.id) : p.id),
          h('td', { style: Object.assign({}, td, { maxWidth: 260 }) }, h('div', { style: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, [p.addr, p.suburb].filter(Boolean).join(', '))),
          h('td', { style: Object.assign({}, td, { whiteSpace: 'nowrap' }) }, p.px),
          h('td', { style: Object.assign({}, td, { textAlign: 'center' }) }, p.dur == null ? '' : p.dur + 's'),
          h('td', { style: Object.assign({}, td, { fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap' }) }, p.illum && !/^all day$/i.test(p.illum) ? p.illum.replace(/\s+One Advertiser Only\.?/i, ' (one advertiser)') : ''),
          camp.weeks.map(function (wk) {
            var m = p.weeks[wk];
            if (!m) return h('td', { key: wk, style: Object.assign({}, td, { textAlign: 'center', color: '#e5e7eb' }) }, p.na.indexOf(wk) >= 0 ? 'n/a' : '');
            var c = lfConcept(camp, wk, p.state), ix = concepts.indexOf(c), t = ix >= 0 ? LF_TINTS[ix % LF_TINTS.length] : ['#fff', '#b91c1c'];
            return h('td', { key: wk, title: (c || 'No creative yet') + (m === 'b' ? ' (bonus)' : ''), style: Object.assign({}, td, { textAlign: 'center', background: t[0], color: t[1], fontWeight: 800, fontSize: 11, border: ix < 0 ? '1px dashed #fca5a5' : undefined }) }, m === 'b' ? 'B' : 'P');
          }));
      }));
  });
  var legend = h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10, fontSize: 11, color: '#6b7280' } },
    'P = paid, B = bonus.',
    concepts.map(function (c, i) { var t = LF_TINTS[i % LF_TINTS.length]; return h('span', { key: c, style: { background: t[0], color: t[1], fontWeight: 700, borderRadius: 6, padding: '2px 8px' } }, c); }),
    h('span', { style: { border: '1px dashed #fca5a5', color: '#b91c1c', borderRadius: 6, padding: '1px 7px', fontWeight: 700 } }, 'no creative yet'));
  var grid = h('div', { style: card }, legend, h('div', { style: { overflowX: 'auto' } }, h('table', { style: { borderCollapse: 'collapse', width: '100%' } },
    h('thead', null, h('tr', null, ['Panel', 'Location', 'Size (px)', 'Slot', 'Hours'].map(function (t) { return h('th', { key: t, style: th }, t); }),
      camp.weeks.map(function (wk) { return h('th', { key: wk, style: Object.assign({}, th, { textAlign: 'center' }) }, 'wc ' + lfFmt(wk)); }))),
    h('tbody', null, stBlocks))));

  return h('div', null, header, pills, summary, flagBox, tabs, view === 'plan' ? h('div', null, planTable, artTable) : grid);
}

// ---- 7-Eleven (QMS The Convenience Network, programmatic) ----
// Always on, but only inside set time windows. Creative can change by day, window and market, so a week
// is planned as day -> window -> market -> rotation, with an all-markets rotation that a market can override.
// QMS weeks run Monday to Sunday; artwork and MI go to production@qmsmedia.com the Monday before.
var TCN_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
var TCN_SIZE = { w: 1080, h: 1920, px: '1080x1920' };
var TCN_DEFAULT = {
  qmsId: '',
  markets: ['NSW', 'VIC', 'QLD', 'SA', 'WA'],
  windows: [
    { id: 'am', days: [0, 1, 2, 3, 4], from: '04:00', to: '08:00' },
    { id: 'thfr', days: [3, 4], from: '19:00', to: '22:00' },
    { id: 'satam', days: [5], from: '06:00', to: '08:00' },
    { id: 'wkpm', days: [5, 6], from: '16:00', to: '24:00' }
  ],
  weeks: {}
};
function tcnTime(t) {
  if (t === '24:00' || t === '00:00') return t === '24:00' ? 'midnight' : '12am';
  var p = String(t || '').split(':'), h = parseInt(p[0], 10), m = p[1] || '00';
  if (isNaN(h)) return '';
  var ap = h >= 12 ? 'pm' : 'am', hh = h % 12 === 0 ? 12 : h % 12;
  return hh + (m !== '00' ? ':' + m : '') + ap;
}
function tcnWinLabel(w) { return tcnTime(w.from) + '–' + tcnTime(w.to); }
function tcnDaysLabel(days) {
  var d = days.slice().sort(function (a, b) { return a - b; }), out = [], i = 0;
  while (i < d.length) {
    var j = i;
    while (j + 1 < d.length && d[j + 1] === d[j] + 1) j++;
    out.push(j > i ? TCN_DAYS[d[i]] + '–' + TCN_DAYS[d[j]] : TCN_DAYS[d[i]]);
    i = j + 1;
  }
  return out.join(', ');
}
function tcnMonday(iso) {
  var d = new Date(iso + 'T00:00:00Z'); var wd = (d.getUTCDay() + 6) % 7; d.setUTCDate(d.getUTCDate() - wd); return d.toISOString().slice(0, 10);
}
function tcnAddDays(iso, n) { var d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
function tcnCell(tcn, wk, d, wid) { return (((tcn.weeks || {})[wk] || {})[d] || {})[wid] || {}; }
// Rotation running in one market: its own entries if it has an override, otherwise the all-markets ones.
function tcnRot(tcn, wk, d, wid, mkt) {
  var c = tcnCell(tcn, wk, d, wid);
  var e = (mkt && c[mkt]) ? c[mkt] : (c.ALL || []);
  return e.filter(function (x) { return String(x.c || '').trim() && (parseFloat(x.s) || 0) > 0; });
}
function tcnSig(entries) {
  return entries.map(function (x) { return String(x.c).trim() + ':' + (parseFloat(x.s) || 0); }).sort().join('|');
}
function tcnWindowsSorted(tcn) {
  return (tcn.windows || []).slice().sort(function (a, b) {
    var da = Math.min.apply(null, a.days.length ? a.days : [9]), db = Math.min.apply(null, b.days.length ? b.days : [9]);
    return (da - db) || (a.from < b.from ? -1 : a.from > b.from ? 1 : 0);
  });
}
// Columns for the grid and MI: per window, back-to-back days with identical rotations in every market
// share a column; markets only split out where their rotation differs.
function tcnColumns(tcn, wk) {
  var cols = [], gaps = [];
  tcnWindowsSorted(tcn).forEach(function (w) {
    var days = w.days.slice().sort(function (a, b) { return a - b; });
    var runs = [];
    days.forEach(function (d) {
      var map = {};
      tcn.markets.forEach(function (m) { map[m] = tcnSig(tcnRot(tcn, wk, d, w.id, m)); });
      var key = JSON.stringify(map), last = runs[runs.length - 1];
      if (last && last.key === key && last.days[last.days.length - 1] === d - 1) last.days.push(d);
      else runs.push({ key: key, map: map, days: [d] });
    });
    runs.forEach(function (r) {
      var groups = [];
      tcn.markets.forEach(function (m) {
        var g = groups.find(function (x) { return x.sig === r.map[m]; });
        if (g) g.markets.push(m); else groups.push({ sig: r.map[m], markets: [m] });
      });
      groups.forEach(function (g) {
        if (!g.sig) { gaps.push(tcnDaysLabel(r.days) + ' ' + tcnWinLabel(w) + ' ' + g.markets.join('/')); return; }
        var rot = {};
        tcnRot(tcn, wk, r.days[0], w.id, g.markets[0]).forEach(function (x) { rot[String(x.c).trim()] = (rot[String(x.c).trim()] || 0) + (parseFloat(x.s) || 0); });
        cols.push({
          win: w, days: r.days, markets: g.markets, all: g.markets.length === tcn.markets.length,
          time: tcnWinLabel(w), dayLabel: tcnDaysLabel(r.days),
          marketLabel: g.markets.length === tcn.markets.length ? 'All markets' : g.markets.join(' + '),
          rot: rot
        });
      });
    });
  });
  return { cols: cols, gaps: gaps };
}
function tcnFile(tcn, creative) {
  var id = String(tcn.qmsId || '').replace(/^0+/, '') || 'CAMPAIGNNO';
  var c = String(creative || '').trim().replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return [id, 'PointsBet', c || 'TBC', TCN_SIZE.px].join('_');
}
function tcnRound(rot) { return typeof usRound5 === 'function' ? usRound5(rot, function (k) { return k; }) : rot; }
// QMS MI rows: one per column per creative, with dates, times and market.
function tcnMIRows(tcn, wk) {
  var out = [];
  tcnColumns(tcn, wk).cols.forEach(function (col) {
    var r = tcnRound(col.rot);
    Object.keys(r).sort(function (a, b) { return (parseFloat(r[b]) - parseFloat(r[a])) || (a < b ? -1 : 1); }).forEach(function (c) {
      out.push({
        state: col.all ? 'All markets' : col.markets.join(', '), start: tcnAddDays(wk, col.days[0]), end: tcnAddDays(wk, col.days[col.days.length - 1]),
        from: col.win.from, to: col.win.to === '24:00' ? '23:59' : col.win.to, days: col.dayLabel,
        share: parseFloat(r[c]) / 100, creative: c, file: tcnFile(tcn, c)
      });
    });
  });
  return out;
}
function tcnCreatives(tcn, wk) {
  var seen = {}, out = [];
  tcnColumns(tcn, wk).cols.forEach(function (col) {
    Object.keys(col.rot).forEach(function (c) {
      if (!seen[c]) { seen[c] = { creative: c, file: tcnFile(tcn, c), slots: [], where: [] }; out.push(seen[c]); }
      var k = col.dayLabel + ' ' + col.time, slot = seen[c].slots.find(function (x) { return x.k === k; });
      if (!slot) { slot = { k: k, markets: [] }; seen[c].slots.push(slot); }
      col.markets.forEach(function (m) { if (slot.markets.indexOf(m) < 0) slot.markets.push(m); });
    });
  });
  out.forEach(function (o) {
    o.where = o.slots.map(function (sl) {
      var all = sl.markets.length === tcn.markets.length;
      return sl.k + (all ? '' : ' (' + tcn.markets.filter(function (m) { return sl.markets.indexOf(m) >= 0; }).join(', ') + ')');
    });
  });
  return out;
}
// Opening a week with nothing planned copies the most recent earlier week.
function tcnCarry(tcn, wk) {
  if ((tcn.weeks || {})[wk]) return null;
  var prev = Object.keys(tcn.weeks || {}).filter(function (k) { return k < wk; }).sort();
  if (!prev.length) return null;
  return JSON.parse(JSON.stringify(tcn.weeks[prev[prev.length - 1]]));
}

function tcnFmt(iso, yr) { if (!iso) return ''; var p = iso.split('-'); return p[2] + '/' + p[1] + (yr ? '/' + p[0] : ''); }
function tcnAllCreatives(tcn) {
  var seen = {}, out = [];
  Object.keys(tcn.weeks || {}).sort().reverse().forEach(function (wk) {
    var w = tcn.weeks[wk] || {};
    Object.keys(w).forEach(function (d) { Object.keys(w[d] || {}).forEach(function (wid) { Object.keys(w[d][wid] || {}).forEach(function (m) {
      (w[d][wid][m] || []).forEach(function (x) { var c = String(x.c || '').trim(); if (c && !seen[c]) { seen[c] = 1; out.push(c); } });
    }); }); });
  });
  return out;
}

// Workbook for QMS: the one-page grid, their MI template with dates, times and markets, and the artwork list.
function tcnExport(tcn, wk, XLSX, zap) {
  try {
    var hasStyles = XLSX !== XLSX_NPM;
    var INK = '1F2937', MID = '4B5563', PAPER = 'F3F4F6', LINE = 'D1D5DB';
    var thin = { style: 'thin', color: { rgb: LINE } }, box = { top: thin, bottom: thin, left: thin, right: thin };
    var serial = function (iso) { var p = iso.split('-'); return (Date.UTC(+p[0], +p[1] - 1, +p[2]) - Date.UTC(1899, 11, 30)) / 86400000; };
    function sheet(rows, widths, merges, heights) {
      var ws = XLSX.utils.aoa_to_sheet(rows.map(function (r) { return r.map(function (c) { return c && typeof c === 'object' ? (c.v == null ? '' : c.v) : (c == null ? '' : c); }); }));
      rows.forEach(function (r, ri) {
        r.forEach(function (c, ci) {
          var a = XLSX.utils.encode_cell({ r: ri, c: ci });
          if (!ws[a]) ws[a] = { t: 's', v: '' };
          var o = c && typeof c === 'object' ? c : {};
          if (o.date) ws[a] = { t: 'n', v: serial(o.date), z: 'dd/mm/yyyy' };
          if (o.z) ws[a].z = o.z;
          if (hasStyles) ws[a].s = { font: { name: 'Calibri', sz: 11, bold: !!o.b, color: { rgb: o.color || INK } }, fill: o.fill ? { patternType: 'solid', fgColor: { rgb: o.fill } } : undefined, border: o.box ? box : undefined, alignment: { vertical: 'center', horizontal: o.align, wrapText: !!o.wrap } };
        });
      });
      ws['!cols'] = widths.map(function (w) { return { wch: w }; });
      if (merges) ws['!merges'] = merges;
      if (heights) ws['!rows'] = heights;
      return ws;
    }
    var res = tcnColumns(tcn, wk), cols = res.cols;
    if (!cols.length) { zap('⚠ Nothing planned for wc ' + tcnFmt(wk) + ' yet'); return; }
    var due = tcnAddDays(wk, -7), wb = XLSX.utils.book_new();

    // Instructions: windows across, creatives down, each column adds to 100%
    var rounded = cols.map(function (c) { return tcnRound(c.rot); });
    var creatives = [];
    cols.forEach(function (c) { Object.keys(c.rot).forEach(function (k) { if (creatives.indexOf(k) < 0) creatives.push(k); }); });
    var n = cols.length, rows = [], merges = [];
    rows.push([{ v: '7-Eleven Material Instructions ' + String.fromCharCode(8212) + ' WC ' + tcnFmt(wk, true) + ' (Mon' + String.fromCharCode(8211) + 'Sun)', b: true }]);
    rows.push([{ v: 'QMS The Convenience Network · ' + TCN_SIZE.px + ' portrait · JPEG or MP4 up to 10s · artwork and MI to production@qmsmedia.com by Mon ' + tcnFmt(due, true) }]);
    rows.push([]);
    var h1 = [{ v: 'KEY / FILE NAME', b: true, fill: PAPER, box: true }, { v: 'CREATIVE', b: true, fill: PAPER, box: true }];
    var h2 = [{ v: '', fill: PAPER, box: true }, { v: '', fill: PAPER, box: true }];
    merges.push({ s: { r: 3, c: 0 }, e: { r: 4, c: 0 } }, { s: { r: 3, c: 1 }, e: { r: 4, c: 1 } });
    var start = 2;
    cols.forEach(function (c, i) {
      var sameAsPrev = i > 0 && cols[i - 1].win.id === c.win.id;
      h1.push({ v: sameAsPrev ? '' : c.time, b: true, color: 'FFFFFF', fill: MID, box: true, align: 'center' });
      h2.push({ v: c.dayLabel + (c.all ? '' : '\n' + c.marketLabel), b: true, fill: PAPER, box: true, align: 'center', wrap: true });
      var last = i === n - 1 || cols[i + 1].win.id !== c.win.id;
      if (last) { if (2 + i > start) merges.push({ s: { r: 3, c: start }, e: { r: 3, c: 2 + i } }); start = 3 + i; }
    });
    rows.push(h1, h2);
    creatives.forEach(function (k) {
      rows.push([{ v: tcnFile(tcn, k), b: true, box: true }, { v: k, box: true }].concat(rounded.map(function (r) {
        return r[k] != null ? { v: r[k] + '%', b: true, box: true, align: 'center' } : { v: String.fromCharCode(8211), color: '9CA3AF', box: true, align: 'center' };
      })));
    });
    rows.push([{ v: '' }, { v: 'Total', b: true, color: MID, align: 'right' }].concat(rounded.map(function (r) {
      var t = Object.keys(r).reduce(function (s, k) { return s + parseFloat(r[k]); }, 0);
      return { v: t + '%', b: true, color: t === 100 ? MID : 'C00000', align: 'center' };
    })));
    var heights = []; heights[4] = { hpt: 32 };
    XLSX.utils.book_append_sheet(wb, sheet(rows, [42, 26].concat(cols.map(function () { return 15; })), merges, heights), 'Instructions');

    // QMS Material Instructions template
    var H = function (t) { return { v: t, b: true, fill: PAPER, box: true }; };
    var mr = [[{ v: 'QMS MEDIA - DIGITAL MATERIAL INSTRUCTIONS', b: true }], ['Campaign ID', tcn.qmsId || ''], ['Campaign Name', 'PointsBet - The Convenience Network (7-Eleven)'],
      ['Client', 'PointsBet'], ['Brand', 'PointsBet'], ['Start Date', { date: wk }], ['End Date', { date: tcnAddDays(wk, 6) }],
      ['Panel Type', 'Panel ID', 'Address', 'Suburb', 'State', 'Postcode', 'Start Date', 'End Date', 'SoT %', 'Pixel Width', 'Pixel Height', 'Booking Type', 'Consecutive Location', 'Code', 'Start Time', 'End Time', 'Share %', 'Key Number/File Name'].map(H)];
    tcnMIRows(tcn, wk).forEach(function (r) {
      var B = function (v, o) { return Object.assign({ v: v, box: true }, o || {}); };
      mr.push([B('The Convenience Network'), B(''), B(''), B(''), B(r.state, { b: true }), B(''), B('', { date: r.start }), B('', { date: r.end }), B(''), B(TCN_SIZE.w), B(TCN_SIZE.h),
        B('Programmatic'), B(''), B(''), B(r.from), B(r.to), B(r.share, { z: '0%' }), B(r.file)]);
    });
    XLSX.utils.book_append_sheet(wb, sheet(mr, [24, 9, 9, 9, 22, 9, 12, 12, 7, 11, 11, 13, 10, 7, 10, 9, 8, 46]), 'Material Instructions');

    // Artwork
    var ar = [[{ v: '7-Eleven artwork ' + String.fromCharCode(8212) + ' WC ' + tcnFmt(wk, true), b: true }], [],
      [H('Creative'), H('File name'), H('Size'), H('Format'), H('Runs'), H('Due')]];
    tcnCreatives(tcn, wk).forEach(function (c) {
      ar.push([{ v: c.creative, b: true, box: true }, { v: c.file, box: true }, { v: TCN_SIZE.px + ' portrait', box: true }, { v: 'JPEG, or MP4 up to 10s', box: true },
        { v: c.where.join('; '), box: true, wrap: true }, { v: '', date: due, box: true }]);
    });
    XLSX.utils.book_append_sheet(wb, sheet(ar, [26, 46, 18, 22, 60, 12]), 'Artwork');

    var name = '7-Eleven MI WC' + wk + '.xlsx';
    var out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    var url = URL.createObjectURL(new Blob([out], { type: 'application/octet-stream' }));
    var a = document.createElement('a'); a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 150);
    var warn = [];
    if (!tcn.qmsId) warn.push('no QMS campaign number, file names use CAMPAIGNNO');
    if (res.gaps.length) warn.push('no creative for ' + res.gaps.join('; '));
    zap(warn.length ? '✓ 7-Eleven MI exported · ⚠ ' + warn.join(' · ') : '✓ 7-Eleven MI exported (' + cols.length + ' columns)');
  } catch (e) { zap('⚠ Export failed: ' + (e && e.message ? e.message : e)); }
}

function SevenEleven(props) {
  var h = React.createElement;
  var tcn = props.tcn || TCN_DEFAULT, setTcn = props.setTcn, zap = props.zap, getXLSX = props.getXLSX;
  var today = new Date(), todayISO = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
  var stWk = React.useState(tcnAddDays(tcnMonday(todayISO), 7)), wk = stWk[0], setWk = stWk[1];
  var stDay = React.useState(0), day = stDay[0], setDay = stDay[1];
  var stSet = React.useState(false), showSet = stSet[0], setShowSet = stSet[1];
  var nWeeks = Object.keys(tcn.weeks || {}).length;
  React.useEffect(function () {
    var c = tcnCarry(tcn, wk);
    if (c) setTcn(function (p) { var w = Object.assign({}, p.weeks || {}); if (w[wk]) return p; w[wk] = c; return Object.assign({}, p, { weeks: w }); });
  }, [wk, nWeeks]);

  var card = { background: '#fff', borderRadius: 12, padding: '14px 16px', marginBottom: 14, boxShadow: '0 1px 4px rgba(17,24,39,.07)' };
  var lab = { fontSize: 11, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em' };
  var inp = { border: '1px solid #d1d5db', borderRadius: 6, padding: '3px 6px', fontSize: 12 };
  var th = { padding: '6px 8px', fontSize: 11, fontWeight: 800, color: '#374151', background: '#f3f4f6', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' };
  var td = { padding: '6px 8px', fontSize: 12, borderBottom: '1px solid #f1f5f9', verticalAlign: 'top' };
  var link = { border: 'none', background: 'none', color: '#2563eb', fontSize: 11, cursor: 'pointer', padding: '2px 0' };
  var listId = 'tcn-creatives';

  function upd(fn) { setTcn(function (p) { var n = JSON.parse(JSON.stringify(p || TCN_DEFAULT)); fn(n); return n; }); }
  function setCell(d, wid, mkt, entries) {
    upd(function (n) {
      n.weeks = n.weeks || {}; var w = n.weeks[wk] = n.weeks[wk] || {}; var dd = w[d] = w[d] || {}; var c = dd[wid] = dd[wid] || {};
      if (entries == null) delete c[mkt]; else c[mkt] = entries;
    });
  }
  function copyDay(from, targets) {
    upd(function (n) {
      var w = n.weeks[wk] = n.weeks[wk] || {};
      targets.forEach(function (t) { if (t !== from) w[t] = JSON.parse(JSON.stringify(w[from] || {})); });
    });
    zap('✓ ' + TCN_DAYS[from] + ' copied to ' + targets.filter(function (t) { return t !== from; }).map(function (t) { return TCN_DAYS[t]; }).join(', '));
  }
  function evenSplit(n) { var out = [], base = Math.floor(100 / n / 5) * 5; for (var i = 0; i < n; i++) out.push(base); out[0] += 100 - base * n; return out; }

  function RotCell(o) {
    var entries = o.entries, inherited = o.inherited;
    if (entries == null && inherited) {
      var names = inherited.filter(function (x) { return String(x.c || '').trim(); });
      return h('div', null,
        h('div', { style: { fontSize: 11, color: '#9ca3af' } }, names.length ? names.map(function (x) { return x.c + (inherited.length > 1 ? ' ' + x.s + '%' : ''); }).join(', ') : '–'),
        h('button', { style: link, onClick: function () { o.onChange(names.length ? JSON.parse(JSON.stringify(names)) : [{ c: '', s: 100 }]); } }, 'change for ' + o.mkt));
    }
    var list = entries && entries.length ? entries : [{ c: '', s: 100 }];
    var total = list.reduce(function (t, x) { return t + (parseFloat(x.s) || 0); }, 0);
    return h('div', null,
      list.map(function (x, i) {
        return h('div', { key: i, style: { display: 'flex', gap: 4, alignItems: 'center', marginBottom: 3 } },
          h('input', { list: listId, value: x.c, placeholder: 'creative', onChange: function (e) { var l = JSON.parse(JSON.stringify(list)); l[i].c = e.target.value; o.onChange(l); }, style: Object.assign({}, inp, { width: 132 }) }),
          list.length > 1 ? h('input', { type: 'number', min: 0, max: 100, step: 5, value: x.s, onChange: function (e) { var l = JSON.parse(JSON.stringify(list)); l[i].s = e.target.value === '' ? '' : Number(e.target.value); o.onChange(l); }, style: Object.assign({}, inp, { width: 46 }) }) : null,
          list.length > 1 ? h('span', { style: { fontSize: 11, color: '#6b7280' } }, '%') : null,
          list.length > 1 ? h('button', { style: Object.assign({}, link, { color: '#9ca3af' }), title: 'Remove', onClick: function () { var l = list.filter(function (_, j) { return j !== i; }); if (l.length === 1) l[0].s = 100; o.onChange(l); } }, '×') : null);
      }),
      h('div', { style: { display: 'flex', gap: 10, alignItems: 'center' } },
        h('button', { style: link, onClick: function () { var l = JSON.parse(JSON.stringify(list)).concat([{ c: '', s: 0 }]); var sp = evenSplit(l.length); l.forEach(function (y, j) { y.s = sp[j]; }); o.onChange(l); } }, '+ split'),
        o.mkt !== 'ALL' ? h('button', { style: Object.assign({}, link, { color: '#6b7280' }), onClick: function () { o.onChange(null); } }, '↺ same as all') : null,
        list.length > 1 && total !== 100 ? h('span', { style: { fontSize: 11, color: '#b91c1c', fontWeight: 700 } }, total + '%') : null));
  }

  // header
  var header = h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' } },
    h('span', { style: { fontSize: 15, fontWeight: 800, color: '#111827' } }, '7-Eleven'),
    h('span', { style: { fontSize: 11, color: '#9ca3af' } }, 'QMS The Convenience Network · programmatic · ' + TCN_SIZE.px + ' portrait'),
    h('span', { style: { marginLeft: 16, fontSize: 13, fontWeight: 600 } }, 'Week commencing'),
    h('button', { onClick: function () { setWk(tcnAddDays(wk, -7)); }, style: Object.assign({}, inp, { cursor: 'pointer' }) }, '‹'),
    h('input', { type: 'date', value: wk, onChange: function (e) { if (e.target.value) setWk(tcnMonday(e.target.value)); }, style: Object.assign({}, inp, { padding: '5px 8px', fontSize: 13 }) }),
    h('button', { onClick: function () { setWk(tcnAddDays(wk, 7)); }, style: Object.assign({}, inp, { cursor: 'pointer' }) }, '›'),
    h('span', { style: { fontSize: 11, color: '#6b7280' } }, 'Mon ' + tcnFmt(wk) + ' – Sun ' + tcnFmt(tcnAddDays(wk, 6)) + ' · artwork & MI due Mon ' + tcnFmt(tcnAddDays(wk, -7), true)),
    h('button', { onClick: function () { tcnExport(tcn, wk, getXLSX(), zap); }, style: { marginLeft: 'auto', background: '#1d6f42', color: '#fff', border: 'none', borderRadius: 9, padding: '8px 16px', fontSize: 13, fontWeight: 800, cursor: 'pointer' } }, '↓ Export 7-Eleven MI'));

  // settings: windows + markets + campaign number
  var times = []; for (var hh = 0; hh <= 24; hh++) { ['00', '30'].forEach(function (mm) { if (hh === 24 && mm === '30') return; times.push(('0' + hh).slice(-2) + ':' + mm); }); }
  var settings = h('div', { style: card },
    h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' } },
      h('span', { style: lab }, 'Time windows'),
      h('span', { style: { fontSize: 12, color: '#374151' } }, tcnWindowsSorted(tcn).map(function (w) { return tcnDaysLabel(w.days) + ' ' + tcnWinLabel(w); }).join(' · ')),
      h('span', { style: Object.assign({}, lab, { marginLeft: 12 }) }, 'Markets'),
      h('span', { style: { fontSize: 12, color: '#374151' } }, tcn.markets.join(' · ')),
      h('button', { onClick: function () { setShowSet(!showSet); }, style: Object.assign({}, link, { marginLeft: 'auto', fontSize: 12 }) }, showSet ? 'Done' : 'Edit windows & markets')),
    showSet ? h('div', { style: { marginTop: 12, borderTop: '1px solid #f1f5f9', paddingTop: 12 } },
      tcn.windows.map(function (w, wi) {
        return h('div', { key: w.id, style: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' } },
          TCN_DAYS.map(function (dl, di) {
            var on = w.days.indexOf(di) >= 0;
            return h('button', { key: dl, onClick: function () { upd(function (n) { var ww = n.windows[wi]; ww.days = on ? ww.days.filter(function (x) { return x !== di; }) : ww.days.concat([di]).sort(); }); },
              style: { border: '1px solid ' + (on ? '#EE1A42' : '#d1d5db'), background: on ? '#EE1A42' : '#fff', color: on ? '#fff' : '#374151', borderRadius: 14, padding: '3px 9px', fontSize: 11, fontWeight: 700, cursor: 'pointer' } }, dl);
          }),
          h('select', { value: w.from, onChange: function (e) { var v = e.target.value; upd(function (n) { n.windows[wi].from = v; }); }, style: inp }, times.filter(function (t) { return t !== '24:00'; }).map(function (t) { return h('option', { key: t, value: t }, tcnTime(t)); })),
          h('span', { style: { fontSize: 12 } }, 'to'),
          h('select', { value: w.to, onChange: function (e) { var v = e.target.value; upd(function (n) { n.windows[wi].to = v; }); }, style: inp }, times.filter(function (t) { return t !== '00:00'; }).map(function (t) { return h('option', { key: t, value: t }, tcnTime(t)); })),
          h('button', { onClick: function () { upd(function (n) { n.windows.splice(wi, 1); }); }, style: Object.assign({}, link, { color: '#9ca3af' }) }, 'remove'));
      }),
      h('button', { onClick: function () { upd(function (n) { n.windows.push({ id: 'w' + Date.now().toString(36), days: [], from: '18:00', to: '22:00' }); }); }, style: link }, '+ Add window'),
      h('div', { style: { display: 'flex', gap: 6, alignItems: 'center', marginTop: 10, flexWrap: 'wrap' } },
        h('span', { style: { fontSize: 12, color: '#374151', marginRight: 4 } }, 'Markets in the buy:'),
        LF_STATES.map(function (m) {
          var on = tcn.markets.indexOf(m) >= 0;
          return h('button', { key: m, onClick: function () { upd(function (n) { n.markets = on ? n.markets.filter(function (x) { return x !== m; }) : LF_STATES.filter(function (x) { return x === m || n.markets.indexOf(x) >= 0; }); }); },
            style: { border: '1px solid ' + (on ? '#111827' : '#d1d5db'), background: on ? '#111827' : '#fff', color: on ? '#fff' : '#374151', borderRadius: 14, padding: '3px 9px', fontSize: 11, fontWeight: 700, cursor: 'pointer' } }, m);
        }),
        h('span', { style: { fontSize: 12, color: '#374151', marginLeft: 16 } }, 'QMS campaign #'),
        h('input', { value: tcn.qmsId || '', placeholder: 'for file names', onChange: function (e) { var v = e.target.value.replace(/[^0-9]/g, ''); upd(function (n) { n.qmsId = v; }); }, style: Object.assign({}, inp, { width: 110 }) })),
      h('div', { style: { fontSize: 11, color: '#9ca3af', marginTop: 8 } }, 'Window changes apply to every week. Untick a day to take a window off it.')) : null);

  // day tabs
  var dayTabs = h('div', { style: { display: 'flex', borderBottom: '2px solid #e5e7eb', marginBottom: 12, flexWrap: 'wrap', alignItems: 'flex-end' } },
    TCN_DAYS.map(function (dl, di) {
      var sel = day === di, has = tcn.windows.some(function (w) { return w.days.indexOf(di) >= 0; });
      return h('button', { key: dl, onClick: function () { setDay(di); }, style: { padding: '6px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: sel ? 700 : 400, color: sel ? '#EE1A42' : has ? '#374151' : '#cbd5e1', borderBottom: sel ? '2px solid #EE1A42' : '2px solid transparent', marginBottom: -2, lineHeight: 1.3 } },
        dl, h('br'), h('span', { style: { fontSize: 10, color: '#6b7280' } }, tcnFmt(tcnAddDays(wk, di))));
    }),
    h('span', { style: { marginLeft: 'auto', display: 'inline-flex', gap: 6, alignItems: 'center', paddingBottom: 6 } },
      h('span', { style: { fontSize: 11, color: '#9ca3af' } }, 'Copy ' + TCN_DAYS[day] + ' to:'),
      h('select', { value: '', onChange: function (e) {
          var v = e.target.value; if (!v) return;
          copyDay(day, v === 'wkdays' ? [0, 1, 2, 3, 4] : v === 'all' ? [0, 1, 2, 3, 4, 5, 6] : v === 'wkend' ? [5, 6] : [parseInt(v, 10)]);
          e.target.value = '';
        }, style: inp },
        [h('option', { key: '', value: '' }, '— choose —'), h('option', { key: 'wkdays', value: 'wkdays' }, 'Mon–Fri'), h('option', { key: 'wkend', value: 'wkend' }, 'Sat–Sun'), h('option', { key: 'all', value: 'all' }, 'every day')]
          .concat(TCN_DAYS.map(function (dl, di) { return di === day ? null : h('option', { key: dl, value: String(di) }, dl); })))));

  var dayWins = tcnWindowsSorted(tcn).filter(function (w) { return w.days.indexOf(day) >= 0; });
  var dl = h('datalist', { id: listId }, tcnAllCreatives(tcn).map(function (c) { return h('option', { key: c, value: c }); }));
  var editor = h('div', { style: card }, dl,
    h('div', { style: Object.assign({}, lab, { marginBottom: 4 }) }, TCN_DAYS[day] + ' ' + tcnFmt(tcnAddDays(wk, day), true)),
    h('div', { style: { fontSize: 11, color: '#6b7280', marginBottom: 10 } }, 'Set the creative for all markets, then change any state that runs something different. Use + split to run two creatives in one window.'),
    dayWins.length ? h('div', { style: { overflowX: 'auto' } }, h('table', { style: { borderCollapse: 'collapse', width: '100%' } },
      h('thead', null, h('tr', null, h('th', { style: th }, 'Window'), h('th', { style: th }, 'All markets'), tcn.markets.map(function (m) { return h('th', { key: m, style: th }, m); }))),
      h('tbody', null, dayWins.map(function (w) {
        var cell = tcnCell(tcn, wk, day, w.id);
        return h('tr', { key: w.id },
          h('td', { style: Object.assign({}, td, { fontWeight: 800, whiteSpace: 'nowrap' }) }, tcnWinLabel(w)),
          h('td', { style: Object.assign({}, td, { background: '#fafafa' }) }, RotCell({ mkt: 'ALL', entries: cell.ALL || [], onChange: function (l) { setCell(day, w.id, 'ALL', l); } })),
          tcn.markets.map(function (m) {
            return h('td', { key: m, style: td }, RotCell({ mkt: m, entries: cell[m] || null, inherited: cell.ALL || [], onChange: function (l) { setCell(day, w.id, m, l); } }));
          }));
      })))) : h('div', { style: { fontSize: 12, color: '#6b7280' } }, '7-Eleven doesn’t run on ' + TCN_DAYS[day] + '. Add a window under Edit windows & markets.'));

  // preview of what QMS receives
  var res = tcnColumns(tcn, wk);
  var rounded = res.cols.map(function (c) { return tcnRound(c.rot); });
  var crs = [];
  res.cols.forEach(function (c) { Object.keys(c.rot).forEach(function (k) { if (crs.indexOf(k) < 0) crs.push(k); }); });
  var preview = h('div', { style: card },
    h('div', { style: { display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8, flexWrap: 'wrap' } },
      h('span', { style: lab }, 'What QMS gets for the week'),
      h('span', { style: { fontSize: 11, color: '#6b7280' } }, res.cols.length + ' columns. Days and markets with the same creative share a column, and every % is rounded to 5.')),
    res.gaps.length ? h('div', { style: { fontSize: 12, color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '6px 10px', marginBottom: 8 } }, 'No creative yet: ' + res.gaps.join(' · ')) : null,
    res.cols.length ? h('div', { style: { overflowX: 'auto' } }, h('table', { style: { borderCollapse: 'collapse' } },
      h('thead', null,
        h('tr', null, h('th', { style: th }, 'Creative'), res.cols.map(function (c, i) {
          var same = i > 0 && res.cols[i - 1].win.id === c.win.id;
          return h('th', { key: i, style: Object.assign({}, th, { background: '#4b5563', color: '#fff', textAlign: 'center', borderLeft: same ? 'none' : '2px solid #fff' }) }, same ? '' : c.time);
        })),
        h('tr', null, h('th', { style: th }, ''), res.cols.map(function (c, i) {
          return h('th', { key: i, style: Object.assign({}, th, { textAlign: 'center', whiteSpace: 'normal', minWidth: 90 }) }, c.dayLabel, c.all ? null : h('div', { style: { fontWeight: 600, color: '#6b7280' } }, c.marketLabel));
        }))),
      h('tbody', null, crs.map(function (k) {
        return h('tr', { key: k }, h('td', { style: Object.assign({}, td, { fontWeight: 700, whiteSpace: 'nowrap' }) }, k, h('div', { style: { fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, color: '#6b7280', fontWeight: 400 } }, tcnFile(tcn, k))),
          rounded.map(function (r, i) { return h('td', { key: i, style: Object.assign({}, td, { textAlign: 'center', fontWeight: r[k] != null ? 800 : 400, color: r[k] != null ? '#111827' : '#d1d5db' }) }, r[k] != null ? r[k] + '%' : '–'); }));
      })))) : h('div', { style: { fontSize: 12, color: '#6b7280' } }, 'Nothing planned for this week yet.'));

  return h('div', null, header, settings, dayTabs, editor, preview);
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
  useEffect(function () {
    if (tab === 'foxfooty') { if (platform !== 'tv') setPlatform('tv'); if (planNet !== 'fox') setPlanNet('fox'); }
    else if (tab === 'radio') { if (platform !== 'radio') setPlatform('radio'); if (['nine', 'sen', 'triplem'].indexOf(planNet) < 0) setPlanNet('nine'); }
  }, [tab]);
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
  var stUsMI = useState({}),
    usMI = stUsMI[0],
    setUsMI = stUsMI[1];
  var stUsOn = useState({}),
    usOn = stUsOn[0],
    setUsOn = stUsOn[1];
  var stUsSplit = useState({}),
    usSplit = stUsSplit[0],
    setUsSplit = stUsSplit[1];
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
  var stLF = useState([]),
    lfCamps = stLF[0],
    setLfCamps = stLF[1];
  var stTcn = useState(JSON.parse(JSON.stringify(TCN_DEFAULT))),
    tcn = stTcn[0],
    setTcn = stTcn[1];
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
          if (r3 && r3.value) setWC(snapToSunday(r3.value));
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
          var rUS1 = await window.storage.get('mi2_usmi').catch(function(){return null;}); if(rUS1&&rUS1.value){try{setUsMI(JSON.parse(rUS1.value));}catch(e){}}
          var rUS2 = await window.storage.get('mi2_uson').catch(function(){return null;}); if(rUS2&&rUS2.value){try{setUsOn(JSON.parse(rUS2.value));}catch(e){}}
          var rUS3 = await window.storage.get('mi2_ussplit').catch(function(){return null;}); if(rUS3&&rUS3.value){try{setUsSplit(JSON.parse(rUS3.value));}catch(e){}}
          var rLF = await window.storage.get('mi2_lf').catch(function(){return null;}); if(rLF&&rLF.value){try{setLfCamps(JSON.parse(rLF.value));}catch(e){}}
          var rTC = await window.storage.get('mi2_tcn').catch(function(){return null;}); if(rTC&&rTC.value){try{setTcn(JSON.parse(rTC.value));}catch(e){}}
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
    if (loaded) window.storage.set('mi2_usmi', JSON.stringify(usMI)).catch(function () {});
  }, [usMI, loaded]);
  useEffect(function () {
    if (loaded) window.storage.set('mi2_uson', JSON.stringify(usOn)).catch(function () {});
  }, [usOn, loaded]);
  useEffect(function () {
    if (loaded) window.storage.set('mi2_ussplit', JSON.stringify(usSplit)).catch(function () {});
  }, [usSplit, loaded]);
  useEffect(function () {
    if (loaded) window.storage.set('mi2_lf', JSON.stringify(lfCamps)).catch(function () {});
  }, [lfCamps, loaded]);
  useEffect(function () {
    if (loaded) window.storage.set('mi2_tcn', JSON.stringify(tcn)).catch(function () {});
  }, [tcn, loaded]);
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
        nw[day][dp.k] = filtered;
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
    // Belt-and-braces: dates must be anchored to the week's Sunday so day buckets
    // (sun/mon/tue...) line up with their real dates in the exported file.
    var wcSun = snapToSunday(wc);
    var weekDatesExp = getWeekDates(wcSun);
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
      var dd = weekDatesExp[i] || '';
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
            if (c && c.note) instr = instr ? instr + ' — ' + c.note : c.note;
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
      data.push(['Key Number', 'Creative Title', 'Duration', 'Category', 'Allocation', 'Notes', 'Key Note']);
      dayRows.forEach(function (r) {
        var raw = getDR(r.id, net, day);
        var alloc = raw + '%';
        return data.push([r.keyNumber, r.title, ':' + r.dur, r.cat, alloc, getNote(r.id, day), r.note || '']);
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
  // ---- US Sports (ESPN) helpers ----
  function usWeekOn() { return usOn[wc] || {}; }
  function isUsOn(k) { return !!usWeekOn()[k]; }
  function toggleUsOn(k) {
    setUsOn(function (p) {
      var wk = Object.assign({}, p[wc] || {});
      wk[k] = !wk[k];
      var u = Object.assign({}, p); u[wc] = wk; return u;
    });
  }
  function usActiveShowtypes() { return US_SHOWTYPES.filter(function (st) { return isUsOn(st.k); }); }
  function daySplit(day) {
    var cfg = usSplit[wc] && usSplit[wc][day];
    if (!cfg || !cfg.splits || cfg.splits < 2) return { splits: 1, times: [] };
    return cfg;
  }
  function setDaySplit(day, cfg) {
    setUsSplit(function (p) {
      var wk = Object.assign({}, p[wc] || {});
      if (!cfg || cfg.splits < 2) { delete wk[day]; } else { wk[day] = cfg; }
      var u = Object.assign({}, p); u[wc] = wk; return u;
    });
  }
  function daySections(day) {
    var cfg = daySplit(day);
    if (cfg.splits < 2) { return [{ id: 's0', label: 'All day', from: 'Start', to: 'End' }]; }
    var out = [];
    for (var i = 0; i < cfg.splits; i++) {
      var from = i === 0 ? 'Start' : (cfg.times[i - 1] || '?');
      var to = i === cfg.splits - 1 ? 'End' : (cfg.times[i] || '?');
      out.push({ id: 's' + i, label: from + ' \u2013 ' + to, from: from, to: to });
    }
    return out;
  }
  function usPct(day, sec, stKey, creativeId) {
    var d = usMI[wc] && usMI[wc][day] && usMI[wc][day][sec] && usMI[wc][day][sec][stKey];
    return d && d[creativeId] != null ? d[creativeId] : '';
  }
  function setUsPct(day, sec, stKey, creativeId, val) {
    val = String(val).replace(/[^0-9.]/g, '');
    setUsMI(function (p) {
      var wk = Object.assign({}, p[wc] || {});
      var dd = Object.assign({}, wk[day] || {});
      var ss = Object.assign({}, dd[sec] || {});
      var col = Object.assign({}, ss[stKey] || {});
      if (val === '') { delete col[creativeId]; } else { col[creativeId] = val; }
      ss[stKey] = col; dd[sec] = ss; wk[day] = dd;
      var u = Object.assign({}, p); u[wc] = wk; return u;
    });
  }
  function setUsPctWithPair(day, sec, stKey, creativeId, val) {
    setUsPct(day, sec, stKey, creativeId, val);
    var st = US_SHOWTYPES.find(function (x) { return x.k === stKey; });
    if (st && st.pair) {
      var cur = usMI[wc] && usMI[wc][day] && usMI[wc][day][sec] && usMI[wc][day][sec][st.pair];
      var pairHasValue = cur && cur[creativeId] != null && cur[creativeId] !== '';
      if (!pairHasValue) setUsPct(day, sec, st.pair, creativeId, val);
    }
  }
  function usPoolTotal(day, sec, stKey, dur) {
    var col = (usMI[wc] && usMI[wc][day] && usMI[wc][day][sec] && usMI[wc][day][sec][stKey]) || {};
    return Object.keys(col).reduce(function (s2, id) {
      var c = creatives.find(function (x) { return String(x.id) === String(id); });
      if (!c || String(c.dur) !== String(dur)) return s2;
      return s2 + (parseFloat(col[id]) || 0);
    }, 0);
  }
  function usCopyBucket(fromDay, fromSec, fromSt, toDay, toSec, toSt) {
    setUsMI(function (p) {
      var wk = Object.assign({}, p[wc] || {});
      var src = (wk[fromDay] && wk[fromDay][fromSec] && wk[fromDay][fromSec][fromSt]) || {};
      var dd = Object.assign({}, wk[toDay] || {});
      var ss = Object.assign({}, dd[toSec] || {});
      ss[toSt] = Object.assign({}, src);
      dd[toSec] = ss; wk[toDay] = dd;
      var u = Object.assign({}, p); u[wc] = wk; return u;
    });
    zap('\u2713 Copied rotation');
  }
  function usCopyDay(fromDay, toDay) {
    setUsMI(function (p) {
      var wk = Object.assign({}, p[wc] || {});
      wk[toDay] = JSON.parse(JSON.stringify(wk[fromDay] || {}));
      var u = Object.assign({}, p); u[wc] = wk; return u;
    });
    setUsSplit(function (p) {
      var wk = Object.assign({}, p[wc] || {});
      if (wk[fromDay]) wk[toDay] = JSON.parse(JSON.stringify(wk[fromDay])); else delete wk[toDay];
      var u = Object.assign({}, p); u[wc] = wk; return u;
    });
    zap('\u2713 Copied whole day');
  }
  function usCopySection(day, fromSec, toSec) {
    setUsMI(function (p) {
      var wk = Object.assign({}, p[wc] || {});
      var dd = Object.assign({}, wk[day] || {});
      dd[toSec] = JSON.parse(JSON.stringify(dd[fromSec] || {}));
      wk[day] = dd;
      var u = Object.assign({}, p); u[wc] = wk; return u;
    });
    zap('\u2713 Copied timeslot');
  }
  function usCreativesFor() {
    return creatives.filter(function (c) { return c.nets && c.nets.espn && !isExpired(c); }).sort(function (a, b) {
      var ai = US_SPORT_ORDER.indexOf(a.cat), bi = US_SPORT_ORDER.indexOf(b.cat);
      if (ai < 0) ai = 99; if (bi < 0) bi = 99;
      if (ai !== bi) return ai - bi;
      return a.keyNumber < b.keyNumber ? -1 : 1;
    });
  }

  // ---- ESPN export grouping ----
  // One sports code's rotation for a day/timeslot: { creativeId: pct }, blanks and unknown keys dropped.
  function usRotation(day, secId, stKey) {
    var col = (usMI[wc] && usMI[wc][day] && usMI[wc][day][secId] && usMI[wc][day][secId][stKey]) || {};
    var out = {};
    Object.keys(col).forEach(function (id) {
      var v = col[id] == null ? '' : String(col[id]).trim();
      if (v === '') return;
      var c = creatives.find(function (x) { return String(x.id) === String(id); });
      if (!c || (String(c.dur) !== '15' && String(c.dur) !== '30')) return;
      out[id] = v;
    });
    return out;
  }
  function usRotationSig(rot) {
    return Object.keys(rot).sort().map(function (id) { return id + '=' + (parseFloat(rot[id]) || 0); }).join('|');
  }
  // Codes with identical rotations share one block ("NBA + Other Programming"). When every on-air
  // code has the same rotation the block is ALL PROGRAMMING. Codes left empty are listed in `empty`.
  function usGroupsFor(day, secId, active) {
    var groups = [], empty = [];
    active.forEach(function (st) {
      var rot = usRotation(day, secId, st.k);
      if (!Object.keys(rot).length) { empty.push(st); return; }
      var sig = usRotationSig(rot);
      var g = groups.find(function (x) { return x.sig === sig; });
      if (g) g.sts.push(st); else groups.push({ sig: sig, rot: rot, sts: [st] });
    });
    var all = groups.length === 1 && !empty.length && active.length > 1;
    groups.forEach(function (g) {
      g.all = all;
      g.label = all ? US_ALL_LABEL : g.sts.map(function (s) { return s.label; }).join(' + ');
    });
    return { groups: groups, empty: empty, sig: groups.map(function (g) { return g.label + '#' + g.sig; }).join('||') };
  }

  // ---- ESPN export: one-page rotation grid ----
  // One table per spot length. Keys run down the side; across the top, days with identical rotations
  // share a column group, split only where the material changes (a timeslot, or a sports code with
  // its own mix). Each column is one rotation and adds to 100%.
  function usGridColumns(day, active, dur, stats) {
    var slots = [];
    var keyOf = function (id) { var c = creatives.find(function (x) { return String(x.id) === String(id); }); return c ? String(c.keyNumber) : ''; };
    daySections(day).forEach(function (sec) {
      var groups = [];
      active.forEach(function (st) {
        var full = usRotation(day, sec.id, st.k), rot = {};
        Object.keys(full).forEach(function (id) {
          var c = creatives.find(function (x) { return String(x.id) === String(id); });
          if (c && String(c.dur) === dur) rot[id] = full[id];
        });
        if (!Object.keys(rot).length) return;
        var r5 = usRound5(rot, keyOf);
        if (stats && usRotationSig(r5) !== usRotationSig(rot)) stats.rounded += 1;
        rot = r5;
        var sig = usRotationSig(rot);
        var g = groups.find(function (x) { return x.sig === sig; });
        if (g) g.sts.push(st); else groups.push({ sig: sig, rot: rot, sts: [st] });
      });
      if (!groups.length) return;
      var sig = groups.map(function (g) { return g.sts.map(function (s) { return s.k; }).join('+') + '#' + g.sig; }).join('||');
      var last = slots[slots.length - 1];
      if (last && last.sig === sig && last.to === sec.from) { last.to = sec.to; return; }
      slots.push({ from: sec.from, to: sec.to, sig: sig, groups: groups });
    });
    var cols = [];
    slots.forEach(function (s) {
      var allDay = s.from === 'Start' && s.to === 'End';
      var time = allDay ? 'All day' : s.from + ' – ' + s.to;
      s.groups.forEach(function (g) {
        var everyone = g.sts.length === active.length && active.length > 1;
        var prog = everyone ? 'All programming' : g.sts.map(function (x) { return x.label; }).join(' + ');
        var label = everyone ? (allDay ? prog : time) : (allDay ? prog : time + ', ' + prog);
        cols.push({ label: label, rot: g.rot, sig: label + '#' + g.sig });
      });
    });
    return cols;
  }
  function usGridTable(active, dur, stats) {
    var groups = [], prev = -2;
    DAYS.forEach(function (day, di) {
      var cols = usGridColumns(day, active, dur, stats);
      if (!cols.length) return;
      var sig = cols.map(function (c) { return c.sig; }).join('||');
      var last = groups[groups.length - 1];
      if (last && last.sig === sig && prev === di - 1) last.last = di;
      else groups.push({ first: di, last: di, sig: sig, cols: cols });
      prev = di;
    });
    return groups;
  }

  function exportUsXLSX() {
    try {
      var active = usActiveShowtypes();
      if (!active.length) { zap('⚠ Toggle on at least one sports code first'); return false; }
      var XLSX = getXLSX();
      var hasStyles = XLSX !== XLSX_NPM;
      var wd = getWeekDates(wc);
      var dayLbl = function (di) { return DAY_L[di] + ' ' + (fmt(wd[di] || '') || '').slice(0, 5); };
      var C = function (id) { return creatives.find(function (x) { return String(x.id) === String(id); }); };
      var gaps = [], badTotals = [];
      DAYS.forEach(function (day, di) {
        var secs = daySections(day);
        secs.forEach(function (sec) {
          var g = usGroupsFor(day, sec.id, active);
          if (g.groups.length && g.empty.length) gaps.push(g.empty.map(function (s) { return s.label; }).join(', ') + ' ' + DAY_L[di] + (secs.length > 1 ? ' ' + sec.label : ''));
        });
      });
      var stats = { rounded: 0 };
      var tables = [['15', usGridTable(active, '15', stats)], ['30', usGridTable(active, '30', stats)]].filter(function (t) { return t[1].length; });
      if (!tables.length) { zap('⚠ Nothing allocated to export yet'); return false; }
      var firstDay = 6, lastDay = 0;
      tables.forEach(function (t) { t[1].forEach(function (g) { firstDay = Math.min(firstDay, g.first); lastDay = Math.max(lastDay, g.last); }); });
      var INK = '1F2937', MID = '4B5563', PAPER = 'F3F4F6', LINE = 'D1D5DB';
      var thin = { style: 'thin', color: { rgb: LINE } }, box = { top: thin, bottom: thin, left: thin, right: thin };
      var font = function (bold, color) { return { name: 'Calibri', sz: 11, bold: !!bold, color: { rgb: color || INK } }; };
      var bg = function (rgb) { return { patternType: 'solid', fgColor: { rgb: rgb } }; };
      var aoa = [], styles = {}, merges = [], rowsH = [];
      var put = function (r, c, v, s) { while (aoa.length <= r) aoa.push([]); aoa[r][c] = v; if (s) styles[r + ',' + c] = s; };
      var sportRank = ['NFL', 'NBA', 'MLB', 'SM', 'Racing', 'FC', 'Other'];
      var r = 0, maxCols = 0;
      put(r, 0, 'ESPN Material Instructions — WC ' + fmt(wc) + ' (' + DAY_L[firstDay] + (lastDay > firstDay ? '-' + DAY_L[lastDay] : '') + ')', { font: font(true) });
      r += 1;
      var used = {};
      tables.forEach(function (t) { t[1].forEach(function (g) { g.cols.forEach(function (c) { Object.keys(c.rot).forEach(function (id) { used[usSportOf(C(id))] = true; }); }); }); });
      put(r, 2, 'Colour key', { font: font(false, MID), alignment: { horizontal: 'right' } });
      sportRank.filter(function (s) { return used[s]; }).forEach(function (s, i) {
        put(r, 3 + i, US_SPORT_FILL[s][1], { font: font(true), fill: bg(US_SPORT_FILL[s][0]), alignment: { horizontal: 'center' } });
      });
      r += 2;
      tables.forEach(function (t) {
        var dur = t[0], groups = t[1], colmap = [];
        groups.forEach(function (g) { g.cols.forEach(function (c) { colmap.push(c.rot); }); });
        var n = colmap.length; maxCols = Math.max(maxCols, n);
        for (var c0 = 0; c0 < 3 + n; c0++) put(r, c0, c0 === 0 ? ':' + dur + ' SPOTS' : '', { font: font(true, 'FFFFFF'), fill: bg(INK) });
        r += 1;
        ['KEY', 'CREATIVE', 'NOTE'].forEach(function (h, c1) {
          put(r, c1, h, { font: font(true), fill: bg(PAPER), alignment: { vertical: 'center' }, border: box });
          put(r + 1, c1, '', { fill: bg(PAPER), border: box });
          merges.push({ s: { r: r, c: c1 }, e: { r: r + 1, c: c1 } });
        });
        var col = 3;
        groups.forEach(function (g) {
          var lbl = g.first === g.last ? dayLbl(g.first) : dayLbl(g.first) + ' – ' + dayLbl(g.last);
          g.cols.forEach(function (cc, i) {
            put(r, col + i, i === 0 ? lbl : '', { font: font(true, 'FFFFFF'), fill: bg(MID), alignment: { horizontal: 'center' }, border: box });
            put(r + 1, col + i, cc.label, { font: font(true), fill: bg(PAPER), alignment: { horizontal: 'center', vertical: 'center', wrapText: true }, border: box });
          });
          if (g.cols.length > 1) merges.push({ s: { r: r, c: col }, e: { r: r, c: col + g.cols.length - 1 } });
          g.cols.forEach(function (cc) {
            var vals = Object.keys(cc.rot).map(function (id) { return parseFloat(cc.rot[id]) || 0; });
            var s = Math.round(vals.reduce(function (a, b) { return a + b; }, 0) * 100) / 100;
            cc.total = s;
            cc.ok = s === 100 || (vals.length > 1 && vals.every(function (v) { return v === vals[0]; }) && vals[0] === Math.round(100 / vals.length));
            if (!cc.ok) badTotals.push(':' + dur + ' ' + lbl + ' ' + cc.label + ' = ' + s + '%');
          });
          col += g.cols.length;
        });
        rowsH[r + 1] = { hpt: 32 };
        r += 2;
        var idx = function (id) { return creatives.findIndex(function (x) { return String(x.id) === String(id); }); };
        var ids = [];
        colmap.forEach(function (m) { Object.keys(m).forEach(function (id) { if (ids.indexOf(id) < 0) ids.push(id); }); });
        ids.sort(function (a, b) {
          var sa = sportRank.indexOf(usSportOf(C(a))), sb = sportRank.indexOf(usSportOf(C(b)));
          return sa !== sb ? sa - sb : idx(a) - idx(b);
        });
        ids.forEach(function (id) {
          var cr = C(id), tint = bg(US_SPORT_FILL[usSportOf(cr)][0]);
          put(r, 0, cr.keyNumber, { font: font(true), fill: tint, border: box });
          put(r, 1, stripDur(cr.title), { font: font(false), fill: tint, border: box });
          put(r, 2, cr.note || '', { font: font(false), fill: tint, border: box });
          colmap.forEach(function (m, i) {
            var on = m[id] != null;
            put(r, 3 + i, on ? m[id] + '%' : '–', { font: font(on, on ? INK : '9CA3AF'), fill: tint, alignment: { horizontal: 'center' }, border: box });
          });
          r += 1;
        });
        put(r, 2, 'Total', { font: font(true, MID), alignment: { horizontal: 'right' } });
        var ci = 0;
        groups.forEach(function (g) {
          g.cols.forEach(function (cc) {
            put(r, 3 + ci, cc.total + '%', { font: font(true, cc.ok ? MID : 'C00000'), alignment: { horizontal: 'center' } });
            ci += 1;
          });
        });
        r += 2;
      });
      var rows = aoa.map(function (row) { var o = []; for (var i = 0; i < row.length; i++) o.push(row[i] == null ? '' : row[i]); return o; });
      var ws = XLSX.utils.aoa_to_sheet(rows);
      if (hasStyles) {
        Object.keys(styles).forEach(function (k) {
          var p = k.split(','), a = XLSX.utils.encode_cell({ r: +p[0], c: +p[1] });
          if (!ws[a]) ws[a] = { t: 's', v: '' };
          ws[a].s = styles[k];
        });
      }
      ws['!merges'] = merges;
      ws['!cols'] = [{ wch: 17 }, { wch: 64 }, { wch: 26 }];
      for (var w = 0; w < maxCols; w++) ws['!cols'].push({ wch: 13 });
      ws['!rows'] = rowsH;
      var wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'ESPN MI');
      var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      var blob = new Blob([wbout], { type: 'application/octet-stream' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a'); a.href = url;
      a.download = 'PointsBet_ESPN_US_Sports_WC' + wc + '.xlsx';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 150);
      var warn = [];
      if (gaps.length) warn.push('no rotation for: ' + gaps.join('; '));
      if (badTotals.length) warn.push('not 100%: ' + badTotals.join('; '));
      var note = stats.rounded ? ' \u00b7 ' + stats.rounded + ' rotations rounded to 5% steps' : '';
      zap(warn.length ? '\u2713 ESPN MI exported' + note + ' \u00b7 \u26a0 ' + warn.join(' \u00b7 ') : '\u2713 ESPN US Sports MI exported' + note);
      return true;
    } catch (e) { zap('⚠ Export failed: ' + (e && e.message ? e.message : e)); return false; }
  }

  function exportGridXLSX(net) {
    try {
      var rows = outRows(net);
      var lbl = (NETS.find(function (n) { return n.k === net; }) || { label: net }).label;
      var XLSX = getXLSX();
      var hasStyles = XLSX !== XLSX_NPM;
      var aoa = [], meta = [];
      var push = function (arr, m) { var rr = arr.slice(); while (rr.length < 8) rr.push(''); aoa.push(rr); meta.push(m || { type: 'blank' }); };
      push([lbl + ' \u2014 Material Instructions \u2014 WC ' + fmt(wc)], { type: 'title' });
      push([], { type: 'blank' });
      var any = false;
      DAYS.forEach(function (day, i) {
        var date = weekDates[i] || '';
        var dayRows = rows.filter(function (r) { return dayEnabled(r, date) && (parseFloat(getDR(r.id, net, day)) || 0) > 0; });
        if (!dayRows.length) return;
        any = true;
        push([DAY_L[i] + ' ' + fmt(date)], { type: 'date' });
        push(['Key Number', 'Creative Title', 'Duration', 'Category', 'Allocation', 'Notes', 'Key Note'], { type: 'header' });
        dayRows.forEach(function (r) {
          push([r.keyNumber, r.title, ':' + r.dur, r.cat, getDR(r.id, net, day) + '%', getNote(r.id, day) || '', r.note || ''], { type: 'spot' });
        });
        push([], { type: 'blank' });
      });
      if (!any) { zap('\u26A0 No ' + lbl + ' spots allocated this week'); return false; }
      var ws = XLSX.utils.aoa_to_sheet(aoa);
      ws['!cols'] = [{ wch: 20 }, { wch: 44 }, { wch: 10 }, { wch: 20 }, { wch: 12 }, { wch: 26 }, { wch: 30 }];
      if (hasStyles) {
        var thin = { style: 'thin', color: { rgb: '000000' } };
        var border = { top: thin, bottom: thin, left: thin, right: thin };
        var BLACK = '000000', WHITE = 'FFFFFF', RED = 'C00000';
        function cell(r, c) { var a = XLSX.utils.encode_cell({ r: r, c: c }); if (!ws[a]) ws[a] = { t: 's', v: '' }; return ws[a]; }
        for (var r = 0; r < meta.length; r++) {
          var m = meta[r];
          if (m.type === 'title') { var t0 = cell(r, 0); t0.s = { font: { bold: true, sz: 14, color: { rgb: RED } } }; }
          else if (m.type === 'date') { var d0 = cell(r, 0); d0.s = { font: { bold: true, sz: 12, color: { rgb: RED } } }; }
          else if (m.type === 'header') { for (var c = 0; c < 7; c++) { var hc = cell(r, c); hc.s = { font: { bold: true, color: { rgb: WHITE }, sz: 11 }, fill: { fgColor: { rgb: BLACK } }, alignment: { horizontal: c === 4 ? 'center' : 'left', vertical: 'center' }, border: border }; } }
          else if (m.type === 'spot') { for (var c2 = 0; c2 < 7; c2++) { var sc = cell(r, c2); sc.s = { font: { color: { rgb: BLACK }, sz: 11 }, alignment: { horizontal: c2 === 4 ? 'center' : 'left', vertical: 'center' }, border: border }; } }
        }
      }
      var wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, lbl.slice(0, 28));
      var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      var blob = new Blob([wbout], { type: 'application/octet-stream' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'PointsBet_MI_' + lbl.replace(/[^a-zA-Z0-9]/g, '_') + '_WC' + wc + '.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 150);
      return true;
    } catch (e) { zap('\u26A0 Export failed'); return false; }
  }
  function prepareEmail(net, opts) {
    opts = opts || {};
    var ok = net === 'rdc' ? exportRDCMI(opts.subset, opts.suffix) : (net === 'fox' || net === 'espn') ? exportGridXLSX(net) : exportCSV(net);
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
      usMI: usMI,
      usOn: usOn,
      usSplit: usSplit,
      sentMap: sentMap,
      dueOv: dueOv,
      snaps: snaps,
      lf: lfCamps,
      tcn: tcn,
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
        if (d.usMI) setUsMI(d.usMI);
        if (d.usOn) setUsOn(d.usOn);
        if (d.usSplit) setUsSplit(d.usSplit);
        if (d.lf) setLfCamps(d.lf);
        if (d.tcn) setTcn(d.tcn);
        if (d.wc) setWC(snapToSunday(d.wc));
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
      snaps: snaps,
      usMI: usMI,
      usOn: usOn,
      usSplit: usSplit,
      lf: lfCamps,
      tcn: tcn
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
    // Only take ESPN and large format data from the cloud when it has some, so a device that has never
    // held any can't wipe another device's copy the first time they both sync.
    if (d.usMI && Object.keys(d.usMI).length) setUsMI(d.usMI);
    if (d.usOn && Object.keys(d.usOn).length) setUsOn(d.usOn);
    if (d.usSplit && Object.keys(d.usSplit).length) setUsSplit(d.usSplit);
    if (d.lf && d.lf.length) setLfCamps(d.lf);
    if (d.tcn && d.tcn.windows && Object.keys(d.tcn.weeks || {}).length) setTcn(d.tcn);
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
  }, [allRots, allNotes, rdcMI, usMI, usOn, usSplit, lfCamps, tcn, sentMap, dueOv, emailConfig, snaps, loaded]);
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
    className: "mi-shell",
    style: {
      maxWidth: 1380,
      margin: '0 auto',
      padding: '0 18px 24px',
      color: '#111827'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      margin: '0 -18px 18px',
      padding: '16px 26px',
      background: 'linear-gradient(90deg,#0c0e1a 0%,#171a2e 100%)',
      borderBottom: '3px solid #EE1A42',
      boxShadow: '0 4px 18px rgba(12,14,26,.25)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 19,
      fontWeight: 800,
      letterSpacing: '-0.4px',
      color: '#fff'
    }
  }, "PointsBet ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#EE1A42'
    }
  }, "MI Planner"), " ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 800,
      color: '#fff',
      backgroundColor: '#EE1A42',
      borderRadius: 5,
      padding: '2px 7px',
      verticalAlign: 'middle',
      letterSpacing: '0.08em',
      marginLeft: 4
    }
  }, "V2"), " ", /*#__PURE__*/React.createElement("span", {
    title: "Build date \u2014 confirms which version you're viewing",
    style: {
      fontSize: 10,
      fontWeight: 700,
      color: '#9aa0b5',
      backgroundColor: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: 5,
      padding: '2px 7px',
      verticalAlign: 'middle',
      letterSpacing: '0.03em',
      marginLeft: 6
    }
  }, "build ", BUILD)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#9aa0b5',
      marginTop: 3
    }
  }, "Material Instructions · TV · Radio · RDC · Large Format · 7-Eleven · ", creatives.length, " creatives")), flash && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: '#0c0e1a',
      fontWeight: 700,
      padding: '6px 14px',
      backgroundColor: '#7CFC9B',
      borderRadius: 20,
      boxShadow: '0 2px 8px rgba(0,0,0,.25)'
    }
  }, flash)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      marginBottom: 18,
      flexWrap: 'wrap',
      alignItems: 'center',
      background: '#fff',
      borderRadius: 14,
      padding: '8px 10px',
      boxShadow: '0 1px 4px rgba(17,24,39,.07)'
    }
  }, [['library', '🎬 Creative Library'], ['foxfooty', '🏈 Fox Footy'], ['ussports', '🏈 ESPN'], ['rdcmi', '📡 RDC'], ['radio', '📻 Radio'], ['outdoor', '🪧 Large Format'], ['seven', '🏪 7-Eleven']].map(function (item) {
    return /*#__PURE__*/React.createElement("button", {
      key: item[0],
      onClick: function () {
        setTab(item[0]);
      },
      style: {
        padding: '8px 15px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: tab === item[0] ? 700 : 500,
        color: tab === item[0] ? '#fff' : '#4b5563',
        background: tab === item[0] ? 'linear-gradient(90deg,#EE1A42,#c8123a)' : 'transparent',
        borderRadius: 9,
        fontSize: 13,
        boxShadow: tab === item[0] ? '0 3px 10px rgba(238,26,66,.30)' : 'none'
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
  })))), tab === 'ussports' && /*#__PURE__*/React.createElement(USSports, {
    wc: wc, setWc: setWC, fmt: fmt, creatives: creatives, isExpired: isExpired,
    US_SHOWTYPES: US_SHOWTYPES, US_SPORT_ORDER: US_SPORT_ORDER,
    CAT_COL: CAT_COL, stripDur: stripDur, DAYS: DAYS, DAY_L: DAY_L, getWeekDates: getWeekDates,
    isUsOn: isUsOn, toggleUsOn: toggleUsOn, usActiveShowtypes: usActiveShowtypes,
    daySplit: daySplit, setDaySplit: setDaySplit, daySections: daySections,
    usPct: usPct, setUsPctWithPair: setUsPctWithPair, usPoolTotal: usPoolTotal,
    usCopyBucket: usCopyBucket, usCopyDay: usCopyDay, usCopySection: usCopySection,
    usCreativesFor: usCreativesFor, exportUsXLSX: exportUsXLSX
  }), tab === 'outdoor' && /*#__PURE__*/React.createElement(LargeFormat, {
    camps: lfCamps, setCamps: setLfCamps, zap: zap, getXLSX: getXLSX
  }), tab === 'seven' && /*#__PURE__*/React.createElement(SevenEleven, {
    tcn: tcn, setTcn: setTcn, zap: zap, getXLSX: getXLSX
  }), tab === 'send' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
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
      setWC(snapToSunday(e.target.value));
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
  }, "Sent status is tracked per week — change the WC date above to see another week's run sheet. Due dates default to the usual lead times (RDC Sun–Tue earlier per Racing.com's split delivery); adjust \"days before WC\" if a network changes its deadline.")), (tab === 'foxfooty' || tab === 'radio') && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PlatformTabHeader, {
    tab: tab, planNet: planNet, setPlanNet: setPlanNet
  }), planNet === 'fox' ? /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, padding: '10px 14px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, flexWrap: 'wrap' }
  }, /*#__PURE__*/React.createElement("div", { style: { flex: '1 1 280px' } },
    /*#__PURE__*/React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: '#1d4ed8', marginBottom: 2 } }, "\uD83D\uDCFA Fox Footy Spot-by-Spot Mapping"),
    /*#__PURE__*/React.createElement("div", { style: { fontSize: 11, color: '#1e40af' } }, "Upload Fox's clear .xlsx \u2014 the tool applies your Fox rotation % for this week to assign creatives spot-by-spot (matched by duration) and downloads a completed file.")),
    /*#__PURE__*/React.createElement("label", { style: { display: 'inline-block', backgroundColor: '#1d4ed8', color: '#fff', padding: '8px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700 } }, "\uD83D\uDCC2 Upload & Generate",
      /*#__PURE__*/React.createElement("input", { type: "file", accept: ".xlsx,.xls", onChange: handleFoxUpload, style: { display: 'none' } }))
  ) : null, !loaded ? /*#__PURE__*/React.createElement("div", {
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
      setWC(snapToSunday(e.target.value));
    },
    style: {
      border: '1px solid #d1d5db',
      borderRadius: 5,
      padding: '4px 8px',
      fontSize: 13
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: '#6b7280'
    }
  }, fmt(wc), " – ", fmt(wcEnd)), /*#__PURE__*/React.createElement("button", {
    onClick: function () { (planNet === 'fox' || planNet === 'espn') ? exportGridXLSX(planNet) : exportCSV(planNet); },
    style: {
      marginLeft: 'auto',
      padding: '5px 14px',
      border: 'none',
      borderRadius: 6,
      cursor: 'pointer',
      fontSize: 12,
      fontWeight: 700,
      backgroundColor: '#1d6f42',
      color: '#fff'
    }
  }, (planNet === 'fox' || planNet === 'espn') ? "\u2193 Export Excel" : "\u2193 Export CSV"), /*#__PURE__*/React.createElement("button", {
    onClick: clearAllocations,
    style: {
      marginLeft: 8,
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
    }, "blank = ongoing")), /*#__PURE__*/React.createElement("th", {
      style: {
        ...TH,
        textAlign: 'center'
      }
    }, "Material"), /*#__PURE__*/React.createElement("th", { style: TH }, "Note"), allPlatNets.map(function (n) {
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
      }, "Not arrived"))), /*#__PURE__*/React.createElement("td", {
        style: { ...TD, padding: '4px 6px' }
      }, /*#__PURE__*/React.createElement("input", {
        type: "text",
        value: c.note || '',
        placeholder: 'Note (shows on all sheets)',
        onChange: function (e) { updateCreativeField(c.id, 'note', e.target.value); },
        style: { ...editInp, minWidth: 160 }
      })), allPlatNets.map(function (n) {
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
      var ok = (outNet === 'fox' || outNet === 'espn') ? exportGridXLSX(outNet) : exportCSV(outNet);
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
  }, (outNet === 'fox' || outNet === 'espn') ? "\u2193 Export Excel" : "\u2193 Export CSV"), /*#__PURE__*/React.createElement("span", {
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
      setWC(snapToSunday(e.target.value));
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
  }, "✉ Prepare Email & Download ", emailNet === 'rdc' ? 'RDC MI' : (emailNet === 'fox' || emailNet === 'espn') ? 'Excel' : 'CSV'), /*#__PURE__*/React.createElement("button", {
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
