import { supabase } from '../config/supabase.js';
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import crypto from 'crypto';
import fs from 'fs';

// --- AUTH & CLIENT INITIALIZATION ---
const project = process.env.GCP_PROJECT_ID || process.env.PROJECT_ID;
const location = process.env.LOCATION || 'us-central1';
const modelName = 'gemini-2.5-flash';

let client;
try {
  let rawAuth = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (rawAuth) {
    rawAuth = rawAuth.trim().replace(/^["']|["']$/g, '');

    let credentials;
    if (rawAuth.startsWith('{')) {
      credentials = JSON.parse(rawAuth);
    } else {
      const fileContent = fs.readFileSync(rawAuth, 'utf8');
      credentials = JSON.parse(fileContent);
    }

    client = new GoogleGenAI({
      project,
      location,
      credentials,
      vertexai: true,
      apiVersion: 'v1'
    });
    console.log("✅ Patient AI Worker: Connected via Google Gen AI SDK");
  } else if (process.env.GEMINI_API_KEY) {
    // Local dev fallback using raw API key if vertex auth is not available
    console.warn("⚠️ GOOGLE_APPLICATION_CREDENTIALS not found. Falling back to local GEMINI_API_KEY");
  }
} catch (error) {
  console.error("[Patient Worker] Auth Error:", error.message);
}

// Same prompt from ai.controller.js
const AGGREGATE_SUMMARY_PROMPT = `{
  "task": "Longitudinal Medical Summary Aggregation and Clinical Signal Extraction",

  "role": "You are Medora Clinical Intelligence Engine — a non-diagnostic system that analyzes multiple medical summaries and extracts structured patterns for doctors. You organize data, identify repetition, and highlight important signals without making medical judgments.",

  "objective": [
    "Aggregate multiple medical summaries into a unified patient profile",
    "Identify repeated findings across records",
    "Detect trends over time (increasing, decreasing, stable, inconsistent)",
    "Highlight clinically relevant signals based ONLY on repetition"
  ],

  "strict_rules": [
    "RETURN ONLY VALID JSON",
    "NO MARKDOWN, NO EXTRA TEXT",
    "DO NOT DIAGNOSE OR SUGGEST DISEASES",
    "DO NOT USE WORDS LIKE 'likely', 'suggests disease', 'indicates condition'",
    "DO NOT INFER CAUSALITY",
    "ONLY USE DATA PROVIDED IN INPUT",
    "IF DATA IS INSUFFICIENT → WRITE 'insufficient data'",
    "DO NOT HALLUCINATE OR ADD MEDICAL KNOWLEDGE",
    "KEEP OUTPUT STRUCTURED, SHORT, AND CONSISTENT"
  ],

  "processing_rules": [
    "Sort all input summaries chronologically before analysis",
    "Normalize similar terms into consistent wording",
    "Group related findings across different records",
    "Highlight abnormal or clinically relevant data, even if it only appears once",
    "If multiple records exist, prioritize repeated patterns",
    "Avoid duplication of similar patterns",
    "Treat missing data as 'insufficient data'",
    "Each pattern must be distinct and non-overlapping"
  ],

  "trend_rules": [
    "increasing → values or severity rising over time",
    "decreasing → values or severity reducing",
    "stable → consistent values across records",
    "inconsistent → fluctuating or irregular pattern",
    "single observation → only appears in one record"
  ],

  "bullet_preference_rule": [
    "Use bullet-style short statements wherever possible",
    "Each bullet should represent one clear idea",
    "Do NOT force bullets where a single value is enough",
    "Avoid long sentences"
  ],

  "patient_details_rules": [
    "Extract from input summaries only",
    "If multiple values exist:",
    "  - For same patient → choose most recent",
    "  - For conflicting patients → choose most frequent",
    "If unclear → return null",
    "Do NOT guess"
  ],

  "confidence_rules": [
    "high → repeated 3 or more times with consistent evidence",
    "medium → repeated 2 times",
    "low → appears 1 time or weak repetition"
  ],

  "fallback_rule": "If no significant findings or patterns are found at all, return empty arrays for identified_patterns and clinical_signals, and set overall_health_picture to ['All systems appear stable based on available data.']",

  "output_format": {
    "overall_health_picture": [
      "Short bullet summarizing key repeated observation"
    ],

    "identified_patterns": [
      {
        "pattern": "Short description of repeated finding",
        "trend": "increasing | decreasing | stable | inconsistent",
        "frequency": "number of occurrences",
        "evidence_summary": "Brief explanation of repetition",
        "confidence": "high | medium | low"
      }
    ],

    "clinical_signals": [
      {
        "signal": "Important repeated observation",
        "type": "lab_abnormality | symptom_pattern | medication_pattern | other",
        "occurrences": "number of times observed",
        "note": "Why this stands out based on repetition",
        "confidence": "high | medium | low"
      }
    ],

    "patient_details": {
      "name": "string | null",
      "age": "string | null",
      "gender": "string | null",
      "blood_group": "string | null"
    }
  }
}`;

// Helper: Call Gemini to aggregate list of summaries
async function callGeminiAggregation(summariesArray) {
  if (!client) {
    // If Vertex GenAI client is not initialized, check for local key fallback
    if (process.env.GEMINI_API_KEY) {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: modelName });
      const summariesText = summariesArray
        .map((s, idx) => `Report ${idx + 1}:\n${JSON.stringify(s, null, 2)}`)
        .join('\n---\n');
      const prompt = `${AGGREGATE_SUMMARY_PROMPT}\n\nMedical Summaries to Analyze:\n${summariesText}`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return parseJSON(text);
    }
    throw new Error('AI Client not initialized (credentials missing)');
  }

  const summariesText = summariesArray
    .map((s, idx) => `Report ${idx + 1}:\n${JSON.stringify(s, null, 2)}`)
    .join('\n---\n');

  const prompt = `${AGGREGATE_SUMMARY_PROMPT}\n\nMedical Summaries to Analyze:\n${summariesText}`;

  const result = await client.models.generateContent({
    model: modelName,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { temperature: 0.1 }
  });

  const text = result.candidates[0].content.parts[0].text;
  return parseJSON(text);
}

