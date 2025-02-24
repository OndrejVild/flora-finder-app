
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Upload, Loader2, Download } from "lucide-react";
import axios from "axios";
import * as XLSX from 'xlsx';

const DEFAULT_API_KEY = "JcKbI5tW8Wf8nbsOLf1ty1voZCiCpaGywM9n7kUuBA5QvZxLyI";

const Index = () => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [apiKey, setApiKey] = useState(DEFAULT_API_KEY);
  const [progress, setProgress] = useState(0);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      if (fileArray.length > 1000) {
        toast({
          title: "Too many files",
          description: "Please select up to 1000 images",
          variant: "destructive",
        });
        return;
      }
      setSelectedImages(fileArray);
      if (fileArray.length > 0) {
        const url = URL.createObjectURL(fileArray[0]);
        setPreviewUrl(url);
        setResult(null);
      }
    }
  };

  const handleApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(event.target.value);
  };

  const processImages = async (files: File[]): Promise<any[]> => {
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

        const response = await axios.post('https://api.plant.id/v2/identify', {
          images: [base64],
          plant_details: ["common_names", "wiki_description", "taxonomy"],
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Api-Key': apiKey
          }
        });

        if (response.data.suggestions && response.data.suggestions.length > 0) {
          results.push(response.data.suggestions[0]); // Take the best match for each image
        }

        // Update progress
        setProgress(Math.round(((i + 1) / total) * 100));
        
        // Add a small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error('Error processing image:', error);
        toast({
          title: "Error",
          description: `Failed to process image ${i + 1}. Continuing with remaining images...`,
          variant: "destructive",
        });
      }
    }
    return results;
  };

  const generateExcel = (data: any[]) => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data.map(item => ({
      'Plant Name': item.plant_name,
      'Common Names': item.plant_details?.common_names?.join(', ') || '',
      'Confidence': `${Math.round(item.probability * 100)}%`,
    })));
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Plant Identification Results');
    XLSX.writeFile(workbook, 'plant-identification-results.xlsx');
  };

  const handleUpload = async () => {
    if (selectedImages.length === 0) {
      toast({
        title: "Please select images",
        description: "You need to choose at least one image before uploading",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your Plant.id API key",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);
    try {
      const results = await processImages(selectedImages);
      setResult({ suggestions: results });
      
      if (selectedImages.length > 1) {
        generateExcel(results);
        toast({
          title: "Success!",
          description: "Results have been downloaded as an Excel file.",
        });
      } else {
        toast({
          title: "Plant identified!",
          description: "Check out the results below.",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to identify the plants. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-4">
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-green-800">Flora Finder</h1>
          <p className="text-gray-600">Upload photos to identify your plants</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="apiKey" className="text-sm font-medium text-gray-700">
                Plant.id API Key
              </label>
              <Input
                id="apiKey"
                type="text"
                value={apiKey}
                onChange={handleApiKeyChange}
                placeholder="Enter your Plant.id API key"
                className="w-full"
              />
            </div>

            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            
            {previewUrl && (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="object-contain w-full h-full"
                />
                {selectedImages.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                    +{selectedImages.length - 1} more
                  </div>
                )}
              </div>
            )}

            {isLoading && progress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </div>

          <Button
            onClick={handleUpload}
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={!selectedImages.length || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing {progress}%...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Identify {selectedImages.length > 1 ? `${selectedImages.length} Plants` : 'Plant'}
              </>
            )}
          </Button>

          {result && result.suggestions && result.suggestions.length > 0 && selectedImages.length === 1 && (
            <div className="mt-6 space-y-4">
              <h2 className="text-xl font-semibold text-green-800">Results</h2>
              {result.suggestions.map((suggestion: any, index: number) => (
                <div key={index} className="bg-white/90 rounded-lg p-4 shadow-sm">
                  <h3 className="font-medium text-lg">{suggestion.plant_name}</h3>
                  {suggestion.plant_details?.common_names && (
                    <p className="text-gray-600 text-sm">
                      Common names: {suggestion.plant_details.common_names.join(", ")}
                    </p>
                  )}
                  {suggestion.probability && (
                    <p className="text-sm text-green-600 mt-1">
                      Confidence: {Math.round(suggestion.probability * 100)}%
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;

