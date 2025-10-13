import { defineStore } from 'pinia';
import { ref, onBeforeMount } from 'vue';
import { useRouter, useRoute } from 'vue-router';

export const useMenuStore = defineStore('menu', () => {
  const router = useRouter(); 
  const route = useRoute();

  const activeIndex = ref(`/home/${route.params.role}`); 
  // 默认选中首页 获取缓存值 如果没有缓存值 则默认选中首页
  // 如果有缓存值 则选中缓存值
  if (localStorage.getItem('menuActiveIndex')) {
    activeIndex.value = localStorage.getItem('menuActiveIndex') || `/home/${route.params.role}`;
  }

  // 持久化存储
  onBeforeMount(() => {
    const savedIndex = localStorage.getItem('menuActiveIndex');
    if (savedIndex) activeIndex.value = savedIndex;
  });

  // 切换菜单项时保存状态
  function handleSelect(index: string) {
    activeIndex.value = index;
    localStorage.setItem('menuActiveIndex', index);
    router.push({ path: index });
  }

  return { activeIndex, handleSelect };
});
