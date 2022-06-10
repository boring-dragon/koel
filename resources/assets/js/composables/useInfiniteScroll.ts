import { defineAsyncComponent, ref } from 'vue'

export const useInfiniteScroll = (loadMore: Closure) => {
  const ToTopButton = defineAsyncComponent(() => import('@/components/ui/BtnScrollToTop.vue'))

  const scroller = ref<HTMLElement>()

  const scrolling = ({ target }: { target: HTMLElement }) => {
    // Here we check if the user has scrolled to the end of the wrapper (or 32px to the end).
    // If that's true, load more items.
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 32) {
      loadMore()
    }
  }

  return {
    ToTopButton,
    scroller,
    scrolling
  }
}
