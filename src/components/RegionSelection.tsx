
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings, ArrowRight, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RegionSelectionProps {
  availableRegions: string[];
  onSelection: (selectedRegions: string[]) => void;
}

export const RegionSelection = ({ availableRegions, onSelection }: RegionSelectionProps) => {
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const { toast } = useToast();

  const handleRegionToggle = (region: string) => {
    setSelectedRegions(prev => 
      prev.includes(region) 
        ? prev.filter(r => r !== region)
        : [...prev, region]
    );
  };

  const selectAllRegions = () => {
    setSelectedRegions(availableRegions);
  };

  const clearAllRegions = () => {
    setSelectedRegions([]);
  };

  const handleContinue = () => {
    if (selectedRegions.length === 0) {
      toast({
        title: "Pilih Region",
        description: "Pilih minimal satu region untuk melanjutkan",
        variant: "destructive"
      });
      return;
    }
    onSelection(selectedRegions);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-green-600" />
            Pilih Region untuk Filter OAID
          </CardTitle>
          <CardDescription>
            Pilih satu atau lebih region yang akan digunakan sebagai filter global untuk pencarian OAID
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50">
                {selectedRegions.length} / {availableRegions.length} Region Dipilih
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={selectAllRegions}
                disabled={selectedRegions.length === availableRegions.length}
              >
                Pilih Semua
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAllRegions}
                disabled={selectedRegions.length === 0}
              >
                Hapus Semua
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {availableRegions.map((region) => (
              <div
                key={region}
                className={`
                  p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md
                  ${selectedRegions.includes(region)
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                `}
                onClick={() => handleRegionToggle(region)}
              >
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={selectedRegions.includes(region)}
                    onChange={() => handleRegionToggle(region)}
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{region}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedRegions.length > 0 && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">Region yang Dipilih:</h3>
              <div className="flex flex-wrap gap-2">
                {selectedRegions.map((region, index) => (
                  <Badge key={index} className="bg-green-100 text-green-800">
                    {region}
                  </Badge>
                ))}
              </div>
              <p className="text-green-600 text-sm mt-2">
                Pencarian OAID akan difokuskan pada region-region ini saja
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <Button 
              onClick={handleContinue}
              className="flex items-center gap-2"
              disabled={selectedRegions.length === 0}
            >
              Continue to CAID Block Management
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
