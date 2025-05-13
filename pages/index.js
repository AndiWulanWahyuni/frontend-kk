import { useState } from "react";
import axios from "axios";
import QRCodeComponent from "../components/QRCodeComponent";
import "../styles/style";
console.log("QRCodeComponent is:", QRCodeComponent);

export default function Home() {
    const [statusDokumen, setStatusDokumen] = useState("Aktif");
    const [nomorKK, setNomorKK] = useState("");
    const [alamat, setAlamat] = useState("");
    const [anggotaKeluarga, setAnggotaKeluarga] = useState([{ nama: "", hubungan: "" }]);
    const [daerah, setDaerah] = useState("");
    const [penandatangan, setPenandatangan] = useState("");
    const [qrValue, setQRValue] = useState("");

    // Fungsi untuk menambah anggota keluarga baru ke dalam array
    const handleAddMember = () => {
        setAnggotaKeluarga([...anggotaKeluarga, { nama: "", hubungan: "" }]);
    };

    // Fungsi untuk mengubah nilai dalam array anggota keluarga
    const handleMemberChange = (index, field, value) => {
        const updatedMembers = [...anggotaKeluarga];
        updatedMembers[index][field] = value;
        setAnggotaKeluarga(updatedMembers);
    };

    // Fungsi untuk menyimpan data KK ke backend dan menampilkan QR Code
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/kk/store`, {
                statusDokumen,
                nomorKK,
                alamat,
                anggotaKeluarga,
                daerah,
                penandatangan,
                tanggalTtd: new Date().toISOString(),
            });
    
            if (response.data.success) {
                console.log("✅ Data berhasil disimpan:", response.data);
                const link = `https://frontend-kk.vercel.app/verify?nomorKK=${nomorKK}`;
                setQRValue(link);
                console.log("✅ QR VALUE:", link);
                alert("✅ Data berhasil disimpan ke Firebase dan Blockchain!");
            } else {
                console.error("⚠️ Gagal menyimpan:", response.data.message);
                alert("⚠️ Gagal menyimpan data: " + response.data.message);
            }
        } catch (error) {
            if (error.response && error.response.data) {
                console.error("❌ Error saat menyimpan:", error.response.data);
                alert("❌ " + error.response.data.message);
            } else {
                console.error("❌ Error saat menyimpan:", error.message);
                alert("❌ Error saat menyimpan data.");
            }
        }        
    };

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <form className="form-container" onSubmit={handleSubmit}>
          <h2 style={{ textAlign: 'center', color: '#004080' }}>Input Data Kartu Keluarga</h2>
            <label className="form-label">Status Dokumen</label>
            <select
              className="form-input"
              value={statusDokumen}
              onChange={(e) => setStatusDokumen(e.target.value)}
            >
              <option value="Aktif">Aktif</option>
              <option value="Tidak Aktif">Tidak Aktif</option>
            </select>
    
            <label className="form-label">No. KK</label>
            <input
              className="form-input"
              type="text"
              placeholder="Nomor KK"
              value={nomorKK}
              onChange={(e) => setNomorKK(e.target.value)}
              required
            />
    
            <label className="form-label">Alamat</label>
            <input
              className="form-input"
              type="text"
              placeholder="Alamat"
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              required
            />
    
            <label className="form-label">Anggota Keluarga</label>
            {anggotaKeluarga.map((member, index) => (
              <div className="member-row" key={index}>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Nama"
                  value={member.nama}
                  onChange={(e) => handleMemberChange(index, "nama", e.target.value)}
                  required
                />
                <input
                  className="form-input"
                  type="text"
                  placeholder="Hubungan"
                  value={member.hubungan}
                  onChange={(e) => handleMemberChange(index, "hubungan", e.target.value)}
                  required
                />
              </div>
            ))}
            <button type="button" className="form-button" onClick={handleAddMember}>
              Tambah Anggota Keluarga
            </button>
    
            <label className="form-label">Daerah</label>
            <input
              className="form-input"
              type="text"
              placeholder="Daerah"
              value={daerah}
              onChange={(e) => setDaerah(e.target.value)}
              required
            />
    
            <label className="form-label">Penandatangan</label>
            <input
              className="form-input"
              type="text"
              placeholder="Nama Penandatangan"
              value={penandatangan}
              onChange={(e) => setPenandatangan(e.target.value)}
              required
            />
    
            <button type="submit" className="form-button">Simpan Data</button>
          </form>
    
          {qrValue && <QRCodeComponent value={qrValue} />}
        </div>
    );
}
