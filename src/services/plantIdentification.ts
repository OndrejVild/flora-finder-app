
import axios from "axios";

export const identifyPlant = async (base64Image: string, apiKey: string) => {
  const response = await axios.post('https://api.plant.id/v2/identify', {
    images: [base64Image],
    plant_details: ["common_names", "wiki_description", "taxonomy"],
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Api-Key': apiKey
    }
  });
  
  return response.data.suggestions;
};

export const processImages = async (
  files: File[],
  apiKey: string,
  onProgress: (progress: number) => void
): Promise<any[]> => {
  const results = [];
  const total = files.length;
  
  for (let i = 0; i < files.length; i++) {
    try {
      const file = files[i];
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result?.toString().split(',')[1] || '';
          resolve(base64);
        };
        reader.readAsDataURL(file);
      });

      const suggestions = await identifyPlant(base64, apiKey);

      if (suggestions && suggestions.length > 0) {
        results.push(suggestions[0]); // Take the best match for each image
      }

      onProgress(Math.round(((i + 1) / total) * 100));
      
      // Add a small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  }
  return results;
};

