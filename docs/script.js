/* ============================================================
   ITSafe – script.js
   Laravel API + Leaflet (OSM / Satelit / Dark / Topo)
   Heatmap · Titik · Cluster · Basemap switcher
============================================================ */

// ─── API CONFIG ─────────────────────────────────────────────
const API_BASE = 'http://127.0.0.1:8000/api';

// ─── STATE ──────────────────────────────────────────────────
let reports     = [];   // diisi dari API
let activeLayer = 'semua';
let visHeatmap  = true;
let visPoint    = false;
let visCluster  = false;

// ─── LEAFLET INSTANCES ──────────────────────────────────────
let leafletMap   = null;
let pickerMap    = null;
let pickerMarker = null;
let baseTile     = null;
let heatLayer    = null;
let pointLayer   = null;
let clusterLayer = null;
let fixedLocationLayerMain = null;
let fixedLocationLayerPicker = null;
let boundaryLayerMain = null;
let boundaryLayerPicker = null;
let currentBm    = 'osm';

// ─── BASEMAP CONFIGS ────────────────────────────────────────
const BASEMAPS = {
  osm:       { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',                                                                attr: '© <a href="https://www.openstreetmap.org">OpenStreetMap</a>', opt: {} },
  satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',                    attr: 'Tiles © Esri',                                                opt: {} },
  dark:      { url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',                                                    attr: '© <a href="https://carto.com">CARTO</a>',                    opt: { subdomains: 'abcd' } },
  topo:      { url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',                                                                 attr: '© <a href="https://opentopomap.org">OpenTopoMap</a>',       opt: {} },
};

const ITS  = [-7.2756, 112.7951];
const ZOOM = 15;
const QR_URL = 'https://its.id/m/ITSafe_Kelompok7FieldCamp2026';

const FACULTY_COLORS = {
  'FSAD':   '#2563EB',
  'FTIRS':  '#F97316',
  'FTSPK':  '#84CC16',
  'FDKBD':  '#10B981',
  'FV':     '#EF4444',
  'FKK':    '#0EA5E9',
  'Lainnya':'#6B7280',
};

const INCIDENT_COLORS = {
  'Verbal':      '#FCD34D',
  'Non-verbal':  '#67E8F9',
  'Fisik':       '#FCA5A5',
  'Pemerkosaan': '#FDA4AF',
  'Pencabulan':  '#FB923C',
  'Lainnya':     '#A78BFA',
};

let locationFacultyMap = {};

// ─── LOCATION DATA ──────────────────────────────────────────
const LOCATIONS = [
  { id:1,  name:'Perpustakaan Pusat ITS',         desc:'Area parkir dan lobi utama perpustakaan, zona keluar-masuk yang minim pengawasan.',    status:'terpasang', count:3,  icon:'fa-book-open',        lat:-7.2748, lng:112.7944, gmaps:'https://maps.google.com/?q=-7.2748,112.7944' },
  { id:2,  name:'Gedung Teknik Sipil (FTSP)',      desc:'Koridor lantai 2 dan area tangga belakang gedung.',                                    status:'terpasang', count:5,  icon:'fa-building-columns', lat:-7.2771, lng:112.7963, gmaps:'https://maps.google.com/?q=-7.2771,112.7963' },
  { id:3,  name:'Kantin Pusat (Food Court)',       desc:'Area sekitar kantin pusat, terutama pada jam-jam sepi.',                               status:'terpasang', count:2,  icon:'fa-utensils',         lat:-7.2756, lng:112.7951, gmaps:'https://maps.google.com/?q=-7.2756,112.7951' },
  { id:4,  name:'Asrama Mahasiswa Putra',          desc:'Koridor dan area parkir depan asrama putra ITS.',                                      status:'terpasang', count:4,  icon:'fa-house-user',       lat:-7.2735, lng:112.7938, gmaps:'https://maps.google.com/?q=-7.2735,112.7938' },
  { id:5,  name:'Asrama Mahasiswa Putri',          desc:'Pintu masuk utama dan taman asrama putri.',                                            status:'terpasang', count:4,  icon:'fa-house-user',       lat:-7.2745, lng:112.7955, gmaps:'https://maps.google.com/?q=-7.2745,112.7955' },
  { id:6,  name:'Laboratorium Kimia (FMIPA)',      desc:'Lorong penghubung antar laboratorium di gedung FMIPA.',                                status:'rencana',   count:1,  icon:'fa-flask',            lat:-7.2780, lng:112.7969, gmaps:'https://maps.google.com/?q=-7.2780,112.7969' },
  { id:7,  name:'Lapangan Olahraga / GOR',         desc:'Area tribun dan ruang ganti GOR ITS.',                                                 status:'rencana',   count:0,  icon:'fa-person-running',   lat:-7.2790, lng:112.7920, gmaps:'https://maps.google.com/?q=-7.2790,112.7920' },
  { id:8,  name:'Gedung Robotika (Teknik Elektro)',desc:'Basement dan area parkir motor gedung Teknik Elektro.',                                status:'rencana',   count:0,  icon:'fa-microchip',        lat:-7.2760, lng:112.7980, gmaps:'https://maps.google.com/?q=-7.2760,112.7980' },
  { id:9,  name:'Masjid Manarul Ilmi ITS',         desc:'Area wudhu dan parkir belakang masjid.',                                               status:'terpasang', count:1,  icon:'fa-mosque',           lat:-7.2765, lng:112.7925, gmaps:'https://maps.google.com/?q=-7.2765,112.7925' },
  { id:10, name:'Gedung Rektorat ITS',             desc:'Area lobby dan lorong menuju ruang tunggu layanan mahasiswa.',                         status:'rencana',   count:0,  icon:'fa-landmark',         lat:-7.2770, lng:112.7940, gmaps:'https://maps.google.com/?q=-7.2770,112.7940' },
  { id:11, name:'Co-working Space / Ruang Bersama',desc:'Area kerja bersama yang buka hingga larut malam.',                                     status:'terpasang', count:2,  icon:'fa-laptop',           lat:-7.2753, lng:112.7985, gmaps:'https://maps.google.com/?q=-7.2753,112.7985' },
  { id:12, name:'Area Parkir Timur',               desc:'Parkiran motor dan mobil bagian timur kampus, minim pencahayaan malam.',               status:'rencana',   count:0,  icon:'fa-square-parking',   lat:-7.2762, lng:112.7978, gmaps:'https://maps.google.com/?q=-7.2762,112.7978' },
];

const TEAM = [
  { name:'Wisnu Aditya Duane',      nrp:'5016221087', initial:'W', photo:'assets/Wisnu.png' },
  { name:'Josephine Novellia A.',   nrp:'5016231044', initial:'J', photo:'assets/Josephine.png' },
  { name:'Duta Satrio Wibowo',      nrp:'5016231047', initial:'D', photo:'assets/Duta.png' },
  { name:'Muhammad Farid Farhan',   nrp:'5016231069', initial:'M', photo:'assets/Muhammad.png' },
  { name:'Farrel Valentino Y.',     nrp:'5016231075', initial:'F', photo:'assets/Farrel.png' },
  { name:'Ananda Adellia C. S.',    nrp:'5016231092', initial:'A', photo:'assets/Adellia.png' },
];

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initForm();
  buildLocationFacultyMap();
  fetchReports();       // ambil data dari API
  fetchStats();         // ambil statistik dari API
  renderLocationCards('all');
  renderTeam();
  generateQR();
  initPickerMap();
});

// ============================================================
// API FUNCTIONS
// ============================================================

// Ambil semua laporan dari Laravel
async function fetchReports() {
  try {
    const res = await fetch(`${API_BASE}/reports`);
    const data = await res.json();
    // Sesuaikan field dari API ke format lokal
    reports = data.map(r => ({
      id:         r.id,
      createdAt:  r.created_at,
      kelamin:    r.jenis_kelamin,
      jenis:      r.jenis_kekerasan,
      waktu:      r.waktu_kejadian,
      lokasi:     r.lokasi_kejadian,
      lat:        r.latitude ? parseFloat(r.latitude) : null,
      lng:        r.longitude ? parseFloat(r.longitude) : null,
      tanggal:    r.tanggal_kejadian,
      status:     r.status,
      fakultas:   getFacultyFromLocationName(r.lokasi_kejadian),
    }));
    updateLayerCounts();
    if (leafletMap) renderLeafletMap();
  } catch (e) {
    console.error('Gagal ambil data laporan:', e);
  }
}

// Ambil statistik dari Laravel
async function fetchStats() {
  try {
    const res  = await fetch(`${API_BASE}/reports/stats`);
    const data = await res.json();
    document.getElementById('totalLaporan').textContent  = data.total       || 0;
    document.getElementById('bulanIni').textContent      = data.bulan_ini   || 0;
    document.getElementById('terverifikasi').textContent = data.terverifikasi|| 0;
  } catch (e) {
    console.error('Gagal ambil statistik:', e);
  }
}

// Kirim laporan ke Laravel
async function submitToAPI(payload) {
  const res = await fetch(`${API_BASE}/reports`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body:    JSON.stringify(payload),
  });
  return await res.json();
}

