<template>
  <div>
    <h1>Список блог-постів</h1>
    <PostsTableComponent />
  </div>
</template>

<script setup lang="ts">
import PostsTableComponent from '~/components/PostsTableComponent.vue';
</script>

<style scoped>
h1 {
  text-align: center;
  font-size: 2em;
  margin-bottom: 1em;
  color: #333;
}
</style>