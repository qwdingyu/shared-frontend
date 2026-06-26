import { computed, ref, watch } from "vue";
import { defineStore } from "pinia";
import {
  useRoute,
  type RouteLocationMatched,
  type RouteLocationNormalizedLoaded,
} from "vue-router";
import { useKeepAliveStore } from "./keepAlive";
import { useLayoutSettingStore } from "./layoutSetting";
import { store } from "@/store";
import router from "@/router";
import {
  LOGIN_NAME,
  REDIRECT_NAME,
  PAGE_NOT_FOUND_NAME,
} from "@/router/constant";

/** 不需要出现在标签页中的路由 */
export const routeExcludes = [
  REDIRECT_NAME,
  LOGIN_NAME,
  PAGE_NOT_FOUND_NAME,
] as const;

export const useTabsViewStore = defineStore(
  "tabs-view",
  () => {
    const currentRoute = useRoute();
    const layoutSettingStore = useLayoutSettingStore();
    const tabsList = ref<RouteLocationNormalizedLoaded[]>([]);

    // 初始化时清理损坏的持久化数据
    const initTabsList = () => {
      const validList = sanitizeTabsList(tabsList.value);
      if (validList.length !== tabsList.value.length) {
        tabsList.value = validList;
      }
    };

    const getTabsList = computed(() => {
      return tabsList.value.filter((item) => {
        return (
          isValidRoute(item) &&
          !isInRouteExcludes(item) &&
          (item.name ? router.hasRoute(item.name) : true)
        );
      });
    });
    /** 当前activity tab */
    const getCurrentTab = computed(() => {
      return tabsList.value.find((item) => {
        return (
          isValidRoute(item) &&
          !isInRouteExcludes(item) &&
          item.fullPath === currentRoute.fullPath
        );
      });
    });

    /** 给定的路由是否在排除名单里面 */
    const isInRouteExcludes = (route: RouteLocationNormalizedLoaded) => {
      return (
        route.meta?.hideInTabs || routeExcludes.some((n) => n === route.name)
      );
    };

    /** 将已关闭的标签页的组件从keep-alive中移除 */
    const delCompFromClosedTabs = (
      closedTabs: RouteLocationNormalizedLoaded[],
    ) => {
      const keepAliveStore = useKeepAliveStore();
      const routes = router.getRoutes();
      const compNames = closedTabs.reduce<string[]>((prev, curr) => {
        if (curr.name && router.hasRoute(curr.name)) {
          const componentName = routes.find((n) => n.name === curr.name)
            ?.components?.default?.name;
          componentName && prev.push(componentName);
        }
        return prev;
      }, []);
      keepAliveStore.remove(compNames);
    };

    const getRawRoute = (
      route: RouteLocationNormalizedLoaded,
    ): RouteLocationNormalizedLoaded => {
      return {
        ...route,
        matched: route.matched.map((item) => {
          const { meta, path, name } = item;
          return { meta, path, name };
        }) as RouteLocationMatched[],
      };
    };

    /** 验证路由对象是否有效 */
    const isValidRoute = (
      route: any,
    ): route is RouteLocationNormalizedLoaded => {
      return (
        route && typeof route === "object" && typeof route.fullPath === "string"
      );
    };

    /** 清理并验证存储的路由列表 */
    const sanitizeTabsList = (list: any[]): RouteLocationNormalizedLoaded[] => {
      if (!Array.isArray(list)) return [];
      return list.filter((item) => {
        // 验证路由对象有效
        if (!isValidRoute(item)) return false;
        // 验证路由名称存在（如果路由有名称）
        if (item.name && !router.hasRoute(item.name as string)) return false;
        return true;
      });
    };

    /** 添加标签页 */
    const addTabs = (route: RouteLocationNormalizedLoaded) => {
      if (isInRouteExcludes(route)) {
        return false;
      }
      const isExists = tabsList.value.some(
        (item) => item && item.fullPath == route.fullPath,
      );
      if (!isExists) {
        tabsList.value.push(getRawRoute(route));
        // console.log('tabsList.value', [...tabsList.value])
      }
      return true;
    };
    /** 关闭左侧 */
    const closeLeftTabs = (route: RouteLocationNormalizedLoaded) => {
      const index = tabsList.value.findIndex(
        (item) => item && item.fullPath == route.fullPath,
      );
      delCompFromClosedTabs(tabsList.value.splice(0, index));
    };
    /** 关闭右侧 */
    const closeRightTabs = (route: RouteLocationNormalizedLoaded) => {
      const index = tabsList.value.findIndex(
        (item) => item && item.fullPath == route.fullPath,
      );
      delCompFromClosedTabs(tabsList.value.splice(index + 1));
    };
    /** 关闭其他 */
    const closeOtherTabs = (route: RouteLocationNormalizedLoaded) => {
      const targetIndex = tabsList.value.findIndex(
        (item) => item && item.fullPath === route.fullPath,
      );
      if (targetIndex !== -1) {
        const current = tabsList.value.splice(targetIndex, 1);
        delCompFromClosedTabs(tabsList.value);
        tabsList.value = current;
      }
    };
    /** 关闭当前页 */
    const closeCurrentTab = (route: RouteLocationNormalizedLoaded) => {
      const index = tabsList.value.findIndex(
        (item) => item && item.fullPath == route.fullPath,
      );
      if (index === -1) return;
      const isDelCurrentTab = Object.is(
        getCurrentTab.value,
        tabsList.value[index],
      );
      delCompFromClosedTabs(tabsList.value.splice(index, 1));
      // 如果关闭的tab就是当前激活的tab，则重定向页面
      if (isDelCurrentTab) {
        const currentTab =
          tabsList.value[Math.max(0, tabsList.value.length - 1)];
        if (currentTab) {
          router.push(currentTab);
        }
      }
    };
    /** 关闭全部 */
    const closeAllTabs = () => {
      delCompFromClosedTabs(tabsList.value);
      tabsList.value = [];
    };
    // 更新tab标题
    const updateTabTitle = (title: string) => {
      const currentRoute = router.currentRoute.value;
      const upTarget = tabsList.value.find(
        (item) => item && item.fullPath === currentRoute.fullPath,
      );
      if (upTarget && upTarget.meta) {
        upTarget.meta.title = title;
      }
    };

    // 在路由watch之前初始化清理
    initTabsList();

    watch(
      () => currentRoute.fullPath,
      () => {
        addTabs(currentRoute);
      },
      { immediate: true },
    );

    window.addEventListener("beforeunload", () => {
      if (!layoutSettingStore.layoutSetting.cacheTabs) {
        if (isInRouteExcludes(currentRoute)) {
          tabsList.value = [tabsList.value[0]];
        } else {
          tabsList.value = [getCurrentTab.value || tabsList.value[0]];
        }
        tabsList.value = tabsList.value.filter(Boolean);
      }
    });

    return {
      tabsList,
      getTabsList,
      getCurrentTab,
      addTabs,
      closeLeftTabs,
      closeRightTabs,
      closeOtherTabs,
      closeCurrentTab,
      closeAllTabs,
      updateTabTitle,
    };
  },
  {
    persist: {
      paths: ["tabsList"],
    },
  } as any,
);

// 在组件setup函数外使用
export function useTabsViewStoreWithOut(): ReturnType<typeof useTabsViewStore> {
  return useTabsViewStore(store);
}
