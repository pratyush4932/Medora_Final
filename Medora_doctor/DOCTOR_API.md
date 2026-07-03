# 🩺 Medora Doctor App API Documentation

This document lists and explains all backend API endpoints required by the **Medora Doctor App** (`Medora_doctor`), including detailed request payloads, success and error responses, and structural details.

* **Base URL**: `https://medora-backend.vercel.app` (or your local environment URL, e.g., `http://localhost:6363`)
* **Authentication**: Private routes require a JSON Web Token (JWT) in the `Authorization` header.
* **OTP Rule (Dev Mode)**: The default verification OTP for Twilio in local development is `000000`.

---

## 📋 Table of Endpoints

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/doctor/signin/send-otp` | Public | Send a 6-digit access code (OTP) via SMS to a doctor's registered phone number. |
| `POST` | `/doctor/signin/verify-otp` | Public | Verify the access code (OTP) and return a JWT access token along with doctor details. |
| `GET` | `/doctor/profile` | Protected | Fetch the authenticated doctor's profile information, linked hospital, and specialization. |
| `GET` | `/qr/:token` | Public | Retrieve patient demographic details, shared medical records with secure temporary signed URLs, and AI-generated summaries using a scanned QR token. |
| `POST` | `/doctor/signout` | Protected | Log out of the doctor session and invalidate the client-side session token. |

---

## 🔐 Authentication Header

For all protected routes, include the JWT returned during verification in the request headers:

```http
Authorization: Bearer <your_jwt_token_here>
```

---

## 📡 Endpoint Details

### 1. Send Doctor OTP
Sends a 6-digit verification code to the doctor's phone.

> [!NOTE]
> The phone number must already be registered in the system (i.e., added to the system by an administrator or hospital via `/hospital/doctors/add`). If the phone number is not found in the doctor directory, the request will fail.

* **Endpoint**: `/doctor/signin/send-otp`
* **Method**: `POST`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "phone": "+919998887776"
  }
  ```

* **Success Response (200 OK)**:
  ```json
  {
    "message": "OTP sent to doctor phone"
  }
  ```

* **Error Responses**:
  * **400 Bad Request (Invalid Format)**:
    ```json
    {
      "error": "Invalid phone format"
    }
    ```
  * **404 Not Found (Not Registered)**:
    ```json
    {
      "error": "Doctor not found. Please register or have a hospital add you first."
    }
    ```

---

### 2. Verify Doctor OTP
Verifies the access code sent to the doctor's mobile number, completing the sign-in flow.

* **Endpoint**: `/doctor/signin/verify-otp`
* **Method**: `POST`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "phone": "+919998887776",
    "otp": "000000"
  }
  ```

* **Success Response (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MjJiMWE5LTUwMDktNDNmYS04MzFkLTdmODcyNDBhMDNmZCIsInBob25lIjoiKzkxOTk5ODg4Nzc3NiIsInJvbGUiOiJkb2N0b3IiLCJob3NwaXRhbF9pZCI6ImRiZDk4NWEzLTIwMjQtNDBkYi05MTliLWJiNDk5YTMzNzg5MyIsImlhdCI6MTcxOTM2MDQ3MiwiZXhwIjoxNzE5OTY1MjcyfQ.xyz-signature-here",
    "doctor": {
      "id": "6822b1a9-5009-43fa-831d-7f87240a03fd",
      "name": "Dr. Rameshwar Reddy",
      "phone": "+919998887776",
      "specialization": "Cardiology",
      "hospital_id": "dbd985a3-2024-40db-919b-bb499a337893",
      "hospital_name": "CMRI HOSPITAL",
      "role": "doctor"
    }
  }
  ```

* **Error Responses**:
  * **400 Bad Request (Invalid Inputs)**:
    ```json
    {
      "error": "Invalid OTP"
    }
    ```
  * **401 Unauthorized (Doctor record deleted or missing)**:
    ```json
    {
      "error": "Doctor not found"
    }
    ```

---

### 3. Get Doctor Profile
Fetches detailed metadata regarding the currently signed-in doctor.

* **Endpoint**: `/doctor/profile`
* **Method**: `GET`
* **Headers**: 
  * `Authorization: Bearer <token>`
* **Request Body**: None

* **Success Response (200 OK)**:
  ```json
  {
    "doctor": {
      "id": "6822b1a9-5009-43fa-831d-7f87240a03fd",
      "name": "Dr. Rameshwar Reddy",
      "phone": "+919998887776",
      "specialization": "Cardiology",
      "license_no": "N/A",
      "hospital_id": "dbd985a3-2024-40db-919b-bb499a337893",
      "hospital": {
        "id": "dbd985a3-2024-40db-919b-bb499a337893",
        "name": "CMRI HOSPITAL"
      },
      "status": "active",
      "created_at": "2026-06-25T14:32:10.123Z"
    }
  }
  ```

* **Error Responses**:
  * **401 Unauthorized (Missing or Invalid Token)**:
    ```json
    {
      "error": "Unauthorized Access"
    }
    ```
  * **404 Not Found (Doctor record deleted)**:
    ```json
    {
      "error": "Doctor not found"
    }
    ```

---

### 4. Access Shared Patient Records (Scan QR Code)
Called when a doctor successfully scans a patient's QR code. The QR code contains a high-entropy UUID token that allows public read-only access to specific records and/or longitudinal health summaries granted by the patient.