// ============================================================
// NAVIGATION
// ============================================================
function initNav() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(link.dataset.page);
      document.getElementById('navLinks').classList.remove('open');
    });
  });
  document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('open');
  });
  window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20);
  });
}

function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.getElementById(page)?.classList.add('active');
  document.querySelector(`[data-page="${page}"]`)?.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (page === 'peta') {
    updateLayerCounts();
    setTimeout(() => { initLeafletMap(); renderLeafletMap(); }, 100);
  }
}

function scrollToForm() {
  navigateTo('home');
  setTimeout(() => document.getElementById('formSection').scrollIntoView({ behavior:'smooth' }), 100);
}

// ============================================================
// FORM
// ============================================================
function initForm() {
  document.getElementById('reportForm').addEventListener('submit', handleSubmit);
  document.getElementById('lokasiInsiden')?.addEventListener('change', handleLocationPreset);
}

async function handleSubmit(e) {
  e.preventDefault();
  const required = ['emailIts','jenisKelamin','statusKorban','jenisInsiden','tanggalInsiden','waktuInsiden','lokasiInsiden','kronologi'];
  let valid = true;
  required.forEach(id => {
    const el = document.getElementById(id);
    if (!el.value.trim()) { el.style.borderColor = '#E11D48'; valid = false; }
    else el.style.borderColor = '';
  });
  const tanggalStr = document.getElementById('tanggalInsiden').value.trim();
  const tanggalISO = normalizeTanggalInput(tanggalStr);
  if (!tanggalISO) {
    valid = false;
    document.getElementById('tanggalInsiden').style.borderColor = '#E11D48';
  }
  if (!document.getElementById('consent').checked) { showToast('⚠ Harap setujui pernyataan persetujuan.','error'); return; }
  if (!valid) { showToast('⚠ Harap lengkapi semua field wajib.','error'); return; }

  const lat = parseFloat(document.getElementById('lat').value);
  const lng = parseFloat(document.getElementById('lng').value);
  const lokasiSelect = document.getElementById('lokasiInsiden');
  const lokasiVal    = lokasiSelect.value;
  if (/Lainnya/i.test(lokasiVal) && (isNaN(lat) || isNaN(lng))) {
    showToast('⚠ Pin lokasi wajib diisi jika memilih Lainnya.', 'error');
    return;
  }

  const payload = {
    email_its:        document.getElementById('emailIts').value.trim(),
    jenis_kelamin:    document.getElementById('jenisKelamin').value,
    status_korban:    document.getElementById('statusKorban').value,
    jenis_kekerasan:  document.getElementById('jenisInsiden').value,
    tanggal_kejadian: tanggalISO,
    waktu_kejadian:   document.getElementById('waktuInsiden').value,
    lokasi_kejadian:  lokasiVal,
    latitude:         isNaN(lat) ? null : lat,
    longitude:        isNaN(lng) ? null : lng,
    kronologi:        document.getElementById('kronologi').value.trim(),
    saksi:            document.getElementById('saksi').value.trim(),
    sudah_lapor:      document.getElementById('sudahLapor').value,
    kontak_pelapor:   document.getElementById('kontakPelapor').value.trim(),
  };

  try {
    showToast('⏳ Mengirim laporan...', 'success');
    const result = await submitToAPI(payload);
    if (result.success) {
      e.target.reset();
      clearPin();
      await fetchReports();
      await fetchStats();
      showToast(`✅ Laporan terkirim! Kode: ${result.report_code}`, 'success');
    } else {
      showToast('⚠ Gagal mengirim laporan. Coba lagi.', 'error');
    }
  } catch (err) {
    console.error(err);
    showToast('⚠ Tidak dapat terhubung ke server.', 'error');
  }
}

