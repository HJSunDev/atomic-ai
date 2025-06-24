import { defineSchema, defineTable } from "convex/server";
import { chatSchema } from "./chat/schema";
import { promptSchema } from "./prompt/schema";
import { userModelPreferencesSchema } from "./userModelPreferences/schema";

export default defineSchema({
  // 合并chat模块的 schema
  ...chatSchema,

  // 合并prompt模块的 schema
  ...promptSchema,

  // 合并userModelPreferences模块的 schema
  ...userModelPreferencesSchema,
}); 