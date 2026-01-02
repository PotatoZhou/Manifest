import React from 'react';
import { Modal } from 'antd';
import Button from '../Button/Button';
import * as app from '../../../wailsjs/go/main/App';

interface UpdateModalProps {
  visible: boolean;
  onClose: () => void;
  latestVersion: string;
  releaseNotes: string;
  downloadURL: string;
}

const UpdateModal: React.FC<UpdateModalProps> = ({
  visible,
  onClose,
  latestVersion,
  releaseNotes,
  downloadURL
}) => {
  // 处理下载按钮点击
  const handleDownload = () => {
    app.OpenDownloadURL(downloadURL);
    onClose();
  };

  // 处理稍后按钮点击
  const handleLater = () => {
    onClose();
  };

  // 格式化发布说明，支持换行
  const formatReleaseNotes = (notes: string) => {
    return notes.split('\n').map((line, index) => (
      <p key={index} style={{ marginBottom: '8px' }}>{line}</p>
    ));
  };

  return (
    <Modal
      title="发现新版本"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
    >
      <div style={{ padding: '10px 0' }}>
        <p style={{ marginBottom: '20px', fontSize: '16px', fontWeight: 'bold' }}>
          新版本: {latestVersion}
        </p>
        <div style={{ marginBottom: '20px' }}>
          <h4>更新内容:</h4>
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            {formatReleaseNotes(releaseNotes)}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button type="light" onClick={handleLater}>
            稍后
          </Button>
          <Button type="primary" onClick={handleDownload}>
            去下载
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default UpdateModal;