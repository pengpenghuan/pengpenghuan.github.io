<template>
  <div class="menu-editor-box">
    <h1 class="title">{{ title }}</h1>

    <div class="nav-menu-list">
      <div class="nav-menu-item" v-for="nmitem in navMenuList" :key="nmitem.id">
        <div class="nmicube text">{{ nmitem.text }}</div>
        <div class="nmicube filename">{{ nmitem.fileName }}</div>
      </div>
    </div>

    <div class="operation-box">
      <div class="new-file-unit">
        <input type="text" placeholder="请输入菜单名称" v-model="newMenuName" />
        <input type="text" placeholder="请输入文件名" v-model="newFileName" />
      </div>
      <xl-button type="primary" class="add" @click="saveMenu()">保存新菜单</xl-button>
    </div>
  </div>
</template>

<script setup>
  import { onMounted, ref } from "../../../cache/deps/vue.js";
  import { getNavStorage, getApiProxy } from '../sabre.js';
  import axios from 'axios';
  // import menu from '../../../configs/video/index';

  const apiProxy = ref('');
  const title = ref(null);
  const navInfo = ref({});
  const navMenuList = ref([]);

  const newMenuName = ref('测试文档1');
  const newFileName = ref('test1');

  // 运行环境 dev | prod
  const env = 'prod';

  onMounted(() => {
    const navStorage = getNavStorage();
    if(navStorage == null) {
      window.location.href = `/`;
    }else{
      navInfo.value = navStorage;
      title.value = navInfo.value.text;

      loadMenuList();

      apiProxy.value = getApiProxy();
    }
  })

  const loadMenuList = async () => {
    const comPath = `../../../configs${navInfo.value.link}index`;
    // const comPath = `/config/docList${navInfo.value.link}index`;
    console.log('loadMenuList doc list path : ', comPath);
    const comModule = await import(comPath);
    const menuDef = comModule.default;
    const list = menuDef[0].items;
    list.forEach(li => {
      li.fileName = li.link.substr(li.link.lastIndexOf('/')+1);
    })
    navMenuList.value = list;
    // console.log('menu : ', menu);
    // console.log('comModule : ', comModule);
    // console.log('menuDef : ', menuDef);
    // console.log('comPath : ', comPath, 'navMenuList : ', navMenuList.value);
  }

  const saveMenu = () => {
    const menuData = {
      topicId: navInfo.value.id,
      topicLink: navInfo.value.link,
      newMenuName: newMenuName.value,
      newFileName: newFileName.value,
    };
    axios.post(apiProxy.value+'addMenu', menuData)
        .then(function (res) {
          console.log(res);
          alert(res.data.data);
        })
        .catch(function (error) {
          console.log(error);
        });
  }
</script>

<style lang="less" scoped>
  .menu-editor-box {

    .nav-menu-list {

      .nav-menu-item {
        display: flex;
        flex-direction: row;

        .nmicube {
          padding: 8px 6px;
        }

        .text {

        }
        .filename {

        }
      }
    }

    .operation-box {
      display: flex;
      flex-direction: row;

      .new-file-unit {
        display: flex;
        flex-direction: row;

        input {
          margin: 0 6px 0 6px;
          border: 1px solid #d5cccc;
          padding: 4px 20px;
          border-radius: 4px;
        }
      }
    }
  }
</style>