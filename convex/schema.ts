import { defineSchema, defineTable } from "convex/server";
import { chatSchema } from "./chat/schema";
import { promptSchema } from "./prompt/schema";
import { userModelPreferencesSchema } from "./userModelPreferences/schema";
import { appGenerationSchema } from "./factory/schema";
import { discoverySchema } from "./discovery/schema";

export default defineSchema({
  // 合并chat模块的 schema
  ...chatSchema,

  // 合并prompt模块的 schema
  ...promptSchema,

  // 合并userModelPreferences模块的 schema
  ...userModelPreferencesSchema,

  // 合并factory模块的 schema
  ...appGenerationSchema,

  // 合并discovery模块的 schema
  ...discoverySchema,
});
