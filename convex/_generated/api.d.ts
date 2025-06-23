/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as _lib_models from "../_lib/models.js";
import type * as ai_chat_actions from "../ai/chat/actions.js";
import type * as ai_utils_aiClient from "../ai/utils/aiClient.js";
import type * as ai_utils_errorHandler from "../ai/utils/errorHandler.js";
import type * as ai_utils_promptTemplates from "../ai/utils/promptTemplates.js";
import type * as ai_utils_types from "../ai/utils/types.js";
import type * as http from "../http.js";
import type * as prompt_mutations from "../prompt/mutations.js";
import type * as streaming from "../streaming.js";
import type * as userModelPreferences_mutations from "../userModelPreferences/mutations.js";
import type * as userModelPreferences_queries from "../userModelPreferences/queries.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "_lib/models": typeof _lib_models;
  "ai/chat/actions": typeof ai_chat_actions;
  "ai/utils/aiClient": typeof ai_utils_aiClient;
  "ai/utils/errorHandler": typeof ai_utils_errorHandler;
  "ai/utils/promptTemplates": typeof ai_utils_promptTemplates;
  "ai/utils/types": typeof ai_utils_types;
  http: typeof http;
  "prompt/mutations": typeof prompt_mutations;
  streaming: typeof streaming;
  "userModelPreferences/mutations": typeof userModelPreferences_mutations;
  "userModelPreferences/queries": typeof userModelPreferences_queries;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {
  persistentTextStreaming: {
    lib: {
      addChunk: FunctionReference<
        "mutation",
        "internal",
        { final: boolean; streamId: string; text: string },
        any
      >;
      createStream: FunctionReference<"mutation", "internal", {}, any>;
      getStreamStatus: FunctionReference<
        "query",
        "internal",
        { streamId: string },
        "pending" | "streaming" | "done" | "error" | "timeout"
      >;
      getStreamText: FunctionReference<
        "query",
        "internal",
        { streamId: string },
        {
          status: "pending" | "streaming" | "done" | "error" | "timeout";
          text: string;
        }
      >;
      setStreamStatus: FunctionReference<
        "mutation",
        "internal",
        {
          status: "pending" | "streaming" | "done" | "error" | "timeout";
          streamId: string;
        },
        any
      >;
    };
  };
};
