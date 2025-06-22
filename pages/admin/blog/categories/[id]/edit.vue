<template>
  <div class="container max-w-xl mx-auto p-6">
    <UCard class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <template #header>
        <div class="px-8 py-4 border-b border-gray-100">
          <h1 class="text-xl font-semibold text-gray-900">Редагувати категорію</h1>
          <p class="text-sm text-gray-500 mt-1">
            {{ categoryData?.title || 'Завантаження...' }}
          </p>
        </div>
      </template>

      <div class="px-8 py-6">
        <template v-if="pending">
          <div class="text-center text-gray-600 text-sm">Завантаження даних категорії...</div>
        </template>

        <template v-else-if="error">
          <div class="text-center text-red-600 text-sm">Помилка: {{ error.message }}</div>
        </template>

        <template v-else>
          <UForm
              :schema="schema"
              :state="state"
              class="flex flex-col gap-6"
              @submit="onSubmit"
          >
            <UFormGroup
                label="Назва категорії"
                name="title"
                :error="errors.title"
                help="Мінімум 3 символи, максимум 200"
            >
              <UInput v-model="state.title" placeholder="Введіть назву категорії" />
            </UFormGroup>

            <UFormGroup
                label="Slug (Псевдонім)"
                name="slug"
                :error="errors.slug"
                help="Залиште порожнім для автоматичної генерації"
            >
              <UInput v-model="state.slug" placeholder="category-slug" />
            </UFormGroup>

            <UFormGroup
                label="Опис"
                name="description"
                :error="errors.description"
                help="Максимум 500 символів"
            >
              <UTextarea v-model="state.description" :rows="3" placeholder="Опишіть категорію..." />
            </UFormGroup>

            <UFormGroup label="Батьківська категорія" name="parent_id" :error="errors.parent_id">
              <select
                  v-model="state.parent_id"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  :class="{ 'border-red-500 focus:ring-red-500 focus:border-red-500': errors.parent_id }"
                  :disabled="isLoadingCategories"
              >
                <option value="">Оберіть батьківську категорію</option>
                <option :value="null">Без батьківської категорії</option>
                <option
                    v-for="category in availableCategories"
                    :key="category.id"
                    :value="category.id"
                >
                  {{ category.title }}
                </option>
              </select>
              <div class="text-xs text-gray-500 mt-1">
                Доступно категорій: {{ availableCategories.length }}
                <span v-if="isLoadingCategories" class="text-blue-500 ml-2">
                  (Завантаження...)
                </span>
              </div>
            </UFormGroup>

            <div class="flex justify-between items-center pt-6 border-t border-gray-100 mt-6">
              <div class="text-sm text-gray-600">
                Категорія ID: #{{ categoryId }}
              </div>
              <div class="flex gap-3">
                <UButton
                    type="button"
                    color="gray"
                    variant="ghost"
                    @click="navigateTo('/admin/blog/categories')"
                >
                  Відмінити
                </UButton>
                <UButton
                    type="submit"
                    :loading="isSubmitting"
                    color="primary"
                >
                  <template v-if="isSubmitting">Збереження...</template>
                  <template v-else>Зберегти зміни</template>
                </UButton>
              </div>
            </div>
          </UForm>
        </template>
      </div>
    </UCard>
  </div>
</template>


<script setup lang="ts">
import { ref, watch } from 'vue';
import { z } from 'zod';
import { useToast } from '#imports';
import { useRuntimeConfig, useRoute, navigateTo } from '#app';

interface Category {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
}

const schema = z.object({
  title: z.string()
      .min(3, 'Назва повинна містити мінімум 3 символи')
      .max(200, 'Назва не може перевищувати 200 символів'),
  slug: z.string()
      .max(200, 'Slug не може перевищувати 200 символів')
      .optional()
      .or(z.literal('')),
  description: z.string()
      .max(500, 'Опис не може перевищувати 500 символів')
      .optional()
      .or(z.literal('')),
  parent_id: z.number()
      .nullable()
      .optional(),
});

type CategoryForm = z.infer<typeof schema>;

