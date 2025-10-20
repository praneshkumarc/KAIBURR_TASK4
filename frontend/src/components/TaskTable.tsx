import { CodeOutlined, DeleteOutlined, EditOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { Button, Empty, Popconfirm, Space, Table, Tag, Tooltip, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { MouseEvent } from 'react';
import { useMemo } from 'react';
import type { Task } from '../types';

interface TaskTableProps {
 data: Task[];
 loading: boolean;
 onRun: (task: Task) => void;
 onDelete: (task: Task) => void;
 onViewOutput: (task: Task, trigger?: HTMLButtonElement) => void;
 onEdit: (task: Task) => void;
}

export default function TaskTable({ data, loading, onRun, onDelete, onViewOutput, onEdit }: TaskTableProps) {
 const columns = useMemo<ColumnsType<Task>>(
 () => [
 {
 title: 'Task',
 dataIndex: 'name',
 key: 'task',
 ellipsis: true,
 render: (_: unknown, task: Task) => (
 <Space direction="vertical" size={4}>
 <Typography.Text strong>{task.name || '(Unnamed task)'}</Typography.Text>
 <Space size={8} wrap>
        <Tag>{task.owner || 'Unassigned'}</Tag>
 <Typography.Text type="secondary">{task.id}</Typography.Text>
 </Space>
 </Space>
 )
 },
  {
    title: 'Command',
    dataIndex: 'command',
    key: 'command',
    ellipsis: true,
    render: (command: string) => (
      <span
        style={{
          display: 'inline-block',
          padding: '6px 10px',
          borderRadius: 10,
          background: '#eef2ff',
          border: '1px solid #dbeafe',
          color: '#0f172a',
          fontFamily: 'JetBrains Mono, Consolas, "Liberation Mono", Menlo, monospace',
          fontSize: 12,
        }}
      >
        {command}
      </span>
    ),
  },
 {
 title: 'Executions',
 key: 'runs',
 width: 140,
 align: 'center',
 render: (_: unknown, task: Task) => (
 <Space direction="vertical" size={0}>
 <Typography.Text strong>{task.taskExecutions?.length ?? 0}</Typography.Text>
 <Typography.Text type="secondary">total runs</Typography.Text>
 </Space>
 )
 },
  {
    title: 'Last Run',
    key: 'lastRun',
    width: 220,
    render: (_: unknown, task: Task) => {
      const latest = task.taskExecutions?.[task.taskExecutions.length - 1];
      if (!latest) {
        return <Typography.Text>Never</Typography.Text>;
      }
      return (
        <Space direction="vertical" size={2}>
          <Typography.Text>{dayjs(latest.endTime).format('MMM D, YYYY HH:mm')}</Typography.Text>
          <Button
            type="link"
            size="small"
            icon={<CodeOutlined />}
            onClick={(event: MouseEvent<HTMLButtonElement>) => onViewOutput(task, event.currentTarget)}
          >
            View output
          </Button>
        </Space>
      );
    },
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 220,
    render: (_: unknown, task: Task) => (
      <Space size={10} wrap>
        <Tooltip title="Run task on cluster">
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<PlayCircleOutlined />}
            onClick={() => onRun(task)}
            aria-label={`Run ${task.name}`}
          />
        </Tooltip>
        <Tooltip title="Edit task configuration">
          <Button shape="circle" size="large" icon={<EditOutlined />} onClick={() => onEdit(task)} aria-label={`Edit ${task.name}`} />
        </Tooltip>
        <Popconfirm
          title={`Delete ${task.name}?`}
          description="This removes the task definition."
          okButtonProps={{ danger: true }}
          onConfirm={() => onDelete(task)}
        >
          <Button danger ghost shape="circle" size="large" icon={<DeleteOutlined />} aria-label={`Delete ${task.name}`} />
        </Popconfirm>
      </Space>
    ),
  },
 ],
 [onRun, onDelete, onEdit, onViewOutput]
 );

 return (
  <Table<Task>
   rowKey={(record) => record.id}
   loading={loading}
   columns={columns}
   dataSource={data}
   size="middle"
   tableLayout="fixed"
   scroll={{ x: 900 }}
   pagination={{ pageSize: 10, showSizeChanger: false, position: ['bottomCenter'] }}
   locale={{
    emptyText: <Empty description="No tasks yet. Create a task to get started." />
   }}
  />
 );
}