function parseJSON(text) {
  let cleaned = text.trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw e;
  }
}

// Core helper: Process summary logic for single patient
async function processPatientAI(patientId) {
  console.log(`[patientAIWorker] Starting AI aggregation for patient: ${patientId}`);

  // 1. Fetch records
  const { data: records, error: fetchErr } = await supabase
    .from('records')
    .select('id, ai_summary, source, folder_id, hospital_id, created_at')
    .eq('user_id', patientId)
    .order('created_at', { ascending: true });

  if (fetchErr) throw fetchErr;

  if (!records || records.length === 0) {
    console.log(`[patientAIWorker] Patient ${patientId} has no records. Saving empty summaries.`);
    return {
      overall: null,
      hospital: null,
      personal: null,
      specificHospitals: {},
      specificFolders: {},
      recordStateHash: '',
      recordCount: 0
    };
  }

  // Generate record state hash to identify additions/deletions/changes
  const stateString = records
    .map(r => `${r.id}-${r.created_at || ''}-${r.source}`)
    .join('|');
  const recordStateHash = crypto.createHash('sha256').update(stateString).digest('hex');

  // Filter records that have generated AI summaries
  const recordsWithSummary = records.filter(r => {
    let summary = r.ai_summary;
    if (typeof summary === 'string' && summary.startsWith('{')) {
      try { summary = JSON.parse(summary); } catch (e) {}
    }
    return summary && typeof summary === 'object' && (summary.simple_summary || summary.findings || summary.key_findings || summary.complaints);
  });

  // Helper: Aggregate summary based on files array
  const aggregateGroup = async (groupRecords) => {
    const summaries = groupRecords
      .map(r => {
        let s = r.ai_summary;
        if (typeof s === 'string' && s.startsWith('{')) {
          try { s = JSON.parse(s); } catch (e) {}
        }
        return s;
      })
      .filter(s => s && typeof s === 'object');

    if (summaries.length === 0) return null;
    if (summaries.length === 1) {
      // Bypasses Gemini if only 1 document is shared/uploaded!
      console.log(`[patientAIWorker] Optimization: Bypassed Gemini for group with 1 document`);
      return summaries[0];
    }
    // Multiple summaries -> Generate longitudinal aggregate using Gemini
    return await callGeminiAggregation(summaries);
  };

  // Preset 1: Overall Summary (All records)
  console.log(`[patientAIWorker] Aggregating overall summary...`);
  const overallSummary = await aggregateGroup(recordsWithSummary);

  // Preset 2: Hospital Records (source = 'hospital')
  console.log(`[patientAIWorker] Aggregating hospital summaries...`);
  const hospitalRecords = recordsWithSummary.filter(r => r.source === 'hospital');
  const hospitalSummary = await aggregateGroup(hospitalRecords);

  // Preset 3: Personal Records (source = 'patient')
  console.log(`[patientAIWorker] Aggregating personal summaries...`);
  const personalRecords = recordsWithSummary.filter(r => r.source === 'patient');
  const personalSummary = await aggregateGroup(personalRecords);

  // Preset 4: Specific Hospitals
  console.log(`[patientAIWorker] Aggregating specific hospitals...`);
  const specificHospitalsSummaries = {};
  const hospitalGroups = {};
  recordsWithSummary.forEach(r => {
    if (r.source === 'hospital' && r.hospital_id) {
      if (!hospitalGroups[r.hospital_id]) hospitalGroups[r.hospital_id] = [];
      hospitalGroups[r.hospital_id].push(r);
    }
  });
  for (const hId of Object.keys(hospitalGroups)) {
    specificHospitalsSummaries[hId] = await aggregateGroup(hospitalGroups[hId]);
  }

  // Preset 5: Specific Folders
  console.log(`[patientAIWorker] Aggregating specific folders...`);
  const specificFoldersSummaries = {};
  const folderGroups = {};
  recordsWithSummary.forEach(r => {
    if (r.source === 'patient' && r.folder_id) {
      if (!folderGroups[r.folder_id]) folderGroups[r.folder_id] = [];
      folderGroups[r.folder_id].push(r);
    }
  });
  for (const fId of Object.keys(folderGroups)) {
    specificFoldersSummaries[fId] = await aggregateGroup(folderGroups[fId]);
  }

  return {
    overall: overallSummary,
    hospital: hospitalSummary,
    personal: personalSummary,
    specificHospitals: specificHospitalsSummaries,
    specificFolders: specificFoldersSummaries,
    recordStateHash,
    recordCount: records.length
  };
}

