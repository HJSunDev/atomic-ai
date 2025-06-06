/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as ai_chat_actions from "../ai/chat/actions.js";
import type * as ai_index from "../ai/index.js";
import type * as ai_utils_aiClient from "../ai/utils/aiClient.js";
import type * as ai_utils_errorHandler from "../ai/utils/errorHandler.js";
import type * as ai_utils_promptTemplates from "../ai/utils/promptTemplates.js";
import type * as ai_utils_types from "../ai/utils/types.js";
import type * as config_index from "../config/index.js";
import type * as config_models from "../config/models.js";
import type * as http from "../http.js";
import type * as prompt_mutations from "../prompt/mutations.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "ai/chat/actions": typeof ai_chat_actions;
  "ai/index": typeof ai_index;
  "ai/utils/aiClient": typeof ai_utils_aiClient;
  "ai/utils/errorHandler": typeof ai_utils_errorHandler;
  "ai/utils/promptTemplates": typeof ai_utils_promptTemplates;
  "ai/utils/types": typeof ai_utils_types;
  "config/index": typeof config_index;
  "config/models": typeof config_models;
  http: typeof http;
  "prompt/mutations": typeof prompt_mutations;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
