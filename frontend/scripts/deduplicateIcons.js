#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// 定义文件路径
const filePath = path.join('/Users/zgj/Desktop/performance/performance/performance/performance-wails/frontend/src/components/Dimension/AddDimensionModal.tsx');

// 读取文件内容
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    process.exit(1);
  }

  // 使用正则表达式匹配allIconNames数组
  const regex = /const allIconNames = \[(.*?)\];/s;
  const match = data.match(regex);
  
  if (!match) {
    console.error('Could not find allIconNames array in the file.');
    process.exit(1);
  }

  // 提取数组内容
  const arrayContent = match[1];
  
  // 匹配所有的图标名称
  const iconRegex = /'([^']+)'/g;
  const iconMatches = arrayContent.match(iconRegex);
  
  if (!iconMatches) {
    console.error('Could not find any icon names in the array.');
    process.exit(1);
  }

  // 提取图标名称并去重
  const iconNames = iconMatches.map(match => match.replace(/'/g, ''));
  const uniqueIconNames = [...new Set(iconNames)];
  
  console.log(`Original icon count: ${iconNames.length}`);
  console.log(`Unique icon count: ${uniqueIconNames.length}`);
  console.log(`Duplicates removed: ${iconNames.length - uniqueIconNames.length}`);

  // 构建新的数组字符串
  const newArrayContent = uniqueIconNames.map(name => `  '${name}'`).join(',\n');
  const newAllIconNames = `const allIconNames = [\n${newArrayContent}\n];`;
  
  // 替换原数组
  const newData = data.replace(regex, newAllIconNames);
  
  // 写回文件
  fs.writeFile(filePath, newData, 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
      process.exit(1);
    }
    
    console.log('Successfully deduplicated allIconNames array!');
    console.log('File updated:', filePath);
  });
});
