import { CertificateData } from '../types/certificate';

export function generateCertificateHTML(data: CertificateData): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Constancia - ${data.nombre}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      background: white;
      width: 8.5in;
      height: 11in;
      margin: 0;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .certificate {
      width: 7.5in;
      height: 10in;
      border: 8px double #2c5282;
      padding: 0.75in;
      position: relative;
      background: linear-gradient(135deg, #ffffff 0%, #f7fafc 100%);
      box-shadow: inset 0 0 0 2px #4a5568;
    }
    
    .inner-border {
      border: 2px solid #cbd5e0;
      padding: 0.5in;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    
    .title {
      font-size: 48px;
      color: #2c5282;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 4px;
      margin-bottom: 10px;
      font-family: 'Georgia', serif;
    }
    
    .subtitle {
      font-size: 20px;
      color: #4a5568;
      font-style: italic;
      margin-top: 10px;
    }
    
    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      text-align: center;
      padding: 20px 0;
    }
    
    .text {
      font-size: 18px;
      line-height: 2;
      color: #2d3748;
      margin-bottom: 20px;
    }
    
    .recipient {
      font-size: 32px;
      font-weight: bold;
      color: #2c5282;
      margin: 30px 0;
      text-decoration: underline;
      text-decoration-color: #cbd5e0;
      text-underline-offset: 8px;
    }
    
    .course {
      font-size: 24px;
      font-weight: 600;
      color: #2c5282;
      margin: 20px 0;
      font-style: italic;
    }
    
    .details {
      font-size: 18px;
      color: #4a5568;
      margin: 15px 0;
    }
    
    .footer {
      margin-top: 60px;
      display: flex;
      justify-content: space-around;
      align-items: flex-end;
    }
    
    .signature {
      text-align: center;
      flex: 1;
      margin: 0 20px;
    }
    
    .signature-line {
      width: 200px;
      border-top: 2px solid #2d3748;
      margin: 0 auto 10px;
      padding-top: 5px;
    }
    
    .signature-name {
      font-size: 14px;
      font-weight: bold;
      color: #2d3748;
    }
    
    .signature-title {
      font-size: 12px;
      color: #718096;
      margin-top: 5px;
    }
    
    .cuv {
      font-size: 11px;
      color: #718096;
      font-family: 'Courier New', monospace;
      margin-bottom: 5px;
    }
    
    .qr-container {
      position: absolute;
      bottom: 20px;
      right: 30px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .qr-code {
      width: 80px;
      height: 80px;
      margin-bottom: 5px;
      border: 1px solid #cbd5e0;
      padding: 5px;
      background: white;
    }
    
    .ornament {
      text-align: center;
      font-size: 40px;
      color: #cbd5e0;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="inner-border">
      <div class="header">
        <div class="title">Constancia</div>
        <div class="subtitle">de Participación</div>
        <div class="ornament">❖</div>
      </div>
      
      <div class="content">
        <div class="text">Se otorga la presente constancia a:</div>
        
        <div class="recipient">${data.nombre}</div>
        
        <div class="text">
          Por haber completado satisfactoriamente el curso de:
        </div>
        
        <div class="course">${data.curso}</div>
        
        <div class="details">
          Con una duración de <strong>${data.horas} horas</strong>
        </div>
        
        <div class="details">
          Fecha de conclusión: <strong>${new Date(data.fecha).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}</strong>
        </div>
      </div>
      
      <div class="footer">
        <div class="signature">
          <div class="signature-line"></div>
          <div class="signature-name">Director Académico</div>
          <div class="signature-title">Firma y Sello</div>
        </div>
        
        <div class="signature">
          <div class="signature-line"></div>
          <div class="signature-name">Coordinador del Curso</div>
          <div class="signature-title">Firma y Sello</div>
        </div>
      </div>
      
      <div class="qr-container">
        ${data.qrCodeDataUrl ? `<img src="${data.qrCodeDataUrl}" class="qr-code" alt="QR Code" />` : ''}
        <div class="cuv">CUV: ${data.cuv}</div>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
