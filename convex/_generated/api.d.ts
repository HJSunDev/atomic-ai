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
import type * as convex_api_demo_http from "../convex_api_demo/http.js";
import type * as convex_api_demo_httpActions from "../convex_api_demo/httpActions.js";
import type * as http from "../http.js";
import type * as persistent_stream_demo_http from "../persistent_stream_demo/http.js";
import type * as persistent_stream_demo_httpActions from "../persistent_stream_demo/httpActions.js";
import type * as persistent_stream_demo_mutations from "../persistent_stream_demo/mutations.js";
import type * as persistent_stream_demo_queries from "../persistent_stream_demo/queries.js";
import type * as prompt_mutations from "../prompt/mutations.js";
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
  "convex_api_demo/http": typeof convex_api_demo_http;
  "convex_api_demo/httpActions": typeof convex_api_demo_httpActions;
  http: typeof http;
  "persistent_stream_demo/http": typeof persistent_stream_demo_http;
  "persistent_stream_demo/httpActions": typeof persistent_stream_demo_httpActions;
  "persistent_stream_demo/mutations": typeof persistent_stream_demo_mutations;
  "persistent_stream_demo/queries": typeof persistent_stream_demo_queries;
  "prompt/mutations": typeof prompt_mutations;
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
