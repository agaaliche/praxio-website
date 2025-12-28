// Shared state for Level 2 sub-header visibility
const subHeaderVisible = ref(true)

export const useSubHeaderState = () => {
  const setVisible = (visible: boolean) => {
    subHeaderVisible.value = visible
  }

  return {
    subHeaderVisible: readonly(subHeaderVisible),
    setVisible
  }
}
