
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { GitMerge, Copy, ArrowRight } from "lucide-react";
import { MatchedData } from "@/pages/Index";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface MatchingResultsProps {
  results: MatchedData[];
  duplicateCount: number;
  onDuplicateCountChange: (count: number) => void;
}

export const MatchingResults = ({ 
  results, 
  duplicateCount, 
  onDuplicateCountChange 
}: MatchingResultsProps) => {
  const totalFinalRecords = results.length * duplicateCount;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitMerge className="h-5 w-5 text-purple-600" />
            Matching Results
          </CardTitle>
          <CardDescription>
            Review the matched SITE ID and CAID pairs, then set duplication count
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <div>
              <h3 className="font-semibold text-green-800">Matching Summary</h3>
              <p className="text-green-600">
                Successfully matched {results.length} SITE ID(s) with their corresponding CAIDs
              </p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {results.length} Matches
            </Badge>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="space-y-1">
                <Label htmlFor="duplicateCount">Duplication Count</Label>
                <Input
                  id="duplicateCount"
                  type="number"
                  min="1"
                  max="100"
                  value={duplicateCount}
                  onChange={(e) => onDuplicateCountChange(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Copy className="h-4 w-4" />
                <span>Each pair will be duplicated {duplicateCount} time(s)</span>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-800 font-semibold">
                Final Output: {totalFinalRecords} total records
              </p>
              <p className="text-blue-600 text-sm">
                {results.length} unique pairs × {duplicateCount} duplicates = {totalFinalRecords} records
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Matched Data Preview</Label>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>SITE ID</TableHead>
                    <TableHead>CAID</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.slice(0, 10).map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono">{item.order}</TableCell>
                      <TableCell className="font-mono">{item.siteId}</TableCell>
                      <TableCell className="font-mono text-green-600">{item.caid}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Matched
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {results.length > 10 && (
                <div className="p-3 bg-gray-50 text-center text-sm text-gray-600 border-t">
                  ... and {results.length - 10} more matched records
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
