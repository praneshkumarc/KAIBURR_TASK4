import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { App as AntdApp, Button, ConfigProvider, Flex, Layout, Space, Typography } from 'antd';
import dayjs from 'dayjs';
import type { Task, TaskExecution, TaskStats } from './types';
import { TasksApi } from './api/tasks';
import { API_BASE } from './api/client';
import HeaderBar from './components/HeaderBar';
import TaskForm from './components/TaskForm';
import TaskTable from './components/TaskTable';
import RunOutputModal from './components/RunOutputModal';
import TaskEmptyState from './components/TaskEmptyState';
import themeConfig from './theme';
import { useDebounce } from './hooks/useDebounce';

const { Header, Content, Footer } = Layout;

function AppContent() {
  const { message } = AntdApp.useApp();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query.trim());
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);
  const [execOpen, setExecOpen] = useState(false);
  const [execTaskName, setExecTaskName] = useState('');
  const [exec, setExec] = useState<TaskExecution | null>(null);
  const [lastLoadedAt, setLastLoadedAt] = useState<Date | null>(null);
  const lastFocusRef = useRef<HTMLButtonElement | null>(null);

  const fetchTasks = useCallback(
    async (term?: string) => {
      setLoading(true);
      try {
        const result =
          term && term.length > 0 ? await TasksApi.searchByName(term) : await TasksApi.list();
        setTasks(result);
        setLastLoadedAt(new Date());
      } catch (error) {
        const messageText =
          error instanceof Error ? error.message : 'Unable to load tasks right now';
        message.error(messageText);
      } finally {
        setLoading(false);
      }
    },
    [message],
  );

  useEffect(() => {
    void fetchTasks(debouncedQuery || undefined);
  }, [debouncedQuery, fetchTasks]);

  const handleRefresh = useCallback(() => {
    void fetchTasks(debouncedQuery || undefined);
  }, [fetchTasks, debouncedQuery]);

  const handleCreate = useCallback(() => {
    setEditingTask(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setFormOpen(true);
  }, []);

  const handleSave = useCallback(
    async (task: Task) => {
      setSaving(true);
      const exists = tasks.some((t) => t.id === task.id);
      try {
        await TasksApi.upsert(task);
        message.success(exists ? 'Task updated successfully' : 'Task created successfully');
        setFormOpen(false);
        setEditingTask(null);
        await fetchTasks(debouncedQuery || undefined);
      } catch (error) {
        const messageText =
          error instanceof Error ? error.message : 'Unable to save the task right now';
        message.error(messageText);
      } finally {
        setSaving(false);
      }
    },
    [debouncedQuery, fetchTasks, message, tasks],
  );

  const handleRun = useCallback(
    async (task: Task) => {
      const key = `run-${task.id}`;
      message.open({ key, type: 'loading', content: `Running "${task.name}"...`, duration: 0 });
      try {
        await TasksApi.run(task.id);
        message.open({ key, type: 'success', content: `Execution started for "${task.name}"` });
        await fetchTasks(debouncedQuery || undefined);
      } catch (error) {
        const messageText =
          error instanceof Error ? error.message : 'Unable to trigger the execution';
        message.open({ key, type: 'error', content: messageText });
      }
    },
    [debouncedQuery, fetchTasks, message],
  );

  const handleDelete = useCallback(
    async (task: Task) => {
      const key = `delete-${task.id}`;
      message.open({ key, type: 'loading', content: `Deleting "${task.name}"...`, duration: 0 });
      try {
        await TasksApi.remove(task.id);
        message.open({ key, type: 'success', content: `"${task.name}" removed` });
        await fetchTasks(debouncedQuery || undefined);
      } catch (error) {
        const messageText =
          error instanceof Error ? error.message : 'Unable to delete the task';
        message.open({ key, type: 'error', content: messageText });
      }
    },
    [debouncedQuery, fetchTasks, message],
  );

  const handleViewOutput = useCallback((task: Task, trigger?: HTMLButtonElement) => {
    const history = task.taskExecutions ?? [];
    const latest = history[history.length - 1] ?? null;
    setExec(latest);
    setExecTaskName(task.name);
    setExecOpen(true);
    lastFocusRef.current = trigger ?? null;
  }, []);

  const handleExecClose = useCallback(() => {
    setExecOpen(false);
    window.setTimeout(() => lastFocusRef.current?.focus(), 80);
  }, []);

  const apiBase = API_BASE;

  const stats = useMemo<TaskStats>(() => {
    if (!tasks.length) {
      return {
        total: 0,
        withRuns: 0,
        uniqueOwners: 0,
        totalRuns: 0,
        lastRun: null,
      };
    }

    const owners = new Set<string>();
    let totalRuns = 0;
    let lastRunTimestamp: string | null = null;

    tasks.forEach((task) => {
      if (task.owner) {
        owners.add(task.owner);
      }
      if (task.taskExecutions?.length) {
        totalRuns += task.taskExecutions.length;
        const latest = task.taskExecutions[task.taskExecutions.length - 1];
        if (latest?.endTime) {
          if (!lastRunTimestamp || new Date(latest.endTime) > new Date(lastRunTimestamp)) {
            lastRunTimestamp = latest.endTime;
          }
        }
      }
    });

    return {
      total: tasks.length,
      withRuns: tasks.filter((task) => task.taskExecutions?.length).length,
      uniqueOwners: owners.size,
      totalRuns,
      lastRun: lastRunTimestamp,
    };
  }, [tasks]);

  const hasTasks = tasks.length > 0;
  const lastRunDisplay = stats.lastRun ? dayjs(stats.lastRun).format('MMM D, YYYY HH:mm') : null;
  const pendingCount = Math.max(stats.total - stats.withRuns, 0);

  return (
    <>
      <Layout style={{ minHeight: '100dvh', background: 'transparent' }}>
        <Header
          style={{
            background: 'transparent',
            padding: 0,
            height: 'auto',
            lineHeight: 'normal',
          }}
        >
          <div
            style={{
              maxWidth: 'var(--max-content)',
              margin: '0 auto',
              padding: '24px 16px 0',
            }}
          >
            <HeaderBar
              query={query}
              onQueryChange={setQuery}
              onNew={handleCreate}
              onRefresh={handleRefresh}
              stats={stats}
              loading={loading}
              lastUpdatedAt={lastLoadedAt}
            />
          </div>
        </Header>

        <Content>
          <Flex
            id="main"
            vertical
            gap={24}
            style={{
              maxWidth: 'var(--max-content)',
              margin: '0 auto',
              padding: '24px 16px 64px',
            }}
          >
            <TaskTable
              data={tasks}
              loading={loading}
              onRun={handleRun}
              onDelete={handleDelete}
              onViewOutput={handleViewOutput}
              onEdit={handleEdit}
            />
            {hasTasks ? (
              <div className="insight-grid">
                <div className="insight-card">
                  <Typography.Title level={4} style={{ marginBottom: 8 }}>
                    Operations snapshot
                  </Typography.Title>
                  <Typography.Paragraph type="secondary" style={{ marginTop: 0 }}>
                    Keep an eye on execution trends across your workspace.
                  </Typography.Paragraph>
                  <ul className="insight-card__list">
                    <li>
                      <span className="insight-metric">{stats.total}</span> tasks in registry
                    </li>
                    <li>
                      <span className="insight-metric">{stats.totalRuns}</span> executions captured
                    </li>
                    <li>
                      {pendingCount > 0
                        ? `${pendingCount} task${pendingCount > 1 ? 's' : ''} have never been run`
                        : 'All tasks have run at least once'}
                    </li>
                    {lastRunDisplay ? <li>Last completion {lastRunDisplay}</li> : null}
                  </ul>
                  <Button type="link" onClick={handleRefresh} className="insight-card__action">
                    Refresh data
                  </Button>
                </div>
                <div className="insight-card insight-card--secondary">
                  <Typography.Title level={4} style={{ marginBottom: 12 }}>
                    Productivity tips
                  </Typography.Title>
                  <ul className="insight-card__list insight-card__list--bullets">
                    <li>Click the command badge to copy the exact shell invocation.</li>
                    <li>Use the output drawer to review logs without leaving this page.</li>
                    <li>Assign owners to keep responsibility clear for every task.</li>
                  </ul>
                </div>
              </div>
            ) : (
              <TaskEmptyState onCreate={handleCreate} onRefresh={handleRefresh} />
            )}
          </Flex>
        </Content>

        <Footer style={{ textAlign: 'center', background: 'transparent' }}>
          <Space direction="vertical" size={4}>
            <Typography.Text type="secondary">
              API endpoint: <code>{apiBase}</code>
            </Typography.Text>
            {lastLoadedAt && (
              <Typography.Text type="secondary">
                Last refreshed at {lastLoadedAt.toLocaleTimeString()}
              </Typography.Text>
            )}
          </Space>
        </Footer>
      </Layout>

      <TaskForm
        open={formOpen}
        initial={editingTask ?? undefined}
        onCancel={() => {
          setFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSave}
        saving={saving}
      />

      <RunOutputModal
        open={execOpen}
        onClose={handleExecClose}
        exec={exec}
        taskName={execTaskName}
      />
    </>
  );
}

export default function App() {
  return (
    <ConfigProvider theme={themeConfig}>
      <AntdApp>
        <AppContent />
      </AntdApp>
    </ConfigProvider>
  );
}
