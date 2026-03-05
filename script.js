// Ambil elemen input
const namaProduk   = document.getElementById('namaProduk');
const hargaBeli    = document.getElementById('hargaBeli');
const hargaJual    = document.getElementById('hargaJual');
const stok         = document.getElementById('stok');
const pilihProduk  = document.getElementById('pilihProduk');

// Format rupiah
function formatInputRupiah(el) {
  let angka = el.value.replace(/[^0-9]/g, '');
  el.value = angka ? 'Rp ' + parseInt(angka).toLocaleString('id-ID') : '';
}
function bersihkanRupiah(teks) { return parseInt(teks.replace(/[^0-9]/g,'')) || 0; }
function formatRupiah(angka) { return 'Rp ' + angka.toLocaleString('id-ID'); }

// Data localStorage
let produk = JSON.parse(localStorage.getItem('produk')) || [];
let penjualan = JSON.parse(localStorage.getItem('penjualan')) || [];
let strukTerakhir = null;

// Simpan data ke localStorage
function simpanData() {
  localStorage.setItem('produk', JSON.stringify(produk));
  localStorage.setItem('penjualan', JSON.stringify(penjualan));
}

// Tambah Produk
function tambahProduk() {
  const nama = namaProduk.value.trim();
  const beli = bersihkanRupiah(hargaBeli.value);
  const jual = bersihkanRupiah(hargaJual.value);
  const stokVal = parseInt(stok.value);

  if(!nama){ alert('Nama produk harus diisi'); return; }
  if(jual <= beli){ alert('Harga jual harus lebih besar dari harga beli'); return; }
  if(isNaN(stokVal) || stokVal<0){ alert('Stok harus valid & tidak minus'); return; }
  if(produk.some(p => p.nama.toLowerCase()===nama.toLowerCase())){ alert('Nama produk sudah ada'); return; }

  produk.push({ nama, beli, jual, stok: stokVal });
  renderProduk();
  simpanData();
  namaProduk.value = hargaBeli.value = hargaJual.value = stok.value = '';
}

// Render daftar produk
function renderProduk() {
  const tbody = document.querySelector('#tabelProduk tbody');
  tbody.innerHTML = '';
  pilihProduk.innerHTML = '';

  produk.forEach((p,i)=>{
    tbody.innerHTML += `
      <tr>
        <td>${p.nama}</td>
        <td>${formatRupiah(p.beli)}</td>
        <td>${formatRupiah(p.jual)}</td>
        <td style="background:${p.stok==0?'#f8d7da':'#e8f5e9'}; color:${p.stok==0?'#721c24':'#1b5e20'}; font-weight:bold;">${p.stok}</td>
        <td>
          <button onclick="editStok(${i})">Edit Stok</button>
          <button class="danger" onclick="hapusProduk(${i})">Hapus</button>
        </td>
      </tr>`;
    pilihProduk.innerHTML += `<option value="${i}">${p.nama}</option>`;
  });
}

// Edit stok
function editStok(i){
  const p = produk[i];
  const stokBaru = prompt('Update Stok untuk ' + p.nama, p.stok);
  if(stokBaru===null) return;
  const stokAngka = parseInt(stokBaru);
  if(isNaN(stokAngka) || stokAngka<0){ alert('Stok harus valid & tidak minus'); return; }
  p.stok = stokAngka;
  renderProduk();
  simpanData();
}

// Hapus produk
function hapusProduk(i){
  if(!confirm('Yakin ingin menghapus produk ini?')) return;
  produk.splice(i,1);
  renderProduk();
  simpanData();
}

// Jual produk
function jualProduk(){
  const i = pilihProduk.value;
  const jumlah = parseInt(jumlahJual.value);
  const p = produk[i];
  if(!jumlah || jumlah<=0){ alert('Masukkan jumlah valid'); return; }
  if(jumlah > p.stok){ alert('Stok tidak cukup'); return; }

  p.stok -= jumlah;
  const total = jumlah*p.jual;
  strukTerakhir = {
    tanggal: new Date().toLocaleString(),
    nama: p.nama,
    jumlah,
    harga: p.jual,
    total
  };
  penjualan.push({
    tanggal: new Date().toLocaleString(),
    nama: p.nama,
    jumlah,
    total
  });

  renderProduk();
  renderPenjualan();
  simpanData();
  jumlahJual.value = '';
}

// Cetak struk
function cetakStruk(){
  if(!strukTerakhir){ alert('Belum ada transaksi'); return; }
  const s = strukTerakhir;
  const win = window.open('','', 'width=300,height=500');
  win.document.write(`
    <html><head><title>Struk</title>
    <style>body{font-family:monospace;} h3{text-align:center;} hr{border:1px dashed #000;}</style>
    </head><body>
    <h3>STRUK PEMBELIAN</h3><hr>
    <p>Tanggal: ${s.tanggal}</p>
    <p>Produk: ${s.nama}</p>
    <p>Jumlah: ${s.jumlah}</p>
    <p>Harga: ${formatRupiah(s.harga)}</p>
    <hr><h3>Total: ${formatRupiah(s.total)}</h3><hr>
    <p style="text-align:center">Terima Kasih</p>
    </body></html>
  `);
  win.document.close();
  win.print();
}

// Render riwayat penjualan
function renderPenjualan(){
  const tbody = document.querySelector('#tabelPenjualan tbody');
  tbody.innerHTML = '';
  penjualan.forEach(p=>{
    tbody.innerHTML += `<tr>
      <td>${p.tanggal}</td>
      <td>${p.nama}</td>
      <td>${p.jumlah}</td>
      <td>${formatRupiah(p.total)}</td>
    </tr>`;
  });
}

// Render awal
renderProduk();
renderPenjualan();