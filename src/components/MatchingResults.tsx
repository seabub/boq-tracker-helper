
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GitMerge, ArrowRight } from "lucide-react";
import { MatchedData } from "@/pages/Index";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface MatchingResultsProps {
  results: MatchedData[];
  onNext: () => void;
}

export const MatchingResults = ({ 
  results, 
  onNext
}: MatchingResultsProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitMerge className="h-5 w-5 text-purple-600" />
            Matching Results
          </CardTitle>
          <CardDescription>
            Review the matched SITE ID and CAID pairs, then proceed to define OAID pattern
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

          <div className="space-y-2">
            <h3 className="font-semibold">Matched Data Preview</h3>
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

          <div className="flex justify-end">
            <Button 
              onClick={onNext}
              className="flex items-center gap-2"
            >
              Continue to OAID Pattern
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
