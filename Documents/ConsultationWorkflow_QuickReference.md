# CONSULTATION WORKFLOW - QUICK REFERENCE

## 📋 DOCTOR WORKFLOW CHECKLIST

### Starting Consultation:
- [ ] Navigate to Consultation page (sidebar or dashboard)
- [ ] Select patient from dropdown
- [ ] Click "View History" to see medical background
- [ ] Fill structured forms across 5 tabs

### Data Entry Tabs:

**1️⃣ DIAGNOSIS**
- [ ] Chief complaint
- [ ] Primary diagnosis + ICD-10 code
- [ ] Severity (mild/moderate/severe)
- [ ] Onset date
- [ ] Chronic condition (yes/no)
- [ ] Symptoms (multi-select)
- [ ] Clinical observations
- [ ] Treatment plan
- [ ] Follow-up date

**2️⃣ PRESCRIPTION**
- [ ] Add medications (name, dosage, frequency, duration, instructions)
- [ ] Prescription notes

**3️⃣ LAB TESTS**
- [ ] Select tests (CBC, Blood Sugar, etc.)
- [ ] Set priority (routine/urgent/stat)
- [ ] Fasting required?
- [ ] Sample type
- [ ] Special instructions

**4️⃣ NOTES**
- [ ] SOAP notes (Subjective, Objective, Assessment, Plan)

**5️⃣ FILES**
- [ ] Upload X-rays, scans, reports (PDF/JPG/PNG)

### Ending Consultation:
- [ ] Click "End Consultation" (red button)
- [ ] Confirm in dialog
- [ ] System auto-generates summary
- [ ] Patient receives notification
- [ ] Record locked

---

## 📱 PATIENT EXPERIENCE

### During Consultation:
- Dashboard shows: **"🩺 Consultation in Progress"** (animated banner)
- Real-time updates as doctor adds data

### After Completion:
- Receives: **"✓ Consultation completed! View your results."** (toast)
- Click toast → Navigate to results page

### On Results Page:
- View all consultation details
- Download prescription PDF
- Download consultation summary PDF
- See follow-up reminder
- Check lab tests ordered

---

## 🔄 REAL-TIME EVENTS

| Event | Trigger | Patient Sees | Admin Sees |
|-------|---------|-------------|-----------|
| **consultationStarted** | Doctor saves first record | Green banner "In Progress" | Ongoing consultation list |
| **consultationEnded** | Doctor clicks "End Consultation" | Toast + nav to results | Status updated to COMPLETED |
| **prescriptionCreated** | Doctor creates prescription | "📄 New prescription available" | Prescription count updated |

---

## 📊 CONSULTATION STATUS FLOW

```
┌─────────────────┐
│   Patient       │
│   Selected      │
└────────┬────────┘
         │
         v
┌─────────────────┐
│   Fill Forms    │
│  (5 Tabs)       │
└────────┬────────┘
         │
         v
┌─────────────────┐      Socket Event
│   Save Record   │─────► consultationStarted
│  Status: ONGOING│
└────────┬────────┘
         │
         │ Doctor continues...
         │
         v
┌─────────────────┐
│ End Consultation│
│   (Button)      │
└────────┬────────┘
         │
         v
┌─────────────────┐      Socket Event
│ Status:         │─────► consultationEnded
│ COMPLETED       │
│ Duration: X min │
│ Summary: Auto   │
│ Locked: Yes     │
└─────────────────┘
         │
         v
┌─────────────────┐
│ Patient Views   │
│ Results + PDFs  │
└─────────────────┘
```

---

## 🎨 UI COLOR CODING

| Section | Color | Icon |
|---------|-------|------|
| Diagnosis Tab | Blue | 🩺 FaStethoscope |
| Prescription Tab | Green | 💊 FaPrescriptionBottleAlt |
| Lab Tests Tab | Amber | 📋 FaFileMedical |
| Notes Tab | Purple | 📝 FaClipboardList |
| Files Tab | Teal | 📤 FaUpload |
| Status ONGOING | Green | 🟢 |
| Status COMPLETED | Gray | 🔒 |
| End Consultation Btn | Red Gradient | ✓ FaCheck |

---

## 📄 PDF DOWNLOADS

### 1. Prescription PDF
- **Content:** Patient details, doctor info, medication table, instructions
- **Format:** Professional ℞ header, tabular layout
- **When:** Available after prescription created

### 2. Consultation Summary PDF
- **Content:** Complete visit details, vital signs, diagnosis, treatment, follow-up
- **Format:** Grid layouts, vital signs boxes, doctor signature
- **When:** Available after consultation completed

---

## 🔑 KEY FEATURES

✅ **Patient History Viewing** - Modal popup with all previous consultations  
✅ **Structured Data Entry** - No free text, all organized fields  
✅ **Real-Time Updates** - Patient sees live progress  
✅ **Status Tracking** - ONGOING → COMPLETED → LOCKED  
✅ **Auto Duration** - Calculates consultation time  
✅ **Auto Summary** - Generated when consultation ends  
✅ **PDF Generation** - Download prescription + summary  
✅ **Follow-up Reminders** - Calendar-based with date picker  
✅ **File Uploads** - X-rays, scans, reports  
✅ **Payment Tracking** - Fields ready for integration  

