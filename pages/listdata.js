import { useEffect, useState } from "react";
import axios from "axios";
import QRCode from "react-qr-code";

export default function KKListPage() {
  const [dataList, setDataList] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savingIndex, setSavingIndex] = useState(null); // Menunjukkan data mana yang sedang disimpan

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/kk/list`);
      setDataList(res.data.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };  

  const handleInputChange = (index, field, value) => {
    const updated = [...dataList];
    updated[index][field] = value;
    setDataList(updated);
  };

  const handleMemberChange = (kkIndex, memberIndex, field, value) => {
    const updated = [...dataList];
    updated[kkIndex].anggotaKeluarga[memberIndex][field] = value;
    setDataList(updated);
  };

  const handleAddMember = (kkIndex) => {
    const updated = [...dataList];
    updated[kkIndex].anggotaKeluarga.push({ nama: "", hubungan: "" });
    setDataList(updated);
  };

  const handleRemoveMember = (kkIndex, memberIndex) => {
    const updated = [...dataList];
    updated[kkIndex].anggotaKeluarga.splice(memberIndex, 1);
    setDataList(updated);
  };

  const handleSave = async (index) => {
    const updatedKK = {
      ...dataList[index],
      tanggalTtd: new Date().toISOString()
    };
  
    setSavingIndex(index);
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/kk/update/${updatedKK.nomorKK}`, updatedKK);
      setEditingIndex(null);
      await fetchData();
    } catch (err) {
      console.error("Gagal menyimpan data:", err);
    } finally {
      setSavingIndex(null);
    }
  };  

  const handleDownloadQR = (kkIndex) => {
    const svgElement = document.getElementById(`qr-${kkIndex}`).querySelector("svg");
    const serializer = new XMLSerializer();
    const svgData = serializer.serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = pngFile;
      a.download = `KK-${dataList[kkIndex].nomorKK}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };
  

  return (
    <div style={{ padding: "20px" }}>
      <h1>📄 Daftar Data KK Aktif</h1>
      {loading && <p>🔄 Memuat data...</p>}
      {dataList.map((data, index) => (
        <div key={data._id} style={{ border: "1px solid #ccc", padding: "15px", margin: "15px 0" }}>
          <QRCode id={`qr-${index}`} value={data.nomorKK} size={128} />
          <button onClick={() => handleDownloadQR(index)} style={{ marginLeft: "10px" }}>⬇️ Download QR</button>

          <div style={{ marginTop: "15px" }}>
            <label>Nomor KK:</label>
            <input
              value={data.nomorKK}
              onChange={(e) => handleInputChange(index, "nomorKK", e.target.value)}
              style={{ width: "100%" }}
            />

            <label>Alamat:</label>
            <input
              value={data.alamat}
              onChange={(e) => handleInputChange(index, "alamat", e.target.value)}
              style={{ width: "100%" }}
            />

            <label>Status Dokumen:</label>
            <select
              value={data.statusDokumen}
              onChange={(e) => handleInputChange(index, "statusDokumen", e.target.value)}
            >
              <option value="aktif">Aktif</option>
              <option value="tidak aktif">Tidak Aktif</option>
            </select>

            <label>Daerah Penandatangan:</label>
            <input
              value={data.daerah}
              onChange={(e) => handleInputChange(index, "daerah", e.target.value)}
              style={{ width: "100%" }}
            />

            <label>Nama Penandatangan:</label>
            <input
              value={data.penandatangan}
              onChange={(e) => handleInputChange(index, "penandatangan", e.target.value)}
              style={{ width: "100%" }}
            />

            <h4>👨‍👩‍👧‍👦 Anggota Keluarga:</h4>
            {data.anggotaKeluarga.map((member, i) => (
              <div key={i}>
                <input
                  type="text"
                  placeholder="Nama"
                  value={member.nama}
                  onChange={(e) => handleMemberChange(index, i, "nama", e.target.value)}
                  style={{ width: "45%", marginRight: "10px" }}
                />
                <input
                  type="text"
                  placeholder="Hubungan"
                  value={member.hubungan}
                  onChange={(e) => handleMemberChange(index, i, "hubungan", e.target.value)}
                  style={{ width: "45%" }}
                />
                <button onClick={() => handleRemoveMember(index, i)}>❌</button>
              </div>
            ))}
            <button onClick={() => handleAddMember(index)}>➕ Tambah Anggota</button>

            <div style={{ marginTop: "10px" }}>
            {savingIndex === index ? (
                <button disabled>💾 Menyimpan...</button>
            ) : (
            <button onClick={() => handleSave(index)}>💾 Simpan Perubahan</button>
            )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
