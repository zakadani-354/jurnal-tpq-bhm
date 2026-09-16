// =========================================================================
// PERBAIKAN STRUKTUR VARIABEL MASTER: WAJIB DI ATAS AGAR TIDAK ERROR INITIALIZATION
// =========================================================================
const daftarKelas = ['PAUD A', 'PAUD B', 'Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'];
let currentView = 'login';
let currentUser = { username: '', role: '', kelas: '' };
let dbUsers = [];
let dbJurnal = [];
let dbMateri = [];
let isEditAkunMode = false;

// Pindah deklarasi ini ke atas agar fungsi initApp() bisa langsung mengakses tanpa crash
let dbPresensi = JSON.parse(localStorage.getItem('tpq_presensi')) || [];
let dbTargetSiswa = JSON.parse(localStorage.getItem('tpq_target_siswa')) || {};
let objekChartPresensi = null;

// State Database Murid (Data default jika memori kosong)
let dbSiswa = JSON.parse(localStorage.getItem('tpq_siswa')) || [
    { id: 's1', nama: 'Ahmad Fauzi', kelas: 'PAUD A', kelompok: 'Ummi' },
    { id: 's2', nama: 'Siti Aminah', kelas: 'PAUD A', kelompok: 'Ummi' },
    { id: 's3', nama: 'Zidan Al-Ghifari', kelas: 'PAUD B', kelompok: 'Tilawati' },
    { id: 's4', nama: 'Rania Az-Zahra', kelas: 'Kelas 1', kelompok: 'Iqro' }
];

function initApp() {
    if (!localStorage.getItem('tpq_users')) {
        const defaultUsers = [
            { username: 'admin', password: 'admin123', role: 'admin', kelas: null },
            { username: 'guru1', password: 'guru123', role: 'guru', kelas: 'PAUD A' },
            { username: 'guru2', password: 'guru123', role: 'guru', kelas: 'Kelas 1' }
        ];
        localStorage.setItem('tpq_users', JSON.stringify(defaultUsers));
    }
    if (!localStorage.getItem('tpq_jurnal')) localStorage.setItem('tpq_jurnal', JSON.stringify([]));
    if (!localStorage.getItem('tpq_materi')) localStorage.setItem('tpq_materi', JSON.stringify([]));
    if (!localStorage.getItem('tpq_presensi')) localStorage.setItem('tpq_presensi', JSON.stringify([]));
    if (!localStorage.getItem('tpq_siswa')) localStorage.setItem('tpq_siswa', JSON.stringify([]));

    dbUsers = JSON.parse(localStorage.getItem('tpq_users'));
    dbJurnal = JSON.parse(localStorage.getItem('tpq_jurnal'));
    dbMateri = JSON.parse(localStorage.getItem('tpq_materi'));
    dbPresensi = JSON.parse(localStorage.getItem('tpq_presensi'));
    dbSiswa = JSON.parse(localStorage.getItem('tpq_siswa'));
    
    const klsAdminSelect = document.getElementById('jurnal-kelas-admin');
    const klsAkunSelect = document.getElementById('akun-kelas');
    const filterAdminSelect = document.getElementById('filter-admin-kelas');
    const matInputKelas = document.getElementById('materi-input-kelas');
    const matImportKelas = document.getElementById('materi-import-kelas');
    const filterMatTampilan = document.getElementById('filter-materi-tampilan');
    const presensiKlsAdmin = document.getElementById('presensi-kelas-admin');
    const filterPresensiTampilan = document.getElementById('filter-presensi-tampilan');
    const siswaInputKelas = document.getElementById('siswa-input-kelas');
    const filterSiswaTampilan = document.getElementById('filter-siswa-tampilan');
    
    let opsiHtml = '<option value="">-- Pilih Kelas --</option>';
    let filterHtml = '<option value="SEMUA">-- Semua 8 Kelas --</option>';
    daftarKelas.forEach(k => { opsiHtml += `<option value="${k}">${k}</option>`; filterHtml += `<option value="${k}">${k}</option>`; });
    
    if(klsAdminSelect) klsAdminSelect.innerHTML = opsiHtml;
    if(klsAkunSelect) klsAkunSelect.innerHTML = opsiHtml;
    if(filterAdminSelect) filterAdminSelect.innerHTML = filterHtml;
    if(matInputKelas) matInputKelas.innerHTML = opsiHtml;
    if(matImportKelas) matImportKelas.innerHTML = opsiHtml;
    if(filterMatTampilan) filterMatTampilan.innerHTML = filterHtml;
    if(presensiKlsAdmin) presensiKlsAdmin.innerHTML = opsiHtml;
    if(filterPresensiTampilan) filterPresensiTampilan.innerHTML = filterHtml;
    if(siswaInputKelas) siswaInputKelas.innerHTML = opsiHtml;
    if(filterSiswaTampilan) filterSiswaTampilan.innerHTML = filterHtml;

    if (klsAdminSelect) klsAdminSelect.addEventListener('change', function() { updateDropdownMateriForm(); });
    if (presensiKlsAdmin) presensiKlsAdmin.addEventListener('change', function() { muatDaftarSiswaAbsen(); });
    
        // ====== SUNTIKKAN INI DI DALAM FUNGSI initApp() UNTUK MENGUNCI DROPDOWN ADMIN ======
    const rfkCetakSelect = document.getElementById('raportf-kelas');
    if (rfkCetakSelect) {
        rfkCetakSelect.addEventListener('change', function() {
            if (typeof muatSiswaRaportfDropdown === 'function') {
                muatSiswaRaportfDropdown();
            }
        });
    }
    // ==================================================================================


    const session = localStorage.getItem('tpq_session');
    if (session) { currentUser = JSON.parse(session); masukKeAplikasi(); }

        // ====== SUNTIKKAN POTONGAN KODE INI TEPAT DI BARIS PALING BAWAH DI DALAM FUNGSI initApp() ======
    if (document.getElementById('filter-jurnal-page-kelas')) {
        const filterPageSelect = document.getElementById('filter-jurnal-page-kelas');
        let opsiHtml = '<option value="SEMUA">-- Semua 8 Kelas --</option>';
        daftarKelas.forEach(k => { opsiHtml += `<option value="${k}">${k}</option>`; });
        filterPageSelect.innerHTML = opsiHtml;
    }
    // ==============================================================================================

}

function masukKeAplikasi() {
    if(document.getElementById('view-login')) document.getElementById('view-login').style.display = 'none';
    if(document.getElementById('app-content')) document.getElementById('app-content').style.display = 'block';
    if(document.getElementById('txt-username')) document.getElementById('txt-username').innerText = currentUser.username;
    if(document.getElementById('txt-role')) document.getElementById('txt-role').innerText = currentUser.role == 'admin' ? 'Super User Administrator' : 'Guru Otoritas Kelas';
    if(document.getElementById('txt-kelas')) document.getElementById('txt-kelas').innerText = currentUser.role == 'admin' ? 'Otoritas Pusat Admin' : 'Kelas: ' + currentUser.kelas;
    if(document.getElementById('dashboard-welcome-name')) document.getElementById('dashboard-welcome-name').innerText = 'Ustadz/Ustadzah ' + currentUser.username;
    
    const dashFilterKelas = document.getElementById('dash-filter-kelas');
    if (dashFilterKelas) {
        if (currentUser.role === 'admin') {
            let htmlKls = '<option value="SEMUA">-- Semua 8 Kelas --</option>';
            daftarKelas.forEach(k => { htmlKls += `<option value="${k}">${k}</option>`; });
            dashFilterKelas.innerHTML = htmlKls;
            dashFilterKelas.disabled = false;
        } else {
            dashFilterKelas.innerHTML = `<option value="${currentUser.kelas}">${currentUser.kelas}</option>`;
            dashFilterKelas.disabled = true;
        }
    }

        // ====== CARI BAGIAN IF CURRENTUSER.ROLE PADA fungsi masukKeAplikasi() ======
    if (currentUser.role === 'admin') {
        // Jika admin, nyalakan menu Kelola Akun Guru di bar bawah
        if(document.getElementById('nav-kelolaAkun')) document.getElementById('nav-kelolaAkun').style.display = 'flex';
        if(document.getElementById('filter-admin-box')) document.getElementById('filter-admin-box').style.display = 'flex';
        if(document.getElementById('box-select-kelas-admin')) document.getElementById('box-select-kelas-admin').style.display = 'block';
        if(document.getElementById('jurnal-kelas-guru')) document.getElementById('jurnal-kelas-guru').style.display = 'none';
        if(document.getElementById('dash-status-akses')) document.getElementById('dash-status-akses').innerText = '8 Kelas Terbuka';
    } else {
        // Jika guru, sembunyikan total menu Kelola Akun Guru demi keamanan privasi database
        if(document.getElementById('nav-kelolaAkun')) document.getElementById('nav-kelolaAkun').style.display = 'none';
        if(document.getElementById('filter-admin-box')) document.getElementById('filter-admin-box').style.display = 'none';
        if(document.getElementById('box-select-kelas-admin')) document.getElementById('box-select-kelas-admin').style.display = 'none';
        if(document.getElementById('jurnal-kelas-guru')) document.getElementById('jurnal-kelas-guru').style.display = 'block';
        if(document.getElementById('jurnal-kelas-guru')) document.getElementById('jurnal-kelas-guru').value = currentUser.kelas;
        if(document.getElementById('dash-status-akses')) document.getElementById('dash-status-akses').innerText = 'Terisolasi Aman';
    }

    
    // =========================================================================
    // PERBAIKAN: Mengikat onchange langsung ke variabel yang sudah dideklarasikan di atas (Tanpa kata "const")
    // =========================================================================
    if (dashFilterKelas) {
        dashFilterKelas.onchange = function() {
            updateDropdownKelompokDashboard();
            prosesResumeDashboard();
        };
    }

    const dashFilterKelompok = document.getElementById('dash-filter-kelompok');
    if (dashFilterKelompok) {
        dashFilterKelompok.onchange = function() {
            prosesResumeDashboard();
        };
    }
    // =========================================================================
    
    updateDropdownKelompokDashboard();
    gantiMenu('dashboard');
}

function muatSiswaPenilaianDropdown() {
    const klsSelect = document.getElementById('penilaian-kelas');
    const siswaSelect = document.getElementById('penilaian-siswa');
    if (!klsSelect || !siswaSelect) return;

    let klsAktif = klsSelect.value; // Nilainya: "Kelas 1"
    if (!klsAktif) { 
        siswaSelect.innerHTML = '<option value="">-- Pilih Santri --</option>'; 
        return; 
    }

    // Ambil database santri paling segar dari memori laptop
    dbSiswa = JSON.parse(localStorage.getItem('tpq_siswa')) || [];

    // Ambil hanya angka murni dari teks kelas (Misal "Kelas 1" diambil angka "1" saja)
    let angkaKelasAktif = klsAktif.replace(/\D/g, ''); 

    // FILTER SUPER TOLERAN: COCOK DENGAN SEGALA JENIS FORMAT TEKS KELAS
    let muridTerfilter = dbSiswa.filter(x => {
        if (!x.kelas) return false;
        let kelasDbStr = x.kelas.toString().trim().toLowerCase();
        let klsAktifStr = klsAktif.trim().toLowerCase();
        
        // Cek apakah sama persis, atau mengandung angka kelas yang sama (Toleransi angka murni "1")
        return kelasDbStr === klsAktifStr || 
               kelasDbStr === angkaKelasAktif || 
               kelasDbStr.includes(angkaKelasAktif);
    });

    let html = '<option value="">-- Pilih Santri --</option>';
    muridTerfilter.forEach(m => { 
        html += `<option value="${m.id}">${m.nama.toUpperCase()} (${m.kelompok || '-'})</option>`; 
    });
    siswaSelect.innerHTML = html;
    
    const formBox = document.getElementById('box-form-sembilan-subjek');
    if (formBox) formBox.style.display = 'none';
}


// 3. Memuat data nilai ujian yang sudah diinput sebelumnya agar bisa diedit (Auto-Load)
function muatFormNilaiUjianEksis() {
    const idSiswa = document.getElementById('penilaian-siswa').value;
    const jenisUjian = document.getElementById('penilaian-jenis').value;
    const formBox = document.getElementById('box-form-sembilan-subjek');

    // JIKA NAMA SANTRI BELUM DIPILIH, JANGAN TAMPILKAN FORM
    if (!idSiswa) { 
        if (formBox) formBox.style.display = 'none'; 
        return; 
    }

    // Ambil data nilai ujian ujian dari localStorage
    dbUjian = JSON.parse(localStorage.getItem('tpq_ujian_sembilan_subjek')) || {};

    let uKey = `${idSiswa}_${jenisUjian}`;
    // Jika belum pernah diinput, set nilai default awal ke angka 0
    let nilaiEksis = dbUjian[uKey] || { tilawah: 0, kitabah: 0, surat: 0, doa: 0, tajwid: 0, ibadah: 0, dinul: 0, adab: 0, asmaul: 0 };

    // Suntikkan data nilai ke masing-masing kotak input di layar
    if(document.getElementById('subjek-tilawah')) document.getElementById('subjek-tilawah').value = nilaiEksis.tilawah;
    if(document.getElementById('subjek-kitabah')) document.getElementById('subjek-kitabah').value = nilaiEksis.kitabah;
    if(document.getElementById('subjek-surat')) document.getElementById('subjek-surat').value = nilaiEksis.surat;
    if(document.getElementById('subjek-doa')) document.getElementById('subjek-doa').value = nilaiEksis.doa;
    if(document.getElementById('subjek-tajwid')) document.getElementById('subjek-tajwid').value = nilaiEksis.tajwid;
    if(document.getElementById('subjek-ibadah')) document.getElementById('subjek-ibadah').value = nilaiEksis.ibadah;
    if(document.getElementById('subjek-dinul')) document.getElementById('subjek-dinul').value = nilaiEksis.dinul;
    if(document.getElementById('subjek-adab')) document.getElementById('subjek-adab').value = nilaiEksis.adab;
    if(document.getElementById('subjek-asmaul')) document.getElementById('subjek-asmaul').value = nilaiEksis.asmaul;

    // PAKSA MUNCUL: Pastikan boks form 9 subjek langsung terbuka tampil di layar laptop Anda
    if (formBox) {
        formBox.style.display = 'block';
    }
}

// 4. Aksi Menyimpan Hasil Input Form Ujian Ke Database Lokal
function simpanNilaiUjianMassal(e) {
    e.preventDefault();
    const idSiswa = document.getElementById('penilaian-siswa').value;
    const jenisUjian = document.getElementById('penilaian-jenis').value;

    if (!idSiswa || !jenisUjian) return;

    let uKey = `${idSiswa}_${jenisUjian}`;

    dbUjian[uKey] = {
        tilawah: parseInt(document.getElementById('subjek-tilawah').value) || 0,
        kitabah: parseInt(document.getElementById('subjek-kitabah').value) || 0,
        surat: parseInt(document.getElementById('subjek-surat').value) || 0,
        doa: parseInt(document.getElementById('subjek-doa').value) || 0,
        tajwid: parseInt(document.getElementById('subjek-tajwid').value) || 0,
        ibadah: parseInt(document.getElementById('subjek-ibadah').value) || 0,
        dinul: parseInt(document.getElementById('subjek-dinul').value) || 0,
        adab: parseInt(document.getElementById('subjek-adab').value) || 0,
        asmaul: parseInt(document.getElementById('subjek-asmaul').value) || 0
    };

    localStorage.setItem('tpq_ujian_sembilan_subjek', JSON.stringify(dbUjian));
    alert(`Alhamdulillah, data ${jenisUjian} santri berhasil disimpan permanen!`);
}

