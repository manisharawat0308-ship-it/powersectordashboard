import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchJson } from '@/lib/queryClient';
import { useAuthStore } from '@/store/authStore';

interface Document {
  id: string;
  title: string;
  description: string;
  segment: string;
  fileType: string;
  fileName: string;
  filePath: string;
  fileSize: string;
  uploadDate: string;
  uploadedBy: string;
  tags: string[];
}

interface CatalogData {
  lastUpdated: string;
  segments: string[];
  documents: Document[];
}

const FILE_ICONS: Record<string, string> = {
  pdf: '📄',
  pptx: '📊',
  xlsx: '📗',
  docx: '📝',
  zip: '📦',
  default: '📎',
};

export function DownloadsLibrary() {
  const { data, isLoading } = useQuery({
    queryKey: ['downloads', 'catalog'],
    queryFn: () => fetchJson<CatalogData>('/data/meta/downloads-catalog.json'),
  });
  const role = useAuthStore((s) => s.role);
  const [searchQuery, setSearchQuery] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('All');
  const [showUpload, setShowUpload] = useState(false);
  const [localDocs, setLocalDocs] = useState<Document[]>([]);

  // Load any admin-added docs from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('admin_uploads');
    if (stored) {
      try { setLocalDocs(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  if (isLoading || !data) {
    return <div className="animate-pulse h-64 bg-gray-200 rounded-xl" />;
  }

  const allDocs = [...data.documents, ...localDocs];
  const segments = ['All', ...data.segments];

  // Filter documents
  const filtered = allDocs.filter((doc) => {
    if (segmentFilter !== 'All' && doc.segment !== segmentFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        doc.title.toLowerCase().includes(q) ||
        doc.description.toLowerCase().includes(q) ||
        doc.tags.some((t) => t.toLowerCase().includes(q)) ||
        doc.segment.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="icici-card p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 rounded-t-xl bg-icici-navy" />
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-icici-navy flex items-center justify-center text-xl">📥</div>
            <div>
              <h2 className="text-base font-black text-gray-800">Downloads & Reports Library</h2>
              <p className="text-[12px] text-gray-400">{allDocs.length} documents · Presentations, reports, checklists · Organized by segment</p>
            </div>
          </div>
          {role === 'admin' && (
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="text-[12px] font-bold text-white bg-icici-maroon px-3 py-2 rounded-lg hover:bg-icici-maroon/90 transition-all"
            >
              {showUpload ? '✕ Close Upload' : '➕ Add Document'}
            </button>
          )}
        </div>
      </div>

      {/* Admin Upload Panel */}
      {showUpload && role === 'admin' && (
        <AdminUploadPanel
          segments={data.segments}
          onAdd={(doc) => {
            const updated = [...localDocs, doc];
            setLocalDocs(updated);
            localStorage.setItem('admin_uploads', JSON.stringify(updated));
            setShowUpload(false);
          }}
        />
      )}

      {/* Search + Filter */}
      <div className="icici-card p-4">
        <div className="flex flex-col tablet:flex-row gap-3">
          <input
            type="text"
            placeholder="Search reports by title, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-icici-navy/30"
          />
          <div className="flex gap-1.5 flex-wrap">
            {segments.map((seg) => (
              <button
                key={seg}
                onClick={() => setSegmentFilter(seg)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                  segmentFilter === seg
                    ? 'bg-icici-navy text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {seg}
              </button>
            ))}
          </div>
        </div>
        <p className="text-[11px] text-gray-400 mt-2">{filtered.length} document{filtered.length !== 1 ? 's' : ''} found</p>
      </div>

      {/* Document Cards */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="icici-card p-8 text-center">
            <p className="text-gray-400 text-sm">No documents match your search.</p>
          </div>
        )}
        {filtered.map((doc) => (
          <div key={doc.id} className="icici-card p-4 hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">{FILE_ICONS[doc.fileType] || FILE_ICONS.default}</span>
              <div className="flex-1 min-w-0">
                <h3 className="text-[13px] font-black text-gray-800">{doc.title}</h3>
                <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{doc.description}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-icici-navy/10 text-icici-navy">{doc.segment}</span>
                  <span className="text-[10px] text-gray-400">{doc.fileType.toUpperCase()} · {doc.fileSize}</span>
                  <span className="text-[10px] text-gray-400">📅 {doc.uploadDate}</span>
                  {doc.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{tag}</span>
                  ))}
                </div>
              </div>
              <a
                href={doc.filePath}
                download={doc.fileName}
                className="flex-shrink-0 px-3 py-2 rounded-lg bg-icici-navy text-white text-[11px] font-bold hover:bg-icici-navy/90 transition-all"
                onClick={(e) => {
                  // For files that may not exist yet, show helpful message
                  if (doc.filePath.startsWith('/downloads/') && !doc.filePath.includes('Presentation')) {
                    e.preventDefault();
                    alert(`File: ${doc.fileName}\n\nTo make this available for download:\n1. Place the file in: public/downloads/${doc.fileName}\n2. Reload the page\n\nThe download link will then work automatically.`);
                  }
                }}
              >
                ⬇ Download
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* How to add files note */}
      <div className="icici-card p-4 border-l-4 border-amber-300">
        <h4 className="text-[12px] font-bold text-amber-800 mb-1">📋 Adding Documents to the Library</h4>
        <div className="text-[11px] text-gray-600 space-y-1">
          <p><strong>Admin:</strong> Click "Add Document" to register new files. Place actual files in <code className="bg-gray-100 px-1 rounded">public/downloads/</code> folder.</p>
          <p><strong>File naming:</strong> Use underscores, no spaces. Example: <code className="bg-gray-100 px-1 rounded">Solar_Hail_Claims_Guide.pdf</code></p>
          <p><strong>Supported formats:</strong> PDF, PPTX, XLSX, DOCX, ZIP</p>
        </div>
      </div>
    </div>
  );
}

// ── Admin Upload Panel ────────────────────────────────────────────────────────

function AdminUploadPanel({ segments, onAdd }: { segments: string[]; onAdd: (doc: Document) => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [segment, setSegment] = useState(segments[0]);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('pdf');
  const [fileSize, setFileSize] = useState('');
  const [tags, setTags] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setFileName(file.name);
    // Auto-detect file type
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (['pdf', 'pptx', 'xlsx', 'docx', 'zip'].includes(ext)) setFileType(ext);
    // Auto-fill file size
    const sizeMB = file.size / (1024 * 1024);
    setFileSize(sizeMB >= 1 ? `${sizeMB.toFixed(1)} MB` : `${(file.size / 1024).toFixed(0)} KB`);
    // Auto-fill title from file name if empty
    if (!title) {
      setTitle(file.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' '));
    }
  };

  const handleSubmit = () => {
    if (!title || !fileName) {
      alert('Title and File Name are required.');
      return;
    }
    // Create a blob URL if file was selected (for download in this session)
    let filePath = `/downloads/${fileName}`;
    if (selectedFile) {
      filePath = URL.createObjectURL(selectedFile);
    }
    const doc: Document = {
      id: `local_${Date.now()}`,
      title,
      description,
      segment,
      fileType,
      fileName,
      filePath,
      fileSize: fileSize || 'Unknown',
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: 'Admin',
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    };
    onAdd(doc);
    // Reset form
    setTitle(''); setDescription(''); setFileName(''); setFileSize(''); setTags('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="icici-card p-5 border-l-4 border-icici-maroon">
      <h3 className="text-sm font-black text-gray-800 mb-3">➕ Add New Document to Library</h3>
      <p className="text-[11px] text-gray-400 mb-4">Browse and attach a file from your system, or enter details manually.</p>

      {/* File Browse / Upload */}
      <div className="mb-4 p-3 rounded-lg bg-gray-50 border-2 border-dashed border-gray-300 hover:border-icici-maroon/40 transition-all">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-lg bg-icici-navy text-white font-bold text-sm hover:bg-icici-navy-dark transition-all flex items-center gap-2"
          >
            📎 Browse & Attach File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.pptx,.xlsx,.docx,.zip,.csv,.png,.jpg,.jpeg"
          />
          {selectedFile ? (
            <div className="flex items-center gap-2 text-sm text-green-700 font-bold">
              <span>✓</span>
              <span>{selectedFile.name}</span>
              <span className="text-gray-400 font-normal">({fileSize})</span>
              <button onClick={() => { setSelectedFile(null); setFileName(''); setFileSize(''); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="text-red-400 hover:text-red-600 text-xs ml-2">✕ Remove</button>
            </div>
          ) : (
            <span className="text-[12px] text-gray-400">No file selected — supports PDF, PPTX, XLSX, DOCX, ZIP</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 tablet:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-bold text-gray-600 block mb-1">Title *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Solar Hail Claims Guide" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-[11px] font-bold text-gray-600 block mb-1">File Name {selectedFile ? '(auto-filled)' : '*'}</label>
          <input type="text" value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="e.g. Solar_Hail_Guide.pdf" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="tablet:col-span-2">
          <label className="text-[11px] font-bold text-gray-600 block mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of the document content..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm h-16 resize-none" />
        </div>
        <div>
          <label className="text-[11px] font-bold text-gray-600 block mb-1">Segment</label>
          <select value={segment} onChange={(e) => setSegment(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
            {segments.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[11px] font-bold text-gray-600 block mb-1">File Type</label>
          <select value={fileType} onChange={(e) => setFileType(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="pdf">PDF</option>
            <option value="pptx">PPTX (PowerPoint)</option>
            <option value="xlsx">XLSX (Excel)</option>
            <option value="docx">DOCX (Word)</option>
            <option value="zip">ZIP</option>
          </select>
        </div>
        <div>
          <label className="text-[11px] font-bold text-gray-600 block mb-1">File Size</label>
          <input type="text" value={fileSize} onChange={(e) => setFileSize(e.target.value)} placeholder="e.g. 4.5 MB" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-[11px] font-bold text-gray-600 block mb-1">Tags (comma-separated)</label>
          <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. solar, hail, claims, Rajasthan" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="mt-4 px-4 py-2 rounded-lg bg-icici-maroon text-white font-bold text-sm hover:bg-icici-maroon/90 transition-all"
      >
        ✓ Add to Library
      </button>
      <p className="text-[10px] text-gray-400 mt-2">Note: Attached files are available for download during this session. To permanently add, update <code>public/data/meta/downloads-catalog.json</code> and place files in <code>public/downloads/</code>.</p>
    </div>
  );
}
