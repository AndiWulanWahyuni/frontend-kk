import { useState } from "react";
import axios from "axios";
import QRCodeComponent from "../components/QRCodeComponent";
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
            <h1>Autentikasi Kartu Keluarga dengan Blockchain</h1>
            <form onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "auto" }}>
                <h4>Status Dokumen</h4>
                <select value={statusDokumen} onChange={(e) => setStatusDokumen(e.target.value)} style={{ display: "block", margin: "10px auto", width: "100%" }}>
                    <option value="Aktif">Aktif</option>
                    <option value="Tidak Aktif">Tidak Aktif</option>
                </select>
                <h4>No. KK</h4>
                <input 
                    type="text" 
                    placeholder="Nomor KK" 
                    value={nomorKK} 
                    onChange={(e) => setNomorKK(e.target.value)} 
                    required 
                    style={{ display: "block", margin: "10px auto", width: "100%" }}
                />
                <h4>Alamat</h4>
                <input 
                    type="text" 
                    placeholder="Alamat" 
                    value={alamat} 
                    onChange={(e) => setAlamat(e.target.value)} 
                    required 
                    style={{ display: "block", margin: "10px auto", width: "100%" }}
                />

                <h4>Anggota Keluarga</h4>
                {anggotaKeluarga.map((member, index) => (
                    <div key={index}>
                        <input 
                            type="text" 
                            placeholder="Nama" 
                            value={member.nama} 
                            onChange={(e) => handleMemberChange(index, "nama", e.target.value)} 
                            required 
                            style={{ display: "inline-block", margin: "5px", width: "45%" }}
                        />
                        <input 
                            type="text" 
                            placeholder="Hubungan" 
                            value={member.hubungan} 
                            onChange={(e) => handleMemberChange(index, "hubungan", e.target.value)} 
                            required 
                            style={{ display: "inline-block", margin: "5px", width: "45%" }}
                        />
                    </div>
                ))}
                <button type="button" onClick={handleAddMember} style={{ display: "block", margin: "10px auto" }}>
                    Tambah Anggota Keluarga
                </button>
                        <h4 style={{ color: "blue" }}>Info Penandatangan</h4>
                        <h4>Daerah</h4>
                        <input
                            type="text"
                            placeholder="Daerah"
                            value={daerah}
                            onChange={(e) => setDaerah(e.target.value)}
                            required
                            style={{ display: "block", margin: "10px auto", width: "100%" }}
                        />
                        <h4>Penandatangan</h4>
                        <input
                            type="text"
                            placeholder="Nama Penandatangan"
                            value={penandatangan}
                            onChange={(e) => setPenandatangan(e.target.value)}
                            required
                            style={{ display: "block", margin: "10px auto", width: "100%" }}
                        />
                <button type="submit" style={{ display: "block", margin: "10px auto" }}>Simpan Data</button>
            </form>

            {qrValue && <QRCodeComponent value={qrValue} />}
        </div>
    );
}
