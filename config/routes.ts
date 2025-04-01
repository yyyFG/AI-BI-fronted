export default [
  { path: '/user', layout: false,
    routes: [
        { path: '/user/login', component: './User/Login' },
        { path: '/user/register', component: './User/Register' }
      ]
  },
  // { path: '/welcome', icon: 'smile', component: './Welcome' },
  { path: '/', redirect: '/add_chart'},
  { path: '/add_chart', name: '智能分析', icon: 'barChart', component: './AddChart'},
  { path: '/add_chart_async', name: '智能分析(异步)', icon: 'barChart', component: './AddChartAsync'},
  { path: '/my_chart', name: '我的图表', icon: 'CloudOutlined', component: './MyChart'},
  { path: '/chart_manage', name: '图表管理', icon: 'SettingOutlined', component: './ChartManage'},
  {path: '/team', name: '队伍大厅', icon: 'TeamOutlined', component: './Team'},
  {path: '/team_my_joined', name: '已加队伍', icon: 'TeamOutlined', component: './TeamMyJoined'},
  {path: '/team/:id/chart', hideInMenu: true, name: '队伍图表', icon: 'pieChart', component: './TeamChart'},
  { path: '/my_message', name: '个人信息', icon: 'UsergroupDeleteOutlined', component: './MyMessage'},
  {
    path: '/admin',
    icon: 'crown',
    access: 'canAdmin',
    routes: [
      { path: '/admin', redirect: '/admin/sub-page' },
      { path: '/admin/sub-page', component: './Admin' },
    ],
  },
  { path: '/', redirect: '/welcome' },
  { path: '*', layout: false, component: './404' },
];
