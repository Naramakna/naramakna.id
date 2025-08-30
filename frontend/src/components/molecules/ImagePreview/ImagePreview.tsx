import React, { useState, useEffect } from 'react';

interface ImageData {
  src: string;
  caption: string;
  index: number;
}

interface ImagePreviewProps {
  content: string;
  onCaptionChange: (imageSrc: string, caption: string) => void;
  imageCaptions: Record<string, string>;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  content,
  onCaptionChange,
  imageCaptions
}) => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [captionInput, setCaptionInput] = useState('');

  // Extract images from content
  useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const imgElements = doc.querySelectorAll('img');
    
    const imageList: ImageData[] = [];
    imgElements.forEach((img, index) => {
      if (img.src) {
        imageList.push({
          src: img.src,
          caption: imageCaptions[img.src] || '',
          index
        });
      }
    });
    
    setImages(imageList);
  }, [content, imageCaptions]);

  const handleImageClick = (imageSrc: string) => {
    setSelectedImage(imageSrc);
    setCaptionInput(imageCaptions[imageSrc] || '');
  };

  const handleSaveCaption = () => {
    if (selectedImage) {
      onCaptionChange(selectedImage, captionInput);
      setSelectedImage(null);
      setCaptionInput('');
    }
  };

  const handleCancelCaption = () => {
    setSelectedImage(null);
    setCaptionInput('');
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
        <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Gambar dalam Artikel ({images.length})
      </h3>
      
      <div className="space-y-3">
        {images.map((image, index) => (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
            <div 
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => handleImageClick(image.src)}
            >
              <img
                src={image.src}
                alt={`Article image ${index + 1}`}
                className="w-full h-24 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            
            {image.caption && (
              <div className="p-2 bg-gray-50 text-xs text-gray-600 border-t">
                <strong>Caption:</strong> {image.caption}
              </div>
            )}
            
            {!image.caption && (
              <div className="p-2 bg-gray-50 text-xs text-gray-400 border-t text-center">
                Klik gambar untuk menambah caption
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Caption Modal/Popup */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Tambah Caption Gambar</h4>
            
            <div className="mb-4">
              <img
                src={selectedImage}
                alt="Preview"
                className="w-full h-32 object-cover rounded border"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Caption
              </label>
              <textarea
                value={captionInput}
                onChange={(e) => setCaptionInput(e.target.value)}
                placeholder="Masukkan caption untuk gambar ini..."
                className="w-full p-3 border border-gray-300 rounded-md text-sm resize-none"
                rows={3}
              />
              <div className="text-xs text-gray-500 mt-1">
                {captionInput.length}/200 karakter
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelCaption}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveCaption}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Simpan Caption
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};