import { useEffect, useState } from "react";
import axios from "axios";
import QRCode from "react-qr-code";
import { useRouter } from "next/router";

export default function KKListPage() {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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

  const handleEdit = (nomorKK) => {
    router.push(`/editdata?nomorKK=${nomorKK}`);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>📄 Daftar Kartu Keluarga</h1>
      {loading && <p>🔄 Memuat data...</p>}
      {dataList.map((data, index) => (
        <div key={data.nomorKK} style={{ border: "1px solid #ccc", padding: "15px", margin: "15px 0" }}>
          <div id={`qr-${index}`}>
            <QRCode value={`https://frontend-kk.vercel.app/verify?nomorKK=${data.nomorKK}`} size={128} />
          </div>
          <button onClick={() => handleDownloadQR(index)} style={{ marginTop: "10px" }}>⬇️ Download QR</button>
          <div style={{ marginTop: "15px", textAlign: "left" }}>
            <p><strong>Nomor KK:</strong> {data.nomorKK}</p>
            <p><strong>Alamat:</strong> {data.alamat}</p>
            <p><strong>Status Dokumen:</strong> {data.statusDokumen}</p>
            <p><strong>Daerah:</strong> {data.daerah}</p>
            <p><strong>Penandatangan:</strong> {data.penandatangan}</p>
            <p><strong>Jumlah Anggota:</strong> {data.anggotaKeluarga.length}</p>
            <button onClick={() => handleEdit(data.nomorKK)} style={{ marginTop: "10px" }}>Edit</button>
          </div>
        </div>
      ))}
    </div>
  );
}
