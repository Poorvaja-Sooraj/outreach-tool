// frontend/src/components/UploadForm.jsx
import { useState } from 'react';
import api from '../api/client';
import * as XLSX from 'xlsx';

export default function UploadForm({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState('');
  const [progress, setProgress] = useState(0);
  const [previewRows, setPreviewRows] = useState([]);
  const [uploading, setUploading] = useState(false);

  // parse file for preview (first 5 rows)
  const onFileChange = (e) => {
    const f = e.target.files[0];
    setMsg('');
    setPreviewRows([]);
    setFile(f);

    if (!f) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target.result;
        const wb = XLSX.read(data, { type: 'array' });
        const sheetName = wb.SheetNames[0];
        if (!sheetName) {
          setMsg('No sheets found in file.');
          return;
        }
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: '' });
        setPreviewRows(rows.slice(0, 5));
      } catch (err) {
        // fallback: try reading as text (some CSVs)
        try {
          const txtReader = new FileReader();
          txtReader.onload = (t) => {
            try {
              const text = t.target.result;
              const wb2 = XLSX.read(text, { type: 'string' });
              const sheetName2 = wb2.SheetNames[0];
              const rows2 = XLSX.utils.sheet_to_json(wb2.Sheets[sheetName2], { defval: '' });
              setPreviewRows(rows2.slice(0, 5));
            } catch (e) {
              setMsg('Could not parse file for preview.');
            }
          };
          txtReader.readAsText(f);
        } catch (e) {
          setMsg('Could not parse file for preview.');
        }
      }
    };
    reader.readAsArrayBuffer(f);
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');

    if (!file) return setMsg('Select a file first');
    if (uploading) return; // prevent double submit

    const fd = new FormData();
    fd.append('file', file);

    try {
      setUploading(true);
      setProgress(0);

      const res = await api.post('/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percent);
          }
        },
      });

      setMsg('Uploaded: ' + JSON.stringify(res.data.counts));
      setProgress(0);
      setFile(null);
      setPreviewRows([]);
      if (onUploaded) onUploaded();
    } catch (err) {
      setMsg(err?.response?.data?.error || 'Upload failed');
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8, marginTop: 12 }}
    >
      <h3>Upload Customer List (CSV/XLS/XLSX)</h3>

      <input
        type="file"
        accept=".csv,.xls,.xlsx"
        onChange={onFileChange}
        disabled={uploading}
      />

      <div style={{ marginTop: 8 }}>
        <button type="submit" style={{ padding: 8 }} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>

      {/* Preview table (first 5 rows) */}
      {previewRows.length > 0 && (
        <div style={{ marginTop: 10, overflowX: 'auto' }}>
          <strong>Preview (first {previewRows.length} rows)</strong>
          <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: 6 }}>
            <thead>
              <tr>
                {Object.keys(previewRows[0]).map((k) => (
                  <th
                    key={k}
                    style={{
                      border: '1px solid #ddd',
                      padding: 6,
                      textAlign: 'left',
                      background: '#f7f7f7',
                    }}
                  >
                    {k}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((r, i) => (
                <tr key={i}>
                  {Object.values(r).map((v, j) => (
                    <td key={j} style={{ border: '1px solid #eee', padding: 6 }}>
                      {String(v)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Progress bar */}
      {progress > 0 && (
        <div style={{ width: '100%', background: '#eee', marginTop: 8 }}>
          <div style={{ width: `${progress}%`, height: 8, background: '#4caf50' }} />
        </div>
      )}

      {/* Status message */}
      {msg && <p style={{ marginTop: 8 }}>{msg}</p>}
    </form>
  );
}
