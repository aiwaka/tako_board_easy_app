<template>
  <div class="home">
    <h1>Tako Board</h1>
    <p>ちゃこちゃんのお世話管理アプリ</p>
    <img alt="tako" src="@/assets/tako.png" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Home",
});
</script>

<style lang="scss" scoped>
.home {
  > img {
    margin: 15px auto;
    width: 50%;
  }
}
</style>
