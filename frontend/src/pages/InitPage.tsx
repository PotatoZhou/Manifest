import { useState } from 'react';
import { Upload } from 'lucide-react';
import { NewAccount } from '../../wailsjs/go/main/App';
import type { Account } from '../utils/PerformanceSystem';

interface InitPageProps {
  onAccountCreated: (account: Account) => void;
}

// 预设头像列表
const presetAvatars = [
  'avatar-1.png',
  'avatar-2.png',
  'avatar-3.png',
  'avatar-4.png',
  'avatar-5.png',
];

const InitPage: React.FC<InitPageProps> = ({ onAccountCreated }) => {
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 处理头像选择
  const handleAvatarSelect = (avatar: string) => {
    setSelectedAvatar(avatar);
    setCustomAvatar(null);
  };

  // 处理自定义头像上传
  const handleCustomAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCustomAvatar(result);
        setSelectedAvatar('');
      };
      reader.readAsDataURL(file);
    }
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      alert('请输入昵称');
      return;
    }

    if (!selectedAvatar && !customAvatar) {
      alert('请选择头像');
      return;
    }

    setIsSubmitting(true);

    try {
      // 使用自定义头像或预设头像
      let avatarPath = selectedAvatar;
      if (customAvatar) {
        // 在实际应用中，这里应该上传到服务器并获取路径
        // 现在暂时使用data URL
        avatarPath = customAvatar;
      }

      // 创建新账号
      const newAccount = await NewAccount(username.trim(), avatarPath);
      onAccountCreated(newAccount);
    } catch (error) {
      console.error('Failed to create account:', error);
      alert('创建账号失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="init-page-container">
      <div className="init-page-content">
        <h1 className="app-title">Manifest</h1>
        <p className="app-subtitle">欢迎使用Manifest</p>

        <form className="init-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              输入昵称
            </label>
            <input
              type="text"
              id="username"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入您的昵称"
              maxLength={20}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label">选择头像</label>
            <div className="avatars-grid">
              {presetAvatars.map((avatar, index) => (
                <div
                  key={index}
                  className={`avatar-option ${selectedAvatar === avatar ? 'selected' : ''}`}
                  onClick={() => handleAvatarSelect(avatar)}
                >
                  <div className="avatar-icon">
                    {/* 这里使用数字作为临时头像图标 */}
                    {index + 1}
                  </div>
                </div>
              ))}

              <div
                className={`avatar-option custom ${customAvatar ? 'selected' : ''}`}
                onClick={() => document.getElementById('avatar-upload')?.click()}
              >
                <div className="avatar-icon">
                  <Upload size={24} />
                </div>
              </div>
            </div>
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              className="hidden-upload"
              onChange={handleCustomAvatarUpload}
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? '创建中...' : '开始使用'}
          </button>
        </form>
      </div>

      <style>{`
        .init-page-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #ffffff;
          z-index: 1000;
          border-radius: 12px;
          overflow: hidden;
        }

        .init-page-content {
          max-width: 500px;
          width: 100%;
          padding: 40px;
          box-sizing: border-box;
          text-align: center;
        }

        .app-title {
          font-size: 42px;
          font-weight: bold;
          color: #6366f1;
          margin-bottom: 16px;
        }

        .app-subtitle {
          font-size: 18px;
          color: #6b7280;
          margin-bottom: 48px;
        }

        .init-form {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .form-label {
          font-size: 16px;
          font-weight: 500;
          color: #374151;
          align-self: flex-start;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          font-size: 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .form-input:focus {
          border-color: #6366f1;
        }

        .form-input::placeholder {
          color: #9ca3af;
        }

        .avatars-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          width: 100%;
        }

        .avatar-option {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background-color: #f3e8ff;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 2px solid transparent;
        }

        .avatar-option.selected {
          border-color: #6366f1;
          background-color: #ede9fe;
          transform: scale(1.1);
        }

        .avatar-option:hover {
          transform: scale(1.1);
        }

        .avatar-option.custom {
          background-color: #f9fafb;
          border: 2px dashed #d1d5db;
        }

        .avatar-option.custom.selected {
          border-color: #6366f1;
          background-color: #f3e8ff;
        }

        .avatar-icon {
          font-size: 32px;
          font-weight: bold;
          color: #6366f1;
        }

        .hidden-upload {
          display: none;
        }

        .submit-button {
          padding: 14px 24px;
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
          background-color: #6366f1;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.2s ease;
          margin-top: 16px;
        }

        .submit-button:hover {
          background-color: #4f46e5;
        }

        .submit-button:disabled {
          background-color: #a5b4fc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default InitPage;