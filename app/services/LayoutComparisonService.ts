// LayoutComparisonService coordinates fetching from both preview and published environments
import { ClientSDK } from "@sitecore-marketplace-sdk/client";
import { PreviewService, LayoutData } from "./PreviewService";
import { ExperienceEdgeService } from "./ExperienceEdgeService";

export interface ComparisonResult {
  preview: LayoutData;
  published: LayoutData;
  itemInfo?: {
    name: string;
    displayName?: string;
    path: string;
  };
}

export interface ApplicationContext {
  id: string;
  name: string;
  resourceAccess: Array<{
    resourceId: string;
    tenantId: string;
    tenantName: string;
    context: {
      live: string;
      preview: string;
    };
  }>;
}

export class LayoutComparisonService {
  private previewService: PreviewService;
  private experienceEdgeService: ExperienceEdgeService | null = null;
  private applicationContext: ApplicationContext | null = null;

  constructor(private client: ClientSDK) {
    this.previewService = new PreviewService(client);
  }

  /**
   * Normalize layout JSON to ensure consistent structure for comparison
   * Extracts only the sitecore.route object for focused comparison
   */
  private normalizeLayoutJson(input: string | any): string {
    try {
      let parsed;
      
      // Handle both string and object inputs
      if (typeof input === 'string') {
        parsed = JSON.parse(input);
      } else if (typeof input === 'object' && input !== null) {
        parsed = input;
      } else {
        return String(input);
      }
      
      // Extract only the sitecore.route object for comparison
      if (parsed.sitecore?.route) {
        console.log("XMC_ITEM_DIFF - Extracting route data for comparison");
        return JSON.stringify(parsed.sitecore.route, null, 2);
      }
      
      // Fallback: if no sitecore.route found, return the whole object
      console.warn("XMC_ITEM_DIFF - No sitecore.route found, returning full object");
      return JSON.stringify(parsed, null, 2);
    } catch (error) {
      console.warn("XMC_ITEM_DIFF - Failed to normalize JSON:", error);
      return typeof input === 'string' ? input : JSON.stringify(input, null, 2);
    }
  }

  /**
   * Initialize the service by fetching application context and setting up Experience Edge
   */
  async initialize(): Promise<void> {
    try {
      // Get application context to extract live context ID
      const { data } = await this.client.query("application.context");
      this.applicationContext = data;

      // Extract the live context ID for reference
      const liveContextId = this.getLiveContextId();
      if (liveContextId) {
        this.experienceEdgeService = new ExperienceEdgeService(this.client, liveContextId);
        
        // Test the connection
        const isConnected = await this.experienceEdgeService.testConnection();
        if (!isConnected) {
          console.warn("XMC_ITEM_DIFF - Experience Edge connection test failed");
        } else {
          console.log("XMC_ITEM_DIFF - Experience Edge connection test successful");
        }
      } else {
        console.warn("XMC_ITEM_DIFF - No live context ID found in application context");
      }
    } catch (error) {
      console.error("XMC_ITEM_DIFF - Failed to initialize LayoutComparisonService:", error);
      throw error;
    }
  }

