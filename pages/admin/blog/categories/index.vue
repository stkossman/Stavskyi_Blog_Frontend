<template>
  <div class="container max-w-7xl mx-auto p-6">
    <h1 class="text-3xl font-bold text-center mb-8">Список категорій блогу</h1>

    <div class="flex justify-center mb-6">
      <UButton icon="i-heroicons-plus-circle" to="/admin/blog/categories/create" color="primary">Додати категорію</UButton>
    </div>

    <UCard class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <template #header>
        <div class="px-8 py-4 border-b border-gray-100">
          <h2 class="text-xl font-semibold text-gray-900">Управління категоріями</h2>
          <p class="text-sm text-gray-500 mt-1">Перегляд та керування категоріями блогу</p>
        </div>
      </template>

      <div class="px-8 py-4 border-b border-gray-100 bg-white">
        <UInput v-model="q" placeholder="Пошук..." class="w-full" />
      </div>

      <div class="overflow-x-auto">
        <UTable
            :data="categories"
            :columns="columns"
            :loading="loading"
            sort-by="id"
            sort-asc="false"
            :empty-state="{ icon: 'i-heroicons-document-magnifying-glass', label: 'Немає категорій', description: 'Спробуйте змінити фільтри або додати нові.' }"
            class="w-full"
            :thead-class="'bg-gray-50/50'"
            :tbody-tr-class="'border-b border-gray-50 hover:bg-gray-50/30 transition-colors duration-150'"
            :tbody-td-class="'px-8 py-4 text-sm'"
            :th-class="'px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'"
        >
          <template #id-data="{ row }">
            <span class="text-gray-500 text-sm">{{ row.id }}</span>
          </template>
          <template #title-data="{ row }">
            <ULink :to="'/admin/blog/categories/' + row.id + '/edit'" active-class="text-primary" inactive-class="text-gray-500 hover:text-blue-600">
              {{ row.title }}
            </ULink>
          </template>
          <template #actions-data="{ row }">
            <UDropdown :items="items(row)">
              <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
            </UDropdown>
          </template>
        </UTable>
      </div>

      <div class="px-8 py-4 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between min-h-[60px] flex-wrap">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500 whitespace-nowrap">Показано:</span>
          <USelect v-model.number="perPage" :options="[5, 10, 20, 50]" class="w-20" />
        </div>
        <UPagination
            v-model="page"
            :page-count="perPage"
            :total="totalCategories"
            :max="5"
            :active-button="{ variant: 'outline' }"
            :inactive-button="{ color: 'gray' }"
            show-first
            show-last
            class="ml-auto"
        />
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { useRuntimeConfig, navigateTo } from '#app';
import { useToast } from '#imports';
import type { TableColumn } from '@nuxt/ui';

interface Category {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
}

const columns: TableColumn<Category>[] = [
  {
    accessorKey: 'id',
    header: '#',
    cell: ({ row }) => `#${row.getValue('id')}`
  },
  {
    accessorKey: 'title',
    header: 'Назва',
    sortable: true,
    cell: ({ row }) => {
      const id = row.original.id;
      const title = row.getValue('title');
      return h('a', {
        href: `/admin/blog/categories/${id}/edit`,
        class: 'text-blue-600 hover:text-blue-800 hover:underline',
        onClick: (e: Event) => {
          e.preventDefault();
          navigateTo(`/admin/blog/categories/${id}/edit`);
        }
      }, title);
    }
  },
  {
    accessorKey: 'slug',
    header: 'Slug',
    sortable: true
  },
  {
    accessorKey: 'description',
    header: 'Опис',
    cell: ({ row }) => {
      const description = row.getValue('description');
      return description ? String(description).substring(0, 50) + '...' : '-';
    }
  },
  {
    accessorKey: 'parent_id',
    header: 'Батьківська категорія',
    cell: ({ row }) => {
      const parentId = row.getValue('parent_id');
      return parentId ? `#${parentId}` : '-';
    }
  },
  {
    accessorKey: 'actions',
    header: 'Дії',
    cell: ({ row }) => {
      return h('div', {
        class: 'flex items-center gap-2'
      }, [
        h('button', {
          class: 'text-blue-600 hover:text-blue-800 text-sm',
          onClick: () => navigateTo(`/admin/blog/categories/${row.original.id}/edit`)
        }, 'Редагувати'),
        h('button', {
          class: 'text-red-600 hover:text-red-800 text-sm ml-2',
          onClick: () => deleteCategory(row.original.id)
        }, 'Видалити')
      ]);
    }
  }
];

const categories = ref<Category[]>([]);
const loading = ref(true);
const page = ref(1);
const perPage = ref(20);
const totalCategories = ref(0);
const q = ref('');

const config = useRuntimeConfig();
const toast = useToast();

const fetchCategories = async () => {
  loading.value = true;
  try {
    const apiUrl = `${config.public.apiBase}/blog/categories?page=${page.value}&per_page=${perPage.value}&search=${q.value}`;
    console.log("Fetching categories from URL:", apiUrl);

    const { data, meta } = await $fetch<{ data: Category[], meta: any }>(apiUrl);

    categories.value = data;
    totalCategories.value = meta.total;

    console.log("Categories after fetch and assignment:", categories.value);
    console.log("Total categories from meta:", totalCategories.value);
  } catch (error) {
    console.error("Error fetching categories:", error);
    toast.add({
      title: 'Помилка завантаження категорій',
      description: 'Не вдалося завантажити список категорій.',
      icon: 'i-heroicons-x-circle',
      color: 'red'
    });
    categories.value = [];
    totalCategories.value = 0;
  } finally {
    loading.value = false;
  }
};

const deleteCategory = async (id: number) => {
  if (!confirm('Ви впевнені, що хочете видалити цю категорію?')) {
    return;
  }

  try {
    await $fetch(`${config.public.apiBase}/blog/categories/${id}`, {
      method: 'DELETE'
    });
    toast.add({
      title: 'Категорію видалено',
      description: 'Категорія була успішно видалена.',
      icon: 'i-heroicons-check-circle',
      color: 'green'
    });
    fetchCategories();
  } catch (error) {
    console.error('Помилка видалення категорії:', error);
    toast.add({
      title: 'Помилка видалення',
      description: 'Не вдалося видалити категорію.',
      icon: 'i-heroicons-x-circle',
      color: 'red'
    });
  }
};

const items = (row: Category) => [
  [{
    label: 'Редагувати',
    icon: 'i-heroicons-pencil-square-20-solid',
    click: () => navigateTo(`/admin/blog/categories/${row.id}/edit`)
  }, {
    label: 'Видалити',
    icon: 'i-heroicons-trash-20-solid',
    click: () => deleteCategory(row.id)
  }]
];

watch([page, perPage], () => {
  fetchCategories();
});

watch(q, (newQ) => {
  const debounce = setTimeout(() => {
    page.value = 1;
    fetchCategories();
  }, 300);
  return () => clearTimeout(debounce);
});

onMounted(() => {
  fetchCategories();
});
</script>

<style scoped>

</style>