export interface ImageData {
  src: string;
  caption: string;
  index: number;
}

export interface ImagePreviewProps {
  content: string;
  onCaptionChange: (imageSrc: string, caption: string) => void;
  imageCaptions: Record<string, string>;
}

export interface ImageCaption {
  [imageSrc: string]: string;
}