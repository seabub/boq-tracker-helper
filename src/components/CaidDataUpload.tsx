
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, Database, ArrowRight, FileSpreadsheet } from "lucide-react";
import { CaidData } from "@/pages/Index";
import { useToast } from "@/hooks/use-toast";

interface CaidDataUploadProps {
  onUpload: (data: CaidData[]) => void;
}

export const CaidDataUpload = ({ onUpload }: CaidDataUploadProps) => {
  const [inputText, setInputText] = useState("");
  const [previewData, setPreviewData] = useState<CaidData[]>([]);
  const { toast } = useToast();

  const parseInput = (text: string): CaidData[] => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    const data: CaidData[] = [];

    lines.forEach((line, index) => {
      // Handle CSV format: SITE_ID,CAID or tab-separated
      const parts = line.split(/[,\t]/).map(part => part.trim());
      
      if (parts.length >= 2) {
        data.push({
          siteId: parts[0],
          caid: parts[1]
        });
      }
    });

    return data;
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
        description: "Please enter CAID data in the correct format",
        variant: "destructive"
      });
      return;
    }

    onUpload(previewData);
    toast({
      title: "Success",
      description: `${previewData.length} CAID records uploaded successfully`
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
            <Database className="h-5 w-5 text-green-600" />
            Upload BOQTracker CAID Data
          </CardTitle>
          <CardDescription>
            Upload the exported CAID data from BOQTracker (CSV format: SITE_ID,CAID)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="caidInput">Paste CAID Data (CSV format)</Label>
              <Textarea
                id="caidInput"
                placeholder="Enter CAID data here...&#10;Format: SITE_ID,CAID&#10;Example:&#10;SITE001,CAID123456&#10;SITE002,CAID789012"
                value={inputText}
                onChange={(e) => handleInputChange(e.target.value)}
                className="min-h-[200px] font-mono"
              />
              <p className="text-sm text-gray-500">
                Format: Each line should contain SITE_ID,CAID (comma or tab separated)
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="caidFileUpload">Or upload CSV/Excel file</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-400 transition-colors">
                  <FileSpreadsheet className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <input
                    id="caidFileUpload"
                    type="file"
                    accept=".txt,.csv,.xlsx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('caidFileUpload')?.click()}
                  >
                    Choose File
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    Supports .txt, .csv, and .xlsx files
                  </p>
                </div>
              </div>

              {previewData.length > 0 && (
                <div className="space-y-2">
                  <Label>Preview ({previewData.length} records)</Label>
                  <div className="bg-gray-50 rounded-lg p-3 max-h-[160px] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-gray-600 mb-2 pb-1 border-b">
                      <span>SITE ID</span>
                      <span>CAID</span>
                    </div>
                    {previewData.slice(0, 8).map((item, index) => (
                      <div key={index} className="grid grid-cols-2 gap-2 text-sm py-1">
                        <span className="font-mono">{item.siteId}</span>
                        <span className="font-mono text-green-600">{item.caid}</span>
                      </div>
                    ))}
                    {previewData.length > 8 && (
                      <div className="text-sm text-gray-500 text-center pt-2 border-t">
                        ... and {previewData.length - 8} more records
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
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              Process Matching
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
