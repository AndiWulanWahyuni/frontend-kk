import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import QRCode from "react-qr-code";

export default function EditKKPage() {
  const router = useRouter();
  const { nomorKK } = router.query;

  const [kkData, setKkData] = useState(null);
  const [nomorKKLama, setNomorKKLama] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/kk/verify`, { nomorKK });
      if (res.data.success) {
        setKkData(res.data.data);
        setNomorKKLama(res.data.data.nomorKK);
      } else {
        alert(res.data.message);
        router.push("/listdata");
      }
    } catch (error) {
      console.error("❌ Error fetching data:", error);
      alert("❌ Terjadi kesalahan saat mengambil data.");
      router.push("/listdata");
    }
  }, [nomorKK, router]);

  useEffect(() => {
    if (nomorKK) fetchData();
  }, [nomorKK, fetchData]);

  const handleChange = (field, value) => {
    setKkData(prev => ({ ...prev, [field]: value }));
  };

  const handleMemberChange = (index, field, value) => {
    const updated = [...kkData.anggotaKeluarga];
    updated[index][field] = value;
    setKkData(prev => ({ ...prev, anggotaKeluarga: updated }));
  };

  const handleAddMember = () => {
    setKkData(prev => ({
      ...prev,
      anggotaKeluarga: [...prev.anggotaKeluarga, { nama: "", hubungan: "" }],
    }));
  };

  const handleRemoveMember = (index) => {
    const updated = kkData.anggotaKeluarga.filter((_, i) => i !== index);
    setKkData(prev => ({ ...prev, anggotaKeluarga: updated }));
  };

  const handleSave = async () => {
    if (!kkData) return;
    setSaving(true);
    try {
      const updatedData = {
        ...kkData,
        tanggalTtd: new Date().toISOString(),
      };

      if (nomorKKLama === kkData.nomorKK) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/kk/update/${kkData.nomorKK}`,
          updatedData
        );
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/kk/replace`, {
          nomorKKLama,
          nomorKKBaru: kkData.nomorKK,
          ...updatedData,
        });
      }

      alert("✅ Data berhasil disimpan!");
      router.push("/listdata");
    } catch (error) {
      console.error("❌ Gagal menyimpan:", error);
      alert("❌ Gagal menyimpan data.");
    } finally {
      setSaving(false);
    }
  };

  if (!kkData) return <p>🔄 Memuat data...</p>;

  return (
    <div className="edit-container">
      <h2>Edit Data Kartu Keluarga</h2>

      <div className="qr-code">
        <QRCode value={`https://frontend-kk.vercel.app/verify?nomorKK=${kkData.nomorKK}`} size={128} />
      </div>

      <div className="form-group">
        <label>Status Dokumen</label>
        <select value={kkData.statusDokumen} onChange={(e) => handleChange("statusDokumen", e.target.value)}>
          <option value="aktif">Aktif</option>
          <option value="tidak aktif">Tidak Aktif</option>
        </select>
      </div>

      <div className="form-group">
        <label>Nomor KK</label>
        <input value={kkData.nomorKK} onChange={(e) => handleChange("nomorKK", e.target.value)} />
      </div>

      <div className="form-group">
        <label>Alamat</label>
        <input value={kkData.alamat} onChange={(e) => handleChange("alamat", e.target.value)} />
      </div>

      <div className="form-group">
        <label>Anggota Keluarga</label>
        {kkData.anggotaKeluarga.map((member, i) => (
          <div className="anggota-row" key={i}>
            <input
              type="text"
              value={member.nama}
              onChange={(e) => handleMemberChange(i, "nama", e.target.value)}
              placeholder="Nama"
            />
            <input
              type="text"
              value={member.hubungan}
              onChange={(e) => handleMemberChange(i, "hubungan", e.target.value)}
              placeholder="Hubungan"
            />
            <button type="button" onClick={() => handleRemoveMember(i)} className="remove-btn">🗑️</button>
          </div>
        ))}
        <button type="button" onClick={handleAddMember} className="add-btn">Tambah Anggota</button>
      </div>

      <div className="form-group">
        <label>Daerah</label>
        <input value={kkData.daerah} onChange={(e) => handleChange("daerah", e.target.value)} />
      </div>

      <div className="form-group">
        <label>Penandatangan</label>
        <input value={kkData.penandatangan} onChange={(e) => handleChange("penandatangan", e.target.value)} />
      </div>

      <button onClick={handleSave} disabled={saving} className="save-btn">
        {saving ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </div>
  );
}
