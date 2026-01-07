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
  
  const [footerText, setFooterText] = useState(logoSettings.footerLogo?.text || 'TinyTech');
  const [footerWidth, setFooterWidth] = useState(logoSettings.footerLogo?.width || 40);
  const [footerHeight, setFooterHeight] = useState(logoSettings.footerLogo?.height || 40);
  const [footerImage, setFooterImage] = useState(logoSettings.footerLogo?.image || '');

  // Sync with logoSettings when props change (only for non-text fields)
  useEffect(() => {
    setHeaderWidth(logoSettings.headerLogo?.width || 40);
    setHeaderHeight(logoSettings.headerLogo?.height || 40);
    setHeaderImage(logoSettings.headerLogo?.image || '');
    setFooterWidth(logoSettings.footerLogo?.width || 40);
    setFooterHeight(logoSettings.footerLogo?.height || 40);
    setFooterImage(logoSettings.footerLogo?.image || '');
  }, [logoSettings]);

  const handleSaveHeader = () => {
    console.log('Saving header:', { headerText, headerWidth, headerHeight, headerImage });
    onUpdate({
      ...logoSettings,
      headerLogo: {
        image: headerImage,
        text: headerText,
        width: headerWidth,
        height: headerHeight
      }
    });
    alert('Header Logo settings updated successfully!');
  };

  const handleSaveFooter = () => {
    console.log('Saving footer:', { footerText, footerWidth, footerHeight, footerImage });
    onUpdate({
      ...logoSettings,
      footerLogo: {
        image: footerImage,
        text: footerText,
        width: footerWidth,
        height: footerHeight
      }
    });
    alert('Footer Logo settings updated successfully!');
  };

  const handleImageUpload = (type: 'header' | 'footer', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        if (type === 'header') {
          setHeaderImage(imageData);
        } else {
          setFooterImage(imageData);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-black">Logo Settings</h3>

      {/* Header Logo */}
      <div className="border border-gray-200 rounded-2xl p-8 bg-white">
        <h4 className="text-xl font-bold mb-6">Header Logo</h4>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2">Logo Image</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {headerImage && (
                <img src={headerImage} alt="Header Logo Preview" className="w-20 h-20 mx-auto mb-4 object-contain" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload('header', e)}
                className="hidden"
                id="header-logo-upload"
              />
              <label htmlFor="header-logo-upload" className="cursor-pointer">
                <span className="text-indigo-600 font-bold">Click to upload</span> or drag and drop
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Logo Text</label>
            <input
              type="text"
              value={headerText}
              onChange={(e) => setHeaderText(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">
              Dimensions <span className="text-gray-500 text-xs">(Recommended: 40x40px)</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Width (px)</label>
                <input
                  type="number"
                  value={headerWidth}
                  onChange={(e) => setHeaderWidth(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Height (px)</label>
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
            <h5 className="font-bold text-blue-900 mb-2">Preview</h5>
            <div className="bg-white p-4 rounded border border-blue-100 flex items-center gap-3">
              {headerImage && (
                <img 
                  src={headerImage} 
                  alt="Logo" 
                  style={{ width: headerWidth, height: headerHeight }}
                  className="object-contain"
                />
              )}
              <span style={{ fontSize: `${headerWidth * 0.6}px` }} className="font-black">
                {headerText}
              </span>
            </div>
          </div>

          <button
            onClick={handleSaveHeader}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700"
          >
            Save Header Logo
          </button>
        </div>
      </div>

      {/* Footer Logo */}
      <div className="border border-gray-200 rounded-2xl p-8 bg-white">
        <h4 className="text-xl font-bold mb-6">Footer Logo</h4>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2">Logo Image</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {footerImage && (
                <img src={footerImage} alt="Footer Logo Preview" className="w-20 h-20 mx-auto mb-4 object-contain" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload('footer', e)}
                className="hidden"
                id="footer-logo-upload"
              />
              <label htmlFor="footer-logo-upload" className="cursor-pointer">
                <span className="text-indigo-600 font-bold">Click to upload</span> or drag and drop
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Logo Text</label>
            <input
              type="text"
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">
              Dimensions <span className="text-gray-500 text-xs">(Recommended: 40x40px)</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Width (px)</label>
                <input
                  type="number"
                  value={footerWidth}
                  onChange={(e) => setFooterWidth(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Height (px)</label>
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
            <h5 className="font-bold text-gray-300 mb-2">Preview</h5>
            <div className="bg-gray-800 p-4 rounded flex items-center gap-3">
              {footerImage && (
                <img 
                  src={footerImage} 
                  alt="Logo" 
                  style={{ width: footerWidth, height: footerHeight }}
                  className="object-contain"
                />
              )}
              <span style={{ fontSize: `${footerWidth * 0.6}px` }} className="font-black text-white">
                {footerText}
              </span>
            </div>
          </div>

          <button
            onClick={handleSaveFooter}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700"
          >
            Save Footer Logo
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoEditor;
