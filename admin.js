// admin.js - Logika halaman admin
const STORAGE_KEY = 'gameScoreData';
const PIN_ADMIN = '1234'; // PIN sederhana, bisa diganti

// Struktur data default
const defaultData = {
    players: ['Pemain 1', 'Pemain 2', 'Pemain 3', 'Pemain 4', 'Pemain 5'],
    scores: [0, 0, 0, 0, 0],
    namesLocked: false
};

// State
let isUnlocked = false;

// Inisialisasi localStorage
function initData() {
    if (!localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    }
}

// Simpan data
function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Muat data
function loadData() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultData;
}

// Render 5 input nama
function renderNamaInputs() {
    const data = loadData();
    const container = document.getElementById('namaInputContainer');
    container.innerHTML = '';
    
    for (let i = 0; i < 5; i++) {
        const div = document.createElement('div');
        div.className = 'mb-3';
        div.innerHTML = `
            <label class="form-label fw-semibold">Pemain ${i+1}</label>
            <input type="text" class="form-control form-control-lg nama-input" 
                data-index="${i}" value="${data.players[i] || ''}" 
                ${data.namesLocked ? 'disabled' : ''} 
                placeholder="Nama pemain">
        `;
        container.appendChild(div);
    }
}

// Render 5 input skor
function renderSkorInputs() {
    const container = document.getElementById('skorInputContainer');
    const data = loadData();
    container.innerHTML = '';
    
    for (let i = 0; i < 5; i++) {
        const div = document.createElement('div');
        div.className = 'mb-3';
        div.innerHTML = `
            <label class="form-label fw-semibold">${data.players[i] || `Pemain ${i+1}`}</label>
            <input type="number" class="form-control form-control-lg skor-input" 
                data-index="${i}" inputmode="numeric" placeholder="Sisa kartu" 
                value="" autocomplete="off">
        `;
        container.appendChild(div);
    }

    // Fokus ke input pertama
    setTimeout(() => {
        const first = document.querySelector('.skor-input');
        if (first) first.focus();
    }, 100);
}

// Simpan nama dari form
function saveNames() {
    const data = loadData();
    const inputs = document.querySelectorAll('.nama-input');
    inputs.forEach((input, i) => {
        if (input.value.trim() !== '') {
            data.players[i] = input.value.trim();
        }
    });
    data.namesLocked = true;
    saveData(data);
    renderNamaInputs();  // disabled
    renderSkorInputs();  // perbarui label
}

// Reset nama (buka kunci)
function resetNames() {
    const data = loadData();
    data.namesLocked = false;
    // Tidak mengubah nama, hanya membuka input
    saveData(data);
    renderNamaInputs();
}

// Reset semua data (termasuk skor)
function resetAll() {
    if (confirm('Hapus semua data? Skor akan kembali 0 dan nama ke default.')) {
        const freshData = {
            players: ['Pemain 1', 'Pemain 2', 'Pemain 3', 'Pemain 4', 'Pemain 5'],
            scores: [0, 0, 0, 0, 0],
            namesLocked: false
        };
        saveData(freshData);
        renderNamaInputs();
        renderSkorInputs();
        isUnlocked = false;
        document.getElementById('adminPin').value = '';
        document.getElementById('pinError').classList.add('d-none');
    }
}

// Proses input ronde: tambah skor, lalu reset input
function processRound() {
    const data = loadData();
    const inputs = document.querySelectorAll('.skor-input');
    let hasValue = false;

    inputs.forEach(input => {
        const val = parseInt(input.value);
        if (!isNaN(val) && val >= 0) {
            const idx = parseInt(input.dataset.index);
            data.scores[idx] += val;
            hasValue = true;
        }
    });

    if (hasValue) {
        saveData(data);
        // Kosongkan semua input
        inputs.forEach(input => input.value = '');
        // Fokus ke input pertama
        setTimeout(() => {
            const first = document.querySelector('.skor-input');
            if (first) first.focus();
        }, 50);
    }
}

// Event: Enter pindah fokus otomatis
function setupEnterNavigation() {
    document.addEventListener('keypress', (e) => {
        if (e.target.classList.contains('skor-input') && e.key === 'Enter') {
            e.preventDefault();
            const inputs = Array.from(document.querySelectorAll('.skor-input'));
            const index = inputs.indexOf(e.target);
            if (index < inputs.length - 1) {
                inputs[index + 1].focus();
            } else {
                // Jika input terakhir, submit ronde
                processRound();
            }
        }
    });
}

// PIN handler
function setupPin() {
    const pinInput = document.getElementById('adminPin');
    const unlockBtn = document.getElementById('unlockBtn');
    const pinError = document.getElementById('pinError');

    unlockBtn.addEventListener('click', () => {
        if (pinInput.value === PIN_ADMIN) {
            isUnlocked = true;
            pinError.classList.add('d-none');
            pinInput.disabled = true;
            unlockBtn.disabled = true;
            unlockBtn.textContent = '✅ Akses Diberikan';
            // Aktifkan semua fitur
            document.querySelectorAll('button:not(#unlockBtn):not(#resetAllBtn)').forEach(btn => btn.disabled = false);
        } else {
            pinError.classList.remove('d-none');
        }
    });
}

// Inisialisasi semua
window.onload = function() {
    initData();
    renderNamaInputs();
    renderSkorInputs();
    setupPin();
    setupEnterNavigation();

    // Event listeners
    document.getElementById('saveNamesBtn').addEventListener('click', function() {
        if (isUnlocked) saveNames();
        else alert('Masukkan PIN terlebih dahulu!');
    });

    document.getElementById('resetNamesBtn').addEventListener('click', function() {
        if (isUnlocked) resetNames();
        else alert('Masukkan PIN terlebih dahulu!');
    });

    document.getElementById('submitRoundBtn').addEventListener('click', function() {
        if (isUnlocked) processRound();
        else alert('Masukkan PIN terlebih dahulu!');
    });

    document.getElementById('resetAllBtn').addEventListener('click', function() {
        if (isUnlocked) resetAll();
        else alert('Masukkan PIN terlebih dahulu!');
    });

    // Nonaktifkan tombol sampai PIN dibuka
    if (!isUnlocked) {
        document.querySelectorAll('button:not(#unlockBtn):not(#resetAllBtn)').forEach(btn => btn.disabled = true);
    }
};