import { useEffect, useState } from "react";
import axios from "axios";
import QRCode from "react-qr-code";

export default function KKListPage() {
  const [dataList, setDataList] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/kk`);
    setDataList(res.data);
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
      waktuTtd: new Date().toISOString()
    };

    await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/kk/${updatedKK._id}`, updatedKK);
    setEditingIndex(null);
    fetchData();
  };

  const handleDownloadQR = (kkIndex) => {
    const canvas = document.getElementById(`qr-${kkIndex}`);
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `KK-${dataList[kkIndex].nomorKK}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>📄 Daftar Data KK Aktif</h1>
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
              <button onClick={() => handleSave(index)}>💾 Simpan Perubahan</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
