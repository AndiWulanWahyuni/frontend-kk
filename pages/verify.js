import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

export default function VerifyPage() {
  const router = useRouter();
  const { nomorKK } = router.query;

  const [status, setStatus] = useState(null);
  const [dataKK, setDataKK] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!nomorKK) return;

    const verifyData = async () => {
      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/kk/verify`, {
          nomorKK,
        });        

        if (response.data.success) {
          setStatus("valid");
          setDataKK(response.data.data);
        } else {
          setStatus("invalid");
          setDataKK(null);
        }
      } catch (err) {
        console.error("❌ Gagal verifikasi:", err);
        setStatus("error");
      } finally {
        setLoading(false);
      }
    };

    verifyData();
  }, [nomorKK]);

  if (loading) return <p style={{ textAlign: "center" }}>🔄 Memverifikasi data...</p>;

  return (
    <div className="verify-container">
      <h1 className="verify-title">Verifikasi Kartu Keluarga</h1>

      {status === "valid" && dataKK && (
        <div className="verify-card">
          <div className="section">
            <div className="section-title">Status Dokumen</div>
            <div className="section-content">{dataKK.statusDokumen}</div>
          </div>

          <div className="section">
            <div className="section-title">No. KK</div>
            <div className="section-content">{dataKK.nomorKK?.slice(0, 13)}***</div>
          </div>

          <div className="section">
            <div className="section-title">Alamat</div>
            <div className="section-content">{dataKK.alamat}</div>
          </div>

          <div className="section">
            <div className="section-title">Daftar Anggota Keluarga</div>
            <table className="family-table">
              <tbody>
                {dataKK.anggotaKeluarga.map((anggota, index) => (
                  <tr key={index}>
                    <td>{anggota.nama}</td>
                    <td>{anggota.hubungan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="section">
            <div className="title" style={{ color: "#55a4f3" }}>Info Penandatangan</div>
          </div>

          <div className="section">
            <div className="section-title">Daerah</div>
            <div className="section-content">{dataKK.daerah}</div>
          </div>

          <div className="section">
            <div className="section-title">Penandatangan</div>
            <div className="section-content">{dataKK.penandatangan}</div>
          </div>

          <div className="section">
            <div className="section-title">Tanggal dan Waktu TTD</div>
            <div className="section-content">
              {new Date(dataKK.tanggalTtd).toLocaleString("id-ID")}
            </div>
          </div>

          <div className="footer-info">
            ✅ Data telah diverifikasi dan valid berdasarkan hash yang tersimpan di blockchain.
          </div>
        </div>
      )}

      {status === "invalid" && (
        <div className="error-box">
          <h2>❌ Data Tidak Valid</h2>
          <p>Data tidak cocok dengan hash yang tersimpan di blockchain.</p>
        </div>
      )}

      {status === "error" && (
        <div className="error-box">
          <h2>⚠️ Terjadi Kesalahan</h2>
          <p>Gagal memverifikasi data. Silakan coba beberapa saat lagi.</p>
        </div>
      )}
    </div>
  );
}
