import {addTeamUsingPost, listTeamByPageUsingPost} from '@/services/yubi/teamController';
import {useModel} from '@@/exports';
import {PlusCircleOutlined, PlusOutlined} from '@ant-design/icons';
import {Button, Drawer, FloatButton, Form, Input, InputNumber, message, Space, Tooltip, Upload,} from 'antd';
import Search from 'antd/es/input/Search';
import TextArea from 'antd/es/input/TextArea';
import React, {useEffect, useState} from 'react';
import TeamList from "@/components/TeamList";
import {request} from "@/app";

const TeamPage: React.FC = () => {
  const [form] = Form.useForm();
  const initSearchParams = {
    current: 1,
    pageSize: 4,
    sortField: 'createTime',
    sortOrder: 'desc',
  };

  // const [isSearch, setIsSearch] = useState(false);
  const [searchParams, setSearchParams] = useState<API.TeamQueryRequest>({ ...initSearchParams });
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState ?? {};
  const [teamVOList, setTeamVOList] = useState<API.TeamVO[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [open, setOpen] = useState(false);
  const [imgUrl, setImgUrl] = useState<string>('');

  const onClose = () => {
    setOpen(false);
  };

  const addTeam = async () => {
    const formData = form.getFieldsValue();
    try {
      const res = await addTeamUsingPost({ ...formData, imgUrl });
      if (res.data) {
        onClose();
        message.success('队伍创建成功');
        initData();
      }
    } catch (e: any) {
      message.error('队伍创建失败，' + e.message);
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

  // 页面加载时加载数据
  const initData = async () => {
    setLoading(true);
    try {
      const res : any = await listTeamByPageUsingPost(searchParams);
      if (res.code === 0) {
        setTeamVOList(res.data.records ?? []);
        setTotal(res.data.total ?? 0);
      } else {
        message.error('获取队伍失败,' + `${res.message}`);
      }
    } catch (e: any) {
      message.error('获取队伍失败，' + e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    initData();
  }, [searchParams]);


  return (
    <div className="team-page">
      <div>
        <Search
          placeholder="请输入队伍名称"
          enterButton
          loading={loading}
          onSearch={(value) => {
            setSearchParams({
              ...initSearchParams,
              searchParam: value,
            });
          }}
        />
      </div>

      <TeamList
        teamVOList={teamVOList}
        loading={loading}
        total={total}
        searchParams={searchParams}
        setSearchParams={setSearchParams}
      />
    </div>
  );
};

export default TeamPage;
