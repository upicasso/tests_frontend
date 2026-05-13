import { ref, computed } from 'vue'

export function useCounter(initial = 0, step = 1) {
  const count = ref(initial)
  const isPositive = computed(() => count.value > 0)

  const increment = () => {
    count.value += step
  }
  const decrement = () => {
    count.value -= step
  }
  const reset = () => {
    count.value = initial
  }

  return { count, isPositive, increment, decrement, reset }
}
