<template>
  <div class="enter-box">
    <div class="flesh">
      <div class="eitem enter" @click="goBackPage">编辑菜单</div>
    </div>
  </div>
</template>

<script setup>
  import nav from "../../../configs/nav.js";
  import { navStorage } from '../../../components/controlCenter/sabre.js';

  const goBackPage = () => {
    const currNav = window.location.pathname.toString();
    const navInfo = nav.find(ni => ni.link == currNav);
    navStorage(navInfo);
    window.location.href = `/meEditor/menu`;
  }
</script>

<style lang="less" scoped>
  .enter-box {
    padding: 0 32px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    color: var(--vp-c-text-1);

    .flesh {
      margin: 0 auto;
      max-width: calc(var(--vp-layout-max-width) - 64px);
      display: flex;
      flex-direction: row;
      justify-content: flex-end;

      .eitem {

      }
    }
  }
</style>