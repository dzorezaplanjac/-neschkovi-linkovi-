import React, { useState } from 'react';
import { ExternalLink, Edit, Trash2, Copy, Check, QrCode } from 'lucide-react';
import { Link } from '../types';
import { getDomainFromUrl, copyToClipboard, getFaviconUrl } from '../utils/linkUtils';
import { ShareButton } from './ShareButton';

interface LinkCardProps {
  link: Link;
  onEdit: (link: Link) => void;
  onDelete: (id: string) => void;
  onShowQR: (link: Link) => void;
  isDragging?: boolean;
}

export const LinkCard: React.FC<LinkCardProps> = ({ 
  link, 
  onEdit, 
  onDelete, 
  onShowQR,
  isDragging 
}) => {
  const [copied, setCopied] = useState(false);
  const [faviconError, setFaviconError] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const success = await copyToClipboard(link.url);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShowQR = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShowQR(link);
  };

  const handleLinkClick = () => {
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  const faviconUrl = getFaviconUrl(link.url);
  const domain = getDomainFromUrl(link.url);

  return (
    <div
      className={`group relative bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 
        transition-all duration-300 hover:bg-white/20 hover:border-white/30 hover:shadow-lg hover:shadow-blue-500/10
        cursor-pointer transform hover:scale-[1.02] min-h-[120px] flex flex-col ${isDragging ? 'opacity-50 scale-95' : ''}`}
      onClick={handleLinkClick}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/json', JSON.stringify({ type: 'link', id: link.id }));
      }}
    >
      {/* Top section with favicon and action buttons */}
      <div className="flex items-start justify-between mb-auto">
        {/* Favicon and QR icon in top-left */}
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
            {!faviconError ? (
              <img
                src={faviconUrl}
                alt={`${domain} favicon`}
                className="w-7 h-7 object-contain"
                onError={() => setFaviconError(true)}
                onLoad={() => setFaviconError(false)}
              />
            ) : (
              <ExternalLink className="w-5 h-5 text-blue-300" />
            )}
          </div>
          
          {/* QR Code Icon */}
          <button
            onClick={handleShowQR}
            className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 transition-colors group/qr"
            title="Прикажи QR код"
          >
            <QrCode className="w-4 h-4 text-blue-300 group-hover/qr:text-blue-200" />
          </button>
        </div>
        
        {/* Action Icons - Always visible on mobile, hover on desktop */}
        <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <ShareButton 
            url={link.url} 
            title={link.title} 
            description={link.description} 
          />
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            title="Копирај линк"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-white" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(link);
            }}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            title="Измени линк"
          >
            <Edit className="w-3.5 h-3.5 text-white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(link.id);
            }}
            className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
            title="Обриши линк"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>
      </div>

      {/* Bottom section with title in bottom-left */}
      <div className="mt-auto">
        <h3 className="text-white font-semibold text-lg leading-tight line-clamp-2">{link.title}</h3>
        {link.description && (
          <p className="text-blue-200 text-xs mt-1 line-clamp-1">{link.description}</p>
        )}
      </div>
    </div>
  );
};