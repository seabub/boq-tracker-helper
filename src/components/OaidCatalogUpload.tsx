
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Layers, Upload, FileSpreadsheet } from "lucide-react";
import { OaidCatalogData } from "@/pages/Index";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface OaidCatalogUploadProps {
  onUpload: (data: OaidCatalogData[]) => void;
}

export const OaidCatalogUpload = ({ onUpload }: OaidCatalogUploadProps) => {
  const [catalogData, setCatalogData] = useState<OaidCatalogData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const processedData: OaidCatalogData[] = jsonData.map((row: any) => ({
          oaid: String(row.OAID || row.oaid || '').trim(),
          longDescription: String(row['Long Description'] || row.longDescription || row['LONG DESCRIPTION'] || '').trim(),
          region: String(row.Region || row.region || row.REGION || '').trim()
        })).filter(item => item.oaid && item.longDescription && item.region);

        setCatalogData(processedData);
        
        toast({
          title: "Success",
          description: `OAID Catalog uploaded successfully with ${processedData.length} records`
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to parse the uploaded file. Please check the format.",
          variant: "destructive"
        });
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = () => {
    if (catalogData.length === 0) {
      toast({
        title: "Error",
        description: "Please upload OAID catalog data first",
        variant: "destructive"
      });
      return;
    }

    onUpload(catalogData);
    toast({
      title: "Success",
      description: "OAID Catalog imported successfully"
    });
  };

  const uniqueRegions = new Set(catalogData.map(item => item.region)).size;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-600" />
            Upload OAID Catalog
          </CardTitle>
          <CardDescription>
            Import your OAID catalog with columns: OAID, Long Description, and Region
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="catalog-file" className="text-base font-semibold">
                Select OAID Catalog File (Excel/XLSX)
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                File should contain columns: OAID, Long Description, Region
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button asChild variant="outline" className="cursor-pointer">
                <label htmlFor="catalog-file" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Choose File
                </label>
              </Button>
              <input
                id="catalog-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
              {isUploading && (
                <Badge variant="secondary">Processing...</Badge>
              )}
            </div>
          </div>

          {catalogData.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200 text-center">
                  <div className="text-2xl font-bold text-indigo-800">{catalogData.length}</div>
                  <div className="text-indigo-600 text-sm">Total OAIDs</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 text-center">
                  <div className="text-2xl font-bold text-purple-800">{uniqueRegions}</div>
                  <div className="text-purple-600 text-sm">Unique Regions</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
                  <div className="text-2xl font-bold text-green-800">Ready</div>
                  <div className="text-green-600 text-sm">Status</div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Catalog Preview</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>OAID</TableHead>
                        <TableHead>Long Description</TableHead>
                        <TableHead>Region</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {catalogData.slice(0, 10).map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-sm text-indigo-600">{item.oaid}</TableCell>
                          <TableCell className="text-sm">{item.longDescription}</TableCell>
                          <TableCell className="text-sm">
                            <Badge variant="outline">{item.region}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {catalogData.length > 10 && (
                    <div className="p-3 bg-gray-50 text-center text-sm text-gray-600 border-t">
                      ... and {catalogData.length - 10} more records
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmit}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Import Catalog
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
