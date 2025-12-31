/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker } from 'antd';

interface AddTaskModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: () => void;
  form: any;
  onFinish: (values: any) => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ open, onCancel, onOk, form, onFinish }) => {
  return (
    <Modal
      title="新增任务"
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      okText="确定"
      cancelText="取消"
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          name="title"
          label="任务名称"
          rules={[{ required: true, message: '请输入任务名称' }]}
        >
          <Input placeholder="请输入任务名称" />
        </Form.Item>
        <Form.Item
          name="description"
          label="任务描述"
        >
          <Input.TextArea placeholder="请输入任务描述" rows={4} />
        </Form.Item>
        <Form.Item
          name="status"
          label="任务状态"
          initialValue="not-started"
        >
          <Select>
            <Select.Option value="not-started">未开始</Select.Option>
            <Select.Option value="in-progress">进行中</Select.Option>
            <Select.Option value="completed">已完成</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="score"
          label="任务分数"
          initialValue={0}
          rules={[{ required: true, message: '请输入任务分数' }]}
        >
          <InputNumber min={0} max={100} placeholder="请输入任务分数" />
        </Form.Item>
        <Form.Item
          name="priority"
          label="任务优先级"
          initialValue="medium"
        >
          <Select>
            <Select.Option value="low">低</Select.Option>
            <Select.Option value="medium">中</Select.Option>
            <Select.Option value="high">高</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="startDate"
          label="开始日期"
        >
          <DatePicker style={{ width: '100%' }} placeholder="请选择开始日期" />
        </Form.Item>
        <Form.Item
          name="endDate"
          label="结束日期"
        >
          <DatePicker style={{ width: '100%' }} placeholder="请选择结束日期" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddTaskModal;