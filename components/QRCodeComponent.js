// components/QRCodeComponent.js
import React, { useRef } from "react";
import QRCode from "react-qr-code";

const QRCodeComponent = ({ value }) => {
  const qrRef = useRef();

  const downloadQRCode = () => {
    const svg = qrRef.current.querySelector("svg");
    const svgData = new XMLSerializer().serializeToString(svg);
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
      a.download = "QRCode_KartuKeluarga.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div style={{ textAlign: "center", marginBottom: "10px" }} ref={qrRef}>
      <h3>QR Code untuk Verifikasi</h3>
      <QRCode value={value} size={150} />
      <br />
      <button onClick={downloadQRCode} className="download-button">
        Download
      </button>
    </div>
  );
};

export default QRCodeComponent;