// 2. Fungsi Inti Menarik Data 4 Jenis Ujian & Menghitung Nilai Akhir Huruf
function prosesKalkulasiRaportFinal() {
    const idSiswa = document.getElementById('raportf-siswa').value;
    const klsAktif = document.getElementById('raportf-kelas').value;
    const tbody = document.getElementById('table-raportf-body-rows');
    const areaDokumen = document.getElementById('area-dokumen-raport-resmi');

    if (!idSiswa) { if (areaDokumen) areaDokumen.style.display = 'none'; return; }

    // 1. REVISE: Tampilkan Angka Kelas Murni Tanpa Kata "KELAS" (Misal "Kelas 1" menjadi "1")
    const dataSantri = dbSiswa.find(x => x.id === idSiswa);
    if (dataSantri) {
        let angkaMurniKelas = dataSantri.kelas.replace(/\D/g, '').trim(); // Menghapus kata non-angka
        document.getElementById('rf-teks-kelas').innerText = angkaMurniKelas || dataSantri.kelas; 
        document.getElementById('rf-teks-siswa').innerText = dataSantri.nama.toUpperCase();
    }

    // Rekap Data Absensi
    let logAbsenAnak = dbPresensi.filter(p => p.id_siswa === idSiswa);
    document.getElementById('rf-absen-sakit').innerText = logAbsenAnak.filter(p => p.status === 'Sakit').length;
    document.getElementById('rf-absen-izin').innerText = logAbsenAnak.filter(p => p.status === 'Izin').length;
    document.getElementById('rf-absen-alpa').innerText = logAbsenAnak.filter(p => p.status === 'Alpa').length;
    document.getElementById('rf-total-kbm').innerText = `Total KBM Terpantau: ${logAbsenAnak.length} Hari`;

    dbUjian = JSON.parse(localStorage.getItem('tpq_ujian_sembilan_subjek')) || {};

    const subjekMateriList = [
        { id: "tilawah", nama: "Tilawah / Bacaan" },
        { id: "kitabah", nama: "Tahsinul Kitabah" },
        { id: "surat", nama: "Hafalan Surat" },
        { id: "doa", nama: "Hafalan Doa" },
        { id: "tajwid", nama: "Ilmu Tajwid" },
        { id: "ibadah", nama: "Praktek Ibadah" },
        { id: "dinul", nama: "Dinul Islam" },
        { id: "adab", nama: "Adab Harian" },
        { id: "asmaul", nama: "Asmaul Husna" }
    ];

    let htmlRows = '';
    let grandTotalNilaiAkhir = 0;

    subjekMateriList.forEach((sub, idx) => {
        let n1 = dbUjian[`${idSiswa}_Nilai 1`] ? dbUjian[`${idSiswa}_Nilai 1`][sub.id] || 0 : 0;
        let n2 = dbUjian[`${idSiswa}_Nilai 2`] ? dbUjian[`${idSiswa}_Nilai 2`][sub.id] || 0 : 0;
        let pts = dbUjian[`${idSiswa}_PTS`] ? dbUjian[`${idSiswa}_PTS`][sub.id] || 0 : 0;
        let pas = dbUjian[`${idSiswa}_PAS`] ? dbUjian[`${idSiswa}_PAS`][sub.id] || 0 : 0;

        // Rata-rata dari 4 jenis ujian
        let nilaiAkhirRata = Math.round((n1 + n2 + pts + pas) / 4);
        grandTotalNilaiAkhir += nilaiAkhirRata;

        // REVISE PREDIKAT NILAI & DESKRIPSI BARU SESUAI ATURAN RESMI
        let predikat = "D";
        let deskripsi = "Memerlukan bimbingan lebih lanjut dan perbaikan hafalan/pemahaman materi.";
        
        if (nilaiAkhirRata >= 91) { predikat = "A"; deskripsi = "Sangat baik, tajwid sempurna, pelafalan fasih dan penguasaan materi sangat kokoh."; }
        else if (nilaiAkhirRata >= 81) { predikat = "B"; deskripsi = "Baik, hafal sebagian besar materi, pelafalan fasih dengan sedikit catatan minor tajwid."; }
        else if (nilaiAkhirRata >= 71) { predikat = "C"; deskripsi = "Cukup, mampu membaca dengan lancar, namun masih terdapat beberapa catatan pada makhraj huruf."; }
        else if (n1 === 0 && n2 === 0 && pts === 0 && pas === 0) { predikat = "-"; deskripsi = "Belum ada komponen nilai ujian yang diinput oleh ustadz pengajar."; nilaiAkhirRata = "-"; }

        // Suntikkan baris data berbentuk 5 kolom utama resmi ke tabel
        htmlRows += `
            <tr>
                <td style="border: 1px solid #000000; text-align: center; padding: 6px;">${idx + 1}</td>
                <td style="border: 1px solid #000000; padding: 6px; font-weight: bold;">${sub.nama.toUpperCase()}</td>
                <td style="border: 1px solid #000000; text-align: center; font-weight: bold; padding: 6px; color: #16a34a; font-size: 13px;">${nilaiAkhirRata}</td>
                <td style="border: 1px solid #000000; text-align: center; font-weight: bold; padding: 6px; font-size: 13px;">${predikat}</td>
                <td style="border: 1px solid #000000; padding: 6px; font-style: italic; color: #1f2937;">${deskripsi}</td>
            </tr>`;
    });

    // Baris Akumulasi Rata-Rata Akhir Dokumen
    let rataRataAkumulasi = Math.round(grandTotalNilaiAkhir / 9);
    let predikatTotal = "D";
    let deskripsiTotal = "Kurang, tingkatkan motivasi belajar dan bimbingan mengaji secara intensif di rumah.";
    
    if (rataRataAkumulasi >= 91) { predikatTotal = "A"; deskripsiTotal = "Sangat baik, pertahankan prestasi dan semangat belajarnya dalam mempelajari ilmu Al-Qur'an."; }
    else if (rataRataAkumulasi >= 81) { predikatTotal = "B"; deskripsiTotal = "Baik, pemahaman kurikulum sudah matang dan mampu mengikuti target dengan sangat lancar."; }
    else if (rataRataAkumulasi >= 71) { predikatTotal = "C"; deskripsiTotal = "Cukup, pertahankan konsistensi mengaji dan perbanyak setoran hafalan pokok harian."; }

    htmlRows += `
        <tr style="font-weight: bold; background: #f9fafb;">
            <td style="border: 1px solid #000000; text-align: center; padding: 8px;">-</td>
            <td style="border: 1px solid #000000; padding: 8px;">NILAI RATA-RATA AKHIR</td>
            <td style="border: 1px solid #000000; text-align: center; padding: 8px; color: #059669; font-size: 14px;">${rataRataAkumulasi}</td>
            <td style="border: 1px solid #000000; text-align: center; padding: 8px; font-size: 14px;">${predikatTotal}</td>
            <td style="border: 1px solid #000000; padding: 8px; color: #111827;">${deskripsiTotal}</td>
        </tr>`;

    tbody.innerHTML = htmlRows;
    if (areaDokumen) areaDokumen.style.display = 'block';
}



// GANTI FUNGSI gantiMenu(viewName) DENGAN INI
// =========================================================================
// PERBAIKAN INTEGRASI: MEMICU INTEGRASI HALAMAN RAPORT BARU (Fitur 15 Final)
// =========================================================================
function gantiMenu(viewName) {
    currentView = viewName;
    
    // Sembunyikan seluruh modul boks halaman di layar terlebih dahulu
    const sections = document.querySelectorAll('.view-section');
    sections.forEach(s => s.style.display = 'none');
    
    // Hilangkan status tombol menyala (active) pada navigasi bar bawah
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(n => n.classList.remove('active'));
    
    // Tampilkan boks halaman target secara instan jika elemennya tersedia di HTML
    if(document.getElementById('view-' + viewName)) {
        document.getElementById('view-' + viewName).style.display = 'block';
    }
    
    // Nyalakan warna tombol menu yang sedang diklik saat ini
    const activeNav = document.getElementById('nav-' + viewName);
    if (activeNav) activeNav.classList.add('active');
    
    // ---------------------------------------------------------------------
    // PERCABANGAN LOGIKA ROUTING HALAMAN INDEPENDEN
    // ---------------------------------------------------------------------
    if (viewName === 'dashboard') {
        if(document.getElementById('dash-total-jurnal')) {
            document.getElementById('dash-total-jurnal').innerText = AmbilJurnalTerfilter().length;
        }
        if(typeof prosesResumeDashboard === 'function') prosesResumeDashboard();
          } else if (viewName === 'riwayat') { 
        // =========================================================================
        // FINAL PROTEKSI: FILTER KELAS HANYA UNTUK ADMIN, GURU OTOMATIS TERKUNCI MURNI
        // =========================================================================
        const filterPageBox = document.getElementById('filter-jurnal-page-box');
        const filterPageSelect = document.getElementById('filter-jurnal-page-kelas');
        
        if (filterPageSelect) {
            // Suntikkan 8 opsi pilihan jenjang kelas jika select masih kosong murni
            if (filterPageSelect.innerHTML.trim() === "") {
                let opsiHtml = '<option value="SEMUA">-- Semua 8 Kelas --</option>';
                daftarKelas.forEach(k => { opsiHtml += `<option value="${k}">${k}</option>`; });
                filterPageSelect.innerHTML = opsiHtml;
            }

            // ATURAN HAK AKSES DAN TAMPILAN FILTER VISUAL
            if (currentUser.role !== 'admin') {
                // Akun Guru: Paksa setel ke kelas aslinya, lalu SEMBUNYIKAN TOTAL boks filternya dari layar
                filterPageSelect.value = currentUser.kelas || 'Kelas 1';
                if (filterPageBox) filterPageBox.style.display = 'none'; 
            } else {
                // Akun Admin: TAMPILKAN BOKS FILTER secara tegak dan rapi untuk saringan pusat
                if (filterPageBox) filterPageBox.style.display = 'block'; 
                filterPageSelect.disabled = false;
            }
        }
        
        // Jalankan penggambaran kartu data riwayat jurnal secara live di tempat
        renderRiwayat();
        // =========================================================================


    } else if (viewName === 'target') { 
        if (typeof toggleTabMateri === 'function') toggleTabMateri('master');
    } else if (viewName === 'kelolaAkun') { 
        renderTabelUser(); 
    } else if (viewName === 'presensi') { 
        renderRiwayatPresensi();
    } else if (viewName === 'siswa') { 
        renderTabelSiswaMaster(); 
    } else if (viewName === 'penilaian') { 
        // Modul Penilaian 9 Subjek
        const penilaianKlsSelect = document.getElementById('penilaian-kelas');
        if (penilaianKlsSelect) {
            let opsiHtml = '<option value="">-- Pilih Kelas --</option>';
            daftarKelas.forEach(k => { opsiHtml += `<option value="${k}">${k}</option>`; });
            penilaianKlsSelect.innerHTML = opsiHtml;

            if (currentUser.role !== 'admin') {
                penilaianKlsSelect.value = currentUser.kelas || 'Kelas 1'; 
                penilaianKlsSelect.disabled = true; 
                if (typeof muatSiswaPenilaianDropdown === 'function') muatSiswaPenilaianDropdown();
            } else {
                penilaianKlsSelect.value = '';
                penilaianKlsSelect.disabled = false;
                const siswaSelect = document.getElementById('penilaian-siswa');
                if (siswaSelect) siswaSelect.innerHTML = '<option value="">-- Pilih Santri --</option>';
            }
        }
        const formBox = document.getElementById('box-form-sembilan-subjek');
        if (formBox) formBox.style.display = 'none';
        
        } else if (viewName === 'raportFinal') {
        const rfkSelect = document.getElementById('raportf-kelas');
        const rfsSiswa = document.getElementById('raportf-siswa');
        dbSiswa = JSON.parse(localStorage.getItem('tpq_siswa')) || [];
        
        if (rfkSelect && rfsSiswa) {
            let htmlKls = '<option value="">-- Pilih Kelas --</option>';
            daftarKelas.forEach(k => { htmlKls += `<option value="${k}">${k}</option>`; });
            rfkSelect.innerHTML = htmlKls;
            
            if (currentUser.role !== 'admin') {
                rfkSelect.value = currentUser.kelas || 'Kelas 1';
                rfkSelect.disabled = true;
                // Panggilan lokal diubah menjadi window karena fungsinya pindah ke html
                if (typeof window.muatSiswaRaportfDropdown === 'function') {
                    window.muatSiswaRaportfDropdown();
                }
            } else {
                rfkSelect.disabled = false;
                rfkSelect.value = '';
                rfsSiswa.innerHTML = '<option value="">-- Pilih Santri --</option>';
            }
        }
        const areaDokumen = document.getElementById('area-dokumen-raport-resmi');
        if (areaDokumen) areaDokumen.style.display = 'none';
    }






}

// =========================================================================
// PERBAIKAN FILTER RIWAYAT: SINKRON 100% DENGAN DATA ANGKA DASHBOARD
// =========================================================================
function AmbilJurnalTerfilter() {
    dbJurnal = JSON.parse(localStorage.getItem('tpq_jurnal')) || [];
    const filterPageSelect = document.getElementById('filter-jurnal-page-kelas');

    if (currentUser.role === 'admin') {
        // Jika dropdown filter di halaman jurnal belum siap, keluarkan semua data dulu
        const fKelasPage = filterPageSelect ? filterPageSelect.value : 'SEMUA';
        
        if (fKelasPage === 'SEMUA' || fKelasPage === '') {
            return dbJurnal;
        }
        
        return dbJurnal.filter(x => x.kelas && x.kelas.trim().toLowerCase() === fKelasPage.trim().toLowerCase());
    }

    // Otoritas Akun Guru: Otomatis terkunci 100% hanya memunculkan data kelas miliknya sendiri
    return dbJurnal.filter(x => x.kelas && x.kelas.trim().toLowerCase() === currentUser.kelas.trim().toLowerCase());
}


