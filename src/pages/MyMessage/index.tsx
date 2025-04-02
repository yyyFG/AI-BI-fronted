import React, { useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Col, Drawer,
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
  EditOutlined, PlusOutlined,
} from "@ant-design/icons";
import { useModel } from "@@/exports";
import {
  updateOrAddUserUsingPost
} from "@/services/yubi/userController";

import {addTeamUsingPost} from "@/services/yubi/teamController";
import TextArea from "antd/es/input/TextArea";
import {request} from "@umijs/max";
import {imgUploadUsingPost} from "@/services/yubi/imageController";

const { Title, Text } = Typography;

const UserCenter: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};

  const [form] = Form.useForm();
  const initSearchParams = {
    current: 1,
    pageSize: 4,
    sortField: 'createTime',
    sortOrder: 'desc',
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  const [searchParams, setSearchParams] = useState<API.TeamQueryRequest>({ ...initSearchParams });
  const [teamVOList, setTeamVOList] = useState<API.TeamVO[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [open, setOpen] = useState(false);
  const [imgUrl, setImgUrl] = useState<string>('');

  // console.log(currentUser.data.id)

  const onClose = () => {
    setOpen(false);
  };

  const addTeam = async (values : Partial<API.Team>) => {
    try {
      const res = await addTeamUsingPost(values);
      if (res.code === 0) {
        message.success('队伍创建成功');
      }else {
        message.error('队伍创建失败，' + res.message);
      }
    } catch (e: any) {
      message.error('队伍创建失败，' + e.message);
    }
    setIsTeamModalOpen(false);
  };

  const onUploadChange = async (values: any) => {
    // console.log(values)
    // 假设返回数据格式为 { url: '图片链接' }
    const response = values.file.response;
    // todo 对接后端，上传数据
      const res = await imgUploadUsingPost(values);
      console.log(res.message);
      if (res.code === 0) {
        // 更新表单中的图片链接
        setImgUrl(response.data);
        message.success('图片上传成功');
      } else {
        message.error("上传失败" + res.message)
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


  const signIn = async () => {
    // const res = await singInUsingPost();
    // if (res?.data && res.code === 0) {
    //   message.success("签到成功，+20积分");
    //   setInitialState((s) => {
    //     return {
    //       ...s,
    //       currentUser: {
    //         ...s.currentUser,
    //         signIn: true,
    //         score: s.currentUser?.score + 20,
    //       },
    //     };
    //   });
    // } else {
    //   message.info(res.message);
    // }
  };

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[24, 24]} justify="center">
        {/* 用户信息区域 */}
        <Col xs={24} sm={24} md={12} lg={8} xl={6}>
          <Card
            title={<Text strong>个人信息</Text>}
            bordered={false}
            extra={
              <Space>
                <EditOutlined onClick={showModal} />
              </Space>
            }
            style={{
              borderRadius: 8,
              padding: '20px 10px',
              minHeight: 260,
            }}
          >
            <div style={{ textAlign: 'center' }}>
              {/* 用户头像 */}
              <Avatar
                size={100}
                src={currentUser.userAvatar}
                style={{ border: '3px solid #FFD700', marginBottom: 16 }}
              />

              {/* 用户 ID */}
              <Text style={{ display: 'block', marginTop: 8 }}>
                ID: {currentUser.userName}
                <CopyOutlined
                  onClick={() => navigator.clipboard.writeText(currentUser.id)}
                  style={{ cursor: 'pointer', color: '#1890ff' }}
                />
              </Text>

              {/* 签到按钮 */}
              <Button
                type="primary"
                style={{ marginTop: 16, marginLeft: 6}}
                onClick={signIn}
                disabled={currentUser.signIn} // 如果已经签到，按钮禁用
              >
                {currentUser.signIn ? "已签到" : "签到"}
              </Button>

              {/* 签到按钮 */}
              <Button
                type="primary"
                style={{ marginTop: 16, marginRight: 10 }}
                onClick={showTeamModal}
                disabled={currentUser.signIn} // 如果已经签到，按钮禁用
              >
                {currentUser.hasTeam ? "已有队伍" : "创建队伍"}
              </Button>

            </div>
          </Card>
        </Col>

        {/* 用户属性区域 */}
        <Col xs={24} sm={24} md={24} lg={16} xl={18}>
          <Row gutter={[24, 24]} justify="start">

            <Col xs={24} sm={12} md={12} lg={8} xl={8}>
              <Card
                style={{
                  borderRadius: 12,
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                  backgroundColor: '#f9faff',
                  padding: '20px',
                  height: 150, // 设置固定高度
                  textAlign: 'left',
                }}
                bordered={false}
              >
                {/* 顶部标题 */}
                <Text style={{ fontSize: 14, color: '#7d8da1', fontWeight: 500 }}>签到状态</Text>

                {/* 主内容 */}
                <Title level={3} style={{ color: '#1c66ff', margin: '8px 0' }}>
                  {currentUser.signIn ? '已签到' : '未签到'}
                </Title>

              </Card>
            </Col>

            <Col xs={24} sm={12} md={12} lg={8} xl={8}>
              <Card
                style={{
                  borderRadius: 12,
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                  backgroundColor: '#f9faff',
                  padding: '20px',
                  height: 150, // 设置固定高度
                  textAlign: 'left',
                }}
                bordered={false}
              >
                {/* 顶部标题 */}
                <Text style={{ fontSize: 14, color: '#7d8da1', fontWeight: 500 }}>可用积分</Text>

                {/* 主内容 */}
                <Title level={2} style={{ color: '#1c66ff', margin: '8px 0' }}>
                  {currentUser.score}
                </Title>
              </Card>
            </Col>

          </Row>
        </Col>
      </Row>


      {/* 修改信息模态框 */}
      <Modal title="修改个人信息" open={isModalOpen} onCancel={handleCancel} footer={null}>
        <Form layout="vertical" initialValues={currentUser} onFinish={handleFormSubmit}>
          <Form.Item
            label="用户名"
            name="userName"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            label="账号"
            name="userAccount"
            rules={[{ required: true, message: '请输入账号' }]}
          >
            <Input placeholder="请输入账号" />
          </Form.Item>
          <Form.Item label="密码" name="userPassword">
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          <Form.Item
            label="头像链接"
            name="userAvatar"
            rules={[{ required: true, message: '请输入头像链接' }]}
          >
            <Input placeholder="请输入头像链接" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              保存修改
            </Button>
          </Form.Item>
        </Form>
      </Modal>


      <Modal title="创建队伍" open={isTeamModalOpen} onCancel={handleTeamCancel} footer={null}>
        <Form layout="vertical" initialValues={currentUser} onFinish={addTeam}>
            <Form.Item
              label="队伍名称"
              name="name"
              rules={[{ required: true, message: '请输入队伍名称' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
             label="最大人数"
             name="maxNum"
             rules={[{ required: true, message: '请输入最大人数' }]}
           >
              <InputNumber />
           </Form.Item>
            <Form.Item
              label="队伍描述"
              name="description"
              rules={[{ required: true, message: '请输入队伍描述' }]}
           >
              <TextArea rows={4} />
            </Form.Item>
          {/*<Form.Item*/}
          {/*  label="队伍头像链接"*/}
          {/*  name="imgUrl"*/}
          {/*  rules={[{ required: true, message: '请输入队伍头像链接' }]}*/}
          {/*>*/}
          {/*  <Input placeholder="请输入队伍头像链接" />*/}
          {/*</Form.Item>*/}
          <Form.Item
            label="队伍图片"
            rules={[{ required: true, message: '请上传队伍图片' }]}
          >
            <Upload
              // action={`${request.baseURL}/home/ubuntu/picture/BIpicture`}
              name="image"
              action={`${request.baseURL}/api/image/upload`}
              enctype="multipart/form-data"
              listType="picture-card"
              maxCount={1}
              onChange={onUploadChange}
            >
              <button style={{ border: 0, background: 'none' }} type="button">
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>上传图片</div>
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
    </div>
  );
};

export default UserCenter;
