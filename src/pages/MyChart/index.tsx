import React, {useEffect, useState} from 'react';
import {listMyChartByPageUsingPost} from "@/services/yubi/chartController";
import {Button, Divider, Form, Input, message, Modal, Result, Select} from "antd";
import { Avatar, List, Space } from 'antd';
import ReactECharts from "echarts-for-react";
const { Search } = Input;
import {useModel} from "@@/exports";
import {Card} from "antd-mobile-alita";
import {listAllMyJoinedTeamUsingGet} from "@/services/yubi/teamController";
import {addChartToTeamUsingPost} from "@/services/yubi/chartController";

/**
 * 我的图表页面
 * @constructor
 */
const MyChart: React.FC = () => {
  const initSearchParams = {
    current: 1,
    pageSize: 4,
    sortField: 'createTime',
    sortOrder: 'desc',

  }

  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState ?? {};
  const [searchParams, setSearchParams] = useState<API.ChartQueryRequest>({ ...initSearchParams });
  const [chartList, setChartList] = useState<API.Chart[]>();
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [teamModalVisible, setTeamModalVisible] = useState(false);
  const [teamList, setTeamList] = useState<API.Team[]>([]);
  const [teamId, setTeamId] = useState<number>();
  const [isModalOpen, setIsModalOpen] = useState(false);


  const [selectedChart, setSelectedChart] = useState<API.Chart>({
    id: 0,
    name: '',
    goal: '',
    chartType: '',
    chartData: '',
    genChart: '',
    genResult: '',
    status: '',
    execMessage: '',
  });

  const loadData = async () =>{
    setLoading(true);
    try {
      const res = await listMyChartByPageUsingPost(searchParams);
      if(res.data){
        setChartList(res.data.records ?? []);
        setTotal(res.data.total ?? 0);
        // 隐藏图标的 title
        if(res.data.records){
          res.data.records.forEach(data => {
            if(data.status === 'succeed'){
              const chartOption = JSON.parse(data.genChart ?? '{}');
              chartOption.title = undefined;
              data.genChart = JSON.stringify(chartOption);
            }
          })
        }
      } else {
        message.error("获取图表失败");
      }
    } catch (e : any) {
      message.error('获取图表失败' + e.message);
    }
    setLoading(false);
  };

  const addChartToTeam = async () => {
    // console.log(selectedChart.id)
    try {
      const res = await addChartToTeamUsingPost({chartId: selectedChart.id, teamId: teamId});
      if (res.data) {
        message.success('添加到队伍成功');
      } else {
        message.error('添加到队伍失败,' + `${res.message}`);
      }
    } catch (e: any) {
      message.error('添加到队伍失败，' + e.message);
    }
    setTeamModalVisible(false)
  };


  const showTeamModal = async (chart: API.Chart) => {
    setTeamModalVisible(true);
    setSelectedChart(chart)
    try {
      const res : any = await listAllMyJoinedTeamUsingGet();
      if (res.data) {
        setTeamList(res.data ?? []);
      } else {
        message.info('暂无任何队伍');
      }
    } catch (e: any) {
      message.error('获取队伍列表失败，' + e.message);
    }
  };

  // 创建 SSE 连接
  const initializeSSE = () => {
    if (!currentUser || !currentUser.id) {
      message.error('无法获取当前用户信息，无法创建 SSE 连接');
      return;
    }

    const eventSource = new EventSource(`http://localhost:8101/api/sse/user/connect?userId=${currentUser.id}`);

    eventSource.addEventListener('chart-update', (event) => {
      const data = JSON.parse(event.data);

      if (data) {
        message.success('图表已更新');
        // 更新 chartList
        setChartList((prevList) => {
          const index = prevList.findIndex((item) => item.id === data.id);
          if (index !== -1) {
            // 替换已存在的图表
            const updatedList = [...prevList];
            updatedList[index] = data;
            return updatedList;
          }
          // 如果不存在，添加到列表末尾
          return [...prevList, data];
        });
      }
    });

    eventSource.onerror = () => {
      message.error('SSE 连接发生错误');
      eventSource.close();
    };

    return () => {
      eventSource.close(); // 清理连接
    };
  };


  useEffect(() => {
    const cleanup = initializeSSE();
    return cleanup; // 清理 SSE 连接
  }, []);

  useEffect(() => {
    loadData();
  }, [searchParams]);


  return (
    <div className="my-chart-page">
      <div>
        <Search placeholder="请输入图表名称" loading={loading} enterButton style={{ width: 200 }} onSearch={(value) => {
          // 设置搜索逻辑
          setSearchParams({
            ...initSearchParams,
            name: value,
          })
        }}/>
      </div>
      <div style={{margin: 16}}/>
      <List
        grid={{
          gutter: 16,
          xs: 1,
          sm: 1,
          md: 1,
          lg: 2,
          xl: 2,
          xxl: 2,
      }}
        pagination={{
          onChange: (page, pageSize) => {
            setSearchParams({
              ...searchParams,
              current: page,
              pageSize,
            })
          },
          current: searchParams.current,
          pageSize: searchParams.pageSize,
          total: total,
        }}
        loading={loading}
        dataSource={chartList}
        renderItem={(item) => (
          <List.Item key={item.id}>
            <Card style={{ width: '100%', backgroundColor: "white"}}>
            <List.Item.Meta
              avatar={<Avatar src={currentUser && currentUser.userAvatar} />}
              title={item.name}
              description={item.chartType ? ('图表类型: ' + item.chartType) : undefined}
            />
              <>
                {
                  item.status === "wait" && <>
                    <Result
                      status="warning"
                      title="图表待生成"
                      subTitle={item.execMessage ?? "当前图表队列生成繁忙，请耐心等候"}
                    />
                  </>
                }
                {
                  item.status === "running" && <>
                    <Result
                      status="info"
                      title="图表生成中"
                      subTitle={item.execMessage}
                    />
                  </>
                }
              {
                item.status === "succeed" && <>
                  <div style={{marginBottom: 16}}/>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <p style={{margin: 0}}>{'分析目标：' + item.goal}</p>
                      <div>
                        {/*<Button style={{ backgroundColor: '#1c66ff', color: 'white'}} onClick={() => showTeamModal(item)}>纳入队伍</Button>*/}
                        <Button style={{ backgroundColor: '#1c66ff', color: 'white'}} onClick={() => showTeamModal(item)}>纳入队伍</Button>
                      </div>
                    </div>

                  <Modal
                    title="将图表纳入队伍"
                    open={teamModalVisible}
                    onOk={() => addChartToTeam()}
                    onCancel={() => setTeamModalVisible(false)}
                    okText="确认"
                    cancelText="取消"
                  >
                    <div style={{marginTop: 16}}>
                      图表名称：
                      <Input disabled value={selectedChart!.name} style={{width: 350}}/>
                    </div>
                    <div style={{marginTop: 10}}>
                      队伍 ID：
                      <Select
                        showSearch
                        style={{width: '200px'}}
                        placeholder="请选择队伍 ID"
                        options={teamList.map(team => ({
                          value: team.id,
                          label: team.name
                        }))}
                        onChange={(value) => setTeamId(value)}
                      />
                    </div>
                  </Modal>

                  <div style={{marginBottom: 16}}/>
                  <ReactECharts option={item.genChart && JSON.parse(item.genChart)}/>
                </>
              }
              {
                item.status === "failed" && <>
                  <Result
                    status="error"
                    title="图表生成失败"
                    subTitle={item.execMessage}
                  />
                </>
              }
              </>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
}

export default MyChart;
