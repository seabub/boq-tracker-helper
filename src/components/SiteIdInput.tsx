
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, FileText, ArrowRight } from "lucide-react";
import { SiteIdData } from "@/pages/Index";
import { useToast } from "@/hooks/use-toast";

interface SiteIdInputProps {
  onSubmit: (data: SiteIdData[]) => void;
}

export const SiteIdInput = ({ onSubmit }: SiteIdInputProps) => {
  const [inputText, setInputText] = useState("");
  const [previewData, setPreviewData] = useState<SiteIdData[]>([]);
  const { toast } = useToast();

  const parseInput = (text: string): SiteIdData[] => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    return lines.map((line, index) => ({
      siteId: line.trim(),
      order: index + 1
    }));
  };

  const handleInputChange = (value: string) => {
    setInputText(value);
    if (value.trim()) {
      const parsed = parseInput(value);
      setPreviewData(parsed);
    } else {
      setPreviewData([]);
    }
  };

  const handleSubmit = () => {
    if (previewData.length === 0) {
      toast({
        title: "Error",
        description: "Please enter at least one SITE ID",
        variant: "destructive"
      });
      return;
    }

    onSubmit(previewData);
    toast({
      title: "Success",
      description: `${previewData.length} SITE IDs processed successfully`
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setInputText(content);
        handleInputChange(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Input SITE ID List
          </CardTitle>
          <CardDescription>
            Enter your ordered SITE ID list (one per line) or upload a text file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="siteIdInput">Paste SITE IDs (one per line)</Label>
              <Textarea
                id="siteIdInput"
                placeholder="Enter SITE IDs here...&#10;Example:&#10;SITE001&#10;SITE002&#10;SITE003"
                value={inputText}
                onChange={(e) => handleInputChange(e.target.value)}
                className="min-h-[200px] font-mono"
              />
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fileUpload">Or upload a text file</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <input
                    id="fileUpload"
                    type="file"
                    accept=".txt,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('fileUpload')?.click()}
                  >
                    Choose File
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    Supports .txt and .csv files
                  </p>
                </div>
              </div>

              {previewData.length > 0 && (
                <div className="space-y-2">
                  <Label>Preview ({previewData.length} items)</Label>
                  <div className="bg-gray-50 rounded-lg p-3 max-h-[160px] overflow-y-auto">
                    {previewData.slice(0, 10).map((item, index) => (
                      <div key={index} className="flex justify-between text-sm py-1">
                        <span className="font-mono">{item.siteId}</span>
                        <span className="text-gray-500">#{item.order}</span>
                      </div>
                    ))}
                    {previewData.length > 10 && (
                      <div className="text-sm text-gray-500 text-center pt-2 border-t">
                        ... and {previewData.length - 10} more items
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleSubmit}
              disabled={previewData.length === 0}
              className="flex items-center gap-2"
            >
              Continue to CAID Upload
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
