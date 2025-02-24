
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Upload, Loader2 } from "lucide-react";
import { ImageUploader } from "@/components/ImageUploader";
import { processImages } from "@/services/plantIdentification";
import { generateExcel } from "@/utils/excelUtils";
import { PlantResults } from "@/components/PlantResults";

const DEFAULT_API_KEY = "JcKbI5tW8Wf8nbsOLf1ty1voZCiCpaGywM9n7kUuBA5QvZxLyI";

const Index = () => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [apiKey, setApiKey] = useState(DEFAULT_API_KEY);
  const [progress, setProgress] = useState(0);

  const handleImagesSelected = (files: File[], preview: string | null) => {
    setSelectedImages(files);
    setPreviewUrl(preview);
    setResult(null);
  };

  const handleApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(event.target.value);
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
      const results = await processImages(selectedImages, apiKey, setProgress);
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

            <ImageUploader onImagesSelected={handleImagesSelected} />
            
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
            <PlantResults suggestions={result.suggestions} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;

