import React from 'react';
import { Shield } from 'lucide-react';

interface LegalPageProps {
  type: 'privacy' | 'terms' | 'security';
  onNavigate: (path: string) => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({ type, onNavigate }) => {
  const titles = {
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    security: 'Security Architecture'
  };

  const tabs: { key: typeof type; label: string; path: string }[] = [
    { key: 'privacy', label: 'Privacy Policy', path: '/privacy' },
    { key: 'terms', label: 'Terms of Service', path: '/terms' },
    { key: 'security', label: 'Security', path: '/security' }
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <header className="border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-800/60 px-3 py-1 text-xs font-semibold text-indigo-400 mb-3">
          <Shield className="h-3.5 w-3.5" />
          <span>Legal & Trust Center</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          {titles[type]}
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          Last Updated: February 2026 &bull; Production Architecture Verification
        </p>

        <nav className="mt-5 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onNavigate(tab.path)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                tab.key === type
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {type === 'privacy' && (
        <div className="space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white">1. Real Privacy Guarantee</h2>
            <p>
              DocuForge is built with privacy-first client execution. When you use tools such as Merge PDF, Split PDF, Compress PDF, Rotate PDF, Delete Pages, Image Converter, and Word Counter, your documents are processed directly within your browser’s local memory sandbox.
            </p>
            <p>
              Your confidential legal agreements, invoices, medical records, and bank statements are <strong>never uploaded to or stored on remote file servers</strong>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white">2. Automatic Session Cleanup</h2>
            <p>
              All intermediate binary blobs, rendered thumbnail canvases, and extracted text buffers are stored in transient browser memory (Blob URLs). When you download your file, refresh your browser, or close the browser tab, the operating system releases all occupied memory automatically.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white">3. No Server-Side Telemetry</h2>
            <p>
              DocuForge has no backend server, so there is nothing to send usage data to. The "System & Usage Analytics"
              dashboard you may see in this app reads a small processing log stored only in your own browser's local
              storage on your device — it is never transmitted anywhere, never aggregated across visitors, and is
              cleared if you clear your browser data.
            </p>
          </section>
        </div>
      )}

      {type === 'security' && (
        <div className="space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white">1. Threat Model & Sandboxing</h2>
            <p>
              Processing documents online carries intrinsic risks if executed carelessly. DocuForge enforces a multi-tier defense:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li><strong>Zero Execution Environment:</strong> Uploaded files cannot trigger arbitrary scripts or executable commands. Extensions like <code>.exe</code>, <code>.bat</code>, <code>.sh</code>, <code>.php</code>, and <code>.vbs</code> are strictly denied before processing.</li>
              <li><strong>MIME Header & Magic-Byte Validation:</strong> Beyond the file extension, the actual header bytes of uploaded PDFs, images, and Office files are checked against their real file signatures to catch disguised or mismatched files before processing.</li>
              <li><strong>Sandboxed Execution:</strong> Processing runs inside the browser's own script sandbox with standard origin security — WebAssembly is used specifically for the OCR engine, with HTML5 Canvas used for page rendering and image tools.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white">2. SSL / HTTPS Transport</h2>
            <p>
              All assets and code bundles are delivered over HTTPS. The exact TLS version and HSTS configuration are enforced at the hosting/CDN layer rather than by this application itself, consistent with standard practice for static web apps.
            </p>
          </section>
        </div>
      )}

      {type === 'terms' && (
        <div className="space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white">1. Permitted Use</h2>
            <p>
              DocuForge is provided for personal, academic, and business document management. You retain full ownership and intellectual property rights to all files you process through the service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white">2. Prohibited Uses</h2>
            <p>
              You agree not to use DocuForge to process malicious software, botnet payloads, or content that infringes upon the intellectual property or legal rights of third parties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white">3. Disclaimer of Warranty</h2>
            <p>
              While our processing algorithms undergo rigorous verification against PDF specifications, DocuForge is provided "as is". We always recommend keeping an original copy of critical legal or financial paperwork.
            </p>
          </section>
        </div>
      )}
    </div>
  );
};
