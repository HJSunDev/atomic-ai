import { create } from "zustand";

/**
 * 认证状态管理
 *
 * 用于存储从Clerk获取的用户认证信息，以便在应用的其他部分（尤其是在Zustand store外部）
 * 可以同步访问用户ID。
 */

interface AuthState {
  // 当前登录用户的ID。如果为null，表示用户未登录。
  userId: string | null;
  // Clerk认证状态是否已加载完成。
  isLoaded: boolean;
  // 内部标记：Auth Store 是否已准备就绪（用于依赖此状态的加密存储等待）
  _hasHydrated: boolean;
}

interface AuthActions {
  /**
   * 设置认证信息。
   * @param auth - 包含userId和isLoaded的对象
   */
  setAuth: (auth: { userId: string | null; isLoaded: boolean }) => void;
  /**
   * 清除认证信息，回到未加载的初始状态。
   */
  clearAuth: () => void;
  /**
   * 内部方法：标记 AuthStore 已准备就绪。
   */
  _setHasHydrated: (hydrated: boolean) => void;
}

const initialState: AuthState = {
  userId: null,
  isLoaded: false,
  _hasHydrated: false,
};

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  ...initialState,
  setAuth: ({ userId, isLoaded }) => {
    set({ userId, isLoaded, _hasHydrated: true });
  },
  clearAuth: () => set(initialState),
  _setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
}));
