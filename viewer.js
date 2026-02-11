// KUNCI LOCALSTORAGE (sama dengan admin)
const STORAGE_KEY = 'gameKartu5Pemain';

// Ambil data dari localStorage
function ambilData() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            return {
                namaPemain: ['', '', '', '', ''],
                skor: [0, 0, 0, 0, 0]
            };
        }
    }
    return {
        namaPemain: ['', '', '', '', ''],
        skor: [0, 0, 0, 0, 0]
    };
}

// Escape HTML
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Render tabel viewer
function renderViewer() {
    const data = ambilData();
    const tbody = document.getElementById('viewer-score-body');
    if (!tbody) return;

    let isEmpty = true;
    let html = '';

    for (let i = 0; i < 5; i++) {
        const nama = data.namaPemain[i];
        if (nama && nama.trim() !== '') {
            isEmpty = false;
            html += `<tr>
                        <td>${i+1}</td>
                        <td class="fw-bold">${escapeHtml(nama)}</td>
                        <td class="text-end display-skor">${data.skor[i]}</td>
                    </tr>`;
        } else {
            html += `<tr>
                        <td>${i+1}</td>
                        <td class="text-muted">(belum diisi)</td>
                        <td class="text-end">-</td>
                    </tr>`;
        }
    }

    if (isEmpty) {
        html = '<tr><td colspan="3" class="text-center">Menunggu admin input nama...</td></tr>';
    }

    tbody.innerHTML = html;
}

// Auto refresh tiap 1 detik
function autoRefresh() {
    renderViewer();
}

// Mulai
document.addEventListener('DOMContentLoaded', function() {
    renderViewer();
    setInterval(autoRefresh, 1000); // update tiap 1 detik
});
