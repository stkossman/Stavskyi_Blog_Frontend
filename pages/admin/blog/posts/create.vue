<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100 relative">
    <NuxtLink
        to="/BlogPostsUI"
        class="absolute top-4 left-4 inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-semibold rounded-lg shadow-md transition-all duration-300 ease-in-out hover:bg-gray-700 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75"
    >
      Назад до списку
    </NuxtLink>

    <div class="w-full max-w-screen-md bg-white rounded-xl shadow-lg p-6">
      <div class="text-center mb-6">
        <h1 class="font-['Montserrat'] text-3xl font-extrabold text-gray-800 mb-2 drop-shadow-md">Створити новий пост</h1>
        <p class="text-gray-600 text-base">Заповніть форму для додавання нового блог-поста</p>
      </div>

      <form @submit.prevent="submitForm" class="space-y-4">
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
            Заголовок поста <span class="text-red-500">*</span>
          </label>
          <input
              v-model="form.title"
              type="text"
              id="title"
              name="title"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              placeholder="Введіть заголовок поста"
              :class="{ 'border-red-500': errors.title }"
          />
          <p v-if="errors.title" class="mt-1 text-xs text-red-600">{{ errors.title[0] }}</p>
        </div>

        <div>
          <label for="category_id" class="block text-sm font-medium text-gray-700 mb-1">
            Категорія <span class="text-red-500">*</span>
          </label>
          <select
              v-model="form.category_id"
              id="category_id"
              name="category_id"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              :class="{ 'border-red-500': errors.category_id }"
          >
            <option value="">Оберіть категорію</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.title }}
            </option>
          </select>
          <p v-if="errors.category_id" class="mt-1 text-xs text-red-600">{{ errors.category_id[0] }}</p>
        </div>

        <div>
          <label for="excerpt" class="block text-sm font-medium text-gray-700 mb-1">
            Короткий опис
          </label>
          <textarea
              v-model="form.excerpt"
              id="excerpt"
              name="excerpt"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-y text-sm"
              placeholder="Введіть короткий опис поста (необов'язково)"
              :class="{ 'border-red-500': errors.excerpt }"
          ></textarea>
          <p v-if="errors.excerpt" class="mt-1 text-xs text-red-600">{{ errors.excerpt[0] }}</p>
          <p class="mt-1 text-xs text-gray-500">Максимум 500 символів</p>
        </div>

        <div>
          <label for="content_raw" class="block text-sm font-medium text-gray-700 mb-1">
            Контент поста <span class="text-red-500">*</span>
          </label>
          <textarea
              v-model="form.content_raw"
              id="content_raw"
              name="content_raw"
              rows="8"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-y font-mono text-xs"
              placeholder="Введіть контент поста (підтримується Markdown)"
              :class="{ 'border-red-500': errors.content_raw }"
          ></textarea>
          <p v-if="errors.content_raw" class="mt-1 text-xs text-red-600">{{ errors.content_raw[0] }}</p>
          <p class="mt-1 text-xs text-gray-500">Ви можете використовувати Markdown для форматування</p>
        </div>

        <div>
          <label for="published_at" class="block text-sm font-medium text-gray-700 mb-1">
            Дата публікації
          </label>
          <input
              v-model="form.published_at"
              type="datetime-local"
              id="published_at"
              name="published_at"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              :class="{ 'border-red-500': errors.published_at }"
          />
          <p v-if="errors.published_at" class="mt-1 text-xs text-red-600">{{ errors.published_at[0] }}</p>
          <p class="mt-1 text-xs text-gray-500">Залиште порожнім для публікації зараз</p>
        </div>

        <div class="flex items-center">
          <input
              v-model="form.is_published"
              type="checkbox"
              id="is_published"
              name="is_published"
              class="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label for="is_published" class="ml-2 block text-sm text-gray-700">
            Опублікувати пост відразу
          </label>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <NuxtLink
              to="/BlogPostsUi"
              class="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            Скасувати
          </NuxtLink>
          <button
              type="submit"
              :disabled="isSubmitting"
              class="px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? 'Створюю...' : 'Створити пост' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

definePageMeta({
  layout: 'admin'
});

interface Category {
  id: number;
  title: string;
}

interface FormData {
  title: string;
  content_raw: string;
  excerpt: string;
  category_id: string;
  is_published: boolean;
  published_at: string;
}

const config = useRuntimeConfig();
const router = useRouter();

const categories = ref<Category[]>([]);
const isSubmitting = ref(false);
const errors = ref<Record<string, string[]>>({});

const form = ref<FormData>({
  title: '',
  content_raw: '',
  excerpt: '',
  category_id: '',
  is_published: true,
  published_at: ''
});

const loadCategories = async () => {
  try {
    const response = await $fetch(`${config.public.apiBase}/blog/categories`);
    categories.value = response.data || response;
  } catch (error) {
    console.error('Error loading categories:', error);
    alert('Помилка завантаження категорій');
  }
};

const submitForm = async () => {
  if (isSubmitting.value) return;

  isSubmitting.value = true;
  errors.value = {};

  try {
    const payload = {
      ...form.value,
      category_id: parseInt(form.value.category_id),
      published_at: form.value.published_at || null
    };

    const response = await $fetch(`${config.public.apiBase}/blog/posts`, {
      method: 'POST',
      body: payload
    });

    alert('Пост успішно створено!');

    await router.push('/BlogPostsUI');

  } catch (error: any) {
    console.error('Submit error:', error);

    if (error.data?.errors) {
      errors.value = error.data.errors;
    } else if (error.data?.message) {
      alert(`Помилка: ${error.data.message}`);
    } else {
      alert('Помилка при створенні поста');
    }
  } finally {
    isSubmitting.value = false;
  }
};

const setDefaultPublishDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  form.value.published_at = `${year}-${month}-${day}T${hours}:${minutes}`;
};

onMounted(() => {
  loadCategories();
  setDefaultPublishDate();
});
</script>

<style scoped>
.resize-vertical {
  resize: vertical;
}

.font-mono {
  font-family: 'Courier New', Courier, monospace;
}

button, .transition-colors {
  transition: all 0.2s ease-in-out;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>