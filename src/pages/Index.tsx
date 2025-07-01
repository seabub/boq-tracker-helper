import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteIdInput } from "@/components/SiteIdInput";
import { CaidDataUpload } from "@/components/CaidDataUpload";
import { MatchingResults } from "@/components/MatchingResults";
import { OaidTemplateManager } from "@/components/OaidTemplateManager";
import { CaidBlockSelector } from "@/components/CaidBlockSelector";
import { ExportResults } from "@/components/ExportResults";
import { Database, FileText, GitMerge, Settings, Download, Layers, BookTemplate, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface SiteIdData {
  siteId: string;
  order: number;
}

export interface CaidData {
  siteId: string;
  caid: string;
}

export interface MatchedData {
  siteId: string;
  caid: string;
  order: number;
}

export interface OaidTemplate {
  id: string;
  oaid: string;
  longDescription: string;
  quantity: number;
}

export interface CaidBlockConfig {
  id: string;
  name: string;
  caids: string[];
  selectedTemplates: string[]; // Template IDs
}

export interface FinalData {
  siteId: string;
  caid: string;
  order: number;
  oaid: string;
  longDescription: string;
  quantity: number;
}

// Additional exports for components that need them
export interface OaidData {
  oaid: string;
  quantity: number;
  longDescription: string;
}

export interface OaidCatalogData {
  oaid: string;
  reg: string;
  regAlias: string;
  longDescription: string;
}

export interface CaidBlock {
  id: string;
  name: string;
  caids: string[];
  oaidPattern: OaidData[];
}

const Index = () => {
  const [siteIdList, setSiteIdList] = useState<SiteIdData[]>([]);
  const [caidData, setCaidData] = useState<CaidData[]>([]);
  const [matchedResults, setMatchedResults] = useState<MatchedData[]>([]);
  const [oaidTemplates, setOaidTemplates] = useState<OaidTemplate[]>([]);
  const [caidBlocks, setCaidBlocks] = useState<CaidBlockConfig[]>([]);
  const [finalResults, setFinalResults] = useState<FinalData[]>([]);
  const [activeTab, setActiveTab] = useState("input");

  const handleSiteIdSubmit = (data: SiteIdData[]) => {
    setSiteIdList(data);
    setActiveTab("upload");
  };

  const handleCaidDataUpload = (data: CaidData[]) => {
    setCaidData(data);
    performMatching(siteIdList, data);
    setActiveTab("results");
  };

  const performMatching = (siteIds: SiteIdData[], caidList: CaidData[]) => {
    const matched: MatchedData[] = [];
    
    siteIds.forEach((siteIdItem) => {
      const matchingCaid = caidList.find(
        (caidItem) => caidItem.siteId === siteIdItem.siteId
      );
      
      if (matchingCaid) {
        matched.push({
          siteId: siteIdItem.siteId,
          caid: matchingCaid.caid,
          order: siteIdItem.order
        });
      }
    });

    setMatchedResults(matched);
  };

  const handleTemplatesUpdate = (templates: OaidTemplate[]) => {
    setOaidTemplates(templates);
  };

  const handleBlocksUpdate = (blocks: CaidBlockConfig[]) => {
    setCaidBlocks(blocks);
    generateFinalResults(matchedResults, blocks, oaidTemplates);
    setActiveTab("export");
  };

  const generateFinalResults = (
    matched: MatchedData[], 
    blocks: CaidBlockConfig[], 
    templates: OaidTemplate[]
  ) => {
    const final: FinalData[] = [];
    
    matched.forEach((item) => {
      // Find which block this CAID belongs to
      const block = blocks.find(block => block.caids.includes(item.caid));
      
      if (block) {
        // Apply each selected template from the block
        block.selectedTemplates.forEach((templateId) => {
          const template = templates.find(t => t.id === templateId);
          if (template) {
            final.push({
              siteId: item.siteId,
              caid: item.caid,
              order: item.order,
              oaid: template.oaid,
              longDescription: template.longDescription,
              quantity: template.quantity
            });
          }
        });
      }
    });

    setFinalResults(final);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            CAID-SITE ID Sorting & Matching (Template Management)
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your ordered SITE ID list, match with BOQTracker CAID data, 
            manage OAID templates, and apply them to CAID blocks.
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-6 w-6 text-blue-600" />
              Enhanced Template Management Workflow
            </CardTitle>
            <CardDescription>
              Follow the steps below to process your data with OAID template management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="input" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Input SITE ID
                </TabsTrigger>
                <TabsTrigger value="upload" disabled={siteIdList.length === 0}>
                  <Database className="h-4 w-4" />
                  Upload CAID
                </TabsTrigger>
                <TabsTrigger value="results" disabled={matchedResults.length === 0}>
                  <GitMerge className="h-4 w-4" />
                  Match Results
                </TabsTrigger>
                <TabsTrigger value="templates" disabled={matchedResults.length === 0}>
                  <BookTemplate className="h-4 w-4" />
                  OAID Templates
                </TabsTrigger>
                <TabsTrigger value="blocks" disabled={oaidTemplates.length === 0}>
                  <Layers className="h-4 w-4" />
                  CAID Blocks
                </TabsTrigger>
                <TabsTrigger value="export" disabled={finalResults.length === 0}>
                  <Download className="h-4 w-4" />
                  Export
                </TabsTrigger>
              </TabsList>

              <TabsContent value="input" className="mt-6">
                <SiteIdInput onSubmit={handleSiteIdSubmit} />
              </TabsContent>

              <TabsContent value="upload" className="mt-6">
                <CaidDataUpload onUpload={handleCaidDataUpload} />
              </TabsContent>

              <TabsContent value="results" className="mt-6">
                <MatchingResults 
                  results={matchedResults}
                  onNext={() => setActiveTab("templates")}
                />
              </TabsContent>

              <TabsContent value="templates" className="mt-6">
                <OaidTemplateManager 
                  templates={oaidTemplates}
                  onTemplatesUpdate={handleTemplatesUpdate}
                />
                <div className="flex justify-end mt-6">
                  <Button 
                    onClick={() => setActiveTab("blocks")}
                    className="flex items-center gap-2"
                    disabled={oaidTemplates.length === 0}
                  >
                    Continue to CAID Blocks
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="blocks" className="mt-6">
                <CaidBlockSelector 
                  matchedResults={matchedResults}
                  templates={oaidTemplates}
                  onBlocksUpdate={handleBlocksUpdate}
                />
              </TabsContent>

              <TabsContent value="export" className="mt-6">
                <ExportResults 
                  data={finalResults}
                  oaidPattern={oaidTemplates}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
