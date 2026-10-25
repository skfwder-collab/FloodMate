const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Mock Data ข้อมูลระดับน้ำรายซอยเรียลไทม์
const floodData = [
  {
    id: 'SOI-001',
    soiName: 'ซอยสุขุมวิท 21 (อโศกมนตรี)',
    district: 'วัฒนา',
    waterDepthCm: 28,
    trend: 'rising',
    trendRateCmHour: +4,
    passableVehicles: { motorcycle: false, sedan: false, suv: true },
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
    passableVehicles: { motorcycle: true, sedan: true, suv: true },
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
    passableVehicles: { motorcycle: false, sedan: false, suv: false },
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
    passableVehicles: { motorcycle: true, sedan: true, suv: true },
    confidenceScore: 90,
    lastUpdated: '12 นาทีที่แล้ว',
    moveCarAlert: false,
    alertMessage: 'ระดับน้ำลดลงเรื่อยๆ การจราจรคล่องตัว'
  }
];

// API Endpoint สำหรับดึงข้อมูลระดับน้ำ
app.get('/api/flood-data', (req, res) => {
  res.json({ success: true, timestamp: new Date().toISOString(), data: floodData });
});

// Single Page Web Dashboard
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FloodMate - เรดาร์น้ำท่วมระดับซอย</title>
    <link href="[suspicious link removed]" rel="stylesheet">
    <link rel="stylesheet" href="[suspicious link removed]">
    <style>
        body { background-color: #f0f4f8; font-family: 'Segoe UI', Tahoma, sans-serif; }
        .hero-banner { background: linear-gradient(135deg, #0d6efd 0%, #003b95 100%); color: white; padding: 2rem 0; }
        .card-flood { border-radius: 16px; border: none; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
        .depth-pill { font-size: 1.4rem; font-weight: 700; padding: 0.2em 0.6em; border-radius: 12px; }
        .depth-high { background-color: #ffe5e5; color: #dc3545; }
        .depth-mid { background-color: #fff3cd; color: #856404; }
        .depth-low { background-color: #d1e7dd; color: #0f5132; }
    </style>
</head>
<body>
    <div class="hero-banner text-center">
        <div class="container">
            <h1 class="fw-bold"><i class="bi bi-radar"></i> FloodMate</h1>
            <p class="mb-0">เรดาร์เตือนภัยและวัดระดับน้ำท่วมระดับซอย เรียลไทม์</p>
        </div>
    </div>
    <div class="container my-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold m-0"><i class="bi bi-geo-alt-fill text-primary"></i> สถานะระดับน้ำรายซอย</h5>
            <small class="text-muted" id="lastSync"></small>
        </div>
        <div class="row g-3" id="floodGrid"></div>
    </div>
    <script>
        async function loadData() {
            const res = await fetch('/api/flood-data');
            const { data } = await res.json();
            document.getElementById('lastSync').innerText = 'อัปเดตเมื่อ: ' + new Date().toLocaleTimeString('th-TH');
            const grid = document.getElementById('floodGrid');
            grid.innerHTML = data.map(item => {
                let depthClass = item.waterDepthCm >= 30 ? 'depth-high' : item.waterDepthCm >= 15 ? 'depth-mid' : 'depth-low';
                return \`
                    <div class="col-md-6">
                        <div class="card card-flood p-3">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <h5 class="fw-bold mb-1">\${item.soiName}</h5>
                                    <small class="text-muted">เขต\${item.district} • \${item.lastUpdated}</small>
                                </div>
                                <span class="depth-pill \${depthClass}">\${item.waterDepthCm} cm</span>
                            </div>
                            <div class="mb-2">
                                <span class="badge bg-light text-dark border">ความน่าเชื่อถือ \${item.confidenceScore}%</span>
                            </div>
                            <div class="alert \${item.moveCarAlert ? 'alert-danger' : 'alert-success'} p-2 small m-0">
                                \${item.alertMessage}
                            </div>
                        </div>
                    </div>
                \`;
            }).join('');
        }
        loadData();
    </script>
</body>
</html>
  `);
});

app.listen(PORT, () => {
  console.log(`🚀 FloodMate Dashboard running at http://localhost:${PORT}`);
});