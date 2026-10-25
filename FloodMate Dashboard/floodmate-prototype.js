const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Mock Data: ข้อมูลระดับน้ำระดับซอยเรียลไทม์สำหรับ FloodMate
const floodData = [
  {
    id: 'SOI-001',
    soiName: 'ซอยสุขุมวิท 21 (อโศกมนตรี)',
    district: 'วัฒนา',
    waterDepthCm: 28,
    trend: 'rising', // rising, falling, stable
    trendRateCmHour: +4,
    passableVehicles: {
      motorcycle: false,
      sedan: false,
      suv: true,
      truck: true
    },
    confidenceScore: 94,
    lastUpdated: '10 นาทีที่แล้ว',
    moveCarAlert: true,
    alertMessage: '⚠️ น้ำเพิ่มขึ้นเร็ว แนะนำย้ายรถขึ้นที่สูงภายใน 45 นาที'
  },
  {
    id: 'SOI-002',
    soiName: 'ซอยทองหล่อ 10',
    district: 'วัฒนา',
    waterDepthCm: 12,
    trend: 'stable',
    trendRateCmHour: 0,
    passableVehicles: {
      motorcycle: true,
      sedan: true,
      suv: true,
      truck: true
    },
    confidenceScore: 88,
    lastUpdated: '5 นาทีที่แล้ว',
    moveCarAlert: false,
    alertMessage: 'สภาวะเฝ้าระวัง รถทุกประเภทผ่านได้'
  },
  {
    id: 'SOI-003',
    soiName: 'ซอยลาดพร้าว 64',
    district: 'วังทองหลาง',
    waterDepthCm: 45,
    trend: 'rising',
    trendRateCmHour: +6,
    passableVehicles: {
      motorcycle: false,
      sedan: false,
      suv: false,
      truck: true
    },
    confidenceScore: 96,
    lastUpdated: '2 นาทีที่แล้ว',
    moveCarAlert: true,
    alertMessage: '🚨 น้ำท่วมสูง รถเล็กห้ามผ่าน ย้ายรถออกจากพื้นที่ทันที'
  },
  {
    id: 'SOI-004',
    soiName: 'ซอยวิภาวดีรังสิต 60',
    district: 'หลักสี่',
    waterDepthCm: 5,
    trend: 'falling',
    trendRateCmHour: -3,
    passableVehicles: {
      motorcycle: true,
      sedan: true,
      suv: true,
      truck: true
    },
    confidenceScore: 90,
    lastUpdated: '12 นาทีที่แล้ว',
    moveCarAlert: false,
    alertMessage: 'ระดับน้ำลดลงเรื่อยๆ การจราจรคล่องตัว'
  }
];

// API Endpoints
app.get('/api/flood-data', (req, res) => {
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    totalLocations: floodData.length,
    data: floodData
  });
});

app.get('/api/flood-data/:id', (req, res) => {
  const location = floodData.find(item => item.id === req.params.id);
  if (!location) {
    return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลซอยนี้' });
  }
  res.json({ success: true, data: location });
});

