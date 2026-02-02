/**
 * PDF Generation Utility
 * Generates downloadable PDFs for prescriptions and consultation summaries
 */

export const generatePrescriptionPDF = (prescriptionData) => {
  const { patient, doctor, medications, date, notes } = prescriptionData;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { margin: 0; color: #2563eb; }
        .info { margin-bottom: 30px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .label { font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f3f4f6; font-weight: bold; }
        .footer { margin-top: 50px; border-top: 1px solid #ddd; padding-top: 20px; }
        .signature { margin-top: 40px; text-align: right; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>℞ PRESCRIPTION</h1>
        <p>Patient Records Management System</p>
      </div>
      
      <div class="info">
        <div class="info-row">
          <div><span class="label">Patient:</span> ${patient.name}</div>
          <div><span class="label">Date:</span> ${new Date(date).toLocaleDateString()}</div>
        </div>
        <div class="info-row">
          <div><span class="label">Age:</span> ${patient.age || 'N/A'}</div>
          <div><span class="label">Gender:</span> ${patient.gender || 'N/A'}</div>
        </div>
        <div class="info-row">
          <div><span class="label">Doctor:</span> Dr. ${doctor.name}</div>
          <div><span class="label">License:</span> ${doctor.licenseNumber || 'N/A'}</div>
        </div>
      </div>

      <h3>Medications Prescribed:</h3>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Medicine Name</th>
            <th>Dosage</th>
            <th>Frequency</th>
            <th>Duration</th>
            <th>Instructions</th>
          </tr>
        </thead>
        <tbody>
          ${medications.map((med, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>${med.name}</td>
              <td>${med.dosage}</td>
              <td>${med.frequency}</td>
              <td>${med.duration}</td>
              <td>${med.instructions || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      ${notes ? `
        <div style="margin-top: 20px;">
          <h4>Additional Instructions:</h4>
          <p>${notes}</p>
        </div>
      ` : ''}

      <div class="signature">
        <p>_______________________</p>
        <p>Dr. ${doctor.name}</p>
        <p>${doctor.specialization || 'Physician'}</p>
      </div>

      <div class="footer">
        <p style="font-size: 12px; color: #666;">
          This is a computer-generated prescription. For any queries, please contact the hospital.
        </p>
      </div>
    </body>
    </html>
  `;

  downloadPDF(htmlContent, `Prescription_${patient.name}_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateConsultationSummaryPDF = (consultationData) => {
  const { 
    patient, 
    doctor, 
    date, 
    chiefComplaint, 
    diagnosis, 
    symptoms, 
    observations,
    treatment, 
    vitalSigns,
    followUpDate,
    duration 
  } = consultationData;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { margin: 0; color: #059669; }
        .section { margin-bottom: 25px; }
        .section h3 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .info-item { margin-bottom: 10px; }
        .label { font-weight: bold; color: #555; }
        .vitals { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 10px; }
        .vital-box { border: 1px solid #e5e7eb; padding: 10px; border-radius: 5px; text-align: center; }
        .footer { margin-top: 50px; border-top: 1px solid #ddd; padding-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>CONSULTATION SUMMARY</h1>
        <p>Patient Records Management System</p>
      </div>

      <div class="section">
        <h3>Patient Information</h3>
        <div class="info-grid">
          <div class="info-item"><span class="label">Name:</span> ${patient.name}</div>
          <div class="info-item"><span class="label">Date:</span> ${new Date(date).toLocaleString()}</div>
          <div class="info-item"><span class="label">Age/Gender:</span> ${patient.age || 'N/A'} / ${patient.gender || 'N/A'}</div>
          <div class="info-item"><span class="label">Duration:</span> ${duration} minutes</div>
        </div>
      </div>

      <div class="section">
        <h3>Consultation Details</h3>
        <div class="info-item"><span class="label">Chief Complaint:</span> ${chiefComplaint}</div>
        <div class="info-item"><span class="label">Diagnosis:</span> ${diagnosis}</div>
        ${symptoms?.length > 0 ? `<div class="info-item"><span class="label">Symptoms:</span> ${symptoms.join(', ')}</div>` : ''}
        ${observations ? `<div class="info-item"><span class="label">Clinical Observations:</span> ${observations}</div>` : ''}
      </div>

      <div class="section">
        <h3>Vital Signs</h3>
        <div class="vitals">
          <div class="vital-box">
            <div style="font-size: 12px; color: #666;">Blood Pressure</div>
            <div style="font-size: 18px; font-weight: bold;">${vitalSigns?.bloodPressure || 'N/A'}</div>
          </div>
          <div class="vital-box">
            <div style="font-size: 12px; color: #666;">Heart Rate</div>
            <div style="font-size: 18px; font-weight: bold;">${vitalSigns?.heartRate || 'N/A'} bpm</div>
          </div>
          <div class="vital-box">
            <div style="font-size: 12px; color: #666;">Temperature</div>
            <div style="font-size: 18px; font-weight: bold;">${vitalSigns?.temperature || 'N/A'} °F</div>
          </div>
          <div class="vital-box">
            <div style="font-size: 12px; color: #666;">SpO2</div>
            <div style="font-size: 18px; font-weight: bold;">${vitalSigns?.oxygenSaturation || 'N/A'}%</div>
          </div>
          <div class="vital-box">
            <div style="font-size: 12px; color: #666;">Weight</div>
            <div style="font-size: 18px; font-weight: bold;">${vitalSigns?.weight || 'N/A'} kg</div>
          </div>
          <div class="vital-box">
            <div style="font-size: 12px; color: #666;">Height</div>
            <div style="font-size: 18px; font-weight: bold;">${vitalSigns?.height || 'N/A'} cm</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h3>Treatment Plan</h3>
        <div class="info-item">${treatment}</div>
        ${followUpDate ? `<div class="info-item"><span class="label">Follow-up Date:</span> ${new Date(followUpDate).toLocaleDateString()}</div>` : ''}
      </div>

      <div style="margin-top: 60px; text-align: right;">
        <p>_______________________</p>
        <p>Dr. ${doctor.name}</p>
        <p>${doctor.specialization || 'Physician'}</p>
      </div>

      <div class="footer">
        <p>This is a computer-generated consultation summary.</p>
        <p>Generated on: ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
  `;

  downloadPDF(htmlContent, `Consultation_${patient.name}_${new Date().toISOString().split('T')[0]}.pdf`);
};

const downloadPDF = (htmlContent, filename) => {
  // Create a blob from HTML content
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  // Create temporary anchor and trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
  
  // Note: For production, integrate with libraries like jsPDF or pdfmake for better PDF generation
  console.log('PDF generation: For production use, integrate jsPDF or pdfmake library');
};

export const printPrescription = (prescriptionData) => {
  // Similar to generatePrescriptionPDF but opens print dialog
  const printWindow = window.open('', '_blank');
  const { patient, doctor, medications, date, notes } = prescriptionData;
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Prescription - ${patient.name}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f3f4f6; }
        @media print {
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>℞ PRESCRIPTION</h1>
      </div>
      <p><strong>Patient:</strong> ${patient.name} | <strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
      <p><strong>Doctor:</strong> Dr. ${doctor.name}</p>
      <table>
        <thead>
          <tr><th>#</th><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th></tr>
        </thead>
        <tbody>
          ${medications.map((med, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>${med.name}</td>
              <td>${med.dosage}</td>
              <td>${med.frequency}</td>
              <td>${med.duration}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <button onclick="window.print()">Print</button>
    </body>
    </html>
  `);
  
  printWindow.document.close();
};