function handleLocationPreset() {
  const sel = document.getElementById('lokasiInsiden');
  if (!sel) return;
  const opt = sel.options[sel.selectedIndex];
  const lat = opt?.dataset?.lat;
  const lng = opt?.dataset?.lng;
  if (lat && lng) {
    setPin(parseFloat(lat), parseFloat(lng));
  } else if (opt && /Lainnya/i.test(opt.value)) {
    clearPin();
  }
}

function buildLocationFacultyMap() {
  locationFacultyMap = {};
  document.querySelectorAll('#lokasiInsiden option').forEach(opt => {
    if (!opt.value) return;
    locationFacultyMap[opt.value] = getFacultyFromOption(opt);
  });
}

function getFacultyFromOption(opt) {
  const parent = opt?.parentElement;
  if (parent && parent.tagName === 'OPTGROUP') return parent.label;
  return 'Lainnya';
}

function getFacultyColor(faculty) {
  return FACULTY_COLORS[faculty] || FACULTY_COLORS.Lainnya;
}

function getFacultyFromLocationName(name) {
  return locationFacultyMap[name] || 'Lainnya';
}

function createFacultyIcon(color) {
  return L.divIcon({
    className: 'faculty-pin-wrap',
    html: `<div class="faculty-pin" style="--pin-color:${color}"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
}

function createCaseIcon(color) {
  return L.divIcon({
    className: 'case-dot-wrap',
    html: `<div class="case-dot" style="--case-color:${color}"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -9],
  });
}

