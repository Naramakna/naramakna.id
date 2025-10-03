import React, { useState, useEffect, useCallback, useRef } from 'react';
import { buildApiUrl } from '../../config/api';
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css';
import '../../styles/editor.css';

interface DynamicSection {
  id: string;
  title: string;
  content: string;
  color: string;
  icon: string;
  order: number;
  hidden?: boolean;
}

interface AboutPageData {
  id?: number;
  title: string;
  hero_title: string;
  hero_subtitle: string;
  mission_title: string;
  mission_content: string;
  vision_title: string;
  vision_content: string;
  values_title: string;
  values_content: string;
  team_title: string;
  team_content: string;
  dynamic_sections: DynamicSection[];
  // Section visibility controls
  hero_hidden?: boolean;
  mission_hidden?: boolean;
  vision_hidden?: boolean;
  values_hidden?: boolean;
  team_hidden?: boolean;
}

// Quill configuration - same as ArticleWriterPage
const formats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'link', 'image', 'video',
  'color', 'background', 'align'
];

// Helper function to clean HTML and convert to plain text for fallback
const stripHTML = (html: string): string => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

// Helper function to safely render HTML content
const createMarkup = (html: string) => {
  return { __html: html };
};

// Helper function to ensure ReactQuill receives valid content
const sanitizeQuillContent = (content: string | undefined | null): string => {
  if (!content || content.trim() === '') {
    return '<p><br></p>'; // ReactQuill's preferred empty state
  }
  // Ensure content is valid HTML - return as-is if it has content
  return content.trim();
};


// Available colors for sections
const SECTION_COLORS = [
  { name: 'Orange', value: 'orange', class: 'orange' },
  { name: 'Blue', value: 'blue', class: 'blue' },
  { name: 'Green', value: 'green', class: 'green' },
  { name: 'Purple', value: 'purple', class: 'purple' },
  { name: 'Red', value: 'red', class: 'red' },
  { name: 'Pink', value: 'pink', class: 'pink' },
  { name: 'Indigo', value: 'indigo', class: 'indigo' },
  { name: 'Teal', value: 'teal', class: 'teal' }
];

