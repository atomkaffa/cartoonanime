const express = require('express');
const path = require('path');

const app = express();
const port = 4000;

// เสิร์ฟไฟล์ static เช่น HTML, CSS, JS
app.use(express.static(path.join(__dirname)));

// เส้นทางหลัก (Home route)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// เริ่มเซิร์ฟเวอร์
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
