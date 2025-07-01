
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BookTemplate, Plus, Trash2, Edit2, Save, X, ArrowRight } from "lucide-react";
import { OaidTemplate } from "@/pages/Index";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface OaidTemplateManagerProps {
  templates: OaidTemplate[];
  onTemplatesUpdate: (templates: OaidTemplate[]) => void;
}

export const OaidTemplateManager = ({ 
  templates, 
  onTemplatesUpdate 
}: OaidTemplateManagerProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    oaid: '',
    longDescription: '',
    quantity: 1
  });
  const [editingTemplate, setEditingTemplate] = useState({
    oaid: '',
    longDescription: '',
    quantity: 1
  });
  const { toast } = useToast();

  const addTemplate = () => {
    if (!newTemplate.oaid.trim() || !newTemplate.longDescription.trim()) {
      toast({
        title: "Template tidak lengkap",
        description: "OAID dan Long Description harus diisi",
        variant: "destructive"
      });
      return;
    }

    const template: OaidTemplate = {
      id: `template_${Date.now()}`,
      oaid: newTemplate.oaid.trim(),
      longDescription: newTemplate.longDescription.trim(),
      quantity: newTemplate.quantity
    };

    const updatedTemplates = [...templates, template];
    onTemplatesUpdate(updatedTemplates);
    setNewTemplate({ oaid: '', longDescription: '', quantity: 1 });

    toast({
      title: "Template Added",
      description: `OAID template "${template.oaid}" berhasil ditambahkan`
    });
  };

  const startEdit = (template: OaidTemplate) => {
    setEditingId(template.id);
    setEditingTemplate({
      oaid: template.oaid,
      longDescription: template.longDescription,
      quantity: template.quantity
    });
  };

  const saveEdit = () => {
    if (!editingTemplate.oaid.trim() || !editingTemplate.longDescription.trim()) {
      toast({
        title: "Template tidak lengkap",
        description: "OAID dan Long Description harus diisi",
        variant: "destructive"
      });
      return;
    }

    const updatedTemplates = templates.map(template => 
      template.id === editingId 
        ? {
            ...template,
            oaid: editingTemplate.oaid.trim(),
            longDescription: editingTemplate.longDescription.trim(),
            quantity: editingTemplate.quantity
          }
        : template
    );

    onTemplatesUpdate(updatedTemplates);
    setEditingId(null);

    toast({
      title: "Template Updated",
      description: "Template berhasil diperbarui"
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTemplate({ oaid: '', longDescription: '', quantity: 1 });
  };

  const deleteTemplate = (templateId: string) => {
    const updatedTemplates = templates.filter(template => template.id !== templateId);
    onTemplatesUpdate(updatedTemplates);

    toast({
      title: "Template Deleted",
      description: "Template berhasil dihapus"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookTemplate className="h-5 w-5 text-purple-600" />
            OAID Template Management
          </CardTitle>
          <CardDescription>
            Buat dan kelola template OAID yang akan diterapkan ke blok CAID
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Template */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="font-semibold mb-4">Add New OAID Template</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
              <div className="md:col-span-4">
                <Label>OAID</Label>
                <Input
                  placeholder="e.g., OA24-000000001234"
                  value={newTemplate.oaid}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, oaid: e.target.value }))}
                  className="font-mono"
                />
              </div>
              <div className="md:col-span-6">
                <Label>Long Description</Label>
                <Input
                  placeholder="e.g., Installasi Antenna RF (per 3 Antenna)"
                  value={newTemplate.longDescription}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, longDescription: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={newTemplate.quantity}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>

            <Button onClick={addTemplate} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Template
            </Button>
          </div>

          {/* Templates List */}
          {templates.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">OAID Templates ({templates.length})</h3>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  {templates.length} Templates
                </Badge>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">OAID</TableHead>
                      <TableHead>Long Description</TableHead>
                      <TableHead className="w-[100px]">Quantity</TableHead>
                      <TableHead className="w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell>
                          {editingId === template.id ? (
                            <Input
                              value={editingTemplate.oaid}
                              onChange={(e) => setEditingTemplate(prev => ({ ...prev, oaid: e.target.value }))}
                              className="font-mono text-sm"
                            />
                          ) : (
                            <span className="font-mono text-blue-600">{template.oaid}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId === template.id ? (
                            <Input
                              value={editingTemplate.longDescription}
                              onChange={(e) => setEditingTemplate(prev => ({ ...prev, longDescription: e.target.value }))}
                              className="text-sm"
                            />
                          ) : (
                            <span className="text-gray-700">{template.longDescription}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId === template.id ? (
                            <Input
                              type="number"
                              min="1"
                              value={editingTemplate.quantity}
                              onChange={(e) => setEditingTemplate(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                              className="text-sm w-16"
                            />
                          ) : (
                            <Badge variant="outline">{template.quantity}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {editingId === template.id ? (
                              <>
                                <Button size="sm" variant="outline" onClick={saveEdit}>
                                  <Save className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={cancelEdit}>
                                  <X className="h-3 w-3" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button size="sm" variant="outline" onClick={() => startEdit(template)}>
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => deleteTemplate(template.id)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 text-center">
            <div className="text-2xl font-bold text-purple-800">{templates.length}</div>
            <div className="text-purple-600 text-sm">OAID Templates Ready</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