// Available icons for sections
const SECTION_ICONS = [
  { name: 'Info', value: 'info', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { name: 'Users', value: 'users', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  { name: 'Star', value: 'star', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
  { name: 'Heart', value: 'heart', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  { name: 'Briefcase', value: 'briefcase', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6' },
  { name: 'Eye', value: 'eye', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
  { name: 'Lightning', value: 'lightning', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { name: 'Shield', value: 'shield', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' }
];

// Default static content matching the static AboutUs component
const DEFAULT_CONTENT: AboutPageData = {
  title: 'Tentang Kami',
  hero_title: 'Tentang Naramakna',
  hero_subtitle: `<p><span class="font-semibold text-orange-600">Naramakna.id</span> adalah platform media digital yang lahir dari kebutuhan akan ruang dialog yang lebih bermakna di era informasi yang serba cepat. Kami hadir bukan hanya sebagai penyampai berita, melainkan sebagai <span class="bg-orange-100 px-2 py-1 rounded font-medium">katalis perubahan sosial</span> yang mendorong masyarakat untuk berpikir lebih kritis dan mendalam.</p>

<p>Di tengah tsunami informasi digital yang sering kali membingungkan, kami berperan sebagai <span class="font-semibold text-blue-600">kompas intelektual</span> yang membantu pembaca menavigasi kompleksitas isu-isu kontemporer. Kami percaya bahwa setiap peristiwa memiliki lapisan makna yang lebih dalam, yang layak untuk dieksplorasi bersama.</p>

<p>Melalui pendekatan <span class="font-semibold text-green-600">jurnalisme data yang humanis</span>, kami menyajikan fakta dalam kemasan yang tidak hanya informatif, tetapi juga inspiratif. Setiap artikel yang kami terbitkan melewati proses kurasi yang ketat untuk memastikan akurasi, relevansi, dan dampak positif bagi masyarakat.</p>

<p>Dengan tagline <span class="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent font-bold">"Cerdas Memaknai"</span>, kami berkomitmen menjadi bagian dari ekosistem media yang sehat, di mana kebenaran, empati, dan dialog konstruktif menjadi fondasi utama dalam setiap karya jurnalistik kami.</p>`,
  mission_title: 'Misi',
  mission_content: `<ul>
<li>Menghadirkan <strong>jurnalisme data yang mendalam</strong> dan mudah dipahami untuk memperkaya wawasan publik</li>
<li>Memfasilitasi <strong>partisipasi aktif masyarakat</strong> dalam membangun narasi bersama yang konstruktif</li>
<li>Menjembatani kesenjangan antara <strong>kebijakan dan realitas</strong> melalui perspektif yang berimbang</li>
<li>Menjaga <strong>integritas informasi</strong> dan melawan disinformasi dengan standar jurnalistik tertinggi</li>
</ul>`,
  vision_title: 'Visi',
  vision_content: '<p>Menjadi <span class="font-semibold text-orange-600">media digital terdepan</span> yang menginspirasi transformasi sosial melalui narasi bermakna, menciptakan ekosistem informasi yang sehat, kritis, dan inklusif untuk Indonesia yang lebih cerdas dan berempati.</p>',
  values_title: 'Layanan Unggulan Kami',
  values_content: `<p><strong>Solusi komprehensif untuk kebutuhan media digital Anda</strong></p>

<p><strong>Data Intelligence</strong> - Riset mendalam dengan metodologi ilmiah dan analisis data yang akurat untuk menghasilkan <span class="font-semibold text-orange-600">insight berkualitas tinggi</span></p>

<p><strong>Creative Storytelling</strong> - Kreativitas digital yang memadukan <span class="font-semibold text-blue-600">seni visual</span> dengan narasi powerful untuk engagement maksimal</p>

<p><strong>Strategic Publishing</strong> - Strategi branding holistik dan sistem publishing yang <span class="font-semibold text-green-600">terukur dan berkelanjutan</span> untuk impact jangka panjang</p>`,
  team_title: 'Tim Kami',
  team_content: '<p>Bagian ini dapat diisi dengan informasi tentang tim Naramakna dan orang-orang dibalik platform media digital ini.</p>',
  dynamic_sections: []
};

export const AdminAbout: React.FC = () => {
  const [originalData, setOriginalData] = useState<AboutPageData>(DEFAULT_CONTENT);
  const [aboutData, setAboutData] = useState<AboutPageData>(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editorKey, setEditorKey] = useState(0); // For forcing remount of editors
  const quillRef = useRef<ReactQuill>(null);
  const [lastFocusedQuillInstance, setLastFocusedQuillInstance] = useState<any>(null);

  // Create refs for all editors
  const heroQuillRef = useRef<ReactQuill>(null);
  const missionQuillRef = useRef<ReactQuill>(null);
  const visionQuillRef = useRef<ReactQuill>(null);
  const valuesQuillRef = useRef<ReactQuill>(null);
  const teamQuillRef = useRef<ReactQuill>(null);
  const activeEditorRef = useRef<ReactQuill | null>(null);

  // Image upload handler - adapted from ArticleWriterPage but works with multiple editors
  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        const formData = new FormData();
        formData.append('image', file);

        try {
          const response = await fetch(buildApiUrl('about/upload-image'), {
            method: 'POST',
            credentials: 'include',
            body: formData
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data?.url) {
              console.log('🖼️ Image uploaded successfully:', result.data.url);

              // Use the active editor ref
              if (activeEditorRef.current) {
                console.log('📝 Using active editor ref');
                const quill = activeEditorRef.current.getEditor();
                const range = quill.getSelection() || { index: 0 };
                quill.insertEmbed(range.index, 'image', result.data.url);
                console.log('✅ Image inserted via ref');
              } else {
                // Fallback: try all refs
                console.log('🔍 Trying fallback refs...');
                const allRefs = [heroQuillRef, missionQuillRef, visionQuillRef, valuesQuillRef, teamQuillRef];
                let inserted = false;

                for (const ref of allRefs) {
                  if (ref.current) {
                    try {
                      const quill = ref.current.getEditor();
                      const range = quill.getSelection();
                      if (range) {
                        quill.insertEmbed(range.index, 'image', result.data.url);
                        console.log('✅ Image inserted via fallback ref');
                        inserted = true;
                        break;
                      }
                    } catch (e) {
                      console.log('⚠️ Ref not ready:', e);
                    }
                  }
                }

                if (!inserted) {
                  // Last resort: use first available ref
                  const firstRef = allRefs.find(ref => ref.current);
                  if (firstRef?.current) {
                    const quill = firstRef.current.getEditor();
                    quill.insertEmbed(0, 'image', result.data.url);
                    console.log('✅ Image inserted at beginning of first editor');
                  } else {
                    console.error('❌ No editor refs available');
                    setMessage({ type: 'error', text: 'Could not find active editor' });
                    setTimeout(() => setMessage(null), 3000);
                  }
                }
              }
            }
          } else {
            setMessage({ type: 'error', text: 'Failed to upload image' });
            setTimeout(() => setMessage(null), 3000);
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          setMessage({ type: 'error', text: 'Error uploading image' });
          setTimeout(() => setMessage(null), 3000);
        }
      }
    };
  }, []);

  // Toolbar configuration - same as ArticleWriterPage
  const getToolbarConfig = () => {
    return [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'link', 'image'],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ];
  };

  const modules = React.useMemo(() => ({
    toolbar: {
      container: getToolbarConfig(),
      handlers: {
        image: imageHandler
      }
    },
    clipboard: {
      matchVisual: false
    }
  }), [imageHandler]);

  // Fetch current about page data
  useEffect(() => {
    fetchAboutData();
  }, []);

  // Global focus listener to track active Quill editor
  useEffect(() => {
    const handleFocus = (event: FocusEvent) => {
      const target = event.target as Element;
      if (target && target.closest('.ql-editor')) {
        const container = target.closest('.ql-container');
        if (container) {
          const quillInstance = (window as any).Quill?.find?.(container);
          if (quillInstance) {
            setLastFocusedQuillInstance(quillInstance);
          }
        }
      }
    };

    document.addEventListener('focusin', handleFocus);
    return () => document.removeEventListener('focusin', handleFocus);
  }, []);

  const fetchAboutData = async () => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl('about'), {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Ensure all content fields have valid values for ReactQuill
          const safeData = {
            ...data.data,
            hero_subtitle: data.data.hero_subtitle || '<p><br></p>',
            mission_content: data.data.mission_content || '<p><br></p>',
            vision_content: data.data.vision_content || '<p><br></p>',
            values_content: data.data.values_content || '<p><br></p>',
            team_content: data.data.team_content || '<p><br></p>',
            dynamic_sections: data.data.dynamic_sections || []
          };
          setAboutData(safeData);
          setOriginalData(safeData);
        }
      } else {
        console.log('No existing about data found, using defaults');
      }
    } catch (error) {
      console.error('Error fetching about data:', error);
      setMessage({ type: 'error', text: 'Failed to load about page data' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof AboutPageData, value: string | boolean) => {
    // For boolean values (hidden fields), use them directly
    // For string values, ensure they're never null/undefined for ReactQuill
    const safeValue = typeof value === 'boolean' ? value : (value || '<p><br></p>');
    setAboutData(prev => ({
      ...prev,
      [field]: safeValue
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const response = await fetch(buildApiUrl('about'), {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(aboutData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setOriginalData(aboutData); // Update original data after successful save
        setMessage({ type: 'success', text: 'About page updated successfully!' });
        setShowSaveConfirm(false);
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to update about page' });
      }
    } catch (error) {
      console.error('Error saving about data:', error);
      setMessage({ type: 'error', text: 'Error saving about page data' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setAboutData(originalData);
    setEditorKey(prev => prev + 1); // Force remount all editors
    setMessage({ type: 'success', text: 'Changes have been reset to last saved version' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleResetToDefault = () => {
    console.log('=== RESET TO DEFAULT STARTED ===');
    console.log('DEFAULT_CONTENT:', DEFAULT_CONTENT);

    // Set new data first
    setAboutData({ ...DEFAULT_CONTENT });

    // Force remount with new key after a small delay
    setTimeout(() => {
      setEditorKey(prev => prev + 1);
      console.log('Editors remounted with new content');
    }, 50);

    setMessage({ type: 'success', text: 'Content has been reset to original default values' });
    setTimeout(() => setMessage(null), 3000);

    console.log('=== RESET TO DEFAULT COMPLETED ===');
  };

  // Dynamic sections management
  const addDynamicSection = () => {
    const newSection: DynamicSection = {
      id: `section_${Date.now()}`,
      title: 'New Section',
      content: '<p>Enter your content here...</p>',
      color: 'blue',
      icon: 'info',
      order: aboutData.dynamic_sections.length
    };

    setAboutData(prev => ({
      ...prev,
      dynamic_sections: [...prev.dynamic_sections, newSection]
    }));
  };

  const updateDynamicSection = (sectionId: string, field: keyof DynamicSection, value: string | number) => {
    // Ensure content field is never null/undefined for ReactQuill
    const safeValue = (field === 'content' && typeof value === 'string')
      ? (value || '<p><br></p>')
      : value;

    setAboutData(prev => ({
      ...prev,
      dynamic_sections: prev.dynamic_sections.map(section =>
        section.id === sectionId ? { ...section, [field]: safeValue } : section
      )
    }));
  };

  const removeDynamicSection = (sectionId: string) => {
    setAboutData(prev => ({
      ...prev,
      dynamic_sections: prev.dynamic_sections.filter(section => section.id !== sectionId)
    }));
  };

  const moveDynamicSection = (sectionId: string, direction: 'up' | 'down') => {
    setAboutData(prev => {
      const sections = [...prev.dynamic_sections];
      const index = sections.findIndex(s => s.id === sectionId);

      if (direction === 'up' && index > 0) {
        [sections[index], sections[index - 1]] = [sections[index - 1], sections[index]];
      } else if (direction === 'down' && index < sections.length - 1) {
        [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
      }

      return { ...prev, dynamic_sections: sections };
    });
  };

  const hasChanges = () => {
    return JSON.stringify(aboutData) !== JSON.stringify(originalData);
  };

  const handleSaveClick = () => {
    if (hasChanges()) {
      setShowSaveConfirm(true);
    } else {
      setMessage({ type: 'error', text: 'No changes to save' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const previewUrl = 'https://naramakna.id/tentang-kami';

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading about page data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Edit About Page</h2>
          <p className="text-gray-600">Manage the content displayed on the Tentang Kami page</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowPreview(true)}
            className="px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
          >
            Preview Changes
          </button>
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            View Live Page
          </a>
          {/* Reset to Default button hidden due to errors */}
          {false && (
          <button
            onClick={handleResetToDefault}
            className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            Reset to Default
          </button>
          )}
          {hasChanges() && (
            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reset Changes
            </button>
          )}
          <button
            onClick={handleSaveClick}
            disabled={saving || !hasChanges()}
            className={`px-4 py-2 rounded-lg transition-colors ${
              hasChanges()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-8">
        {/* Page Title */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Page Title</h3>
          <input
            type="text"
            value={aboutData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Tentang Kami"
          />
        </div>

        {/* Hero Section */}
        <div className={`border rounded-lg p-6 ${aboutData.hero_hidden ? 'border-yellow-300 bg-yellow-50 opacity-75' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-medium text-gray-900">Hero Section</h3>
              {aboutData.hero_hidden && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m0 0l3.878 3.878M12 12l3.878-3.878" />
                  </svg>
                  Hidden
                </span>
              )}
            </div>
            <button
              onClick={() => handleInputChange('hero_hidden', !aboutData.hero_hidden)}
              className={`p-2 rounded-lg ${aboutData.hero_hidden ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-100' : 'text-green-500 hover:text-green-600 bg-green-100'}`}
              title={aboutData.hero_hidden ? "Show Section" : "Hide Section"}
            >
              {aboutData.hero_hidden ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m0 0l3.878 3.878M12 12l3.878-3.878" />
                </svg>
              )}
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hero Title</label>
              <input
                type="text"
                value={aboutData.hero_title}
                onChange={(e) => handleInputChange('hero_title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tentang Naramakna"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hero Subtitle</label>
              <div className="prose-editor">
                <ReactQuill
                  ref={heroQuillRef}
                  theme="snow"
                  value={aboutData.hero_subtitle}
                  onChange={(content) => handleInputChange('hero_subtitle', content)}
                  onFocus={() => { activeEditorRef.current = heroQuillRef.current; }}
                  modules={modules}
                  formats={formats}
                  placeholder="Platform media digital yang lahir dari kebutuhan akan ruang dialog yang lebih bermakna..."
                  style={{ minHeight: '100px' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className={`border rounded-lg p-6 ${aboutData.mission_hidden ? 'border-yellow-300 bg-yellow-50 opacity-75' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-medium text-gray-900">Mission Section</h3>
              {aboutData.mission_hidden && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m0 0l3.878 3.878M12 12l3.878-3.878" />
                  </svg>
                  Hidden
                </span>
              )}
            </div>
            <button
              onClick={() => handleInputChange('mission_hidden', !aboutData.mission_hidden)}
              className={`p-2 rounded-lg ${aboutData.mission_hidden ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-100' : 'text-green-500 hover:text-green-600 bg-green-100'}`}
              title={aboutData.mission_hidden ? "Show Section" : "Hide Section"}
            >
              {aboutData.mission_hidden ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m0 0l3.878 3.878M12 12l3.878-3.878" />
                </svg>
              )}
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mission Title</label>
              <input
                type="text"
                value={aboutData.mission_title}
                onChange={(e) => handleInputChange('mission_title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Misi Kami"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mission Content</label>
              <div className="prose-editor">
                <ReactQuill
                  ref={missionQuillRef}
                  theme="snow"
                  value={aboutData.mission_content}
                  onChange={(content) => handleInputChange('mission_content', content)}
                  onFocus={() => { activeEditorRef.current = missionQuillRef.current; }}
                  modules={modules}
                  formats={formats}
                  placeholder="Menghadirkan jurnalisme data yang mendalam..."
                  style={{ minHeight: '150px' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Vision Section */}
        <div className={`border rounded-lg p-6 ${aboutData.vision_hidden ? 'border-yellow-300 bg-yellow-50 opacity-75' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-medium text-gray-900">Vision Section</h3>
              {aboutData.vision_hidden && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m0 0l3.878 3.878M12 12l3.878-3.878" />
                  </svg>
                  Hidden
                </span>
              )}
            </div>
            <button
              onClick={() => handleInputChange('vision_hidden', !aboutData.vision_hidden)}
              className={`p-2 rounded-lg ${aboutData.vision_hidden ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-100' : 'text-green-500 hover:text-green-600 bg-green-100'}`}
              title={aboutData.vision_hidden ? "Show Section" : "Hide Section"}
            >
              {aboutData.vision_hidden ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m0 0l3.878 3.878M12 12l3.878-3.878" />
                </svg>
              )}
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vision Title</label>
              <input
                type="text"
                value={aboutData.vision_title}
                onChange={(e) => handleInputChange('vision_title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Visi Kami"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vision Content</label>
              <div className="prose-editor">
                <ReactQuill
                  ref={visionQuillRef}
                  theme="snow"
                  value={aboutData.vision_content}
                  onChange={(content) => handleInputChange('vision_content', content)}
                  onFocus={() => { activeEditorRef.current = visionQuillRef.current; }}
                  modules={modules}
                  formats={formats}
                  placeholder="Menjadi media digital terdepan yang menginspirasi transformasi sosial..."
                  style={{ minHeight: '100px' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className={`border rounded-lg p-6 ${aboutData.values_hidden ? 'border-yellow-300 bg-yellow-50 opacity-75' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-medium text-gray-900">Values Section</h3>
              {aboutData.values_hidden && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m0 0l3.878 3.878M12 12l3.878-3.878" />
                  </svg>
                  Hidden
                </span>
              )}
            </div>
            <button
              onClick={() => handleInputChange('values_hidden', !aboutData.values_hidden)}
              className={`p-2 rounded-lg ${aboutData.values_hidden ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-100' : 'text-green-500 hover:text-green-600 bg-green-100'}`}
              title={aboutData.values_hidden ? "Show Section" : "Hide Section"}
            >
              {aboutData.values_hidden ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m0 0l3.878 3.878M12 12l3.878-3.878" />
                </svg>
              )}
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Values Title</label>
              <input
                type="text"
                value={aboutData.values_title}
                onChange={(e) => handleInputChange('values_title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nilai-Nilai Kami"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Values Content</label>
              <div className="prose-editor">
                <ReactQuill
                  ref={valuesQuillRef}
                  theme="snow"
                  value={aboutData.values_content}
                  onChange={(content) => handleInputChange('values_content', content)}
                  onFocus={() => { activeEditorRef.current = valuesQuillRef.current; }}
                  modules={modules}
                  formats={formats}
                  placeholder="Solusi komprehensif untuk kebutuhan media digital Anda..."
                  style={{ minHeight: '150px' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className={`border rounded-lg p-6 ${aboutData.team_hidden ? 'border-yellow-300 bg-yellow-50 opacity-75' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-medium text-gray-900">Team Section</h3>
              {aboutData.team_hidden && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m0 0l3.878 3.878M12 12l3.878-3.878" />
                  </svg>
                  Hidden
                </span>
              )}
            </div>
            <button
              onClick={() => handleInputChange('team_hidden', !aboutData.team_hidden)}
              className={`p-2 rounded-lg ${aboutData.team_hidden ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-100' : 'text-green-500 hover:text-green-600 bg-green-100'}`}
              title={aboutData.team_hidden ? "Show Section" : "Hide Section"}
            >
              {aboutData.team_hidden ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m0 0l3.878 3.878M12 12l3.878-3.878" />
                </svg>
              )}
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Team Title</label>
              <input
                type="text"
                value={aboutData.team_title}
                onChange={(e) => handleInputChange('team_title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tim Kami"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Team Content</label>
              <div className="prose-editor">
                <ReactQuill
                  ref={teamQuillRef}
                  theme="snow"
                  value={aboutData.team_content}
                  onChange={(content) => handleInputChange('team_content', content)}
                  onFocus={() => { activeEditorRef.current = teamQuillRef.current; }}
                  modules={modules}
                  formats={formats}
                  placeholder="Describe your team..."
                  style={{ minHeight: '120px' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Sections */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Custom Sections</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                <span>Add custom sections with your own colors and icons</span>
                {aboutData.dynamic_sections.length > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {aboutData.dynamic_sections.filter(s => !s.hidden).length} Visible
                    </span>
                    {aboutData.dynamic_sections.filter(s => s.hidden).length > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {aboutData.dynamic_sections.filter(s => s.hidden).length} Hidden
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={addDynamicSection}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Section
            </button>
          </div>

          {aboutData.dynamic_sections.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p>No custom sections yet. Click "Add Section" to create your first custom section.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {aboutData.dynamic_sections.map((section, index) => (
                <div key={section.id} className={`border rounded-lg p-4 ${section.hidden ? 'border-yellow-300 bg-yellow-50 opacity-75' : 'border-gray-200 bg-gray-50'}`}>
                  {/* Section Header with Controls */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      {/* Hidden Status Badge */}
                      {section.hidden && (
                        <div className="mb-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m0 0l3.878 3.878M12 12l3.878-3.878" />
                            </svg>
                            Hidden Section
                          </span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Title */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
                          <input
                            type="text"
                            value={section.title}
                            onChange={(e) => updateDynamicSection(section.id, 'title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Section Title"
                          />
                        </div>

                        {/* Color Picker */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                          <select
                            value={section.color}
                            onChange={(e) => updateDynamicSection(section.id, 'color', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {SECTION_COLORS.map(color => (
                              <option key={color.value} value={color.value}>{color.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Icon Picker */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                          <select
                            value={section.icon}
                            onChange={(e) => updateDynamicSection(section.id, 'icon', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {SECTION_ICONS.map(icon => (
                              <option key={icon.value} value={icon.value}>{icon.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => updateDynamicSection(section.id, 'hidden', !section.hidden)}
                        className={`p-1 ${section.hidden ? 'text-yellow-500 hover:text-yellow-600' : 'text-green-500 hover:text-green-600'}`}
                        title={section.hidden ? "Show Section" : "Hide Section"}
                      >
                        {section.hidden ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m0 0l3.878 3.878M12 12l3.878-3.878" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => moveDynamicSection(section.id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move Up"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => moveDynamicSection(section.id, 'down')}
                        disabled={index === aboutData.dynamic_sections.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move Down"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => removeDynamicSection(section.id)}
                        className="p-1 text-red-400 hover:text-red-600"
                        title="Delete Section"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Content Editor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Section Content</label>
                    <div className="prose-editor">
                      <ReactQuill
                        theme="snow"
                        value={section.content}
                        onChange={(content) => updateDynamicSection(section.id, 'content', content)}
                        modules={modules}
                        formats={formats}
                        placeholder="Enter section content..."
                        style={{ minHeight: '120px' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Save Button (bottom) */}
      <div className="mt-8 flex justify-end space-x-3">
        {hasChanges() && (
          <button
            onClick={handleReset}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset All Changes
          </button>
        )}
        <button
          onClick={handleSaveClick}
          disabled={saving || !hasChanges()}
          className={`px-6 py-2 rounded-lg transition-colors ${
            hasChanges()
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {saving ? 'Saving Changes...' : 'Save All Changes'}
        </button>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto w-full">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Preview Changes</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="bg-gradient-to-br from-gray-50 via-white to-orange-50 rounded-lg">
                {/* Main Content */}
                <div className="max-w-4xl mx-auto px-6 py-8">
                  {/* Page Header */}
                  <div className="text-center mb-12 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-100 to-transparent opacity-30 rounded-full blur-3xl"></div>
                    <div className="relative">
                      <div className="flex items-center justify-center mb-4">
                        <div className="w-8 h-1 bg-orange-400 rounded-full"></div>
                        <div className="w-6 h-1 bg-orange-500 mx-2 rounded-full"></div>
                        <div className="w-3 h-1 bg-orange-600 rounded-full"></div>
                      </div>
                      <h1 className="text-2xl lg:text-3xl font-bold text-orange-600 mb-2 tracking-wide">
                        {aboutData.hero_title || 'Tentang Naramakna'}
                      </h1>
                    </div>
                  </div>

                  <div className="space-y-6 text-gray-700 leading-relaxed">
                    {/* Hero Section */}
                    {!aboutData.hero_hidden && (
                    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-orange-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-200 to-transparent rounded-full opacity-20 -translate-y-12 translate-x-12"></div>
                      <div className="relative">
                        <div className="flex items-center mb-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">Siapa Kami?</h3>
                        </div>

                        <div
                          className="text-gray-600 leading-relaxed prose prose-orange max-w-none"
                          dangerouslySetInnerHTML={createMarkup(aboutData.hero_subtitle || 'Platform media digital yang lahir dari kebutuhan akan ruang dialog yang lebih bermakna di era informasi yang serba cepat.')}
                        />

                        <p className="text-gray-600 leading-relaxed mt-4">
                          Di tengah tsunami informasi digital yang sering kali membingungkan, kami berperan sebagai <span className="font-semibold text-blue-600">kompas intelektual</span> yang membantu pembaca menavigasi kompleksitas isu-isu kontemporer. Kami percaya bahwa setiap peristiwa memiliki lapisan makna yang lebih dalam, yang layak untuk dieksplorasi bersama.
                        </p>

                        <div className="bg-gradient-to-r from-orange-50 to-blue-50 p-4 rounded-xl border-l-4 border-orange-500 mt-4">
                          <p className="text-gray-700 font-medium italic">
                            "Media bukan sekadar jendela informasi, tetapi cermin yang merefleksikan kedalaman pemahaman kita terhadap dunia."
                          </p>
                        </div>

                        <p className="text-gray-600 leading-relaxed mt-4">
                          Dengan tagline <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent font-bold">"Cerdas Memaknai"</span>, kami berkomitmen menjadi bagian dari ekosistem media yang sehat, di mana kebenaran, empati, dan dialog konstruktif menjadi fondasi utama dalam setiap karya jurnalistik kami.
                        </p>
                      </div>
                    </div>
                    )}

                    {/* Vision & Mission */}
                    {(!aboutData.vision_hidden || !aboutData.mission_hidden) && (
                    <div className="bg-gradient-to-br from-white to-orange-50 p-8 rounded-2xl shadow-lg border border-orange-100 relative overflow-hidden">
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-200 to-transparent rounded-full opacity-20 -translate-y-16 -translate-x-16"></div>
                      <div className="relative">
                        <div className="text-center mb-6">
                          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mb-3 shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900">Visi & Misi</h3>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="bg-white/70 p-6 rounded-xl shadow-md border border-orange-100">
                            <div className="flex items-center mb-3">
                              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mr-2">
                                <span className="text-white font-bold text-xs">V</span>
                              </div>
                              <h4 className="text-lg font-bold text-orange-600">Visi</h4>
                            </div>
                            <div
                              className="prose prose-orange max-w-none text-sm"
                              dangerouslySetInnerHTML={createMarkup(aboutData.vision_content || 'Menjadi media digital terdepan yang menginspirasi transformasi sosial melalui narasi bermakna.')}
                            />
                          </div>

                          <div className="bg-white/70 p-6 rounded-xl shadow-md border border-blue-100">
                            <div className="flex items-center mb-3">
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                                <span className="text-white font-bold text-xs">M</span>
                              </div>
                              <h4 className="text-lg font-bold text-blue-600">Misi</h4>
                            </div>
                            <div
                              className="prose prose-blue max-w-none text-sm"
                              dangerouslySetInnerHTML={createMarkup(aboutData.mission_content || 'Menghadirkan jurnalisme data yang mendalam dan mudah dipahami untuk memperkaya wawasan publik')}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    )}

                    {/* Services */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 relative overflow-hidden">
                      <div className="absolute top-0 left-1/2 w-48 h-48 bg-gradient-to-r from-orange-100 to-blue-100 rounded-full opacity-20 -translate-y-24 -translate-x-24"></div>
                      <div className="relative">
                        <div className="text-center mb-6">
                          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-3 shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                            </svg>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-1">
                            {aboutData.values_title || 'Layanan Unggulan Kami'}
                          </h3>
                          <p className="text-gray-600">Solusi komprehensif untuk kebutuhan media digital Anda</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Data Intelligence */}
                          <div className="group bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 hover:shadow-lg transition-all duration-300">
                            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            </div>
                            <h4 className="font-bold text-gray-900 mb-2 text-center text-sm">Data Intelligence</h4>
                            <p className="text-gray-600 text-center leading-relaxed text-xs">
                              Riset mendalam dengan metodologi ilmiah dan analisis data yang akurat untuk menghasilkan <span className="font-semibold text-orange-600">insight berkualitas tinggi</span>
                            </p>
                          </div>

                          {/* Creative Storytelling */}
                          <div className="group bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-300">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                              </svg>
                            </div>
                            <h4 className="font-bold text-gray-900 mb-2 text-center text-sm">Creative Storytelling</h4>
                            <p className="text-gray-600 text-center leading-relaxed text-xs">
                              Kreativitas digital yang memadukan <span className="font-semibold text-blue-600">seni visual</span> dengan narasi powerful untuk engagement maksimal
                            </p>
                          </div>

                          {/* Strategic Publishing */}
                          <div className="group bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 hover:shadow-lg transition-all duration-300">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </div>
                            <h4 className="font-bold text-gray-900 mb-2 text-center text-sm">Strategic Publishing</h4>
                            <p className="text-gray-600 text-center leading-relaxed text-xs">
                              Strategi branding holistik dan sistem publishing yang <span className="font-semibold text-green-600">terukur dan berkelanjutan</span> untuk impact jangka panjang
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Team Section */}
                    {(aboutData.team_title || aboutData.team_content) && (
                      <div className="bg-gradient-to-br from-gray-50 to-purple-50 p-8 rounded-2xl shadow-lg border border-purple-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-200 to-transparent rounded-full opacity-30 -translate-y-16 translate-x-16"></div>
                        <div className="relative">
                          <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full mb-3 shadow-lg">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">
                              {aboutData.team_title || 'Tim Kami'}
                            </h3>
                          </div>

                          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md border border-purple-100">
                            <div
                              className="prose prose-purple max-w-none text-center"
                              dangerouslySetInnerHTML={createMarkup(aboutData.team_content || 'Describe your team')}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Dynamic Sections */}
                    {aboutData.dynamic_sections && aboutData.dynamic_sections.length > 0 && aboutData.dynamic_sections.filter(section => !section.hidden).map((section, index) => {
                      const colorMap = {
                        orange: {
                          bg: 'from-orange-50 to-orange-100',
                          border: 'border-orange-200',
                          icon: 'from-orange-500 to-orange-600',
                          text: 'text-orange-600'
                        },
                        blue: {
                          bg: 'from-blue-50 to-blue-100',
                          border: 'border-blue-200',
                          icon: 'from-blue-500 to-blue-600',
                          text: 'text-blue-600'
                        },
                        green: {
                          bg: 'from-green-50 to-green-100',
                          border: 'border-green-200',
                          icon: 'from-green-500 to-green-600',
                          text: 'text-green-600'
                        },
                        purple: {
                          bg: 'from-purple-50 to-purple-100',
                          border: 'border-purple-200',
                          icon: 'from-purple-500 to-purple-600',
                          text: 'text-purple-600'
                        },
                        red: {
                          bg: 'from-red-50 to-red-100',
                          border: 'border-red-200',
                          icon: 'from-red-500 to-red-600',
                          text: 'text-red-600'
                        },
                        pink: {
                          bg: 'from-pink-50 to-pink-100',
                          border: 'border-pink-200',
                          icon: 'from-pink-500 to-pink-600',
                          text: 'text-pink-600'
                        },
                        indigo: {
                          bg: 'from-indigo-50 to-indigo-100',
                          border: 'border-indigo-200',
                          icon: 'from-indigo-500 to-indigo-600',
                          text: 'text-indigo-600'
                        },
                        teal: {
                          bg: 'from-teal-50 to-teal-100',
                          border: 'border-teal-200',
                          icon: 'from-teal-500 to-teal-600',
                          text: 'text-teal-600'
                        }
                      };

                      const iconMap = {
                        info: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
                        users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.239" />,
                        star: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />,
                        heart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />,
                        briefcase: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />,
                        eye: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />,
                        lightning: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />,
                        shield: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      };

                      const colors = colorMap[section.color as keyof typeof colorMap] || colorMap.blue;
                      const icon = iconMap[section.icon as keyof typeof iconMap] || iconMap.info;

                      return (
                        <div key={section.id} className={`bg-gradient-to-br ${colors.bg} p-8 rounded-2xl shadow-lg border ${colors.border} relative overflow-hidden`}>
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/20 to-transparent rounded-full opacity-50 translate-x-16 -translate-y-16"></div>
                          <div className="relative">
                            <div className="text-center mb-6">
                              <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${colors.icon} rounded-full mb-3 shadow-lg`}>
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  {icon}
                                </svg>
                              </div>
                              <h3 className="text-2xl font-bold text-gray-900">{section.title}</h3>
                            </div>

                            <div className="bg-white/70 p-6 rounded-xl shadow-md border border-white/50">
                              <div
                                className={`prose prose-${section.color} max-w-none`}
                                dangerouslySetInnerHTML={createMarkup(section.content)}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  setShowPreview(false);
                  handleSaveClick();
                }}
                disabled={!hasChanges()}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  hasChanges()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Confirmation Modal */}
      {showSaveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Confirm Save Changes</h3>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to save these changes? The content will be updated on the live website immediately.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowSaveConfirm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Saving...' : 'Yes, Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};