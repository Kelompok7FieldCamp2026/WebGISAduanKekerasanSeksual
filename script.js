/* ============================================================
   ITSafe – script.js
   localStorage + Leaflet (OSM / Satelit / Dark / Topo)
   Heatmap · Titik · Cluster · Basemap switcher
============================================================ */

// ─── STATE ──────────────────────────────────────────────────
let reports     = JSON.parse(localStorage.getItem('itsafeReports') || '[]');
let activeLayer = 'semua';
let visHeatmap  = true;
let visPoint    = false;
let visCluster  = false;

// ─── LEAFLET INSTANCES ──────────────────────────────────────
let leafletMap   = null;   // halaman Peta
let pickerMap    = null;   // mini picker di form
let pickerMarker = null;
let baseTile     = null;
let heatLayer    = null;
let pointLayer   = null;
let clusterLayer = null;
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

const INCIDENT_COLORS = {
  'Pelecehan Verbal':            '#FCD34D',
  'Pelecehan Non-verbal / Cyber':'#67E8F9',
  'Pelecehan Fisik':             '#FCA5A5',
  'Pemaksaan / Ancaman':         '#FB923C',
  'Pemerkosaan':                 '#FDA4AF',
  'Lainnya':                     '#A78BFA',
};

// ─── LOCATION DATA ──────────────────────────────────────────
const LOCATIONS = [
  { id:1,  name:'Perpustakaan Pusat ITS',         desc:'Area parkir dan lobi utama perpustakaan, zona keluar-masuk yang minim pengawasan.',    status:'terpasang', count:3,  icon:'fa-book-open'       },
  { id:2,  name:'Gedung Teknik Sipil (FTSP)',      desc:'Koridor lantai 2 dan area tangga belakang gedung.',                                    status:'terpasang', count:5,  icon:'fa-building-columns'},
  { id:3,  name:'Kantin Pusat (Food Court)',       desc:'Area sekitar kantin pusat, terutama pada jam-jam sepi.',                               status:'terpasang', count:2,  icon:'fa-utensils'        },
  { id:4,  name:'Asrama Mahasiswa Putra',          desc:'Koridor dan area parkir depan asrama putra ITS.',                                      status:'terpasang', count:4,  icon:'fa-house-user'      },
  { id:5,  name:'Asrama Mahasiswa Putri',          desc:'Pintu masuk utama dan taman asrama putri.',                                            status:'terpasang', count:4,  icon:'fa-house-user'      },
  { id:6,  name:'Laboratorium Kimia (FMIPA)',      desc:'Lorong penghubung antar laboratorium di gedung FMIPA.',                                status:'rencana',   count:1,  icon:'fa-flask'           },
  { id:7,  name:'Lapangan Olahraga / GOR',         desc:'Area tribun dan ruang ganti GOR ITS.',                                                 status:'rencana',   count:0,  icon:'fa-person-running'  },
  { id:8,  name:'Gedung Robotika (Teknik Elektro)',desc:'Basement dan area parkir motor gedung Teknik Elektro.',                                status:'rencana',   count:0,  icon:'fa-microchip'       },
  { id:9,  name:'Masjid Manarul Ilmi ITS',         desc:'Area wudhu dan parkir belakang masjid.',                                               status:'terpasang', count:1,  icon:'fa-mosque'          },
  { id:10, name:'Gedung Rektorat ITS',             desc:'Area lobby dan lorong menuju ruang tunggu layanan mahasiswa.',                         status:'rencana',   count:0,  icon:'fa-landmark'        },
  { id:11, name:'Co-working Space / Ruang Bersama',desc:'Area kerja bersama yang buka hingga larut malam.',                                     status:'terpasang', count:2,  icon:'fa-laptop'          },
  { id:12, name:'Area Parkir Timur',               desc:'Parkiran motor dan mobil bagian timur kampus, minim pencahayaan malam.',               status:'rencana',   count:0,  icon:'fa-square-parking'  },
];

const TEAM = [
  { name:'Nama Anggota 1', nrp:'5025XXXXXX', role:'Ketua Penelitian / GIS Analysis', initial:'A' },
  { name:'Nama Anggota 2', nrp:'5025XXXXXX', role:'Web Development',                 initial:'B' },
  { name:'Nama Anggota 3', nrp:'5025XXXXXX', role:'Data Collection & Survey',        initial:'C' },
  { name:'Nama Anggota 4', nrp:'5025XXXXXX', role:'Analisis Spasial QGIS',           initial:'D' },
  { name:'Nama Anggota 5', nrp:'5025XXXXXX', role:'Dokumentasi & Laporan',           initial:'E' },
  { name:'Nama Anggota 6', nrp:'5025XXXXXX', role:'Desain Komunikasi Visual',        initial:'F' },
];

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initForm();
  updateStats();
  updateLayerCounts();
  renderLocationCards('all');
  renderTeam();
  generateQR();
  initPickerMap();
});

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
  document.getElementById('tanggalInsiden').max = new Date().toISOString().split('T')[0];
}

