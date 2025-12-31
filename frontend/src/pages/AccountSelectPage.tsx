import { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { GetAccounts, SwitchAccount } from '../../wailsjs/go/main/App';
import type { Account } from '../utils/PerformanceSystem';

interface AccountSelectPageProps {
  onAccountSelect: (account: Account) => void;
  onAddAccount: () => void;
}

const AccountSelectPage: React.FC<AccountSelectPageProps> = ({ onAccountSelect, onAddAccount }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);

  // 加载账号列表
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const fetchedAccounts = await GetAccounts();
        setAccounts(fetchedAccounts);
      } catch (error) {
        console.error('Failed to load accounts:', error);
      }
    };

    loadAccounts();
  }, []);

  // 选择账号
  const handleAccountSelect = async (account: Account) => {
    try {
      await SwitchAccount(account.id);
      onAccountSelect(account);
    } catch (error) {
      console.error('Failed to switch account:', error);
    }
  };

  return (
    <div className="account-select-container">
      <div className="account-select-content">
        <h1 className="app-title">Manifest</h1>
        <p className="app-subtitle">选择您的账号</p>
        
        <div className="accounts-grid">
          {accounts.map((account) => (
            <div
              key={account.id}
            className="account-item"
            onClick={() => handleAccountSelect(account)}
          >
            <div className="account-avatar-container">
              <img
                src={account.avatarPath}
                alt={account.username}
                className="account-avatar"
              />
            </div>
            <div className="account-name">{account.username}</div>
            </div>
          ))}

          <div className="add-account-item" onClick={onAddAccount}>
            <div className="add-account-icon">
              <PlusCircle size={40} />
            </div>
            <div className="add-account-text">添加新账号</div>
          </div>
        </div>
      </div>

      <style>{`
        .account-select-container {
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

        .account-select-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px;
        }

        .app-title {
          font-size: 32px;
          font-weight: bold;
          color: #6366f1;
          margin-bottom: 8px;
        }

        .app-subtitle {
          font-size: 16px;
          color: #6b7280;
          margin-bottom: 48px;
        }

        .accounts-grid {
          display: flex;
          gap: 32px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .account-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transition: transform 0.2s ease;
          padding: 16px;
        }

        .account-item:hover {
          transform: scale(1.05);
        }

        .account-avatar-container {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          overflow: hidden;
          margin-bottom: 12px;
          box-shadow: 0 0 0 2px transparent;
          transition: all 0.3s ease;
        }

        .account-item:hover .account-avatar-container {
          box-shadow: 0 0 0 2px #6366f1, 0 0 20px rgba(99, 102, 241, 0.3);
        }

        .account-avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .account-name {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .add-account-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          padding: 16px;
          transition: transform 0.2s ease;
        }

        .add-account-item:hover {
          transform: scale(1.05);
        }

        .add-account-icon {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          border: 2px dashed #d1d5db;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 12px;
          color: #6b7280;
        }

        .add-account-item:hover .add-account-icon {
          border-color: #6366f1;
          color: #6366f1;
        }

        .add-account-text {
          font-size: 14px;
          font-weight: 500;
          color: #6b7280;
        }

        .add-account-item:hover .add-account-text {
          color: #6366f1;
        }
      `}</style>
    </div>
  );
};

export default AccountSelectPage;