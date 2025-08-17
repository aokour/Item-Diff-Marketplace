// PreviewService for fetching layout data from Sitecore preview environment
import { ClientSDK } from "@sitecore-marketplace-sdk/client";

export interface LayoutData {
  rendered?: string;
  error?: string;
}

export class PreviewService {
  constructor(private client: ClientSDK) {}

  /**
   * Fetch layout JSON from the preview environment using the XMC Preview GraphQL API
   */
  async getPreviewLayout(siteName: string, routePath: string, language: string = "en", contextId?: string): Promise<LayoutData> {
    try {
      const { data } = await this.client.mutate("xmc.preview.graphql", {
        params: {
          query: {
            sitecoreContextId: contextId,
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

      if (data?.data?.layout?.item?.rendered) {
        return {
          rendered: data.data.layout.item.rendered,
        };
      }

      return {
        error: "No layout data found in preview environment",
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Failed to fetch preview layout",
      };
    }
  }

  /**
   * Fetch item information for context using preview API
   */
  async getItemInfo(siteName: string, routePath: string, language: string = "en", contextId?: string) {
    try {
      const { data } = await this.client.mutate("xmc.preview.graphql", {
        params: {
          query: {
            sitecoreContextId: contextId,
          },
          body: {
            query: `
              query GetItemInfo($siteName: String!, $routePath: String!, $language: String!) {
                layout(site: $siteName, routePath: $routePath, language: $language) {
                  item {
                    name
                    displayName
                    path
                    url {
                      path
                    }
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

      return data?.data?.layout?.item || null;
    } catch (error) {
      return null;
    }
  }
}