/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from 'react';
import { Modal, Input, ColorPicker } from 'antd';
import { Gauge } from 'lucide-react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';

interface AddDimensionModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (data: { title: string; color: string; icon: string }) => void;
}

const commonIconNames = [
  'Palette',
  'Heart',
  'Star',
  'Camera',
  'Calendar',
  'CheckCircle',
  'Home',
  'Settings',
  'User',
  'Users',
  'Book',
  'Brain',
  'Trophy',
  'Zap',
  'Flame',
];

const dynamicIconImportsAny: Record<string, any> = dynamicIconImports as unknown as Record<string, any>;
const allIconNames = Object.keys(dynamicIconImportsAny) as string[];

const AddDimensionModal: React.FC<AddDimensionModalProps> = ({
  open,
  onCancel,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('#673ab7');
  const [selectedIcon, setSelectedIcon] = useState<string>('Palette');
  const [search, setSearch] = useState('');

  const filteredIconNames = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return commonIconNames;
    }
    return allIconNames.filter((name) =>
      name.toLowerCase().includes(q)
    );
  }, [search]);

  const hasSearch = !!search.trim();

  const presetColors = [
    '#673ab7',
    '#7c3aed',
    '#a855f7',
    '#ef4444',
    '#f59e0b',
    '#22c55e',
    '#06b6d4',
    '#3b82f6',
    '#0ea5e9',
    '#14b8a6',
    '#94a3b8',
    '#000000',
  ];

  const handleOk = () => {
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      color,
      icon: selectedIcon,
    });
  };

  const renderIcon = (name: string) => {
    const importer = dynamicIconImportsAny[name];
    if (!importer) {
      return <Gauge size={18} color="#9ca3af" />;
    }
    const LazyIcon = React.lazy(importer as any);
    return (
      <React.Suspense fallback={<Gauge size={18} color="#9ca3af" />}>
        <LazyIcon size={18} />
      </React.Suspense>
    );
  };

  return (
    <Modal
      title="添加维度"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="确定"
      cancelText="取消"
      okButtonProps={{ disabled: !title.trim() }}
      width={560}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* 维度名称 */}
        <div>
          <div style={{ marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
            维度名称
          </div>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：学习、健身、工作、娱乐"
            maxLength={20}
          />
        </div>

        {/* 颜色选择 */}
        <div>
          <div style={{ marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
            维度颜色
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <ColorPicker
              value={color}
              onChange={(_, hex) => setColor(hex as string)}
              format="hex"
              showText
              disabledAlpha
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {presetColors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    border: color === c ? `2px solid ${c}` : '1px solid #d9d9d9',
                    backgroundColor: c,
                    cursor: 'pointer',
                    boxShadow: color === c ? '0 0 0 3px rgba(0,0,0,0.1)' : undefined,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 图标选择 */}
        <div>
          <div style={{ marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
            维度图标
          </div>

          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索图标名称（支持模糊搜索全部图标）"
            style={{ marginBottom: 12 }}
          />

          {!hasSearch && (
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
              常用图标（共 {allIconNames.length} 个图标可搜索）
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(82px, 1fr))',
              gap: 8,
              maxHeight: 280,
              overflowY: 'auto',
              padding: '4px 8px 4px 0',
            }}
          >
            {(hasSearch ? filteredIconNames : commonIconNames).map((name) => {
              const isSelected = selectedIcon === name;

              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedIcon(name)}
                  title={name}
                  style={{
                    padding: '8px 4px',
                    borderRadius: 8,
                    border: isSelected
                      ? `2px solid ${color}`
                      : '1px solid #e5e7eb',
                    backgroundColor: isSelected ? `${color}0f` : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    transition: 'all 0.15s',
                    aspectRatio: '1 / 1',
                  }}
                >
                  <div
                    style={{
                      color: isSelected ? color : '#6b7280',
                      lineHeight: 1,
                    }}
                  >
                    {renderIcon(name)}
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      color: isSelected ? color : '#6b7280',
                      textAlign: 'center',
                      lineHeight: 1.2,
                      width: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {name}
                  </span>
                </button>
              );
            })}
          </div>

          {hasSearch && filteredIconNames.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                color: '#9ca3af',
                padding: '32px 0',
                fontSize: 14,
              }}
            >
              没有找到匹配的图标
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AddDimensionModal;
