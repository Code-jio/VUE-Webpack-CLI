<template>
  <div class="App">
    <h1 class="title">hello App</h1>
    <el-button type="primary">卧槽 按钮</el-button>
    <ul>
      <li>
        <router-link to="/home"> Home </router-link>
      </li>
      <li>
        <router-link to="/about"> About </router-link>
      </li>
    </ul>

    <router-view />
  </div>
</template>

<script>
import { ElButton } from "element-plus";
export default {
  name: "App",
  components: { ElButton },
};
</script>

<style>
.title {
  color: gray;
}
</style>
