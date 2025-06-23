
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings, Plus, X, ArrowRight } from "lucide-react";
import { MatchedData, OaidData } from "@/pages/Index";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface OaidReferenceInputProps {
  matchedResults: MatchedData[];
  onSubmit: (pattern: OaidData[]) => void;
}

export const OaidReferenceInput = ({ 
  matchedResults, 
  onSubmit 
}: OaidReferenceInputProps) => {
  const [selectedReference, setSelectedReference] = useState<MatchedData | null>(null);
  const [oaidPattern, setOaidPattern] = useState<OaidData[]>([
    { oaid: "", quantity: 1 }
  ]);
  const { toast } = useToast();

  const addOaidRow = () => {
    setOaidPattern([...oaidPattern, { oaid: "", quantity: 1 }]);
  };

  const removeOaidRow = (index: number) => {
    if (oaidPattern.length > 1) {
      const newPattern = oaidPattern.filter((_, i) => i !== index);
      setOaidPattern(newPattern);
    }
  };

  const updateOaid = (index: number, field: 'oaid' | 'quantity', value: string | number) => {
    const newPattern = [...oaidPattern];
    newPattern[index] = { ...newPattern[index], [field]: value };
    setOaidPattern(newPattern);
  };

  const handleSubmit = () => {
    // Validate inputs
    const validPattern = oaidPattern.filter(item => item.oaid.trim() !== "");
    
    if (validPattern.length === 0) {
      toast({
        title: "Error",
        description: "Please enter at least one OAID",
        variant: "destructive"
      });
      return;
    }

    if (!selectedReference) {
      toast({
        title: "Error",
        description: "Please select a reference CAID",
        variant: "destructive"
      });
      return;
    }

    onSubmit(validPattern);
    toast({
      title: "Success",
      description: `OAID pattern applied to all ${matchedResults.length} CAIDs`
    });
  };

  const totalRecordsAfterPattern = matchedResults.length * oaidPattern.filter(item => item.oaid.trim() !== "").length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-orange-600" />
            Define OAID Reference Pattern
          </CardTitle>
          <CardDescription>
            Select a reference CAID and define OAID pattern that will be applied to all CAIDs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reference CAID Selection */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">Step 1: Select Reference CAID</Label>
                <p className="text-sm text-gray-600 mt-1">
                  Choose any CAID as reference (pattern will apply to all)
                </p>
              </div>
              
              <div className="border rounded-lg max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Select</TableHead>
                      <TableHead>SITE ID</TableHead>
                      <TableHead>CAID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matchedResults.slice(0, 5).map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <input
                            type="radio"
                            name="reference"
                            checked={selectedReference?.caid === item.caid}
                            onChange={() => setSelectedReference(item)}
                            className="rounded"
                          />
                        </TableCell>
                        <TableCell className="font-mono text-sm">{item.siteId}</TableCell>
                        <TableCell className="font-mono text-sm text-green-600">{item.caid}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {matchedResults.length > 5 && (
                  <div className="p-2 bg-gray-50 text-center text-xs text-gray-600 border-t">
                    ... and {matchedResults.length - 5} more options
                  </div>
                )}
              </div>

              {selectedReference && (
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="font-semibold text-orange-800">Selected Reference:</p>
                  <p className="text-orange-600 font-mono text-sm">
                    {selectedReference.siteId} → {selectedReference.caid}
                  </p>
                </div>
              )}
            </div>

            {/* OAID Pattern Definition */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">Step 2: Define OAID Pattern</Label>
                <p className="text-sm text-gray-600 mt-1">
                  Add OAIDs and quantities for the reference CAID
                </p>
              </div>

              <div className="space-y-3">
                {oaidPattern.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-1">
                      <Input
                        placeholder="Enter OAID"
                        value={item.oaid}
                        onChange={(e) => updateOaid(index, 'oaid', e.target.value)}
                        className="font-mono"
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateOaid(index, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeOaidRow(index)}
                      disabled={oaidPattern.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={addOaidRow}
                  className="flex items-center gap-2 w-full"
                >
                  <Plus className="h-4 w-4" />
                  Add OAID
                </Button>
              </div>

              {oaidPattern.filter(item => item.oaid.trim() !== "").length > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="font-semibold text-blue-800">Pattern Preview:</p>
                  <div className="space-y-1 mt-2">
                    {oaidPattern.filter(item => item.oaid.trim() !== "").map((item, index) => (
                      <div key={index} className="text-blue-600 text-sm font-mono">
                        {item.oaid} (Qty: {item.quantity})
                      </div>
                    ))}
                  </div>
                  <p className="text-blue-600 text-sm mt-2">
                    Total final records: {totalRecordsAfterPattern}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border">
            <h3 className="font-semibold text-gray-800 mb-2">How This Works:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• The OAID pattern you define will be applied to ALL {matchedResults.length} CAIDs</li>
              <li>• Each CAID will be duplicated based on the number of OAIDs you add</li>
              <li>• Final output will contain {totalRecordsAfterPattern} total records</li>
            </ul>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleSubmit}
              disabled={!selectedReference || oaidPattern.filter(item => item.oaid.trim() !== "").length === 0}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
            >
              Generate Final Results
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
