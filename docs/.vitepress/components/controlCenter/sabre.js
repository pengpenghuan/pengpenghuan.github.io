import nav from '../../configs/nav.js';

/**
 * 加载本地文件内容
 * */
const loadFile = (filePath) => {
    console.log('loadFile filePath : ', filePath);
    let xhr = new XMLHttpRequest(),
        okStatus = document.location.protocol === "file:" ? 0 : 200;
    xhr.open('GET', filePath, false);
    xhr.overrideMimeType("text/html;charset=utf-8");//默认为utf-8
    xhr.send(null);
    console.log(filePath, 'loadFile filePath response : ', xhr);
    return xhr.status === okStatus ? xhr.responseText : null;
}

/**
 * 读取API服务器配置
 * overrideMimeType：text/html、application/json
 * */
const loadAPIServer = () => {
    const path = '/config/server.txt';
    let xhr = new XMLHttpRequest(),
        okStatus = document.location.protocol === "file:" ? 0 : 200;
    xhr.open('GET', path, false);
    xhr.overrideMimeType("text/html;charset=utf-8");//默认为utf-8
    xhr.send(null);
    return xhr.status === okStatus ? xhr.responseText : null;
}

const getApiProxy = () => {
    const server = loadAPIServer();
    return server || null;
}

/**
 * 缓存当前路由
 * */
const navStorage = (navInfo) => {
    sessionStorage.setItem('navInfo', JSON.stringify(navInfo));
}

/**
 * 获取sessionStorage 当前路由
 * （此处有个坑，打开多个项目页面navInfo信息就会错乱）
 * */
const getNavStorage = () => {
    const navInfoStr = sessionStorage.getItem('navInfo');
    if(navInfoStr == 'undefined') {
        return null;
    }else{
        const navInfo = JSON.parse(navInfoStr);
        return navInfo;
    }
}

/**
 * 从nav获取某一项的内容
 * 此方法要求nav配置中的id字段必须为数值，或者数值字符串
 * */
const getNavItem = (value) => {
    if(!value || value == '') return null;

    let matField = 'text';
    if(value.indexOf('/') != -1) {
        matField = 'link';
    }else if(!isNaN(parseInt(value))) {
        matField = 'id';
    }
    const navInfo = nav.find(ni => ni[matField].indexOf(value) != -1);
    return navInfo;
}

export {
    loadFile,
    loadAPIServer,
    getApiProxy,
    getNavStorage,
    navStorage,
    getNavItem,
};