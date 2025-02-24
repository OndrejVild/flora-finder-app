
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Upload, Loader2 } from "lucide-react";

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      toast({
        title: "Please select an image",
        description: "You need to choose an image before uploading",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // For now, we'll just simulate the API call with a timeout
    setTimeout(() => {
      toast({
        title: "Feature coming soon!",
        description: "Plant identification will be implemented in the next step.",
      });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-4">
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-green-800">Flora Finder</h1>
          <p className="text-gray-600">Upload a photo to identify your plant</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg space-y-6">
          <div className="space-y-4">
            <Input
              type="file"
              accept="image/*"
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
              </div>
            )}
          </div>

          <Button
            onClick={handleUpload}
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={!selectedImage || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Identify Plant
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;

