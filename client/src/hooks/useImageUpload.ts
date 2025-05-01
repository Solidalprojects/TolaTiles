// client/src/hooks/useImageUpload.ts
import { useState } from 'react';
import { getStoredAuth } from '../services/auth';

interface ImageUploadOptions {
  endpoint: string;
  parentIdField: string;
  parentId: number;
  isPrimaryField?: string;
  captionField?: string;
}

interface UploadedImage {
  id: number;
  imageUrl: string;
  caption?: string;
  isPrimary: boolean;
}

interface ImageUploadHook {
  selectedFiles: File[];
  previews: string[];
  captions: string[];
  primaryIndex: number;
  isUploading: boolean;
  error: string | null;
  uploadedImages: UploadedImage[];
  
  // Methods
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCaptionChange: (index: number, caption: string) => void;
  setPrimaryImage: (index: number) => void;
  clearSelectedFiles: () => void;
  uploadImages: (options: ImageUploadOptions) => Promise<UploadedImage[]>;
}

/**
 * Custom hook for managing image uploads
 */
export const useImageUpload = (): ImageUploadHook => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [captions, setCaptions] = useState<string[]>([]);
  const [primaryIndex, setPrimaryIndex] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  /**
   * Handle file selection and generate previews
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files);
      setSelectedFiles(fileArray);
      
      // Generate previews
      const newPreviews: string[] = [];
      fileArray.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          newPreviews.push(reader.result as string);
          if (newPreviews.length === fileArray.length) {
            setPreviews([...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
      
      // Initialize captions array with empty strings
      setCaptions(fileArray.map(() => ''));
      
      // Set first image as primary by default
      setPrimaryIndex(0);
    }
  };

  /**
   * Update caption for a specific image
   */
  const handleCaptionChange = (index: number, caption: string) => {
    const newCaptions = [...captions];
    newCaptions[index] = caption;
    setCaptions(newCaptions);
  };

  /**
   * Set a specific image as primary
   */
  const setPrimaryImage = (index: number) => {
    setPrimaryIndex(index);
  };

  /**
   * Clear selected files and reset state
   */
  const clearSelectedFiles = () => {
    setSelectedFiles([]);
    setPreviews([]);
    setCaptions([]);
    setPrimaryIndex(0);
    setError(null);
  };

  /**
   * Upload images to the server
   */
  const uploadImages = async (options: ImageUploadOptions): Promise<UploadedImage[]> => {
    const { endpoint, parentIdField, parentId, isPrimaryField = 'is_primary', captionField = 'caption' } = options;
    
    if (selectedFiles.length === 0) {
      return [];
    }
    
    const token = getStoredAuth().token;
    if (!token) {
      setError('Authentication token required');
      return [];
    }
    
    setIsUploading(true);
    setError(null);
    const uploadedImages: UploadedImage[] = [];
    
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const formData = new FormData();
        formData.append(parentIdField, parentId.toString());
        formData.append('image', selectedFiles[i]);
        
        // Add caption if available
        if (captions[i]) {
          formData.append(captionField, captions[i]);
        }
        
        // Set primary status
        if (i === primaryIndex) {
          formData.append(isPrimaryField, 'true');
        }
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`
          },
          body: formData
        });
        
        if (!response.ok) {
          throw new Error(`Failed to upload image ${i + 1}`);
        }
        
        const data = await response.json();
        
        uploadedImages.push({
          id: data.id,
          imageUrl: data.image_url || data.image,
          caption: data.caption,
          isPrimary: data.is_primary
        });
      }
      
      setUploadedImages(uploadedImages);
      clearSelectedFiles();
      return uploadedImages;
    } catch (err: any) {
      setError(err.message || 'Failed to upload images');
      return [];
    } finally {
      setIsUploading(false);
    }
  };
  
  return {
    selectedFiles,
    previews,
    captions,
    primaryIndex,
    isUploading,
    error,
    uploadedImages,
    handleFileChange,
    handleCaptionChange,
    setPrimaryImage,
    clearSelectedFiles,
    uploadImages
  };
};

export default useImageUpload;