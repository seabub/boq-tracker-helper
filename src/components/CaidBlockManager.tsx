
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Layers, Plus, Trash2, ArrowRight, Search } from "lucide-react";
import { MatchedData, OaidCatalogData, CaidBlock, OaidData } from "@/pages/Index";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface CaidBlockManagerProps {
  matchedResults: MatchedData[];
  oaidCatalog: OaidCatalogData[];
  selectedRegions: string[];
  onBlocksUpdate: (blocks: CaidBlock[]) => void;
}

export const CaidBlockManager = ({ 
  matchedResults, 
  oaidCatalog, 
  selectedRegions, 
  onBlocksUpdate 
}: CaidBlockManagerProps) => {
  const [blocks, setBlocks] = useState<CaidBlock[]>([]);
  const [currentBlock, setCurrentBlock] = useState<Partial<CaidBlock>>({
    name: '',
    caids: [],
    oaidPattern: []
  });
  const [caidRange, setCaidRange] = useState({ start: '', end: '' });
  const [longDescInput, setLongDescInput] = useState('');
  const [quantityInput, setQuantityInput] = useState<number>(1);
  const [searchResults, setSearchResults] = useState<OaidCatalogData[]>([]);
  const { toast } = useToast();

  const availableCAIDs = matchedResults.map(item => item.caid);
  const usedCAIDs = blocks.flatMap(block => block.caids);
  const unusedCAIDs = availableCAIDs.filter(caid => !usedCAIDs.includes(caid));

  const handleRangeSelect = () => {
    if (!caidRange.start || !caidRange.end) {
      toast({
        title: "Range tidak lengkap",
        description: "Masukkan CAID awal dan akhir",
        variant: "destructive"
      });
      return;
    }

    const startIndex = availableCAIDs.findIndex(caid => caid === caidRange.start);
    const endIndex = availableCAIDs.findIndex(caid => caid === caidRange.end);

    if (startIndex === -1 || endIndex === -1) {
      toast({
        title: "CAID tidak ditemukan",
        description: "Pastikan CAID awal dan akhir ada dalam daftar",
        variant: "destructive"
      });
      return;
    }

    if (startIndex > endIndex) {
      toast({
        title: "Range tidak valid",
        description: "CAID awal harus sebelum CAID akhir",
        variant: "destructive"
      });
      return;
    }

    const rangeCAIDs = availableCAIDs.slice(startIndex, endIndex + 1);
    const availableInRange = rangeCAIDs.filter(caid => !usedCAIDs.includes(caid));

    setCurrentBlock(prev => ({
      ...prev,
      caids: [...(prev.caids || []), ...availableInRange]
    }));

    toast({
      title: "CAID Range Added",
      description: `${availableInRange.length} CAIDs added to current block`
    });
  };

  const searchOAID = (longDesc: string) => {
    if (!longDesc.trim()) return;

    const filteredCatalog = oaidCatalog.filter(item => 
      selectedRegions.includes(item.reg) &&
      item.longDescription.toLowerCase().includes(longDesc.toLowerCase())
    );

    setSearchResults(filteredCatalog);
  };

  const addOAIDPattern = (selectedOaid: OaidCatalogData) => {
    const newOaidData: OaidData = {
      oaid: selectedOaid.oaid,
      quantity: quantityInput,
      longDescription: selectedOaid.longDescription
    };

    setCurrentBlock(prev => ({
      ...prev,
      oaidPattern: [...(prev.oaidPattern || []), newOaidData]
    }));

    setLongDescInput('');
    setQuantityInput(1);
    setSearchResults([]);

    toast({
      title: "OAID Pattern Added",
      description: `${selectedOaid.oaid} added with quantity ${quantityInput}`
    });
  };

  const saveCurrentBlock = () => {
    if (!currentBlock.name || !currentBlock.caids?.length || !currentBlock.oaidPattern?.length) {
      toast({
        title: "Block tidak lengkap",
        description: "Pastikan nama, CAID, dan pola OAID sudah diisi",
        variant: "destructive"
      });
      return;
    }

    const newBlock: CaidBlock = {
      id: `block_${Date.now()}`,
      name: currentBlock.name,
      caids: currentBlock.caids,
      oaidPattern: currentBlock.oaidPattern
    };

    setBlocks(prev => [...prev, newBlock]);
    setCurrentBlock({ name: '', caids: [], oaidPattern: [] });
    setCaidRange({ start: '', end: '' });

    toast({
      title: "Block Saved",
      description: `Block "${newBlock.name}" berhasil disimpan`
    });
  };

  const deleteBlock = (blockId: string) => {
    setBlocks(prev => prev.filter(block => block.id !== blockId));
  };

  const handleFinish = () => {
    if (blocks.length === 0) {
      toast({
        title: "Tidak ada block",
        description: "Buat minimal satu CAID block terlebih dahulu",
        variant: "destructive"
      });
      return;
    }

    const totalCAIDsInBlocks = blocks.reduce((sum, block) => sum + block.caids.length, 0);
    const unassignedCAIDs = availableCAIDs.length - totalCAIDsInBlocks;

    if (unassignedCAIDs > 0) {
      toast({
        title: "Warning",
        description: `${unassignedCAIDs} CAID belum diassign ke block manapun`,
      });
    }

    onBlocksUpdate(blocks);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-purple-600" />
            CAID Block Management
          </CardTitle>
          <CardDescription>
            Kelompokkan CAID dan definisikan pola OAID untuk setiap blok
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Block Editor */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="font-semibold mb-4">Create New CAID Block</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label>Block Name</Label>
                <Input
                  value={currentBlock.name || ''}
                  onChange={(e) => setCurrentBlock(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., AC Equipment Block"
                />
              </div>
            </div>

            {/* CAID Selection */}
            <div className="space-y-4">
              <div>
                <Label>Select CAID Range</Label>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input
                      placeholder="Start CAID"
                      value={caidRange.start}
                      onChange={(e) => setCaidRange(prev => ({ ...prev, start: e.target.value }))}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="End CAID"
                      value={caidRange.end}
                      onChange={(e) => setCaidRange(prev => ({ ...prev, end: e.target.value }))}
                    />
                  </div>
                  <Button onClick={handleRangeSelect} variant="outline">
                    Add Range
                  </Button>
                </div>
              </div>

              {currentBlock.caids && currentBlock.caids.length > 0 && (
                <div>
                  <Label>Selected CAIDs ({currentBlock.caids.length})</Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {currentBlock.caids.slice(0, 10).map((caid, index) => (
                      <Badge key={index} variant="outline">{caid}</Badge>
                    ))}
                    {currentBlock.caids.length > 10 && (
                      <Badge variant="outline">+{currentBlock.caids.length - 10} more</Badge>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* OAID Pattern Definition */}
            <div className="space-y-4">
              <Label>Define OAID Pattern</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Long Description"
                  value={longDescInput}
                  onChange={(e) => {
                    setLongDescInput(e.target.value);
                    searchOAID(e.target.value);
                  }}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Qty"
                  value={quantityInput}
                  onChange={(e) => setQuantityInput(Number(e.target.value))}
                  className="w-20"
                  min="1"
                />
                <Button onClick={() => searchOAID(longDescInput)} variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="border rounded-lg p-4 bg-white">
                  <h4 className="font-semibold mb-2">Search Results ({searchResults.length})</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {searchResults.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
                        <div>
                          <div className="font-mono text-sm text-blue-600">{item.oaid}</div>
                          <div className="text-xs text-gray-500">{item.reg} | {item.longDescription}</div>
                        </div>
                        <Button size="sm" onClick={() => addOAIDPattern(item)}>
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentBlock.oaidPattern && currentBlock.oaidPattern.length > 0 && (
                <div>
                  <Label>OAID Pattern ({currentBlock.oaidPattern.length})</Label>
                  <div className="space-y-1 mt-2">
                    {currentBlock.oaidPattern.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white border rounded">
                        <div>
                          <span className="font-mono text-blue-600">{item.oaid}</span>
                          <span className="text-gray-500 ml-2">Qty: {item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button onClick={saveCurrentBlock}>
                <Plus className="h-4 w-4 mr-2" />
                Save Block
              </Button>
            </div>
          </div>

          {/* Saved Blocks */}
          {blocks.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Saved CAID Blocks ({blocks.length})</h3>
              {blocks.map((block) => (
                <div key={block.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{block.name}</h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteBlock(block.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">CAIDs:</span> {block.caids.length}
                    </div>
                    <div>
                      <span className="text-gray-500">OAID Patterns:</span> {block.oaidPattern.length}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
              <div className="text-2xl font-bold text-blue-800">{availableCAIDs.length}</div>
              <div className="text-blue-600 text-sm">Total CAIDs</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
              <div className="text-2xl font-bold text-green-800">{blocks.length}</div>
              <div className="text-green-600 text-sm">Blocks Created</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200 text-center">
              <div className="text-2xl font-bold text-orange-800">{unusedCAIDs.length}</div>
              <div className="text-orange-600 text-sm">Unassigned CAIDs</div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleFinish}
              className="flex items-center gap-2"
              disabled={blocks.length === 0}
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