// Scheduler: Scans dirty patients and queues them
export const runScheduler = async () => {
  console.log('[patientAIWorker] Scheduler started: Scanning for dirty patient summaries...');
  try {
    // 1. Fetch patients explicitly marked 'dirty'
    const { data: dirtySummaries, error: scanErr } = await supabase
      .from('patient_ai_summaries')
      .select('patient_id')
      .eq('summary_status', 'dirty');

    if (scanErr) throw scanErr;

    // 2. Scan for patients who have records but do not exist in patient_ai_summaries table yet
    const { data: unindexedPatients, error: unindexedErr } = await supabase
      .from('records')
      .select('user_id')
      .not('user_id', 'is', null);

    if (unindexedErr) throw unindexedErr;

    const allPatientIds = new Set([
      ...(dirtySummaries || []).map(s => s.patient_id),
    ]);

    // Find patients with records who are not in the patient_ai_summaries table
    if (unindexedPatients && unindexedPatients.length > 0) {
      const patientIdsWithRecords = [...new Set(unindexedPatients.map(r => r.user_id))];
      
      for (const pId of patientIdsWithRecords) {
        // Query to check if exists in summaries
        const { data: exists } = await supabase
          .from('patient_ai_summaries')
          .select('patient_id')
          .eq('patient_id', pId)
          .maybeSingle();
        
        if (!exists) {
          allPatientIds.add(pId);
        }
      }
    }

    const patientIdsToQueue = Array.from(allPatientIds);
    console.log(`[patientAIWorker] Scheduler identified ${patientIdsToQueue.length} patient(s) requiring refresh.`);

    for (const patientId of patientIdsToQueue) {
      // Verify if already queued
      const { data: existingQueue } = await supabase
        .from('patient_ai_queue')
        .select('id')
        .eq('patient_id', patientId)
        .eq('status', 'pending')
        .maybeSingle();

      if (!existingQueue) {
        // Insert pending job into patient queue
        const { error: queueErr } = await supabase
          .from('patient_ai_queue')
          .insert({
            patient_id: patientId,
            status: 'pending'
          });

        if (queueErr) {
          console.error(`[patientAIWorker] Failed to queue patient ${patientId}:`, queueErr.message);
          continue;
        }

        // Lock status to queued
        await supabase
          .from('patient_ai_summaries')
          .upsert({
            patient_id: patientId,
            summary_status: 'queued',
            updated_at: new Date().toISOString()
          }, { onConflict: 'patient_id' });

        console.log(`[patientAIWorker] Queued patient: ${patientId}`);
      }
    }

    console.log('[patientAIWorker] Scheduler execution complete.');
  } catch (error) {
    console.error('[patientAIWorker] Scheduler error:', error.message);
  }
};

