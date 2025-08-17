import { ClientSDK } from "@sitecore-marketplace-sdk/client";
import { LayoutData } from "./AuthoringService";

export class ExperienceEdgeService {
  private client: ClientSDK;
  private liveContextId: string;

  constructor(client: ClientSDK, liveContextId: string) {
    this.client = client;
    this.liveContextId = liveContextId;
  }

  /**
   * Fetch layout JSON from Experience Edge (published content) via XMC SDK
   */
  async getPublishedLayout(siteName: string, routePath: string, language: string = "en"): Promise<LayoutData> {
    try {
      console.log("XMC_ITEM_DIFF - Fetching published layout via XMC SDK:", { siteName, routePath, language });
      
      const { data } = await this.client.mutate("xmc.live.graphql", {
        params: {
          query: {
            sitecoreContextId: this.liveContextId,
          },
          body: {
            query: `
              query GetItemLayout($siteName: String!, $routePath: String!, $language: String!) {
                layout(site: $siteName, routePath: $routePath, language: $language) {
                  item {
                    rendered
                  }
                }
              }
            `,
            variables: {
              siteName,
              routePath,
              language,
            },
          },
        },
      });

      console.log("XMC_ITEM_DIFF - Published layout response:", data);
      console.log("XMC_ITEM_DIFF - Published data?.data:", data?.data);
      console.log("XMC_ITEM_DIFF - Published layout:", data?.data?.layout);
      console.log("XMC_ITEM_DIFF - Published item:", data?.data?.layout?.item);

      if (data?.data?.layout?.item?.rendered) {
        return {
          rendered: data.data.layout.item.rendered,
        };
      }

      return {
        error: "No layout data found in published environment",
      };
    } catch (error) {
      console.error("XMC_ITEM_DIFF - Error fetching published layout:", error);
      return {
        error: error instanceof Error ? error.message : "Failed to fetch published layout",
      };
    }
  }

  /**
   * Get item by ID from Experience Edge via XMC SDK
   */
  async getPublishedItem(itemId: string, language: string = "en") {
    try {
      const { data } = await this.client.mutate("xmc.live.graphql", {
        params: {
          query: {
            sitecoreContextId: this.liveContextId,
          },
          body: {
            query: `
              query GetPublishedItem($itemId: String!, $language: String!) {
                item(path: $itemId, language: $language) {
                  id
                  name
                  path
                  displayName
                  url {
                    path
                  }
                }
              }
            `,
            variables: {
              itemId,
              language,
            },
          },
        },
      });

      return data?.data?.item || null;
    } catch (error) {
      console.error("XMC_ITEM_DIFF - Error fetching published item:", error);
      return null;
    }
  }

  /**
   * Test API connectivity via XMC SDK
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.client.mutate("xmc.live.graphql", {
        params: {
          query: {
            sitecoreContextId: this.liveContextId,
          },
          body: {
            query: `
              query TestConnection {
                __schema {
                  queryType {
                    name
                  }
                }
              }
            `,
          },
        },
      });

      return true;
    } catch (error) {
      console.error("XMC_ITEM_DIFF - Error testing Experience Edge connection:", error);
      return false;
    }
  }
}