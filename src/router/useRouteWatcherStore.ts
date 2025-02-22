import { useMarkwhenStore } from "@/Markwhen/markwhenStore";
import { useTransformStore, type Sort } from "@/Markwhen/transformStore";
import { useViewStore } from "@/Views/viewStore";
import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { usePageStore } from "../Markwhen/pageStore";

export type RouteWatchState = "idle" | "error" | "loading";

export const useRouteWatcherStore = defineStore("routeWatcher", () => {
  const route = useRoute();
  const markwhenStore = useMarkwhenStore();
  const watchState = ref<RouteWatchState>("loading");
  const pageStore = usePageStore();
  const viewStore = useViewStore();
  const transformStore = useTransformStore();

  const pageTitles = computed(() => {
    return markwhenStore.timelines.map((t) => t.metadata.title);
  });

  const pageIndexFromQuery = (index: string) => {
    if (typeof index === "string") {
      const parsed = parseInt(index);
      if (isNaN(parsed)) {
        for (let i = 0; i < pageTitles.value.length; i++) {
          if (
            pageTitles.value[i]?.toLowerCase() ===
            decodeURIComponent(index).toLowerCase()
          ) {
            return i;
          }
        }
      } else if (parsed >= 1 && parsed < pageTitles.value.length + 1) {
        return parsed - 1;
      }
    } else if (
      typeof index === "number" &&
      index >= 1 &&
      index < pageTitles.value.length + 1
    ) {
      return index - 1;
    }
  };

  const setFromQuery = (query: Record<string, string>) => {
    if (query.page) {
      const index = pageIndexFromQuery(route.query.page as string);
      if (typeof index === "number") {
        pageStore.setPageIndex(index);
      }
    }
    if (query.view) {
      for (let i = 0; i < viewStore.views.length; i++) {
        if (
          (query.view as string).toLowerCase() ===
          viewStore.views[i].name.toLowerCase()
        ) {
          viewStore.setSelectedViewIndex(i);
        }
      }
    }
    const sort = (query.sort as string)?.toLowerCase();
    for (const s of ["none", "up", "down"] as Sort[]) {
      if (sort === s) {
        transformStore.setSort(sort);
      }
    }
    const filters = (query.filter as string)?.split(",") || [];
    for (const filter of filters) {
      transformStore.addFilterTag(filter);
    }
  };

  watch(
    () => route.query,
    (query) => setFromQuery(query as Record<string, string>),
    { immediate: true }
  );

  return {
    watchState,
  };
});
