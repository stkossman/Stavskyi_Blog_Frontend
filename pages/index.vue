<template>
  <div class="max-w-screen-xl mx-auto p-4 md:p-8 font-sans">
    <div class="text-center mb-12">
      <h1 class="text-4xl md:text-5xl text-gray-900 mb-2 font-semibold">Панель керування блогом</h1>
      <p class="text-lg text-gray-600">Оберіть розділ для керування контентом</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
      <div class="bg-white rounded-xl p-8 shadow-md border border-gray-200 text-center transition-all duration-200 hover:translate-y-[-2px] hover:shadow-lg">
        <div class="text-5xl mb-4 block">
          <Icon name="heroicons:clipboard-document-list" class="w-12 h-12 inline-block text-blue-500" />
        </div>
        <h3 class="text-xl text-gray-900 mb-2 font-semibold">Пости (NuxtUI)</h3>
        <p class="text-gray-700 mb-6 leading-relaxed">Керування постами блогу через NuxtUI</p>
        <button @click="navigateTo('/BlogPostsUi')" class="px-6 py-3 bg-blue-500 text-white rounded-lg text-base font-medium cursor-pointer transition-all duration-200 hover:bg-blue-600 hover:translate-y-[-1px] active:translate-y-0 min-w-[180px]">
          Перейти до постів UI
        </button>
      </div>

      <div class="bg-white rounded-xl p-8 shadow-md border border-gray-200 text-center transition-all duration-200 hover:translate-y-[-2px] hover:shadow-lg">
        <div class="text-5xl mb-4 block">
          <Icon name="heroicons:document-text" class="w-12 h-12 inline-block text-green-500" />
        </div>
        <h3 class="text-xl text-gray-900 mb-2 font-semibold">Пости (Основні)</h3>
        <p class="text-gray-700 mb-6 leading-relaxed">Основна таблиця з постами блогу</p>
        <button @click="navigateTo('/BlogPosts')" class="px-6 py-3 bg-green-500 text-white rounded-lg text-base font-medium cursor-pointer transition-all duration-200 hover:bg-green-600 hover:translate-y-[-1px] active:translate-y-0 min-w-[180px]">
          Перейти до постів
        </button>
      </div>

      <div class="bg-white rounded-xl p-8 shadow-md border border-gray-200 text-center transition-all duration-200 hover:translate-y-[-2px] hover:shadow-lg">
        <div class="text-5xl mb-4 block">
          <Icon name="heroicons:tag" class="w-12 h-12 inline-block text-purple-500" />
        </div>
        <h3 class="text-xl text-gray-900 mb-2 font-semibold">Категорії</h3>
        <p class="text-gray-700 mb-6 leading-relaxed">Керування категоріями блогу</p>
        <button @click="navigateToExternal('http://localhost:3000/admin/blog/categories/')" class="px-6 py-3 bg-purple-500 text-white rounded-lg text-base font-medium cursor-pointer transition-all duration-200 hover:bg-purple-600 hover:translate-y-[-1px] active:translate-y-0 min-w-[180px]">
          Перейти до категорій (Нова сторінка)
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Index',
  methods: {
    navigateTo(path) {
      this.$router.push(path);
    },
    navigateToExternal(url) {
      window.open(url, '_blank');
    }
  }
}
</script>