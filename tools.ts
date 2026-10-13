import { ToolDefinition } from '../types';

export const TOOLS_CONFIG: ToolDefinition[] = [
  // --- PDF TOOLS ---
  {
    id: 'merge-pdf',
    slug: 'merge-pdf',
    name: 'Merge PDF',
    category: 'pdf',
    popular: true,
    iconName: 'Layers',
    shortDescription: 'Combine multiple PDF files into a single, unified document in seconds.',
    detailedDescription: 'Merge two or more PDF files easily. Rearrange individual documents by dragging, remove unwanted files, and create a single polished PDF file instantly with zero data loss.',
    acceptedFileTypes: ['.pdf'],
    acceptedMimeTypes: ['application/pdf'],
    maxFiles: 20,
    maxFileSizeMB: 50,
    seoTitle: 'Merge PDF Online Free - Combine PDF Files | DocuForge',
    seoDescription: 'Combine PDF files in any order you want with our free online PDF merger. Fast, secure, and private in-browser document processing.',
    metaH1: 'Merge PDF Files Online',
    features: [
      { title: 'Drag & Drop Ordering', description: 'Reorder files effortlessly before merging to ensure pages appear in your exact sequence.' },
      { title: 'Zero Quality Loss', description: 'Combines native PDF vector data, fonts, forms, and imagery without degradation.' },
      { title: '100% Private & In-Browser', description: 'Processing happens securely on your device. Your sensitive records are never uploaded to unknown servers.' }
    ],
    steps: [
      { step: 1, title: 'Upload PDF Files', description: 'Select or drop 2 or more PDF documents you wish to combine.' },
      { step: 2, title: 'Reorder Documents', description: 'Drag items into your preferred sequence or remove any unneeded files.' },
      { step: 3, title: 'Merge & Download', description: 'Click "Merge PDF" and instantly download your assembled single document.' }
    ],
    faqs: [
      { question: 'Will merging reduce the quality of my PDF files?', answer: 'No. DocuForge preserves original vectors, fonts, and images at full fidelity during the merge process.' },
      { question: 'Is there a limit on how many PDFs I can merge?', answer: 'You can merge up to 20 PDF documents at once in the free tier.' },
      { question: 'Are my confidential documents stored on your server?', answer: 'No. File processing is handled client-side in your browser memory, keeping your documents completely private.' }
    ],
    relatedToolSlugs: ['split-pdf', 'compress-pdf', 'rotate-pdf', 'reorder-pdf-pages']
  },
  {
    id: 'split-pdf',
    slug: 'split-pdf',
    name: 'Split PDF',
    category: 'pdf',
    popular: true,
    iconName: 'Scissors',
    shortDescription: 'Extract selected page ranges or separate individual pages into separate files.',
    detailedDescription: 'Split a large PDF file into separate single-page documents or custom page ranges (e.g. 1-3, 5, 8-10). Download individual sections or a consolidated zip archive.',
    acceptedFileTypes: ['.pdf'],
    acceptedMimeTypes: ['application/pdf'],
    maxFiles: 1,
    maxFileSizeMB: 100,
    seoTitle: 'Split PDF Online - Separate PDF Pages Free | DocuForge',
    seoDescription: 'Split specific page ranges or extract individual pages from any PDF document. Fast, safe, and accurate.',
    metaH1: 'Split PDF Document Into Separate Pages',
    features: [
      { title: 'Flexible Page Ranges', description: 'Specify custom comma-separated page ranges such as "1-4, 7, 9-12".' },
      { title: 'Extract Every Page', description: 'Split an entire document into individual single-page PDFs in one click.' },
      { title: 'Zip Bundle Download', description: 'Easily download all split documents wrapped neatly in a single zip archive.' }
    ],
    steps: [
      { step: 1, title: 'Select Your PDF', description: 'Upload the PDF document you want to split.' },
      { step: 2, title: 'Define Page Ranges', description: 'Choose between extracting individual pages or custom ranges.' },
      { step: 3, title: 'Generate & Save', description: 'Process the document and download your targeted PDF files.' }
    ],
    faqs: [
      { question: 'Can I extract non-consecutive pages?', answer: 'Yes! You can specify ranges like "1-3, 5, 8" to package disparate sections.' },
      { question: 'Does splitting affect bookmarks and links?', answer: 'Standard links and internal references are retained within the extracted pages.' }
    ],
    relatedToolSlugs: ['extract-pdf-pages', 'delete-pdf-pages', 'merge-pdf', 'compress-pdf']
  },
  {
    id: 'compress-pdf',
    slug: 'compress-pdf',
    name: 'Compress PDF',
    category: 'pdf',
    popular: true,
    iconName: 'Minimize2',
    shortDescription: 'Reduce PDF file size while maintaining crystal-clear document quality.',
    detailedDescription: 'Optimize PDF file size for email attachments, web uploads, and storage. Select from Recommended, Extreme, or Low compression levels with transparent file size metrics.',
    acceptedFileTypes: ['.pdf'],
    acceptedMimeTypes: ['application/pdf'],
    maxFiles: 1,
    maxFileSizeMB: 100,
    seoTitle: 'Compress PDF Online - Reduce PDF File Size Free | DocuForge',
    seoDescription: 'Shrink PDF file size quickly without losing clarity. View before and after file sizes with exact percentage savings.',
    metaH1: 'Compress PDF Files Online',
    features: [
      { title: 'Adaptive Compression', description: 'Choose between High Compression, Recommended, or Low Compression depending on your target size.' },
      { title: 'Live Size Reduction Audit', description: 'Transparently inspect original file size, compressed size, and percentage reduction achieved.' },
      { title: 'Stream & Metadata Optimization', description: 'Strips duplicate font descriptors and compresses binary streams safely.' }
    ],
    steps: [
      { step: 1, title: 'Upload PDF', description: 'Select the PDF document you want to optimize.' },
      { step: 2, title: 'Choose Compression Mode', description: 'Pick Recommended for optimal balance or High for maximum byte savings.' },
      { step: 3, title: 'Compress & Save', description: 'Download your lightweight PDF with detailed metrics.' }
    ],
    faqs: [
      { question: 'Will my text become blurry after compression?', answer: 'No! Vector typography remains razor sharp. Only redundant streams and high-resolution bitmap assets are optimized.' },
      { question: 'How much file size reduction can I expect?', answer: 'Depending on the source document, files typically shrink between 25% and 75%.' }
    ],
    relatedToolSlugs: ['merge-pdf', 'pdf-to-jpg', 'split-pdf', 'pdf-page-counter']
  },
  {
    id: 'rotate-pdf',
    slug: 'rotate-pdf',
    name: 'Rotate PDF',
    category: 'pdf',
    popular: false,
    iconName: 'RotateCw',
    shortDescription: 'Rotate individual pages or the entire PDF document 90, 180, or 270 degrees.',
    detailedDescription: 'Correct upside-down or sideways pages. Preview every page visually, rotate single pages individually, or rotate all pages uniformly with a single click.',
    acceptedFileTypes: ['.pdf'],
    acceptedMimeTypes: ['application/pdf'],
    maxFiles: 1,
    maxFileSizeMB: 50,
    seoTitle: 'Rotate PDF Online - Permanently Fix Page Orientation | DocuForge',
    seoDescription: 'Rotate PDF pages permanently. Turn specific pages or all pages 90 or 180 degrees with instant visual preview.',
    metaH1: 'Rotate PDF Pages Online',
    features: [
      { title: 'Visual Page Previews', description: 'See thumbnails of all pages so you only rotate the ones facing the wrong way.' },
      { title: 'Selective or Bulk Rotation', description: 'Rotate a single stubborn page or orient the entire document with one click.' },
      { title: 'Permanent Orientation Fix', description: 'Saved rotation angles adhere to the PDF specification across all PDF readers.' }
    ],
    steps: [
      { step: 1, title: 'Upload Document', description: 'Add the PDF you want to re-orient.' },
      { step: 2, title: 'Rotate Pages', description: 'Click page rotation icons or use "Rotate All Clockwise".' },
      { step: 3, title: 'Save Document', description: 'Download the corrected PDF file.' }
    ],
    faqs: [
      { question: 'Will this rotation stick when I email or print the PDF?', answer: 'Yes! The rotation metadata is written directly into the PDF page dictionary.' }
    ],
    relatedToolSlugs: ['reorder-pdf-pages', 'delete-pdf-pages', 'split-pdf']
  },
  {
    id: 'delete-pdf-pages',
    slug: 'delete-pdf-pages',
    name: 'Delete PDF Pages',
    category: 'pdf',
    popular: false,
    iconName: 'Trash2',
    shortDescription: 'Remove unwanted, blank, or duplicate pages from your PDF file.',
    detailedDescription: 'View interactive page thumbnails, select any pages you wish to purge, and generate a trimmed PDF with the remaining pages intact.',
    acceptedFileTypes: ['.pdf'],
    acceptedMimeTypes: ['application/pdf'],
    maxFiles: 1,
    maxFileSizeMB: 50,
    seoTitle: 'Delete PDF Pages Online - Remove Pages from PDF | DocuForge',
    seoDescription: 'Select and remove unwanted pages from any PDF document. Free, easy, and secure.',
    metaH1: 'Delete Unwanted Pages From PDF',
    features: [
      { title: 'Click-to-Select Interface', description: 'Simply click thumbnails or enter page numbers to mark pages for removal.' },
      { title: 'Multi-Page Selection', description: 'Purge multiple non-adjacent pages simultaneously.' },
      { title: 'Page Count Verification', description: 'Review your initial vs final page count before downloading.' }
    ],
    steps: [
      { step: 1, title: 'Upload PDF', description: 'Upload your document to generate page previews.' },
      { step: 2, title: 'Mark Pages to Delete', description: 'Click pages to flag them for deletion.' },
      { step: 3, title: 'Download Clean PDF', description: 'Export your streamlined document.' }
    ],
    faqs: [
      { question: 'Can I delete all pages?', answer: 'A valid PDF requires at least one remaining page.' }
    ],
    relatedToolSlugs: ['extract-pdf-pages', 'rotate-pdf', 'reorder-pdf-pages']
  },
  {
    id: 'extract-pdf-pages',
    slug: 'extract-pdf-pages',
    name: 'Extract PDF Pages',
    category: 'pdf',
    popular: false,
    iconName: 'FileCheck',
    shortDescription: 'Extract specific pages from your PDF and create a brand new document.',
    detailedDescription: 'Select only the pages you need from a lengthy report or book and export them directly as a new standalone PDF file.',
    acceptedFileTypes: ['.pdf'],
    acceptedMimeTypes: ['application/pdf'],
    maxFiles: 1,
    maxFileSizeMB: 50,
    seoTitle: 'Extract PDF Pages Online - Free Page Extractor | DocuForge',
    seoDescription: 'Extract one or multiple pages from a PDF into a new PDF document without quality degradation.',
    metaH1: 'Extract Selected Pages From PDF',
    features: [
      { title: 'Interactive Thumbnail Picker', description: 'Pick pages visually or enter numbers (e.g., 2, 5, 11-14).' },
      { title: 'New Consolidated File', description: 'Bundles extracted pages into a single new PDF document.' }
    ],
    steps: [
      { step: 1, title: 'Upload PDF', description: 'Open your multi-page document.' },
      { step: 2, title: 'Select Desired Pages', description: 'Click the pages you wish to keep.' },
      { step: 3, title: 'Extract & Download', description: 'Get your newly assembled document.' }
    ],
    faqs: [
      { question: 'How is this different from splitting?', answer: 'Extract creates one new PDF with only your hand-picked pages, while Split divides the document into multiple parts.' }
    ],
    relatedToolSlugs: ['delete-pdf-pages', 'split-pdf', 'merge-pdf']
  },
  {
    id: 'reorder-pdf-pages',
    slug: 'reorder-pdf-pages',
    name: 'Reorder PDF Pages',
    category: 'pdf',
    popular: false,
    iconName: 'ArrowUpDown',
    shortDescription: 'Rearrange and organize the page order of your PDF document.',
    detailedDescription: 'Drag and drop page thumbnails to reorganize your document into the correct chronological order, then export the re-sequenced PDF.',
    acceptedFileTypes: ['.pdf'],
    acceptedMimeTypes: ['application/pdf'],
    maxFiles: 1,
    maxFileSizeMB: 50,
    seoTitle: 'Reorder PDF Pages Online - Rearrange PDF Order | DocuForge',
    seoDescription: 'Organize and reorder pages in your PDF file with an intuitive drag-and-drop editor.',
    metaH1: 'Reorder Pages in PDF Document',
    features: [
      { title: 'Visual Reordering', description: 'Drag pages left or right or use arrow buttons to adjust positions.' },
      { title: 'Instant Preview', description: 'Thumbnails update in real-time to reflect the new sequence.' }
    ],
    steps: [
      { step: 1, title: 'Upload Document', description: 'Load your PDF to view all pages.' },
      { step: 2, title: 'Drag to Rearrange', description: 'Move pages into your intended order.' },
      { step: 3, title: 'Export PDF', description: 'Save your reorganized document.' }
    ],
    faqs: [
      { question: 'Will this change the contents of my pages?', answer: 'No. Page contents are untouched; only their display order is updated.' }
    ],
    relatedToolSlugs: ['rotate-pdf', 'delete-pdf-pages', 'merge-pdf']
  },

  // --- ADVANCED PDF TOOLS ---
  {
    id: 'page-number-pdf',
    slug: 'page-number-pdf',
    name: 'Add Page Numbers',
    category: 'pdf',
    popular: false,
    iconName: 'Hash',
    shortDescription: 'Insert customizable page numbers into your PDF document.',
    detailedDescription: 'Number all pages of your PDF document automatically. Customize numbering format (e.g., "Page 1 of 10" or "1 / 10"), position, font size, and margins.',
    acceptedFileTypes: ['.pdf'],
    acceptedMimeTypes: ['application/pdf'],
    maxFiles: 1,
    maxFileSizeMB: 50,
    seoTitle: 'Add Page Numbers to PDF Online Free | DocuForge',
    seoDescription: 'Number PDF pages online with customizable position, starting number, and format.',
    metaH1: 'Add Page Numbers to PDF Document',
    features: [
      { title: 'Flexible Numbering Formats', description: 'Choose between "Page X of Y", "X / Y", or simple number "X".' },
      { title: 'Five Placement Options', description: 'Position numbers at Bottom-Center, Bottom-Right, Bottom-Left, Top-Right, or Top-Center.' },
      { title: 'Custom Starting Page', description: 'Start numbering from any page number you desire.' }
    ],
    steps: [
      { step: 1, title: 'Upload PDF', description: 'Drop your PDF document into the upload zone.' },
      { step: 2, title: 'Choose Placement & Style', description: 'Select your preferred position and format.' },
      { step: 3, title: 'Apply & Download', description: 'Generate and download your numbered PDF file.' }
    ],
    faqs: [
      { question: 'Will adding numbers overwrite existing text?', answer: 'Page numbers are placed in the outer margin space to avoid overlapping your existing document text.' },
      { question: 'Can I start numbering at a page other than 1?', answer: 'Yes! You can specify any custom starting number.' }
    ],
    relatedToolSlugs: ['merge-pdf', 'watermark-pdf', 'edit-pdf-metadata']
  },
  {
    id: 'watermark-pdf',
    slug: 'watermark-pdf',
    name: 'Add Watermark',
    category: 'pdf',
    popular: false,
    iconName: 'Stamp',
    shortDescription: 'Stamp text or image watermarks across your PDF pages.',
    detailedDescription: 'Protect and mark your documents with custom text ("CONFIDENTIAL", "DRAFT", or custom text) or logo images with adjustable opacity, angle, and color.',
    acceptedFileTypes: ['.pdf'],
    acceptedMimeTypes: ['application/pdf'],
    maxFiles: 1,
    maxFileSizeMB: 50,
    seoTitle: 'Add Watermark to PDF Online Free | DocuForge',
    seoDescription: 'Stamp text or image watermarks onto PDF pages with custom transparency and rotation.',
    metaH1: 'Add Watermark to PDF Online',
    features: [
      { title: 'Text or Image Watermarks', description: 'Use custom text or upload a transparent PNG logo stamp.' },
      { title: 'Opacity & Angle Control', description: 'Fine-tune watermark transparency and diagonal angle so text stays readable.' },
      { title: 'Multi-Page Stamping', description: 'Applies watermark uniformly across every page in seconds.' }
    ],
    steps: [
      { step: 1, title: 'Upload PDF', description: 'Select the PDF document to watermark.' },
      { step: 2, title: 'Configure Watermark', description: 'Type text or upload image, adjust opacity and rotation.' },
      { step: 3, title: 'Download Watermarked PDF', description: 'Export your protected document.' }
    ],
    faqs: [
      { question: 'Can I make the watermark subtle?', answer: 'Yes! You can set the opacity slider down to 10% for a subtle security stamp.' }
    ],
    relatedToolSlugs: ['flatten-pdf', 'page-number-pdf', 'sign-pdf']
  },
  {
    id: 'edit-pdf-metadata',
    slug: 'edit-pdf-metadata',
    name: 'Edit PDF Metadata',
    category: 'pdf',
    popular: false,
    iconName: 'FilePen',
    shortDescription: 'View and update Title, Author, Subject, and Keywords in your PDF.',
    detailedDescription: 'Inspect and edit document properties. Update author name, document title, subject summary, keywords, and generator metadata without re-encoding the document content.',
    acceptedFileTypes: ['.pdf'],
    acceptedMimeTypes: ['application/pdf'],
    maxFiles: 1,
    maxFileSizeMB: 50,
    seoTitle: 'Edit PDF Metadata Online Free - Change PDF Properties | DocuForge',
    seoDescription: 'View and change Title, Author, Subject, and Keywords of your PDF files online.',
    metaH1: 'Edit PDF Properties and Metadata',
    features: [
      { title: 'Inspect Embedded Metadata', description: 'Read original Title, Author, Subject, Creator, and Producer on file upload.' },
      { title: 'Clean Serialization', description: 'Writes standard PDF metadata dictionaries conforming to PDF 1.7+ specifications.' },
      { title: 'Privacy Sanitization', description: 'Easily strip personal author names and editing software traces.' }
    ],
    steps: [
      { step: 1, title: 'Upload PDF', description: 'Load your document to inspect its properties.' },
      { step: 2, title: 'Update Fields', description: 'Type new values for Title, Author, Subject, or Keywords.' },
      { step: 3, title: 'Save Metadata', description: 'Download your updated PDF.' }
    ],
    faqs: [
      { question: 'Does editing metadata alter document pages or text?', answer: 'No! Page contents, vectors, and fonts remain 100% untouched.' }
    ],
    relatedToolSlugs: ['pdf-page-counter', 'repair-pdf', 'compress-pdf']
  },
  {
    id: 'flatten-pdf',
    slug: 'flatten-pdf',
    name: 'Flatten PDF',
    category: 'pdf',
    popular: false,
    iconName: 'Layers',
    shortDescription: 'Flatten interactive forms and annotations into permanent page content.',
    detailedDescription: 'Lock and flatten fillable form fields, checkboxes, and text inputs into permanent static vector elements. Prevents unauthorized editing and ensures consistent rendering on all devices.',
    acceptedFileTypes: ['.pdf'],
    acceptedMimeTypes: ['application/pdf'],
    maxFiles: 1,
    maxFileSizeMB: 50,
    seoTitle: 'Flatten PDF Forms Online Free - Make PDF Read-Only | DocuForge',
    seoDescription: 'Flatten interactive fillable PDF forms into permanent non-editable page content.',
    metaH1: 'Flatten Fillable PDF Forms and Fields',
    features: [
      { title: 'Permanent Form Locking', description: 'Converts interactive form fields into static page content so values cannot be modified.' },
      { title: 'Eliminate Rendering Glitches', description: 'Guarantees form responses display properly across mobile readers and print.' }
    ],
    steps: [
      { step: 1, title: 'Upload Filled PDF Form', description: 'Select your completed form document.' },
      { step: 2, title: 'Flatten Form', description: 'Engine converts form inputs into static vectors.' },
      { step: 3, title: 'Download Flattened PDF', description: 'Save your tamper-resistant document.' }
    ],
    faqs: [
      { question: 'Can flattened form fields be edited afterwards?', answer: 'No, flattening locks form inputs permanently into the document page layers.' }
    ],
    relatedToolSlugs: ['watermark-pdf', 'sign-pdf', 'compress-pdf']
  },
  {
    id: 'sign-pdf',
    slug: 'sign-pdf',
    name: 'Sign PDF',
    category: 'pdf',
    popular: true,
    iconName: 'PenTool',
    shortDescription: 'Draw, type, or upload your signature and place it onto any PDF page.',
    detailedDescription: 'Sign contracts, NDAs, and agreements directly in your browser. Draw your signature with mouse/touch, type a stylized cursive signature, or upload a transparent PNG stamp.',
    acceptedFileTypes: ['.pdf'],
    acceptedMimeTypes: ['application/pdf'],
    maxFiles: 1,
    maxFileSizeMB: 50,
    seoTitle: 'Sign PDF Online Free - Draw or Type Signature | DocuForge',
    seoDescription: 'Sign PDF documents online. Draw signature with mouse/touch or type signature and place on pages.',
    metaH1: 'Sign PDF Document Online',
    features: [
      { title: 'Interactive Signature Canvas', description: 'Draw signature with smooth touch/mouse strokes or type your signature name.' },
      { title: 'Target Page Selection', description: 'Place signature on the last page, first page, or all pages.' },
      { title: 'Custom Placement & Scaling', description: 'Choose Bottom-Right, Bottom-Left, or custom position with live size scaling.' }
    ],
    steps: [
      { step: 1, title: 'Upload Agreement', description: 'Drop your PDF document.' },
      { step: 2, title: 'Create Signature', description: 'Draw on the digital pad, type, or upload an image.' },
      { step: 3, title: 'Place & Download', description: 'Select position and export your signed PDF.' }
    ],
    faqs: [
      { question: 'Are my signatures uploaded to a server?', answer: 'No! Everything is rendered locally in your browser memory for complete privacy.' }
    ],
    relatedToolSlugs: ['flatten-pdf', 'watermark-pdf', 'merge-pdf']
  },
  {
    id: 'resize-pdf-pages',
    slug: 'resize-pdf-pages',
    name: 'Resize PDF Pages',
    category: 'pdf',
    popular: false,
    iconName: 'Maximize',
    shortDescription: 'Scale and standardize PDF page dimensions to A4, Letter, Legal, or A3.',
    detailedDescription: 'Standardize non-uniform or odd-dimension PDF documents into standard paper sizes (A4, US Letter, Legal, A3) while scaling content to fit.',
    acceptedFileTypes: ['.pdf'],
    acceptedMimeTypes: ['application/pdf'],
    maxFiles: 1,
    maxFileSizeMB: 50,
    seoTitle: 'Resize PDF Pages Online - Scale PDF to A4 or Letter | DocuForge',
    seoDescription: 'Scale and standardize PDF page sizes to A4, US Letter, Legal, or A3 online.',
    metaH1: 'Resize and Standardize PDF Page Dimensions',
    features: [
      { title: 'Standard Paper Sizes', description: 'Choose A4, US Letter, US Legal, or A3 paper dimensions.' },
      { title: 'Aspect-Ratio Content Scaling', description: 'Scales page content proportionally to fit the new paper boundaries.' }
    ],
    steps: [
      { step: 1, title: 'Upload PDF', description: 'Select the PDF with irregular page sizes.' },
      { step: 2, title: 'Select Target Format', description: 'Pick A4, Letter, or Legal with portrait/landscape orientation.' },
      { step: 3, title: 'Download Resized PDF', description: 'Export your standardized PDF document.' }
    ],
    faqs: [
      { question: 'Will resizing cut off parts of my pages?', answer: 'No! Content is proportionally scaled down or up to fit cleanly inside the new page dimensions.' }
    ],
    relatedToolSlugs: ['crop-pdf', 'compress-pdf', 'rotate-pdf']
  },
  {
    id: 'crop-pdf',
    slug: 'crop-pdf',
    name: 'Crop PDF Margins',
    category: 'pdf',
    popular: false,
    iconName: 'Crop',
    shortDescription: 'Trim unwanted white margins and headers/footers from PDF pages.',
    detailedDescription: 'Crop excess blank margins or unwanted edge content from PDF documents. Adjust top, bottom, left, and right margin insets to create a focused document.',
    acceptedFileTypes: ['.pdf'],
    acceptedMimeTypes: ['application/pdf'],
    maxFiles: 1,
    maxFileSizeMB: 50,
    seoTitle: 'Crop PDF Online Free - Trim PDF Margins | DocuForge',
    seoDescription: 'Crop PDF pages online by adjusting margins and removing extra whitespace.',
    metaH1: 'Crop Margins from PDF Documents',
    features: [
      { title: 'Precise Inset Controls', description: 'Individually adjust top, bottom, left, and right crop borders.' },
      { title: 'Document-Wide Application', description: 'Applies clean cropping margins across all pages in the PDF.' }
    ],
    steps: [
      { step: 1, title: 'Upload Document', description: 'Select the PDF to crop.' },
      { step: 2, title: 'Set Margin Trims', description: 'Enter margin point values to trim.' },
      { step: 3, title: 'Download Cropped PDF', description: 'Save your trimmed PDF.' }
    ],
    faqs: [
      { question: 'What units are used for margin crop?', answer: 'Standard PDF points (72 points = 1 inch).' }
    ],
    relatedToolSlugs: ['resize-pdf-pages', 'rotate-pdf', 'delete-pdf-pages']
  },
  {
    id: 'repair-pdf',
    slug: 'repair-pdf',
    name: 'Repair PDF',
    category: 'pdf',
    popular: false,
    iconName: 'Wrench',
    shortDescription: 'Recover and reconstruct damaged or malformed PDF files.',
    detailedDescription: 'Salvage unreadable or corrupted PDF documents. Rebuilds broken cross-reference tables, repairs damaged object trees, and outputs a compliant, viewable PDF.',
    acceptedFileTypes: ['.pdf'],
    acceptedMimeTypes: ['application/pdf'],
    maxFiles: 1,
    maxFileSizeMB: 50,
    seoTitle: 'Repair Corrupt PDF Online Free - Fix Damaged PDF | DocuForge',
    seoDescription: 'Recover and reconstruct damaged or corrupted PDF files online.',
    metaH1: 'Repair Damaged and Corrupt PDF Files',
    features: [
      { title: 'Permissive Structure Recovery', description: 'Reads damaged streams bypassing standard parser crashes.' },
      { title: 'Sanitized Xref Rebuild', description: 'Re-indexes objects into a valid, standard PDF 1.7 cross-reference table.' }
    ],
    steps: [
      { step: 1, title: 'Upload Damaged PDF', description: 'Provide the damaged or unopenable PDF.' },
      { step: 2, title: 'Reconstruct Structure', description: 'Engine recovers salvageable page streams.' },
      { step: 3, title: 'Download Repaired PDF', description: 'Save your recovered document.' }
    ],
    faqs: [
      { question: 'Can every damaged PDF be repaired?', answer: 'If the underlying page content stream is partially intact, our engine can reconstruct it into a viewable PDF.' }
    ],
    relatedToolSlugs: ['unlock-pdf', 'compress-pdf', 'edit-pdf-metadata']
  },
  {
    id: 'unlock-pdf',
    slug: 'unlock-pdf',
    name: 'Unlock PDF',
    category: 'pdf',
    popular: false,
    iconName: 'Unlock',
    shortDescription: 'Remove restriction permissions and locks from your PDF files.',
    detailedDescription: 'Remove owner permission restrictions (such as print, copy, or edit locks) and generate a completely unlocked, unrestricted PDF document.',
    acceptedFileTypes: ['.pdf'],
    acceptedMimeTypes: ['application/pdf'],
    maxFiles: 1,
    maxFileSizeMB: 50,
    seoTitle: 'Unlock PDF Online Free - Remove PDF Restrictions | DocuForge',
    seoDescription: 'Remove PDF print, copy, and permission locks from PDF documents online.',
    metaH1: 'Unlock Restricted PDF Documents',
    features: [
      { title: 'Permission Restriction Removal', description: 'Strips owner locks that prevent printing, copying text, or editing.' },
      { title: 'Clean Decrypted Container', description: 'Outputs a completely unencrypted, openable PDF document.' }
    ],
    steps: [
      { step: 1, title: 'Upload Restricted PDF', description: 'Select your locked PDF document.' },
      { step: 2, title: 'Remove Restrictions', description: 'Engine decouples security handlers.' },
      { step: 3, title: 'Download Unlocked PDF', description: 'Save your fully unrestricted document.' }
    ],
    faqs: [
      { question: 'What kind of passwords does this remove?', answer: 'This removes owner restriction passwords (copy/print/modify locks). Strongly encrypted user-open passwords require entering the decryption key.' }
    ],
    relatedToolSlugs: ['repair-pdf', 'flatten-pdf', 'merge-pdf']
  },

  // --- PDF CONVERTER TOOLS ---
  {
    id: 'pdf-to-jpg',
    slug: 'pdf-to-jpg',
    name: 'PDF to JPG',
    category: 'converter',
    popular: true,
    iconName: 'Image',
    shortDescription: 'Convert PDF pages into high-resolution JPG images with adjustable quality.',
    detailedDescription: 'Render each page of your PDF into crisp, web-ready JPG images. Download single pages individually or get all converted pages in a tidy ZIP file.',
    acceptedFileTypes: ['.pdf'],
    acceptedMimeTypes: ['application/pdf'],
    maxFiles: 1,
    maxFileSizeMB: 50,
    seoTitle: 'PDF to JPG Online - Convert PDF to Images Free | DocuForge',
    seoDescription: 'Convert PDF documents to high-quality JPG pictures. Download all pages as a ZIP file instantly.',
    metaH1: 'Convert PDF to JPG Images Online',
    features: [
      { title: 'High-DPI Rendering', description: 'Generates crisp raster graphics ideal for presentations and social media.' },
      { title: 'ZIP Archive Export', description: 'Multi-page documents are packaged into a organized ZIP archive.' },
      { title: 'Selective Page Rendering', description: 'Convert all pages or only the specific pages you need.' }
    ],
    steps: [
      { step: 1, title: 'Upload PDF', description: 'Choose your PDF document.' },
      { step: 2, title: 'Configure Quality', description: 'Select image resolution and target pages.' },
      { step: 3, title: 'Download JPGs', description: 'Get individual images or a complete ZIP package.' }
    ],
    faqs: [
      { question: 'What DPI are the resulting images rendered at?', answer: 'By default, images are rendered at 150-200 DPI for high clarity and small file size.' }
    ],
    relatedToolSlugs: ['pdf-to-png', 'jpg-to-pdf', 'compress-pdf']
  },
  {
    id: 'jpg-to-pdf',
    slug: 'jpg-to-pdf',
    name: 'JPG to PDF',
    category: 'converter',
    popular: true,
    iconName: 'FilePlus',
    shortDescription: 'Convert JPG, JPEG, and PNG images into a clean, standardized PDF document.',
    detailedDescription: 'Combine multiple image files into a single elegant PDF. Customize page orientation, paper size (A4, Letter, Auto-fit), and page margins with ease.',
    acceptedFileTypes: ['.jpg', '.jpeg', '.png', '.webp'],
    acceptedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles: 30,
    maxFileSizeMB: 50,
    seoTitle: 'JPG to PDF Online - Convert Images to PDF Free | DocuForge',
    seoDescription: 'Combine multiple JPG, PNG, and WebP images into one PDF document with custom margins and page sizes.',
    metaH1: 'Convert JPG Images to PDF Online',
    features: [
      { title: 'Page Size & Orientation', description: 'Choose A4, US Letter, or Auto-fit with portrait or landscape orientation.' },
      { title: 'Margin Controls', description: 'Set no margin, narrow margin, or standard margins for a printed look.' },
      { title: 'Multiple Image Reordering', description: 'Drag images into your preferred story or slide sequence.' }
    ],
    steps: [
      { step: 1, title: 'Upload Images', description: 'Select your JPG, PNG, or WebP photos.' },
      { step: 2, title: 'Customize Layout', description: 'Set page size, margin, and order.' },
      { step: 3, title: 'Generate PDF', description: 'Download your compiled PDF document.' }
    ],
    faqs: [
      { question: 'Can I upload different image dimensions together?', answer: 'Yes! The auto-fit and standard A4 options smoothly adapt images of any aspect ratio.' }
    ],
    relatedToolSlugs: ['png-to-pdf', 'pdf-to-jpg', 'merge-pdf']
  },
  {
    id: 'png-to-pdf',
    slug: 'png-to-pdf',
    name: 'PNG to PDF',
    category: 'converter',
    popular: false,
    iconName: 'FilePlus2',
    shortDescription: 'Turn transparent and high-definition PNG images into a PDF document.',
    detailedDescription: 'Convert PNG graphics, screenshots, and scans into a single standardized PDF file with perfect alpha-channel support and crisp typography.',
    acceptedFileTypes: ['.png'],
    acceptedMimeTypes: ['image/png'],
    maxFiles: 30,
    maxFileSizeMB: 50,
    seoTitle: 'PNG to PDF Online - Convert PNG to PDF Free | DocuForge',
    seoDescription: 'Convert PNG images into clean PDF documents with custom layout controls.',
    metaH1: 'Convert PNG to PDF Online',
    features: [
      { title: 'Crisp Vector/Screenshot Fidelity', description: 'Preserves sharp text and UI screenshots without compression artifacts.' },
      { title: 'Multi-image Batching', description: 'Combine dozens of screenshots into a single document.' }
    ],
    steps: [
      { step: 1, title: 'Select PNGs', description: 'Upload one or multiple PNG graphics.' },
      { step: 2, title: 'Configure Page Layout', description: 'Adjust orientation and margins.' },
      { step: 3, title: 'Save PDF', description: 'Download your assembled PDF file.' }
    ],
    faqs: [
      { question: 'Does it preserve transparency?', answer: 'Transparent PNG areas are rendered cleanly on a pure white background as standard for print documents.' }
    ],
    relatedToolSlugs: ['jpg-to-pdf', 'pdf-to-png', 'compress-image']
  },
  {
    id: 'pdf-to-png',
    slug: 'pdf-to-png',
    name: 'PDF to PNG',
    category: 'converter',
    popular: false,
    iconName: 'ImagePlus',
    shortDescription: 'Extract PDF pages into lossless PNG graphics with sharp text and details.',
    detailedDescription: 'Convert PDF pages into uncompressed, lossless PNG graphics. Ideal for diagrams, charts, UI mockups, and text-heavy pages requiring exact pixel clarity.',
    acceptedFileTypes: ['.pdf'],
    acceptedMimeTypes: ['application/pdf'],
    maxFiles: 1,
    maxFileSizeMB: 50,
    seoTitle: 'PDF to PNG Online - High Quality Lossless Converter | DocuForge',
    seoDescription: 'Convert PDF pages into crystal clear lossless PNG images. Free and in-browser.',
    metaH1: 'Convert PDF to PNG Images Online',
    features: [
      { title: 'Lossless Quality', description: 'PNG format avoids JPEG compression artifacts on fine lines and typography.' },
      { title: 'ZIP Bundle Support', description: 'Download all pages as individual PNGs zipped into a single file.' }
    ],
    steps: [
      { step: 1, title: 'Upload PDF', description: 'Provide the document to convert.' },
      { step: 2, title: 'Render Pages', description: 'Review high-resolution page previews.' },
      { step: 3, title: 'Download PNGs', description: 'Save the images to your device.' }
    ],
    faqs: [
      { question: 'Why choose PNG over JPG?', answer: 'PNG is lossless and prevents blurring around small text, making it ideal for diagrams and documentation.' }
    ],
    relatedToolSlugs: ['pdf-to-jpg', 'png-to-pdf', 'compress-pdf']
  },
  {
    id: 'pdf-to-word',
    slug: 'pdf-to-word',
    name: 'PDF to Word',
    category: 'converter',
    popular: true,
    iconName: 'FileText',
    shortDescription: 'Convert PDF files into editable Microsoft Word (.docx) documents.',
    detailedDescription: 'Extract text, headings, paragraphs, and lists from your PDF file and format them into an authentic, editable Microsoft Word (.docx) document.',
    acceptedFileTypes: ['.pdf'],
    acceptedMimeTypes: ['application/pdf'],
    maxFiles: 1,
    maxFileSizeMB: 50,
    seoTitle: 'PDF to Word Online - Convert PDF to DOCX Free | DocuForge',
    seoDescription: 'Convert PDF to editable Word (.docx) documents online. Preserve text structure and paragraphs cleanly.',
    metaH1: 'Convert PDF to Editable Word (.docx)',
    features: [
      { title: 'Real DOCX Generation', description: 'Generates genuine Microsoft Word (.docx) files compatible with Word, Google Docs, and LibreOffice.' },
      { title: 'Structural Paragraph Parsing', description: 'Retains headings, paragraph breaks, and bulleted text.' },
      { title: 'Honest Formatting Transparency', description: 'Clearly explains structural formatting boundaries for complex scanned documents.' }
    ],
    steps: [
      { step: 1, title: 'Upload PDF', description: 'Drop your PDF document.' },
      { step: 2, title: 'Analyze Text & Structure', description: 'Our engine parses content blocks and typography.' },
      { step: 3, title: 'Download Word File', description: 'Open and edit directly in Microsoft Word or Google Docs.' }
    ],
    faqs: [
      { question: 'Is the downloaded Word file truly editable?', answer: 'Yes! Text, headers, and paragraphs are stored as standard Word paragraph runs, not static snapshots.' }
    ],
    relatedToolSlugs: ['word-to-pdf', 'pdf-to-text', 'pdf-to-excel']
  },
  {
    id: 'word-to-pdf',
    slug: 'word-to-pdf',
    name: 'Word to PDF',
    category: 'converter',
    popular: true,
    iconName: 'FileInput',
    shortDescription: 'Convert Word documents (.docx, .txt) into a standardized PDF.',
    detailedDescription: 'Transform Word documents, formatted text, and notes into professional, non-editable PDF documents with clean page margins and typography.',
    acceptedFileTypes: ['.docx', '.txt', '.md'],
    acceptedMimeTypes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown'],
    maxFiles: 1,
    maxFileSizeMB: 20,
    seoTitle: 'Word to PDF Online - Convert DOCX & Text to PDF | DocuForge',
    seoDescription: 'Convert Word documents and text files into professional PDF files with custom styling.',
    metaH1: 'Convert Word Document to PDF Online',
    features: [
      { title: 'Clean Typography & Page Layout', description: 'Renders headings, paragraphs, and margins smoothly.' },
      { title: 'Standard PDF/A Conformity', description: 'Resulting PDFs render identically across all devices and operating systems.' }
    ],
    steps: [
      { step: 1, title: 'Upload File', description: 'Select your Word (.docx) or text document.' },
      { step: 2, title: 'Process Layout', description: 'Format document pagination and styling.' },
      { step: 3, title: 'Download PDF', description: 'Get your print-ready PDF.' }
    ],
    faqs: [
      { question: 'Can I upload plain text or markdown files?', answer: 'Yes. .txt, .md, and .docx files are accepted. For .docx, the text and paragraphs are extracted and laid out cleanly — images, tables, headers/footers, and original fonts are not reproduced, so complex layouts will look different.' }
    ],
    relatedToolSlugs: ['pdf-to-word', 'compress-pdf', 'excel-to-pdf']
  },
  {
    id: 'pdf-to-excel',
    slug: 'pdf-to-excel',
    name: 'PDF to Excel',
    category: 'converter',
    popular: false,
    iconName: 'Table',
    shortDescription: 'Extract tabular data from PDF files into an Excel-ready CSV spreadsheet.',
    detailedDescription: 'Detect tables, columns, rows, and structured data in financial statements, invoices, and reports, exporting them as a CSV file that opens directly in Excel, Google Sheets, or Numbers. Table detection is text-position based, so it works best on text-based PDFs with clear columns.',
    acceptedFileTypes: ['.pdf'],
    acceptedMimeTypes: ['application/pdf'],
    maxFiles: 1,
    maxFileSizeMB: 30,
    seoTitle: 'PDF to Excel Online - Extract Tables to CSV | DocuForge',
    seoDescription: 'Extract tabular data from PDFs into clean Excel-ready CSV spreadsheets.',
    metaH1: 'Convert PDF Tables to Excel & CSV Online',
    features: [
      { title: 'Table Detection', description: 'Locates columnar alignment and delimiters in invoices and statements.' },
      { title: 'Direct Excel / Sheets Compatibility', description: 'Outputs standard RFC-4180 CSV that opens in Excel, Google Sheets, or Numbers.' }
    ],
    steps: [
      { step: 1, title: 'Upload Financial or Table PDF', description: 'Select your statement or report.' },
      { step: 2, title: 'Detect Columns', description: 'Engine recognizes data columns and headers.' },
      { step: 3, title: 'Download Spreadsheet', description: 'Open instantly in Excel, Google Sheets, or Numbers.' }
    ],
    faqs: [
      { question: 'Does it work with multi-column financial statements?', answer: 'Often, yes — columnar gaps are mapped into cells based on text position. Scanned/image-only PDFs have no text to read (run OCR first), and irregular layouts may need manual cleanup after export.' }
    ],
    relatedToolSlugs: ['excel-to-pdf', 'pdf-to-word', 'pdf-to-text']
  },
  {
    id: 'excel-to-pdf',
    slug: 'excel-to-pdf',
    name: 'Excel to PDF',
    category: 'converter',
    popular: false,
    iconName: 'FileSpreadsheet',
    shortDescription: 'Convert Excel (.xlsx) and CSV spreadsheets into formatted PDF tables.',
    detailedDescription: 'Convert spreadsheets and CSV data into professional, paginated PDF tables with distinct headers, alternating row colors, and neat border styling.',
    acceptedFileTypes: ['.xlsx', '.csv', '.tsv', '.txt'],
    acceptedMimeTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv', 'text/tab-separated-values', 'text/plain'],
    maxFiles: 1,
    maxFileSizeMB: 20,
    seoTitle: 'Excel to PDF Online - Convert Spreadsheets to PDF | DocuForge',
    seoDescription: 'Convert Excel (.xlsx) and CSV spreadsheets into clean, paginated PDF reports.',
    metaH1: 'Convert Spreadsheets to PDF Online',
    features: [
      { title: 'Styled Tables', description: 'Includes contrasting header rows and alternating striped lines for readability.' },
      { title: 'Automatic Pagination', description: 'Spans large datasets across multiple numbered pages seamlessly.' }
    ],
    steps: [
      { step: 1, title: 'Upload Spreadsheet', description: 'Drop your .xlsx or CSV file.' },
      { step: 2, title: 'Format Table', description: 'Preview table structure and column widths.' },
      { step: 3, title: 'Export PDF', description: 'Download your formatted PDF report.' }
    ],
    faqs: [
      { question: 'Which spreadsheet formats are supported?', answer: 'Excel (.xlsx), CSV, TSV, and delimited text. For .xlsx files, the first worksheet is converted using its cell values — formulas, charts, and cell formatting are not reproduced. Legacy .xls files are not supported; save them as .xlsx or CSV first.' }
    ],
    relatedToolSlugs: ['pdf-to-excel', 'word-to-pdf', 'compress-pdf']
  },
  {
    id: 'powerpoint-to-pdf',
    slug: 'powerpoint-to-pdf',
    name: 'PowerPoint to PDF',
    category: 'converter',
    popular: false,
    iconName: 'Presentation',
    shortDescription: 'Turn a text/Markdown slide outline into a landscape presentation PDF.',
    detailedDescription: 'Transform text or Markdown slide outlines into widescreen landscape PDF documents. Note: native .pptx files are not supported — export your deck to PDF from PowerPoint, or paste your outline as text.',
    acceptedFileTypes: ['.txt', '.md', '.json', '.pdf'],
    acceptedMimeTypes: ['text/plain', 'application/json', 'text/markdown', 'application/pdf'],
    maxFiles: 1,
    maxFileSizeMB: 30,
    seoTitle: 'PowerPoint to PDF Online - Convert Presentations to PDF | DocuForge',
    seoDescription: 'Turn text and Markdown slide outlines into widescreen landscape PDF presentations.',
    metaH1: 'Convert Presentations to PDF Online',
    features: [
      { title: '16:9 Widescreen Slides', description: 'Produces modern 16:9 landscape presentation PDF pages.' },
      { title: 'Slide Title & Bullet Hierarchy', description: 'Automatically maps titles, subheads, and bullet points to formatted slides.' }
    ],
    steps: [
      { step: 1, title: 'Upload Presentation Content', description: 'Provide your slide outline or markdown.' },
      { step: 2, title: 'Style Slides', description: 'Configure theme and slide breaks.' },
      { step: 3, title: 'Download Presentation PDF', description: 'Get a widescreen presentation file ready for display.' }
    ],
    faqs: [
      { question: 'Can I use this for client slide handouts?', answer: 'Yes — the output uses a 16:9 layout suited to handouts. It is generated from your text outline; it does not import PowerPoint themes, images, or animations, and .pptx uploads are not supported.' }
    ],
    relatedToolSlugs: ['pdf-to-powerpoint', 'pdf-to-jpg', 'word-to-pdf']
  },
  {
    id: 'pdf-to-powerpoint',
    slug: 'pdf-to-powerpoint',
    name: 'PDF to PowerPoint',
    category: 'converter',
    popular: false,
    iconName: 'Sliders',
    shortDescription: 'Convert PDF slides into presentation-ready slide images and outline packages.',
    detailedDescription: 'Deconstruct a PDF presentation into a ZIP of per-slide images plus a text outline. This does not produce an editable .pptx file.',
    acceptedFileTypes: ['.pdf'],
    acceptedMimeTypes: ['application/pdf'],
    maxFiles: 1,
    maxFileSizeMB: 50,
    seoTitle: 'PDF to PowerPoint Online - Extract Presentation Slides | DocuForge',
    seoDescription: 'Convert PDF presentations into a ZIP of slide images and a text outline.',
    metaH1: 'Convert PDF to PowerPoint Presentation Assets',
    features: [
      { title: 'Slide Image Extraction', description: 'Extracts every slide page at high presentation resolution.' },
      { title: 'Slide Outline Text', description: 'Generates accompanying slide speaker notes and outline.' }
    ],
    steps: [
      { step: 1, title: 'Upload PDF Slides', description: 'Drop your PDF presentation.' },
      { step: 2, title: 'Process Slides', description: 'Engine extracts slide visuals and headings.' },
      { step: 3, title: 'Download Bundle', description: 'Save the presentation package.' }
    ],
    faqs: [
      { question: 'Will complex animations carry over?', answer: 'PDFs represent static visual layouts; animations are not stored in standard PDF specifications.' }
    ],
    relatedToolSlugs: ['powerpoint-to-pdf', 'pdf-to-jpg', 'pdf-to-word']
  },

  // --- IMAGE TOOLS ---
  {
    id: 'compress-image',
    slug: 'compress-image',
    name: 'Compress Image',
    category: 'image',
    popular: true,
    iconName: 'ImageDown',
    shortDescription: 'Shrink JPG, PNG, and WebP photo sizes while preserving visual clarity.',
    detailedDescription: 'Reduce image file size with an interactive quality slider. Compare original vs compressed size in real-time and preview the result before downloading.',
    acceptedFileTypes: ['.jpg', '.jpeg', '.png', '.webp'],
    acceptedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles: 10,
    maxFileSizeMB: 25,
    seoTitle: 'Compress Image Online - Reduce Image Size Free | DocuForge',
    seoDescription: 'Compress JPG, PNG, and WebP images online with real-time compression ratio preview.',
    metaH1: 'Compress Images Online with Quality Slider',
    features: [
      { title: 'Interactive Quality Slider', description: 'Fine-tune quality from 10% to 100% with real-time visual inspection.' },
      { title: 'Format Selection', description: 'Output to JPEG, PNG, or ultra-efficient WebP.' },
      { title: 'Instant Size Comparison', description: 'See before and after KB count and percentage reduction.' }
    ],
    steps: [
      { step: 1, title: 'Upload Picture', description: 'Drop your JPG, PNG, or WebP photo.' },
      { step: 2, title: 'Adjust Quality', description: 'Drag the slider to achieve your target size.' },
      { step: 3, title: 'Download Compressed Image', description: 'Save your lightweight picture.' }
    ],
    faqs: [
      { question: 'Does WebP compress better than JPEG?', answer: 'Yes! WebP typically offers 25-35% better compression at identical visual quality.' }
    ],
    relatedToolSlugs: ['resize-image', 'jpg-to-webp', 'image-to-pdf']
  },
  {
    id: 'resize-image',
    slug: 'resize-image',
    name: 'Resize Image',
    category: 'image',
    popular: false,
    iconName: 'Scaling',
    shortDescription: 'Change image dimensions by pixels or percentage with aspect ratio lock.',
    detailedDescription: 'Resize photos for avatars, banners, social media, or web thumbnails. Lock aspect ratio, select custom pixel widths, or scale by percentage.',
    acceptedFileTypes: ['.jpg', '.jpeg', '.png', '.webp'],
    acceptedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles: 5,
    maxFileSizeMB: 25,
    seoTitle: 'Resize Image Online - Change Dimensions & Aspect Ratio | DocuForge',
    seoDescription: 'Resize photos by width, height, or percentage while maintaining aspect ratio.',
    metaH1: 'Resize Image Dimensions Online',
    features: [
      { title: 'Aspect Ratio Lock', description: 'Preserve width-to-height proportion automatically to avoid image distortion.' },
      { title: 'Preset Dimensions', description: 'Quick presets for HD (1920x1080), Instagram, Twitter, and custom sizes.' },
      { title: 'High-Fidelity Resampling', description: 'Uses multi-step bicubic canvas interpolation for smooth edges.' }
    ],
    steps: [
      { step: 1, title: 'Upload Image', description: 'Select your photo.' },
      { step: 2, title: 'Set Dimensions', description: 'Type width or height or pick a percentage.' },
      { step: 3, title: 'Download Resized Photo', description: 'Save your resized graphic.' }
    ],
    faqs: [
      { question: 'Will resizing make small images blurry if enlarged?', answer: 'Enlarging raster images beyond their native resolution will reduce sharpness; downscaling retains crispness.' }
    ],
    relatedToolSlugs: ['compress-image', 'jpg-to-png', 'image-to-pdf']
  },
  {
    id: 'jpg-to-png',
    slug: 'jpg-to-png',
    name: 'JPG to PNG',
    category: 'image',
    popular: false,
    iconName: 'RefreshCw',
    shortDescription: 'Convert JPG images to lossless PNG format.',
    detailedDescription: 'Convert compressed JPEG pictures into standard PNG format for transparent backgrounds, editing, and lossless archiving.',
    acceptedFileTypes: ['.jpg', '.jpeg'],
    acceptedMimeTypes: ['image/jpeg'],
    maxFiles: 10,
    maxFileSizeMB: 25,
    seoTitle: 'JPG to PNG Online - Free Image Format Converter | DocuForge',
    seoDescription: 'Convert JPG photos to PNG format quickly with zero quality loss.',
    metaH1: 'Convert JPG to PNG Online',
    features: [
      { title: '100% In-Browser Conversion', description: 'Fast processing with no server uploads required.' },
      { title: 'Batch Processing', description: 'Convert multiple JPEG files simultaneously.' }
    ],
    steps: [
      { step: 1, title: 'Select JPG Files', description: 'Drop your JPEG images.' },
      { step: 2, title: 'Convert', description: 'Engine encodes PNG data in milliseconds.' },
      { step: 3, title: 'Download PNG', description: 'Save individual files or a ZIP bundle.' }
    ],
    faqs: [
      { question: 'Will converting JPG to PNG create transparency?', answer: 'JPGs have opaque backgrounds; converting creates a solid PNG which can then have background removed in editors.' }
    ],
    relatedToolSlugs: ['png-to-jpg', 'jpg-to-webp', 'compress-image']
  },
  {
    id: 'png-to-jpg',
    slug: 'png-to-jpg',
    name: 'PNG to JPG',
    category: 'image',
    popular: false,
    iconName: 'FileImage',
    shortDescription: 'Convert PNG graphics to lightweight JPG photos.',
    detailedDescription: 'Convert heavy PNG graphics into lightweight JPG images. Set background fill color (white by default) and customize JPEG quality.',
    acceptedFileTypes: ['.png'],
    acceptedMimeTypes: ['image/png'],
    maxFiles: 10,
    maxFileSizeMB: 25,
    seoTitle: 'PNG to JPG Online - Reduce File Size with JPEG | DocuForge',
    seoDescription: 'Convert PNG graphics into lightweight JPG photos with custom background color.',
    metaH1: 'Convert PNG to JPG Online',
    features: [
      { title: 'Quality Controls', description: 'Choose between 70% and 95% JPEG quality to optimize file weight.' },
      { title: 'Background Fill', description: 'Clean white background fills transparent areas automatically.' }
    ],
    steps: [
      { step: 1, title: 'Upload PNG', description: 'Select your PNG file.' },
      { step: 2, title: 'Pick Quality', description: 'Select compression balance.' },
      { step: 3, title: 'Download JPG', description: 'Save your optimized JPEG.' }
    ],
    faqs: [
      { question: 'What happens to transparent pixels?', answer: 'Transparent pixels are smoothly rendered against a clean white backdrop.' }
    ],
    relatedToolSlugs: ['jpg-to-png', 'png-to-webp', 'compress-image']
  },
  {
    id: 'webp-to-jpg',
    slug: 'webp-to-jpg',
    name: 'WebP to JPG',
    category: 'image',
    popular: false,
    iconName: 'ArrowRightLeft',
    shortDescription: 'Convert modern WebP images to universally compatible JPG format.',
    detailedDescription: 'WebP files from the web are often unsupported in legacy desktop software. Convert them to universally recognized JPG photos in one click.',
    acceptedFileTypes: ['.webp'],
    acceptedMimeTypes: ['image/webp'],
    maxFiles: 10,
    maxFileSizeMB: 25,
    seoTitle: 'WebP to JPG Online - Universal Image Converter | DocuForge',
    seoDescription: 'Convert downloaded WebP pictures to universally compatible JPG files.',
    metaH1: 'Convert WebP to JPG Online',
    features: [
      { title: 'Universal Compatibility', description: 'Open your photos in any photo viewer, Office app, or operating system.' },
      { title: 'High-speed Decoding', description: 'Converts in milliseconds using modern browser canvas APIs.' }
    ],
    steps: [
      { step: 1, title: 'Upload WebP', description: 'Select WebP pictures from your device.' },
      { step: 2, title: 'Convert', description: 'Process file formats instantly.' },
      { step: 3, title: 'Download JPG', description: 'Get universally openable JPGs.' }
    ],
    faqs: [
      { question: 'Why convert WebP to JPG?', answer: 'Some older photo viewers, print shops, and software suites do not yet recognize WebP.' }
    ],
    relatedToolSlugs: ['jpg-to-webp', 'png-to-webp', 'compress-image']
  },
  {
    id: 'jpg-to-webp',
    slug: 'jpg-to-webp',
    name: 'JPG to WebP',
    category: 'image',
    popular: false,
    iconName: 'Sparkles',
    shortDescription: 'Convert JPG photos to next-generation, ultra-compact WebP format.',
    detailedDescription: 'Upgrade your website speed by converting heavy JPG files into lightweight Google WebP format with up to 40% bandwidth savings.',
    acceptedFileTypes: ['.jpg', '.jpeg'],
    acceptedMimeTypes: ['image/jpeg'],
    maxFiles: 10,
    maxFileSizeMB: 25,
    seoTitle: 'JPG to WebP Online - Next-Gen Web Optimization | DocuForge',
    seoDescription: 'Convert JPG to lightweight WebP images for faster websites and better SEO.',
    metaH1: 'Convert JPG to WebP Online',
    features: [
      { title: 'Modern Web Standards', description: 'Approved by Google PageSpeed and Lighthouse for high-performance websites.' },
      { title: 'Superb Compression', description: 'Save 30%+ storage without visible degradation.' }
    ],
    steps: [
      { step: 1, title: 'Select JPG', description: 'Upload your JPEG images.' },
      { step: 2, title: 'Optimize to WebP', description: 'Choose compression level.' },
      { step: 3, title: 'Download WebP', description: 'Use lightweight files on your website.' }
    ],
    faqs: [
      { question: 'Do all modern browsers support WebP?', answer: 'Yes! Chrome, Safari, Edge, Firefox, and mobile browsers all support WebP natively.' }
    ],
    relatedToolSlugs: ['png-to-webp', 'compress-image', 'webp-to-jpg']
  },
  {
    id: 'png-to-webp',
    slug: 'png-to-webp',
    name: 'PNG to WebP',
    category: 'image',
    popular: false,
    iconName: 'Sparkles',
    shortDescription: 'Convert PNG graphics to WebP with transparency support.',
    detailedDescription: 'Shrink bulky PNG screenshots and graphic icons into transparent WebP files, cutting download times for your visitors.',
    acceptedFileTypes: ['.png'],
    acceptedMimeTypes: ['image/png'],
    maxFiles: 10,
    maxFileSizeMB: 25,
    seoTitle: 'PNG to WebP Online - Fast Transparent Image Converter | DocuForge',
    seoDescription: 'Convert PNG images to WebP format while preserving transparency.',
    metaH1: 'Convert PNG to WebP with Alpha Transparency',
    features: [
      { title: 'Alpha Channel Preservation', description: 'Full transparent backgrounds remain transparent in the resulting WebP.' },
      { title: 'Dramatic Size Savings', description: 'Often reduces PNG file sizes by over 50%.' }
    ],
    steps: [
      { step: 1, title: 'Upload PNG', description: 'Add your PNG graphic.' },
      { step: 2, title: 'Convert', description: 'Encode into WebP format.' },
      { step: 3, title: 'Download WebP', description: 'Save your optimized graphic.' }
    ],
    faqs: [
      { question: 'Is alpha transparency kept?', answer: 'Yes! WebP has full native support for 8-bit alpha channels.' }
    ],
    relatedToolSlugs: ['jpg-to-webp', 'png-to-jpg', 'compress-image']
  },
  {
    id: 'image-to-pdf',
    slug: 'image-to-pdf',
    name: 'Image to PDF',
    category: 'image',
    popular: false,
    iconName: 'FileStack',
    shortDescription: 'Convert photos, scans, and graphic files into an organized PDF.',
    detailedDescription: 'Accepts any mix of JPG, PNG, and WebP files. Organize pages, select page margins and paper format, and produce a unified PDF.',
    acceptedFileTypes: ['.jpg', '.jpeg', '.png', '.webp'],
    acceptedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles: 30,
    maxFileSizeMB: 50,
    seoTitle: 'Image to PDF Online - Convert Multiple Photos to PDF | DocuForge',
    seoDescription: 'Combine photos and scans into a single PDF document online for free.',
    metaH1: 'Convert Images to PDF Online',
    features: [
      { title: 'Multi-Format Ingestion', description: 'Mix JPEG, PNG, and WebP images in the same document.' },
      { title: 'Print-Ready Margins', description: 'Configure A4 or Letter sizes with crisp formatting.' }
    ],
    steps: [
      { step: 1, title: 'Upload Photos', description: 'Select your photo files.' },
      { step: 2, title: 'Arrange & Style', description: 'Order images and pick margins.' },
      { step: 3, title: 'Export PDF', description: 'Download the compiled document.' }
    ],
    faqs: [
      { question: 'Is there a limit on image count?', answer: 'You can combine up to 30 images in a single PDF document.' }
    ],
    relatedToolSlugs: ['jpg-to-pdf', 'png-to-pdf', 'merge-pdf']
  },

  // --- OCR TOOLS ---
  {
    id: 'image-to-text',
    slug: 'image-to-text',
    name: 'Image to Text (OCR)',
    category: 'ocr',
    popular: true,
    iconName: 'ScanText',
    shortDescription: 'Extract readable text from photos, scans, receipts, and screenshots.',
    detailedDescription: 'Upload JPG, PNG, or WebP pictures containing text. Our optical character recognition engine analyzes characters and returns copyable text and downloadable TXT/DOCX files.',
    acceptedFileTypes: ['.jpg', '.jpeg', '.png', '.webp'],
    acceptedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles: 1,
    maxFileSizeMB: 20,
    seoTitle: 'Image to Text OCR Online - Extract Text from Photos Free | DocuForge',
    seoDescription: 'Extract text from images, receipts, and screenshots using optical character recognition.',
    metaH1: 'Extract Text From Images with OCR',
    features: [
      { title: 'Optical Character Recognition', description: 'Identifies printed Latin typography, numbers, and punctuation.' },
      { title: 'Copy or Download', description: 'Copy text to clipboard with one click or download as .txt or .docx.' },
      { title: 'Real-time OCR Progress', description: 'Shows recognition stages and confidence indicators.' }
    ],
    steps: [
      { step: 1, title: 'Upload Image with Text', description: 'Select receipt, document photo, or screenshot.' },
      { step: 2, title: 'Run OCR Analysis', description: 'Engine recognizes text lines and words.' },
      { step: 3, title: 'Copy or Save Text', description: 'Copy to clipboard or download TXT/DOCX.' }
    ],
    faqs: [
      { question: 'How can I get the highest OCR accuracy?', answer: 'Ensure high contrast, good lighting, and sharp focus on the source document image.' }
    ],
    relatedToolSlugs: ['pdf-to-text', 'scanned-pdf-ocr', 'word-counter']
  },
  {
    id: 'pdf-to-text',
    slug: 'pdf-to-text',
    name: 'PDF to Text',
    category: 'ocr',
    popular: false,
    iconName: 'FileCode',
    shortDescription: 'Extract selectable text streams from digital PDF documents.',
    detailedDescription: 'Quickly pull all selectable text, paragraphs, and raw data out of a native digital PDF document. Copy immediately or export to TXT or DOCX.',
    acceptedFileTypes: ['.pdf'],
    acceptedMimeTypes: ['application/pdf'],
    maxFiles: 1,
    maxFileSizeMB: 50,
    seoTitle: 'PDF to Text Online - Extract Text from PDF Free | DocuForge',
    seoDescription: 'Extract clean text from digital PDF files instantly without formatting clutter.',
    metaH1: 'Extract Text From PDF Online',
    features: [
      { title: 'Instant Text Extraction', description: 'Directly reads embedded text objects in digital PDFs in seconds.' },
      { title: 'Clean Plain Text Export', description: 'Strips complex vector layout to give you raw, clean copyable text.' }
    ],
    steps: [
      { step: 1, title: 'Upload PDF', description: 'Provide your digital PDF file.' },
      { step: 2, title: 'Extract Content', description: 'Text streams are decoded across all pages.' },
      { step: 3, title: 'Copy or Download', description: 'Save as .txt or copy directly to clipboard.' }
    ],
    faqs: [
      { question: 'What if my PDF is a scanned picture with no selectable text?', answer: 'Use our "Scanned PDF OCR" tool which performs visual character recognition on raster pages!' }
    ],
    relatedToolSlugs: ['scanned-pdf-ocr', 'image-to-text', 'pdf-to-word']
  },
  {
    id: 'scanned-pdf-ocr',
    slug: 'scanned-pdf-ocr',
    name: 'Scanned PDF OCR',
    category: 'ocr',
    popular: false,
    iconName: 'FileSearch',
    shortDescription: 'Perform optical character recognition on scanned or image-based PDF pages.',
    detailedDescription: 'For PDFs that are scanned images without copyable text. Renders each page to high-contrast bitmaps and runs optical character recognition to extract full text.',
    acceptedFileTypes: ['.pdf'],
    acceptedMimeTypes: ['application/pdf'],
    maxFiles: 1,
    maxFileSizeMB: 50,
    seoTitle: 'Scanned PDF OCR Online - Make Scanned PDFs Searchable | DocuForge',
    seoDescription: 'Run OCR on scanned image-based PDF documents. Extract readable, editable text.',
    metaH1: 'OCR for Scanned PDF Documents',
    features: [
      { title: 'Scanned Image Recognition', description: 'Reads flat raster pages where text is not normally selectable.' },
      { title: 'Multi-Page Parsing', description: 'Processes pages sequentially with clear progress metrics.' },
      { title: 'Docx & TXT Export', description: 'Save extracted text into an editable Word document or text file.' }
    ],
    steps: [
      { step: 1, title: 'Upload Scanned PDF', description: 'Upload your paper scan or photo PDF.' },
      { step: 2, title: 'OCR Processing', description: 'Engine recognizes characters on each page.' },
      { step: 3, title: 'Export Extracted Text', description: 'Download the text as TXT or Word .docx.' }
    ],
    faqs: [
      { question: 'How long does scanned OCR take?', answer: 'Typically 2 to 5 seconds per page depending on resolution and text density.' }
    ],
    relatedToolSlugs: ['image-to-text', 'pdf-to-text', 'pdf-to-word']
  },

  // --- FILE UTILITIES ---
  {
    id: 'word-counter',
    slug: 'word-counter',
    name: 'Word Counter',
    category: 'utilities',
    popular: true,
    iconName: 'Hash',
    shortDescription: 'Count words, characters, sentences, reading time, and keyword density.',
    detailedDescription: 'Paste your writing or upload TXT/PDF files to get instant metrics: word count, character count (with/without spaces), sentence count, estimated reading & speaking time, and top keyword frequencies.',
    acceptedFileTypes: ['.txt', '.md', '.pdf', '.docx'],
    acceptedMimeTypes: ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    maxFiles: 1,
    maxFileSizeMB: 20,
    seoTitle: 'Word Counter Online - Character & Sentence Counter | DocuForge',
    seoDescription: 'Free online word counter, character counter, sentence counter, and reading time estimator.',
    metaH1: 'Word, Character & Sentence Counter',
    features: [
      { title: 'Comprehensive Metrics', description: 'Words, chars, spaces, sentences, paragraphs, and reading time.' },
      { title: 'Keyword Density Analyzer', description: 'Shows most frequent words and their percentages.' },
      { title: 'File or Direct Typing', description: 'Type directly in the live editor or drop documents.' }
    ],
    steps: [
      { step: 1, title: 'Type or Upload', description: 'Paste text or drop a document.' },
      { step: 2, title: 'Inspect Real-time Stats', description: 'Metrics update instantaneously.' },
      { step: 3, title: 'Copy or Format', description: 'Adjust text or copy summary.' }
    ],
    faqs: [
      { question: 'How is reading time calculated?', answer: 'Based on the average adult reading speed of 225 words per minute.' }
    ],
    relatedToolSlugs: ['character-counter', 'text-extractor', 'pdf-page-counter']
  },
  {
    id: 'character-counter',
    slug: 'character-counter',
    name: 'Character Counter',
    category: 'utilities',
    popular: false,
    iconName: 'Type',
    shortDescription: 'Count characters with/without spaces and convert text casing.',
    detailedDescription: 'Check exact character limits for social media (Twitter/X 280, LinkedIn, Meta ads, SEO meta descriptions). Includes one-click case conversion (UPPERCASE, lowercase, Title Case, camelCase, slugify).',
    acceptedFileTypes: ['.txt', '.md'],
    acceptedMimeTypes: ['text/plain'],
    maxFiles: 1,
    maxFileSizeMB: 5,
    seoTitle: 'Character Counter Online - Social Media & Case Converter | DocuForge',
    seoDescription: 'Count exact characters and convert text casing for social posts and SEO tags.',
    metaH1: 'Character Counter & Text Transformer',
    features: [
      { title: 'Social Platform Gauges', description: 'Live progress indicators for X/Twitter (280), Meta (125), and Google Meta (160).' },
      { title: 'Case Converters', description: 'Transform text to UPPERCASE, lowercase, Title Case, and URL Slug.' }
    ],
    steps: [
      { step: 1, title: 'Enter Text', description: 'Paste your copy or slogan.' },
      { step: 2, title: 'Check Limits', description: 'View limit percentages for platforms.' },
      { step: 3, title: 'Transform & Copy', description: 'Apply casing changes and copy result.' }
    ],
    faqs: [
      { question: 'Do emojis count as 1 or 2 characters?', answer: 'DocuForge displays both standard UTF-16 code units and perceived glyph counts.' }
    ],
    relatedToolSlugs: ['word-counter', 'text-extractor', 'file-size-checker']
  },
  {
    id: 'pdf-page-counter',
    slug: 'pdf-page-counter',
    name: 'PDF Page Counter',
    category: 'utilities',
    popular: false,
    iconName: 'BookOpen',
    shortDescription: 'Inspect PDF page count, dimensions, version, and document metadata.',
    detailedDescription: 'Quickly inspect page counts for one or multiple PDF documents. Read embedded metadata including Author, Title, Creator, Producer, PDF Version, and Creation Date.',
    acceptedFileTypes: ['.pdf'],
    acceptedMimeTypes: ['application/pdf'],
    maxFiles: 10,
    maxFileSizeMB: 100,
    seoTitle: 'PDF Page Counter & Metadata Inspector | DocuForge',
    seoDescription: 'Count pages in PDF files and inspect document properties and metadata online.',
    metaH1: 'PDF Page Counter & Metadata Inspector',
    features: [
      { title: 'Batch Page Totals', description: 'Upload multiple PDFs to see individual page counts and grand total.' },
      { title: 'Deep Metadata Inspection', description: 'Displays PDF specification version, author, encryption status, and dimensions.' }
    ],
    steps: [
      { step: 1, title: 'Upload PDFs', description: 'Drop one or several PDF files.' },
      { step: 2, title: 'View Summary', description: 'Read page totals and page dimensions.' },
      { step: 3, title: 'Export Info', description: 'Copy details or export page manifest.' }
    ],
    faqs: [
      { question: 'Does this modify my PDF?', answer: 'No, this tool performs non-destructive read-only inspection.' }
    ],
    relatedToolSlugs: ['file-size-checker', 'compress-pdf', 'merge-pdf']
  },
  {
    id: 'file-size-checker',
    slug: 'file-size-checker',
    name: 'File Size Checker',
    category: 'utilities',
    popular: false,
    iconName: 'HardDrive',
    shortDescription: 'Inspect exact byte size, MIME validation, and download time estimates.',
    detailedDescription: 'Verify exact file sizes across Bytes, Kilobytes, Megabytes, and Gigabytes. Test files against email attachment limits and calculate upload/download times across broadband, 4G, and 5G.',
    acceptedFileTypes: ['*'],
    acceptedMimeTypes: ['*'],
    maxFiles: 5,
    maxFileSizeMB: 500,
    seoTitle: 'File Size Checker & Transfer Time Calculator | DocuForge',
    seoDescription: 'Check exact byte size, MIME headers, and email attachment compatibility.',
    metaH1: 'File Size Checker & Transfer Calculator',
    features: [
      { title: 'Precise Byte Breakdown', description: 'Shows exact bytes, IEC KiB/MiB, and decimal KB/MB values.' },
      { title: 'Email Compatibility Checks', description: 'Flags whether file fits within Gmail (25MB), Outlook (20MB), or Yahoo limits.' },
      { title: 'Bandwidth Transfer Simulator', description: 'Calculates expected download speeds across 3G, 4G, 5G, and Gigabit Fiber.' }
    ],
    steps: [
      { step: 1, title: 'Select Any File', description: 'Drop any document, image, or media file.' },
      { step: 2, title: 'Inspect Metrics', description: 'Review detailed size conversions and email thresholds.' },
      { step: 3, title: 'Plan Delivery', description: 'Use compression tools if size exceeds target limit.' }
    ],
    faqs: [
      { question: 'What is the difference between MB and MiB?', answer: '1 MB is 1,000,000 bytes (decimal), while 1 MiB is 1,048,576 bytes (binary).' }
    ],
    relatedToolSlugs: ['compress-pdf', 'compress-image', 'pdf-page-counter']
  },
  {
    id: 'text-extractor',
    slug: 'text-extractor',
    name: 'Text Extractor',
    category: 'utilities',
    popular: false,
    iconName: 'FileText',
    shortDescription: 'Extract raw text from PDF, DOCX, TXT, and scanned image files.',
    detailedDescription: 'An all-in-one text extraction hub. Upload documents, invoices, or screenshots and extract all text cleanly for copying or downloading.',
    acceptedFileTypes: ['.pdf', '.docx', '.txt', '.png', '.jpg', '.webp'],
    acceptedMimeTypes: ['application/pdf', 'text/plain', 'image/png', 'image/jpeg'],
    maxFiles: 1,
    maxFileSizeMB: 50,
    seoTitle: 'Online Text Extractor - Extract Text from Any File | DocuForge',
    seoDescription: 'Universal document text extractor for PDFs, images, and text files.',
    metaH1: 'Universal Document Text Extractor',
    features: [
      { title: 'Multi-Format Detection', description: 'Automatically routes between digital text stream extraction and OCR.' },
      { title: 'Formatting Cleanup', description: 'Removes duplicate whitespace, fixes hyphenated line breaks, and normalizes quotes.' }
    ],
    steps: [
      { step: 1, title: 'Upload Any Document', description: 'Choose your PDF, image, or text file.' },
      { step: 2, title: 'Extract Text', description: 'Engine pulls all textual content.' },
      { step: 3, title: 'Copy or Save', description: 'Copy with one click or download.' }
    ],
    faqs: [
      { question: 'Can it extract text from multi-page PDFs?', answer: 'Yes! Text from all pages is concatenated with clear page delimiters.' }
    ],
    relatedToolSlugs: ['word-counter', 'image-to-text', 'pdf-to-text']
  }
];

export const CATEGORIES_CONFIG = [
  { id: 'pdf', name: 'PDF Tools', icon: 'FileText', description: 'Merge, split, compress, rotate, and manage PDF pages' },
  { id: 'converter', name: 'PDF Converter', icon: 'RefreshCw', description: 'Convert between PDF, Office, and image formats' },
  { id: 'image', name: 'Image Tools', icon: 'Image', description: 'Compress, resize, and convert JPG, PNG, and WebP' },
  { id: 'ocr', name: 'OCR Tools', icon: 'ScanText', description: 'Extract text from scans, photos, and digital documents' },
  { id: 'utilities', name: 'File Utilities', icon: 'Sliders', description: 'Word counters, file inspectors, and text utilities' },
] as const;
