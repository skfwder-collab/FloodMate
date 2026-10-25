// ข้อมูลสถานการณ์จำลองเริ่มต้น
let reportsData = [
    {
        id: 1,
        location: 'ซอยรามคำแหง 24',
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
        depthText: 'ท่วมขัง 5-10 ซม. (ขอบฟุตบาท)',
        depthLevel: 'yellow',
        passabilityText: 'รถเล็กควรชะลอตัว',
        timestamp: '25/10/2026 20:51',
        status: 'ยืนยันแล้ว',
        confidence: 'สูง'
    }
];

// เรนเดอร์การ์ดรายงานสถานการณ์ลงใน Feed
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

// สร้างเวลาปัจจุบัน
function getCurrentFormattedTime() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// รับข้อมูลจากฟอร์มส่งรายงานภาคสนาม
document.getElementById('reportForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const locationVal = document.getElementById('locationInput').value.trim();
    const depthSelect = document.getElementById('waterDepthSelect');
    const depthText = depthSelect.options[depthSelect.selectedIndex].text;
    const depthVal = depthSelect.value;

    const passSelect = document.getElementById('passabilitySelect');
    const passabilityText = passSelect.options[passSelect.selectedIndex].text;

    let depthLevel = (depthVal === '20-30' || depthVal === '30+') ? 'red' : 'yellow';

    const newReport = {
        id: Date.now(),
        location: locationVal,
        depthText: depthText,
        depthLevel: depthLevel,
        passabilityText: passabilityText,
        timestamp: getCurrentFormattedTime(),
        status: 'รอการยืนยัน',
        confidence: 'ปานกลาง'
    };

    reportsData.unshift(newReport);
    renderFeed();
    this.reset();
    alert('ส่งข้อมูลยืนยันสถานะภาคสนามเรียบร้อยแล้ว!');
});

// ปุ่มรีเฟรช
document.getElementById('refreshBtn').addEventListener('click', function() {
    renderFeed();
});

// โหลดข้อมูลเมื่อเปิดหน้าเว็บ
document.addEventListener('DOMContentLoaded', renderFeed);