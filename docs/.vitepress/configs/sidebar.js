import videoSidebar from './video/index.js'
import emergencySidebar from './emergency/index.js'
// import videoSidebar from '../public/video/index.js'

const docListRootPath = '../config'

const sidebar = {
  '/api/': getApiSidebar(),
  '/components/': getComponentsSidebar(),
  '/video/': getVideoSidebar(),
  '/guide/': getGuideSidebar(),
  '/emergency/': getEmergencySidebar(),
}

function getApiSidebar() {
  return [
    {
      text: '功能',
      collapsible: true,
      items: [
        {
          text: '已实现',
          link: '/api/'
        },
      ]
    }
  ]
}

// 视觉AI平台
function getVideoSidebar() {
  return videoSidebar;
}
async function getDynVideoSidebar() {
  const comPath = `${docListRootPath}/docList/video/index.js`;
  const comModule = await import(comPath);
  const menuDef = comModule.default;
  const list = menuDef[0].items;
  console.log();
  return list;
}
// 生产应急平台
function getEmergencySidebar() {
    return emergencySidebar;
}
async function getDynEmergencySidebar() {
  const comPath = `${docListRootPath}/docList/emergency/index.js`;
  const comModule = await import(comPath);
  const menuDef = comModule.default;
  const list = menuDef[0].items;
  console.log();
  return list;
}

function getComponentsSidebar() {
  return [
    {
      text: '组件',
      items: [
        {
          text: 'Button 按钮',
          link: '/components/button'
        },
        {
          text: 'Tabs 标签页',
          link: '/components/tabs'
        },
        {
          text: 'Modal 对话框',
          link: '/components/modal'
        },
        {
          text: 'Tag 标签',
          link: '/components/tag'
        },
        {
          text: 'Vue 引用组件',
          link: '/components/vue'
        },
        {
          text: 'Vue Script',
          link: '/components/vue-script'
        }
      ]
    }
  ]
}

function getGuideSidebar() {
  return [
    {
      text: '指南',
      items: [
        {
          text: '文档1',
          link: '/guide/'
        },
        {
          text: '文档2',
          link: '/guide/button'
        },
        {
          text: '文档3',
          link: '/guide/modal'
        }
      ]
    }
  ]
}

export {
  sidebar,
  getApiSidebar,
  getVideoSidebar,
  getDynVideoSidebar,
  getEmergencySidebar,
  getDynEmergencySidebar,
  getComponentsSidebar,
  getGuideSidebar,
}

