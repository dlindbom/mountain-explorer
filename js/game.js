// Mountain Explorer - Startfil
// Ett 2D-klättringsspel byggt av Daniel och hans son

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

// Välkomstskärm
ctx.fillStyle = '#87CEEB';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Berg i bakgrunden
ctx.fillStyle = '#6B7B3A';
ctx.beginPath();
ctx.moveTo(200, 600);
ctx.lineTo(400, 150);
ctx.lineTo(600, 600);
ctx.fill();

// Snötäckt topp
ctx.fillStyle = '#FFFFFF';
ctx.beginPath();
ctx.moveTo(350, 250);
ctx.lineTo(400, 150);
ctx.lineTo(450, 250);
ctx.fill();

// Titel
ctx.fillStyle = '#1a1a2e';
ctx.font = 'bold 48px Arial';
ctx.textAlign = 'center';
ctx.fillText('Mountain Explorer', canvas.width / 2, 80);

ctx.font = '20px Arial';
ctx.fillText('Kommer snart...', canvas.width / 2, 500);
