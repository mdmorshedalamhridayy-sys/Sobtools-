import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { QrCode, Download, Link, Wifi, Type, Mail, Sliders } from 'lucide-react';
import { downloadDataUrl } from '../../utils/fileHelpers';
import { useLanguage } from '../../context/LanguageContext';

export const QrCodeGenerator: React.FC = () => {
  const { language, t } = useLanguage();
  const [type, setType] = useState<'url' | 'text' | 'wifi' | 'email'>('url');
  
  // Inputs
  const [urlInput, setUrlInput] = useState<string>('https://sobtools.com');
  const [textInput, setTextInput] = useState<string>('Welcome to SobTools');
  const [wifiSsid, setWifiSsid] = useState<string>('');
  const [wifiPass, setWifiPass] = useState<string>('');
  const [wifiType, setWifiType] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [emailTo, setEmailTo] = useState<string>('');

  // Styles
  const [fgColor, setFgColor] = useState<string>('#000000');
  const [bgColor, setBgColor] = useState<string>('#FFFFFF');
  const [qrSize, setQrSize] = useState<number>(300);

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Compute payload string
  let payload = '';
  if (type === 'url') payload = urlInput.trim();
  else if (type === 'text') payload = textInput.trim();
  else if (type === 'wifi') {
    payload = `WIFI:S:${wifiSsid};T:${wifiType};P:${wifiPass};;`;
  } else if (type === 'email') {
    payload = `mailto:${emailTo}`;
  }

  useEffect(() => {
    if (!payload) {
      setQrDataUrl('');
      return;
    }

    QRCode.toDataURL(
      payload,
      {
        width: qrSize,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, [payload, fgColor, bgColor, qrSize]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    downloadDataUrl(qrDataUrl, `sobtools-qrcode.png`);
  };

  return (
    <div className="space-y-6">
      {/* Type Selector Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-xl bg-slate-950/60 border border-slate-800">
        <button
          type="button"
          onClick={() => setType('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            type === 'url' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Link className="w-3.5 h-3.5" />
          URL / Website
        </button>

        <button
          type="button"
          onClick={() => setType('text')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            type === 'text' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          Text / Note
        </button>

        <button
          type="button"
          onClick={() => setType('wifi')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            type === 'wifi' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Wifi className="w-3.5 h-3.5" />
          WiFi Network
        </button>

        <button
          type="button"
          onClick={() => setType('email')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            type === 'email' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          Email
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Input Details */}
        <div className="space-y-4 p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
          {type === 'url' && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {language === 'bn' ? 'ওয়েবসাইট লিংক (URL):' : 'Website URL:'}
              </label>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          )}

          {type === 'text' && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {language === 'bn' ? 'টেক্সট বার্তা:' : 'Plain Text:'}
              </label>
              <textarea
                rows={4}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter text..."
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {type === 'wifi' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {language === 'bn' ? 'নেটওয়ার্কের নাম (SSID):' : 'Network Name (SSID):'}
                </label>
                <input
                  type="text"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  placeholder="MyHomeWiFi"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {language === 'bn' ? 'পাসওয়ার্ড (Password):' : 'Password:'}
                </label>
                <input
                  type="text"
                  value={wifiPass}
                  onChange={(e) => setWifiPass(e.target.value)}
                  placeholder="WiFi password"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {language === 'bn' ? 'সিকিউরিটি ধরন:' : 'Security:'}
                </label>
                <select
                  value={wifiType}
                  onChange={(e) => setWifiType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100"
                >
                  <option value="WPA">WPA / WPA2 (Standard)</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">No Password (Open)</option>
                </select>
              </div>
            </div>
          )}

          {type === 'email' && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {language === 'bn' ? 'ইমেইল অ্যাড্রেস:' : 'Email Address:'}
              </label>
              <input
                type="email"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                placeholder="contact@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          )}

          {/* Color & Size Controls */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <span className="text-xs font-semibold text-slate-400 block flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              {language === 'bn' ? 'রং ও মাপ কাস্টমাইজেশন:' : 'Color & Size Customization:'}
            </span>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Foreground Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <span className="font-mono text-slate-300">{fgColor}</span>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <span className="font-mono text-slate-300">{bgColor}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Preview & Download */}
        <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 text-center flex flex-col items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-300 block mb-3">
              {language === 'bn' ? 'তৈরিকৃত কিউআর কোড (Live Scannable QR):' : 'Live Scannable QR Code:'}
            </span>
            <div className="p-4 bg-white rounded-2xl shadow-xl inline-block border border-slate-200">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Generated QR code" className="w-48 h-48 object-contain" />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
                  Enter data...
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownload}
            disabled={!qrDataUrl}
            className="mt-6 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
          >
            <Download className="w-4 h-4" />
            {language === 'bn' ? 'কিউআর কোড ডাউনলোড (PNG)' : 'Download QR Code (PNG)'}
          </button>
        </div>
      </div>
    </div>
  );
};
