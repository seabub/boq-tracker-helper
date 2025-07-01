
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Layers, Plus, Trash2, ArrowRight, MousePointer, CheckSquare } from "lucide-react";
import { MatchedData, OaidTemplate, CaidBlockConfig } from "@/pages/Index";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface CaidBlockSelectorProps {
  matchedResults: MatchedData[];
  templates: OaidTemplate[];
  onBlocksUpdate: (blocks: CaidBlockConfig[]) => void;
}

export const CaidBlockSelector = ({ 
  matchedResults, 
  templates, 
  onBlocksUpdate 
}: CaidBlockSelectorProps) => {
  const [selectedCaids, setSelectedCaids] = useState<string[]>([]);
  const [blocks, setBlocks] = useState<CaidBlockConfig[]>([]);
  const [blockName, setBlockName] = useState('');
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [shiftPressed, setShiftPressed] = useState(false);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const usedCaids = blocks.flatMap(block => block.caids);
  const availableCaids = matchedResults.filter(item => !usedCaids.includes(item.caid));

  const handleCaidClick = (caid: string, index: number, event: React.MouseEvent) => {
    if (event.shiftKey && lastSelectedIndex !== null) {
      // Shift+click for range selection
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      const rangeCAIDs = availableCaids.slice(start, end + 1).map(item => item.caid);
      
      const newSelected = [...new Set([...selectedCaids, ...rangeCAIDs])];
      setSelectedCaids(newSelected);
      
      toast({
        title: "Range Selected",
        description: `${rangeCAIDs.length} CAIDs selected in range`
      });
    } else if (event.ctrlKey || event.metaKey) {
      // Ctrl+click for multi-select
      if (selectedCaids.includes(caid)) {
        setSelectedCaids(selectedCaids.filter(c => c !== caid));
      } else {
        setSelectedCaids([...selectedCaids, caid]);
      }
    } else {
      // Regular click
      setSelectedCaids([caid]);
    }
    
    setLastSelectedIndex(index);
  };

  const handleTemplateSelect = (templateId: string, checked: boolean) => {
    if (checked) {
      setSelectedTemplates([...selectedTemplates, templateId]);
    } else {
      setSelectedTemplates(selectedTemplates.filter(id => id !== templateId));
    }
  };

  const createBlock = () => {
    if (!blockName.trim()) {
      toast({
        title: "Block name required",
        description: "Masukkan nama untuk blok CAID",
        variant: "destructive"
      });
      return;
    }

    if (selectedCaids.length === 0) {
      toast({
        title: "No CAIDs selected",
        description: "Pilih minimal satu CAID untuk blok",
        variant: "destructive"
      });
      return;
    }

    if (selectedTemplates.length === 0) {
      toast({
        title: "No templates selected",
        description: "Pilih minimal satu template OAID untuk blok",
        variant: "destructive"
      });
      return;
    }

    const newBlock: CaidBlockConfig = {
      id: `block_${Date.now()}`,
      name: blockName.trim(),
      caids: [...selectedCaids],
      selectedTemplates: [...selectedTemplates]
    };

    setBlocks([...blocks, newBlock]);
    setSelectedCaids([]);
    setSelectedTemplates([]);
    setBlockName('');
    setLastSelectedIndex(null);

    toast({
      title: "Block Created",
      description: `Block "${newBlock.name}" berhasil dibuat dengan ${newBlock.caids.length} CAIDs`
    });
  };

  const deleteBlock = (blockId: string) => {
    setBlocks(blocks.filter(block => block.id !== blockId));
    toast({
      title: "Block Deleted",
      description: "Block berhasil dihapus"
    });
  };

  const handleFinish = () => {
    if (blocks.length === 0) {
      toast({
        title: "No blocks created",
        description: "Buat minimal satu CAID block terlebih dahulu",
        variant: "destructive"
      });
      return;
    }

    const totalAssignedCAIDs = blocks.reduce((sum, block) => sum + block.caids.length, 0);
    const unassignedCAIDs = matchedResults.length - totalAssignedCAIDs;

    if (unassignedCAIDs > 0) {
      toast({
        title: "Warning",
        description: `${unassignedCAIDs} CAID belum diassign ke block manapun`
      });
    }

    onBlocksUpdate(blocks);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-green-600" />
            CAID Block Selector
          </CardTitle>
          <CardDescription>
            Pilih CAID dan terapkan template OAID ke setiap blok
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Instructions */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Selection Instructions:</h4>
            <div className="text-blue-700 text-sm space-y-1">
              <div className="flex items-center gap-2">
                <MousePointer className="h-3 w-3" />
                <span>Click: Select single CAID</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckSquare className="h-3 w-3" />
                <span>Ctrl+Click: Multi-select CAIDs</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckSquare className="h-3 w-3" />
                <span>Shift+Click: Select range of CAIDs</span>
              </div>
            </div>
          </div>

          {/* CAID Selection Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Available CAIDs ({availableCaids.length})</h3>
              {selectedCaids.length > 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {selectedCaids.length} Selected
                </Badge>
              )}
            </div>

            <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
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
                  {availableCaids.map((item, index) => (
                    <TableRow 
                      key={item.caid}
                      className={`cursor-pointer transition-colors ${
                        selectedCaids.includes(item.caid) 
                          ? 'bg-green-100 hover:bg-green-200' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={(e) => handleCaidClick(item.caid, index, e)}
                    >
                      <TableCell className="font-mono">{item.order}</TableCell>
                      <TableCell className="font-mono">{item.siteId}</TableCell>
                      <TableCell className="font-mono text-blue-600">{item.caid}</TableCell>
                      <TableCell>
                        {selectedCaids.includes(item.caid) ? (
                          <Badge className="bg-green-600">Selected</Badge>
                        ) : (
                          <Badge variant="outline">Available</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Block Configuration */}
          {selectedCaids.length > 0 && (
            <div className="p-4 border rounded-lg bg-gray-50">
              <h3 className="font-semibold mb-4">Create Block from Selected CAIDs</h3>
              
              <div className="space-y-4">
                <div>
                  <Label>Block Name</Label>
                  <Input
                    value={blockName}
                    onChange={(e) => setBlockName(e.target.value)}
                    placeholder="e.g., AC Equipment Block"
                  />
                </div>

                <div>
                  <Label>Select OAID Templates ({selectedTemplates.length} selected)</Label>
                  <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded p-3 bg-white">
                    {templates.map((template) => (
                      <div key={template.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={template.id}
                          checked={selectedTemplates.includes(template.id)}
                          onCheckedChange={(checked) => handleTemplateSelect(template.id, checked as boolean)}
                        />
                        <label htmlFor={template.id} className="text-sm flex-1 cursor-pointer">
                          <span className="font-mono text-blue-600">{template.oaid}</span>
                          <span className="text-gray-600 ml-2">- {template.longDescription}</span>
                          <span className="text-purple-600 ml-2">(Qty: {template.quantity})</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={createBlock} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Block
                </Button>
              </div>
            </div>
          )}

          {/* Created Blocks */}
          {blocks.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Created Blocks ({blocks.length})</h3>
              {blocks.map((block) => {
                const blockTemplates = templates.filter(t => block.selectedTemplates.includes(t.id));
                return (
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
                    <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                      <div>
                        <span className="text-gray-500">CAIDs:</span> {block.caids.length}
                      </div>
                      <div>
                        <span className="text-gray-500">Templates:</span> {blockTemplates.length}
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">
                      <div className="mb-1">Templates: {blockTemplates.map(t => t.oaid).join(', ')}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
              <div className="text-2xl font-bold text-blue-800">{matchedResults.length}</div>
              <div className="text-blue-600 text-sm">Total CAIDs</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
              <div className="text-2xl font-bold text-green-800">{blocks.length}</div>
              <div className="text-green-600 text-sm">Blocks Created</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200 text-center">
              <div className="text-2xl font-bold text-orange-800">{availableCaids.length}</div>
              <div className="text-orange-600 text-sm">Available CAIDs</div>
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