const route = useRoute();
const categoryId = parseInt(route.params.id as string);
const toast = useToast();
const config = useRuntimeConfig();

const state = ref<CategoryForm>({
  title: '',
  slug: '',
  description: '',
  parent_id: null,
});

const errors = ref<{ [key: string]: string | undefined }>({});
const isSubmitting = ref(false);
const isLoadingCategories = ref(false);
const availableCategories = ref<Category[]>([]);

const { data: categoryData, pending, error, refresh } = await useAsyncData(
    `category-${categoryId}`,
    async () => {
      try {
        const category = await $fetch<Category>(`${config.public.apiBase}/blog/categories/${categoryId}`);
        return category;
      } catch (error) {
        console.error('Error fetching category data:', error);
        toast.add({
          title: 'Помилка завантаження даних категорії',
          description: 'Не вдалося завантажити дані категорії. Можливо, категорія не існує.',
          icon: 'i-heroicons-x-circle',
          color: 'red'
        });
        setTimeout(() => {
          navigateTo('/admin/blog/categories');
        }, 3000);
        throw error;
      }
    }
);

const fetchCategoriesForSelect = async () => {
  isLoadingCategories.value = true;
  try {
    console.log("Fetching categories for edit select...");
    const response = await $fetch<{ data: Category[] }>(`${config.public.apiBase}/blog/categories?per_page=1000`);
    console.log("Raw API response (edit):", response);

    if (response && response.data && Array.isArray(response.data)) {
      availableCategories.value = response.data.filter(cat => cat.id !== categoryId);
      console.log("Available categories for edit:", availableCategories.value);
      console.log("Categories count (edit):", availableCategories.value.length);
    } else {
      console.error("Invalid response structure (edit):", response);
      availableCategories.value = [];
    }
  } catch (error) {
    console.error('Error fetching categories for select (edit):', error);
    availableCategories.value = [];
    toast.add({
      title: 'Помилка завантаження списку категорій',
      description: 'Не вдалося завантажити список батьківських категорій.',
      icon: 'i-heroicons-x-circle',
      color: 'red'
    });
  } finally {
    isLoadingCategories.value = false;
  }
};

watch(categoryData, (newData) => {
  if (newData) {
    state.value = {
      title: newData.title,
      slug: newData.slug || '',
      description: newData.description || '',
      parent_id: newData.parent_id,
    };
  }
}, { immediate: true });

const onSubmit = async () => {
  errors.value = {};

  try {
    schema.parse(state.value);
  } catch (validationError: any) {
    if (validationError instanceof z.ZodError) {
      validationError.errors.forEach(err => {
        errors.value[err.path[0]] = err.message;
      });
      toast.add({
        title: 'Помилка валідації',
        description: 'Будь ласка, перевірте введені дані.',
        icon: 'i-heroicons-exclamation-triangle',
        color: 'yellow'
      });
      return;
    }
  }

  isSubmitting.value = true;
  try {
    const result = await $fetch(`${config.public.apiBase}/blog/categories/${categoryId}`, {
      method: 'PUT',
      body: state.value,
    });

    toast.add({
      title: 'Категорію оновлено',
      description: 'Зміни категорії були успішно збережені.',
      icon: 'i-heroicons-check-circle',
      color: 'green'
    });
    navigateTo('/admin/blog/categories');
  } catch (error: any) {
    console.error('Error updating category (edit):', error);
    if (error.statusCode === 422 && error.data && error.data.errors) {
      for (const key in error.data.errors) {
        errors.value[key] = error.data.errors[key][0];
      }
      toast.add({
        title: 'Помилка валідації на сервері',
        description: 'Перевірте введені дані та спробуйте ще раз.',
        icon: 'i-heroicons-exclamation-triangle',
        color: 'yellow'
      });
    } else {
      toast.add({
        title: 'Помилка',
        description: 'Виникла помилка під час оновлення категорії.',
        icon: 'i-heroicons-x-circle',
        color: 'red'
      });
    }
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  fetchCategoriesForSelect();
});
</script>

<style scoped>
</style>