// Serve Single Page Dashboard UI
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FloodMate - เรดาร์น้ำท่วมระดับซอย</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
    <style>
        body { background-color: #f0f4f8; font-family: 'Sarabun', 'Segoe UI', Tahoma, sans-serif; }
        .hero-banner { background: linear-gradient(135deg, #0d6efd 0%, #003b95 100%); color: white; padding: 2.5rem 0; }
        .card-flood { border-radius: 16px; border: none; box-shadow: 0 4px 12px rgba(0,0,0,0.06); transition: transform 0.2s; }
        .card-flood:hover { transform: translateY(-4px); }
        .badge-vehicle { font-size: 0.8rem; padding: 0.4em 0.8em; margin-right: 4px; border-radius: 20px; }
        .depth-pill { font-size: 1.5rem; font-weight: 700; padding: 0.2em 0.6em; border-radius: 12px; }
        .depth-high { background-color: #ffe5e5; color: #dc3545; }
        .depth-mid { background-color: #fff3cd; color: #856404; }
        .depth-low { background-color: #d1e7dd; color: #0f5132; }
        .confidence-badge { font-size: 0.75rem; background-color: #e9ecef; color: #495057; border-radius: 8px; padding: 3px 8px; }
    </style>
</head>
<body>
    <div class="hero-banner text-center">
        <div class="container">
            <h1 class="fw-bold"><i class="bi bi-radar"></i> FloodMate</h1>
            <p class="lead mb-0">เรดาร์เตือนภัยและวัดระดับน้ำท่วมระดับซอย เรียลไทม์</p>
        </div>
    </div>

    <div class="container my-4">
        <!-- Banner แจ้งเตือนฉุกเฉิน -->
        <div id="alertBox" class="alert alert-warning border-0 shadow-sm rounded-4 d-flex align-items-center mb-4" role="alert">
            <i class="bi bi-exclamation-triangle-fill fs-3 me-3 text-warning"></i>
            <div>
                <strong>ระบบเตือนภัยย้ายรถ (Move-Your-Car Alert):</strong> ตรวจพบระดับน้ำเพิ่มขึ้นรวดเร็วใน 2 ซอยเสี่ยง
            </div>
        </div>

        <!-- หัวข้อและการค้นหา -->
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h4 class="fw-bold m-0"><i class="bi bi-geo-alt-fill text-primary"></i> สถานะน้ำท่วมรายซอย</h4>
            <span class="text-muted fs-6" id="lastSyncTime">กำลังอัปเดตข้อมูล...</span>
        </div>

        <!-- รายการซอย -->
        <div class="row g-3" id="floodGrid">
            <!-- Cards จะถูกโหลดผ่าน JavaScript -->
        </div>
    </div>

    <script>
        async function fetchFloodData() {
            try {
                const response = await fetch('/api/flood-data');
                const result = await response.json();
                
                document.getElementById('lastSyncTime').innerText = 'อัปเดตล่าสุด: ' + new Date().toLocaleTimeString('th-TH');
                
                const grid = document.getElementById('floodGrid');
                grid.innerHTML = '';

                result.data.forEach(item => {
                    let depthClass = 'depth-low';
                    if (item.waterDepthCm >= 30) depthClass = 'depth-high';
                    else if (item.waterDepthCm >= 15) depthClass = 'depth-mid';

                    let trendIcon = item.trend === 'rising' ? '<i class="bi bi-arrow-up-circle-fill text-danger"></i> +' + item.trendRateCmHour + ' cm/ชม.' :
                                    item.trend === 'falling' ? '<i class="bi bi-arrow-down-circle-fill text-success"></i> -' + Math.abs(item.trendRateCmHour) + ' cm/ชม.' :
                                    '<i class="bi bi-dash-circle-fill text-secondary"></i> คงที่';

                    const cardHtml = \`
                        <div class="col-md-6 col-lg-6">
                            <div class="card card-flood p-3">
                                <div class="d-flex justify-content-between align-items-start mb-2">
                                    <div>
                                        <h5 class="fw-bold mb-1">\${item.soiName}</h5>
                                        <span class="text-muted small">เขต\${item.district} • \${item.lastUpdated}</span>
                                    </div>
                                    <span class="depth-pill \${depthClass}">\${item.waterDepthCm} cm</span>
                                </div>

                                <div class="mb-3">
                                    <small class="text-muted">แนวโน้ม: </small>\${trendIcon}
                                    <span class="confidence-badge ms-2"><i class="bi bi-shield-check text-primary"></i> ความน่าเชื่อถือ \${item.confidenceScore}%</span>
                                </div>

                                <div class="mb-3">
                                    <small class="text-muted d-block mb-1">การสัญจรของยานพาหนะ:</small>
                                    <span class="badge badge-vehicle \${item.passableVehicles.motorcycle ? 'bg-success' : 'bg-danger'}">
                                        <i class="bi bi-bicycle"></i> มอเตอร์ไซค์ \${item.passableVehicles.motorcycle ? 'ผ่านได้' : 'ห้ามผ่าน'}
                                    </span>
                                    <span class="badge badge-vehicle \${item.passableVehicles.sedan ? 'bg-success' : 'bg-danger'}">
                                        <i class="bi bi-car-front"></i> เก๋ง \${item.passableVehicles.sedan ? 'ผ่านได้' : 'ห้ามผ่าน'}
                                    </span>
                                    <span class="badge badge-vehicle \${item.passableVehicles.suv ? 'bg-success' : 'bg-success'}">
                                        <i class="bi bi-truck-front"></i> SUV/กระบะ ผ่านได้
                                    </span>
                                </div>

                                \${item.moveCarAlert ? \`
                                    <div class="alert alert-danger p-2 mb-0 small rounded-3">
                                        <i class="bi bi-bell-fill"></i> \${item.alertMessage}
                                    </div>
                                \` : \`
                                    <div class="alert alert-light p-2 mb-0 small rounded-3 text-secondary">
                                        <i class="bi bi-info-circle"></i> \${item.alertMessage}
                                    </div>
                                \`}
                            </div>
                        </div>
                    \`;
                    grid.innerHTML += cardHtml;
                });
            } catch (err) {
                console.error('Error loading flood data:', err);
            }
        }

        fetchFloodData();
        setInterval(fetchFloodData, 30000); // Re-fetch every 30 seconds
    </script>
</body>
</html>
  `);
});

app.listen(PORT, () => {
  console.log(\`FloodMate Prototype Server running on http://localhost:\${PORT}\`);
});
