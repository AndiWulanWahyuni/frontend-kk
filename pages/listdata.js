import { useEffect, useState } from "react";
import axios from "axios";
import QRCode from "react-qr-code";
import { useRouter } from "next/router";

export default function KKListPage() {
  const [dataList, setDataList] = useState([]);
  const [search, setSearch] = useState("");
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
    <div className="container">
      <h1 className="title">Daftar Kartu Keluarga</h1>

      {filteredData.map((data, index) => (
        <div key={index} className="kk-card">
          <table className="kk-table">
            <thead>
              <tr>
                <th>Status Dokumen</th>
                <th>No. KK</th>
                <th>Alamat</th>
                <th>Anggota Keluarga</th>
                <th>Info Penandatangan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{data.statusDokumen}</td>
                <td><strong>{data.nomorKK}</strong></td>
                <td>{data.alamat}</td>
                <td>
                  <ul className="anggota-list">
                    {data.anggotaKeluarga.map((anggota, i) => (
                      <li key={i}>{anggota.nama} - {anggota.hubungan}</li>
                    ))}
                  </ul>
                </td>
                <td>
                  {data.daerah}<br />
                  Kepala Dukcapil: {data.penandatangan}<br />
                  {new Date(data.tanggalTtd).toLocaleString("id-ID")}
                </td>
                <td>
                  <div className="qr-section" id={`qr-${index}`}>
                    <QRCode
                      value={`https://frontend-kk.vercel.app/verify?nomorKK=${data.nomorKK}`}
                      size={80}
                    />
                    <p className="download-link" onClick={() => handleDownloadQR(index)}>
                      Download
                    </p>
                    <button className="edit-btn" onClick={() => handleEdit(data.nomorKK)}>
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