// ============================================================
// PICKER MAP (mini Leaflet di form)
// ============================================================
function initPickerMap() {
  if (pickerMap) return;
  pickerMap = L.map('pickerMap', { zoomControl: true }).setView(ITS, ZOOM);
  L.tileLayer(BASEMAPS.osm.url, { attribution: BASEMAPS.osm.attr }).addTo(pickerMap);
  fixedLocationLayerPicker = L.layerGroup().addTo(pickerMap);
  renderFixedLocations(fixedLocationLayerPicker);
  loadBoundaryLayer(pickerMap, 'picker');
  pickerMap.on('click', e => setPin(e.latlng.lat, e.latlng.lng));
}

function setPin(lat, lng) {
  document.getElementById('lat').value = lat.toFixed(6);
  document.getElementById('lng').value = lng.toFixed(6);
  document.getElementById('locStatus').textContent = `📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  if (pickerMarker) pickerMarker.remove();
  pickerMarker = L.marker([lat, lng], {
    icon: L.divIcon({
      className: '',
      html: `<div style="width:16px;height:16px;background:#E11D48;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.5)"></div>`,
      iconAnchor: [8, 8]
    })
  }).addTo(pickerMap);
  pickerMap.setView([lat, lng], Math.max(pickerMap.getZoom(), 16));
}

function clearPin() {
  document.getElementById('lat').value = '';
  document.getElementById('lng').value = '';
  document.getElementById('locStatus').textContent = '';
  if (pickerMarker) { pickerMarker.remove(); pickerMarker = null; }
}

function getLocation() {
  if (!navigator.geolocation) { showToast('Geolokasi tidak didukung browser ini.', 'error'); return; }
  document.getElementById('locStatus').textContent = 'Mendapatkan lokasi…';
  navigator.geolocation.getCurrentPosition(
    pos => setPin(pos.coords.latitude, pos.coords.longitude),
    ()  => { showToast('Gagal mendapatkan lokasi.','error'); document.getElementById('locStatus').textContent = ''; }
  );
}

// ============================================================
// MAIN LEAFLET MAP (halaman Peta)
// ============================================================
function initLeafletMap() {
  if (leafletMap) return;
  leafletMap = L.map('leafletMap').setView(ITS, ZOOM);
  baseTile = L.tileLayer(BASEMAPS.osm.url, { attribution: BASEMAPS.osm.attr }).addTo(leafletMap);
  fixedLocationLayerMain = L.layerGroup().addTo(leafletMap);
  renderFixedLocations(fixedLocationLayerMain);
  loadBoundaryLayer(leafletMap, 'main');
}

function renderLeafletMap() {
  if (!leafletMap) return;
  renderFixedLocations(fixedLocationLayerMain);

  if (heatLayer)    { leafletMap.removeLayer(heatLayer);    heatLayer = null; }
  if (pointLayer)   { leafletMap.removeLayer(pointLayer);   pointLayer = null; }
  if (clusterLayer) { leafletMap.removeLayer(clusterLayer); clusterLayer = null; }

  const filterBulan = document.getElementById('filterBulan')?.value || '';
  const filterWaktu = document.getElementById('filterWaktu')?.value || '';

  let data = reports.filter(r => r.lat && r.lng);
  if (activeLayer !== 'semua') {
    data = data.filter(r => r.kelamin === activeLayer || r.jenis === activeLayer);
  }
  if (filterWaktu) data = data.filter(r => r.waktu === filterWaktu);
  if (filterBulan) {
    data = data.filter(r => {
      const d = parseTanggal(r.tanggal);
      return d && (d.getMonth() + 1) === parseInt(filterBulan);
    });
  }

  updateTopAreas(data);
  updateHeatmapAnalysis(data, filterWaktu, filterBulan);

  const overlay = document.getElementById('mapOverlay');
  const hasFixed = fixedLocationLayerMain && fixedLocationLayerMain.getLayers().length > 0;
  overlay.style.display = (data.length === 0 && !hasFixed) ? 'flex' : 'none';
  if (!data.length) return;

  if (visHeatmap && L.heatLayer) {
    heatLayer = L.heatLayer(
      data.map(r => [r.lat, r.lng, 1]),
      { radius: 35, blur: 22, maxZoom: 18, gradient: { 0.1:'#3B82F6', 0.4:'#10B981', 0.7:'#F59E0B', 1.0:'#EF4444' } }
    ).addTo(leafletMap);
  }

  if (visPoint) {
    pointLayer = L.layerGroup();
    data.forEach(r => {
      const color = INCIDENT_COLORS[r.jenis] || '#A78BFA';
      L.circleMarker([r.lat, r.lng], {
        radius: 9, fillColor: color, color: '#fff', weight: 2, opacity: 1, fillOpacity: .9
      }).bindPopup(buildPopup(r)).addTo(pointLayer);
    });
    leafletMap.addLayer(pointLayer);
  }

  if (visCluster && L.markerClusterGroup) {
    clusterLayer = L.markerClusterGroup({ chunkedLoading: true });
    data.forEach(r => {
      const color = INCIDENT_COLORS[r.jenis] || '#A78BFA';
      L.marker([r.lat, r.lng], { icon: createCaseIcon(color) })
        .bindPopup(buildPopup(r))
        .addTo(clusterLayer);
    });
    leafletMap.addLayer(clusterLayer);
  }
}

async function loadBoundaryLayer(map, target) {
  if (!map || typeof shp === 'undefined') return;
  try {
    if (target === 'main' && boundaryLayerMain) return;
    if (target === 'picker' && boundaryLayerPicker) return;
    const res = await fetch('assets/its_boundary.zip');
    if (!res.ok) return;
    const buf = await res.arrayBuffer();
    const gj  = await shp(buf);
    const data = gj.type ? gj : gj[Object.keys(gj)[0]];
    const layer = L.geoJSON(data, {
      style: { color:'#111827', weight:2, fill:false, dashArray:'6 4' }
    }).addTo(map);
    layer.bringToFront();
    if (target === 'main')   boundaryLayerMain   = layer;
    if (target === 'picker') boundaryLayerPicker = layer;
  } catch (e) { /* boundary optional */ }
}

function buildPopup(r) {
  const faculty = r.fakultas || getFacultyFromLocationName(r.lokasi);
  return `<div style="font-family:'DM Sans',sans-serif;min-width:175px;font-size:.85rem">
    <strong style="color:#E11D48">${r.jenis}</strong><br/>
    <span style="color:#555">${esc(r.lokasi)}</span>
    <hr style="margin:.35rem 0;border:none;border-top:1px solid #eee"/>
    <span>Kelamin: ${r.kelamin}</span><br/>
    <span>Fakultas: ${esc(faculty)}</span><br/>
    <span>Tanggal: ${r.tanggal}</span><br/>
    <span>Waktu: ${r.waktu || '-'}</span>
  </div>`;
}

function renderFixedLocations(layer) {
  if (!layer) return;
  layer.clearLayers();
  const opts = Array.from(document.querySelectorAll('#lokasiInsiden option[data-lat][data-lng]'));
  const seen = new Set();
  opts.forEach(opt => {
    const lat = opt.dataset.lat;
    const lng = opt.dataset.lng;
    if (!lat || !lng) return;
    const key = `${lat},${lng},${opt.textContent}`;
    if (seen.has(key)) return;
    seen.add(key);
    const faculty = getFacultyFromOption(opt);
    const color   = getFacultyColor(faculty);
    L.marker([parseFloat(lat), parseFloat(lng)], { icon: createFacultyIcon(color) })
      .bindPopup(`<strong>${esc(opt.textContent)}</strong><br/><span>${esc(faculty)}</span>`)
      .addTo(layer);
  });
}

function switchBasemap(btn) {
  const bm = btn.dataset.bm;
  currentBm = bm;
  document.querySelectorAll('.bm-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if (!leafletMap) return;
  leafletMap.eachLayer(l => { if (l === baseTile) leafletMap.removeLayer(l); });
  const cfg = BASEMAPS[bm];
  baseTile = L.tileLayer(cfg.url, { attribution: cfg.attr, ...cfg.opt }).addTo(leafletMap);
  baseTile.bringToBack();
}

function switchLayer(radio) {
  activeLayer = radio.value;
  document.querySelectorAll('.layer-card').forEach(c => c.classList.toggle('active', c.dataset.layer === activeLayer));
  const el = document.getElementById('activeLayerName');
  if (el) el.textContent = activeLayer === 'semua' ? 'Semua Insiden' : activeLayer;
  renderLeafletMap();
}

function toggleVis(type, cb) {
  if (type === 'heatmap') visHeatmap = cb.checked;
  if (type === 'point')   visPoint   = cb.checked;
  if (type === 'cluster') visCluster = cb.checked;
  document.getElementById('tog-' + type)?.classList.toggle('active', cb.checked);
  renderLeafletMap();
}

// ============================================================
// STATS & COUNTS
// ============================================================
function updateStats() {
  fetchStats();
}

function updateLayerCounts() {
  const set = (id, n) => { const el = document.getElementById(id); if (el) el.textContent = n; };
  set('cnt-semua',     reports.length);
  set('cnt-laki',      reports.filter(r => r.kelamin === 'Laki-laki').length);
  set('cnt-perempuan', reports.filter(r => r.kelamin === 'Perempuan').length);
  set('cnt-verbal',    reports.filter(r => r.jenis === 'Verbal').length);
  set('cnt-nonverbal', reports.filter(r => r.jenis === 'Non-verbal').length);
  set('cnt-fisik',     reports.filter(r => r.jenis === 'Fisik').length);
  set('cnt-perkosaan', reports.filter(r => r.jenis === 'Pemerkosaan').length);
  set('cnt-pencabulan',reports.filter(r => r.jenis === 'Pencabulan').length);
  set('cnt-lainnya',   reports.filter(r => r.jenis === 'Lainnya').length);
}

function updateTopAreas(data) {
  const list = document.getElementById('topAreasList');
  if (!list) return;
  const rows = Array.isArray(data) ? data : reports;
  const counts = {};
  rows.forEach(r => {
    const key = (r.lokasi || '').trim();
    if (!key) return;
    counts[key] = (counts[key] || 0) + 1;
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  if (!sorted.length) {
    list.innerHTML = '<li class="analysis-empty">Belum ada data untuk analisis.</li>';
    return;
  }
  list.innerHTML = sorted.map(([name, count], idx) => `
    <li>
      <span class="rank-badge">${idx + 1}</span>
      <span class="area-name">${esc(name)}</span>
      <span class="area-count">${count}</span>
    </li>`).join('');
}

function updateHeatmapAnalysis(data, filterWaktu, filterBulan) {
  const el = document.getElementById('heatmapAnalysis');
  if (!el) return;
  if (!data || data.length === 0) { el.textContent = 'Belum ada data untuk analisis heatmap.'; return; }
  const counts = {};
  data.forEach(r => {
    const key = (r.lokasi || '').trim();
    if (!key) return;
    counts[key] = (counts[key] || 0) + 1;
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  if (!sorted.length) { el.textContent = 'Belum ada lokasi untuk analisis heatmap.'; return; }
  const names  = sorted.map(([n, c]) => `${n} (${c})`);
  const period = [];
  if (filterWaktu) period.push(filterWaktu.toLowerCase());
  if (filterBulan) period.push(`bulan ${getMonthName(filterBulan)}`);
  const suffix = period.length ? ` (filter ${period.join(', ')})` : '';
  el.textContent = `Hotspot tertinggi${suffix}: ${names.join(', ')}.`;
}

function getMonthName(n) {
  const names = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  return names[parseInt(n, 10) - 1] || '';
}

// ============================================================
// EXPORT
// ============================================================
function exportGeoJSON() {
  const pts = reports.filter(r => r.lat && r.lng);
  if (!pts.length) { showToast('Tidak ada data koordinat.', 'error'); return; }
  const gj = {
    type: 'FeatureCollection',
    features: pts.map(r => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [r.lng, r.lat] },
      properties: {
        id: r.id, jenis_kelamin: r.kelamin, status: r.status,
        jenis_insiden: r.jenis, tanggal: r.tanggal, waktu: r.waktu, lokasi: r.lokasi,
        fakultas: r.fakultas || getFacultyFromLocationName(r.lokasi),
      }
    }))
  };
  dlFile(JSON.stringify(gj, null, 2), 'itsafe_heatmap.geojson', 'application/json');
  showToast('GeoJSON diunduh – siap buka di QGIS.', 'success');
}

function dlFile(content, filename, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = filename; a.click();
}

// ============================================================
// DEMO DATA (tetap ada untuk testing)
// ============================================================
function loadDemoData() {
  const demo = [
    { lat:-7.2756, lng:112.7951, jenis:'Verbal',      kelamin:'Perempuan', lokasi:'Kantin Pusat ITS',           tanggal:'10/03/2026', waktu:'Siang' },
    { lat:-7.2771, lng:112.7963, jenis:'Fisik',       kelamin:'Perempuan', lokasi:'Gedung Teknik Sipil',         tanggal:'22/03/2026', waktu:'Malam' },
    { lat:-7.2748, lng:112.7944, jenis:'Non-verbal',  kelamin:'Laki-laki', lokasi:'Perpustakaan ITS',            tanggal:'05/04/2026', waktu:'Pagi'  },
  ];
  demo.forEach((d, i) => reports.push({
    id: Date.now() + i, createdAt: new Date().toISOString(),
    kelamin: d.kelamin, jenis: d.jenis, tanggal: d.tanggal, waktu: d.waktu,
    lokasi: d.lokasi, lat: d.lat, lng: d.lng,
    fakultas: getFacultyFromLocationName(d.lokasi), isDemo: true,
  }));
  updateLayerCounts();
  if (leafletMap) renderLeafletMap();
  showToast('Data demo dimuat.', 'success');
}

function clearDemoData() {
  const before = reports.length;
  reports = reports.filter(r => !r.isDemo);
  const removed = before - reports.length;
  updateLayerCounts();
  if (leafletMap) renderLeafletMap();
  showToast(removed ? 'Data demo dihapus.' : 'Tidak ada data demo.', removed ? 'success' : 'error');
}

// ============================================================
// QR CODE
// ============================================================
let qrInstance = null;
function generateQR() {
  const cont = document.getElementById('qrCodeContainer');
  const url  = QR_URL;
  if (!cont) return;
  cont.innerHTML = '';
  try {
    qrInstance = new QRCode(cont, { text: url, width: 220, height: 220, colorDark:'#000', colorLight:'#fff', correctLevel: QRCode.CorrectLevel.H });
  } catch(e) {
    cont.innerHTML = `<div class="qr-placeholder-inner"><i class="fas fa-qrcode"></i><p>QR Code</p></div>`;
  }
  const d = document.getElementById('qrUrlDisplay');
  if (d) d.textContent = url;
}

// ============================================================
// LOCATION CARDS
// ============================================================
function gmapsLink(name) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ITS Surabaya')}`;
}

