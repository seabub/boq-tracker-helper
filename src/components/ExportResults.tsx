import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, FileSpreadsheet, Copy } from "lucide-react";
import { FinalData, OaidData } from "@/pages/Index";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface ExportResultsProps {
  data: FinalData[];
  oaidPattern: OaidData[];
}

export const ExportResults = ({ data, oaidPattern }: ExportResultsProps) => {
  const { toast } = useToast();

  const downloadAsXLSX = () => {
    // Prepare data without siteId and order
    const exportData = data.map(item => ({
      CAID: item.caid,
      OAID: item.oaid,
      Quantity: item.quantity
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "CAID-OAID Results");
    
    XLSX.writeFile(workbook, "final-caid-oaid-results.xlsx");

    toast({
      title: "Download Started",
      description: "XLSX file has been downloaded successfully"
    });
  };

  const downloadAsText = () => {
    const textContent = data.map(item => 
      `${item.caid}\t${item.oaid}\t${item.quantity}`
    ).join('\n');

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `final-caid-oaid-results.txt`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast({
      title: "Download Started",
      description: "Text file has been downloaded successfully"
    });
  };

  const copyToClipboard = () => {
    const textContent = data.map(item => 
      `${item.caid}\t${item.oaid}\t${item.quantity}`
    ).join('\n');
    navigator.clipboard.writeText(textContent).then(() => {
      toast({
        title: "Copied to Clipboard",
        description: "Results have been copied to your clipboard"
      });
    });
  };

  const uniqueSiteIds = new Set(data.map(item => item.siteId)).size;
  const uniqueCAIDs = new Set(data.map(item => item.caid)).size;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-green-600" />
            Export Final Results
          </CardTitle>
          <CardDescription>
            Download or copy your final processed data with CAID, OAID and Quantity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
              <div className="text-2xl font-bold text-green-800">{data.length}</div>
              <div className="text-green-600 text-sm">Total Records</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
              <div className="text-2xl font-bold text-blue-800">{uniqueCAIDs}</div>
              <div className="text-blue-600 text-sm">Unique CAIDs</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 text-center">
              <div className="text-2xl font-bold text-purple-800">{oaidPattern.length}</div>
              <div className="text-purple-600 text-sm">OAID Types</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200 text-center">
              <div className="text-2xl font-bold text-orange-800">{uniqueSiteIds}</div>
              <div className="text-orange-600 text-sm">Unique Sites</div>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="font-semibold text-yellow-800 mb-2">OAID Pattern Applied:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {oaidPattern.map((item, index) => (
                <Badge key={index} variant="outline" className="justify-center">
                  {item.oaid} (Qty: {item.quantity})
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Export Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button 
                onClick={downloadAsXLSX}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Download XLSX
              </Button>
              <Button 
                onClick={downloadAsText}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Download TXT
              </Button>
              <Button 
                onClick={copyToClipboard}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy to Clipboard
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Final Results Preview</h3>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>SITE ID</TableHead>
                    <TableHead>CAID</TableHead>
                    <TableHead>OAID</TableHead>
                    <TableHead>Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.slice(0, 15).map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono">{item.order}</TableCell>
                      <TableCell className="font-mono">{item.siteId}</TableCell>
                      <TableCell className="font-mono text-green-600">{item.caid}</TableCell>
                      <TableCell className="font-mono text-blue-600">{item.oaid}</TableCell>
                      <TableCell className="font-mono text-purple-600">{item.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {data.length > 15 && (
                <div className="p-3 bg-gray-50 text-center text-sm text-gray-600 border-t">
                  ... and {data.length - 15} more records
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
