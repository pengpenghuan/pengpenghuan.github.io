<template>
  <div class="placeholder"></div>

  <div id="editor-box" class="editor-box">
    <div class="crumb-box">
      <div class="flesh">
        <span class="nav">{{ nav }}</span>/
        <span class="doc">{{ doc?.text }}</span>
      </div>
    </div>

    <div class="operation-box">
      <xl-button type="primary" @click="save()">保存</xl-button>
    </div>
    <div class="mdeditor-box">
      <MdEditor v-model="text" />
    </div>
  </div>
</template>

<script setup>
  import { onMounted, ref } from "../../../cache/deps/vue.js";
  import { MdEditor } from 'md-editor-v3';
  import {loadFile, getNavItem, navStorage, getApiProxy} from '../sabre.js';
  import axios from 'axios';
  // import nav from '../../../configs/nav.js';

  const apiProxy = ref('');
  const nav = ref('');
  const doc = ref(null);
  const text = ref('');
  const path = ref('');
  const navInfo = ref(null);

  onMounted(() => {
    const location = window.location.href;
    const lpath = location.substring(location.indexOf('?') + 1);
    console.log('md editor : ', location, lpath);
    const fileStr = loadFile('/'+lpath);

    if(fileStr != null) {
      text.value = fileStr;
      path.value = lpath;
      // console.log('mdeditor index : ', lpath);

      const navDir = lpath.substring(0, lpath.lastIndexOf('/')+1);
      navInfo.value = getNavItem(navDir);
      navStorage(navInfo.value);
      nav.value = navInfo.value.text;

      // loadMenuList();

      apiProxy.value = getApiProxy();
    }
  })


  const loadMenuList = async () => {
    const comPath = `../../../configs/${navInfo.value.link}index`;
    // const comPath = `/config/docList${navInfo.value.link}index`;
    console.log('loadMenuList doc list path : ', comPath);
    const comModule = await import(comPath);
    const menuDef = comModule.default;
    const list = menuDef[0].items;
    const cdoc = list.find(li => {
      return ('/'+path.value).indexOf(li.link) != -1;
    })
    doc.value = cdoc;
  }

  const save = () => {
    const tpath = path.value;
    const fileName = tpath.substr(tpath.lastIndexOf('/')+1);
    const fileData = {
      topicId: navInfo.value.id,
      topicLink: navInfo.value.link,
      fileContent: text.value,
      fileName: fileName,
      filePath: path.value,
    };
    axios.post(apiProxy.value+'addFile', fileData)
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
  .placeholder {
    height: 200px;
  }

  .editor-box {
    color: #2c3e50;
    width: 1800px;
    position: absolute;
    top: -60px;
    left: -400px;
    background: #ffffff;
    padding: 10px;
    border-radius: 4px;

    .crumb-box {
      font-size: 16px;
    }

    .operation-box {
      text-align: right;
      padding: 8px 0;
    }

    .mdeditor-box {
    }
  }
</style>