function bukaIsiJurnalBaru() {
    document.getElementById('jurnal-id').value = '';
    document.getElementById('jurnal-kehadiran').value = '';
    document.getElementById('jurnal-catatan').value = '';
    document.getElementById('jurnal-tanggal').value = new Date().toISOString().split('T')[0];
    document.getElementById('jurnal-form-title').innerText = 'Input Catatan Jurnal Kelas Baru';
    
    if (currentUser.role === 'admin') { 
        if (document.getElementById('jurnal-kelas-admin')) document.getElementById('jurnal-kelas-admin').value = ''; 
    }
    
    updateDropdownMateriForm();
    
    // ATUR TAMPILAN FILTER MANDIRI JURNAL SECARA LIVE SEKETIKA
    const filterPageBox = document.getElementById('filter-jurnal-page-box');
    const filterPageSelect = document.getElementById('filter-jurnal-page-kelas');
    
    if (filterPageSelect && filterPageBox) {
        if (currentUser.role === 'admin') {
            filterPageBox.style.display = 'block'; // Tampilkan boks jika admin pusat
            filterPageSelect.disabled = false;
        } else {
            filterPageSelect.value = currentUser.kelas || 'Kelas 1';
            filterPageBox.style.display = 'none';  // Sembunyikan jika akun guru
        }
    }
    
    renderRiwayat(); // Gambar list kartu jurnal harian secara live
    gantiMenu('isiJurnal');
}


function updateDropdownMateriForm() {
    const materiSelect = document.getElementById('jurnal-materi');
    if (!materiSelect) return;
    let klsAktif = currentUser.role === 'admin' ? document.getElementById('jurnal-kelas-admin').value : currentUser.kelas;
    let filteredMateri = dbMateri.filter(x => x.kelas === klsAktif);
    let matHtml = '<option value="">-- Pilih Materi Dari Database Kurikulum --</option>';
    filteredMateri.forEach(m => { matHtml += `<option value="${m.nama_materi}">${m.nama_materi}</option>`; });
    materiSelect.innerHTML = matHtml;
}

function simpanJurnal(e) {
    e.preventDefault();
    const idInput = document.getElementById('jurnal-id').value;
    const tgl = document.getElementById('jurnal-tanggal').value;
    const mat = document.getElementById('jurnal-materi').value;
    const keh = parseInt(document.getElementById('jurnal-kehadiran').value) || 0;
    const cat = document.getElementById('jurnal-catatan').value.trim();
    let kls = currentUser.kelas;
    if (currentUser.role === 'admin') {
        kls = document.getElementById('jurnal-kelas-admin').value;
        if (!kls) { alert('Pilih kelas target pengisian terlebih dahulu!'); return; }
    }
    if (!mat) { alert('Pilih materi dari kurikulum terlebih dahulu!'); return; }
    if (idInput) {
        const index = dbJurnal.findIndex(x => x.id == idInput);
        if (index !== -1) dbJurnal[index] = { id: parseInt(idInput), kelas: kls, tanggal: tgl, materi: mat, kehadiran: keh, catatan: cat };
    } else {
        dbJurnal.push({ id: Date.now(), kelas: kls, tanggal: tgl, materi: mat, kehadiran: keh, catatan: cat });
    }
    localStorage.setItem('tpq_jurnal', JSON.stringify(dbJurnal));
    alert('Jurnal berhasil disimpan.');
    gantiMenu('riwayat');
}

function editJurnal(id) {
    const item = dbJurnal.find(x => x.id == id);
    if (!item) return;
    document.getElementById('jurnal-id').value = item.id;
    document.getElementById('jurnal-tanggal').value = item.tanggal;
    document.getElementById('jurnal-kehadiran').value = item.kehadiran;
    document.getElementById('jurnal-catatan').value = item.catatan;
    document.getElementById('jurnal-form-title').innerText = 'Modifikasi Jurnal Kelas Lama';
    if (currentUser.role === 'admin') { document.getElementById('jurnal-kelas-admin').value = item.kelas; }
    updateDropdownMateriForm();
    document.getElementById('jurnal-materi').value = item.materi;
    document.querySelectorAll('.view-section').forEach(s => s.style.display = 'none');
    document.getElementById('view-isiJurnal').style.display = 'block';
}

function hapusJurnal(id) {
    if (confirm('Apakah Anda yakin ingin menghapus catatan jurnal kelas ini?')) {
        dbJurnal = dbJurnal.filter(x => x.id != id);
        localStorage.setItem('tpq_jurnal', JSON.stringify(dbJurnal));
        renderRiwayat();
    }
}

function renderRiwayat() {
    // 1. Ambil elemen kontainer dari kedua menu (Menu Riwayat Global & Menu Input Jurnal)
    const containerGlobal = document.getElementById('list-jurnal-container');
    const containerMenuInput = document.getElementById('list-jurnal-input-menu-container');
    
    const data = AmbilJurnalTerfilter();
    
    // Teks jika data masih kosong murni
    const htmlKosong = `<div class="card" style="text-align:center; color:#9ca3af; padding:30px; border: 1px dashed #d1d5db;">Belum ada rekaman data jurnal kelas.</div>`;

    if (data.length === 0) {
        if (containerGlobal) containerGlobal.innerHTML = htmlKosong;
        if (containerMenuInput) containerMenuInput.innerHTML = htmlKosong;
        return;
    }
    
    // 2. Susun Tombol Pilihan Centang Massal & Hapus Masal
    let htmlContent = `
        <div class="card" style="margin-bottom:12px; padding:10px 16px; background:#f9fafb; display:flex; justify-content:space-between; align-items:center;">
            <label style="font-size:13px; font-weight:600; color:#4b5563; cursor:pointer; display:flex; align-items:center; gap:8px;">
                <input type="checkbox" id="chk-all-jurnal" onchange="togglePilihSemuaJurnal(this.checked)" style="width:16px; height:16px;">
                Pilih Semua Jurnal
            </label>
            <button onclick="hapusJurnalTerpilih()" style="color:#dc2626; background:#fee2e2; border:1px solid #fecaca; font-weight:bold; cursor:pointer; font-size:12px; padding:6px 12px; border-radius:6px;">🗑️ Hapus Masal</button>
        </div>
    `;

    // Urutkan data jurnal dari tanggal yang paling baru ke tanggal lama
    const sortedData = [...data].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    
    // 3. Looping gambar kartu jurnal satu per satu
    sortedData.forEach(j => {
        const opt = { year: 'numeric', month: 'long', day: 'numeric' };
        const tglFormat = new Date(j.tanggal).toLocaleDateString('id-ID', opt);
        let kendalaHtml = j.catatan ? `<p style="font-size:12px; color:#b45309; background:#fffbeb; padding:6px; border-radius:6px; margin-top:6px;">⚠️ Kendala: ${j.catatan}</p>` : '';
        
        htmlContent += `
            <div class="card" style="margin-bottom:10px; display: flex; gap: 12px; align-items: flex-start; text-align: left;">
                <div style="padding-top: 4px;">
                    <input type="checkbox" name="chk-jurnal-item" value="${j.id}" style="width:16px; height:16px; cursor:pointer;">
                </div>
                <div style="flex: 1;">
                    <div style="display:flex; justify-content:space-between; border-bottom:1px solid #f3f4f6; padding-bottom:6px; margin-bottom:8px;">
                        <div>
                            <span class="badge badge-kelas">${j.kelas}</span>
                            <h4 style="font-size:14px; font-weight:bold; margin-top:4px;">${tglFormat}</h4>
                        </div>
                        <span style="font-size:12px; color:#6b7280; font-weight:500;">Hadir: ${j.kehadiran} Murid</span>
                    </div>
                    <p style="font-size:13px; font-weight:600; color:#4b5563;">Materi Pengajaran:</p>
                    <p style="font-size:13px; color:#1f2937; background:#f9fafb; padding:8px; border-radius:8px; margin-top:2px; white-space:pre-line;">${j.materi}</p>
                    ${kendalaHtml}
                    <div style="display:flex; justify-content:flex-end; gap:14px; margin-top:10px; padding-top:6px; border-top:1px solid #f9fafb; font-size:12px;">
                        <button onclick="editJurnal('${j.id}')" style="color:#2563eb; background:none; border:none; font-weight:bold; cursor:pointer;">✏️ Ubah</button>
                        <button onclick="hapusJurnal('${j.id}')" style="color:#dc2626; background:none; border:none; font-weight:bold; cursor:pointer;">🗑️ Hapus</button>
                    </div>
                </div>
            </div>`;
    });

    // 4. SUNTIKKAN KE KEDUA KONTAINER SEKALIGUS AGAR SINKRON LIVE
    if (containerGlobal) containerGlobal.innerHTML = htmlContent;
    if (containerMenuInput) containerMenuInput.innerHTML = htmlContent;
}


// FUNGSI BARU: Check/Uncheck Semua Item Jurnal
function togglePilihSemuaJurnal(isChecked) {
    const checkboxes = document.querySelectorAll('input[name="chk-jurnal-item"]');
    checkboxes.forEach(cb => cb.checked = isChecked);
}

// FUNGSI BARU: Menghapus Banyak Jurnal Sekaligus
function hapusJurnalTerpilih() {
    const checkboxes = document.querySelectorAll('input[name="chk-jurnal-item"]:checked');
    if (checkboxes.length === 0) { alert("Silakan centang catatan jurnal yang ingin dihapus massal!"); return; }
    
    if (confirm(`Apakah Anda yakin ingin menghapus ${checkboxes.length} catatan riwayat jurnal terpilih secara massal?`)) {
        const idDihapus = Array.from(checkboxes).map(cb => parseInt(cb.value));
        dbJurnal = dbJurnal.filter(x => !idDihapus.includes(x.id));
        localStorage.setItem('tpq_jurnal', JSON.stringify(dbJurnal));
        alert("Riwayat jurnal terpilih berhasil dibersihkan!");
        renderRiwayat();
    }
}

function renderTabelUser() {
    const tbody = document.getElementById('table-user-rows');
    if (!tbody) return;
    let html = '';
    dbUsers.forEach(u => {
        let aksiHtml = `<span style="color:#9ca3af; font-size:12px; italic">Sistem Terkunci</span>`;
        if (u.username !== 'admin') {
            aksiHtml = `
                <button onclick="editAkun('${u.username}')" style="color:#2563eb; background:none; border:none; font-weight:bold; cursor:pointer;">✏️ Ubah</button>
                <button onclick="hapusAkun('${u.username}')" style="color:#dc2626; background:none; border:none; font-weight:bold; cursor:pointer; margin-left:10px;">🗑️ Hapus</button>
            `;
        }
        html += `
            <tr>
                <td style="font-weight:600;">${u.username}</td>
                <td><span class="badge ${u.role === 'admin' ? 'badge-admin' : ''}">${u.kelas ? u.kelas : 'Master Pusat'}</span></td>
                <td style="text-align:center;">${aksiHtml}</td>
            </tr>`;
    });
    tbody.innerHTML = html;
}

function simpanAkun(e) {
    e.preventDefault();
    const u = document.getElementById('akun-username').value.trim();
    const p = document.getElementById('akun-password').value;
    const k = document.getElementById('akun-kelas').value;
    if (isEditAkunMode) {
        const idx = dbUsers.findIndex(x => x.username === u);
        if (idx !== -1) {
            if (p.trim() !== '') dbUsers[idx].password = p;
            dbUsers[idx].kelas = k;
            alert('Data guru berhasil diubah!');
        }
    } else {
        if (dbUsers.some(x => x.username.toLowerCase() === u.toLowerCase())) { alert('Username guru sudah terdaftar!'); return; }
        if (p.trim() === '') { alert('Password guru baru wajib diisi!'); return; }
        dbUsers.push({ username: u, password: p, role: 'guru', kelas: k });
        alert('Akun guru baru berhasil ditambahkan!');
    }
    localStorage.setItem('tpq_users', JSON.stringify(dbUsers));
    resetAkunForm();
    renderTabelUser();
}

function editAkun(username) {
    const item = dbUsers.find(x => x.username === username);
    if (!item) return;
    isEditAkunMode = true;
    document.getElementById('akun-username').value = item.username;
    document.getElementById('akun-username').readOnly = true;
    document.getElementById('akun-kelas').value = item.kelas;
    document.getElementById('akun-password').value = '';
    document.getElementById('akun-form-title').innerText = 'Ubah Otoritas Akun Guru';
    document.getElementById('hint-pass').innerText = '(*kosongkan jika tidak diganti)';
    document.getElementById('btn-batal-akun').style.display = 'inline-block';
}

function hapusAkun(username) {
    if (confirm(`Apakah Anda yakin ingin menghapus akun guru "${username}" secara permanen?`)) {
        dbUsers = dbUsers.filter(x => x.username !== username);
        localStorage.setItem('tpq_users', JSON.stringify(dbUsers));
        resetAkunForm();
        renderTabelUser();
    }
}

function resetAkunForm() {
    isEditAkunMode = false;
    document.getElementById('akun-username').value = '';
    document.getElementById('akun-username').readOnly = false;
    document.getElementById('akun-password').value = '';
    document.getElementById('akun-kelas').value = '';
    document.getElementById('akun-form-title').innerText = 'Tambahkan Akun Guru Baru';
    document.getElementById('hint-pass').innerText = '';
    document.getElementById('btn-batal-akun').style.display = 'none';
}

// GANTI FUNGSI tambahMateriSatuan() DENGAN INI
function tambahMateriSatuan() {
    let kls = document.getElementById('materi-input-kelas').value;
    const nama = document.getElementById('materi-input-nama').value.trim();
    
    // Jika guru yang login, abaikan dropdown dan paksa gunakan otoritas kelas aslinya
    if (currentUser.role !== 'admin') {
        kls = currentUser.kelas;
    }
    
    if (!kls || !nama) { alert('Silakan pilih kelas dan isi nama materinya!'); return; }
    
    // Tarik database materi paling baru dari memori lokal sebelum menambahkan data baru
    dbMateri = JSON.parse(localStorage.getItem('tpq_materi')) || [];
    
    dbMateri.push({ id: 'mat_' + Date.now() + '_' + Math.floor(Math.random() * 100), kelas: kls, nama_materi: nama });
    
    // Simpan ke memori browser secara permanen
    localStorage.setItem('tpq_materi', JSON.stringify(dbMateri));
    
    // Sinkronisasi dropdown isian form jurnal secara seketika
    updateDropdownMateriForm(); 

    document.getElementById('materi-input-nama').value = '';
    alert('Materi baru berhasil disimpan ke database kurikulum!');
    renderDaftarMateriMaster();
}

function imporMateriMassal(e) {
    const kls = document.getElementById('materi-import-kelas').value;
    const file = e.target.files[0]; // PERBAIKAN: Memastikan file pertama terambil dengan benar
    if (!kls) { alert('Silakan tentukan kelas target impor terlebih dahulu!'); e.target.value = ''; return; }
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
        const text = evt.target.result;
        // PERBAIKAN: Membersihkan karakter \r (Windows) agar tidak merusak pembacaan teks
        const baris = text.replace(/\r/g, '').split('\n');
        let count = 0;
        let indexMateriCol = 0;

        if (baris.length > 0) {
            const headers = baris[0].toLowerCase().split(',');
            // PERBAIKAN: Pencarian nama header yang lebih akurat dan toleran terhadap spasi
            const foundIndex = headers.findIndex(h => h.trim().includes('materi'));
            if (foundIndex !== -1) indexMateriCol = foundIndex;
        }

        for (let i = 1; i < baris.length; i++) {
            if (baris[i].trim() === '') continue;
            
            let kolom = baris[i].split(',');
            let teksMateri = kolom[indexMateriCol] ? kolom[indexMateriCol].replace(/"/g, '').trim() : '';
            
            if (teksMateri) {
                dbMateri.push({ id: 'mat_' + Date.now() + '_' + i, kelas: kls, nama_materi: teksMateri });
                count++;
            }
        }

        localStorage.setItem('tpq_materi', JSON.stringify(dbMateri));
        
        // SINKRONISASI INSTAN: Langsung perbarui dropdown isi jurnal setelah impor sukses
        if (typeof updateDropdownMateriForm === 'function') {
            updateDropdownMateriForm();
        }

        alert(`Berhasil mengimpor ${count} materi ke kelas ${kls}!`);
        e.target.value = '';
        renderDaftarMateriMaster();
    };
    reader.readAsText(file);
}