function renderLocationCards(filter) {
  const grid = document.getElementById('locationGrid');
  if (!grid) return;
  const list = filter === 'all' ? LOCATIONS : LOCATIONS.filter(l => l.status === filter);
  grid.innerHTML = list.map(loc => `
    <div class="location-card" data-status="${loc.status}">
      <div class="location-img-placeholder"><i class="fas ${loc.icon}"></i><span>Foto lokasi</span></div>
      <div class="location-body">
        <div class="location-name">${loc.name}</div>
        <div class="location-desc">${loc.desc}</div>
        <div class="location-meta">
          <span class="location-status status-${loc.status}">
            <i class="fas ${loc.status === 'terpasang' ? 'fa-circle-check' : 'fa-clock'}"></i>
            ${loc.status === 'terpasang' ? 'Terpasang' : 'Rencana'}
          </span>
          ${loc.count > 0 ? `<span class="location-count"><i class="fas fa-file-lines"></i> ${loc.count} laporan</span>` : ''}
        </div>
        <a href="${gmapsLink(loc.name)}" target="_blank" rel="noopener" class="location-gmaps-link"><i class="fas fa-map-location-dot"></i> Buka di Google Maps</a>
      </div>
    </div>`).join('');
}

function filterLocations(btn) {
  document.querySelectorAll('.loc-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderLocationCards(btn.dataset.filter);
}

// ============================================================
// TEAM
// ============================================================
function renderTeam() {
  const g = document.getElementById('teamGrid');
  if (!g) return;
  g.innerHTML = TEAM.map(m => `
    <div class="team-card">
      <div class="team-avatar">
        ${m.photo ? `<img src="${m.photo}" alt="Foto ${esc(m.name)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : ''}
        <div class="team-avatar-fallback" ${m.photo ? 'style="display:none"' : ''}>${m.initial}</div>
      </div>
      <div class="team-name">${m.name}</div>
      <div class="team-nrp">${m.nrp}</div>
    </div>`).join('');
}

// ============================================================
// HELPERS
// ============================================================
function normalizeTanggalInput(str) {
  const d = parseTanggal(str);
  if (!d || isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function parseTanggal(str) {
  if (!str) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return new Date(str + 'T00:00:00');
  const m = String(str).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  return new Date(`${m[3]}-${m[2]}-${m[1]}T00:00:00`);
}

function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast show ${type}`;
  clearTimeout(t._t);
  t._t = setTimeout(() => { t.className = 'toast'; }, 3500);
}

window.addEventListener('resize', () => {
  if (leafletMap) leafletMap.invalidateSize();
  if (pickerMap)  pickerMap.invalidateSize();
});