function handleSubmit(e) {
  e.preventDefault();
  const required = ['jenisKelamin','statusKorban','jenisInsiden','tanggalInsiden','lokasiInsiden','kronologi'];
  let valid = true;
  required.forEach(id => {
    const el = document.getElementById(id);
    if (!el.value.trim()) { el.style.borderColor = '#E11D48'; valid = false; }
    else el.style.borderColor = '';
  });
  if (!document.getElementById('consent').checked) { showToast('⚠ Harap setujui pernyataan persetujuan.','error'); return; }
  if (!valid) { showToast('⚠ Harap lengkapi semua field wajib.','error'); return; }

  const lat = parseFloat(document.getElementById('lat').value);
  const lng = parseFloat(document.getElementById('lng').value);

  const report = {
    id:         Date.now(),
    createdAt:  new Date().toISOString(),
    kelamin:    document.getElementById('jenisKelamin').value,
    status:     document.getElementById('statusKorban').value,
    jenis:      document.getElementById('jenisInsiden').value,
    tanggal:    document.getElementById('tanggalInsiden').value,
    lokasi:     document.getElementById('lokasiInsiden').value.trim(),
    lat:        isNaN(lat) ? null : lat,
    lng:        isNaN(lng) ? null : lng,
    kronologi:  document.getElementById('kronologi').value.trim(),
    saksi:      document.getElementById('saksi').value.trim(),
    sudahLapor: document.getElementById('sudahLapor').value,
    kontak:     document.getElementById('kontakPelapor').value.trim(),
    verified:   false,
    catatan:    '',
  };

  reports.push(report);
  saveReports();
  updateStats();
  updateLayerCounts();
  e.target.reset();
  clearPin();
  showToast('✅ Laporan berhasil dikirim. Terima kasih.', 'success');
}

// ============================================================
// PICKER MAP (mini Leaflet di form)
// ============================================================
function initPickerMap() {
  if (pickerMap) return;
  pickerMap = L.map('pickerMap', { zoomControl: true }).setView(ITS, ZOOM);
  L.tileLayer(BASEMAPS.osm.url, { attribution: BASEMAPS.osm.attr }).addTo(pickerMap);

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
}

function renderLeafletMap() {
  if (!leafletMap) return;

  // Remove data layers (keep baseTile)
  if (heatLayer)    { leafletMap.removeLayer(heatLayer);    heatLayer = null; }
  if (pointLayer)   { leafletMap.removeLayer(pointLayer);   pointLayer = null; }
  if (clusterLayer) { leafletMap.removeLayer(clusterLayer); clusterLayer = null; }

  const filterBulan = document.getElementById('filterBulan')?.value || '';

  let data = reports.filter(r => r.lat && r.lng);
  if (activeLayer !== 'semua') {
    data = data.filter(r => r.kelamin === activeLayer || r.jenis === activeLayer);
  }
  if (filterBulan) {
    data = data.filter(r => (new Date(r.tanggal).getMonth() + 1) === parseInt(filterBulan));
  }

  const overlay = document.getElementById('mapOverlay');
  overlay.style.display = data.length === 0 ? 'flex' : 'none';
  if (!data.length) return;

  // HEATMAP
  if (visHeatmap && L.heatLayer) {
    heatLayer = L.heatLayer(
      data.map(r => [r.lat, r.lng, 1]),
      { radius: 35, blur: 22, maxZoom: 18, gradient: { 0.1:'#3B82F6', 0.4:'#7C3AED', 0.7:'#F59E0B', 1.0:'#E11D48' } }
    ).addTo(leafletMap);
  }

  // POINTS
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

  // CLUSTER
  if (visCluster && L.markerClusterGroup) {
    clusterLayer = L.markerClusterGroup({ chunkedLoading: true });
    data.forEach(r => {
      const color = INCIDENT_COLORS[r.jenis] || '#A78BFA';
      L.circleMarker([r.lat, r.lng], {
        radius: 8, fillColor: color, color: '#fff', weight: 2, fillOpacity: .9
      }).bindPopup(buildPopup(r)).addTo(clusterLayer);
    });
    leafletMap.addLayer(clusterLayer);
  }
}

function buildPopup(r) {
  return `<div style="font-family:'DM Sans',sans-serif;min-width:175px;font-size:.85rem">
    <strong style="color:#E11D48">${r.jenis}</strong><br/>
    <span style="color:#555">${esc(r.lokasi)}</span>
    <hr style="margin:.35rem 0;border:none;border-top:1px solid #eee"/>
    <span>Kelamin: ${r.kelamin}</span><br/>
    <span>Tanggal: ${r.tanggal}</span>
  </div>`;
}

