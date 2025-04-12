import React, {useEffect, useState} from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  Form,
  Input, InputNumber,
  message,
  Modal,
  Row,
  Space,
  Typography, Upload,
} from "antd";
import {
  CopyOutlined,
  EditOutlined, PlusOutlined, UploadOutlined,
} from "@ant-design/icons";
import { useModel } from "@@/exports";
import {
  signInUsingPost,
  updateOrAddUserUsingPost
} from "@/services/yubi/userController";

import {
  addTeamUsingPost,
  exitTeamUsingPost, joinTeamUsingPost,
  listTeamByPageUsingPost, pageMyJoinedTeamUsingPost,
  updateTeamUsingPost
} from "@/services/yubi/teamController";
import TextArea from "antd/es/input/TextArea";
import {GridContent} from "@ant-design/pro-components";
import TeamList from "@/components/TeamList";


const { Title, Text } = Typography;

const UserCenter: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};

  // console.log(currentUser)
  const { currentTeam } = useState<API.TeamAddRequest>();
  const initSearchParams = {
    current: 1,
    pageSize: 4,
    sortField: 'createTime',
    sortOrder: 'desc',
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [imgUrl, setImgUrl] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [teamVOList, setTeamVOList] = useState<API.TeamVO[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [searchParams, setSearchParams] = useState<API.TeamQueryRequest>({ ...initSearchParams });
  // console.log(currentUser.data.id)

  const operationTabList = [
    {
      key: 'projects',
      tab: (
        <span>
        项目
      </span>
      ),

    },
  ];


  const onClose = () => {
    setOpen(false);
  };

  const addTeam = async (values : API.TeamAddRequest) => {
    // console.log(imgUrl)
    values.imgUrl = imgUrl;
    try {
      const res = await addTeamUsingPost(values);
      if (res.data) {
        onClose();
        message.success('队伍创建成功');
        initData();
      }
    } catch (e: any) {
      message.error('队伍创建失败，' + e.message);
    }
    setIsTeamModalOpen(false);
  };

  const signIn = async () => {
    const res = await signInUsingPost();
    if (res?.data && res.code === 0) {
      message.success("签到成功，+20积分");
      setInitialState((s) => {
        return {
          ...s,
          currentUser: {
            ...s.currentUser,
            signIn: true,
            score: s.currentUser?.score + 20,
          },
        };
      });
    } else {
      message.info(res.message);
    }
  };

  const onUploadChange = (info: any) => {
    // 检查上传状态
    if (info.file.status === 'done') {
      // 假设返回数据格式为 { url: '图片链接' }
      const response = info.file.response;
      if (response && response.data) {
        // 更新表单中的图片链接
        setImgUrl(response.data);
        message.success('图片上传成功');
      } else {
        message.error('图片上传失败，请检查接口返回值');
      }
    } else if (info.file.status === 'error') {
      message.error('图片上传失败，请稍后重试');
    }
  };


  // 打开修改信息模态框
  const showModal = () => {
    setIsModalOpen(true);
  };

  const showTeamModal = () => {
    setIsTeamModalOpen(true);
  };

  // 关闭模态框
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleTeamCancel = () => {
    setIsTeamModalOpen(false);
  };

  // 提交修改信息
  const handleFormSubmit = async (values: Partial<API.User>) => {
    // console.log(currentUser.id)
    values.id = currentUser.id;
    values.userAvatar = imgUrl;
    try {
      const res = await updateOrAddUserUsingPost(values);
      // console.log(res)
      if (res.data) {
        message.success("修改成功");
        setTimeout(() => {
          window.location.reload(); // 2秒后刷新
        }, 1000); // 2000ms = 2秒
      } else {
        message.error("修改失败，" + res.message);
      }
    } catch (e: any) {
      message.error("修改失败，" + e.message);
    }
    setIsModalOpen(false);
  };

  const initData = async () => {
    setLoading(true);
    try {
      const res : any = await pageMyJoinedTeamUsingPost(searchParams);
      if (res.data) {
        setTeamVOList(res.data.records ?? []);
        setTotal(res.data.total ?? 0);
      } else {
        message.info('暂无任何队伍');
      }
    } catch (e: any) {
      message.error('获取队伍失败，' + e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    initData();
  }, [searchParams]);

  const joinTeam = async (id: number) => {
    try {
      const res = await joinTeamUsingPost({ id });
      if (res.data) {
        message.success('加入队伍成功');
      }
    } catch (e: any) {
      message.error('加入队伍失败，' + e.message);
    }
  };

  const exitTeam = async (id: number) => {
    try {
      const res = await exitTeamUsingPost({ id });
      if (res.data) {
        message.success('退出队伍成功');
        window.location.reload(); // 2秒后刷新
      }
    } catch (e: any) {
      message.error('退出队伍失败，' + e.message);
    }
  };


  return (
    <GridContent>
        <Row gutter={24}>
          {/* 用户信息区域 */}
          <Col lg={7} md={24}>
            <Card
              title={<Text strong>个人信息</Text>}
              bordered={false}
              extra={
                <Space>
                  <EditOutlined onClick={showModal}/>
                </Space>
              }
              style={{
                borderRadius: 8,
                padding: '20px 10px',
                // minHeight: 260,
                marginBottom: 24,
                height: 340,
              }}
            >
              <div style={{textAlign: 'center'}}>
                {/* 用户头像 */}
                <Avatar
                  size={100}
                  src={currentUser.userAvatar}
                  style={{border: '3px solid #FFD700', marginBottom: 16}}
                />
                {/* 用户 ID */}
                <Text style={{display: 'block', marginTop: 8}}>
                  名称: {currentUser.userName}
                  <CopyOutlined
                    onClick={() => navigator.clipboard.writeText(currentUser.id)}
                    style={{cursor: 'pointer', color: '#1890ff'}}
                  />
                </Text>
                <div>{currentUser?.userProfile}</div>

                {/* 签到按钮 */}
                <Button
                  type="primary"
                  style={{marginTop: 16, marginRight: 10}}
                  onClick={signIn}
                  disabled={currentUser.signIn} // 如果已经签到，按钮禁用
                >
                  {currentUser.signIn ? '已签到' : '签到'}
                </Button>
                {/* 创建队伍按钮 */}
                <Button
                  type="primary"
                  style={{marginTop: 16, marginLeft: 10}}
                  onClick={showTeamModal}
                >
                  {'创建队伍'}
                </Button>
              </div>
            </Card>

            {/* 签到状态 Card */}
            <Card
              style={{
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                backgroundColor: '#f9faff',
                padding: '20px',
                height: 180,
                marginBottom: 24,
                textAlign: 'left',
              }}
              bordered={false}
            >
              <Text style={{ fontSize: 14, color: '#7d8da1', fontWeight: 500 }}>签到状态</Text>
              <Title level={3} style={{ color: '#1c66ff', margin: '8px 0' }}>
                {currentUser.signIn ? '已签到' : '未签到'}
              </Title>
            </Card>

            {/* 可用积分 Card */}
            <Card
              style={{
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                backgroundColor: '#f9faff',
                padding: '20px',
                height: 180,
                textAlign: 'left',
              }}
              bordered={false}
            >
              <Text style={{ fontSize: 14, color: '#7d8da1', fontWeight: 500 }}>可用积分</Text>
              <Title level={2} style={{ color: '#1c66ff', margin: '8px 0' }}>
                {currentUser.score}
              </Title>
              <p>进行一次数据分析就要5积分哦⭐</p>
            </Card>
          </Col>

          {/* 右侧列（项目列表） */}
          <Col lg={17} md={24}>
            <Card
              bordered={false}
              tabList={operationTabList}
            >
              <TeamList
                teamVOList={teamVOList}
                loading={loading}
                total={total}
                searchParams={searchParams}
                setSearchParams={setSearchParams}
                joinTeam={joinTeam}
                exitTeam={exitTeam}
              />
            </Card>
          </Col>

        </Row>

        {/* 修改信息模态框 */}
        <Modal title="修改个人信息" open={isModalOpen} onCancel={handleCancel} footer={null}>
          <Form layout="vertical" initialValues={currentUser} onFinish={handleFormSubmit}>
            <Form.Item
              label="用户名"
              name="userName"
              rules={[{required: false, message: '请输入用户名'}]}
            >
              <Input placeholder="请输入用户名"/>
            </Form.Item>
            <Form.Item
              label="账号"
              name="userAccount"
              rules={[{required: false, message: '请输入账号'}]}
            >
              <Input placeholder="请输入账号"/>
            </Form.Item>
            <Form.Item label="密码" name="userPassword">
              <Input.Password placeholder="请输入密码"/>
            </Form.Item>
            <Form.Item
              label="头像链接"
              name="userAvatar"
            >
              {/*<Input placeholder="请输入头像链接" />*/}
              <Upload
                action={`http://localhost:8101/api/image/upload`}
                listType="picture-card"
                maxCount={1}
                onChange={onUploadChange}
              >
                <button style={{border: 0, background: 'none'}} type="button">
                  <PlusOutlined/>
                  <div style={{marginTop: 8}}>上传图片</div>
                </button>
              </Upload>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                保存修改
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        <Modal title="创建队伍" open={isTeamModalOpen} onCancel={handleTeamCancel} footer={null}>
          <Form layout="vertical" initialValues={currentTeam} onFinish={addTeam}>
            <Form.Item
              label="队伍名称"
              name="name"
              rules={[{required: true, message: '请输入队伍名称'}]}
            >
              <Input/>
            </Form.Item>
            <Form.Item
              label="最大人数"
              name="maxNum"
              rules={[{required: true, message: '请输入最大人数'}]}
            >
              <InputNumber/>
            </Form.Item>
            <Form.Item
              label="队伍描述"
              name="description"
              rules={[{required: true, message: '请输入队伍描述'}]}
            >
              <TextArea rows={4}/>
            </Form.Item>
            {/*<Form.Item*/}
            {/*  label="队伍头像链接"*/}
            {/*  name="imgUrl"*/}
            {/*  rules={[{ required: true, message: '请输入队伍头像链接' }]}*/}
            {/*>*/}
            {/*  <Input placeholder="请输入队伍头像链接" />*/}
            {/*</Form.Item>*/}
            <Form.Item name='image' label="队伍图片">
              <Upload
                action={`http://localhost:8101/api/image/upload`}
                listType="picture-card"
                maxCount={1}
                onChange={onUploadChange}
              >
                <button style={{border: 0, background: 'none'}} type="button">
                  <PlusOutlined/>
                  <div style={{marginTop: 8}}>上传图片</div>
                </button>
              </Upload>

            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                保存创建
              </Button>
            </Form.Item>
          </Form>
        </Modal>
    </GridContent>
  );
};

export default UserCenter;
