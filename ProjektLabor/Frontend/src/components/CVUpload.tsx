import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import toast from 'react-hot-toast'



type CVUploadProps = {
  resumePath?: string
  onUpload?: () => void
  label?: string
  className?: string
}

type CVMeta = {
  filename: string
  uploadedAt?: string
  size?: number
}

export default function CVUpload({ resumePath, onUpload, label = 'Önéletrajz feltöltése', className = '' }: CVUploadProps) {

  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cvMeta, setCvMeta] = useState<CVMeta | null>(null)

  // Lekérjük a metaadatokat, ha van feltöltött CV
  useEffect(() => {
    if (resumePath) {
      api.get<CVMeta>(`/api/upload/meta/${resumePath}`)
        .then(res => setCvMeta(res.data))
        .catch(() => setCvMeta(null))
    } else {
      setCvMeta(null)
    }
  }, [resumePath])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0]
      if (f.type !== 'application/pdf') {
        setError('Csak PDF fájl tölthető fel!')
        return
      }
      if (f.size > 5 * 1024 * 1024) {
        setError('Maximális méret: 5MB')
        return
      }
      setFile(f)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      await api.post('/api/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Önéletrajz feltöltve!')
      setFile(null)
      onUpload?.()
    } catch (err: any) {
      setError(err?.response?.data || 'Hiba történt a feltöltéskor')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={`rounded-lg border border-gray-200 bg-white shadow-sm p-4 ${className}`}>
      <div className="mb-3">
        <div className="flex items-start gap-2 text-sm font-medium text-yellow-800 bg-yellow-50 border border-yellow-200 rounded px-3 py-2 leading-tight">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-yellow-600 min-w-[18px] mt-0.5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
          <span>Egy felhasználóhoz csak <b>egy</b> önéletrajz tölthető fel. Új feltöltés esetén a régi automatikusan törlődik.</span>
        </div>
      </div>
      <div className="mb-2 text-base font-semibold text-gray-800 flex items-center gap-2">
        {/* Dokumentum ikon */}
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-blue-600"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.828a2 2 0 0 0-.586-1.414l-4.828-4.828A2 2 0 0 0 13.172 2H7zm5 1.414L18.586 8H15a1 1 0 0 1-1-1V3.414z" /></svg>
        {label}
      </div>
      {resumePath && cvMeta ? (
        <div className="flex flex-col gap-2 bg-green-50 border border-green-200 rounded p-3">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-green-600"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            <span className="text-green-700 text-sm font-medium">Feltöltve</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-xs text-gray-700">
            {cvMeta.size && <span><b>Méret:</b> {(cvMeta.size / 1024).toFixed(1)} KB</span>}
            {cvMeta.uploadedAt && <span><b>Feltöltve:</b> {new Date(cvMeta.uploadedAt).toLocaleDateString('hu-HU', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>}
          </div>
          <div className="flex gap-3 mt-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onClick={async () => {
                if (!resumePath) return;
                try {
                  const res = await api.get(`/api/upload/${resumePath}`, { responseType: 'blob' });
                  const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'cv.pdf';
                  document.body.appendChild(a);
                  a.click();
                  setTimeout(() => {
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                  }, 100);
                } catch (e) {
                  toast.error('Nem sikerült letölteni a fájlt');
                }
              }}
            >
              <span className="flex items-center justify-center">
                {/* letöltés ikon */}
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 10l5 5 5-5M12 4v12" /></svg>
              </span>
              Letöltés
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-800 border border-gray-300 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onClick={async () => {
                if (!resumePath) return;
                try {
                  const res = await api.get(`/api/upload/${resumePath}`, { responseType: 'blob' });
                  const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                  window.open(url, '_blank');
                  setTimeout(() => window.URL.revokeObjectURL(url), 10000);
                } catch (e) {
                  toast.error('Nem sikerült megnyitni a fájlt');
                }
              }}
            >
              <span className="flex items-center justify-center">
                {/* Szem ikon */}
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1.5 12s3.5-7 10.5-7 10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" /></svg>
              </span>
              Megtekintés
            </button>
          </div>
          <div className="mt-2 flex flex-col gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 border border-blue-200 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onClick={() => {
                document.getElementById('cv-reupload-input')?.click();
              }}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Másik önéletrajz feltöltése
            </button>
            <input
              id="cv-reupload-input"
              type="file"
              accept="application/pdf"
              style={{ display: 'none' }}
              onChange={handleFileChange}
              disabled={uploading}
            />
            {error && <span className="text-xs text-red-600 block mt-1">{error}</span>}
            {file && (
              <form onSubmit={handleUpload} className="flex gap-2 mt-2">
                <span className="text-xs text-gray-700">{file.name}</span>
                <button
                  type="submit"
                  disabled={uploading}
                  className="inline-flex items-center gap-1 rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white shadow hover:bg-blue-700 disabled:opacity-50"
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  {uploading ? 'Feltöltés...' : 'Feltöltés'}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleUpload} className="flex flex-col gap-2">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            disabled={uploading}
            className="file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 file:font-semibold border border-gray-300 rounded w-full text-sm"
          />
          {error && <span className="text-xs text-red-600">{error}</span>}
          <button
            type="submit"
            disabled={!file || uploading}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? 'Feltöltés...' : 'Feltöltés'}
          </button>
        </form>
      )}
      <div className="text-xs text-gray-500 mt-2">Csak PDF, max. 5MB. A feltöltött önéletrajzot bármikor lecserélheted.</div>
    </div>
  )
}