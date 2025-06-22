<template>
  <div class="max-w-3xl mx-auto mt-5 p-5 bg-gray-50 rounded-lg shadow-md">
    <NuxtLink
        to="/BlogPostsUI"
        class="absolute top-4 left-4 inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-semibold rounded-lg shadow-md transition-all duration-300 ease-in-out hover:bg-gray-700 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75"
    >
      Назад до списку
    </NuxtLink>

    <h1 class="text-gray-800 text-center mb-8 text-2xl font-bold">Редагувати блог-пост: {{ post.title }}</h1>

    <div v-if="loading" class="text-center py-5 text-lg text-gray-500">Завантаження даних...</div>
    <div v-else-if="error" class="text-center py-5 text-lg text-red-600 font-bold">
      {{ error }}
      <div v-if="categoryErrorDetails" class="text-sm text-red-700 mt-1">
        Деталі помилки категорій: {{ categoryErrorDetails }}
      </div>
    </div>

    <form @submit.prevent="updatePost" v-else>
      <div class="mb-4">
        <label for="title" class="block mb-1 font-bold text-gray-600">Заголовок:</label>
        <input
            type="text"
            id="title"
            v-model="post.title"
            required
            class="w-full p-2.5 border border-gray-300 rounded box-border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
        <span v-if="validationErrors.title" class="text-red-500 text-sm mt-1 block">{{ validationErrors.title[0] }}</span>
      </div>

      <div class="mb-4">
        <label for="content_raw" class="block mb-1 font-bold text-gray-600">Зміст:</label>
        <textarea
            id="content_raw"
            v-model="post.content_raw"
            required
            class="w-full p-2.5 border border-gray-300 rounded box-border min-h-[150px] resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        ></textarea>
        <span v-if="validationErrors.content_raw" class="text-red-500 text-sm mt-1 block">{{ validationErrors.content_raw[0] }}</span>
      </div>

      <div class="mb-4">
        <label for="excerpt" class="block mb-1 font-bold text-gray-600">Короткий опис (Excerpt):</label>
        <textarea
            id="excerpt"
            v-model="post.excerpt"
            class="w-full p-2.5 border border-gray-300 rounded box-border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        ></textarea>
        <span v-if="validationErrors.excerpt" class="text-red-500 text-sm mt-1 block">{{ validationErrors.excerpt[0] }}</span>
      </div>

      <div class="mb-4">
        <label for="category_id" class="block mb-1 font-bold text-gray-600">Категорія:</label>
        <select
            id="category_id"
            v-model="post.category_id"
            required
            class="w-full p-2.5 border border-gray-300 rounded box-border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option :value="null" disabled>Оберіть категорію</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.title }}
          </option>
        </select>
        <span v-if="validationErrors.category_id" class="text-red-500 text-sm mt-1 block">{{ validationErrors.category_id[0] }}</span>
      </div>

      <div class="flex items-center mb-4">
        <input type="checkbox" id="is_published" v-model="post.is_published" class="mr-2.5">
        <label for="is_published" class="font-bold text-gray-600">Опублікувати</label>
        <span v-if="validationErrors.is_published" class="text-red-500 text-sm mt-1 block ml-4">{{ validationErrors.is_published[0] }}</span>
      </div>

      <div class="mb-4">
        <label for="published_at" class="block mb-1 font-bold text-gray-600">Дата публікації:</label>
        <input
            type="datetime-local"
            id="published_at"
            v-model="post.published_at"
            class="w-full p-2.5 border border-gray-300 rounded box-border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
        <span v-if="validationErrors.published_at" class="text-red-500 text-sm mt-1 block">{{ validationErrors.published_at[0] }}</span>
      </div>

      <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
            type="submit"
            class="px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Оновити пост
        </button>
        <button
            type="button"
            @click="goBack"
            class="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-semibold rounded-lg hover:bg-gray-300 transition-colors"
        >
          Скасувати
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRuntimeConfig } from '#app';

const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();

const post = ref({
  title: '',
  content_raw: '',
  excerpt: '',
  category_id: null,
  is_published: false,
  published_at: null,
});
const categories = ref([]);
const loading = ref(true);
const error = ref(null);
const categoryErrorDetails = ref(null);
const validationErrors = ref({});

const fetchPost = async (slug) => {
  try {
    const response = await axios.get(`${config.public.apiBase}/blog/posts/${slug}`);
    post.value = {
      ...response.data,
      published_at: response.data.published_at
          ? new Date(response.data.published_at).toISOString().slice(0, 16)
          : null,
    };
    error.value = null;
  } catch (err) {
    console.error('Помилка при завантаженні посту:', err);
    error.value = 'Пост не знайдено або виникла помилка завантаження.';
  }
};

const fetchCategories = async () => {
  try {
    const response = await axios.get(`${config.public.apiBase}/blog/categories`);
    categories.value = response.data.data || response.data;
    categoryErrorDetails.value = null;
  } catch (err) {
    console.error('Помилка при завантаженні категорій:', err);
    error.value = 'Помилка при завантаженні категорій.';

    if (err.response) {
      console.error('Дані помилки відповіді:', err.response.data);
      console.error('Статус помилки:', err.response.status);
      console.error('Заголовки помилки:', err.response.headers);
      categoryErrorDetails.value = `Статус: ${err.response.status}, Дані: ${JSON.stringify(err.response.data)}`;
    } else if (err.request) {
      console.error('Немає відповіді від сервера:', err.request);
      categoryErrorDetails.value = 'Сервер не відповів.';
    } else {
      console.error('Помилка налаштування запиту:', err.message);
      categoryErrorDetails.value = `Помилка: ${err.message}`;
    }
  }
};

const updatePost = async () => {
  validationErrors.value = {};
  try {
    const slug = route.params.slug;
    const response = await axios.put(`${config.public.apiBase}/blog/posts/${slug}`, post.value);

    alert(response.data.message || 'Пост успішно оновлено!');

    await router.push('/BlogPostsUI');

  } catch (err) {
    if (err.response && err.response.status === 422) {
      validationErrors.value = err.response.data.errors;
    } else {
      console.error('Помилка при оновленні посту:', err);
      alert('Виникла помилка при оновленні посту. Спробуйте ще раз.');
    }
  }
};

const goBack = () => {
  router.go(-1);
};

onMounted(async () => {
  const slug = route.params.slug;
  await Promise.all([
    fetchPost(slug),
    fetchCategories()
  ]);
  loading.value = false;
});
</script>

<style scoped>

</style>