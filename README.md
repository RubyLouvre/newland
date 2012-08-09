newland
===============================

<p>如果说前端是维斯特洛大陆，那么后端是更为古老先进的瓦雷利亚大陆!</p>
<p>注:上面的地名出自《冰与火之歌》</p>

<p>前端的世界基本定形了，谁也消灭不了谁</p>
<p>在jquery崛起之后，有许多框架消亡了，如MochiKit。上代王者Prototype更新缓慢，但百足巨虫僵而未死，
    受它的启迪，一拔人从OO角度进行改良，诞生了mootools，一拔人从函数式编程角度进度改良，诞生了underscore。
    dojo拥有IBM等后台，最新版完全支持AMD。YUI是上上上代互联网巨头雅虎的产品，设计精良。EXT是YUI出走的孩子，UI库的典范，它的团队精力充沛，
    还用node.js搭建了express.js这著名框架。</p>
<table width="100%">
    <tr>
        <td>jquery</td><td>Prototype</td><td>mootools</td><td>EXT </td><td>dojo</td><td>YUI</td><td>underscore</td>
    </tr>
    <tr>
        <td>风暴地</td><td>北境</td><td>西境</td><td>河湾地 </td><td>多恩（南境）</td><td>谷地</td><td>河间</td>
    </tr>
    <tr>
        <td>风息堡</td><td>临冬城</td><td>凯岩城</td><td>高庭 </td><td>阳戟城</td><td>鹰巢城</td><td>奔流城</td>
    </tr>
    <tr>
        <td>鹿</td><td>狼</td><td>狮</td><td>玫瑰</td><td>太阳</td><td>鹰</td><td>鱼</td>
    </tr>
    <tr>
        <td>拜拉席恩</td><td>史塔克</td><td>兰尼斯特</td><td>提利尔</td><td>马泰尔</td><td>艾林</td><td>徒利</td>
    </tr>

</table>
<p>此外，</p>
<p>后端比较出彩的四大框架：tower,derby,express,railsway。</p>
<p>前端比较出彩的MVC框架：ember,angular,knockout,backbone。</p>

<p>从历史趋来看，前端往后端进发是必然的事，有个术语好像叫什么大前端。就是一帮苦逼的码农，基本是PHPer，他们负责整个页面的生成与脚本交互。</p>
<p>但前端的技术发展得这么快，一般PHPer很难跟进的，因此由专业的JSer接手是势在必行了，因为PHPer最重要的工作，页面接装模板，
从ruby世界的好事者已经搞了许多套，前端模板已为大家所接受，但我们没有必要用两套模板，node.js的出现让这成为可能。
而且页面的各种性能优化都与请求头，HTTP协议息息相关，JSer想搞高自己的水平，也要了解这一部分知识，如果搞最赚钱的页游，socket等知识也是必需的。</p>

<p>一个明显的例子，像Sencha这个公司，它前端拥有EXT，EXT在4.0中完成MVC机制与模块加载机制，后端拥有express框架，十年前，很难想象有人竟然靠JS赚钱开公司！
这是前端大翻身的机会，几个前端只要有创意，就可以踢开PM开发自己的产品了，不需求助于PHPer, javaer……</p>

<p>newland就是基于这样的情愫搞出来的，带领JSer驶向一个新世界。</p>

===============================

<h2>目录构成与模块说明</h2>

<p>实在非常抱歉，现在整个项目文件非常混乱，就像西班牙殖民者驾着其破船，乱打乱撞发现新大陆，兴奋之余，船只撞到海岸的礁石上，到处是碎片，也不知怎么办……</p>

<p>不过，首要任务是活下来，在瓦雷利亚的海滩上建立一个小渔村或农舍！</p>

<p〉这个广裘的大陆上有着许多帝国，前端的七大王国，相对它们来说就是部落国而已。因此我的小框架绝对也引不起它们的注意……</p>
<pre>
mass.js 框架的入口
├─app
│  ├─cache
│  ├─config
│  ├─controllers
│  ├─errors
│  ├─helpers
│  ├─logs
│  ├─models
│  ├─public
│  │   ├─scripts
│  │   ├─styles
│  │   └─images
│  ├─config.js 配置文件,现在就只用到它的端口:8888
│  └─views
├─system
│  ├─more
    │   └─here_document.js 模拟其他语言的here document语法
    ├─mime
    ├─deploy.js  热启动
    ├─mime.js  用于从请求头中取出正确的MIME
    ├─ejs.js   模板系统
    ├─view.js  用于拼装页面,一般情况页面都有两个部分组成(用于显示主要内容的局部模板与布局用的全局模板)
    ├─flow.js  用于处理node.js操作的回调嵌套问题,类似于发布者订阅者模式
    ├─hjs.js   高层次的IO API,就像前端的DOM操作一样,原生的那一套在jQuery那样的API下黯然失色
    ├─lang.js  就是前端mass的lang模块,不过它前后端通吃,里面大量工具函数
    ├─lang_fix.js lang.js的补丁模块
    ├─status.js  各种状态码,用于错误页面
    ├─server.js   newland框架的二当家,用于接受各种情况,派发数据


</pre>
<p>另外还有许多文件，这都是我上一次来这片大陆时，撞沉后的海盗船碎片，不用过于介怀！</p>

<h3>试用</h3>
<p>安装node.js,下载newland项目,命令台定位到newland目录下,然后node mass.js.在浏览器下http://localhost:8888/</p>
<h3>wiki</h3>
<p>光是一个readme是无法把什么都说明白，更多有用的资料我放到<a href="https://github.com/RubyLouvre/newland/wiki">wiki</a>上了！</p>






