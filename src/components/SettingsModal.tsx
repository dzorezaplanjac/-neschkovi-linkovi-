import React, { useState } from 'react';
import { Settings, X } from 'lucide-react';
import { Modal } from './Modal';
import { DataManager } from './DataManager';
import { Link, Group } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  links: Link[];
  groups: Group[];
  onImportData: (links: Link[], groups: Group[]) => void;
  onClearData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  links,
  groups,
  onImportData,
  onClearData,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Подешавања">
      <div className="space-y-6">
        <DataManager
          links={links}
          groups={groups}
          onImportData={onImportData}
          onClearData={onClearData}
        />
        
        {/* Instructions */}
        <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">Како сачувати апликацију:</h4>
          <ul className="text-blue-200 text-sm space-y-1">
            <li>• Извезите податке редовно као резервну копију</li>
            <li>• Инсталирајте као PWA за рад без интернета</li>
            <li>• Подаци се чувају локalno у прегледачу</li>
            <li>• Увезите податке да вратите резервну копију</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};