// Basemap switcher
function switchBasemap(btn) {
  const bm = btn.dataset.bm;
  currentBm = bm;
  document.querySelectorAll('.bm-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  if (!leafletMap) return;

  // Remove old base tile
  leafletMap.eachLayer(l => { if (l === baseTile) leafletMap.removeLayer(l); });
  const cfg = BASEMAPS[bm];
  baseTile = L.tileLayer(cfg.url, { attribution: cfg.attr, ...cfg.opt }).addTo(leafletMap);
  baseTile.bringToBack();
}

// Layer filter
function switchLayer(radio) {
  activeLayer = radio.value;
  document.querySelectorAll('.layer-card').forEach(c => c.classList.toggle('active', c.dataset.layer === activeLayer));
  const el = document.getElementById('activeLayerName');
  if (el) el.textContent = activeLayer === 'semua' ? 'Semua Insiden' : activeLayer;
  renderLeafletMap();
}

// Vis toggles
function toggleVis(type, cb) {
  if (type === 'heatmap') visHeatmap = cb.checked;
  if (type === 'point')   visPoint   = cb.checked;
  if (type === 'cluster') visCluster = cb.checked;
  document.getElementById('tog-' + type)?.classList.toggle('active', cb.checked);
  renderLeafletMap();
}

// ============================================================
// STATS
// ============================================================
function updateStats() {
  const now   = new Date();
  const month = now.getMonth(), year = now.getFullYear();
  document.getElementById('totalLaporan').textContent   = reports.length;
  document.getElementById('terverifikasi').textContent  = reports.filter(r => r.verified).length;
  document.getElementById('bulanIni').textContent       = reports.filter(r => {
    const d = new Date(r.createdAt);
    return d.getMonth() === month && d.getFullYear() === year;
  }).length;
}

function updateLayerCounts() {
  const set = (id, n) => { const el = document.getElementById(id); if (el) el.textContent = n; };
  set('cnt-semua',    reports.length);
  set('cnt-laki',     reports.filter(r => r.kelamin === 'Laki-laki').length);
  set('cnt-perempuan',reports.filter(r => r.kelamin === 'Perempuan').length);
  set('cnt-verbal',   reports.filter(r => r.jenis === 'Pelecehan Verbal').length);
  set('cnt-nonverbal',reports.filter(r => r.jenis === 'Pelecehan Non-verbal / Cyber').length);
  set('cnt-fisik',    reports.filter(r => r.jenis === 'Pelecehan Fisik').length);
  set('cnt-pemaksaan',reports.filter(r => r.jenis === 'Pemaksaan / Ancaman').length);
  set('cnt-perkosaan',reports.filter(r => r.jenis === 'Pemerkosaan').length);
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
        jenis_insiden: r.jenis, tanggal: r.tanggal, lokasi: r.lokasi,
        sudah_lapor: r.sudahLapor, created_at: r.createdAt
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
// DEMO DATA
// ============================================================
function loadDemoData() {
  const demo = [
    { lat:-7.2756, lng:112.7951, jenis:'Pelecehan Verbal',            kelamin:'Perempuan', lokasi:'Kantin Pusat ITS',           tanggal:'2025-03-10' },
    { lat:-7.2771, lng:112.7963, jenis:'Pelecehan Fisik',              kelamin:'Perempuan', lokasi:'Gedung Teknik Sipil',         tanggal:'2025-03-22' },
    { lat:-7.2748, lng:112.7944, jenis:'Pelecehan Non-verbal / Cyber', kelamin:'Laki-laki', lokasi:'Perpustakaan ITS',            tanggal:'2025-04-05' },
    { lat:-7.2762, lng:112.7978, jenis:'Pemaksaan / Ancaman',          kelamin:'Perempuan', lokasi:'Parkiran Timur',              tanggal:'2025-04-18' },
    { lat:-7.2735, lng:112.7938, jenis:'Pelecehan Verbal',             kelamin:'Laki-laki', lokasi:'Asrama Mahasiswa',            tanggal:'2025-05-02' },
    { lat:-7.2780, lng:112.7969, jenis:'Pelecehan Fisik',              kelamin:'Perempuan', lokasi:'Laboratorium Kimia',          tanggal:'2025-05-14' },
    { lat:-7.2753, lng:112.7985, jenis:'Lainnya',                      kelamin:'Perempuan', lokasi:'Lapangan Futsal',             tanggal:'2025-05-28' },
    { lat:-7.2769, lng:112.7930, jenis:'Pelecehan Verbal',             kelamin:'Perempuan', lokasi:'Gedung Rektorat',             tanggal:'2025-06-03' },
    { lat:-7.2758, lng:112.7958, jenis:'Pemerkosaan',                  kelamin:'Perempuan', lokasi:'Gedung D3 – Tangga Belakang', tanggal:'2025-02-14' },
    { lat:-7.2774, lng:112.7947, jenis:'Pelecehan Non-verbal / Cyber', kelamin:'Laki-laki', lokasi:'Co-working Space',            tanggal:'2025-06-20' },
  ];
  demo.forEach((d, i) => reports.push({
    id: Date.now() + i, createdAt: new Date(Date.now() - i * 86400000 * 3).toISOString(),
    kelamin: d.kelamin, status: 'Mahasiswa S1', jenis: d.jenis, tanggal: d.tanggal,
    lokasi: d.lokasi, lat: d.lat, lng: d.lng,
    kronologi: 'Data demonstrasi.', saksi: '', sudahLapor: 'Belum', kontak: '', verified: false, catatan: ''
  }));
  saveReports();
  updateStats();
  updateLayerCounts();
  if (leafletMap) renderLeafletMap();
  showToast('Data demo dimuat.', 'success');
}

// ============================================================
// QR CODE
// ============================================================
let qrInstance = null;
function generateQR() {
  const cont = document.getElementById('qrCodeContainer');
  const url  = document.getElementById('qrUrl')?.value || 'https://itsafe.its.ac.id/lapor';
  const size = parseInt(document.getElementById('qrSize')?.value || '200');
  if (!cont) return;
  cont.innerHTML = '';
  try {
    qrInstance = new QRCode(cont, { text: url, width: size, height: size, colorDark:'#000', colorLight:'#fff', correctLevel: QRCode.CorrectLevel.H });
  } catch(e) {
    cont.innerHTML = `<div class="qr-placeholder-inner"><i class="fas fa-qrcode"></i><p>QR Code</p></div>`;
  }
  const d = document.getElementById('qrUrlDisplay');
  if (d) d.textContent = url;
}

function downloadQR() {
  const img = document.querySelector('#qrCodeContainer img') || document.querySelector('#qrCodeContainer canvas');
  if (!img) { showToast('Generate QR terlebih dahulu.', 'error'); return; }
  const canvas = document.createElement('canvas');
  canvas.width = 340; canvas.height = 380;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 340, 380);
  const src = img.tagName === 'IMG' ? img.src : img.toDataURL();
  const qrImg = new Image();
  qrImg.onload = () => {
    ctx.drawImage(qrImg, 20, 20, 300, 300);
    ctx.fillStyle = '#E11D48'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('ITSafe – Pengaduan Anonim', 170, 345);
    ctx.fillStyle = '#888'; ctx.font = '11px sans-serif';
    ctx.fillText(document.getElementById('qrUrl')?.value?.substring(0,45) || '', 170, 365);
    canvas.toBlob(blob => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'itsafe-qr.png'; a.click(); });
  };
  qrImg.src = src;
  showToast('QR Code diunduh.', 'success');
}

