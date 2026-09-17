import { useState } from 'react';

type DownloadStatus = Record<string, 'idle' | 'loading' | 'done'>;

export function DownloadsSection() {
  const [status, setStatus] = useState<DownloadStatus>({});

  const setItemStatus = (key: string, s: 'idle' | 'loading' | 'done') => {
    setStatus((prev) => ({ ...prev, [key]: s }));
    if (s === 'done') setTimeout(() => setStatus((prev) => ({ ...prev, [key]: 'idle' })), 2000);
  };

  const downloads = [
    {
      category: '📋 Power PDF — Complete Dashboard Report',
      items: [
        { id: 'power-pdf', title: 'Power PDF', subtitle: 'All sections: Industry Overview, Generation, Ownership, Timeline, Risk, Market Players', url: '/journals/power-sector-pdf.html', filename: 'India_Power_Sector_Complete_Report', icon: '📋', color: '#B02A30', format: 'pdf' },
      ],
    },
    {
      category: '📖 Journals — ICICI Lombard Branded',
      items: [
        { id: 'icici-pdf', title: 'Download as PDF', subtitle: 'Best quality • Portrait • Print-ready', url: '/journals/journal-power-sector-icici.html', filename: 'India_Power_Sector_Journal_ICICI_Lombard', icon: '📄', color: '#B02A30', format: 'pdf' },
        { id: 'icici-html', title: 'Download as HTML', subtitle: 'Offline viewing • Editable • Lightweight', url: '/journals/journal-power-sector-icici.html', filename: 'India_Power_Sector_Journal_ICICI_Lombard.html', icon: '🌐', color: '#B02A30', format: 'html' },
        { id: 'icici-docx', title: 'Download as DOCX', subtitle: 'MS Word • Basic formatting preserved', url: '/journals/journal-power-sector-icici.html', filename: 'India_Power_Sector_Journal_ICICI_Lombard.docx', icon: '📝', color: '#B02A30', format: 'docx' },
      ],
    },
    {
      category: '📖 Journals — Generic Branded',
      items: [
        { id: 'gen-pdf', title: 'Download as PDF', subtitle: 'Best quality • Portrait • Print-ready', url: '/journals/journal-power-sector-generic.html', filename: 'India_Power_Sector_Journal_Generic', icon: '📄', color: '#1565C0', format: 'pdf' },
        { id: 'gen-html', title: 'Download as HTML', subtitle: 'Offline viewing • Editable • Lightweight', url: '/journals/journal-power-sector-generic.html', filename: 'India_Power_Sector_Journal_Generic.html', icon: '🌐', color: '#1565C0', format: 'html' },
        { id: 'gen-docx', title: 'Download as DOCX', subtitle: 'MS Word • Basic formatting preserved', url: '/journals/journal-power-sector-generic.html', filename: 'India_Power_Sector_Journal_Generic.docx', icon: '📝', color: '#1565C0', format: 'docx' },
      ],
    },
    {
      category: '📊 Presentations (PPTX)',
      items: [
        { id: 'pptx-icici', title: 'Download PPTX — ICICI Lombard', subtitle: '10-slide PowerPoint • Landscape • Maroon/Navy theme', url: '/India_Power_Sector_Presentation.pptx', filename: 'India_Power_Sector_Presentation_ICICI.pptx', icon: '📊', color: '#B02A30', format: 'file' },
        { id: 'pptx-generic', title: 'Download PPTX — Generic (Clean)', subtitle: '10-slide PowerPoint • Landscape • Teal/White theme', url: '/India_Power_Sector_Presentation_Generic.pptx', filename: 'India_Power_Sector_Presentation_Generic.pptx', icon: '📊', color: '#0F766E', format: 'file' },
      ],
    },
  ];

  const handleDownload = async (item: typeof downloads[0]['items'][0]) => {
    setItemStatus(item.id, 'loading');
    try {
      if (item.format === 'pdf') {
        // Open in new window and trigger print (save as PDF)
        const printWindow = window.open(item.url, '_blank');
        if (printWindow) {
          printWindow.onload = () => {
            setTimeout(() => printWindow.print(), 500);
          };
        }
        setItemStatus(item.id, 'done');
      } else if (item.format === 'docx') {
        const response = await fetch(item.url);
        const htmlContent = await response.text();
        const { asBlob } = await import('html-docx-js-typescript');
        const docxBlob = await asBlob(htmlContent, {
          orientation: 'portrait',
          margins: { top: 1440, right: 1080, bottom: 1440, left: 1080 },
        }) as Blob;
        triggerDownload(docxBlob, item.filename);
        setItemStatus(item.id, 'done');
      } else {
        // Direct file download (html, pptx)
        const response = await fetch(item.url);
        const blob = await response.blob();
        triggerDownload(blob, item.filename);
        setItemStatus(item.id, 'done');
      }
    } catch {
      window.open(item.url, '_blank');
      setItemStatus(item.id, 'idle');
    }
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="icici-card p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-icici-maroon to-icici-navy flex items-center justify-center text-xl">📥</div>
          <div>
            <h2 className="text-base font-black text-gray-800">Downloads & Publications</h2>
            <p className="text-[14px] text-gray-400">Multiple formats available • PDF recommended for best quality</p>
          </div>
        </div>
        <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-[14px] text-amber-700">
          <strong>💡 Format Guide:</strong> PDF = best visual quality with images & formatting | HTML = lightweight offline viewing | DOCX = editable in MS Word (basic formatting only)
        </div>
      </div>

      {/* Download Sections */}
      {downloads.map((section) => (
        <div key={section.category} className="icici-card p-5">
          <h3 className="text-xs font-bold text-gray-600 uppercase mb-4">{section.category}</h3>
          <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 gap-3">
            {section.items.map((item) => {
              const itemStatus = status[item.id] || 'idle';
              return (
                <button
                  key={item.id}
                  onClick={() => handleDownload(item)}
                  disabled={itemStatus === 'loading'}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left w-full ${
                    itemStatus === 'loading'
                      ? 'bg-gray-50 border-gray-200 opacity-70 cursor-wait'
                      : itemStatus === 'done'
                      ? 'bg-green-50 border-green-300'
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md group'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                    style={{ backgroundColor: item.color + '12' }}
                  >
                    {itemStatus === 'loading' ? '⏳' : itemStatus === 'done' ? '✅' : item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-gray-800 group-hover:text-icici-maroon transition-colors">
                      {itemStatus === 'loading' ? 'Preparing...' : itemStatus === 'done' ? 'Downloaded!' : item.title}
                    </div>
                    <div className="text-[14px] text-gray-500 mt-0.5">{item.subtitle}</div>
                  </div>
                  {itemStatus === 'idle' && (
                    <span className="text-[14px] font-bold text-icici-maroon flex-shrink-0">⬇️</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Tips */}
      <div className="icici-card p-4">
        <h4 className="text-[14px] font-bold text-gray-600 uppercase mb-2">Tips</h4>
        <div className="text-[14px] text-gray-500 space-y-1">
          <p>• <strong>PDF:</strong> Opens the journal in a new tab with print dialog. Select "Save as PDF" as the destination for the cleanest output with all images and formatting.</p>
          <p>• <strong>HTML:</strong> Downloads the complete page as a single file. Open in any browser offline. Best for archiving.</p>
          <p>• <strong>DOCX:</strong> Converted from HTML — tables and text are preserved but complex layouts and images may not render perfectly. Best for editing content.</p>
          <p>• <strong>PPTX:</strong> Native PowerPoint file. Open in MS PowerPoint or Google Slides.</p>
        </div>
      </div>
    </div>
  );
}


