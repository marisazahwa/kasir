// Array untuk menyimpan item keranjang pesanan
let keranjang = [];

// Fungsi Menambahkan Menu ke Keranjang
function tambahKeKeranjang(namaMenu, harga) {
    let index = keranjang.findIndex(item => item.nama === namaMenu);
    
    if (index !== -1) {
        // Jika menu sudah ada di keranjang, tambah jumlahnya
        keranjang[index].jumlah += 1;
    } else {
        // Jika belum ada, masukkan sebagai item baru
        keranjang.push({
            nama: namaMenu,
            harga: harga,
            jumlah: 1
        });
    }

    tampilkanKeranjang();
}

// Fungsi Menampilkan Keranjang & Menghitung Total
function tampilkanKeranjang() {
    let cartItems = document.getElementById('cartItems');
    cartItems.innerHTML = "";

    if (keranjang.length === 0) {
        cartItems.innerHTML = `<tr><td colspan="5" class="empty-cart">Keranjang masih kosong. Pilih minuman di atas!</td></tr>`;
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
                <input type="number" min="1" value="${item.jumlah}" onchange="ubahJumlah(${i}, this.value)">
            </td>
            <td>Rp ${subtotal.toLocaleString('id-ID')}</td>
            <td>
                <button type="button" class="btn-delete" onclick="hapusItem(${i})"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        cartItems.appendChild(tr);
    });

    document.getElementById('totalHarga').value = "Rp " + totalKeseluruhan.toLocaleString('id-ID');
}

// Fungsi Mengubah Jumlah Menu
function ubahJumlah(index, jumlahBaru) {
    let qty = parseInt(jumlahBaru);
    if (isNaN(qty) || qty < 1) qty = 1;
    keranjang[index].jumlah = qty;
    tampilkanKeranjang();
}

// Fungsi Menghapus Item dari Keranjang
function hapusItem(index) {
    keranjang.splice(index, 1);
    tampilkanKeranjang();
}

// Event Listener Klik Menu Item
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function() {
        let namaMenu = this.getAttribute('data-name');
        let harga = parseInt(this.getAttribute('data-price'));
        tambahKeKeranjang(namaMenu, harga);
    });
});

// Event Listener Metode Pembayaran
document.getElementById('metodePembayaran').addEventListener('change', function() {
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

// Proses Pemesanan & Pembayaran
document.getElementById('orderForm').addEventListener('submit', function(e) {
    e.preventDefault();

    if (keranjang.length === 0) {
        alert("Keranjang kamu masih kosong! Silakan pilih minimal 1 minuman terlebih dahulu.");
        return;
    }

    let nama = document.getElementById('namaPemesan').value;
    let metode = document.getElementById('metodePembayaran').value;

    let totalHarga = keranjang.reduce((sum, item) => sum + (item.harga * item.jumlah), 0);
    let kembalian = 0;
    let statusBayarInfo = "";

    if (metode === 'Tunai') {
        let uangBayar = parseInt(document.getElementById('uangBayar').value);
        if (isNaN(uangBayar) || uangBayar < totalHarga) {
            alert("Uang tunai kurang! Total belanja Anda adalah Rp " + totalHarga.toLocaleString('id-ID'));
            return;
        }
        kembalian = uangBayar - totalHarga;
        statusBayarInfo = `
            <p><strong>Metode Pembayaran:</strong> Tunai (Cash)</p>
            <p><strong>Uang Diterima:</strong> Rp ${uangBayar.toLocaleString('id-ID')}</p>
            <p><strong>Uang Kembalian:</strong> <span style="color: #059669; font-weight: bold; font-size: 16px;">Rp ${kembalian.toLocaleString('id-ID')}</span></p>
        `;
    } else {
        statusBayarInfo = `
            <p><strong>Metode Pembayaran:</strong> ${metode} (Lunas / Terverifikasi)</p>
            <p><strong>Uang Kembalian:</strong> Rp 0 (Pembayaran Non-Tunai)</p>
        `;
    }

    // Generate Daftar Minuman untuk Struk
    let daftarMenuHTML = "<ul style='padding-left: 20px; margin: 8px 0;'>";
    keranjang.forEach(item => {
        let sub = item.harga * item.jumlah;
        daftarMenuHTML += `<li>${item.nama} (x${item.jumlah}) - Rp ${sub.toLocaleString('id-ID')}</li>`;
    });
    daftarMenuHTML += "</ul>";

    let noTransaksi = "ZHW-" + Math.floor(100000 + Math.random() * 900000);
    let tanggalWaktu = new Date().toLocaleString('id-ID');

    // Tampilkan Struk
    let resultSection = document.getElementById('resultSection');
    let strukContent = document.getElementById('strukContent');

    strukContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 10px;">
            <h3 style="color: #d81b60; margin-bottom: 2px;">ZAHWA'S REFRESHING & TRENDY CAFE</h3>
            <p style="font-size: 12px; color: #880e4f;">Jl. Kuliner Nusantara No. 88</p>
            <hr style="border: 0; border-top: 1px dashed #f48fb1; margin: 8px 0;">
        </div>
        <p><strong>No. Transaksi:</strong> ${noTransaksi}</p>
        <p><strong>Waktu Pesan:</strong> ${tanggalWaktu}</p>
        <p><strong>Nama Pemesan:</strong> ${nama}</p>
        <hr style="border: 0; border-top: 1px dashed #f48fb1; margin: 8px 0;">
        <p><strong>Daftar Pesanan:</strong></p>
        ${daftarMenuHTML}
        <hr style="border: 0; border-top: 1px dashed #f48fb1; margin: 8px 0;">
        <p><strong>Total Harga Keseluruhan:</strong> <span style="color: #d81b60; font-weight: bold;">Rp ${totalHarga.toLocaleString('id-ID')}</span></p>
        ${statusBayarInfo}
        <hr style="border: 0; border-top: 1px dashed #f48fb1; margin: 8px 0;">
        <p style="text-align: center; font-size: 13px; color: #d81b60; font-weight: bold;">Terima Kasih Telah Memesan! Pesanan Anda sedang disiapkan.</p>
    `;

    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth' });
});

// Fungsi Cetak
function cetakStruk() {
    window.print();
}