  /**
   * Compare preview and published versions of an item's layout
   */
  async compareLayouts(
    siteName: string,
    routePath: string,
    language: string = "en"
  ): Promise<ComparisonResult> {
    const result: ComparisonResult = {
      preview: { error: "Not fetched" },
      published: { error: "Not fetched" },
    };

    try {
      // Get context IDs for API calls
      const liveContextId = this.getLiveContextId();
      const previewContextId = this.getPreviewContextId();
      
      console.log("XMC_ITEM_DIFF - Using context IDs:", { liveContextId, previewContextId });

      // Fetch both versions in parallel
      const [previewLayout, publishedLayout, itemInfo] = await Promise.allSettled([
        this.previewService.getPreviewLayout(siteName, routePath, language, previewContextId || liveContextId),
        this.getPublishedLayout(siteName, routePath, language),
        this.previewService.getItemInfo(siteName, routePath, language, previewContextId || liveContextId),
      ]);

      // Handle preview layout result
      if (previewLayout.status === "fulfilled") {
        const previewResult = previewLayout.value;
        
        // Debug logging to understand the structure differences
        if (previewResult.rendered) {
          console.log("XMC_ITEM_DIFF - Preview rendered type:", typeof previewResult.rendered);
          
          // Handle both string and object cases
          let previewParsed;
          if (typeof previewResult.rendered === 'string') {
            console.log("XMC_ITEM_DIFF - Raw Preview JSON (first 500 chars):", 
              previewResult.rendered.substring(0, 500));
            try {
              previewParsed = JSON.parse(previewResult.rendered);
            } catch (e) {
              console.warn("XMC_ITEM_DIFF - Failed to parse preview JSON string");
            }
          } else {
            console.log("XMC_ITEM_DIFF - Preview rendered is already an object:", previewResult.rendered);
            previewParsed = previewResult.rendered;
          }
          
          if (previewParsed) {
            console.log("XMC_ITEM_DIFF - Preview JSON structure:", {
              hasSitecore: !!previewParsed.sitecore,
              hasContext: !!previewParsed.sitecore?.context,
              hasRoute: !!previewParsed.sitecore?.route,
              hasSite: !!previewParsed.sitecore?.site,
              contextKeys: previewParsed.sitecore?.context ? Object.keys(previewParsed.sitecore.context) : [],
              routeKeys: previewParsed.sitecore?.route ? Object.keys(previewParsed.sitecore.route) : [],
              rootKeys: Object.keys(previewParsed),
            });
          }
        }
        
        result.preview = {
          ...previewResult,
          rendered: previewResult.rendered ? this.normalizeLayoutJson(previewResult.rendered) : undefined,
        };
      } else {
        result.preview = { error: `Preview fetch failed: ${previewLayout.reason}` };
      }

      // Handle published layout result
      if (publishedLayout.status === "fulfilled") {
        const publishedResult = publishedLayout.value;
        
        // Debug logging to understand the structure differences
        if (publishedResult.rendered) {
          console.log("XMC_ITEM_DIFF - Published rendered type:", typeof publishedResult.rendered);
          
          // Handle both string and object cases
          let publishedParsed;
          if (typeof publishedResult.rendered === 'string') {
            console.log("XMC_ITEM_DIFF - Raw Published JSON (first 500 chars):", 
              publishedResult.rendered.substring(0, 500));
            try {
              publishedParsed = JSON.parse(publishedResult.rendered);
            } catch (e) {
              console.warn("XMC_ITEM_DIFF - Failed to parse published JSON string");
            }
          } else {
            console.log("XMC_ITEM_DIFF - Published rendered is already an object:", publishedResult.rendered);
            publishedParsed = publishedResult.rendered;
          }
          
          if (publishedParsed) {
            console.log("XMC_ITEM_DIFF - Published JSON structure:", {
              hasSitecore: !!publishedParsed.sitecore,
              hasContext: !!publishedParsed.sitecore?.context,
              hasRoute: !!publishedParsed.sitecore?.route,
              hasSite: !!publishedParsed.sitecore?.site,
              contextKeys: publishedParsed.sitecore?.context ? Object.keys(publishedParsed.sitecore.context) : [],
              routeKeys: publishedParsed.sitecore?.route ? Object.keys(publishedParsed.sitecore.route) : [],
              rootKeys: Object.keys(publishedParsed),
            });
          }
        }
        
        result.published = {
          ...publishedResult,
          rendered: publishedResult.rendered ? this.normalizeLayoutJson(publishedResult.rendered) : undefined,
        };
      } else {
        result.published = { error: `Published fetch failed: ${publishedLayout.reason}` };
      }

      // Handle item info result
      if (itemInfo.status === "fulfilled" && itemInfo.value) {
        result.itemInfo = {
          name: itemInfo.value.name,
          displayName: itemInfo.value.displayName,
          path: itemInfo.value.path,
        };
      }

      return result;
    } catch (error) {
      console.error("Error in compareLayouts:", error);
      return {
        preview: { error: "Comparison failed" },
        published: { error: "Comparison failed" },
      };
    }
  }

  /**
   * Get published layout with error handling
   */
  private async getPublishedLayout(
    siteName: string,
    routePath: string,
    language: string
  ): Promise<LayoutData> {
    if (!this.experienceEdgeService) {
      return {
        error: "Experience Edge service not initialized. Live context ID may be missing.",
      };
    }

    return this.experienceEdgeService.getPublishedLayout(siteName, routePath, language);
  }

  /**
   * Extract live context ID from application context
   */
  private getLiveContextId(): string | null {
    if (!this.applicationContext?.resourceAccess?.length) {
      return null;
    }

    // Get the first resource access context
    const firstResource = this.applicationContext.resourceAccess[0];
    return firstResource?.context?.live || null;
  }

  /**
   * Extract preview context ID from application context
   */
  private getPreviewContextId(): string | null {
    if (!this.applicationContext?.resourceAccess?.length) {
      return null;
    }

    // Get the first resource access context
    const firstResource = this.applicationContext.resourceAccess[0];
    return firstResource?.context?.preview || null;
  }

  /**
   * Get the application context
   */
  getApplicationContext(): ApplicationContext | null {
    return this.applicationContext;
  }

  /**
   * Check if the service is properly initialized
   */
  isInitialized(): boolean {
    return this.applicationContext !== null;
  }

  /**
   * Check if Experience Edge is available
   */
  isExperienceEdgeAvailable(): boolean {
    return this.experienceEdgeService !== null;
  }
}