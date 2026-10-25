// 1. ข้อมูลจำลองเริ่มต้นพร้อมพิกัดละติจูด/ลองจิจูด
const defaultReports = [
    {
        id: 1,
        location: 'ซอยรามคำแหง 24',
        lat: 13.7540,
        lng: 100.6150,
        depthText: 'ท่วมสูง 20-30 ซม. (ครึ่งล้อรถ)',
        depthLevel: 'red',
        passabilityText: 'รถเล็กห้ามผ่าน',
        timestamp: '25/10/2026 20:51',
        status: 'ยืนยันแล้ว',
        confidence: 'สูง'
    },
    {
        id: 2,
        location: 'ซอยลาดพร้าว 64',
        lat: 13.7890,
        lng: 100.5920,
        depthText: 'ท่วมขัง 5-10 ซม. (ขอบฟุตบาท)',
        depthLevel: 'yellow',
        passabilityText: 'รถเล็กควรชะลอตัว',
        timestamp: '25/10/2026 20:51',
        status: 'ยืนยันแล้ว',
        confidence: 'สูง'
    }
];

// 2. ฟังก์ชันจัดการ LocalStorage
function loadReportsFromStorage() {
    const savedData = localStorage.getItem('floodmate_reports');
    if (savedData) {
        try {
            return JSON.parse(savedData);
        } catch (e) {
            console.error('ไม่สามารถอ่านข้อมูลจาก LocalStorage ได้:', e);
            return defaultReports;
        }
    }
    return defaultReports;
}

function saveReportsToStorage(data) {
    localStorage.setItem('floodmate_reports', JSON.stringify(data));
}

let reportsData = loadReportsFromStorage();

// 3. เริ่มต้นระบบแผนที่ Leaflet.js
let map;
let mapMarkersGroup;

function initMap() {
    // กำหนดพิกัดเริ่มต้นกรุงเทพฯ
    map = L.map('map').setView([13.7650, 100.6000], 12);

    // ดึงแผนที่ OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapMarkersGroup = L.layerGroup().addTo(map);
    renderMapMarkers();
}

// 4. วาดปักหมุดและวงกลมรัศมีน้ำท่วมลงบนแผนที่
function renderMapMarkers() {
    if (!mapMarkersGroup) return;
    mapMarkersGroup.clearLayers();

    reportsData.forEach(item => {
        if (item.lat && item.lng) {
            const color = item.depthLevel === 'red' ? '#dc2626' : '#ca8a04';
            
            // วาดวงกลมรัศมีน้ำท่วม
            L.circle([item.lat, item.lng], {
                color: color,
                fillColor: color,
                fillOpacity: 0.35,
                radius: 400
            }).addTo(mapMarkersGroup);

            // ปักหมุด Marker
            L.marker([item.lat, item.lng])
                .addTo(mapMarkersGroup)
                .bindPopup(`
                    <div style="font-family: 'Sarabun', sans-serif;">
                        <strong>${item.location}</strong><br>
                        <small>ระดับน้ำ: ${item.depthText}</small><br>
                        <small>สถานะ: ${item.passabilityText}</small>
                    </div>
                `);
        }
    });
}

// 5. แสดงผลการ์ดรายงานใน Feed List
function renderFeed() {
    const feedList = document.getElementById('feedList');
    feedList.innerHTML = '';

    reportsData.forEach(item => {
        const cardHtml = `
            <div class="report-card">
                <div class="card-top">
                    <span class="location-name">${item.location}</span>
                    <span class="timestamp">${item.timestamp}</span>
                </div>
                <div class="badges-group">
                    <span class="badge-depth ${item.depthLevel}">${item.depthText}</span>
                    <span class="badge-pass">${item.passabilityText}</span>
                </div>
                <div class="card-footer-info">
                    <span>สถานะ: ${item.status}</span>
                    <span class="confidence-high">ความมั่นใจ: ${item.confidence}</span>
                </div>
            </div>
        `;
        feedList.insertAdjacentHTML('beforeend', cardHtml);
    });
}

// 6. ฟังก์ชันสุ่มพิกัดใกล้เคียงในกรุงเทพฯ สำหรับตำแหน่งใหม่ที่ผู้ใช้พิมพ์ส่งเข้ามา
function getRandomBangkokCoords() {
    // ละติจูด 13.72 - 13.80, ลองจิจูด 100.50 - 100.65
    const lat = 13.72 + (Math.random() * 0.08);
    const lng = 100.50 + (Math.random() * 0.15);
    return { lat, lng };
}

function getCurrentFormattedTime() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// 7. จัดการการส่งฟอร์มรายงานภาคสนาม
document.getElementById('reportForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const locationVal = document.getElementById('locationInput').value.trim();
    const depthSelect = document.getElementById('waterDepthSelect');
    const depthText = depthSelect.options[depthSelect.selectedIndex].text;
    const depthVal = depthSelect.value;

    const passSelect = document.getElementById('passabilitySelect');
    const passabilityText = passSelect.options[passSelect.selectedIndex].text;

    let depthLevel = (depthVal === '20-30' || depthVal === '30+') ? 'red' : 'yellow';
    const coords = getRandomBangkokCoords();

    const newReport = {
        id: Date.now(),
        location: locationVal,
        lat: coords.lat,
        lng: coords.lng,
        depthText: depthText,
        depthLevel: depthLevel,
        passabilityText: passabilityText,
        timestamp: getCurrentFormattedTime(),
        status: 'รอการยืนยัน',
        confidence: 'ปานกลาง'
    };

    reportsData.unshift(newReport);
    saveReportsToStorage(reportsData);

    renderFeed();
    renderMapMarkers();

    // เลื่อนแผนที่ไปยังพิกัดใหม่
    if (map) {
        map.flyTo([coords.lat, coords.lng], 13);
    }

    this.reset();
    alert(`ส่งข้อมูลเรียบร้อย! ปักหมุดที่ "${locationVal}" บนแผนที่และบันทึกลง LocalStorage แล้ว`);
});

// 8. ปุ่มรีเฟรช และ ปุ่มล้างข้อมูล
document.getElementById('refreshBtn').addEventListener('click', function() {
    reportsData = loadReportsFromStorage();
    renderFeed();
    renderMapMarkers();
});

document.getElementById('clearBtn').addEventListener('click', function() {
    if (confirm('คุณต้องการล้างข้อมูลรายงานที่บันทึกไว้ทั้งหมดใช่หรือไม่?')) {
        localStorage.removeItem('floodmate_reports');
        reportsData = [...defaultReports];
        renderFeed();
        renderMapMarkers();
        alert('ล้างข้อมูลเรียบร้อยแล้ว');
    }
});

// โหลดครั้งแรกเมื่อเปิดหน้า
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    renderFeed();
});
