import { Badge, Button, Descriptions, Modal, Space, Typography, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useCallback, useMemo } from 'react';
import type { TaskExecution } from '../types';

interface RunOutputModalProps {
 open: boolean;
 onClose: () => void;
 exec?: TaskExecution | null;
 taskName?: string;
}

export default function RunOutputModal({ open, onClose, exec, taskName }: RunOutputModalProps) {
 const output = exec?.output ?? '';
 const hasOutput = Boolean(output.trim());

 const durationLabel = useMemo(() => {
 if (!exec?.startTime || !exec?.endTime) {
 return 'n/a';
 }
 const start = dayjs(exec.startTime);
 const end = dayjs(exec.endTime);
 const seconds = Math.max(end.diff(start, 'second'), 0);
 if (seconds < 1) return '< 1s';
 if (seconds < 60) return `${seconds}s`;
 const minutes = Math.floor(seconds / 60);
 const remainder = seconds % 60;
 return remainder ? `${minutes}m ${remainder}s` : `${minutes}m`;
 }, [exec]);

 const handleCopy = useCallback(async () => {
 if (!hasOutput) return;
 try {
 if (typeof navigator === 'undefined' || !navigator.clipboard) {
 throw new Error('Clipboard permissions are unavailable in this browser context.');
 }
 await navigator.clipboard.writeText(output);
 message.success('Execution output copied to clipboard.');
 } catch (error) {
 const text = error instanceof Error ? error.message : 'Unable to copy output.';
 message.error(text);
 }
 }, [hasOutput, output]);

 return (
 <Modal
 title={`Execution Output${taskName ? ` - ${taskName}` : ''}`}
 open={open}
 onCancel={onClose}
 onOk={onClose}
 okText="Close"
 width={760}
>
 {exec ? (
 <Space direction="vertical" size={16} style={{ width: '100%' }}>
 <Space align="center" style={{ justifyContent: 'space-between', width: '100%' }}>
 <Typography.Title level={4} style={{ margin: 0 }}>
 Command run summary
 </Typography.Title>
 <Button icon={<CopyOutlined />} onClick={handleCopy} disabled={!hasOutput}>
 Copy output
 </Button>
 </Space>

 <Descriptions
 size="small"
 column={2}
 items={[
 { key: 'start', label: 'Start', children: dayjs(exec.startTime).format('MMM D, YYYY HH:mm:ss') },
 { key: 'end', label: 'End', children: dayjs(exec.endTime).format('MMM D, YYYY HH:mm:ss') },
 { key: 'status', label: 'Status', children: <Badge status="success" text="Completed" /> },
 { key: 'duration', label: 'Duration', children: durationLabel }
 ]}
 />

 <Space direction="vertical" size={6} style={{ width: '100%' }}>
 <Typography.Text type="secondary">Command output</Typography.Text>
 <pre className="log" role="log" aria-live="polite" aria-label="Command output">
 {hasOutput ? output : '(no output)'}
 </pre>
 </Space>
 </Space>
 ) : (
 <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
 There is no execution history for this task yet.
 </Typography.Paragraph>
 )}
 </Modal>
 );
}
