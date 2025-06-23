
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings, Plus, X, ArrowRight, Search } from "lucide-react";
import { MatchedData, OaidData, OaidCatalogData } from "@/pages/Index";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OaidReferenceInputV2Props {
  matchedResults: MatchedData[];
  oaidCatalog: OaidCatalogData[];
  selectedRegions: string[];
  onSubmit: (pattern: OaidData[]) => void;
}

interface OaidPatternItem {
  longDescription: string;
  quantity: number;
  selectedOaid?: string;
  searchResults?: OaidCatalogData[];
}

export const OaidReferenceInputV2 = ({ 
  matchedResults, 
  oaidCatalog,
  selectedRegions,
  onSubmit 
}: OaidReferenceInputV2Props) => {
  const [selectedReference, setSelectedReference] = useState<MatchedData | null>(null);
  const [oaidPattern, setOaidPattern] = useState<OaidPatternItem[]>([
    { longDescription: "", quantity: 1 }
  ]);
  const { toast } = useToast();

  const addOaidRow = () => {
    setOaidPattern([...oaidPattern, { longDescription: "", quantity: 1 }]);
  };

  const removeOaidRow = (index: number) => {
    if (oaidPattern.length > 1) {
      const newPattern = oaidPattern.filter((_, i) => i !== index);
      setOaidPattern(newPattern);
    }
  };

  const updatePattern = (index: number, field: keyof OaidPatternItem, value: any) => {
    const newPattern = [...oaidPattern];
    newPattern[index] = { ...newPattern[index], [field]: value };
    setOaidPattern(newPattern);
  };

  const searchOaidInCatalog = (longDescription: string, index: number) => {
    if (!longDescription.trim()) return;

    // Filter catalog by selected regions and search for long description
    const filteredCatalog = oaidCatalog.filter(item => 
      selectedRegions.includes(item.region) &&
      item.longDescription.toLowerCase().includes(longDescription.toLowerCase())
    );

    const newPattern = [...oaidPattern];
    newPattern[index].searchResults = filteredCatalog;

    if (filteredCatalog.length === 1) {
      // Auto-select if only one result
      newPattern[index].selectedOaid = filteredCatalog[0].oaid;
      toast({
        title: "Auto-selected",
        description: `Found unique match: ${filteredCatalog[0].oaid}`
      });
    } else if (filteredCatalog.length > 1) {
      // Show options for multiple results
      toast({
        title: "Multiple matches found",
        description: `Found ${filteredCatalog.length} matching OAIDs. Please select one.`
      });
    } else {
      // No results found
      toast({
        title: "No matches",
        description: "No OAIDs found matching the description in selected regions",
        variant: "destructive"
      });
    }

    setOaidPattern(newPattern);
  };

  const handleSubmit = () => {
    // Validate inputs
    const validPattern = oaidPattern.filter(item => 
      item.longDescription.trim() !== "" && item.selectedOaid
    );
    
    if (validPattern.length === 0) {
      toast({
        title: "Error",
        description: "Please complete at least one OAID pattern with description and selected OAID",
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

    // Convert to final format
    const finalPattern: OaidData[] = validPattern.map(item => ({
      oaid: item.selectedOaid!,
      quantity: item.quantity,
      longDescription: item.longDescription
    }));

    onSubmit(finalPattern);
    toast({
      title: "Success",
      description: `OAID pattern applied to all ${matchedResults.length} CAIDs`
    });
  };

  const totalRecordsAfterPattern = matchedResults.length * oaidPattern.filter(item => 
    item.longDescription.trim() !== "" && item.selectedOaid
  ).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-orange-600" />
            Define OAID Pattern with Catalog Integration
          </CardTitle>
          <CardDescription>
            Select a reference CAID and define OAID pattern using Long Description search from catalog
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <p className="font-semibold text-purple-800">Active Regions:</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {selectedRegions.map((region) => (
                <Badge key={region} variant="outline" className="text-xs">
                  {region}
                </Badge>
              ))}
            </div>
          </div>

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
                  Search OAIDs by Long Description from catalog
                </p>
              </div>

              <div className="space-y-4">
                {oaidPattern.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">OAID Pattern {index + 1}</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeOaidRow(index)}
                        disabled={oaidPattern.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <Input
                          placeholder="Enter Long Description"
                          value={item.longDescription}
                          onChange={(e) => updatePattern(index, 'longDescription', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => searchOaidInCatalog(item.longDescription, index)}
                        disabled={!item.longDescription.trim()}
                        className="flex items-center gap-1"
                      >
                        <Search className="h-3 w-3" />
                        Search
                      </Button>
                    </div>

                    {item.searchResults && item.searchResults.length > 1 && (
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">Select OAID:</Label>
                        <Select
                          value={item.selectedOaid || ""}
                          onValueChange={(value) => updatePattern(index, 'selectedOaid', value)}
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Choose OAID" />
                          </SelectTrigger>
                          <SelectContent>
                            {item.searchResults.map((result, idx) => (
                              <SelectItem key={idx} value={result.oaid}>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono">{result.oaid}</span>
                                  <Badge variant="outline" className="text-xs">{result.region}</Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {item.selectedOaid && (
                      <div className="flex items-center gap-2">
                        <Label className="text-xs">Quantity:</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updatePattern(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-20 text-sm"
                        />
                        <Badge variant="secondary" className="text-xs">
                          Selected: {item.selectedOaid}
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={addOaidRow}
                  className="flex items-center gap-2 w-full"
                >
                  <Plus className="h-4 w-4" />
                  Add OAID Pattern
                </Button>
              </div>

              {oaidPattern.filter(item => item.selectedOaid).length > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="font-semibold text-blue-800">Pattern Preview:</p>
                  <div className="space-y-1 mt-2">
                    {oaidPattern.filter(item => item.selectedOaid).map((item, index) => (
                      <div key={index} className="text-blue-600 text-sm font-mono">
                        {item.selectedOaid} (Qty: {item.quantity})
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
            <h3 className="font-semibold text-gray-800 mb-2">How This Enhanced Workflow Works:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Search OAIDs by Long Description from imported catalog</li>
              <li>• Only OAIDs from selected regions ({selectedRegions.length}) will be available</li>
              <li>• Auto-select when unique match found, choose manually when multiple matches</li>
              <li>• Pattern will be applied to ALL {matchedResults.length} CAIDs</li>
              <li>• Final output will contain {totalRecordsAfterPattern} total records</li>
            </ul>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleSubmit}
              disabled={!selectedReference || oaidPattern.filter(item => item.selectedOaid).length === 0}
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