---

## 🚦 VALIDATION RULES

### Required Fields (Diagnosis Tab):
- Patient selection ✓
- Chief complaint ✓
- Primary diagnosis ✓
- Treatment plan ✓

### Required Fields (Prescription Tab):
- Medicine name ✓
- Dosage ✓
- Frequency ✓

### Required Fields (Lab Tab):
- At least one test selected ✓

### Required Fields (Files Tab):
- At least one file uploaded ✓

---

## 📍 NAVIGATION MAP

```
Doctor Dashboard
├── Sidebar → Consultation (direct access)
├── Start Consultation Button → /doctor/consultation
└── Workflow Buttons:
    ├── Add Diagnosis → /doctor/consultation?tab=diagnosis
    ├── Write Prescription → /doctor/consultation?tab=prescription
    ├── Order Lab Tests → /doctor/consultation?tab=lab
    ├── Add Doctor Notes → /doctor/consultation?tab=notes
    └── Upload Files → /doctor/consultation?tab=files

Patient Dashboard
├── Consultation Banner (when active)
└── Toast Notification (when ended)
    └── Click → /patient/consultation/:consultationId
```

---

## 💾 DATA STORAGE STRUCTURE

### MedicalRecord Document:
```javascript
{
  patient: ObjectId,
  doctor: ObjectId,
  visitDate: Date,
  chiefComplaint: String,
  symptoms: [String],
  observations: String,  // NEW
  diagnosis: String,
  treatment: String,
  vitalSigns: {
    bloodPressure, heartRate, temperature,
    weight, height, oxygenSaturation
  },
  followUpDate: Date,
  consultationStatus: 'ONGOING' | 'COMPLETED' | 'LOCKED',  // NEW
  consultationStartTime: Date,  // NEW
  consultationEndTime: Date,  // NEW
  consultationDuration: Number,  // NEW (minutes)
  consultationSummary: String,  // NEW (auto-generated)
  paymentStatus: 'PENDING' | 'PAYMENT_RECEIVED' | 'COMPLETED',  // NEW
  paymentAmount: Number,  // NEW
  paymentMode: 'online' | 'offline' | 'insurance',  // NEW
  invoiceGenerated: Boolean,  // NEW
  invoiceUrl: String,  // NEW
}
```

---

## 🎯 TESTING CHECKLIST

### Doctor Side:
- [ ] Can select patient and view history
- [ ] Can fill all 5 tabs independently
- [ ] Form validation works (required fields)
- [ ] Can add/remove medications dynamically
- [ ] Can upload multiple files
- [ ] End Consultation button appears after save
- [ ] Confirmation dialog shows before ending
- [ ] Status changes to COMPLETED after ending
- [ ] Cannot edit after consultation ended
- [ ] Socket event emitted (check browser console)

### Patient Side:
- [ ] Dashboard shows "In Progress" banner when consultation starts
- [ ] Banner disappears when consultation ends
- [ ] Toast notification received when consultation ends
- [ ] Can navigate to results page from toast
- [ ] Results page shows all details correctly
- [ ] Vital signs display properly
- [ ] Prescription table formatted correctly
- [ ] Lab tests listed with status
- [ ] Follow-up date displayed
- [ ] PDF downloads work (both prescription + summary)

### Socket Events:
- [ ] consultationStarted emitted when record saved
- [ ] consultationEnded emitted when doctor clicks end
- [ ] Patient receives events in real-time
- [ ] Dashboard updates without refresh

---

## 🆘 TROUBLESHOOTING

**Issue:** End Consultation button not showing  
**Fix:** Make sure you saved the record first (consultationId must exist)

**Issue:** Socket events not working  
**Fix:** Check socket connection in browser console. Ensure Socket.io server running.

**Issue:** PDF not downloading  
**Fix:** Check browser console for errors. Ensure all required data fields populated.

**Issue:** Patient can't see results  
**Fix:** Verify route `/patient/consultation/:consultationId` exists and consultation ID is valid.

**Issue:** Form validation failing  
**Fix:** Ensure all required fields filled (patient, chief complaint, diagnosis, treatment).

---

## 📞 API ENDPOINTS (Ready for Backend)

### Doctor APIs (to implement):
```
GET    /patients/:id/history          - Get patient medical history
POST   /medical-records                - Create consultation record
PATCH  /medical-records/:id            - Update record
POST   /medical-records/:id/end        - End consultation
POST   /prescriptions                  - Create prescription
POST   /medical-records/:id/upload     - Upload lab reports
```

### Patient APIs (to implement):
```
GET    /medical-records/:id            - Get consultation details
GET    /prescriptions/:id              - Get prescription details
```

### Socket Events (to emit from backend):
```
socket.emit('consultationStarted', { patientId, consultationId, diagnosis })
socket.emit('consultationEnded', { patientId, consultationId, summary })
socket.emit('prescriptionCreated', { patientId, consultationId })
```

---

**Last Updated:** February 1, 2026  
**Status:** ✅ Implementation Complete - Ready for Backend Integration
