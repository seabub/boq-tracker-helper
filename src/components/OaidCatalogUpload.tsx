
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Settings, Upload, ArrowRight, FileSpreadsheet } from "lucide-react";
import { OaidCatalogData } from "@/pages/Index";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface OaidCatalogUploadProps {
  onUpload: (data: OaidCatalogData[]) => void;
}

export const OaidCatalogUpload = ({ onUpload }: OaidCatalogUploadProps) => {
  const [catalogData, setCatalogData] = useState<OaidCatalogData[]>([]);
  const [rawInput, setRawInput] = useState("");
  const { toast } = useToast();

  const sampleCatalogData: OaidCatalogData[] = [
    { oaid: "A001", reg: "JAKARTA", regAlias: "JKT", longDescription: "AC SPLIT 1 PK" },
    { oaid: "A002", reg: "JAKARTA", regAlias: "JKT", longDescription: "AC SPLIT 1.5 PK" },
    { oaid: "A003", reg: "JAKARTA", regAlias: "JKT", longDescription: "AC SPLIT 2 PK" },
    { oaid: "A004", reg: "BANDUNG", regAlias: "BDG", longDescription: "AC SPLIT 1 PK" },
    { oaid: "A005", reg: "BANDUNG", regAlias: "BDG", longDescription: "AC SPLIT 1.5 PK" },
    { oaid: "A006", reg: "SURABAYA", regAlias: "SBY", longDescription: "AC SPLIT 1 PK" },
    { oaid: "B001", reg: "JAKARTA", regAlias: "JKT", longDescription: "KABEL NYA 2.5MM" },
    { oaid: "B002", reg: "JAKARTA", regAlias: "JKT", longDescription: "KABEL NYA 4MM" },
    { oaid: "B003", reg: "BANDUNG", regAlias: "BDG", longDescription: "KABEL NYA 2.5MM" },
    { oaid: "C001", reg: "JAKARTA", regAlias: "JKT", longDescription: "LAMPU LED 10W" },
    { oaid: "C002", reg: "JAKARTA", regAlias: "JKT", longDescription: "LAMPU LED 15W" },
    { oaid: "C003", reg: "SURABAYA", regAlias: "SBY", longDescription: "LAMPU LED 10W" }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const parsedData: OaidCatalogData[] = jsonData.map((row: any) => ({
          oaid: String(row.OAID || row.oaid || '').toString(),
          reg: String(row.REG || row.reg || '').toString(),
          regAlias: String(row['REG Alias'] || row.regAlias || row['REG_ALIAS'] || '').toString(),
          longDescription: String(row['Long Description'] || row.longDescription || row['LONG_DESCRIPTION'] || '').toString()
        }));

        setCatalogData(parsedData);
        toast({
          title: "Katalog OAID Berhasil Diimpor",
          description: `${parsedData.length} item OAID berhasil dimuat dari file Excel`
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal membaca file Excel. Pastikan format file benar.",
          variant: "destructive"
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleTextInput = () => {
    if (!rawInput.trim()) {
      toast({
        title: "Input Kosong",
        description: "Masukkan data katalog OAID terlebih dahulu",
        variant: "destructive"
      });
      return;
    }

    try {
      const lines = rawInput.trim().split('\n');
      const parsedData: OaidCatalogData[] = [];

      lines.forEach((line, index) => {
        if (index === 0) return; // Skip header
        const columns = line.split('\t');
        if (columns.length >= 4) {
          parsedData.push({
            oaid: columns[0].trim(),
            reg: columns[1].trim(),
            regAlias: columns[2].trim(),
            longDescription: columns[3].trim()
          });
        }
      });

      setCatalogData(parsedData);
      toast({
        title: "Katalog OAID Berhasil Diproses",
        description: `${parsedData.length} item OAID berhasil dimuat dari input teks`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memproses input. Pastikan format data benar (tab-separated).",
        variant: "destructive"
      });
    }
  };

  const loadSampleData = () => {
    setCatalogData(sampleCatalogData);
    toast({
      title: "Sample Data Loaded",
      description: `${sampleCatalogData.length} sample OAID items loaded`
    });
  };

  const handleContinue = () => {
    if (catalogData.length === 0) {
      toast({
        title: "Data Kosong",
        description: "Upload katalog OAID terlebih dahulu",
        variant: "destructive"
      });
      return;
    }
    onUpload(catalogData);
  };

  const uniqueRegions = [...new Set(catalogData.map(item => item.reg))];
  const uniqueOaids = catalogData.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            Import Katalog OAID
          </CardTitle>
          <CardDescription>
            Upload file Excel atau paste data katalog OAID (OAID, REG, REG Alias, Long Description)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Upload File Excel</h3>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="catalog-upload"
                />
                <label htmlFor="catalog-upload">
                  <Button variant="outline" className="cursor-pointer" asChild>
                    <span className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      Choose Excel File
                    </span>
                  </Button>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Paste Data (Tab-separated)</h3>
              <div className="space-y-2">
                <Textarea
                  placeholder="OAID	REG	REG Alias	Long Description&#10;A001	JAKARTA	JKT	AC SPLIT 1 PK&#10;A002	JAKARTA	JKT	AC SPLIT 1.5 PK"
                  value={rawInput}
                  onChange={(e) => setRawInput(e.target.value)}
                  rows={3}
                />
                <Button onClick={handleTextInput} variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Process Text Input
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Load Sample Data</h3>
              <Button onClick={loadSampleData} variant="outline">
                Load Sample Catalog
              </Button>
              <p className="text-xs text-gray-500">
                For testing purposes
              </p>
            </div>
          </div>

          {catalogData.length > 0 && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
                  <div className="text-2xl font-bold text-blue-800">{uniqueOaids}</div>
                  <div className="text-blue-600 text-sm">Total OAIDs</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
                  <div className="text-2xl font-bold text-green-800">{uniqueRegions.length}</div>
                  <div className="text-green-600 text-sm">Regions</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 text-center col-span-2 md:col-span-1">
                  <div className="text-sm font-semibold text-purple-800 mb-2">Available Regions:</div>
                  <div className="flex flex-wrap gap-1">
                    {uniqueRegions.slice(0, 3).map((region, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {region}
                      </Badge>
                    ))}
                    {uniqueRegions.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{uniqueRegions.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Catalog Preview</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>OAID</TableHead>
                        <TableHead>Region</TableHead>
                        <TableHead>REG Alias</TableHead>
                        <TableHead>Long Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {catalogData.slice(0, 10).map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-blue-600">{item.oaid}</TableCell>
                          <TableCell className="font-mono text-green-600">{item.reg}</TableCell>
                          <TableCell className="font-mono">{item.regAlias}</TableCell>
                          <TableCell className="text-gray-700">{item.longDescription}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {catalogData.length > 10 && (
                    <div className="p-3 bg-gray-50 text-center text-sm text-gray-600 border-t">
                      ... and {catalogData.length - 10} more catalog items
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleContinue}
                  className="flex items-center gap-2"
                >
                  Continue to Region Selection
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