function renderDaftarMateriMaster() {
    const tbody = document.getElementById('table-materi-rows');
    if (!tbody) return;
    
    const filterKlsSelect = document.getElementById('filter-materi-tampilan');
    let data = dbMateri;

    if (currentUser.role !== 'admin') {
        if (filterKlsSelect) {
            filterKlsSelect.value = currentUser.kelas;
            filterKlsSelect.disabled = true;
        }
        data = dbMateri.filter(x => x.kelas === currentUser.kelas);
    } else {
        if (filterKlsSelect) filterKlsSelect.disabled = false;
        const filterKls = filterKlsSelect ? filterKlsSelect.value : 'SEMUA';
        if (filterKls !== 'SEMUA') data = dbMateri.filter(x => x.kelas === filterKls);
    }

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#9ca3af; padding:20px;">Belum ada materi untuk kelas ini.</td></tr>`;
        return;
    }
    
    // HEADER TAMBAHAN UNTUK CHECKBOX PILIH SEMUA MATERI
    let html = `
        <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
            <th style="width: 40px; text-align: center; padding: 10px 6px;">
                <input type="checkbox" id="chk-all-materi" onchange="togglePilihSemuaMateri(this.checked)" style="width:16px; height:16px; cursor:pointer;">
            </th>
            <th style="text-align: left; padding: 10px 6px; font-size: 12px; color: #4b5563;">Daftar Materi Pokok</th>
            <th style="text-align: center; width: 150px; padding: 10px 6px;">
                <button onclick="hapusMateriTerpilih()" style="color:#dc2626; background:none; border:none; font-weight:bold; cursor:pointer; font-size:11px;">🗑️ Hapus Terpilih</button>
            </th>
        </tr>
    `;

    data.forEach(m => {
        html += `
            <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="text-align: center; padding: 8px 6px;">
                    <input type="checkbox" name="chk-materi-item" value="${m.id}" style="width:15px; height:16px; cursor:pointer;">
                </td>
                <td style="padding: 8px 6px;">
                    <span class="badge badge-kelas">${m.kelas}</span> 
                    <span style="font-weight:500; margin-left:6px;">${m.nama_materi}</span>
                </td>
                <td style="text-align:center; padding: 8px 6px;">
                    <button onclick="editMateriMaster('${m.id}')" style="color:#2563eb; background:none; border:none; font-weight:bold; cursor:pointer; font-size:12px;">✏️ Ubah</button>
                    <button onclick="hapusMateriMaster('${m.id}')" style="color:#dc2626; background:none; border:none; font-weight:bold; cursor:pointer; font-size:12px; margin-left:10px;">🗑️ Hapus</button>
                </td>
            </tr>`;
    });
    tbody.innerHTML = html;
}

// FUNGSI BARU: Mengubah isi materi kurikulum satuan
function editMateriMaster(id) {
    const m = dbMateri.find(x => x.id == id);
    if (!m) return;
    
    const namaBaru = prompt("Modifikasi Isi Materi Kurikulum:", m.nama_materi);
    if (namaBaru === null) return; // Batal klik
    if (namaBaru.trim() === "") { alert("Nama materi tidak boleh kosong!"); return; }
    
    m.nama_materi = namaBaru.trim();
    localStorage.setItem('tpq_materi', JSON.stringify(dbMateri));
    alert("Materi berhasil diperbarui!");
    renderDaftarMateriMaster();
    updateDropdownMateriForm();
}

// FUNGSI BARU: Check/Uncheck Semua Item Materi
function togglePilihSemuaMateri(isChecked) {
    const checkboxes = document.querySelectorAll('input[name="chk-materi-item"]');
    checkboxes.forEach(cb => cb.checked = isChecked);
}

// FUNGSI BARU: Menghapus Banyak Materi Sekaligus
function hapusMateriTerpilih() {
    const checkboxes = document.querySelectorAll('input[name="chk-materi-item"]:checked');
    if (checkboxes.length === 0) { alert("Silakan centang materi yang ingin dihapus terlebih dahulu!"); return; }
    
    if (confirm(`Apakah Anda yakin ingin menghapus ${checkboxes.length} materi terpilih secara massal?`)) {
        const idDihapus = Array.from(checkboxes).map(cb => cb.value);
        dbMateri = dbMateri.filter(x => !idDihapus.includes(x.id));
        localStorage.setItem('tpq_materi', JSON.stringify(dbMateri));
        alert("Materi terpilih berhasil dihapus!");
        renderDaftarMateriMaster();
        updateDropdownMateriForm();
    }
}

function hapusMateriMaster(id) {
    if (confirm('Hapus materi kurikulum ini dari database?')) {
        dbMateri = dbMateri.filter(x => x.id != id);
        localStorage.setItem('tpq_materi', JSON.stringify(dbMateri));
        renderDaftarMateriMaster();
    }
}

// =========================================================================
// CUSTOM REKAP ABSEN: OUTPUT RESUME STATISTIK SESUAI FILTER DASHBOARD (Fitur 15)
// =========================================================================
function exportKeCSV() {
    // 1. Ambil nilai filter yang sedang aktif di layar dashboard saat ini
    const fKelas = document.getElementById('dash-filter-kelas') ? document.getElementById('dash-filter-kelas').value : 'SEMUA';
    const fBulan = document.getElementById('dash-filter-bulan') ? document.getElementById('dash-filter-bulan').value : 'SEMUA';
    const fKelompok = document.getElementById('dash-filter-kelompok') ? document.getElementById('dash-filter-kelompok').value : 'SEMUA';

    // Nama teks bulan untuk keperluan tampilan tabel dokumen
    const namaBulanIndo = {
        "SEMUA": "Semua Bulan", "01": "Januari", "02": "Februari", "03": "Maret",
        "04": "April", "05": "Mei", "06": "Juni", "07": "Juli",
        "08": "Agustus", "09": "September", "10": "Oktober", "11": "November", "12": "Desember"
    };
    const teksBulanAktif = namaBulanIndo[fBulan] || fBulan;

    // 2. Filter data log presensi harian sesuai pilihan user
    let presensiTerfilter = currentUser.role !== 'admin' ? dbPresensi.filter(x => x.kelas === currentUser.kelas) : (fKelas !== 'SEMUA' ? dbPresensi.filter(x => x.kelas === fKelas) : dbPresensi);
    if (fBulan !== 'SEMUA') {
        presensiTerfilter = presensiTerfilter.filter(p => p.tanggal && p.tanggal.split('-')[1] === fBulan);
    }
    if (fKelompok !== 'SEMUA') {
        presensiTerfilter = presensiTerfilter.filter(p => p.kelompok === fKelompok);
    }

    // 3. Hitung total data log untuk kalkulasi persentase
    let totalAbsenLog = presensiTerfilter.length;
    let hCount = presensiTerfilter.filter(p => p.status === 'Hadir').length;
    let iCount = presensiTerfilter.filter(p => p.status === 'Izin').length;
    let sCount = presensiTerfilter.filter(p => p.status === 'Sakit').length;
    let aCount = presensiTerfilter.filter(p => p.status === 'Alpa').length;

    // Hitung rasio persentase masing-masing status
    let persenHadir = totalAbsenLog > 0 ? Math.round((hCount / totalAbsenLog) * 100) : 0;
    let persenIzin = totalAbsenLog > 0 ? Math.round((iCount / totalAbsenLog) * 100) : 0;
    let persenSakit = totalAbsenLog > 0 ? Math.round((sCount / totalAbsenLog) * 100) : 0;
    let persenAlpa = totalAbsenLog > 0 ? Math.round((aCount / totalAbsenLog) * 100) : 0;

    // 4. Susun struktur konten file CSV Excel sesuai pesanan kolom Anda
    // \uFEFF digunakan agar huruf/simbol di Excel tidak berantakan saat dibuka otomatis
    let csvContent = "\uFEFFPersentase Absensi,Nama Kelas,Bulan,Kelompok\n";
    
    // Baris 2: Data Hadir
    csvContent += `Hadir (${persenHadir}%),"${fKelas}","${teksBulanAktif}","${fKelompok}"\n`;
    // Baris 3: Data Izin
    csvContent += `Izin (${persenIzin}%),"${fKelas}","${teksBulanAktif}","${fKelompok}"\n`;
    // Baris 4: Data Sakit
    csvContent += `Sakit (${persenSakit}%),"${fKelas}","${teksBulanAktif}","${fKelompok}"\n`;
    // Baris 5: Data Alpa
    csvContent += `Alpha (${persenAlpa}%),"${fKelas}","${teksBulanAktif}","${fKelompok}"\n`;

    // 5. Perintah meluncurkan unduhan file Excel/CSV otomatis ke folder download laptop/HP
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    
    // Penamaan file download dinamis mengikuti tanggal hari ini
    const tglUnduh = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `Rekap_Resume_Presensi_TPQ_${tglUnduh}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
window.onload = initApp;

// PERBAIKAN: Tambahkan fungsi baru ini (bisa diletakkan di bagian paling bawah file backend.js)
function hapusMateriMaster(id) {
    if (confirm('Hapus materi kurikulum ini dari database?')) {
        dbMateri = dbMateri.filter(x => x.id != id);
        localStorage.setItem('tpq_materi', JSON.stringify(dbMateri));
        renderDaftarMateriMaster();
    }
}
function handleLogin(e) {
    if (e) e.preventDefault();
    const uEl = document.getElementById('login-username');
    const pEl = document.getElementById('login-password');
    if (!uEl || !pEl) return;

    const u = uEl.value.trim();
    const p = pEl.value;
    const match = dbUsers.find(x => x.username === u && x.password === p);
    
    if (match) {
        currentUser = { username: match.username, role: match.role, kelas: match.kelas };
        localStorage.setItem('tpq_session', JSON.stringify(currentUser));
        masukKeAplikasi();
        uEl.value = '';
        pEl.value = '';
    } else { 
        alert('Username atau password salah!'); 
    }
}

function handleLogout() {
    localStorage.removeItem('tpq_session');
    currentUser = { username: '', role: '', kelas: '' };
    const appContent = document.getElementById('app-content');
    const viewLogin = document.getElementById('view-login');
    if (appContent) appContent.style.display = 'none';
    if (viewLogin) viewLogin.style.display = 'flex';
    currentView = 'login';
}

// =========================================================================
// KODE EKSPOS WINDOW GLOBAL YANG BERSIH TANPA KURUNG KURAWAL GANDA (Fitur 1-12)
// =========================================================================
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.gantiMenu = gantiMenu;
window.bukaIsiJurnalBaru = bukaIsiJurnalBaru;
window.simpanJurnal = simpanJurnal;
window.editJurnal = editJurnal;
window.hapusJurnal = hapusJurnal;
window.simpanAkun = simpanAkun;
window.editAkun = editAkun;
window.hapusAkun = hapusAkun;
window.resetAkunForm = resetAkunForm;
window.tambahMateriSatuan = tambahMateriSatuan;
window.imporMateriMassal = imporMateriMassal;
window.renderDaftarMateriMaster = renderDaftarMateriMaster;
window.hapusMateriMaster = hapusMateriMaster;
window.exportKeCSV = exportKeCSV;

window.bukaMenuPresensiBaru = bukaMenuPresensiBaru;
window.renderRiwayatPresensi = renderRiwayatPresensi;
window.muatDaftarSiswaAbsen = muatDaftarSiswaAbsen;
window.simpanPresensiMassal = simpanPresensiMassal;
window.hapusPresensiSatuan = hapusPresensiSatuan;
window.editPresensiSatuan = editPresensiSatuan;
window.resetFormPresensi = resetFormPresensi;

// =========================================================================
// LOGIKA ENGINE FITUR 12: MANAJEMEN PRESENSI SISWA (CRUD DASAR)
// =========================================================================

// Fungsi saat tombol menu presensi di navigasi bawah diklik
// GANTI FUNGSI bukaMenuPresensiBaru() DENGAN INI
function bukaMenuPresensiBaru() {
    document.getElementById('presensi-id-edit').value = '';
    document.getElementById('presensi-tanggal').value = new Date().toISOString().split('T')[0];
    document.getElementById('presensi-form-title').innerText = 'Input Presensi Santri Baru';
    if (document.getElementById('btn-batal-presensi')) document.getElementById('btn-batal-presensi').style.display = 'none';

    const filterPresensiSelect = document.getElementById('filter-presensi-tampilan');

    if (currentUser.role === 'admin') {
        if (document.getElementById('presensi-box-kelas-admin')) document.getElementById('presensi-box-kelas-admin').style.display = 'block';
        if (document.getElementById('presensi-kelas-guru')) document.getElementById('presensi-kelas-guru').style.display = 'none';
        if (document.getElementById('presensi-kelas-admin')) document.getElementById('presensi-kelas-admin').value = '';
        if (filterPresensiSelect) filterPresensiSelect.disabled = false; // Admin bebas memilih filter log
        if (document.getElementById('lembar-absen-murid')) {
            document.getElementById('lembar-absen-murid').innerHTML = `<p style="text-align: center; color: #9ca3af; font-size: 13px; padding: 10px;">Silakan pilih kelas terlebih dahulu untuk memuat daftar nama santri.</p>`;
        }
    } else {
        if (document.getElementById('presensi-box-kelas-admin')) document.getElementById('presensi-box-kelas-admin').style.display = 'none';
        if (document.getElementById('presensi-kelas-guru')) document.getElementById('presensi-kelas-guru').style.display = 'block';
        if (document.getElementById('presensi-kelas-guru')) document.getElementById('presensi-kelas-guru').value = currentUser.kelas;
        
        // ISOLASI LOG PRESENSI GURU: Paksa dropdown filter log presensi mengikuti kelas guru & matikan fiturnya
        if (filterPresensiSelect) {
            filterPresensiSelect.value = currentUser.kelas;
            filterPresensiSelect.disabled = true;
        }
        muatDaftarSiswaAbsen();
    }
    gantiMenu('presensi');
}

// Fungsi pembantu untuk merender data log riwayat di menu presensi
function renderRiwayatPresensi() {
    const tbody = document.getElementById('table-presensi-rows');
    if (!tbody) return;

    let data = dbPresensi;
    // Jika admin, filter berdasarkan dropdown filter yang dipilih
    if (currentUser.role === 'admin') {
        const fKls = document.getElementById('filter-presensi-tampilan').value;
        if (fKls !== 'SEMUA') {
            data = dbPresensi.filter(x => x.kelas === fKls);
        }
    } else {
        // Jika guru, otomatis saring hanya kelas miliknya saja
        data = dbPresensi.filter(x => x.kelas === currentUser.kelas);
    }

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #9ca3af; padding: 20px;">Belum ada data presensi terinput.</td></tr>`;
        return;
    }

    let html = '';
    // Urutkan riwayat berdasarkan tanggal terbaru
    const sortedData = [...data].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

    sortedData.forEach(p => {
        const opt = { year: 'numeric', month: 'long', day: 'numeric' };
        const tglFormat = new Date(p.tanggal).toLocaleDateString('id-ID', opt);
        
        html += `
            <tr>
                <td><strong>${tglFormat}</strong><br><span class="badge badge-kelas">${p.kelas}</span></td>
                <td><strong>${p.nama_siswa}</strong><br><span style="font-size: 11px; color: #6b7280;">Kelompok: ${p.kelompok || '-'}</span></td>
                <td><span class="badge" style="background: ${getStatusWarna(p.status)}; color: white;">${p.status}</span></td>
                <td style="text-align: center;">
                    <button onclick="editPresensiSatuan('${p.id}')" style="color: #2563eb; background: none; border: none; font-weight: bold; cursor: pointer; font-size: 12px;">✏️ Ubah</button>
                    <button onclick="hapusPresensiSatuan('${p.id}')" style="color: #dc2626; background: none; border: none; font-weight: bold; cursor: pointer; font-size: 12px; margin-left: 6px;">🗑️ Hapus</button>
                </td>
            </tr>`;
    });
    tbody.innerHTML = html;
}

