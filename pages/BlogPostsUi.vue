<template>
  <div class="container">
    <div class="table-card">

      <div class="card-header">
        <h2>Blog Posts</h2>
        <p class="pagination-label" style="margin-top: 0.25rem;">Manage your blog content</p>
      </div>

      <div class="table-wrapper">
        <UTable
            ref="table"
            v-model:pagination="pagination"
            :data="posts"
            :columns="columns"
            :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
            class="main-table"
            :thead-class="'table-thead'"
            :tbody-tr-class="'table-row'"
            :tbody-td-class="'table-cell'"
            :th-class="'table-th'"
        />
      </div>

      <div class="footer-pagination">
        <div class="pagination-control">
          <div class="pagination-label">
            Showing {{ ((pagination.pageIndex) * pagination.pageSize) + 1 }} to
            {{ Math.min((pagination.pageIndex + 1) * pagination.pageSize, posts.length) }}
            of {{ posts.length }} results
          </div>
          <UPagination
              :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
              :items-per-page="table?.tableApi?.getState().pagination.pageSize"
              :total="table?.tableApi?.getFilteredRowModel().rows.length"
              @update:page="p => table?.tableApi?.setPageIndex(p - 1)"
              class="page-select"
          />
        </div>
      </div>

    </div>
  </div>
</template>


<script setup lang="ts">
import { ref } from 'vue'
import { getPaginationRowModel } from '@tanstack/vue-table'
import type { TableColumn } from '@nuxt/ui'

const table = ref()

type Post = {
  id: string
  name: string
  category: string
  title: string
  date: string
}

const posts = ref<Post[]>([])

const getPosts = async () => {
  try {
    let allPosts: Post[] = []
    let currentPage = 1
    let lastPage = 1

    do {
      const response = await $fetch(`http://localhost:8000/api/blog/posts?page=${currentPage}`)
      const pagePosts = response.data.map((post: any) => ({
        id: String(post.id),
        name: post.user?.name || '',
        category: post.category?.title || '',
        title: post.title,
        date: post.published_at
      })) as Post[]

      allPosts = allPosts.concat(pagePosts)
      lastPage = response.meta.last_page
      currentPage++
    } while (currentPage <= lastPage)

    posts.value = allPosts
  } catch (error) {
    console.error('Помилка отримання постів:', error)
  }
}


getPosts()

const columns: TableColumn<Post>[] = [
  {
    accessorKey: 'id',
    header: '#',
    cell: ({ row }) => `#${row.getValue('id')}`
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => {
      return new Date(row.getValue('date')).toLocaleString('en-US', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    }
  },
  {
    accessorKey: 'name',
    header: 'Author'
  },
  {
    accessorKey: 'category',
    header: 'Category'
  },
  {
    accessorKey: 'title',
    header: 'Title'
  }
]

const pagination = ref({
  pageIndex: 0,
  pageSize: 10
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 2rem;
  color: #1a202c;
}

.button-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.table-card {
  max-width: 100%;
  margin: 0 auto;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
  background-color: #ffffff;
  overflow: hidden;
}

.card-header {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a202c;
  padding: 1.25rem 2rem;
  border-bottom: 1px solid #edf2f7;
  margin-bottom: 0;
}

.search-bar {
  display: flex;
  padding: 1rem 2rem;
  border-bottom: 1px solid #edf2f7;
  background-color: #ffffff;
}

.search-input {
  width: 100%;
}

.table-wrapper {
  overflow-x: auto;
}

.main-table {
  width: 100%;
  border-collapse: collapse;
}

.main-table :deep(thead) {
  background-color: rgba(249, 250, 251, 0.5);
}

.main-table :deep(th) {
  padding: 0.75rem 2rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.main-table :deep(tbody tr) {
  border-bottom: 1px solid #f7fafc;
  transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-duration: 150ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.main-table :deep(tbody tr:hover) {
  background-color: rgba(249, 250, 251, 0.3);
}

.main-table :deep(td) {
  padding: 1rem 2rem;
  font-size: 0.875rem;
  color: #374151;
}

.table-id {
  color: #6b7280;
  font-size: 0.875rem;
}

.active-link {
  color: #3b82f6;
  font-weight: 500;
  text-decoration: none;
}

.inactive-link {
  color: #4a5568;
  text-decoration: none;
}

.active-link:hover,
.inactive-link:hover {
  text-decoration: underline;
}

.footer-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  border-top: 1px solid #edf2f7;
  background-color: rgba(249, 250, 251, 0.3);
  min-height: 60px;
  flex-wrap: nowrap;
}

.pagination-control {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 1rem;
}

.pagination-label {
  font-size: 0.875rem;
  color: #6b7280;
  white-space: nowrap;
  flex-shrink: 0;
}

.page-select {
  flex-shrink: 0;
}

.footer-pagination :deep(.upagination) {
  display: flex;
  gap: 0.125rem;
  align-items: center;
  flex-wrap: nowrap;
}

.footer-pagination :deep(.upagination button) {
  background-color: white;
  border: 1px solid #e5e7eb;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

.footer-pagination :deep(.upagination button:hover:not(:disabled)) {
  background-color: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.footer-pagination :deep(.upagination button[aria-current='true']) {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.footer-pagination :deep(.upagination button:disabled) {
  opacity: 0.4;
  cursor: not-allowed;
  background-color: #f9fafb;
  color: #9ca3af;
}

.footer-pagination :deep(.upagination button:first-child),
.footer-pagination :deep(.upagination button:last-child) {
  font-weight: 600;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .footer-pagination {
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem 1rem;
  }

  .pagination-control {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .pagination-label {
    text-align: center;
  }
}

@media (max-width: 480px) {
  .footer-pagination :deep(.upagination button) {
    padding: 0.375rem 0.5rem;
    min-width: 2rem;
    height: 2rem;
    font-size: 0.8125rem;
  }
}
</style>