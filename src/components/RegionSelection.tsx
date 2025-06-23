
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings, MapPin, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RegionSelectionProps {
  availableRegions: string[];
  selectedRegions: string[];
  onRegionChange: (regions: string[]) => void;
}

export const RegionSelection = ({ 
  availableRegions, 
  selectedRegions, 
  onRegionChange 
}: RegionSelectionProps) => {
  const [tempSelectedRegions, setTempSelectedRegions] = useState<string[]>(selectedRegions);
  const { toast } = useToast();

  const handleRegionToggle = (region: string) => {
    setTempSelectedRegions(prev => 
      prev.includes(region) 
        ? prev.filter(r => r !== region)
        : [...prev, region]
    );
  };

  const handleSelectAll = () => {
    setTempSelectedRegions(availableRegions);
  };

  const handleClearAll = () => {
    setTempSelectedRegions([]);
  };

  const handleSubmit = () => {
    if (tempSelectedRegions.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one region",
        variant: "destructive"
      });
      return;
    }

    onRegionChange(tempSelectedRegions);
    toast({
      title: "Success",
      description: `Selected ${tempSelectedRegions.length} region(s) for OAID filtering`
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Select Regions for OAID Filtering
          </CardTitle>
          <CardDescription>
            Choose one or more regions to filter OAID catalog. Only OAIDs from selected regions will be available for matching.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSelectAll}
              >
                Select All
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleClearAll}
              >
                Clear All
              </Button>
            </div>
            <Badge variant="secondary">
              {tempSelectedRegions.length} of {availableRegions.length} selected
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableRegions.map((region) => (
              <div 
                key={region} 
                className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                  tempSelectedRegions.includes(region) 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleRegionToggle(region)}
              >
                <Checkbox
                  checked={tempSelectedRegions.includes(region)}
                  onChange={() => handleRegionToggle(region)}
                />
                <span className="font-medium text-sm">{region}</span>
              </div>
            ))}
          </div>

          {tempSelectedRegions.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">Selected Regions:</h3>
              <div className="flex flex-wrap gap-2">
                {tempSelectedRegions.map((region) => (
                  <Badge key={region} variant="secondary" className="bg-blue-100 text-blue-800">
                    {region}
                  </Badge>
                ))}
              </div>
              <p className="text-blue-600 text-sm mt-2">
                OAID searches will be limited to these regions only
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <Button 
              onClick={handleSubmit}
              disabled={tempSelectedRegions.length === 0}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              Continue with Selected Regions
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