> [!IMPORTANT]
> The `:token` URL parameter is extracted directly from the scanned QR code payload. This endpoint retrieves patient demographics, records (with secure, temporary signed S3/Supabase Storage URLs valid for 10 minutes), and pre-processed AI summaries depending on the patient's share settings.

* **Endpoint**: `/qr/:token`
* **Method**: `GET`
* **Headers**: Public (No auth token required; the QR token itself authenticates access)
* **Request Body**: None

* **Success Response (200 OK)**:
  ```json
  {
    "patient": {
      "id": "a98a0e8d-cdb6-455b-9d41-47752e25f82c",
      "name": "Rahul Sharma"
    },
    "records": [
      {
        "id": "11985392-491c-43bd-bd78-6889ebcc4a79",
        "file_type": "application/pdf",
        "created_at": "2026-06-25T14:35:42.000Z",
        "source": "hospital",
        "file_url": "https://medora-storage.supabase.co/storage/v1/object/sign/records/patient-a98a0e8d/report.pdf?token=temporary-signature-here&expires=1719361072",
        "ai_summary": {
          "is_medical_document": true,
          "complaints": [
            "Frequent dry cough",
            "Mild shortness of breath during exertion"
          ],
          "medications": [
            {
              "name": "Amoxicillin",
              "dosage": "500mg",
              "frequency": "Three times a day (TID)"
            },
            {
              "name": "Albuterol Inhaler",
              "dosage": "90mcg/actuation",
              "frequency": "As needed (PRN)"
            }
          ],
          "findings": [
            "Chest clear to auscultation bilaterally",
            "No wheezing or rales detected"
          ],
          "reports": [
            "Chest X-Ray (PA View)"
          ],
          "diagnosis": [
            "Mild Bronchitis"
          ],
          "simple_summary": "Patient complains of dry cough and mild shortness of breath. Prescribed Amoxicillin and Albuterol. Lungs are clear.",
          "ai_model_source": "gemini-2.5-flash"
        }
      }
    ],
    "ai_summary": {
      "overall_health_picture": [
        "Patient shows stable recovery from bronchitis with clear breath sounds on follow-up examinations.",
        "Symptoms show susceptibility to environmental factors, potentially seasonal."
      ],
      "identified_patterns": [
        {
          "pattern": "Seasonal triggers for bronchitis and dry cough",
          "trend": "stable",
          "frequency": 2,
          "evidence_summary": "Documented respiratory complaints occurred consistently in winter months across 2 years.",
          "confidence": "medium"
        }
      ],
      "clinical_signals": [
        {
          "signal": "Responsive to bronchodilator therapy",
          "type": "medication_pattern",
          "occurrences": 2,
          "note": "Albuterol inhaler prescribed multiple times with recorded symptom relief.",
          "confidence": "medium"
        }
      ],
      "patient_details": {
        "name": "Rahul Sharma",
        "age": "28",
        "gender": "Male",
        "blood_group": "B+"
      },
      "last_processed_at": "2026-06-25T14:36:00.123Z",
      "summary_status": "ready"
    },
    "expires_at": "2026-06-26T00:38:16.000Z",
    "message": "Records securely retrieved."
  }
  ```

> [!NOTE]
> `ai_summary` will return `null` if the patient has no pre-computed longitudinal AI summaries in the `patient_ai_summaries` table. When populated, it returns the structured object shown above.

* **Error Responses**:
  * **400 Bad Request (Missing token parameter)**:
    ```json
    {
      "error": "Token is required"
    }
    ```
  * **403 Forbidden (Expired token)**:
    ```json
    {
      "error": "QR token has expired"
    }
    ```
  * **404 Not Found (Invalid token, or token not in database)**:
    ```json
    {
      "error": "Invalid or missing QR token"
    }
    ```
  * **404 Not Found (Patient deleted or not found)**:
    ```json
    {
      "error": "Patient data not found"
    }
    ```

---

### 5. Doctor Signout
Logs the doctor out and invalidates the session client-side.

* **Endpoint**: `/doctor/signout`
* **Method**: `POST`
* **Headers**:
  * `Authorization: Bearer <token>`
* **Request Body**: None

* **Success Response (200 OK)**:
  ```json
  {
    "message": "Doctor signed out successfully",
    "note": "Please discard the token on the client side"
  }
  ```

* **Error Responses**:
  * **401 Unauthorized (Missing or Invalid Token)**:
    ```json
    {
      "error": "Unauthorized Access"
    }
    ```

---

## ⚠️ General Error Schema

All backend API endpoints follow a unified error reporting convention to allow unified error handling (e.g. alerts, toasts) in the React Native front-end application.

### Generic JSON Format
```json
{
  "error": "Detailed description of what went wrong",
  "action": "Optional helper text detailing how to correct the issue"
}
```

### Common HTTP Status Codes
* **400 Bad Request**: Invalid body format, missing required fields, or validation failures (e.g., malformed phone formats).
* **401 Unauthorized**: Missing `Authorization` header, invalid token, or expired token.
* **403 Forbidden**: Access restricted (e.g., token does not belong to the user, or expired QR share).
* **404 Not Found**: Resource or database entry could not be located.
* **500 Internal Server Error**: Backend processing errors, Supabase connectivity dropouts, etc.
