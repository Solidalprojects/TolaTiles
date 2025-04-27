// client/src/utils/imageUtils.ts

/**
 * Format image URL to ensure it has the correct base path
 * @param imageUrl - The image URL to format
 * @returns Formatted image URL
 */
export const formatImageUrl = (imageUrl: string | undefined): string => {
  if (!imageUrl) {
    return '';
  }
  
  // If the URL already starts with http, return it as is
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // If the URL starts with a slash, make sure there's only one
  const cleanPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  
  // Add the API base URL if needed
  if (!imageUrl.includes('localhost')) {
    return `http://localhost:8000${cleanPath}`;
  }
  
  return imageUrl;
};