// Helper warna untuk status presensi
function getStatusWarna(status) {
    if (status === 'Hadir') return '#059669';
    if (status === 'Izin') return '#d97706';
    if (status === 'Sakit') return '#2563eb';
    return '#dc2626'; // Alpa
}

// Tambahkan pemicu presensi ke fungsi gantiMenu() bawaan Anda
// Masukkan logika ini di fungsi gantiMenu(viewName) di bagian percabangan else if:
// else if (viewName === 'presensi') { renderRiwayatPresensi(); }

// EKSPOS GLOBAL AGAR HTML BISA MEMBACA KLIK
window.bukaMenuPresensiBaru = bukaMenuPresensiBaru;
window.renderRiwayatPresensi = renderRiwayatPresensi;


// =========================================================================
// KODE PELENGKAP FITUR 12: MEMPROSES CHECKLIST SISWA & OPERASI CRUD ABSENSI
// =========================================================================



// 1. Fungsi memuat daftar murid secara dinamis dengan opsi pilihan radio (H/I/S/A)
function muatDaftarSiswaAbsen() {
    const lembarAbsen = document.getElementById('lembar-absen-murid');
    if (!lembarAbsen) return;

    let klsAktif = currentUser.role === 'admin' ? document.getElementById('presensi-kelas-admin').value : currentUser.kelas;

    if (!klsAktif) {
        lembarAbsen.innerHTML = `<p style="text-align: center; color: #9ca3af; font-size: 13px; padding: 10px;">Silakan pilih kelas terlebih dahulu untuk memuat daftar nama santri.</p>`;
        return;
    }

    let muridTerfilter = dbSiswa.filter(x => x.kelas === klsAktif);

    if (muridTerfilter.length === 0) {
        lembarAbsen.innerHTML = `<p style="text-align: center; color: #dc2626; font-size: 13px; padding: 10px;">⚠️ Belum ada data nama siswa di kelas ${klsAktif}.</p>`;
        return;
    }

    let html = '';
    muridTerfilter.forEach((m, idx) => {
        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                <div style="max-width: 50%;">
                    <p style="font-size: 14px; font-weight: bold; color: #111827;">${m.nama}</p>
                    <p style="font-size: 11px; color: #6b7280;">Kelompok: ${m.kelompok}</p>
                    <input type="hidden" name="absen_id_siswa" value="${m.id}">
                    <input type="hidden" name="absen_nama_siswa" value="${m.nama}">
                    <input type="hidden" name="absen_kelompok_siswa" value="${m.kelompok}">
                </div>
                <div style="display: flex; gap: 8px; font-size: 13px; font-weight: 600;">
                    <label style="color:#059669;"><input type="radio" name="status_${m.id}" value="Hadir" checked> H</label>
                    <label style="color:#d97706;"><input type="radio" name="status_${m.id}" value="Izin"> I</label>
                    <label style="color:#2563eb;"><input type="radio" name="status_${m.id}" value="Sakit"> S</label>
                    <label style="color:#dc2626;"><input type="radio" name="status_${m.id}" value="Alpa"> A</label>
                </div>
            </div>`;
    });
    lembarAbsen.innerHTML = html;
}

// 2. Fungsi Aksi Menyimpan Hasil Input Presensi Massal ke Database
function simpanPresensiMassal(e) {
    e.preventDefault();
    const idEdit = document.getElementById('presensi-id-edit').value;
    const tgl = document.getElementById('presensi-tanggal').value;
    let kls = currentUser.role === 'admin' ? document.getElementById('presensi-kelas-admin').value : currentUser.kelas;

    if (!kls) { alert('Silakan tentukan kelas absensi!'); return; }

    // Jika dalam mode Edit Satuan
    if (idEdit) {
        const idx = dbPresensi.findIndex(x => x.id === idEdit);
        if (idx !== -1) {
            // Cari status radio tunggal yang dipilih saat edit
            const idSiswaTunggal = dbPresensi[idx].id_siswa;
            const radioTerpilih = document.querySelector(`input[name="status_${idSiswaTunggal}"]:checked`);
            if (radioTerpilih) {
                dbPresensi[idx].tanggal = tgl;
                dbPresensi[idx].status = radioTerpilih.value;
            }
        }
    } else {
        // Jika dalam mode Input Baru Massal
        const containerAbsen = document.getElementById('lembar-absen-murid');
        const listIdSiswa = containerAbsen.querySelectorAll('input[name="absen_id_siswa"]');
        const listNamaSiswa = containerAbsen.querySelectorAll('input[name="absen_nama_siswa"]');
        const listKelompokSiswa = containerAbsen.querySelectorAll('input[name="absen_kelompok_siswa"]');

        listIdSiswa.forEach((elm, index) => {
            const idSiswa = elm.value;
            const namaSiswa = listNamaSiswa[index].value;
            const kelSiswa = listKelompokSiswa[index].value;
            const statusTerpilih = containerAbsen.querySelector(`input[name="status_${idSiswa}"]:checked`).value;

            // Simpan setiap entri absensi santri ke database
            dbPresensi.push({
                id: 'abs_' + Date.now() + '_' + index,
                kelas: kls,
                tanggal: tgl,
                id_siswa: idSiswa,
                nama_siswa: namaSiswa,
                kelompok: kelSiswa,
                status: statusTerpilih
            });
        });
    }

    localStorage.setItem('tpq_presensi', JSON.stringify(dbPresensi));
    alert('Data presensi santri berhasil disimpan!');
    resetFormPresensi();
    renderRiwayatPresensi();
}

// 3. Fungsi Menghapus Riwayat Presensi
function hapusPresensiSatuan(id) {
    if (confirm('Apakah Anda yakin ingin menghapus catatan presensi siswa ini?')) {
        dbPresensi = dbPresensi.filter(x => x.id !== id);
        localStorage.setItem('tpq_presensi', JSON.stringify(dbPresensi));
        renderRiwayatPresensi();
    }
}

// 4. Fungsi Mengubah Status Kehadiran Presensi Lama
function editPresensiSatuan(id) {
    const item = dbPresensi.find(x => x.id === id);
    if (!item) return;

    document.getElementById('presensi-id-edit').value = item.id;
    document.getElementById('presensi-tanggal').value = item.tanggal;
    document.getElementById('presensi-form-title').innerText = 'Ubah Status Presensi Santri';
    
    // PERBAIKAN: .style.style yang ganda sudah diperbaiki menjadi .style saja
    if(document.getElementById('btn-batal-presensi')) {
        document.getElementById('btn-batal-presensi').style.display = 'inline-block';
    }

    if (currentUser.role === 'admin') {
        if(document.getElementById('presensi-box-kelas-admin')) document.getElementById('presensi-box-kelas-admin').style.display = 'block';
        if(document.getElementById('presensi-kelas-guru')) document.getElementById('presensi-kelas-guru').style.display = 'none';
        if(document.getElementById('presensi-kelas-admin')) document.getElementById('presensi-kelas-admin').value = item.kelas;
    }

    const lembarAbsen = document.getElementById('lembar-absen-murid');
    if(lembarAbsen) {
        lembarAbsen.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; background: #fffbeb; border-radius: 8px; padding: 10px;">
                <div>
                    <p style="font-size: 14px; font-weight: bold; color: #111827;">${item.nama_siswa}</p>
                    <p style="font-size: 11px; color: #6b7280;">Kelompok: ${item.kelompok} (${item.kelas})</p>
                </div>
                <div style="display: flex; gap: 8px; font-size: 13px; font-weight: 600;">
                    <label style="color:#059669;"><input type="radio" name="status_${item.id_siswa}" value="Hadir" ${item.status === 'Hadir' ? 'checked' : ''}> H</label>
                    <label style="color:#d97706;"><input type="radio" name="status_${item.id_siswa}" value="Izin" ${item.status === 'Izin' ? 'checked' : ''}> I</label>
                    <label style="color:#2563eb;"><input type="radio" name="status_${item.id_siswa}" value="Sakit" ${item.status === 'Sakit' ? 'checked' : ''}> S</label>
                    <label style="color:#dc2626;"><input type="radio" name="status_${item.id_siswa}" value="Alpa" ${item.status === 'Alpa' ? 'checked' : ''}> A</label>
                </div>
            </div>`;
    }
}
function resetFormPresensi() {
    document.getElementById('presensi-id-edit').value = '';
    document.getElementById('presensi-form-title').innerText = 'Input Presensi Santri Baru';
    if (document.getElementById('btn-batal-presensi')) {
        document.getElementById('btn-batal-presensi').style.display = 'none';
    }
    
    // Format pengisian tanggal otomatis yang aman (string teks murni)
    document.getElementById('presensi-tanggal').value = new Date().toISOString().split('T')[0];
    
    if (currentUser.role === 'admin') {
        if (document.getElementById('presensi-box-kelas-admin')) document.getElementById('presensi-box-kelas-admin').style.display = 'block';
        if (document.getElementById('presensi-kelas-guru')) document.getElementById('presensi-kelas-guru').style.display = 'none';
        if (document.getElementById('presensi-kelas-admin')) document.getElementById('presensi-kelas-admin').value = '';
    } else {
        if (document.getElementById('presensi-box-kelas-admin')) document.getElementById('presensi-box-kelas-admin').style.display = 'none';
        if (document.getElementById('presensi-kelas-guru')) document.getElementById('presensi-kelas-guru').style.display = 'block';
        if (document.getElementById('presensi-kelas-guru')) document.getElementById('presensi-kelas-guru').value = currentUser.kelas;
    }
    
    // PERBAIKAN UTAMA: Memanggil fungsi memuat siswa secara bersih tanpa parameter variabel 'item'
    muatDaftarSiswaAbsen();
}

// EKSPOS GLOBAL KE WINDOW BROWSER
window.muatDaftarSiswaAbsen = muatDaftarSiswaAbsen;
window.simpanPresensiMassal = simpanPresensiMassal;
window.hapusPresensiSatuan = hapusPresensiSatuan;
window.editPresensiSatuan = editPresensiSatuan;
window.resetFormPresensi = resetFormPresensi;

// =========================================================================
// LOGIKA ENGINE FITUR 13: CRUD DATA SISWA & IMPOR MASSAL (ANTI-CRASH)
// =========================================================================

// Fungsi Merender Daftar Murid ke Tabel Monitor
function renderTabelSiswaMaster() {
    const tbody = document.getElementById('table-siswa-rows');
    if (!tbody) return;

    const filterKls = document.getElementById('filter-siswa-tampilan').value;
    let data = dbSiswa;

    // Jika login guru biasa, kunci filter agar hanya menampilkan kelasnya sendiri
    if (currentUser.role !== 'admin') {
        document.getElementById('filter-siswa-tampilan').value = currentUser.kelas;
        document.getElementById('filter-siswa-tampilan').disabled = true;
        data = dbSiswa.filter(x => x.kelas === currentUser.kelas);
    } else {
        document.getElementById('filter-siswa-tampilan').disabled = false;
        if (filterKls !== 'SEMUA') {
            data = dbSiswa.filter(x => x.kelas === filterKls);
        }
    }

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#9ca3af; padding:20px;">Belum ada data siswa untuk kelas ini.</td></tr>`;
        return;
    }

    let html = '';
    // Urutkan nama santri berdasarkan abjad A-Z agar rapi
    const sortedData = [...data].sort((a, b) => a.nama.localeCompare(b.nama));

    sortedData.forEach(s => {
        html += `
            <tr>
                <td style="font-weight:600; color:#111827;">${s.nama}</td>
                <td><span class="badge badge-kelas">${s.kelas}</span><br><span style="font-size:11px; color:#6b7280;">Kelompok: ${s.kelompok}</span></td>
                <td style="text-align:center;">
                    <button onclick="editSiswaSatuan('${s.id}')" style="color:#2563eb; background:none; border:none; font-weight:bold; cursor:pointer; font-size:13px;">✏️ Ubah</button>
                    <button onclick="hapusSiswaSatuan('${s.id}')" style="color:#dc2626; background:none; border:none; font-weight:bold; cursor:pointer; font-size:13px; margin-left:10px;">🗑️ Hapus</button>
                </td>
            </tr>`;
    });
    tbody.innerHTML = html;
}

// Fungsi Simpan Input Siswa Satuan (Tambah Baru / Ubah Data Lama)
function simpanSiswaSatuan(e) {
    e.preventDefault();
    const idEdit = document.getElementById('siswa-id-edit').value;
    const nama = document.getElementById('siswa-input-nama').value.trim();
    const kls = document.getElementById('siswa-input-kelas').value;
    const kel = document.getElementById('siswa-input-kelompok').value.trim();

    if (!kls) { alert('Silakan pilih penempatan kelas terlebih dahulu!'); return; }

    if (idEdit) {
        const idx = dbSiswa.findIndex(x => x.id === idEdit);
        if (idx !== -1) {
            dbSiswa[idx] = { id: idEdit, nama: nama, kelas: kls, kelompok: kel };
            alert('Data perkembangan santri berhasil diperbarui!');
        }
    } else {
        dbSiswa.push({
            id: 'sis_' + Date.now(),
            nama: nama,
            kelas: kls,
            kelompok: kel
        });
        alert('Data santri baru berhasil ditambahkan!');
    }

     localStorage.setItem('tpq_siswa', JSON.stringify(dbSiswa));
    alert('Data santri baru berhasil ditambahkan!');
    
    resetFormSiswa(); // Memanggil fungsi reset yang sudah diperbaiki di atas
    renderTabelSiswaMaster();
    if (typeof muatDaftarSiswaAbsen === 'function') muatDaftarSiswaAbsen();
}

