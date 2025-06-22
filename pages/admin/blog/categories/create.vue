<template>
  <div class="container max-w-xl mx-auto p-6">
    <UCard class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <template #header>
        <div class="px-8 py-4 border-b border-gray-100">
          <h1 class="text-xl font-semibold text-gray-900">Створити категорію</h1>
          <p class="text-sm text-gray-500 mt-1">Заповніть форму для додавання нової категорії блогу</p>
        </div>
      </template>

      <UForm
          :schema="schema"
          :state="state"
          class="px-8 py-6 flex flex-col gap-6"
          @submit="onSubmit"
      >
        <UFormGroup
            label="Назва категорії"
            name="title"
            help="Мінімум 3 символи, максимум 200"
            :error="errors.title"
        >
          <UInput v-model="state.title" />
        </UFormGroup>

        <UFormGroup
            label="Slug (Псевдонім)"
            name="slug"
            help="Залиште порожнім для автоматичної генерації"
            :error="errors.slug"
        >
          <UInput v-model="state.slug" placeholder="category-slug" />
        </UFormGroup>

        <UFormGroup
            label="Опис"
            name="description"
            help="Максимум 500 символів"
            :error="errors.description"
        >
          <UTextarea v-model="state.description" :rows="3" placeholder="Опишіть категорію..." />
        </UFormGroup>

        <UFormGroup label="Батьківська категорія" name="parent_id" :error="errors.parent_id">
          <select
              v-model="state.parent_id"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              :class="{ 'border-red-500 focus:ring-red-500 focus:border-red-500': errors.parent_id }"
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
        </UFormGroup>

        <div class="flex justify-end gap-3 px-0 py-4 border-t border-gray-100 mt-6">
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
            <template v-else>Зберегти категорію</template>
          </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { z } from 'zod';
import { useToast } from '#imports';
import { useRuntimeConfig, navigateTo } from '#app';

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
      .max(200, 'Назва не може перевищувати 200 символів')
      .trim(),
  slug: z.string()
      .max(200, 'Slug не може перевищувати 200 символів')
      .trim()
      .optional()
      .or(z.literal('')),
  description: z.string()
      .max(500, 'Опис не може перевищувати 500 символів')
      .trim()
      .optional()
      .or(z.literal('')),
  parent_id: z.union([
    z.number().int().positive(),
    z.null(),
    z.literal(''),
    z.undefined()
  ]).transform(val => {
    if (val === '' || val === undefined) return null;
    return val;
  }),
});

type CategoryForm = z.infer<typeof schema>;

const state = ref<CategoryForm>({
  title: '',
  slug: '',
  description: '',
  parent_id: null,
});

const errors = ref<Record<string, string>>({});
const isSubmitting = ref(false);
const toast = useToast();
const config = useRuntimeConfig();
const availableCategories = ref<Category[]>([]);

const fetchCategoriesForSelect = async () => {
  try {
    const response = await $fetch<{ data: Category[] }>(`${config.public.apiBase}/blog/categories?per_page=1000`);
    availableCategories.value = response?.data || [];
  } catch (error) {
    toast.add({
      title: 'Помилка завантаження списку категорій',
      description: 'Не вдалося завантажити список батьківських категорій.',
      icon: 'i-heroicons-x-circle',
      color: 'red'
    });
  }
};

const onSubmit = async () => {
  errors.value = {};
  isSubmitting.value = true;

  try {
    const validatedData = schema.parse(state.value);

    await $fetch(`${config.public.apiBase}/blog/categories`, {
      method: 'POST',
      body: validatedData,
    });

    toast.add({
      title: 'Категорію створено',
      description: 'Категорія була успішно додана.',
      icon: 'i-heroicons-check-circle',
      color: 'green'
    });

    navigateTo('/admin/blog/categories');

  } catch (error: any) {
    console.log('Error caught:', error);

    if (error instanceof z.ZodError) {
      error.errors.forEach(err => {
        const fieldName = err.path[0] as string;
        errors.value[fieldName] = err.message;
      });

      toast.add({
        title: 'Помилка валідації',
        description: 'Будь ласка, перевірте введені дані.',
        icon: 'i-heroicons-exclamation-triangle',
        color: 'yellow'
      });
      return;
    }

    if (error.status === 422 || error.statusCode === 422) {
      const serverErrors = error.data?.errors || error.response?._data?.errors;

      if (serverErrors) {
        Object.keys(serverErrors).forEach(key => {
          const errorMessage = Array.isArray(serverErrors[key])
              ? serverErrors[key][0]
              : serverErrors[key];
          errors.value[key] = errorMessage;
        });

        toast.add({
          title: 'Помилка валідації',
          description: 'Перевірте введені дані та спробуйте ще раз.',
          icon: 'i-heroicons-exclamation-triangle',
          color: 'yellow'
        });
      } else {
        toast.add({
          title: 'Помилка валідації на сервері',
          description: 'Сервер повернув помилку валідації.',
          icon: 'i-heroicons-exclamation-triangle',
          color: 'yellow'
        });
      }
    } else {
      toast.add({
        title: 'Помилка',
        description: error.message || 'Виникла помилка під час створення категорії.',
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