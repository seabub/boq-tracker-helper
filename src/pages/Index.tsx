
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteIdInput } from "@/components/SiteIdInput";
import { CaidDataUpload } from "@/components/CaidDataUpload";
import { MatchingResults } from "@/components/MatchingResults";
import { ExportResults } from "@/components/ExportResults";
import { Database, FileText, GitMerge, Download } from "lucide-react";

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

const Index = () => {
  const [siteIdList, setSiteIdList] = useState<SiteIdData[]>([]);
  const [caidData, setCaidData] = useState<CaidData[]>([]);
  const [matchedResults, setMatchedResults] = useState<MatchedData[]>([]);
  const [duplicateCount, setDuplicateCount] = useState<number>(1);
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

  const getFinalResults = () => {
    const duplicated: MatchedData[] = [];
    matchedResults.forEach((item) => {
      for (let i = 0; i < duplicateCount; i++) {
        duplicated.push({ ...item });
      }
    });
    return duplicated;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            CAID-SITE ID Sorting & Matching
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your ordered SITE ID list, match with BOQTracker CAID data, 
            and generate duplicated results for your workflow.
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-6 w-6 text-blue-600" />
              Data Processing Workflow
            </CardTitle>
            <CardDescription>
              Follow the steps below to process your SITE ID and CAID data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="input" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Input SITE ID
                </TabsTrigger>
                <TabsTrigger value="upload" disabled={siteIdList.length === 0}>
                  <Database className="h-4 w-4" />
                  Upload CAID Data
                </TabsTrigger>
                <TabsTrigger value="results" disabled={matchedResults.length === 0}>
                  <GitMerge className="h-4 w-4" />
                  Match Results
                </TabsTrigger>
                <TabsTrigger value="export" disabled={matchedResults.length === 0}>
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
                  duplicateCount={duplicateCount}
                  onDuplicateCountChange={setDuplicateCount}
                />
              </TabsContent>

              <TabsContent value="export" className="mt-6">
                <ExportResults 
                  data={getFinalResults()}
                  duplicateCount={duplicateCount}
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
