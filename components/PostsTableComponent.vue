<template>
  <div class="container">
    <div class="flex-center">
      <div class="wrapper">
        <nav class="nav">
          <a href="/admin/blog/posts/create" class="btn-add">Додати</a>
        </nav>
        <div class="table-container">
          <div class="table-padding">
            <table class="styled-table">
              <thead>
              <tr>
                <th>#</th>
                <th>Автор</th>
                <th>Категорія</th>
                <th>Заголовок</th>
                <th>Дата публікації</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="post in posts" :key="post.id" :class="{ 'bg-gray-100': !post.is_published }">
                <td>{{ post.id }}</td>
                <td>{{ post.user.name }}</td>
                <td>{{ post.category.title }}</td>
                <td class="link">
                  <a :href="'/admin/blog/posts/' + post.id + '/edit'">{{ post.title }}</a>
                </td>
                <td>
                  {{ post.published_at ? new Date(post.published_at).toLocaleDateString('uk-UA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '' }}
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Post {
  id: number;
  title: string;
  slug: string;
  is_published: boolean;
  published_at: string | null;
  user_id: number;
  category_id: number;
  user: { name: string };
  category: { title: string };
}

const posts = ref<Post[]>([]);

const config = useRuntimeConfig();

const getPosts = async () => {
  try {
    const apiUrl = `${config.public.apiBase}/blog/posts`;
    console.log("Fetching from URL:", apiUrl);

    const response = await $fetch<{ data: Post[] }>(apiUrl);
    console.log("API Response:", response);
    posts.value = response.data;
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
};

onMounted(() => {
  getPosts();
});
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}
.flex-center {
  display: flex;
  justify-content: center;
}
.wrapper {
  width: 100%;
  max-width: 960px;
}
.nav {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}
.btn-add {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border-radius: 0.375rem;
  text-decoration: none;
  transition: background-color 0.3s;
}
.btn-add:hover {
  background-color: #2563eb;
}
.table-container {
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
  overflow: hidden;
}
.table-padding {
  padding: 1.5rem;
}
.styled-table {
  width: 100%;
  border-collapse: collapse;
}
.styled-table thead {
  background-color: #f9fafb;
}
.styled-table th {
  text-align: left;
  padding: 0.75rem 1.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
}
.styled-table td {
  padding: 1rem 1.5rem;
  font-size: 0.875rem;
  color: #374151;
  white-space: nowrap;
}
.styled-table tbody tr {
  border-top: 1px solid #e5e7eb;
}
.bg-gray-100 {
  background-color: #f3f4f6;
}
.link a {
  color: #2563eb;
  text-decoration: none;
}
.link a:hover {
  color: #1e40af;
}
</style>