// Fungsi Edit Mengisi Kembali Form Siswa
function editSiswaSatuan(id) {
    const s = dbSiswa.find(x => x.id === id);
    if (!s) return;

    document.getElementById('siswa-id-edit').value = s.id;
    document.getElementById('siswa-input-nama').value = s.nama;
    document.getElementById('siswa-input-kelas').value = s.kelas;
    document.getElementById('siswa-input-kelompok').value = s.kelompok;
    document.getElementById('siswa-form-title').innerText = 'Ubah Detail Data Santri';
    if(document.getElementById('btn-batal-siswa')) document.getElementById('btn-batal-siswa').style.display = 'inline-block';
}

// Fungsi Hapus Santri dari Database Master
function hapusSiswaSatuan(id) {
    if (confirm('Apakah Anda yakin ingin menghapus data santri ini dari database master?')) {
        dbSiswa = dbSiswa.filter(x => x.id !== id);
        localStorage.setItem('tpq_siswa', JSON.stringify(dbSiswa));
        renderTabelSiswaMaster();
        if (typeof muatDaftarSiswaAbsen === 'function') muatDaftarSiswaAbsen();
    }
}

// Fungsi Impor Massal Data Siswa via CSV (Kebal terhadap \r Windows)
function imporSiswaMassal(e) {
    const file = e.target.files[0]; // Memastikan file pertama terambil dengan benar
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
        const text = evt.target.result;
        const baris = text.replace(/\r/g, '').split('\n');
        let count = 0;
        
        if (baris.length === 0 || baris[0].trim() === '') {
            alert('File CSV kosong atau tidak valid!');
            return;
        }

        // Deteksi otomatis pemisah teks (Koma atau Titik Koma Excel)
        let pemisah = ',';
        if (baris[0].includes(';')) {
            pemisah = ';';
        }

        let idxNama = 0, idxKelas = 1, idxKelompok = 2;

        // Baca Baris Header Pertama
        const headers = baris[0].toLowerCase().split(pemisah).map(h => h.trim());
        const fNama = headers.findIndex(h => h.includes('nama'));
        const fKelas = headers.findIndex(h => h.includes('kelas'));
        const fKel = headers.findIndex(h => h.includes('kelompok'));
        
        if (fNama !== -1) idxNama = fNama;
        if (fKelas !== -1) idxKelas = fKelas;
        if (fKel !== -1) idxKelompok = fKel;

        // Proses Membaca Baris Data Murid
        for (let i = 1; i < baris.length; i++) {
            if (baris[i].trim() === '') continue;
            let kolom = baris[i].split(pemisah);
            
            let tNama = kolom[idxNama] ? kolom[idxNama].replace(/^["\s\uFEFF\xA0]+|["\s\uFEFF\xA0]+$/g, '').trim() : '';
            let tKelas = kolom[idxKelas] ? kolom[idxKelas].replace(/^["\s\uFEFF\xA0]+|["\s\uFEFF\xA0]+$/g, '').trim() : '';
            let tKel = kolom[idxKelompok] ? kolom[idxKelompok].replace(/^["\s\uFEFF\xA0]+|["\s\uFEFF\xA0]+$/g, '').trim() : '';

            // =========================================================================
            // LOGIKA PINTAR BARU: Konversi otomatis angka murni "1" menjadi "Kelas 1"
            // =========================================================================
            if (tKelas === '1' || tKelas === '2' || tKelas === '3' || tKelas === '4' || tKelas === '5' || tKelas === '6') {
                tKelas = 'Kelas ' + tKelas;
            }

            // Lakukan pengecekan kecocokan kelas secara toleran
            const kelasCocok = daftarKelas.find(k => k.toLowerCase() === tKelas.toLowerCase());

            if (tNama && kelasCocok) {
                dbSiswa.push({
                    id: 'sis_' + Date.now() + '_' + i + '_' + Math.floor(Math.random() * 1000),
                    nama: tNama,
                    kelas: kelasCocok, // Format otomatis terstandar ("Kelas 1", "Kelas 2", dst)
                    kelompok: tKel || 'Umum'
                });
                count++;
            }
        }

        localStorage.setItem('tpq_siswa', JSON.stringify(dbSiswa));
        alert(`Alhamdulillah, berhasil mengimpor total ${count} data santri baru (PAUD s/d Kelas 6) ke database TPQ!`);
        e.target.value = '';
        
        const filterSiswa = document.getElementById('filter-siswa-tampilan');
        if (filterSiswa && currentUser.role === 'admin') {
            filterSiswa.value = 'SEMUA';
        }
        
        renderTabelSiswaMaster();
        if (typeof muatDaftarSiswaAbsen === 'function') muatDaftarSiswaAbsen(); // Sinkron ke lembar presensi
    };
    reader.readAsText(file, 'UTF-8');
}

function resetFormSiswa() {
    document.getElementById('siswa-id-edit').value = '';
    document.getElementById('siswa-input-nama').value = '';
    document.getElementById('siswa-input-kelas').value = '';
    document.getElementById('siswa-input-kelompok').value = '';
    document.getElementById('siswa-form-title').innerText = 'Tambah Data Siswa (Satuan)';
    if(document.getElementById('btn-batal-siswa')) document.getElementById('btn-batal-siswa').style.display = 'none';
    
    // PERBAIKAN: Setel filter tabel ke "SEMUA" agar data yang baru diinput langsung kelihatan
    const filterSiswa = document.getElementById('filter-siswa-tampilan');
    if (filterSiswa && currentUser.role === 'admin') {
        filterSiswa.value = 'SEMUA';
    }
}

// EKSPOS GLOBAL AGAR HTML BISA MEMBACA FUNGSI KLIK ANDA
window.renderTabelSiswaMaster = renderTabelSiswaMaster;
window.simpanSiswaSatuan = simpanSiswaSatuan;
window.editSiswaSatuan = editSiswaSatuan;
window.hapusSiswaSatuan = hapusSiswaSatuan;
window.imporSiswaMassal = imporSiswaMassal;
window.resetFormSiswa = resetFormSiswa;


// =========================================================================
// LOGIKA ENGINE FITUR 14 & 15: GRAFIK RESUME, TARGET SISWA & EKSPOR DATA
// =========================================================================


// 1. Fungsi Switcher Tab Menu Materi vs Target
function toggleTabMateri(mode) {
    const btnMaster = document.getElementById('tab-btn-master');
    const btnSiswa = document.getElementById('tab-btn-siswa');
    const boxMaster = document.getElementById('sub-tab-master-materi');
    const boxSiswa = document.getElementById('sub-tab-siswa-materi');
    if(!btnMaster || !btnSiswa) return;

    if (mode === 'master') {
        btnMaster.style.background = 'white'; btnMaster.style.color = '#111827';
        btnSiswa.style.background = 'none'; btnSiswa.style.color = '#6b7280';
        if(boxMaster) boxMaster.style.display = 'block';
        if(boxSiswa) boxSiswa.style.display = 'none';
        
        // PROTEKSI FORM INPUT: Kunci otomatis dropdown input kelas satuan & massal milik guru
        const matInputKelas = document.getElementById('materi-input-kelas');
        const matImportKelas = document.getElementById('materi-import-kelas');
        if (currentUser.role !== 'admin') {
            if (matInputKelas) { matInputKelas.value = currentUser.kelas; matInputKelas.disabled = true; }
            if (matImportKelas) { matImportKelas.value = currentUser.kelas; matImportKelas.disabled = true; }
        } else {
            if (matInputKelas) matInputKelas.disabled = false;
            if (matImportKelas) matImportKelas.disabled = false;
        }

        renderDaftarMateriMaster();
    } else {
        btnMaster.style.background = 'none'; btnMaster.style.color = '#6b7280';
        btnSiswa.style.background = 'white'; btnSiswa.style.color = '#111827';
        if(boxMaster) boxMaster.style.display = 'none';
        if(boxSiswa) boxSiswa.style.display = 'block';
        
        const targetKlsSelect = document.getElementById('target-siswa-kelas');
        if (targetKlsSelect) {
            let opsiHtml = '<option value="">-- Pilih Kelas --</option>';
            daftarKelas.forEach(k => { opsiHtml += `<option value="${k}">${k}</option>`; });
            targetKlsSelect.innerHTML = opsiHtml;
        }
        if (currentUser.role !== 'admin' && targetKlsSelect) {
            targetKlsSelect.value = currentUser.kelas;
            targetKlsSelect.disabled = true; // Kunci menu capaian target siswa agar guru fokus pada kelasnya
            muatDaftarSiswaTargetDropdown();
        }
    }
}

// 2. Muat Daftar Nama Siswa di Dropdown Berdasarkan Kelas Aktif
function muatDaftarSiswaTargetDropdown() {
    const klsSelect = document.getElementById('target-siswa-kelas');
    const siswaSelect = document.getElementById('target-siswa-nama');
    if (!klsSelect || !siswaSelect) return;

    let klsAktif = klsSelect.value;
    if (!klsAktif) {
        siswaSelect.innerHTML = '<option value="">-- Pilih Santri --</option>';
        return;
    }

    let muridTerfilter = dbSiswa.filter(x => x.kelas === klsAktif);
    let html = '<option value="">-- Pilih Santri --</option>';
    muridTerfilter.forEach(m => {
        html += `<option value="${m.id}">${m.nama} (${m.kelompok})</option>`;
    });
    siswaSelect.innerHTML = html;
    document.getElementById('lembar-checklist-materi-murid').innerHTML = 
        `<p style="text-align: center; color: #9ca3af; font-size: 13px; padding: 10px;">Silakan tentukan nama santri terlebih dahulu untuk mengelola capaian target kurikulum.</p>`;
}

// 3. Merender Lembar Checklist Kurikulum Khusus Per Murid yang Dipilih
// Database Penyimpan Nilai Angka Raport Tambahan (Agar tersimpan permanen saat reload)
let dbNilaiRaport = JSON.parse(localStorage.getItem('tpq_nilai_raport')) || {};

// =========================================================================
// PERBAIKAN UTAMA: MODUL MONITORING TARGET & PERSENTASE KELULUSAN LIVE (Fitur 14)
// =========================================================================
function muatLembarMatriksChecklistSiswa() {
    const idSiswa = document.getElementById('target-siswa-nama').value;
    const klsAktif = document.getElementById('target-siswa-kelas').value;
    const container = document.getElementById('lembar-checklist-materi-murid');
    const boxResume = document.getElementById('box-resume-persen-target');
    
    if (!container) return;

    // Jika nama santri belum ditentukan/kosong, sembunyikan resume dan kembalikan teks panduan awal
    if (!idSiswa) {
        if (boxResume) boxResume.style.display = 'none';
        container.innerHTML = `<p style="text-align: center; color: #9ca3af; font-size: 13px; padding: 10px;">Silakan tentukan nama santri terlebih dahulu untuk memuat matriks target.</p>`;
        return;
    }

    // Ambil master materi kurikulum yang terdaftar di kelas aktif saat ini
    let materiTerfilter = dbMateri.filter(x => x.kelas === klsAktif);
    
    if (materiTerfilter.length === 0) {
        if (boxResume) boxResume.style.display = 'none';
        container.innerHTML = `<p style="text-align: center; color: #dc2626; font-size: 13px; padding: 10px;">⚠️ Belum ada master data materi kurikulum terinput untuk kelas ${klsAktif}. Silakan isi di tab sebelah.</p>`;
        return;
    }

    // Pastikan array penampung checklist anak di database virtual sudah siap bekerja
    if (!dbTargetSiswa[idSiswa]) dbTargetSiswa[idSiswa] = [];

    // =========================================================================
    // HITUNG PERSENTASE KELULUSAN TARGET MATERI SECARA LIVE & DINAMIS
    // =========================================================================
    let totalMateriKurikulum = materiTerfilter.length;
    
    // Hitung berapa banyak materi di kelas ini yang nama materinya ada di dalam record lulus milik anak
    let jumlahMateriTuntas = materiTerfilter.filter(m => dbTargetSiswa[idSiswa].includes(m.nama_materi)).length;
    
    // Hitung rasio persentase
    let persenKelulusan = totalMateriKurikulum > 0 ? Math.round((jumlahMateriTuntas / totalMateriKurikulum) * 100) : 0;

    // Suntikkan teks angka kalkulasi ke boks hijau resume antarmuka HTML
    const persenTeks = document.getElementById('target-persen-kelulusan-teks');
    const hitunganTeks = document.getElementById('target-hitungan-materi-teks');
    
    if (persenTeks) persenTeks.innerText = persenKelulusan + '%';
    if (hitunganTeks) hitunganTeks.innerText = `(${jumlahMateriTuntas} dari ${totalMateriKurikulum} Materi Tuntas)`;
    if (boxResume) boxResume.style.display = 'block'; // Tampilkan boks rangkuman persen ke layar

    // =========================================================================
    // RENDER DAFTAR ITEM CHECKLIST MATERI YANG SUDAH/BELUM TERCAPAI
    // =========================================================================
    let htmlChecklist = '';
    materiTerfilter.forEach(m => {
        const sudahLulus = dbTargetSiswa[idSiswa].includes(m.nama_materi);
        htmlChecklist += `
            <div style="display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                <input type="checkbox" id="chk_${m.id}" value="${m.nama_materi}" ${sudahLulus ? 'checked' : ''} 
                    onchange="updateStatusCapaianSiswaDinamis('${idSiswa}', '${m.nama_materi}', this.checked)"
                    style="width: 18px; height: 18px; accent-color: #059669; cursor: pointer; margin-right: 12px;">
                <label for="chk_${m.id}" style="font-size: 14px; font-weight: 500; color: #374151; cursor: pointer; flex: 1;">${m.nama_materi}</label>
            </div>`;
    });
    container.innerHTML = htmlChecklist;
}

// FUNGSI BARU PEMBANTU: Menyimpan centang sekaligus memicu hitung ulang persentase secara real-time
function updateStatusCapaianSiswaDinamis(idSiswa, namaMateri, isChecked) {
    if (!dbTargetSiswa[idSiswa]) dbTargetSiswa[idSiswa] = [];

    if (isChecked) {
        if (!dbTargetSiswa[idSiswa].includes(namaMateri)) {
            dbTargetSiswa[idSiswa].push(namaMateri);
        }
    } else {
        dbTargetSiswa[idSiswa] = dbTargetSiswa[idSiswa].filter(x => x !== namaMateri);
    }

    localStorage.setItem('tpq_target_siswa', JSON.stringify(dbTargetSiswa));
    
    // Picu hitung ulang angka persentase secara live di layar tanpa me-refresh halaman browser
    muatLembarMatriksChecklistSiswa();
}

// Daftarkan nama fungsi pembantu baru ini ke jendela global paling bawah file backend.js Anda
window.updateStatusCapaianSiswaDinamis = updateStatusCapaianSiswaDinamis;

