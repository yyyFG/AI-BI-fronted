import {
  UploadOutlined,
} from '@ant-design/icons';

import {
  Button, Card, Col, Divider,
  Form, Input, message, Row,
  Select,
  Space, Spin,
  Upload,
} from 'antd';

import React, {useState} from 'react';
import {genChartByAiUsingPost} from "@/services/yubi/chartController";
import TextArea from "antd/lib/input/TextArea";
import ReactECharts from 'echarts-for-react'

/**
 * 添加图表数据
 * @constructor
 */
const AddChart: React.FC = () => {
  const [chart, setChart] = useState<API.BIResponse>();
  const [option, setOption] = useState<any>();
  // 判断是否提交
  const [submitting, setSubmitting] = useState<boolean>(false);

  const onFinish = async (values: any) => {
    // console.log('表单内容: ', values);
    // console.log(values.file)

    if(submitting){
      return;
    }

    // 开始提交时，把 submitting 设置为 true
    setSubmitting(true);
    // 如果提交了，把图表数据和图表代码清空掉，防止和之前提交的图表堆叠在一起
    // 如果 option 清空，组件就会触发重新渲染，就不会保留之前的历史记录
    setChart(undefined);
    setOption(undefined);

    // todo 对接后端，上传数据
    const params = {
      ...values,
      file: undefined,
    };
    try{
      const res = await genChartByAiUsingPost(params,{}, values.file.file.originFileObj);
      console.log(res.message);
      if(!res?.data){
        message.error(res.message)
      }else {
        message.success("分析成功");
        const chartOption = JSON.parse(res.data.genChart ?? '');
        if(!chartOption){
          throw new Error('图表代码解析错误')
        } else {
          setChart(res.data);
          setOption(chartOption);
        }
      }
    }catch (e : any){
      message.error("分析失败" + e.message);
    }
    setSubmitting(false);
  };

  return (
    <div className="add-chart">
      <Row gutter={24}>
        <Col span={12}>
          <Card title="智能分析">
            <Form name="addChart" labelAlign="left" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                  onFinish={onFinish} initialValues={{}}>
              <Form.Item
                name="goal"
                label="分析目标"
                rules={[{ required: true, message: '请输入分析目标' }]}
              >
                <TextArea placeholder="请输入分析需求，比如：分析网站用户的增长情况" />
              </Form.Item>
              <Form.Item name="name" label="图表名称">
                <Input placeholder="请输入图表名称" />
              </Form.Item>
              <Form.Item
                name="chartType"
                label="图表类型"
              >
                <Select
                  options={[
                    { value: '折线图', label: '折线图' },
                    { value: '柱状图', label: '柱状图' },
                    { value: '堆叠图', label: '堆叠图' },
                    { value: '饼图', label: '饼图' },
                    { value: '雷达图', label: '雷达图' },
                  ]}
                />
              </Form.Item>

              {/* 文件上传 */}
              <Form.Item name="file" label="原始数据">
                <Upload name="file" maxCount={1}>
                  <Button icon={<UploadOutlined />}>上传 XLSX 文件</Button>
                </Upload>
              </Form.Item>

              <Form.Item wrapperCol={{ span: 12, offset: 4 }}>
                <Space>
                  <Button type="primary" htmlType="submit" loading={submitting} disabled={submitting}>
                    提交
                  </Button>
                  <Button htmlType="reset">重置</Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="分析结论">
            {chart?.genResult ?? <div>请先在左侧进行提交</div>}
            <Spin spinning={submitting}/>
          </Card>
          <Divider/>
          <Card title="可视化图表">
              {
                option ? <ReactECharts option={option}/> : <div>请先在左侧进行提交</div>
              }
            <Spin spinning={submitting}/>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default AddChart;
