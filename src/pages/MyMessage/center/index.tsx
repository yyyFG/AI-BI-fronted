import {ClusterOutlined, ContactsOutlined, CopyOutlined, HomeOutlined, PlusOutlined} from '@ant-design/icons';
import { GridContent } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import {Avatar, Button, Card, Col, Divider, Input, InputRef, message, Row, Tag, TagType, Typography} from 'antd';
import React, {useEffect, useRef, useState} from 'react';
import {useModel} from "@@/exports";
import TeamList from "@/components/TeamList";
import {exitTeamUsingPost, joinTeamUsingPost, pageMyJoinedTeamUsingPost} from "@/services/yubi/teamController";
// import useStyles from './Center.style';
// import Applications from './components/Applications';
// import Articles from './components/Articles';
// import Projects from './components/Projects';
// import type { CurrentUser, tabKeyType, TagType } from './data.d';
// import { queryCurrent } from './service';

const { Title, Text } = Typography;


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

const Center: React.FC = () => {
  const initSearchParams = {
    current: 1,
    pageSize: 4,
    sortField: 'createTime',
    sortOrder: 'desc',
  };

  const { initialState, setInitialState } = useModel('@@initialState');

  //  获取用户信息
  const { currentUser } = initialState || {};
  const [teamVOList, setTeamVOList] = useState<API.TeamVO[]>([]);
  const [searchParams, setSearchParams] = useState<API.TeamQueryRequest>({ ...initSearchParams });
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);


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
        {/* 左侧列（个人信息 + 签到 + 积分） */}
        <Col lg={7} md={24}>
          {/* 个人信息 Card */}
          <Card
            bordered={false}
            style={{
              marginBottom: 24,
              height: 340,
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <Avatar
                size={100}
                src={currentUser.userAvatar}
                style={{ border: '3px solid #FFD700', marginBottom: 16 }}
              />
              <Text style={{ display: 'block', marginTop: 8 }}>
                名称: {currentUser.userName}
                <CopyOutlined
                  onClick={() => navigator.clipboard.writeText(currentUser.id)}
                  style={{ cursor: 'pointer', color: '#1890ff' }}
                />
              </Text>
              <div>{currentUser?.userProfile}</div>
              <Button
                type="primary"
                style={{ marginTop: 16, marginRight: 10 }}
                disabled={currentUser.signIn}
              >
                {currentUser.signIn ? '已签到' : '签到'}
              </Button>
              <Button
                type="primary"
                style={{ marginTop: 16, marginLeft: 10 }}
              >
                创建队伍
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
    </GridContent>
  );
};
export default Center;