// FUNGSI BARU: Menyimpan angka input nilai secara otomatis (Real-Time Save)
function updateNilaiSantriOtomatis(idSiswa, idMateri, nilaiAngka) {
    let nilaiKey = `${idSiswa}_${idMateri}`;
    let validNilai = parseInt(nilaiAngka) || 0;
    
    if (validNilai > 100) validNilai = 100;
    if (validNilai < 0) validNilai = 0;

    dbNilaiRaport[nilaiKey] = validNilai;
    localStorage.setItem('tpq_nilai_raport', JSON.stringify(dbNilaiRaport));
    
    // Hitung ulang baris untuk memperbarui predikat & deskripsi secara live di layar
    muatLembarMatriksChecklistSiswa();
}

// Daftarkan fungsi ke jendela global paling bawah file backend.js Anda
window.updateNilaiSantriOtomatis = updateNilaiSantriOtomatis;

// 4. Fungsi Simpan Otomatis Setiap Kali Centang Diklik (Real-Time Save)
function updateStatusCapaianSiswa(idSiswa, namaMateri, isChecked) {
    if (!dbTargetSiswa[idSiswa]) dbTargetSiswa[idSiswa] = [];

    if (isChecked) {
        if (!dbTargetSiswa[idSiswa].includes(namaMateri)) {
            dbTargetSiswa[idSiswa].push(namaMateri);
        }
    } else {
        dbTargetSiswa[idSiswa] = dbTargetSiswa[idSiswa].filter(x => x !== namaMateri);
    }

    localStorage.setItem('tpq_target_siswa', JSON.stringify(dbTargetSiswa));
}

// =========================================================================
// MODUL CORE ENGINE RESUME DASHBOARD & GRAFIK VISUAL (Fitur 12 & 15)
// =========================================================================

// Fungsi Memperbarui Opsi Dropdown Kelompok Mengaji di Dashboard secara Dinamis
function updateDropdownKelompokDashboard() {
    const selectKel = document.getElementById('dash-filter-kelompok');
    if (!selectKel) return;
    
    // Simpan pilihan kelompok yang sedang dipilih user saat ini agar tidak ter-reset otomatis
    const pilihanSebelumnya = selectKel.value;
    
    const dashFilterKelas = document.getElementById('dash-filter-kelas');
    let klsAktif = dashFilterKelas ? dashFilterKelas.value : 'SEMUA';
    
    let siswaTerfilter = dbSiswa;
    if (klsAktif !== 'SEMUA') {
        siswaTerfilter = dbSiswa.filter(s => s.kelas === klsAktif);
    }

    let daftarKelompokUnik = [...new Set(siswaTerfilter.map(s => s.kelompok).filter(k => k && k.trim() !== ''))];
    
    let html = '<option value="SEMUA">-- Semua Kelompok --</option>';
    daftarKelompokUnik.forEach(kel => {
        html += `<option value="${kel}">${kel}</option>`;
    });
    selectKel.innerHTML = html;

    // Kembalikan posisi pilihan kelompok user jika kelompok tersebut masih ada di dalam daftar
    if (daftarKelompokUnik.includes(pilihanSebelumnya)) {
        selectKel.value = pilihanSebelumnya;
    } else {
        selectKel.value = 'SEMUA';
    }
}

// Fungsi Inti Memproses Angka Resume dan Menggambar Grafik Chart.js
// Perbaikan Pengisian Dropdown Kelompok agar data tersinkronisasi 100%
function updateDropdownKelompokDashboard() {
    const selectKel = document.getElementById('dash-filter-kelompok');
    if (!selectKel) return;
    
    const dashFilterKelas = document.getElementById('dash-filter-kelas');
    let klsAktif = dashFilterKelas ? dashFilterKelas.value : 'SEMUA';
    
    let siswaTerfilter = dbSiswa;
    if (klsAktif !== 'SEMUA') {
        siswaTerfilter = dbSiswa.filter(s => s.kelas === klsAktif);
    }

    let daftarKelompokUnik = [...new Set(siswaTerfilter.map(s => s.kelompok).filter(k => k && k.trim() !== ''))];
    
    let html = '<option value="SEMUA">-- Semua Kelompok --</option>';
    daftarKelompokUnik.forEach(kel => {
        html += `<option value="${kel}">${kel}</option>`;
    });
    selectKel.innerHTML = html;
}

// Fungsi Pencatat Statistik & Grafik Dashboard (Dukungan Filter Kelas, Bulan, Kelompok)
// =========================================================================
// ALTERNATIF FITUR 14 & 15: GRAFIK CSS MURNI & CETAK PDF (ANTI-CRASH OFFLINE)
// =========================================================================

function prosesResumeDashboard() {
    // KOREKSI: Fungsi updateDropdownKelompokDashboard() tidak boleh dipanggil di sini agar pilihan kelompok tidak ter-reset otomatis

    const fKelas = document.getElementById('dash-filter-kelas') ? document.getElementById('dash-filter-kelas').value : 'SEMUA';
    const fBulan = document.getElementById('dash-filter-bulan') ? document.getElementById('dash-filter-bulan').value : 'SEMUA';
    const fKelompok = document.getElementById('dash-filter-kelompok') ? document.getElementById('dash-filter-kelompok').value : 'SEMUA';

    // 1. FILTER JURNAL KELAS
    let jurnalTerfilter = currentUser.role !== 'admin' ? dbJurnal.filter(x => x.kelas === currentUser.kelas) : (fKelas !== 'SEMUA' ? dbJurnal.filter(x => x.kelas === fKelas) : dbJurnal);
    if (fBulan !== 'SEMUA') {
        jurnalTerfilter = jurnalTerfilter.filter(j => j.tanggal && j.tanggal.split('-')[1] === fBulan);
    }
    const totalJurnalEl = document.getElementById('dash-total-jurnal');
    if (totalJurnalEl) totalJurnalEl.innerText = jurnalTerfilter.length;

    // 2. FILTER DATA PRESENSI HISTORI (UNTUK PERSENTASE KEHADIRAN)
    let presensiTerfilter = currentUser.role !== 'admin' ? dbPresensi.filter(x => x.kelas === currentUser.kelas) : (fKelas !== 'SEMUA' ? dbPresensi.filter(x => x.kelas === fKelas) : dbPresensi);
    if (fBulan !== 'SEMUA') {
        presensiTerfilter = presensiTerfilter.filter(p => p.tanggal && p.tanggal.split('-')[1] === fBulan);
    }
    if (fKelompok !== 'SEMUA') {
        presensiTerfilter = presensiTerfilter.filter(p => p.kelompok === fKelompok);
    }

    // Hitung Persentase Kehadiran Berdasarkan Log Histori
    let totalAbsenLog = presensiTerfilter.length;
    let totalHadirLog = presensiTerfilter.filter(p => p.status === 'Hadir').length;
    let persenHadir = totalAbsenLog > 0 ? Math.round((totalHadirLog / totalAbsenLog) * 100) : 0;
    const persenHadirEl = document.getElementById('dash-persen-hadir');
    if (persenHadirEl) persenHadirEl.innerText = persenHadir + '%';

    // 3. HITUNG JUMLAH SANTRI AKTIF DARI DATABASE MASTER SISWA
    let siswaTerfilterMaster = currentUser.role !== 'admin' ? dbSiswa.filter(x => x.kelas === currentUser.kelas) : (fKelas !== 'SEMUA' ? dbSiswa.filter(x => x.kelas === fKelas) : dbSiswa);
    if (fKelompok !== 'SEMUA') {
        siswaTerfilterMaster = siswaTerfilterMaster.filter(s => s.kelompok === fKelompok);
    }
    
    let totalSantriAktif = siswaTerfilterMaster.length;

    // Distribusi hitungan grafik visual dari data log presensi harian terbaru
    let h = 0, i = 0, s = 0, a = 0;
    
    if (presensiTerfilter.length > 0) {
        const daftarTanggal = [...new Set(presensiTerfilter.map(p => p.tanggal))].sort((x, y) => new Date(y) - new Date(x));
        const tanggalTerbaru = daftarTanggal[0]; // Dikembalikan ke [0] agar membaca tanggal paling baru
        
        let logHariIni = presensiTerfilter.filter(p => p.tanggal === tanggalTerbaru);
        
        h = logHariIni.filter(p => p.status === 'Hadir').length;
        i = logHariIni.filter(p => p.status === 'Izin').length;
        s = logHariIni.filter(p => p.status === 'Sakit').length;
        a = logHariIni.filter(p => p.status === 'Alpa').length;
        
        // SINKRONISASI ALUR ABSENSI: Masukkan sisa murid aktif yang belum diabsen ke kategori Alpa
        let totalTerabsenHariIni = h + i + s + a;
        if (totalTerabsenHariIni < totalSantriAktif) {
            a += (totalSantriAktif - totalTerabsenHariIni);
        }
    } else {
        a = totalSantriAktif;
    }

    // =========================================================================
    // PERBAIKAN LOGIKA UTAMA: HITUNG ULANG PERSENTASE SECARA REALISTIS
    // =========================================================================
    // Mengisi kembali nilai variabel 'persenHadir' tanpa kata "let" agar tidak duplikat
    // Rumus: (2 Hadir / 12 Total Murid Master) * 100% = 17%
    persenHadir = totalSantriAktif > 0 ? Math.round((h / totalSantriAktif) * 100) : 0;
    
    // Perbarui teks persentase pada boks ringkasan di dashboard secara langsung
    if (document.getElementById('dash-persen-hadir')) {
        document.getElementById('dash-persen-hadir').innerText = persenHadir + '%';
    }
    // =========================================================================


    // =========================================================================
    // UPDATE GRAFIK FINALE: Menggambar Tiang Balok Diagram Batang Tegak Vertikal 
    // =========================================================================
    const grafikContainer = document.getElementById('grafik-css-container');
    if (!grafikContainer) return;

    let maxData = Math.max(h, i, s, a, 1); // Acuan tinggi 100% balok diambil dari data santri tertinggi

    grafikContainer.innerHTML = `
        <!-- Tiang Hadir (Hijau) -->
        <div style="display: flex; flex-direction: column; align-items: center; width: 60px; height: 100%; justify-content: flex-end; position: relative;">
            <span style="font-size: 11px; font-weight: bold; margin-bottom: 4px; color: #059669;">${h}</span>
            <div style="width: 100%; height: ${(h / maxData) * 100}%; background: #059669; border-top-left-radius: 6px; border-top-right-radius: 6px; transition: height 0.4s ease;"></div>
            <span style="font-size: 11px; font-weight: 600; color: #4b5563; position: absolute; bottom: -20px; white-space: nowrap;">Hadir (H)</span>
        </div>

        <!-- Tiang Izin (Kuning) -->
        <div style="display: flex; flex-direction: column; align-items: center; width: 60px; height: 100%; justify-content: flex-end; position: relative;">
            <span style="font-size: 11px; font-weight: bold; margin-bottom: 4px; color: #d97706;">${i}</span>
            <div style="width: 100%; height: ${(i / maxData) * 100}%; background: #d97706; border-top-left-radius: 6px; border-top-right-radius: 6px; transition: height 0.4s ease;"></div>
            <span style="font-size: 11px; font-weight: 600; color: #4b5563; position: absolute; bottom: -20px; white-space: nowrap;">Izin (I)</span>
        </div>

        <!-- Tiang Sakit (Biru) -->
        <div style="display: flex; flex-direction: column; align-items: center; width: 60px; height: 100%; justify-content: flex-end; position: relative;">
            <span style="font-size: 11px; font-weight: bold; margin-bottom: 4px; color: #2563eb;">${s}</span>
            <div style="width: 100%; height: ${(s / maxData) * 100}%; background: #2563eb; border-top-left-radius: 6px; border-top-right-radius: 6px; transition: height 0.4s ease;"></div>
            <span style="font-size: 11px; font-weight: 600; color: #4b5563; position: absolute; bottom: -20px; white-space: nowrap;">Sakit (S)</span>
        </div>

        <!-- Tiang Alpa (Merah) -->
        <div style="display: flex; flex-direction: column; align-items: center; width: 60px; height: 100%; justify-content: flex-end; position: relative;">
            <span style="font-size: 11px; font-weight: bold; margin-bottom: 4px; color: #dc2626;">${a}</span>
            <div style="width: 100%; height: ${(a / maxData) * 100}%; background: #dc2626; border-top-left-radius: 6px; border-top-right-radius: 6px; transition: height 0.4s ease;"></div>
            <span style="font-size: 11px; font-weight: 600; color: #4b5563; position: absolute; bottom: -20px; white-space: nowrap;">Alpa (A)</span>
        </div>
    `;
            // Update visual warna diagram lingkaran di halaman dashboard secara real-time
    const pieChartEl = document.getElementById('dash-pie-chart');
    if (pieChartEl) {
        let persenTuntas = persenHadir || 0;
        pieChartEl.style.background = 'conic-gradient(#059669 0% ' + persenTuntas + '%, #e5e7eb ' + persenTuntas + '% 100%)';
        
        // =========================================================================
        // SUNTIKKAN INI: UPDATE ANGKA DI TENGAH DIAGRAM SECARA LIVE
        // =========================================================================
        if (document.getElementById('dash-pie-text')) {
            document.getElementById('dash-pie-text').innerText = persenTuntas + '%';
        }
        // =========================================================================
    }


}


// =========================================================================
// ALTERNATIF EKSPOR: Cetak Dokumen PDF Resmi Bawaan Browser (Anti-Blokir CORS)
// =========================================================================
// GANTI FUNGSI LAMA ANDA DENGAN VERSI ISOLASI DOKUMEN CETAK INI
// =========================================================================
// SOLUSI MUTLAK: CETAK VIA JENDELA BARU (MEMBUANG TOTAL BAGIAN ATAS APLIKASI)
// =========================================================================
// =========================================================================
// PERBAIKAN MUTLAK PRINT RAPORT: POTONG BERSIH HEADER ATAS VIA POPUP WINDOW
// =========================================================================
function cetakLaporanDashboardPDF() {
    // 1. Ambil target area dokumen raport dari judul utama ke bawah
    const areaRaportInti = document.getElementById('area-dokumen-raport-resmi');
    if (!areaRaportInti) {
        alert('Area dokumen raport tidak ditemukan!');
        return;
    }

    // 2. Ambil data nama anak untuk penamaan dokumen file PDF saat disimpan
    const namaSantri = document.getElementById('rf-teks-siswa') ? document.getElementById('rf-teks-siswa').innerText : 'Santri';

    // 3. Buka jendela popup kosong baru di memori browser
    const jendelaCetak = window.open('', '_blank', 'width=950,height=800');
    
    // 4. Suntikkan isi raport SAJA ke jendela baru tersebut (Header aplikasi tidak ikut disalin)
    jendelaCetak.document.write(`
        <html>
        <head>
            <title>Raport_TPQ_${namaSantri}</title>
            <style>
                body { 
                    font-family: 'Times New Roman', Times, serif; 
                    color: #000000; 
                    line-height: 1.4; 
                    padding: 20px;
                    background: #ffffff;
                }
                h3, h4 { text-align: center; margin: 0; padding: 0; text-transform: uppercase; }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    font-size: 12px; 
                    margin-top: 15px;
                    margin-bottom: 15px; 
                    background: #ffffff;
                }
                th, td { 
                    border: 1px solid #000000 !important; 
                    padding: 6px; 
                    color: #000000 !important;
                }
                /* Sembunyikan tombol cetak bawaan di dalam jendela popup */
                .no-print { 
                    display: none !important; 
                }
                /* Pengaturan Layout 2 Kolom Keterangan Absensi & Predikat Bawah */
                .absen-box-layout {
                    display: grid;
                    grid-template-columns: 1.2fr 1fr;
                    gap: 20px;
                    font-size: 11px;
                    font-family: sans-serif;
                    margin-top: 16px;
                    padding-top: 12px;
                }
            </style>
        </head>
        <body>
            <!-- Suntikkan konten raport dari judul utama langsung ke bawah -->
            ${areaRaportInti.innerHTML}
        </body>
        </html>
    `);

    // 5. Kunci dokumen jendela baru agar siap diproses browser
    jendelaCetak.document.close();
    jendelaCetak.focus();

    // 6. Jalankan perintah print resmi setelah jeda 400ms agar gaya CSS terpasang sempurna
    setTimeout(function() {
        jendelaCetak.print();
        jendelaCetak.close(); // Otomatis menutup jendela popup setelah user klik Print/Cancel
    }, 400);
}

