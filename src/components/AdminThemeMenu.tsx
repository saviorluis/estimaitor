'use client';

import React, { useState, useEffect } from 'react';
import { themes, loadTheme, saveTheme, applyTheme, type Theme } from '@/lib/themes';

interface AdminThemeMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminThemeMenu: React.FC<AdminThemeMenuProps> = ({ isOpen, onClose }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(loadTheme());
  const [previewTheme, setPreviewTheme] = useState<Theme | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentTheme(loadTheme());
    }
  }, [isOpen]);

  const handleThemePreview = (theme: Theme) => {
    setPreviewTheme(theme);
    applyTheme(theme);
  };

  const handleThemeSelect = (theme: Theme) => {
    setCurrentTheme(theme);
    setPreviewTheme(null);
    saveTheme(theme.id);
    applyTheme(theme);
  };

  const handleCancel = () => {
    if (previewTheme) {
      // Restore current theme
      applyTheme(currentTheme);
      setPreviewTheme(null);
    }
    onClose();
  };

  const handleClose = () => {
    if (previewTheme) {
      // Apply the previewed theme permanently
      handleThemeSelect(previewTheme);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Theme Settings</h2>
              <p className="text-gray-600 mt-1">Choose a theme for the calculator and quote generation</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Apply Theme
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.values(themes).map((theme) => (
              <div
                key={theme.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg ${
                  currentTheme.id === theme.id
                    ? 'border-blue-500 bg-blue-50'
                    : previewTheme?.id === theme.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleThemeSelect(theme)}
                onMouseEnter={() => handleThemePreview(theme)}
                onMouseLeave={() => {
                  if (previewTheme?.id === theme.id) {
                    applyTheme(currentTheme);
                    setPreviewTheme(null);
                  }
                }}
              >
                <div className="mb-3">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">{theme.name}</h3>
                  <p className="text-sm text-gray-600">{theme.description}</p>
                </div>

                {/* Color Palette Preview */}
                <div className="mb-4">
                  <div className="flex gap-1 mb-2">
                    <div
                      className="w-6 h-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: theme.colors.primary }}
                      title="Primary"
                    />
                    <div
                      className="w-6 h-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: theme.colors.accent }}
                      title="Accent"
                    />
                    <div
                      className="w-6 h-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: theme.colors.surface }}
                      title="Surface"
                    />
                    <div
                      className="w-6 h-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: theme.colors.success }}
                      title="Success"
                    />
                  </div>
                  <div className="text-xs text-gray-500">Color Palette</div>
                </div>

                {/* Mini Preview */}
                <div
                  className="border rounded p-3 mb-3"
                  style={{
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                  }}
                >
                  <div
                    className="text-sm font-medium mb-2"
                    style={{ color: theme.colors.text }}
                  >
                    Calculator Preview
                  </div>
                  <div
                    className="text-xs mb-2"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    Square Footage: 2,500 sq ft
                  </div>
                  <div
                    className="text-xs px-2 py-1 rounded text-white text-center"
                    style={{
                      backgroundColor: theme.colors.primary,
                      borderRadius: theme.spacing.borderRadius,
                    }}
                  >
                    Calculate
                  </div>
                </div>

                {/* Typography & Spacing Info */}
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Font: {theme.fonts.primary.split(',')[0]}</div>
                  <div>Spacing: {theme.spacing.compact ? 'Compact' : 'Standard'}</div>
                  <div>Style: {theme.spacing.borderRadius}</div>
                </div>

                {/* Status Indicator */}
                {currentTheme.id === theme.id && (
                  <div className="mt-3 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Current Theme
                    </span>
                  </div>
                )}
                {previewTheme?.id === theme.id && (
                  <div className="mt-3 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Previewing
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Theme Details */}
          <div className="mt-8 bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Theme Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-800 mb-1">Calculator Interface</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Custom color scheme applied to all components</li>
                  <li>• Typography and spacing adjustments</li>
                  <li>• Button and form styling</li>
                  <li>• Real-time theme preview</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-1">PDF Quote Output</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Themed headers and accent colors</li>
                  <li>• Consistent branding throughout</li>
                  <li>• Table styling and backgrounds</li>
                  <li>• Professional appearance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminThemeMenu;