<template>
  <div class="post-container">
    <UCard v-if="post" class="post-card">
      <template #header>
        <div class="post-header">
          <h1 class="post-title">{{ post.title }}</h1>
          <div class="post-meta">
            <span v-if="post.user" class="post-author">Автор: {{ post.user.name }}</span>
            <span v-if="post.category" class="post-category">Категорія: {{ post.category.title }}</span>
            <span class="post-published-at">Опубліковано: {{ formatDate(post.published_at) }}</span>
            <UBadge :color="post.is_published ? 'emerald' : 'orange'" variant="subtle">
              {{ post.is_published ? 'Опубліковано' : 'Чернетка' }}
            </UBadge>
          </div>
        </div>
      </template>

      <div class="post-content" v-html="post.content_html"></div>

      <template #footer>
        <div class="post-footer">
          <UButton icon="i-heroicons-arrow-left" to="/BlogPostsUi" color="gray" variant="ghost">
            Повернутися до списку
          </UButton>
        </div>
      </template>
    </UCard>
    <div v-else-if="loading" class="loading-state">
      <p>Завантаження посту...</p>
      <UProgress animation="carousel" class="mt-4" />
    </div>
    <UCard v-else class="not-found-card">
      <template #header>
        <h2 class="text-xl font-semibold">Пост не знайдено</h2>
      </template>
      <p>Схоже, запитуваної статті не існує або вона була видалена.</p>
      <template #footer>
        <UButton to="/BlogPostsUi" color="gray">Повернутися до списку постів</UButton>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useRuntimeConfig } from '#app';

interface Post {
  id: number;
  title: string;
  slug: string;
  content_html: string;
  content_raw: string;
  is_published: boolean;
  published_at: string | null;
  user: { name: string };
  category: { title: string };
}

const route = useRoute();
const config = useRuntimeConfig();
const slug = ref<string | string[]>(route.params.slug);
const post = ref<Post | null>(null);
const loading = ref(true);

const fetchPost = async () => {
  loading.value = true;
  try {
    const apiUrl = `${config.public.apiBase}/blog/posts/${slug.value}`;
    console.log("Fetching single post from URL:", apiUrl);

    const response = await $fetch<Post>(apiUrl);
    post.value = response;

  } catch (error: any) {
    console.error("Error fetching post:", error);
    if (error.statusCode === 404) {
      post.value = null;
    } else {
      alert('Виникла помилка при завантаженні посту.');
    }
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'Не опубліковано';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('uk-UA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (e) {
    return dateString;
  }
};

onMounted(() => {
  if (slug.value) {
    fetchPost();
  }
});
</script>

<style scoped>
.post-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
}

.post-card {
  margin-top: 1rem;
}

.post-header {
  text-align: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.post-title {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.post-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.post-meta span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.post-content {
  padding: 1.5rem 0;
  line-height: 1.6;
  font-size: 1.125rem;
  color: #374151;
}

.post-content p {
  margin-bottom: 1rem;
}

.post-content img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.loading-state, .not-found-card {
  text-align: center;
  padding: 2rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background-color: #fff;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}
</style>