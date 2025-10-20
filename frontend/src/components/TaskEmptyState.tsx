import { InboxOutlined, RocketOutlined, ThunderboltOutlined, SyncOutlined } from '@ant-design/icons';
import { Button, List, Typography } from 'antd';

interface TaskEmptyStateProps {
  onCreate: () => void;
  onRefresh: () => void;
}

const recommendations = [
  {
    key: 'create',
    title: 'Create a reusable command',
    description: 'Capture a frequently executed script or job so it can be launched on demand.',
    icon: <RocketOutlined />,
  },
  {
    key: 'schedule',
    title: 'Track execution history',
    description: 'Use the run dialog to view logs, timestamps, and status badges for each launch.',
    icon: <ThunderboltOutlined />,
  },
  {
    key: 'sync',
    title: 'Stay in sync',
    description: 'Refresh the table any time to fetch the latest tasks from the API service.',
    icon: <SyncOutlined />,
  },
];

export default function TaskEmptyState({ onCreate, onRefresh }: TaskEmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state__header">
        <span className="empty-state__icon">
          <InboxOutlined />
        </span>
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>
            You have not added any tasks yet
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ margin: '4px 0 0' }}>
            Capture your first task to orchestrate repeatable work. You can always edit or remove it later.
          </Typography.Paragraph>
        </div>
      </div>

      <List
        itemLayout="horizontal"
        dataSource={recommendations}
        split={false}
        renderItem={(item) => (
          <List.Item className="empty-state__item">
            {item.icon ? <span className="empty-state__item-icon">{item.icon}</span> : null}
            <div>
              <Typography.Text strong>{item.title}</Typography.Text>
              <Typography.Paragraph type="secondary" style={{ margin: '2px 0 0' }}>
                {item.description}
              </Typography.Paragraph>
            </div>
          </List.Item>
        )}
      />

      <div className="empty-state__actions">
        <Button type="primary" onClick={onCreate}>
          Create your first task
        </Button>
        <Button onClick={onRefresh}>Refresh data</Button>
      </div>
    </div>
  );
}
