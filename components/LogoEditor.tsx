import React, { useState, useEffect } from 'react';
import { LogoSettings } from '../types';

interface LogoEditorProps {
  logoSettings: LogoSettings;
  onUpdate: (settings: LogoSettings) => void;
}

const LogoEditor: React.FC<LogoEditorProps> = ({ logoSettings, onUpdate }) => {
  const [headerText, setHeaderText] = useState(logoSettings.headerLogo?.text || 'TinyTech');
  const [headerWidth, setHeaderWidth] = useState(logoSettings.headerLogo?.width || 40);
  const [headerHeight, setHeaderHeight] = useState(logoSettings.headerLogo?.height || 40);
  const [headerImage, setHeaderImage] = useState(logoSettings.headerLogo?.image || '');
  const [headerImageUrl, setHeaderImageUrl] = useState(logoSettings.headerLogo?.image || '');
  
  const [footerText, setFooterText] = useState(logoSettings.footerLogo?.text || 'TinyTech');
  const [footerWidth, setFooterWidth] = useState(logoSettings.footerLogo?.width || 40);
  const [footerHeight, setFooterHeight] = useState(logoSettings.footerLogo?.height || 40);
  const [footerImage, setFooterImage] = useState(logoSettings.footerLogo?.image || '');
  const [footerImageUrl, setFooterImageUrl] = useState(logoSettings.footerLogo?.image || '');

  // Sync with logoSettings when props change
  useEffect(() => {
    setHeaderText(logoSettings.headerLogo?.text || 'TinyTech');
    setHeaderWidth(logoSettings.headerLogo?.width || 40);
    setHeaderHeight(logoSettings.headerLogo?.height || 40);
    setHeaderImage(logoSettings.headerLogo?.image || '');
    setHeaderImageUrl(logoSettings.headerLogo?.image || '');
    setFooterText(logoSettings.footerLogo?.text || 'TinyTech');
    setFooterWidth(logoSettings.footerLogo?.width || 40);
    setFooterHeight(logoSettings.footerLogo?.height || 40);
    setFooterImage(logoSettings.footerLogo?.image || '');
    setFooterImageUrl(logoSettings.footerLogo?.image || '');
  }, [logoSettings]);

  const handleSaveHeader = () => {
    const imageToSave = headerImageUrl || headerImage;
    console.log('Saving header:', { headerText, headerWidth, headerHeight, image: imageToSave });
    onUpdate({
      ...logoSettings,
      headerLogo: {
        image: imageToSave,
        text: headerText,
        width: headerWidth,
        height: headerHeight
      }
    });
    alert('页头Logo设置已保存！');
  };

  const handleSaveFooter = () => {
    const imageToSave = footerImageUrl || footerImage;
    console.log('Saving footer:', { footerText, footerWidth, footerHeight, image: imageToSave });
    onUpdate({
      ...logoSettings,
      footerLogo: {
        image: imageToSave,
        text: footerText,
        width: footerWidth,
        height: footerHeight
      }
    });
    alert('页脚Logo设置已保存！');
  };

  const handleImageUpload = (type: 'header' | 'footer', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if it's SVG (SVG files are usually small and text-based)
      const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
      
      // Check file size (limit to 100KB for regular images, 50KB for SVG)
      const maxSize = isSvg ? 50 * 1024 : 100 * 1024;
      if (file.size > maxSize) {
        alert(`图片文件太大！${isSvg ? 'SVG' : '图片'}请小于${isSvg ? '50' : '100'}KB，或者使用图床链接（推荐）`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        if (type === 'header') {
          setHeaderImage(imageData);
          setHeaderImageUrl('');
        } else {
          setFooterImage(imageData);
          setFooterImageUrl('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-black">Logo 设置</h3>

      {/* Header Logo */}
      <div className="border border-gray-200 rounded-2xl p-8 bg-white">
        <h4 className="text-xl font-bold mb-6">页头 Logo</h4>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2">Logo 图片链接 <span className="text-indigo-600">(推荐使用图床)</span></label>
            <input
              type="url"
              value={headerImageUrl}
              onChange={(e) => {
                setHeaderImageUrl(e.target.value);
                if (e.target.value) setHeaderImage('');
              }}
              placeholder="https://example.com/logo.png"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">或上传本地图片 <span className="text-gray-500 text-xs">(支持 PNG/JPG/SVG，小于100KB)</span></label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {(headerImage || headerImageUrl) && (
                <img src={headerImageUrl || headerImage} alt="Header Logo Preview" className="w-20 h-20 mx-auto mb-4 object-contain" />
              )}
              <input
                type="file"
                accept="image/*,.svg"
                onChange={(e) => handleImageUpload('header', e)}
                className="hidden"
                id="header-logo-upload"
              />
              <label htmlFor="header-logo-upload" className="cursor-pointer">
                <span className="text-indigo-600 font-bold">点击上传</span> 或拖拽图片
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Logo 文字</label>
            <input
              type="text"
              value={headerText}
              onChange={(e) => setHeaderText(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">
              尺寸 <span className="text-gray-500 text-xs">(推荐: 40x40px)</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">宽度 (px)</label>
                <input
                  type="number"
                  value={headerWidth}
                  onChange={(e) => setHeaderWidth(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">高度 (px)</label>
                <input
                  type="number"
                  value={headerHeight}
                  onChange={(e) => setHeaderHeight(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-bold text-blue-900 mb-2">预览</h5>
            <div className="bg-white p-4 rounded border border-blue-100 flex items-center gap-3">
              {(headerImage || headerImageUrl) && (
                <img 
                  src={headerImageUrl || headerImage} 
                  alt="Logo" 
                  style={{ width: headerWidth, height: headerHeight }}
                  className="object-contain"
                />
              )}
              <span style={{ fontSize: `${Math.min(headerWidth * 0.6, 24)}px` }} className="font-black">
                {headerText}
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSaveHeader}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700"
            >
              保存页头Logo
            </button>
            <button
              onClick={() => {
                setHeaderImage('');
                setHeaderImageUrl('');
              }}
              className="px-6 bg-red-100 text-red-600 py-3 rounded-lg font-bold hover:bg-red-200"
            >
              清除图片
            </button>
          </div>
        </div>
      </div>

      {/* Footer Logo */}
      <div className="border border-gray-200 rounded-2xl p-8 bg-white">
        <h4 className="text-xl font-bold mb-6">页脚 Logo</h4>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2">Logo 图片链接 <span className="text-indigo-600">(推荐使用图床)</span></label>
            <input
              type="url"
              value={footerImageUrl}
              onChange={(e) => {
                setFooterImageUrl(e.target.value);
                if (e.target.value) setFooterImage('');
              }}
              placeholder="https://example.com/logo.png"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">或上传本地图片 <span className="text-gray-500 text-xs">(支持 PNG/JPG/SVG，小于100KB)</span></label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {(footerImage || footerImageUrl) && (
                <img src={footerImageUrl || footerImage} alt="Footer Logo Preview" className="w-20 h-20 mx-auto mb-4 object-contain" />
              )}
              <input
                type="file"
                accept="image/*,.svg"
                onChange={(e) => handleImageUpload('footer', e)}
                className="hidden"
                id="footer-logo-upload"
              />
              <label htmlFor="footer-logo-upload" className="cursor-pointer">
                <span className="text-indigo-600 font-bold">点击上传</span> 或拖拽图片
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Logo 文字</label>
            <input
              type="text"
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">
              尺寸 <span className="text-gray-500 text-xs">(推荐: 40x40px)</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">宽度 (px)</label>
                <input
                  type="number"
                  value={footerWidth}
                  onChange={(e) => setFooterWidth(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">高度 (px)</label>
                <input
                  type="number"
                  value={footerHeight}
                  onChange={(e) => setFooterHeight(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <h5 className="font-bold text-gray-300 mb-2">预览</h5>
            <div className="bg-gray-800 p-4 rounded flex items-center gap-3">
              {(footerImage || footerImageUrl) && (
                <img 
                  src={footerImageUrl || footerImage} 
                  alt="Logo" 
                  style={{ width: footerWidth, height: footerHeight }}
                  className="object-contain"
                />
              )}
              <span style={{ fontSize: `${Math.min(footerWidth * 0.6, 24)}px` }} className="font-black text-white">
                {footerText}
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSaveFooter}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700"
            >
              保存页脚Logo
            </button>
            <button
              onClick={() => {
                setFooterImage('');
                setFooterImageUrl('');
              }}
              className="px-6 bg-red-100 text-red-600 py-3 rounded-lg font-bold hover:bg-red-200"
            >
              清除图片
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoEditor;
