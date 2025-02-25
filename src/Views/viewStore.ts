import { useMobileViewProviders } from "@/Views/useMobileViewProviders";
import { useViewProviders } from "@/Views/useViewProviders";
import type { ViewProvider } from "@/viewProvider";
import { useMediaQuery } from "@vueuse/core";
import { defineStore } from "pinia";
import { computed, ref, watchEffect } from "vue";
import { useViewOrchestrator } from "./ViewOrchestrator/useViewOrchestrator";

export const useViewStore = defineStore("views", () => {
  const selectedViewIndex = ref(-1);
  const isMobile = useMediaQuery("(max-width: 1024px)");
  // const timelineStore = useTimelineStore();
  const activeFrame = ref<HTMLIFrameElement>();

  const setActiveFrame = (frame?: HTMLIFrameElement) => {
    activeFrame.value = frame;
  };

  const views = computed<ViewProvider[]>(() =>
    isMobile.value ? useMobileViewProviders() : useViewProviders()
  );
  const framedViews = computed(() => views.value.filter((v) => v.framed));
  const currentView = computed<ViewProvider>(
    () => views.value[selectedViewIndex.value]
  );

  watchEffect(() => {
    if (selectedViewIndex.value >= views.value.length) {
      selectedViewIndex.value = 0;
    } else if (selectedViewIndex.value < 0) {
      // Set default view
      selectedViewIndex.value = 2;
    }
  });

  const setSelectedViewIndex = (i: number) => {
    selectedViewIndex.value = i;
  };

  const { jumpToRange, jumpToPath } =
    useViewOrchestrator(activeFrame);

  return {
    // state
    selectedViewIndex,
    views,
    isMobile,

    // getters
    currentView,
    framedViews,

    // actions
    setSelectedViewIndex,
    setActiveFrame,
    jumpToPath,
    jumpToRange,
  };
});