// 6. Fitur Ekspor Rekapitulasi Presensi Ke Bentuk Dokumen File CSV Excel (Fitur 15)
function eksporPresensiExcel() {
    let data = dbPresensi;

if (currentUser.role !== 'admin') {
    data = dbPresensi.filter(x => x.kelas === currentUser.kelas);
}

if (data.length === 0) { 
    alert('Tidak ada data riwayat presensi santri untuk diexport.'); 
    return; 
}

let csvContent = "\uFEFFTanggal Absen,Otoritas Kelas,Nama Lengkap Santri,Kelompok Mengaji,Status Kehadiran\n";

data.forEach(p => {
    csvContent += `${p.tanggal},"${p.kelas}","${p.nama_siswa}","${p.kelompok || '-'}","${p.status}"\n`;
});

const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
const link = document.createElement("a");
link.href = URL.createObjectURL(blob);
link.setAttribute("download", `Rekap_Presensi_TPQ_Baitussalam_${new Date().toISOString().split('T')[0]}.csv`);
document.body.appendChild(link);
link.click();
document.body.removeChild(link);

// Modifikasi pemicu fungsi bawaan: 
// Panggil fungsi grafik otomatis saat masuk aplikasi atau ganti menu dashboard
// Sisipkan baris ini ke dalam fungsi masukKeAplikasi() Anda di bagian paling bawah:
// if(typeof prosesResumeDashboard === 'function') { prosesResumeDashboard(); }

// Dan sisipkan juga ke dalam fungsi gantiMenu() Anda pada kondisi viewName === 'dashboard':
// if (viewName === 'dashboard') { if(typeof prosesResumeDashboard === 'function') prosesResumeDashboard(); }

// EKSPOS WINDOW GLOBAL AGAR ANTARMUKA BISA MEMANGGIL
window.toggleTabMateri = toggleTabMateri;
window.muatDaftarSiswaTargetDropdown = muatDaftarSiswaTargetDropdown;
window.muatLembarMatriksChecklistSiswa = muatLembarMatriksChecklistSiswa;
window.updateStatusCapaianSiswa = updateStatusCapaianSiswa;
window.prosesResumeDashboard = prosesResumeDashboard;
window.eksporDashboardGambar = eksporDashboardGambar;
window.eksporPresensiExcel = eksporPresensiExcel;
window.updateDropdownKelompokDashboard = updateDropdownKelompokDashboard;
// ====== PASTIKAN BARIS INI ADA DI DAFTAR EKSPOS WINDOW PALING BAWAH BERKAS ======
window.toggleTabMateri = toggleTabMateri;
window.muatDaftarSiswaTargetDropdown = muatDaftarSiswaTargetDropdown;
window.muatLembarMatriksChecklistSiswa = muatLembarMatriksChecklistSiswa;
window.updateStatusCapaianSiswa = updateStatusCapaianSiswa;
window.prosesResumeDashboard = prosesResumeDashboard;
window.cetakLaporanDashboardPDF = cetakLaporanDashboardPDF;
// TAMBAHKAN BARIS INI PADA JURUSAN EKSPOS WINDOW DI BAGIAN PALING BAWAH
window.editMateriMaster = editMateriMaster;
window.togglePilihSemuaMateri = togglePilihSemuaMateri;
window.hapusMateriTerpilih = hapusMateriTerpilih;
window.togglePilihSemuaJurnal = togglePilihSemuaJurnal;
window.hapusJurnalTerpilih = hapusJurnalTerpilih;

// =========================================================================
// FITUR BARU: ENGINE ENGINE MANAJEMEN PENILAIAN 9 SUBJEK (ANTI-CRASH)
// =========================================================================
let dbUjian = JSON.parse(localStorage.getItem('tpq_ujian_sembilan_subjek')) || {};

// 1. Fungsi saat menu penilaian diklik
// =========================================================================
// PERBAIKAN URUTAN DROPDOWN: MENGUNCI & MENGISI KELAS GURU SECARA AKURAT
// =========================================================================
// =========================================================================
// PROTEKSI DARURAT: MEMAKSA PENGISIAN DROPDOWN KELAS SECARA OTOMATIS
// =========================================================================
function bukaMenuPenilaianBaru() {
    const penilaianKlsSelect = document.getElementById('penilaian-kelas');
    if (!penilaianKlsSelect) return;

    // 1. Ambil nama kelas langsung dari variabel user atau dari teks header atas layar (Anti-Kosong)
    let kelasGuruAktif = currentUser.kelas;
    
    if (!kelasGuruAktif && currentUser.role !== 'admin') {
        const txtKelasEl = document.getElementById('txt-kelas');
        if (txtKelasEl) {
            // Memotong teks "Kelas: Kelas 1" menjadi "Kelas 1" murni
            kelasGuruAktif = txtKelasEl.innerText.replace('Kelas:', '').trim();
        }
    }

    // 2. Suntikkan opsi pilihan kelas resmi ke dalam dropdown HTML
    let opsiHtml = '<option value="">-- Pilih Kelas --</option>';
    daftarKelas.forEach(k => { 
        opsiHtml += `<option value="${k}">${k}</option>`; 
    });
    penilaianKlsSelect.innerHTML = opsiHtml;

    // 3. Kunci dan isi dropdown berdasarkan otoritas login
    if (currentUser.role !== 'admin') {
        // Jika data kelas masih kosong setelah backup, paksa gunakan "Kelas 1" sebagai default aman
        penilaianKlsSelect.value = kelasGuruAktif || 'Kelas 1'; 
        penilaianKlsSelect.disabled = true; 
        
        // Picu langsung pemuatan nama santri di dropdown sebelah secara otomatis
        if (typeof muatSiswaPenilaianDropdown === 'function') {
            muatSiswaPenilaianDropdown();
        }
    } else {
        penilaianKlsSelect.value = '';
        penilaianKlsSelect.disabled = false;
        const siswaSelect = document.getElementById('penilaian-siswa');
        if (siswaSelect) siswaSelect.innerHTML = '<option value="">-- Pilih Santri --</option>';
    }

    const formBox = document.getElementById('box-form-sembilan-subjek');
    if (formBox) formBox.style.display = 'none';

    // 4. Buka layar penilaian ujian
    gantiMenu('penilaian');
}

// =========================================================================
// FITUR MODUL RAPORT FINAL: REKAPITULASI AKHIR 4 UJIAN & 9 SUBJEK MATERIAL
// =========================================================================

// 1. Inisialisasi awal dropdown saat menu raport dibuka
// =========================================================================
// PERBAIKAN FINAL DROPDOWN RAPORT ADMIN: COCOK SEGALA FORMAT TEKS KELAS
// =========================================================================
// =========================================================================
// PERBAIKAN MUTLAK DROPDOWN: ENGINE PENYARINGAN NAMA SANTRI AKUN ADMIN & GURU
// =========================================================================
// =========================================================================
// PERBAIKAN TOTAL: ENGINE PENYARINGAN NAMA SANTRI AKUN ADMIN (ANTI-LOCK COLD)
// =========================================================================
// =========================================================================
// SOLUSI MUTLAK: ENGINE PENYARINGAN NAMA SANTRI AKUN ADMIN (ANTI-BLANK 100%)
// =========================================================================
// =========================================================================
// SOLUSI MUTLAK: ENGINE PENYARINGAN NAMA SANTRI AKUN ADMIN (ANTI-BLANK 100%)
// =========================================================================
// =========================================================================
// PERBAIKAN ENGINE PENYARINGAN NAMA SANTRI AKUN ADMIN & GURU
// =========================================================================

function muatSiswaRaportfDropdown() {
    const klsSelect = document.getElementById('raportf-kelas');
    const siswaSelect = document.getElementById('raportf-siswa');
    if (!klsSelect || !siswaSelect) return;

    let klsAktif = klsSelect.value;
    if (!klsAktif || klsAktif === "") { 
        siswaSelect.innerHTML = '<option value="">-- Pilih Santri --</option>'; 
        const areaDokumen = document.getElementById('area-dokumen-raport-resmi');
        if (areaDokumen) areaDokumen.style.display = 'none';
        return; 
    }

    dbSiswa = JSON.parse(localStorage.getItem('tpq_siswa')) || [];

    let muridTerfilter = dbSiswa.filter(x => {
        if (!x.kelas) return false;
        return x.kelas.toString().trim().toLowerCase() === klsAktif.toString().trim().toLowerCase();
    });

    muridTerfilter.sort((a, b) => a.nama.localeCompare(b.nama));

    let html = '<option value="">-- Pilih Santri --</option>';
    if (muridTerfilter.length === 0) {
        html += `<option value="" disabled>-- Tidak ada siswa di kelas ini --</option>`;
    } else {
        muridTerfilter.forEach(m => {
            html += `<option value="${m.id}">${m.nama.toUpperCase()}</option>`; 
        });
    }
    
    siswaSelect.innerHTML = html;
    
    const areaDokumen = document.getElementById('area-dokumen-raport-resmi');
    if (areaDokumen) areaDokumen.style.display = 'none';
}


// SUNTIKKAN BARIS INI TEPAT DI BAWAH PENUTUP FUNGSI AGAR LANGSUNG TERDEFINISI DI HTML
window.muatSiswaRaportfDropdown = muatSiswaRaportfDropdown; 


// =========================================================================
// FITUR MANDIRI: CETAK HALAMAN DASHBOARD SEBAGAI DOKUMEN STATISTIK TERPISAH
// =========================================================================
function cetakHalamanDashboardMurni() {
    var filterKelasEl = document.getElementById('dash-filter-kelas');
    var fKelas = filterKelasEl ? filterKelasEl.value : 'SEMUA';
    
    var filterBulanEl = document.getElementById('dash-filter-bulan');
    var fBulan = filterBulanEl ? filterBulanEl.value : 'SEMUA';
    
    var totalJurnalEl = document.getElementById('dash-total-jurnal');
    var totalJurnal = totalJurnalEl ? totalJurnalEl.innerText : '0';
    
    var persenHadirEl = document.getElementById('dash-persen-hadir');
    var persenHadir = persenHadirEl ? persenHadirEl.innerText : '0%';
    
    var areaGrafik = document.getElementById('grafik-css-container');
    var isiGrafikHtml = areaGrafik ? areaGrafik.innerHTML : '';

    var winDash = window.open('', '_blank', 'width=950,height=750');
    if (!winDash) {
        alert("Mohon izinkan sistem Pop-up pada browser Anda agar dokumen cetak bisa terbuka!");
        return;
    }
    
    // Satukan semua baris dokumen ke dalam satu variabel HTML panjang
    var kontenHtml = '<html><head><title>Laporan_Statistik_Dashboard_TPQ</title>' +
        '<style>' +
        'body { font-family: Arial, sans-serif; padding: 30px; color: #111827; background: #ffffff; }' +
        '.header-cetak { text-align: center; border-bottom: 3px double #000000; padding-bottom: 12px; margin-bottom: 25px; }' +
        '.header-cetak h2 { margin: 0; text-transform: uppercase; font-size: 18px; }' +
        '.header-cetak p { margin: 5px 0 0 0; color: #4b5563; font-size: 13px; }' +
        '.grid-statistik { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }' +
        '.card-stat { border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; text-align: center; background: #f9fafb; }' +
        '.card-stat h3 { margin: 0; font-size: 12px; color: #4b5563; text-transform: uppercase; }' +
        '.card-stat p { margin: 8px 0 0 0; font-size: 24px; font-weight: bold; color: #059669; }' +
        '.box-grafik-judul { font-size: 13px; font-weight: bold; margin-bottom: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; color: #374151; }' +
        '.wrapper-grafik { border: 1px solid #e5e7eb; padding: 30px 20px 40px 20px; border-radius: 8px; display: flex; justify-content: center; gap: 40px; align-items: flex-end; height: 200px; }' +
        '</style></head><body>' +
        '<div class="header-cetak">' +
        '<h2>Laporan Perkembangan & Statistik Pembelajaran TPQ</h2>' +
        '<p>Filter Kelas: <strong>' + fKelas + '</strong> | Saringan Bulan: <strong>' + fBulan + '</strong></p>' +
        '</div>' +
        '<div class="grid-statistik">' +
        '<div class="card-stat"><h3>Total Catatan Jurnal KBM</h3><p>' + totalJurnal + ' Kali Hari Efektif</p></div>' +
        '<div class="card-stat"><h3>Rata-Rata Kehadiran Santri</h3><p>' + persenHadir + '</p></div>' +
        '</div>' +
        '<div class="box-grafik-judul">📊 DIAGRAM GRAFIK PRESENSI HARIAN TERAKHIR:</div>' +
        '<div class="wrapper-grafik">' + isiGrafikHtml + '</div>' +
        '</body></html>';

    // Gunakan innerHTML pada body jendela baru untuk menyuntikkan dokumen secara instan
    winDash.document.body.innerHTML = kontenHtml;

    setTimeout(function() {
        winDash.print();
        winDash.close();
    }, 450);
}


// SUNTIKKAN LANGSUNG KE WINDOW GLOBAL DI SINI AGAR BEBAS DARI EROR BARIS LAIN
window.cetakHalamanDashboardMurni = cetakHalamanDashboardMurni;



// =========================================================================
// SINKRONISASI EKSPOS KENDALI BARU KE LINGKUP GLOBAL WINDOW BROWSER
// =========================================================================
window.bukaMenuPenilaianBaru = bukaMenuPenilaianBaru;
window.muatSiswaPenilaianDropdown = muatSiswaPenilaianDropdown;
window.muatFormNilaiUjianEksis = muatFormNilaiUjianEksis;
window.simpanNilaiUjianMassal = simpanNilaiUjianMassal;
window.muatSiswaRaportfDropdown = muatSiswaRaportfDropdown;
window.prosesKalkulasiRaportFinal = prosesKalkulasiRaportFinal;

}