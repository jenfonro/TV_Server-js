<template>

	  <div class="app-shell flex min-h-screen">
	    <aside class="sidebar dashboard-sidebar flex-shrink-0 bg-white/40 dark:bg-[#0d1624] backdrop-blur-xl transition-all duration-300 border-r border-gray-200/50 dark:border-white/10 shadow-lg w-64 p-4 pt-6" style="backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)">
      <div class="text-xl font-bold text-green-600 mb-6 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layout-dashboard"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M3 9h18"></path><path d="M9 21V9"></path></svg>
        管理后台
      </div>
      <nav class="space-y-1">
        <a href="/" class="nav-item group flex items-center rounded-lg px-3 py-2 pl-4 text-gray-700 hover:bg-gray-100/30 hover:text-green-600 dark:text-gray-100 dark:hover:bg-white/10 gap-3 justify-start transition-colors duration-200 min-h-[40px]">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-house h-5 w-5 text-gray-500 group-hover:text-green-600 dark:group-hover:text-green-400"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
          <span class="nav-label">回到首页</span>
        </a>
        <div v-if="bootstrap.user.role === 'admin'" class="space-y-1">
        <a data-admin="site" class="admin-nav nav-item group flex items-center rounded-lg px-3 py-2 pl-4 text-gray-700 hover:bg-gray-100/30 hover:text-green-600 data-[active=true]:bg-green-500/20 data-[active=true]:text-green-700 dark:text-gray-100 dark:hover:bg-white/10 dark:data-[active=true]:text-green-300 gap-3 justify-start transition-colors duration-200 min-h-[40px]" href="#">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          <span class="nav-label">站点设置</span>
        </a>
        <a data-admin="user" class="admin-nav nav-item group flex items-center rounded-lg px-3 py-2 pl-4 text-gray-700 hover:bg-gray-100/30 hover:text-green-600 data-[active=true]:bg-green-500/20 data-[active=true]:text-green-700 dark:text-gray-100 dark:hover:bg-white/10 dark:data-[active=true]:text-green-300 gap-3 justify-start transition-colors duration-200 min-h-[40px]" href="#">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users h-5 w-5 text-gray-500 group-hover:text-green-600 dark:group-hover:text-green-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <span class="nav-label">用户管理</span>
        </a>
	        <a data-admin="pan" class="admin-nav nav-item group flex items-center rounded-lg px-3 py-2 pl-4 text-gray-700 hover:bg-gray-100/30 hover:text-green-600 data-[active=true]:bg-green-500/20 data-[active=true]:text-green-700 dark:text-gray-100 dark:hover:bg-white/10 dark:data-[active=true]:text-green-300 gap-3 justify-start transition-colors duration-200 min-h-[40px]" href="#">
	          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud h-5 w-5 text-gray-500 group-hover:text-green-600 dark:group-hover:text-green-400"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h.79a4.5 4.5 0 1 1 1 9Z"></path></svg>
	          <span class="nav-label">网盘设置</span>
	        </a>
	        <a data-admin="interface" class="admin-nav nav-item group flex items-center rounded-lg px-3 py-2 pl-4 text-gray-700 hover:bg-gray-100/30 hover:text-green-600 data-[active=true]:bg-green-500/20 data-[active=true]:text-green-700 dark:text-gray-100 dark:hover:bg-white/10 dark:data-[active=true]:text-green-300 gap-3 justify-start transition-colors duration-200 min-h-[40px]" href="#">
	          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link-2 h-5 w-5 text-gray-500 group-hover:text-green-600 dark:group-hover:text-green-400"><path d="M15 7h3a5 5 0 0 1 0 10h-3"></path><path d="M9 17H6a5 5 0 0 1 0-10h3"></path><line x1="8" x2="16" y1="12" y2="12"></line></svg>
	          <span class="nav-label">接口设置</span>
	        </a>
	        <a data-admin="video" class="admin-nav nav-item group flex items-center rounded-lg px-3 py-2 pl-4 text-gray-700 hover:bg-gray-100/30 hover:text-green-600 data-[active=true]:bg-green-500/20 data-[active=true]:text-green-700 dark:text-gray-100 dark:hover:bg-white/10 dark:data-[active=true]:text-green-300 gap-3 justify-start transition-colors duration-200 min-h-[40px]" href="#">
	          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-film h-5 w-5 text-gray-500 group-hover:text-green-600 dark:group-hover:text-green-400"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M7 3v18"></path><path d="M3 7.5h4"></path><path d="M3 12h18"></path><path d="M3 16.5h4"></path><path d="M17 3v18"></path><path d="M17 7.5h4"></path><path d="M17 16.5h4"></path></svg>
	          <span class="nav-label">视频源管理</span>
	        </a>
        <a data-admin="search" class="admin-nav nav-item group flex items-center rounded-lg px-3 py-2 pl-4 text-gray-700 hover:bg-gray-100/30 hover:text-green-600 data-[active=true]:bg-green-500/20 data-[active=true]:text-green-700 dark:text-gray-100 dark:hover:bg-white/10 dark:data-[active=true]:text-green-300 gap-3 justify-start transition-colors duration-200 min-h-[40px]" href="#">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search h-5 w-5 text-gray-500 group-hover:text-green-600 dark:group-hover:text-green-400"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
          <span class="nav-label">站点搜索结果设置</span>
        </a>
        <a data-admin="magic" class="admin-nav nav-item group flex items-center rounded-lg px-3 py-2 pl-4 text-gray-700 hover:bg-gray-100/30 hover:text-green-600 data-[active=true]:bg-green-500/20 data-[active=true]:text-green-700 dark:text-gray-100 dark:hover:bg-white/10 dark:data-[active=true]:text-green-300 gap-3 justify-start transition-colors duration-200 min-h-[40px]" href="#">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wand-2 h-5 w-5 text-gray-500 group-hover:text-green-600 dark:group-hover:text-green-400"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2 18.99V22h3.01L21.64 5.36a1.21 1.21 0 0 0 0-1.72Z"></path><path d="m14 7 3 3"></path><path d="M5 6v4"></path><path d="M19 14v4"></path><path d="M10 2v2"></path><path d="M7 8H3"></path><path d="M21 16h-4"></path><path d="M11 3H9"></path></svg>
          <span class="nav-label">魔法匹配设置</span>
        </a>
        <a data-admin="live" class="admin-nav nav-item group flex items-center rounded-lg px-3 py-2 pl-4 text-gray-700 hover:bg-gray-100/30 hover:text-green-600 data-[active=true]:bg-green-500/20 data-[active=true]:text-green-700 dark:text-gray-100 dark:hover:bg-white/10 dark:data-[active=true]:text-green-300 gap-3 justify-start transition-colors duration-200 min-h-[40px]" href="#">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-radio h-5 w-5 text-gray-500 group-hover:text-green-600 dark:group-hover:text-green-400"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"></path><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"></path><circle cx="12" cy="12" r="2"></circle><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"></path><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"></path></svg>
          <span class="nav-label">直播源管理</span>
        </a>
        </div>
      </nav>
    </aside>
    <div class="flex-1 min-w-0 flex flex-col">
      <div class="flex-1 min-w-0 overflow-y-auto p-6 space-y-6">
        <div v-if="bootstrap.user.role !== 'admin'" class="min-h-[300px] flex flex-col items-center justify-center text-gray-600 gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-off text-gray-400"><path d="m19.69 14-4.8 4.8c-.55.55-1.29.86-2.06.87h-.66a3 3 0 0 1-2.21-.98l-5.32-5.69A2 2 0 0 1 4 11.38V5.53a2 2 0 0 1 1.23-1.84l5.52-2.21c.79-.32 1.68-.32 2.47 0l5.52 2.21A2 2 0 0 1 20 5.53V12"></path><path d="m2 2 20 20"></path></svg>
          <div class="text-lg font-semibold text-gray-700">非管理员用户</div>
          <div class="text-sm text-gray-500">当前账号没有访问管理后台的权限。</div>
        </div>
        <section v-if="bootstrap.user.role === 'admin'" id="adminSite" class="admin-panel">
          <form id="siteSettingsForm" method="post" action="/dashboard/site/save" class="space-y-4">
            <h3 class="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings h-5 w-5 text-gray-600 dark:text-gray-300"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              站点设置
            </h3>
	            <div>
	              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">站点名称</label>
	              <input name="siteName" class="tv-field"
	                     :value="bootstrap.siteName"
	                     placeholder="站点名称">
	            </div>
	            <div id="doubanSettings" class="space-y-4">
	            <div>
	              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">豆瓣数据代理</label>
	              <select name="doubanDataProxy" id="doubanDataSelect" class="custom-select tv-field">
                <option value="direct" :selected="bootstrap.settings.doubanDataProxy === 'direct'">直连（浏览器直接请求豆瓣）</option>
                <option value="cors" :selected="bootstrap.settings.doubanDataProxy === 'cors'">Cors Proxy By Zwei</option>
                <option value="cdn-tx" :selected="bootstrap.settings.doubanDataProxy === 'cdn-tx'">豆瓣 CDN By CMLiussss（腾讯云）</option>
                <option value="cdn-ali" :selected="bootstrap.settings.doubanDataProxy === 'cdn-ali'">豆瓣 CDN By CMLiussss（阿里云）</option>
                <option value="custom" :selected="bootstrap.settings.doubanDataProxy === 'custom'">自定义代理</option>
              </select>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">选择获取豆瓣数据的方式</p>
              <div id="doubanDataCustom" class="mt-2" :class="{ hidden: bootstrap.settings.doubanDataProxy !== 'custom' }">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">豆瓣代理地址</label>
                <input name="doubanDataCustom" class="tv-field"
                       placeholder="例如：https://proxy.example.com/fetch?url="
                       :value="bootstrap.settings.doubanDataCustom">
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">自定义代理服务器地址</p>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">豆瓣图片代理</label>
              <select name="doubanImgProxy" id="doubanImgSelect" class="custom-select tv-field">
                <option value="direct-browser" :selected="bootstrap.settings.doubanImgProxy === 'direct-browser'">直连（浏览器直接请求豆瓣）</option>
                <option value="server-proxy" :selected="bootstrap.settings.doubanImgProxy === 'server-proxy'">服务器代理（由服务器代理请求豆瓣）</option>
                <option value="douban-cdn-ali" :selected="bootstrap.settings.doubanImgProxy === 'douban-cdn-ali'">豆瓣官方精品 CDN（阿里云）</option>
                <option value="cdn-tx" :selected="bootstrap.settings.doubanImgProxy === 'cdn-tx'">豆瓣 CDN By CMLiussss（腾讯云）</option>
                <option value="cdn-ali" :selected="bootstrap.settings.doubanImgProxy === 'cdn-ali'">豆瓣 CDN By CMLiussss（阿里云）</option>
                <option value="custom" :selected="bootstrap.settings.doubanImgProxy === 'custom'">自定义代理</option>
              </select>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">选择获取豆瓣图片的方式</p>
              <div id="doubanImgCustom" class="mt-2" :class="{ hidden: bootstrap.settings.doubanImgProxy !== 'custom' }">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">豆瓣图片代理地址</label>
                <input name="doubanImgCustom" class="tv-field"
                       placeholder="例如：https://proxy.example.com/fetch?url="
                       :value="bootstrap.settings.doubanImgCustom">
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">自定义图片代理服务器地址</p>
              </div>
            </div>
            </div>
            <div class="pt-2 flex justify-start">
              <div class="flex flex-col gap-2">
                <button type="submit" class="btn-green">保存</button>
                <div id="saveStatus" class="text-sm hidden"></div>
              </div>
            </div>
          </form>
        </section>
        <section v-if="bootstrap.user.role === 'admin'" id="adminUser" class="admin-panel hidden space-y-4">
          <div class="flex items-center gap-2 text-gray-800 dark:text-gray-100 text-base font-semibold">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users h-5 w-5 text-gray-600 dark:text-gray-300"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            用户配置
          </div>
          <div class="stat-card">
            <div id="userCount" class="stat-main" v-text="bootstrap.userCount"></div>
            <div class="stat-label">总用户数</div>
          </div>
          <div class="admin-card">
            <div class="flex items-center justify-between mb-3">
              <div class="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                用户列表
                <button id="openAddUser" class="btn-green">添加用户</button>
              </div>
            </div>
            <div class="overflow-x-auto">
              <div class="inline-block w-max align-top">
                <form id="addUserForm" class="space-y-3 mb-4 w-full" method="post" action="/dashboard/user/add" hidden>
                  <div
                    class="grid items-center"
                    style="grid-template-columns:max-content 1fr;gap:14px 18px"
                  >
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">用户名：</span>
                    <input id="addUserName" name="username" class="tv-field" placeholder="用户名" autocomplete="off">

                    <span class="text-sm font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">密码：</span>
                    <input id="addUserPassword" name="password" type="password" class="tv-field tv-field-success" placeholder="密码" autocomplete="new-password">

                    <span class="text-sm font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">角色：</span>
                    <select id="addUserRole" name="role" class="tv-field">
                      <option value="user" selected>用户</option>
                      <option value="shared">共享</option>
                    </select>

                    <span class="text-sm font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">Cat接口：</span>
                    <input id="addUserCatApiBase" name="catApiBase" class="tv-field" placeholder="CatPawOpen 接口地址（可留空）" autocomplete="off">

                    <span class="text-sm font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">Cat代理：</span>
                    <input id="addUserCatProxy" name="catProxy" class="tv-field" placeholder="CatPawOpen 全局代理地址（可留空）" autocomplete="off">
                  </div>
                  <div class="flex justify-start">
                    <button id="confirmAddUser" class="btn-add" type="submit">添加</button>
                  </div>
                  <div id="addUserStatus" class="text-sm" hidden></div>
                </form>

                <table class="table-auto w-max text-sm text-left text-gray-700 dark:text-gray-100">
                  <thead class="table-head">
                    <tr>
                      <th class="px-3 py-2 whitespace-nowrap">用户名</th>
                      <th class="px-3 py-2 whitespace-nowrap">角色</th>
                      <th class="px-3 py-2 whitespace-nowrap">Cat接口</th>
                      <th class="px-3 py-2 whitespace-nowrap">Cat代理</th>
                      <th class="px-3 py-2 whitespace-nowrap">状态</th>
                      <th class="px-3 py-2 whitespace-nowrap">操作</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100 dark:divide-gray-800" id="userTableBody">
                    <tr v-for="u in (bootstrap.users || [])" :key="u.username"
                        :data-username="u.username"
                        :data-role="u.role"
                        :data-status="u.status"
                        :data-cat-api-base="u.cat_api_base || ''"
                        :data-cat-proxy="u.cat_proxy || ''">
                      <td class="px-3 py-2 font-semibold whitespace-nowrap">{{ u.username }}</td>
                      <td class="px-3 py-2 whitespace-nowrap" data-col="role">
                        <span v-if="u.role === 'admin'" class="tag-yellow">管理员</span>
                        <span v-else-if="u.role === 'shared'" class="tag-green">共享</span>
                        <span v-else class="tag-gray">用户</span>
                      </td>
                      <td class="px-3 py-2 whitespace-nowrap" data-col="catApiBase">
                        <span v-if="(u.cat_api_base || '').trim()" class="tag-green">已设置</span>
                        <span v-else class="tag-red">未设置</span>
                      </td>
                      <td class="px-3 py-2 whitespace-nowrap" data-col="catProxy">
                        <span v-if="(u.cat_proxy || '').trim()" class="tag-yellow">已设置</span>
                        <span v-else class="tag-green">未设置</span>
                      </td>
                      <td class="px-3 py-2 whitespace-nowrap" data-col="status">
                        <span v-if="u.status === 'active'" class="tag-green">正常</span>
                        <span v-else-if="u.status === 'banned'" class="tag-red">封禁</span>
                        <span v-else class="tag-gray">{{ u.status }}</span>
                      </td>
                      <td class="px-3 py-2 whitespace-nowrap">
                        <div class="action-group">
                          <button class="action-btn blue" type="button" data-action="edit">修改</button>
                          <button v-if="u.role !== 'admin'" class="action-btn rose" type="button" data-action="ban">{{ u.status === 'active' ? '封禁' : '解封' }}</button>
                          <button v-if="u.role !== 'admin'" class="action-btn red" type="button" data-action="delete">删除</button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
        <section v-if="bootstrap.user.role === 'admin'" id="adminVideo" class="admin-panel hidden space-y-6">
          <div class="flex items-center gap-2 text-gray-800 dark:text-gray-100 text-base font-semibold">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-film h-5 w-5 text-gray-600 dark:text-gray-300"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M7 3v18"></path><path d="M3 7.5h4"></path><path d="M3 12h18"></path><path d="M3 16.5h4"></path><path d="M17 3v18"></path><path d="M17 7.5h4"></path><path d="M17 16.5h4"></path></svg>
            视频源管理
          </div>
	          <div class="admin-card space-y-4">
	            <form id="videoSourceForm" method="post" action="/dashboard/video/source/save" class="space-y-3">
	              <div>
		                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">视频源地址</label>
		                <input id="videoSourceUrl" name="videoSourceUrl" type="url" class="tv-field" placeholder="http://example.com/config.js" :value="bootstrap.settings.videoSourceUrl">
		              </div>
	              <div class="flex justify-start">
	                <div class="flex flex-col gap-2">
	                  <div class="flex items-center gap-2">
	                    <button type="submit" class="btn-green">保存</button>
	                    <button
	                      id="videoSourceImportFromCatPawOpen"
	                      type="button"
	                      class="px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100/50 dark:hover:bg-white/10 transition-colors duration-150"
	                    >从 CatPawOpen 导入站源</button>
	                  </div>
	                  <div id="videoSourceSaveStatus" class="text-sm hidden"></div>
	                </div>
	              </div>
	            </form>
		          </div>

	          <div class="space-y-3">
	            <div class="tv-panel overflow-x-auto">
	              <div
	                class="tv-row mb-2"
	              >
	                <span
	                  id="panHeaderName"
	                  class="text-sm font-medium text-gray-600 dark:text-gray-300 truncate"
	                >网盘名称</span>
	                <span
	                  id="panHeaderEnable"
	                  class="text-sm font-medium text-gray-600 dark:text-gray-300"
	                >是否启用</span>
	                <span
	                  id="panHeaderSort"
	                  class="text-sm font-medium text-gray-600 dark:text-gray-300"
	                >排序</span>
	                <div
	                  id="panListSaveStatus"
	                  class="text-xs hidden whitespace-nowrap ml-2 text-gray-500 dark:text-gray-400"
	                ></div>
	              </div>
	              <ul id="panList" class="space-y-2 text-sm text-gray-700 dark:text-gray-200">
	                <li class="text-gray-500 dark:text-gray-400">无数据</li>
	              </ul>
	            </div>
	          </div>

	          <div class="space-y-3">
	            <div class="max-h-[60vh] overflow-y-auto tv-panel">
	              <div
	                class="video-source-header tv-row sticky top-0 z-[2] mb-2"
              >
                <input
                  id="videoSourceHeaderCheckbox"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 dark:border-white/20 text-green-600 focus:ring-green-500"
                />
                <span
                  id="videoSourceHeaderName"
                  class="text-sm font-medium text-gray-600 dark:text-gray-300 truncate"
                >站源名称</span>
                <span
                  id="videoSourceHeaderApi"
                  class="text-sm font-medium text-gray-600 dark:text-gray-300 truncate"
                >路由/API</span>
                <span
                  id="videoSourceHeaderAvailability"
                  class="text-sm font-medium text-gray-600 dark:text-gray-300"
                >站点可用性</span>
                <span
                  id="videoSourceHeaderStatus"
                  class="text-sm font-medium text-gray-600 dark:text-gray-300"
                >是否启用</span>
                <span
                  id="videoSourceHeaderHome"
                  class="text-sm font-medium text-gray-600 dark:text-gray-300"
                >首页显示</span>
                <span
                  id="videoSourceHeaderSort"
                  class="text-sm font-medium text-gray-600 dark:text-gray-300"
                >排序</span>
                <div id="videoSourceBulkActions" class="hidden flex items-center gap-2 ml-2">
                  <button
                    id="videoSourceBulkCheckDisable"
                    type="button"
                    class="px-2 py-1 rounded-full border border-gray-400 text-xs font-medium text-gray-700 hover:bg-gray-500/10 dark:border-white/20 dark:text-gray-100 dark:hover:bg-white/10 transition-colors duration-150"
                  >
                    检测并禁用失效源
                  </button>
                  <button
                    id="videoSourceBulkEnable"
                    type="button"
                    class="px-2 py-1 rounded-full border border-green-500 text-xs font-medium text-green-600 hover:bg-green-500/10 transition-colors duration-150"
                  >
                    批量启用
                  </button>
                  <button
                    id="videoSourceBulkDisable"
                    type="button"
                    class="px-2 py-1 rounded-full border border-red-500 text-xs font-medium text-red-600 hover:bg-red-500/10 transition-colors duration-150"
                  >
                    批量禁用
                  </button>
                </div>
                <div
                  id="videoSourceListSaveStatus"
                  class="text-xs hidden whitespace-nowrap ml-2 text-gray-500 dark:text-gray-400"
                ></div>
              </div>
	              <ul id="videoSourceList" class="space-y-2 text-sm text-gray-700 dark:text-gray-200">
	                <li class="text-gray-500 dark:text-gray-400">暂无站源，解析完成后会在这里展示。</li>
	              </ul>
	            </div>
          </div>
        </section>
	        <section v-if="bootstrap.user.role === 'admin'" id="adminPan" class="admin-panel hidden space-y-6">
	          <div class="flex items-center gap-2 text-gray-800 dark:text-gray-100 text-base font-semibold">
	            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud h-5 w-5 text-gray-600 dark:text-gray-300"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h.79a4.5 4.5 0 1 1 1 9Z"></path></svg>
	            网盘设置
	          </div>
	          <div class="admin-card space-y-4">
	            <div class="flex items-center gap-2">
	              <button
	                id="panSettingsScrollLeft"
	                type="button"
                class="hidden px-2 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-gray-700 dark:text-gray-100 hover:bg-gray-100/50 dark:hover:bg-white/10 transition-colors duration-150"
                title="向左滚动"
              >&lt;</button>
              <div id="panSettingsTabs" class="flex items-center gap-2 overflow-x-auto pb-1 min-w-0 flex-1"></div>
              <button
                id="panSettingsScrollRight"
                type="button"
                class="hidden px-2 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-gray-700 dark:text-gray-100 hover:bg-gray-100/50 dark:hover:bg-white/10 transition-colors duration-150"
                title="向右滚动"
              >&gt;</button>
              <div class="relative">
                <button
                  id="panSettingsMoreBtn"
                  type="button"
                  class="hidden px-2 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-gray-700 dark:text-gray-100 hover:bg-gray-100/50 dark:hover:bg-white/10 transition-colors duration-150"
                  title="更多"
                >…</button>
                <div
                  id="panSettingsMoreMenu"
                  class="hidden absolute right-0 mt-2 w-44 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f172a] shadow-lg overflow-hidden z-10"
                ></div>
              </div>
            </div>
	            <div id="panSettingsContent" class="min-h-[320px]"></div>
	            <div id="panSettingsStatus" class="text-sm hidden"></div>
	          </div>
	        </section>
	        <section v-if="bootstrap.user.role === 'admin'" id="adminInterface" class="admin-panel hidden space-y-6">
	          <div class="flex items-center gap-2 text-gray-800 dark:text-gray-100 text-base font-semibold">
	            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link-2 h-5 w-5 text-gray-600 dark:text-gray-300"><path d="M15 7h3a5 5 0 0 1 0 10h-3"></path><path d="M9 17H6a5 5 0 0 1 0-10h3"></path><line x1="8" x2="16" y1="12" y2="12"></line></svg>
	            接口设置
	          </div>
	          <div class="admin-card space-y-4">
	            <form id="catPawOpenSettingsForm" method="post" action="/dashboard/catpawopen/save" class="space-y-4">
	              <div class="flex items-center gap-3">
	                <div class="text-sm font-semibold text-gray-700 dark:text-gray-200">CatPawOpen 设置</div>
	                <div id="catPawOpenSaveStatus" class="text-xs hidden whitespace-nowrap text-gray-500 dark:text-gray-400"></div>
	              </div>
		              <div>
		                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">CatPawOpen 接口地址</label>
		                <input
		                  name="catPawOpenApiBase"
		                  class="tv-field"
		                  placeholder="http://127.0.0.1:3006/"
		                  :value="bootstrap.settings.catPawOpenApiBase"
		                >
		              </div>
		              <div id="catPawOpenRemoteError" class="hidden rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 px-3 py-2 text-xs text-red-700 dark:text-red-300"></div>
		              <div id="catPawOpenRemoteSettings" class="hidden space-y-4">
		              <div>
		                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">CatPawOpen 全局代理</label>
		                <input
		                  name="catPawOpenProxy"
		                  class="tv-field"
		                  placeholder="http://127.0.0.1:7890"
		                >
		                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">保存后将同步到 CatPawOpen 并立即生效（留空关闭）。</p>
		              </div>
		              <div class="space-y-1 pt-1">
		                <div class="text-sm font-medium text-gray-700 dark:text-gray-200">直链模式</div>
		                <div>
		                  <label class="enable-switch" title="直链模式">
		                    <input id="catPawOpenDirectLinkEnabled" name="catPawOpenDirectLinkEnabled" type="checkbox" />
		                    <span class="enable-slider"></span>
		                  </label>
		                </div>
		                <div class="text-xs text-gray-500 dark:text-gray-400">开启后 CatPawOpen 始终返回直链。</div>
		              </div>
		              </div>
		              <div class="pt-1 flex justify-start">
		                <button type="submit" class="btn-green">保存</button>
		              </div>
		            </form>
		          </div>

	          <div class="admin-card space-y-4">
	            <div class="flex items-center gap-3">
	              <div class="text-sm font-semibold text-gray-700 dark:text-gray-200">GoProxy 设置</div>
	              <div id="goProxySaveStatus" class="text-xs hidden whitespace-nowrap text-gray-500 dark:text-gray-400"></div>
	            </div>
		            <form id="goProxySettingsForm" method="post" action="/dashboard/goproxy/save" class="space-y-4">
		              <div class="space-y-1">
		                <div class="text-sm font-medium text-gray-700 dark:text-gray-200">GoProxy 启用</div>
		                <div>
		                  <label class="enable-switch" title="GoProxy 启用">
		                    <input id="goProxyEnabled" name="goProxyEnabled" type="checkbox" :checked="bootstrap.settings.goProxyEnabled" />
		                    <span class="enable-slider"></span>
		                  </label>
		                </div>
		                <div class="text-xs text-gray-500 dark:text-gray-400">开启后由客户端将直链注册到 GoProxy。</div>
		              </div>

		              <div class="space-y-1">
		                <div class="text-sm font-medium text-gray-700 dark:text-gray-200">GoProxy 自动优选</div>
		                <div>
		                  <label class="enable-switch" title="GoProxy 自动优选">
		                    <input
		                      id="goProxyAutoSelect"
		                      name="goProxyAutoSelect"
		                      type="checkbox"
		                      :checked="bootstrap.settings.goProxyAutoSelect"
		                    />
		                    <span class="enable-slider"></span>
		                  </label>
		                </div>
		                <div class="text-xs text-gray-500 dark:text-gray-400">开启后会测速并自动选择最快服务器。</div>
		              </div>

	              <input type="hidden" id="goProxyServersJson" name="goProxyServersJson" value="">

	              <div class="space-y-2">
	                <div class="text-sm font-medium text-gray-700 dark:text-gray-200">GoProxy 服务器</div>
	                <div class="flex items-center gap-2">
	                  <input
	                    id="goProxyServerInput"
	                    class="tv-field flex-1 min-w-0"
	                    placeholder="https://catproxy.example.com"
	                    autocomplete="off"
	                  >
	                  <button id="goProxyServerAdd" type="button" class="btn-green">添加</button>
	                </div>
	                <ul id="goProxyServerList" class="space-y-2 text-sm text-gray-700 dark:text-gray-200">
	                  <li class="text-gray-500 dark:text-gray-400">无数据</li>
	                </ul>
	              </div>

	              <div class="pt-1 flex justify-start">
	                <button type="submit" class="btn-green">保存</button>
	              </div>
	            </form>
	          </div>

	          <div class="admin-card space-y-4">
	            <div class="flex items-center gap-3">
	              <div class="text-sm font-semibold text-gray-700 dark:text-gray-200">OpenList 设置</div>
	              <div id="openListSaveStatus" class="text-xs hidden whitespace-nowrap text-gray-500 dark:text-gray-400"></div>
	            </div>
	            <form id="openListSettingsForm" method="post" action="/dashboard/openlist/save" class="space-y-4">
	              <div>
	                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">OpenList 服务器地址</label>
	                <input
	                  name="openListApiBase"
	                  class="tv-field"
	                  placeholder="http://127.0.0.1:5244/"
	                  :value="bootstrap.settings.openListApiBase"
	                >
	              </div>
	              <div>
	                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">OpenList 令牌</label>
	                <input
	                  name="openListToken"
	                  class="tv-field"
	                  type="password"
	                  autocomplete="off"
	                  placeholder="token"
	                  :value="bootstrap.settings.openListToken"
	                >
	              </div>
	              <div class="space-y-1 pt-1">
	                <div class="text-sm font-medium text-gray-700 dark:text-gray-200">夸克 TV 模式</div>
	                <div>
	                  <label class="enable-switch" title="夸克 TV 模式">
	                    <input id="openListQuarkTvMode" name="openListQuarkTvMode" type="checkbox" />
	                    <span class="enable-slider"></span>
	                  </label>
	                </div>
	              </div>
	              <div>
	                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">夸克 TV 挂载目录</label>
	                <input
	                  name="openListQuarkTvMount"
	                  class="tv-field"
	                  placeholder="/quark/"
	                  :value="bootstrap.settings.openListQuarkTvMount"
	                >
	              </div>
	              <div class="pt-1 flex justify-start">
	                <button type="submit" class="btn-green">保存</button>
	              </div>
	            </form>
	          </div>
	        </section>
	        <section v-if="bootstrap.user.role === 'admin'" id="adminSearch" class="admin-panel hidden space-y-6">
	          <div class="flex items-center gap-2 text-gray-800 dark:text-gray-100 text-base font-semibold">
	            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search h-5 w-5 text-gray-600 dark:text-gray-300"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
	            站点搜索结果设置
	          </div>
          <div class="tv-panel overflow-x-auto">
            <div class="tv-row mb-2">
              <span id="searchHeaderName" class="text-sm font-medium text-gray-600 dark:text-gray-300 truncate">站点名称</span>
              <span id="searchHeaderCover" class="text-sm font-medium text-gray-600 dark:text-gray-300">聚合图片显示</span>
              <span id="searchHeaderSort" class="text-sm font-medium text-gray-600 dark:text-gray-300">排序</span>
              <div id="searchSettingsSaveStatus" class="text-xs hidden whitespace-nowrap ml-2 text-gray-500 dark:text-gray-400"></div>
            </div>
            <ul id="searchSettingsList" class="space-y-2 text-sm text-gray-700 dark:text-gray-200">
              <li class="text-gray-500 dark:text-gray-400">无数据</li>
            </ul>
          </div>
        </section>
        <section v-if="bootstrap.user.role === 'admin'" id="adminMagic" class="admin-panel hidden space-y-6">
          <div class="flex items-center gap-2 text-gray-800 dark:text-gray-100 text-base font-semibold">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wand-2 h-5 w-5 text-gray-600 dark:text-gray-300"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2 18.99V22h3.01L21.64 5.36a1.21 1.21 0 0 0 0-1.72Z"></path><path d="m14 7 3 3"></path><path d="M5 6v4"></path><path d="M19 14v4"></path><path d="M10 2v2"></path><path d="M7 8H3"></path><path d="M21 16h-4"></path><path d="M11 3H9"></path></svg>
            魔法匹配设置
          </div>

			          <div class="admin-card space-y-3">
			            <div class="text-sm font-medium text-gray-700 dark:text-gray-200">列表清洗正则</div>
			            <div class="flex items-center gap-2">
			              <div class="min-w-0" style="flex: 0 0 50%; max-width: 50%;">
			                <input
			                  id="magicEpisodeCleanRegexRuleInput"
			                  class="tv-field min-w-0"
			                  placeholder="\\[.*?\\]|\\(.*?\\)|更新至\\d+集"
			                />
			              </div>
			              <button id="magicEpisodeCleanRegexRuleAdd" type="button" class="btn-green">添加</button>
			            </div>
			            <div id="magicEpisodeCleanRegexRuleStatus" class="text-xs hidden"></div>
			            <ul id="magicEpisodeCleanRegexRuleList" class="space-y-2 text-sm text-gray-700 dark:text-gray-200">
			              <li class="text-gray-500 dark:text-gray-400">无数据</li>
			            </ul>

			            <div class="pt-3 border-t border-gray-200 dark:border-white/10">
			              <div class="text-sm font-medium text-gray-700 dark:text-gray-200">选集匹配规则</div>
			            </div>
			            <div class="flex flex-col gap-2">
			              <div class="flex items-center gap-2">
			                <div class="flex items-center gap-2 min-w-0" style="flex: 0 0 50%; max-width: 50%;">
			                  <input
	                    id="magicEpisodeRulePatternInput"
	                    class="tv-field min-w-0"
	                    style="flex: 5 1 0;"
	                    placeholder=".*?([Ss]\\d{1,2})?(?:[第EePpXx\\.\\-_\\( ]{1,2}|^)(\\d{1,3})(?!\\d).*?\\.(mp4|mkv)"
	                  />
	                  <input
	                    id="magicEpisodeRuleReplaceInput"
	                    class="tv-field min-w-0"
	                    style="flex: 1 1 0;"
	                    placeholder="$1E$2.$3"
	                  />
	                </div>
	                <button id="magicEpisodeRuleAdd" type="button" class="btn-green">添加</button>
	              </div>
	            </div>
	            <div id="magicEpisodeRuleStatus" class="text-xs hidden"></div>
	            <ul id="magicEpisodeRuleList" class="space-y-2 text-sm text-gray-700 dark:text-gray-200">
	              <li class="text-gray-500 dark:text-gray-400">无数据</li>
	            </ul>

	            <div class="pt-2 border-t border-gray-200 dark:border-white/10 space-y-2">
	              <div class="text-sm font-medium text-gray-700 dark:text-gray-200">规则测试</div>
	              <div class="flex items-center gap-2">
	                <div class="min-w-0" style="flex: 0 0 50%; max-width: 50%;">
	                  <input
	                    id="magicEpisodeRuleTestInput"
	                    class="tv-field min-w-0"
	                    placeholder="仙逆.S01E006.mkv"
	                  />
	                </div>
	                <button id="magicEpisodeRuleTestBtn" type="button" class="btn-green">测试</button>
	              </div>
	              <div class="min-w-0" style="width: 50%; max-width: 50%;">
	                <div id="magicEpisodeRuleTestOutput" class="text-xs hidden text-gray-600 dark:text-gray-300 truncate" style="width: 100%;"></div>
	              </div>
	            </div>
	          </div>

          <div class="admin-card space-y-3">
            <div class="text-sm font-medium text-gray-700 dark:text-gray-200">聚合搜索清洗关键词</div>
            <div class="flex items-center gap-2">
              <div class="min-w-0" style="flex: 0 0 50%; max-width: 50%;">
                <input
                  id="magicAggregateRuleInput"
                  class="tv-field min-w-0"
                  placeholder="年番、完结、更新至"
                />
              </div>
              <button id="magicAggregateRuleAdd" type="button" class="btn-green">添加</button>
            </div>
            <div id="magicAggregateRuleStatus" class="text-xs hidden"></div>
            <ul id="magicAggregateRuleList" class="space-y-2 text-sm text-gray-700 dark:text-gray-200">
              <li class="text-gray-500 dark:text-gray-400">无数据</li>
            </ul>

            <div class="pt-3 border-t border-gray-200 dark:border-white/10 space-y-3">
              <div class="text-sm font-medium text-gray-700 dark:text-gray-200">聚合搜索清洗正则</div>
              <div class="flex items-center gap-2">
                <div class="min-w-0" style="flex: 0 0 50%; max-width: 50%;">
                  <input
                    id="magicAggregateRegexRuleInput"
                    class="tv-field min-w-0"
                    placeholder="\\(\\d{4}\\)|\\[.*?\\]|更新至\\d+集"
                  />
                </div>
                <button id="magicAggregateRegexRuleAdd" type="button" class="btn-green">添加</button>
              </div>
              <div id="magicAggregateRegexRuleStatus" class="text-xs hidden"></div>
              <ul id="magicAggregateRegexRuleList" class="space-y-2 text-sm text-gray-700 dark:text-gray-200">
                <li class="text-gray-500 dark:text-gray-400">无数据</li>
              </ul>

              <div class="pt-2 border-t border-gray-200 dark:border-white/10 space-y-2">
                <div class="text-sm font-medium text-gray-700 dark:text-gray-200">规则测试</div>
                <div class="flex items-center gap-2">
                  <div class="min-w-0" style="flex: 0 0 50%; max-width: 50%;">
                    <input
                      id="magicAggregateRuleTestInput"
                      class="tv-field min-w-0"
                      placeholder="仙逆 年番 更新至123集 (2023)"
                    />
                  </div>
                  <button id="magicAggregateRuleTestBtn" type="button" class="btn-green">测试</button>
                </div>
                <div class="min-w-0" style="width: 50%; max-width: 50%;">
                  <div id="magicAggregateRuleTestOutput" class="text-xs hidden text-gray-600 dark:text-gray-300 truncate" style="width: 100%;"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section v-if="bootstrap.user.role === 'admin'" id="adminLive" class="admin-panel hidden">
          <div class="text-sm text-gray-500 dark:text-gray-400">直播源管理内容占位</div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { initMainInteractions } from '../../shared/mainInteractions';
import { initDashboardPage } from './dashboardClient.js';

const props = defineProps({ bootstrap: { type: Object, required: true } });

onMounted(() => {
  initMainInteractions();
  initDashboardPage(props.bootstrap);
});
</script>
