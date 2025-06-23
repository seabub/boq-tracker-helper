
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, FileSpreadsheet, Copy } from "lucide-react";
import { MatchedData } from "@/pages/Index";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface ExportResultsProps {
  data: MatchedData[];
  duplicateCount: number;
}

export const ExportResults = ({ data, duplicateCount }: ExportResultsProps) => {
  const { toast } = useToast();

  const downloadAsCSV = () => {
    const csvContent = [
      'Order,SITE_ID,CAID',
      ...data.map(item => `${item.order},${item.siteId},${item.caid}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `caid-site-matching-results.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast({
      title: "Download Started",
      description: "CSV file has been downloaded successfully"
    });
  };

  const downloadAsText = () => {
    const textContent = data.map(item => `${item.siteId}\t${item.caid}`).join('\n');

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `caid-site-matching-results.txt`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast({
      title: "Download Started",
      description: "Text file has been downloaded successfully"
    });
  };

  const copyToClipboard = () => {
    const textContent = data.map(item => `${item.siteId}\t${item.caid}`).join('\n');
    navigator.clipboard.writeText(textContent).then(() => {
      toast({
        title: "Copied to Clipboard",
        description: "Results have been copied to your clipboard"
      });
    });
  };

  const uniquePairs = data.length / duplicateCount;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-orange-600" />
            Export Final Results
          </CardTitle>
          <CardDescription>
            Download or copy your processed SITE ID and CAID data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200 text-center">
              <div className="text-2xl font-bold text-orange-800">{data.length}</div>
              <div className="text-orange-600 text-sm">Total Records</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
              <div className="text-2xl font-bold text-blue-800">{uniquePairs}</div>
              <div className="text-blue-600 text-sm">Unique Pairs</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
              <div className="text-2xl font-bold text-green-800">{duplicateCount}×</div>
              <div className="text-green-600 text-sm">Duplication</div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Export Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button 
                onClick={downloadAsCSV}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Download CSV
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
                    <TableHead>Copy #</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.slice(0, 15).map((item, index) => {
                    const copyNumber = (index % duplicateCount) + 1;
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-mono">{item.order}</TableCell>
                        <TableCell className="font-mono">{item.siteId}</TableCell>
                        <TableCell className="font-mono text-green-600">{item.caid}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            Copy {copyNumber}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