let isProcessingQueue = false;

// Queue Processor: processes queue jobs in small batches
export const processQueue = async () => {
  if (isProcessingQueue) return;
  isProcessingQueue = true;

  try {
    // 1. Fetch oldest pending queue jobs (Batch size: 3)
    const { data: jobs, error: fetchErr } = await supabase
      .from('patient_ai_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(3);

    if (fetchErr) throw fetchErr;

    if (!jobs || jobs.length === 0) {
      isProcessingQueue = false;
      return; // No pending jobs
    }

    console.log(`[patientAIWorker] Processing queue batch: ${jobs.length} patient(s)...`);

    for (const job of jobs) {
      const patientId = job.patient_id;

      // 2. Lock the job to 'processing'
      const { error: lockErr } = await supabase
        .from('patient_ai_queue')
        .update({ status: 'processing', updated_at: new Date().toISOString() })
        .eq('id', job.id);

      if (lockErr) {
        console.error(`[patientAIWorker] Failed to lock queue job ${job.id}:`, lockErr.message);
        continue;
      }

      // Also lock status in summaries
      await supabase
        .from('patient_ai_summaries')
        .upsert({
          patient_id: patientId,
          summary_status: 'processing',
          updated_at: new Date().toISOString()
        }, { onConflict: 'patient_id' });

      try {
        // 3. Process Patient AI Aggregations
        const results = await processPatientAI(patientId);

        // 4. Save results and release status
        const { error: saveErr } = await supabase
          .from('patient_ai_summaries')
          .upsert({
            patient_id: patientId,
            last_processed_at: new Date().toISOString(),
            last_file_hash: results.recordStateHash,
            last_file_count: results.recordCount,
            summary_status: 'ready',
            overall_summary: results.overall,
            hospital_summary: results.hospital,
            personal_summary: results.personal,
            specific_hospitals_summaries: results.specificHospitals,
            specific_folders_summaries: results.specificFolders,
            failure_count: 0,
            last_error: null,
            updated_at: new Date().toISOString()
          }, { onConflict: 'patient_id' });

        if (saveErr) throw saveErr;

        // Mark queue job as completed
        await supabase
          .from('patient_ai_queue')
          .update({ status: 'completed', updated_at: new Date().toISOString() })
          .eq('id', job.id);

        console.log(`[patientAIWorker] Successfully completed queue job for patient: ${patientId}`);

      } catch (err) {
        console.error(`[patientAIWorker] Failed to process patient ${patientId}:`, err.message);

        // Fail job in queue
        await supabase
          .from('patient_ai_queue')
          .update({ 
            status: 'failed', 
            error: err.message, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', job.id);

        // Rollback patient summary status to 'dirty' but PRESERVE existing summaries (no null overwrite!)
        const { data: existing } = await supabase
          .from('patient_ai_summaries')
          .select('failure_count')
          .eq('patient_id', patientId)
          .maybeSingle();

        const currentFailures = (existing?.failure_count || 0) + 1;

        await supabase
          .from('patient_ai_summaries')
          .upsert({
            patient_id: patientId,
            summary_status: 'dirty',
            failure_count: currentFailures,
            last_error: err.message,
            updated_at: new Date().toISOString()
          }, { onConflict: 'patient_id' });
      }
    }
  } catch (error) {
    console.error('[patientAIWorker] Queue processing unhandled error:', error.message);
  } finally {
    isProcessingQueue = false;
  }
};

// Starts polling intervals
export const startPatientAIWorker = () => {
  if (process.env.VERCEL) {
    console.log('[patientAIWorker] Vercel environment detected. Continuous polling intervals disabled.');
    return;
  }

  console.log('[patientAIWorker] Starting background patient AI worker polling loops...');
  
  // Run scheduler once immediately
  runScheduler().then(() => {
    // Process queue immediately after scheduling
    processQueue();
  });

  // Setup Queue Processor loop: every 10 seconds
  setInterval(processQueue, 10000);

  // Setup Scheduler loop: every 8 hours
  setInterval(runScheduler, 8 * 60 * 60 * 1000);
};