function printStickerSheet() {
  const img   = document.querySelector('#qrCodeContainer img') || document.querySelector('#qrCodeContainer canvas');
  const url   = document.getElementById('qrUrl')?.value || 'https://itsafe.its.ac.id/lapor';
  const label = document.getElementById('qrLabel')?.value || 'Kampus ITS Surabaya';
  const grid  = document.getElementById('stickerGridPrint');
  const area  = document.getElementById('stickerPrintArea');
  if (!grid || !area) return;
  let imgSrc = img ? (img.tagName === 'IMG' ? img.src : img.toDataURL()) : '';
  grid.innerHTML = '';
  for (let i = 0; i < 4; i++) {
    const item = document.createElement('div');
    item.className = 'sticker-item';
    item.innerHTML = `${imgSrc ? `<img src="${imgSrc}" width="120" height="120" alt="QR"/>` : ''}
      <div class="sticker-item-label">${esc(label)}</div>
      <div class="sticker-item-url">${esc(url)}</div>
      <div style="font-size:6pt;color:#bbb;margin-top:3px">Scan untuk lapor kekerasan seksual secara anonim</div>`;
    grid.appendChild(item);
  }
  area.style.display = 'flex';
  window.print();
  setTimeout(() => { area.style.display = 'none'; }, 2000);
}

// ============================================================
// LOCATION CARDS
// ============================================================
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
      <div class="team-avatar"><div class="team-avatar-fallback">${m.initial}</div></div>
      <div class="team-name">${m.name}</div>
      <div class="team-nrp">${m.nrp}</div>
      <div class="team-role">${m.role}</div>
    </div>`).join('');
}

// ============================================================
// HELPERS
// ============================================================
function saveReports() { localStorage.setItem('itsafeReports', JSON.stringify(reports)); }

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