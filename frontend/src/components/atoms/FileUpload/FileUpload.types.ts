export interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onUpload: (file: File) => Promise<void>;
  accept?: string;
  maxSize?: number;
  preview?: string | null;
  uploading?: boolean;
  className?: string;
}
