import { Form, Input, Modal, Space, Typography } from 'antd';
import { nanoid } from 'nanoid';
import { useEffect } from 'react';
import type { Task } from '../types';

interface TaskFormProps {
 open: boolean;
 initial?: Partial<Task>;
 onCancel: () => void;
 onSubmit: (task: Task) => Promise<void> | void;
 saving?: boolean;
}

export default function TaskForm({ open, initial, onCancel, onSubmit, saving }: TaskFormProps) {
 const [form] = Form.useForm<Task>();
 const isEditing = Boolean(initial?.id);

 useEffect(() => {
 if (open) {
 const defaults: Task = {
 id: initial?.id ?? nanoid(8),
 name: initial?.name ?? '',
 owner: initial?.owner ?? '',
 command: initial?.command ?? 'echo Hello World!',
 taskExecutions: initial?.taskExecutions ?? []
 };
 form.setFieldsValue(defaults);
 window.setTimeout(() => {
 document.getElementById('task-name')?.focus();
 }, 80);
 } else {
 form.resetFields();
 }
 }, [form, initial, open]);

 const handleFinish = (values: Task) => {
 const payload: Task = {
 ...values,
 taskExecutions: initial?.taskExecutions ?? values.taskExecutions ?? []
 };
 onSubmit(payload);
 };

 return (
 <Modal
 title={isEditing ? 'Edit Task' : 'Create Task'}
 open={open}
 onCancel={onCancel}
 onOk={() => form.submit()}
 okText={isEditing ? 'Save changes' : 'Create task'}
 confirmLoading={saving}
 destroyOnClose
 maskClosable={false}
>
 <Space direction="vertical" size={14} style={{ width: '100%' }}>
 <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
 Define reusable commands for your cluster. Commands run with server credentials, so avoid embedding sensitive tokens.
 </Typography.Paragraph>
 <Form<Task> form={form} layout="vertical" onFinish={handleFinish} autoComplete="off">
 <Form.Item label="Task ID" name="id" rules={[{ required: true, message: 'Provide a unique identifier' }]}>
 <Input aria-label="Task ID" maxLength={64} />
 </Form.Item>
 <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please enter a name' }]}>
 <Input id="task-name" aria-label="Task name" placeholder="Example: nightly-backup" maxLength={80} />
 </Form.Item>
 <Form.Item label="Owner" name="owner" rules={[{ required: true, message: 'Please enter an owner' }]}>
 <Input aria-label="Task owner" placeholder="Team or individual" maxLength={80} />
 </Form.Item>
 <Form.Item
 label="Command"
 name="command"
 rules={[{ required: true, message: 'Please enter a command' }]}
 extra="Commands execute within the backend environment. Use simple shell syntax."
>
 <Input.TextArea
 aria-label="Shell command"
 placeholder="echo Hello World!"
 autoSize={{ minRows: 3, maxRows: 6 }}
 maxLength={256}
 />
 </Form.Item>
 </Form>
 </Space>
 </Modal>
 );
}
