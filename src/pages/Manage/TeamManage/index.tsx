import React, {useState, useEffect, useRef} from 'react';
import {Table, Modal, Button, Form, Input, Select, Space, message, Tag, Tooltip, Typography, Avatar, Image} from 'antd';
import {
  deleteChartUsingPost,
  listMyChartByPageUsingPost, regenChartByAiUsingPost,
  updateChartUsingPost
} from "@/services/yubi/chartController";
import ReactECharts from "echarts-for-react";
import {MinusCircleOutlined} from "@ant-design/icons";
import {
  deleteTeamUserUsingPost,
  deleteTeamUsingPost,
  listAllMyJoinedTeamUsingGet,
  pageMyJoinedTeamUsingPost,
  pageMyTeamUserUsingPost
} from "@/services/yubi/teamController";
import {useModel} from "@@/exports";

const initSearchParams = {
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'desc',
  searchParams: '',
};

const TeamManage: React.FC = () => {
  const [teamList, setTeamList] = useState<API.User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isChartModalVisible, setIsChartModalVisible] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<API.Team | null>(null);
  const [searchParams, setSearchParams] = useState<API.ChartQueryRequest>({...initSearchParams});
  const [total, setTotal] = useState<number>(0);
  const chartRef = useRef<ReactECharts | null>(null);
  const [form] = Form.useForm();
  const [value, setValue] = useState<string>('');

  const { initialState, setInitialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};

  const [teamUserList, setTeamUserList] = useState<API.User[]>([]);
  const [teamUserId, setTeamUserId] = useState<number>();

  const [selectTeamUser, setSelectTeamUser] = useState<API.User>({
    teamId: 0,
    userId: 0,
  })

  const handleShowTeamUrl = (team: API.Team) => {
    setIsChartModalVisible(true);
    setSelectedTeam(team);
    setTimeout(() => {
      if (team.imgUrl) {
      }
    }, 100);
  };


  // 模拟获取图表数据（替换为实际接口调用）
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await pageMyJoinedTeamUsingPost(searchParams);
      const values = await pageMyTeamUserUsingPost(selectTeamUser);
      // const
      // console.log(values)
      if (res.data) {
        setTeamList(res.data.records ?? []);
        setTotal(res.data.total ?? 0);
      }
      if(values.data) {
        setTeamUserList(values.data ?? [])
      }
    } catch (error) {
      message.error('加载队伍数据失败');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [searchParams]);


  // 打开修改弹窗
  const handleEdit = (team: API.Team) => {
    setSelectedTeam(team);
    setIsModalVisible(true);
    form.setFieldsValue(team);
  };


  // 删除图表
  const handleDelete = (teamId: number | undefined) => {
    console.log(teamId)
    if (!teamId) return;
    Modal.confirm({
      title: '删除确认',
      content: '确定要删除该队伍吗？此操作不可撤销。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await deleteTeamUsingPost({id: teamId});
          if (res.data) {
            message.success('删除成功');
            loadData();
            window.location.reload(); // 2秒后刷新
          } else {
            message.error('删除失败，' + res.message);
          }
        } catch (e: any) {
          message.error('删除失败，' + e.message);
        }
      },
    });
  };

  // 提交队员修改
  const deleteTeamUser = async () => {
    console.log(teamUserId)
      // 删除队员
      try {
        const res = await deleteTeamUserUsingPost({id: teamUserId});
        if (res.data) {
          loadData();
          message.success('操作成功');
          window.location.reload(); // 2秒后刷新
        } else {
          message.error('操作失败，' + res.message);
        }
      } catch (e: any) {
        message.error('操作失败，' + e.message);
      }
    setIsModalVisible(false);
  };


  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '队长',
      render:() => (
        currentUser.userName
        ),
    },
    {
      title: '最大人数',
      dataIndex: 'maxNum',
      key: 'maxNum',
      // render: (status: string) => (
      //   <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>
      // ),
    },
    // {
    //   title: '生成结果',
    //   dataIndex: 'genResult',
    //   key: 'genResult',
    //   render: (text: string) => {
    //     const maxLength = 30; // 设置最大显示长度
    //     return text.length > maxLength ? (
    //       <Tooltip title={text}>
    //         {text.slice(0, maxLength)}...
    //       </Tooltip>
    //     ) : (
    //       text
    //     );
    //   },
    // },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: API.Team) => (
        <>
          <Space>
            <Button type="link" onClick={() => handleEdit(record)}>
              修改
            </Button>
            {/*<Button type="link" onClick={() => regenChart(record)}>*/}
            {/*  重新生成*/}
            {/*</Button>*/}
          </Space>
          <Space>
            <Button type="link" danger onClick={() => handleDelete(record.id)}>
              删除
            </Button>
            <Button type="link" onClick={() => handleShowTeamUrl(record)}>
              显示队标
            </Button>
          </Space>
        </>
      ),
    },
  ];

  return (
    <div>
      <div style={{textAlign: 'center', marginBottom: 16}}>
        <Space>
          <Input.Search
            placeholder="请输入队伍名称"
            allowClear
            enterButton="搜索"
            onSearch={(value) => {
              setSearchParams({
                ...initSearchParams,
                searchParams: value,
              })
            }}
            style={{width: 300}}
          />
        </Space>
      </div>
      <Table
        dataSource={teamList}
        columns={columns}
        loading={loading}
        bordered
        rowKey="id"
        pagination={{
          onChange: (page, pageSize) => {
            setSearchParams({
              ...searchParams,
              current: page,
              pageSize,
            });
          },
          current: searchParams.current,
          pageSize: searchParams.pageSize,
          total: total,
        }}
      />

      {/* 新增/修改弹窗 */}
      <Modal
        title={'修改队伍信息'}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => deleteTeamUser()}
        okText="保存"
        cancelText="取消"
      >
        <div style={{marginTop: 16}}>
          队伍名称：
          <Input disabled value={selectedTeam?.name} style={{width: 350}}/>
        </div>
        <div style={{marginTop: 10}}>
          队友 ID：
          <Select
            showSearch
            style={{width: '200px'}}
            placeholder="请选择要删除的 ID"
            options={teamUserList.map(teamUser => ({
              value: teamUser.id,
              label: teamUser.userName
            }))}
            onChange={(value) => setTeamUserId(value)}
          />
        </div>
      </Modal>


      <Modal
        title="图表预览"
        visible={isChartModalVisible}
        onCancel={() => setIsChartModalVisible(false)}
        footer={null} // 不显示底部按钮
        width={500} // 设置弹窗宽度
      >
        {selectedTeam?.imgUrl && (
          <Image
            src={selectedTeam.imgUrl}
            alt="团队图表"
            style={{width: '100%'}} // 图片宽度自适应弹窗
            placeholder={true} // 加载时显示占位符
          />
        )}
      </Modal>
    </div>
  );
};

export default TeamManage;
