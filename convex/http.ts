import { httpRouter } from "convex/server";
import { registerPersistentStreamDemoRoutes } from "./persistent_stream_demo/http";
import { registerConvexApiDemoRoutes } from "./convex_api_demo/http";

// 创建 HTTP 路由
const http = httpRouter();

// 注册 Convex API Demo 模块的路由
registerConvexApiDemoRoutes(http);

// 注册 Persistent Stream Demo 模块的路由
registerPersistentStreamDemoRoutes(http);

export default http; 