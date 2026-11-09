
// ======================================
// ARRAY KERANJANG PESANAN
// ======================================
let keranjang = [];

// ======================================
// FUNGSI MENAMBAHKAN MENU KE KERANJANG
// ======================================
function tambahKeKeranjang(namaMenu, harga) {
    let index = keranjang.findIndex(item => item.nama === namaMenu);

    if (index !== -1) {
        keranjang[index].jumlah += 1;
    } else {
        keranjang.push({
            nama: namaMenu,
            harga: harga,
            jumlah: 1
        });
    }

    tampilkanKeranjang();
}

// ======================================
// MENAMPILKAN KERANJANG
// ======================================
function tampilkanKeranjang() {
    let cartItems = document.getElementById('cartItems');
    cartItems.innerHTML = "";

    if (keranjang.length === 0) {
        cartItems.innerHTML = `
            <tr>
                <td colspan="5" class="empty-cart">
                    Keranjang masih kosong. Pilih menu di atas!
                </td>
            </tr>
        `;

        document.getElementById('totalHarga').value = "Rp 0";
        return;
    }

    let totalKeseluruhan = 0;

    keranjang.forEach((item, i) => {
        let subtotal = item.harga * item.jumlah;
        totalKeseluruhan += subtotal;

        let tr = document.createElement('tr');

        tr.innerHTML = `
            <td><strong>${item.nama}</strong></td>
            <td>Rp ${item.harga.toLocaleString('id-ID')}</td>
            <td>
                <input type="number" min="1"
                value="${item.jumlah}"
                onchange="ubahJumlah(${i}, this.value)">
            </td>
            <td>Rp ${subtotal.toLocaleString('id-ID')}</td>
            <td>
                <button type="button"
                class="btn-delete"
                onclick="hapusItem(${i})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;

        cartItems.appendChild(tr);
    });

    document.getElementById('totalHarga').value =
        "Rp " + totalKeseluruhan.toLocaleString('id-ID');
}

// ======================================
// MENGUBAH JUMLAH PESANAN
// ======================================
function ubahJumlah(index, jumlahBaru) {
    let qty = parseInt(jumlahBaru);

    if (isNaN(qty) || qty < 1) qty = 1;

    keranjang[index].jumlah = qty;
    tampilkanKeranjang();
}

// ======================================
// MENGHAPUS ITEM KERANJANG
// ======================================
function hapusItem(index) {
    keranjang.splice(index, 1);
    tampilkanKeranjang();
}

// ======================================
// KLIK MENU
// ======================================
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function() {
        let namaMenu = this.getAttribute('data-name');
        let harga = parseInt(this.getAttribute('data-price'));

        tambahKeKeranjang(namaMenu, harga);
    });
});

// ======================================
// METODE PEMBAYARAN
// ======================================
document.getElementById('metodePembayaran')
.addEventListener('change', function() {

    let metode = this.value;
    let groupUang = document.getElementById('groupUangBayar');
    let infoDigital = document.getElementById('infoPembayaranDigital');

    if (metode === 'Tunai') {
        groupUang.style.display = 'block';
        infoDigital.style.display = 'none';

        document.getElementById('uangBayar').required = true;

    } else if (metode === 'QRIS' || metode === 'Transfer Bank') {

        groupUang.style.display = 'none';
        infoDigital.style.display = 'block';

        document.getElementById('uangBayar').required = false;

    } else {
        groupUang.style.display = 'none';
        infoDigital.style.display = 'none';

        document.getElementById('uangBayar').required = false;
    }
});

// ======================================
// PROSES PEMESANAN
// ======================================
document.getElementById('orderForm')
.addEventListener('submit', function(e) {

    e.preventDefault();

    if (keranjang.length === 0) {
        alert("Keranjang masih kosong! Silakan pilih menu.");
        return;
    }

    let nama = document.getElementById('namaPemesan').value;
    let metode = document.getElementById('metodePembayaran').value;

    let totalHarga = keranjang.reduce(
        (sum, item) => sum + (item.harga * item.jumlah), 0
    );

    let kembalian = 0;
    let statusBayarInfo = "";
    let uangBayar = 0;

    if (metode === 'Tunai') {

        uangBayar = parseInt(document.getElementById('uangBayar').value);

        if (isNaN(uangBayar) || uangBayar < totalHarga) {
            alert("Uang tunai kurang! Total belanja Rp " +
                totalHarga.toLocaleString('id-ID'));
            return;
        }

        kembalian = uangBayar - totalHarga;

        statusBayarInfo = `
            <p><strong>Metode Pembayaran:</strong> Tunai</p>
            <p><strong>Uang Diterima:</strong>
            Rp ${uangBayar.toLocaleString('id-ID')}</p>
            <p><strong>Kembalian:</strong>
            Rp ${kembalian.toLocaleString('id-ID')}</p>
        `;

    } else {

        statusBayarInfo = `
            <p><strong>Metode Pembayaran:</strong> ${metode}</p>
            <p><strong>Uang Kembalian:</strong> Rp 0</p>
        `;
    }

    // DAFTAR MENU UNTUK STRUK
    let daftarMenuHTML = "<ul>";

    keranjang.forEach(item => {
        let sub = item.harga * item.jumlah;

        daftarMenuHTML += `
            <li>
                ${item.nama} (x${item.jumlah}) -
                Rp ${sub.toLocaleString('id-ID')}
            </li>
        `;
    });

    daftarMenuHTML += "</ul>";

    // NOMOR TRANSAKSI
    let noTransaksi = "ZHW-" +
        Math.floor(100000 + Math.random() * 900000);

    let tanggalWaktu = new Date().toLocaleString('id-ID');

    // ======================================
    // SIMPAN KE RIWAYAT PESANAN
    // ======================================
    let dataPesanan = {
        noTransaksi: noTransaksi,
        tanggalWaktu: tanggalWaktu,
        nama: nama,
        metode: metode,
        totalHarga: totalHarga,
        items: keranjang.map(item => ({...item}))
    };

    let riwayat = ambilRiwayatPesanan();

    riwayat.unshift(dataPesanan);

    simpanRiwayatPesanan(riwayat);

    // ======================================
    // TAMPILKAN STRUK
    // ======================================
    let resultSection = document.getElementById('resultSection');
    let strukContent = document.getElementById('strukContent');

    strukContent.innerHTML = `
        <div style="text-align:center; margin-bottom:10px;">
            <h3 style="color:#d81b60;">
                ZAHWA'S REFRESHING & TRENDY CAFE
            </h3>

            <p>Jl. Kuliner Nusantara No. 88</p>
            <hr>
        </div>

        <p><strong>No. Transaksi:</strong> ${noTransaksi}</p>
        <p><strong>Waktu Pesan:</strong> ${tanggalWaktu}</p>
        <p><strong>Nama Pemesan:</strong> ${escapeHTML(nama)}</p>

        <hr>

        <p><strong>Daftar Pesanan:</strong></p>
        ${daftarMenuHTML}

        <hr>

        <p><strong>Total Harga:</strong>
        Rp ${totalHarga.toLocaleString('id-ID')}</p>

        ${statusBayarInfo}

        <hr>

        <p style="text-align:center; color:#d81b60;">
            Terima kasih telah memesan!
            Pesanan Anda sedang disiapkan.
        </p>
    `;

    resultSection.style.display = 'block';

    resultSection.scrollIntoView({
        behavior: 'smooth'
    });

    // PERBARUI RIWAYAT
    tampilkanRiwayatPesanan();
});

// ======================================
// CETAK STRUK
// ======================================
function cetakStruk() {
    window.print();
}

// ======================================
// FITUR RIWAYAT PESANAN
// ======================================

const KUNCI_RIWAYAT = 'zahwas_cafe_riwayat_pesanan';

// MENGAMBIL RIWAYAT
function ambilRiwayatPesanan() {
    try {
        return JSON.parse(
            localStorage.getItem(KUNCI_RIWAYAT)
        ) || [];
    } catch (error) {
        return [];
    }
}

// MENYIMPAN RIWAYAT
function simpanRiwayatPesanan(riwayat) {
    localStorage.setItem(
        KUNCI_RIWAYAT,
        JSON.stringify(riwayat)
    );
}

// MEMBUAT TAMPILAN RIWAYAT
function siapkanTampilanRiwayat() {

    if (document.getElementById('riwayatPesanan')) return;

    let section = document.createElement('section');

    section.id = 'riwayatPesanan';

    section.innerHTML = `
        <div class="riwayat-header">
            <div>
                <h2>Riwayat Pesanan</h2>
                <p>Lihat kembali transaksi yang pernah dilakukan.</p>
            </div>

            <button type="button"
            id="hapusSemuaRiwayat"
            class="btn-hapus-riwayat">
                Hapus Semua
            </button>
        </div>

        <div id="daftarRiwayat"></div>
    `;

    section.style.cssText = `
        max-width:1000px;
        margin:35px auto;
        padding:24px;
        background:#fff;
        border-radius:16px;
        box-shadow:0 8px 28px rgba(0,0,0,.08);
        font-family:Arial,sans-serif;
    `;

    let style = document.createElement('style');

    style.textContent = `
        #riwayatPesanan .riwayat-header {
            display:flex;
            justify-content:space-between;
            align-items:center;
            gap:12px;
            flex-wrap:wrap;
            margin-bottom:18px;
        }

        #riwayatPesanan h2 {
            margin:0 0 6px;
            color:#ad1457;
        }

        #riwayatPesanan p {
            margin:8px 0;
            color:#777;
        }

        #riwayatPesanan .riwayat-card {
            border:1px solid #f3d5e2;
            border-radius:12px;
            padding:16px;
            margin:12px 0;
            background:#fffafd;
        }

        #riwayatPesanan .riwayat-card h3 {
            color:#ad1457;
        }

        #riwayatPesanan button {
            border:0;
            border-radius:8px;
            padding:9px 13px;
            background:#ad1457;
            color:white;
            cursor:pointer;
        }

        #riwayatPesanan .btn-hapus-satu {
            background:#777;
        }

        #riwayatPesanan .riwayat-kosong {
            padding:22px;
            text-align:center;
            color:#888;
            background:#fffafd;
            border-radius:10px;
        }
    `;

    document.head.appendChild(style);

    let resultSection = document.getElementById('resultSection');

    if (resultSection && resultSection.parentNode) {
        resultSection.parentNode.insertBefore(
            section,
            resultSection.nextSibling
        );
    } else {
        document.body.appendChild(section);
    }

    // HAPUS SEMUA RIWAYAT
    document.getElementById('hapusSemuaRiwayat')
    .addEventListener('click', function() {

        if (!confirm('Yakin ingin menghapus semua riwayat pesanan?')) {
            return;
        }

        simpanRiwayatPesanan([]);

        tampilkanRiwayatPesanan();
    });
}

// ======================================
// MENAMPILKAN RIWAYAT PESANAN
// ======================================
function tampilkanRiwayatPesanan() {

    siapkanTampilanRiwayat();

    let wadah = document.getElementById('daftarRiwayat');

    let riwayat = ambilRiwayatPesanan();

    if (riwayat.length === 0) {
        wadah.innerHTML = `
            <div class="riwayat-kosong">
                Belum ada riwayat pesanan.
            </div>
        `;
        return;
    }

    wadah.innerHTML = riwayat.map((pesanan, index) => `

        <article class="riwayat-card">

            <h3>Transaksi ${escapeHTML(pesanan.noTransaksi)}</h3>

            <p><strong>Nama:</strong>
            ${escapeHTML(pesanan.nama)}</p>

            <p><strong>Tanggal:</strong>
            ${escapeHTML(pesanan.tanggalWaktu)}</p>

            <p><strong>Metode Pembayaran:</strong>
            ${escapeHTML(pesanan.metode)}</p>

            <ul>
                ${pesanan.items.map(item => `
                    <li>
                        ${escapeHTML(item.nama)}
                        × ${item.jumlah} —
                        Rp ${(item.harga * item.jumlah)
                        .toLocaleString('id-ID')}
                    </li>
                `).join('')}
            </ul>

            <p>
                <strong>Total:
                Rp ${pesanan.totalHarga.toLocaleString('id-ID')}
                </strong>
            </p>

            <button type="button"
            class="btn-hapus-satu"
            onclick="hapusRiwayatPesanan(${index})">
                Hapus Riwayat Ini
            </button>

        </article>

    `).join('');
}

// ======================================
// MENGAMANKAN TEKS HTML
// ======================================
function escapeHTML(nilai) {
    return String(nilai).replace(/[&<>"']/g, karakter => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[karakter]));
}

// ======================================
// MENGHAPUS SATU RIWAYAT
// ======================================
function hapusRiwayatPesanan(index) {

    let riwayat = ambilRiwayatPesanan();

    riwayat.splice(index, 1);

    simpanRiwayatPesanan(riwayat);

    tampilkanRiwayatPesanan();
}

// ======================================
// TAMPILKAN RIWAYAT SAAT HALAMAN DIBUKA
// ======================================
document.addEventListener(
    'DOMContentLoaded',
    tampilkanRiwayatPesanan
);
