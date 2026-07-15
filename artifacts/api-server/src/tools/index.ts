/**
 * Reusable Tools and Agent functions module stub.
 * This folder is reserved for system tools, external API wrappers,
 * and webhook integration utilities.
 */
export interface AgentTool {
  name: string;
  description: string;
  execute(args: Record<string, any>): Promise<any>;
}
