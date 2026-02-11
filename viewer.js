// viewer.js - Tampilan publik, auto refresh 1 detik
const STORAGE_KEY = 'gameScoreData';

function loadData() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {
        players: ['Pemain 1', 'Pemain 2', 'Pemain 3', 'Pemain 4', 'Pemain 5'],
        scores: [0, 0, 0, 0, 0]
    };
}

// Hitung peringkat (dua tertinggi ditandai sebagai 'kalah' tanpa teks bahaya, cukup warna berbeda)
function renderViewer() {
    const data = loadData();
    const container = document.getElementById('viewerContent');
    
    // Gabungkan nama & skor, urutkan DESC
    const playersWithScore = data.players.map((name, i) => ({
        name: name,
        score: data.scores[i] || 0,
        index: i
    })).sort((a, b) => b.score - a.score); // tertinggi ke rendah

    // Dua tertinggi dianggap kalah (tanpa label, hanya gaya berbeda)
    const loserIndices = playersWithScore.slice(0, 2).map(p => p.index);
    
    container.innerHTML = '';
    
    // Urutkan berdasarkan indeks asli agar tampil urut pemain 1-5
    const sortedByIndex = [...data.players].map((name, i) => ({ name, score: data.scores[i] || 0, index: i }));
    
    sortedByIndex.forEach((player, idx) => {
        const isLoser = loserIndices.includes(player.index);
        const col = document.createElement('div');
        col.className = 'col-12 col-sm-6 col-md-4';
        
        // Card dengan gaya berbeda jika kalah (tanpa teks "kalah")
        col.innerHTML = `
            <div class="viewer-card d-flex justify-content-between align-items-center p-3" 
                 style="background: ${isLoser ? 'linear-gradient(145deg, #ffe7e7, #ffdbdb)' : 'linear-gradient(145deg, #ffffff, #f5f7ff)'}; border-left: ${isLoser ? '8px solid #dc3545' : '8px solid #4361ee'};">
                <span class="viewer-name">${player.name}</span>
                <span class="viewer-score" style="color: ${isLoser ? '#b91c1c' : '#0f172a'};">${player.score}</span>
            </div>
        `;
        container.appendChild(col);
    });
}

// Auto refresh tiap 1 detik
renderViewer();
setInterval(renderViewer, 1000);