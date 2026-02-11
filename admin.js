// KUNCI LOCALSTORAGE
const STORAGE_KEY = 'gameKartu5Pemain';

// STATE DEFAULT
const defaultState = {
    namaPemain: ['', '', '', '', ''],     // 5 nama
    skor: [0, 0, 0, 0, 0]               // skor akumulasi
};

// UTILITY: Ambil data dari localStorage
function ambilData() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            return JSON.parse(JSON.stringify(defaultState));
        }
    }
    return JSON.parse(JSON.stringify(defaultState));
}

// UTILITY: Simpan data ke localStorage
function simpanData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// GLOBAL: render ulang form nama, nilai, dan tabel
function renderSemua() {
    renderFormNama();
    renderFormNilai();
    renderTabelSkorAdmin();
    cekVisibilitasForm();
}

// Render 5 input nama, isi dari localStorage
function renderFormNama() {
    const data = ambilData();
    const grid = document.getElementById('nama-input-grid');
    if (!grid) return;
    
    let html = '';
    for (let i = 0; i < 5; i++) {
        html += `
            <div class="input-group-custom">
                <label for="nama${i}">Pemain ${i + 1}</label>
                <input type="text" id="nama${i}" class="form-control form-control-lg" placeholder="Nama pemain ${i + 1}" value="${escapeHtml(data.namaPemain[i] || '')}" ${data.namaPemain[i] ? 'disabled' : ''}>
            </div>
        `;
    }
    grid.innerHTML = html;
}

// Render 5 input nilai (aktif hanya jika semua nama sudah terisi)
function renderFormNilai() {
    const data = ambilData();
    const grid = document.getElementById('nilai-input-grid');
    if (!grid) return;
    
    let html = '';
    for (let i = 0; i < 5; i++) {
        const nama = data.namaPemain[i] || `Pemain ${i+1}`;
        html += `
            <div class="input-group-custom">
                <label for="nilai${i}">${escapeHtml(nama)}</label>
                <input type="number" id="nilai${i}" class="form-control form-control-lg" placeholder="Sisa kartu" inputmode="numeric" autocomplete="off">
            </div>
        `;
    }
    grid.innerHTML = html;
}

// Escape HTML untuk keamanan
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Tampilkan skor akumulasi di tabel admin
function renderTabelSkorAdmin() {
    const data = ambilData();
    const tbody = document.getElementById('admin-score-body');
    if (!tbody) return;

    let isEmpty = true;
    let html = '';
    for (let i = 0; i < 5; i++) {
        const nama = data.namaPemain[i];
        if (nama && nama.trim() !== '') {
            isEmpty = false;
            html += `<tr>
                        <td>${i+1}</td>
                        <td>${escapeHtml(nama)}</td>
                        <td class="text-end fw-bold">${data.skor[i]}</td>
                    </tr>`;
        } else {
            html += `<tr>
                        <td>${i+1}</td>
                        <td class="text-muted">(kosong)</td>
                        <td class="text-end">-</td>
                    </tr>`;
        }
    }
    if (isEmpty) html = '<tr><td colspan="3" class="text-center">Belum ada nama pemain</td></tr>';
    tbody.innerHTML = html;
}

// Cek apakah semua nama sudah terisi -> sembunyikan form nama, munculkan form nilai
function cekVisibilitasForm() {
    const data = ambilData();
    const semuaTerisi = data.namaPemain.every(nama => nama && nama.trim() !== '');
    
    const formNama = document.getElementById('form-nama-container');
    const formNilai = document.getElementById('form-nilai-container');
    
    if (semuaTerisi) {
        formNama.classList.add('d-none');
        formNilai.classList.remove('d-none');
        // Fokus ke input nilai pertama
        setTimeout(() => {
            const firstInput = document.getElementById('nilai0');
            if (firstInput) firstInput.focus();
        }, 100);
    } else {
        formNama.classList.remove('d-none');
        formNilai.classList.add('d-none');
    }
}

// Simpan nama dari input ke localStorage
function simpanNama() {
    const data = ambilData();
    let adaPerubahan = false;
    for (let i = 0; i < 5; i++) {
        const input = document.getElementById(`nama${i}`);
        if (input && !input.disabled) {
            const val = input.value.trim();
            if (val !== '') {
                data.namaPemain[i] = val;
                adaPerubahan = true;
            }
        }
    }
    if (adaPerubahan) {
        simpanData(data);
        renderSemua();
    } else {
        alert('Isi minimal satu nama!');
    }
}

// Tambah nilai ke skor (akumulasi)
function tambahNilai() {
    const data = ambilData();
    // Validasi: pastikan semua nama terisi
    if (!data.namaPemain.every(n => n && n.trim() !== '')) {
        alert('Nama pemain belum lengkap. Silakan isi nama dulu.');
        return;
    }

    let adaInput = false;
    for (let i = 0; i < 5; i++) {
        const input = document.getElementById(`nilai${i}`);
        if (input) {
            const val = input.value.trim();
            if (val !== '') {
                const angka = parseInt(val, 10);
                if (!isNaN(angka)) {
                    data.skor[i] = (data.skor[i] || 0) + angka;
                    adaInput = true;
                }
            }
            input.value = ''; // kosongkan input
        }
    }

    if (adaInput) {
        simpanData(data);
        renderTabelSkorAdmin();
        // Fokus ke input pertama lagi
        document.getElementById('nilai0')?.focus();
    } else {
        alert('Masukkan minimal satu nilai!');
    }
}

// Reset nama pemain (dari menu)
function resetNama() {
    if (confirm('Reset nama pemain? Semua nama akan dihapus.')) {
        const data = ambilData();
        data.namaPemain = ['', '', '', '', ''];
        data.skor = [0, 0, 0, 0, 0]; // ikut reset skor sesuai permintaan? biasanya reset nama reset skor juga
        simpanData(data);
        renderSemua();
        // Tutup offcanvas
        bootstrap.Offcanvas.getInstance(document.getElementById('offcanvasMenu'))?.hide();
    }
}

// Reset skor saja (tanpa reset nama)
function resetSkor() {
    if (confirm('Reset semua skor ke 0?')) {
        const data = ambilData();
        data.skor = [0, 0, 0, 0, 0];
        simpanData(data);
        renderTabelSkorAdmin();
        bootstrap.Offcanvas.getInstance(document.getElementById('offcanvasMenu'))?.hide();
    }
}

// Inisialisasi event listener
function initAdmin() {
    renderSemua();

    // Simpan Nama
    document.getElementById('simpan-nama-btn').addEventListener('click', simpanNama);

    // Simpan Nilai
    document.getElementById('simpan-nilai-btn').addEventListener('click', tambahNilai);

    // Enter pindah input berikutnya (untuk input nilai)
    document.addEventListener('keydown', function(e) {
        if (e.target.matches('input[type="number"]') && e.key === 'Enter') {
            e.preventDefault();
            const inputs = Array.from(document.querySelectorAll('#nilai-input-grid input[type="number"]'));
            const index = inputs.indexOf(e.target);
            if (index > -1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
            } else {
                // Jika input terakhir, langsung submit
                tambahNilai();
            }
        }
    });

    // Menu reset
    document.getElementById('reset-nama-btn').addEventListener('click', resetNama);
    document.getElementById('reset-skor-btn').addEventListener('click', resetSkor);
}

// Mulai saat DOM siap
document.addEventListener('DOMContentLoaded', initAdmin);
