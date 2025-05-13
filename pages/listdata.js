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
      alert("✅ Perubahan berhasil disimpan!");
    } catch (err) {
      console.error("Gagal menyimpan data:", err);
    } finally {
      setSavingIndex(null);
    }
  };

  const handleDownloadQR = (kkIndex) => {
    const svg = document.querySelector(`#qr-${kkIndex} svg`);
    const serializer = new XMLSerializer();
    const svgData = serializer.serializeToString(svg);
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
    <div className="container">
      <h1>📄 Daftar Kartu Keluarga</h1>
      {loading && <p>🔄 Memuat data...</p>}
      {dataList.map((data, index) => (
        <div className="kk-card" key={data._id}>
          <div className="kk-header">
            <span className="kk-nomor">{data.nomorKK}</span>
            <span className={`kk-status ${data.statusDokumen === "aktif" ? "aktif" : "tidak-aktif"}`}>
              {data.statusDokumen === "aktif" ? "Aktif" : "Tidak Aktif"}
            </span>
          </div>
          <p>{data.alamat}</p>
          <p>Penandatangan: <br />{data.daerah}<br />{data.penandatangan}, {new Date(data.tanggalTtd).toLocaleString()}</p>

          <div className="qr-section">
            <div id={`qr-${index}`}>
              <QRCode value={`https://frontend-kk.vercel.app/verify?nomorKK=${data.nomorKK}`} size={128} />
            </div>
            <button className="btn" onClick={() => handleDownloadQR(index)}>⬇️ Download QR</button>
          </div>

          {editingIndex === index ? (
            <div>
              <label>Nomor KK:</label>
              <input value={data.nomorKK} onChange={(e) => handleInputChange(index, "nomorKK", e.target.value)} />

              <label>Alamat:</label>
              <input value={data.alamat} onChange={(e) => handleInputChange(index, "alamat", e.target.value)} />

              <label>Status Dokumen:</label>
              <select value={data.statusDokumen} onChange={(e) => handleInputChange(index, "statusDokumen", e.target.value)}>
                <option value="aktif">Aktif</option>
                <option value="tidak aktif">Tidak Aktif</option>
              </select>

              <label>Daerah:</label>
              <input value={data.daerah} onChange={(e) => handleInputChange(index, "daerah", e.target.value)} />

              <label>Penandatangan:</label>
              <input value={data.penandatangan} onChange={(e) => handleInputChange(index, "penandatangan", e.target.value)} />

              <h4>👨‍👩‍👧‍👦 Anggota Keluarga</h4>
              <table className="anggota-table">
                <thead>
                  <tr><th>Nama</th><th>Hubungan</th><th>Aksi</th></tr>
                </thead>
                <tbody>
                  {data.anggotaKeluarga.map((member, i) => (
                    <tr key={i}>
                      <td><input value={member.nama} onChange={(e) => handleMemberChange(index, i, "nama", e.target.value)} /></td>
                      <td><input value={member.hubungan} onChange={(e) => handleMemberChange(index, i, "hubungan", e.target.value)} /></td>
                      <td><button onClick={() => handleRemoveMember(index, i)}>❌</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={() => handleAddMember(index)}>➕ Tambah Anggota</button>

              {savingIndex === index ? (
                <button disabled>💾 Menyimpan...</button>
              ) : (
                <button onClick={() => handleSave(index)}>💾 Simpan Perubahan</button>
              )}
            </div>
          ) : (
            <button className="btn edit-btn" onClick={() => setEditingIndex(index)}>✏️ Edit</button>
          )}
        </div>
      ))}
    </div>
  );
}
