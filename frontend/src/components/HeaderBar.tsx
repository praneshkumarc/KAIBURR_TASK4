import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Input, Space, Tooltip, Typography } from 'antd';
import dayjs from 'dayjs';
import type { TaskStats } from '../types';

interface HeaderBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  onNew: () => void;
  onRefresh: () => void;
  stats: TaskStats;
  loading: boolean;
  lastUpdatedAt: Date | null;
}

export default function HeaderBar({
  query,
  onQueryChange,
  onNew,
  onRefresh,
  stats,
  loading,
  lastUpdatedAt,
}: HeaderBarProps) {
  const pending = Math.max(stats.total - stats.withRuns, 0);
  const lastRunText = stats.lastRun ? dayjs(stats.lastRun).format('MMM D, YYYY HH:mm') : 'No runs yet';
  const refreshedText = lastUpdatedAt
    ? `Synced ${dayjs(lastUpdatedAt).format('MMM D, YYYY HH:mm:ss')}`
    : 'Waiting to fetch tasks';

  const tiles = [
    { key: 'total', label: 'Total Tasks', value: stats.total, hint: 'Registered blueprints' },
    { key: 'active', label: 'Active', value: stats.withRuns, hint: `${pending} yet to run` },
    { key: 'owners', label: 'Owners', value: stats.uniqueOwners, hint: 'Teams collaborating' },
    { key: 'runs', label: 'Executions', value: stats.totalRuns, hint: `Last run ${lastRunText}` },
  ];

  return (
    <div className="hero">
      <div className="hero__head">
        <div className="hero__intro">
          <Typography.Title level={2} className="hero__title">
            Task Control Center
          </Typography.Title>
          <Typography.Paragraph className="hero__subtitle">
            Search, launch, and monitor reusable cluster commands with live feedback and smart insights.
          </Typography.Paragraph>
          <Typography.Text type="secondary">{refreshedText}</Typography.Text>
        </div>

        <Space className="hero__actions" size={12} wrap>
          <Input.Search
            aria-label="Search tasks by name"
            placeholder="Search by name"
            allowClear
            className="hero__search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
          <Tooltip title="Refresh list">
            <Button
              icon={<ReloadOutlined />}
              onClick={onRefresh}
              aria-label="Refresh tasks"
              loading={loading}
              disabled={loading}
            />
          </Tooltip>
          <Button type="primary" icon={<PlusOutlined />} onClick={onNew}>
            New Task
          </Button>
        </Space>
      </div>

      <div className="hero__stats">
        {tiles.map((tile) => (
          <div key={tile.key} className="hero__tile">
            <Typography.Text type="secondary">{tile.label}</Typography.Text>
            <Typography.Title level={3} className="hero__tile-value">
              {tile.value}
            </Typography.Title>
            <Typography.Text type="secondary">{tile.hint}</Typography.Text>
          </div>
        ))}
      </div>
    </div>
  );
}
