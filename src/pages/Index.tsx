
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteIdInput } from "@/components/SiteIdInput";
import { CaidDataUpload } from "@/components/CaidDataUpload";
import { MatchingResults } from "@/components/MatchingResults";
import { OaidCatalogUpload } from "@/components/OaidCatalogUpload";
import { RegionSelection } from "@/components/RegionSelection";
import { OaidReferenceInputV2 } from "@/components/OaidReferenceInputV2";
import { ExportResults } from "@/components/ExportResults";
import { Database, FileText, GitMerge, Settings, Download, Layers } from "lucide-react";

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

export interface OaidCatalogData {
  oaid: string;
  longDescription: string;
  region: string;
}

export interface OaidData {
  oaid: string;
  quantity: number;
  longDescription: string;
}

export interface FinalData {
  siteId: string;
  caid: string;
  order: number;
  oaid: string;
  quantity: number;
}

const Index = () => {
  const [siteIdList, setSiteIdList] = useState<SiteIdData[]>([]);
  const [caidData, setCaidData] = useState<CaidData[]>([]);
  const [matchedResults, setMatchedResults] = useState<MatchedData[]>([]);
  const [oaidCatalog, setOaidCatalog] = useState<OaidCatalogData[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [oaidPattern, setOaidPattern] = useState<OaidData[]>([]);
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

  const handleOaidCatalogUpload = (catalog: OaidCatalogData[]) => {
    setOaidCatalog(catalog);
    setActiveTab("regions");
  };

  const handleRegionSelection = (regions: string[]) => {
    setSelectedRegions(regions);
    setActiveTab("oaid");
  };

  const handleOaidPatternSubmit = (pattern: OaidData[]) => {
    setOaidPattern(pattern);
    generateFinalResults(matchedResults, pattern);
    setActiveTab("export");
  };

  const generateFinalResults = (matched: MatchedData[], pattern: OaidData[]) => {
    const final: FinalData[] = [];
    
    matched.forEach((item) => {
      pattern.forEach((oaidItem) => {
        final.push({
          siteId: item.siteId,
          caid: item.caid,
          order: item.order,
          oaid: oaidItem.oaid,
          quantity: oaidItem.quantity
        });
      });
    });

    setFinalResults(final);
  };

  const getUniqueRegions = () => {
    const regions = new Set(oaidCatalog.map(item => item.region));
    return Array.from(regions);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            CAID-SITE ID Sorting & Matching with OAID Catalog
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Advanced workflow with OAID catalog integration, multi-region selection, 
            and intelligent OAID matching based on Long Description.
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-6 w-6 text-blue-600" />
              Enhanced Data Processing Workflow
            </CardTitle>
            <CardDescription>
              Follow the steps to process SITE ID, CAID data, and integrate with OAID catalog
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="input" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  SITE ID
                </TabsTrigger>
                <TabsTrigger value="upload" disabled={siteIdList.length === 0}>
                  <Database className="h-4 w-4" />
                  CAID Data
                </TabsTrigger>
                <TabsTrigger value="results" disabled={matchedResults.length === 0}>
                  <GitMerge className="h-4 w-4" />
                  Match Results
                </TabsTrigger>
                <TabsTrigger value="catalog" disabled={matchedResults.length === 0}>
                  <Layers className="h-4 w-4" />
                  OAID Catalog
                </TabsTrigger>
                <TabsTrigger value="regions" disabled={oaidCatalog.length === 0}>
                  <Settings className="h-4 w-4" />
                  Regions
                </TabsTrigger>
                <TabsTrigger value="oaid" disabled={selectedRegions.length === 0}>
                  <Settings className="h-4 w-4" />
                  OAID Pattern
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
                  onNext={() => setActiveTab("catalog")}
                />
              </TabsContent>

              <TabsContent value="catalog" className="mt-6">
                <OaidCatalogUpload 
                  onUpload={handleOaidCatalogUpload}
                />
              </TabsContent>

              <TabsContent value="regions" className="mt-6">
                <RegionSelection 
                  availableRegions={getUniqueRegions()}
                  selectedRegions={selectedRegions}
                  onRegionChange={handleRegionSelection}
                />
              </TabsContent>

              <TabsContent value="oaid" className="mt-6">
                <OaidReferenceInputV2 
                  matchedResults={matchedResults}
                  oaidCatalog={oaidCatalog}
                  selectedRegions={selectedRegions}
                  onSubmit={handleOaidPatternSubmit}
                />
              </TabsContent>

              <TabsContent value="export" className="mt-6">
                <ExportResults 
                  data={finalResults}
                  oaidPattern={oaidPattern}
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
