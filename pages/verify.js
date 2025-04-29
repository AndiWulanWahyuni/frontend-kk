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
    <div style={{ maxWidth: "600px", margin: "auto", padding: "20px", textAlign: "center" }}>
      <h1>Hasil Verifikasi Kartu Keluarga</h1>

      {status === "valid" && dataKK && (
        <>
          <h2 style={{ color: "green" }}>✅ Data Valid</h2>
          <p><strong>Nomor KK:</strong> {dataKK.nomorKK}</p>
          <p><strong>Alamat:</strong> {dataKK.alamat}</p>

          <h3>👨‍👩‍👧‍👦 Anggota Keluarga:</h3>
          <ul style={{ textAlign: "left", paddingLeft: "20px" }}>
            {dataKK.anggotaKeluarga.map((anggota, index) => (
              <li key={index}>
                {anggota.nama} - {anggota.hubungan}
              </li>
            ))}
          </ul>

          <p style={{ fontSize: "12px", marginTop: "10px" }}>
            🔒 Verifikasi hash cocok dengan yang disimpan di blockchain.
          </p>
        </>
      )}

      {status === "invalid" && (
        <>
          <h2 style={{ color: "red" }}>❌ Data Tidak Valid</h2>
          <p>Data tidak sesuai dengan hash yang tersimpan di blockchain.</p>
          <p>🛑 Data ini mungkin telah diubah setelah disimpan.</p>
        </>
      )}

      {status === "error" && (
        <>
          <h2 style={{ color: "orange" }}>⚠️ Terjadi Kesalahan</h2>
          <p>Gagal memverifikasi data. Silakan coba lagi nanti.</p>
        </>
      )}
    </div>
  );
}
