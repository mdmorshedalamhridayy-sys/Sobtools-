import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { toolsRegistry } from '../config/toolsRegistry';
import { ToolLayout } from '../components/ToolLayout';

// Image Tools
import { ImageCompressor } from '../tools/image/ImageCompressor';
import { ImageResizer } from '../tools/image/ImageResizer';
import { ImageCropper } from '../tools/image/ImageCropper';
import { ImageConverter } from '../tools/image/ImageConverter';
import { ImageToBase64 } from '../tools/image/ImageToBase64';
import { Base64ToImage } from '../tools/image/Base64ToImage';
import { ImageColorPicker } from '../tools/image/ImageColorPicker';
import { ImageMetadataViewer } from '../tools/image/ImageMetadataViewer';
import { PassportPhotoMaker } from '../tools/image/PassportPhotoMaker';
import { BackgroundRemover } from '../tools/image/BackgroundRemover';

// PDF Tools
import { PdfMerge } from '../tools/pdf/PdfMerge';
import { PdfSplit } from '../tools/pdf/PdfSplit';
import { PdfToJpg } from '../tools/pdf/PdfToJpg';
import { JpgToPdf } from '../tools/pdf/JpgToPdf';
import { PdfReorder } from '../tools/pdf/PdfReorder';
import { PdfRotate } from '../tools/pdf/PdfRotate';
import { PdfInfo } from '../tools/pdf/PdfInfo';
import { PdfCompress } from '../tools/pdf/PdfCompress';

// Text Tools
import { WordCounter } from '../tools/text/WordCounter';
import { CharacterCounter } from '../tools/text/CharacterCounter';
import { CaseConverter } from '../tools/text/CaseConverter';
import { TextFormatter } from '../tools/text/TextFormatter';
import { DuplicateLineRemover } from '../tools/text/DuplicateLineRemover';
import { BengaliCaptionGenerator } from '../tools/text/BengaliCaptionGenerator';
import { BengaliHashtagGenerator } from '../tools/text/BengaliHashtagGenerator';
import { ParagraphRewriter } from '../tools/text/ParagraphRewriter';
import { TextDiffChecker } from '../tools/text/TextDiffChecker';

// Creator & Dev Tools
import { YoutubeThumbnailViewer } from '../tools/creator/YoutubeThumbnailViewer';
import { YoutubeTitleGenerator } from '../tools/creator/YoutubeTitleGenerator';
import { YoutubeDescriptionGenerator } from '../tools/creator/YoutubeDescriptionGenerator';
import { JsonFormatter } from '../tools/creator/JsonFormatter';
import { UrlEncoderDecoder } from '../tools/creator/UrlEncoderDecoder';
import { UuidGenerator } from '../tools/creator/UuidGenerator';
import { QrCodeGenerator } from '../tools/creator/QrCodeGenerator';
import { PasswordGenerator } from '../tools/creator/PasswordGenerator';
import { UnitConverter } from '../tools/creator/UnitConverter';
import { StockMetadataGenerator } from '../tools/creator/StockMetadataGenerator';
import { StockPlatformChecker } from '../tools/creator/StockPlatformChecker';
import { StockKeywordSuggester } from '../tools/creator/StockKeywordSuggester';

import { fetchAllTools } from '../services/cmsService';
import { ToolDefinition } from '../types';
import { AlertTriangle, ArrowLeft, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ToolPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [dynamicTool, setDynamicTool] = React.useState<ToolDefinition | null>(null);

  const staticTool = toolsRegistry.find((t) => t.slug === slug);

  React.useEffect(() => {
    fetchAllTools().then((list) => {
      const match = list.find((t) => t.slug === slug);
      if (match) setDynamicTool(match);
    }).catch(() => {});
  }, [slug]);

  const tool = dynamicTool || staticTool;

  if (!tool) {
    return <Navigate to="/404" replace />;
  }

  if (tool.status === 'disabled') {
    return <Navigate to="/tools" replace />;
  }

  if (tool.status === 'maintenance') {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-slate-900 border border-amber-800/60 text-center shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Tool Under Maintenance</h2>
        <p className="text-xs text-amber-200/80 mb-6 leading-relaxed">
          {tool.maintenanceMessage?.en || 'This tool is temporarily undergoing scheduled maintenance. Please check back shortly.'}
        </p>
        <Link
          to="/tools"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Tools Catalog
        </Link>
      </div>
    );
  }

  const renderToolComponent = () => {
    switch (tool.id) {
      // Image Tools
      case 'image-compressor':
        return <ImageCompressor />;
      case 'image-resizer':
        return <ImageResizer />;
      case 'image-cropper':
        return <ImageCropper />;
      case 'image-converter':
        return <ImageConverter />;
      case 'image-to-base64':
        return <ImageToBase64 />;
      case 'base64-to-image':
        return <Base64ToImage />;
      case 'image-color-picker':
        return <ImageColorPicker />;
      case 'image-metadata-viewer':
        return <ImageMetadataViewer />;
      case 'passport-photo-maker':
        return <PassportPhotoMaker />;
      case 'background-remover':
        return <BackgroundRemover />;

      // PDF Tools
      case 'pdf-merge':
        return <PdfMerge />;
      case 'pdf-split':
        return <PdfSplit />;
      case 'pdf-to-jpg':
        return <PdfToJpg />;
      case 'jpg-to-pdf':
        return <JpgToPdf />;
      case 'pdf-reorder':
        return <PdfReorder />;
      case 'pdf-rotate':
        return <PdfRotate />;
      case 'pdf-info':
        return <PdfInfo />;
      case 'pdf-compress':
        return <PdfCompress />;

      // Text Tools
      case 'word-counter':
        return <WordCounter />;
      case 'character-counter':
        return <CharacterCounter />;
      case 'case-converter':
        return <CaseConverter />;
      case 'text-formatter':
        return <TextFormatter />;
      case 'duplicate-line-remover':
        return <DuplicateLineRemover />;
      case 'bengali-caption-generator':
        return <BengaliCaptionGenerator />;
      case 'bengali-hashtag-generator':
        return <BengaliHashtagGenerator />;
      case 'paragraph-rewriter':
        return <ParagraphRewriter />;
      case 'text-diff-checker':
        return <TextDiffChecker />;

      // Creator & Dev Tools
      case 'youtube-thumbnail-viewer':
        return <YoutubeThumbnailViewer />;
      case 'youtube-title-generator':
        return <YoutubeTitleGenerator />;
      case 'youtube-description-generator':
        return <YoutubeDescriptionGenerator />;
      case 'json-formatter':
        return <JsonFormatter />;
      case 'url-encoder-decoder':
        return <UrlEncoderDecoder />;
      case 'uuid-generator':
        return <UuidGenerator />;
      case 'qr-code-generator':
        return <QrCodeGenerator />;
      case 'password-generator':
        return <PasswordGenerator />;
      case 'unit-converter':
        return <UnitConverter />;
      case 'stock-metadata-generator':
        return <StockMetadataGenerator />;
      case 'stock-platform-checker':
        return <StockPlatformChecker />;
      case 'stock-keyword-suggester':
        return <StockKeywordSuggester />;

      default:
        if (tool.toolType === 'iframe' && tool.embedUrl) {
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400 truncate">Embedded Interactive Tool: {tool.embedUrl}</span>
                <a
                  href={tool.embedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-1 font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open in New Window
                </a>
              </div>
              <div className="w-full h-[650px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
                <iframe
                  src={tool.embedUrl}
                  title={tool.name.en}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  loading="lazy"
                />
              </div>
            </div>
          );
        }

        if (tool.toolType === 'external' && tool.embedUrl) {
          return (
            <div className="p-8 sm:p-12 text-center bg-slate-900/60 rounded-3xl border border-slate-800 space-y-5 max-w-xl mx-auto shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
                <ExternalLink className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{tool.name.en}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {tool.description.en}
                </p>
              </div>
              <a
                href={tool.embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
              >
                Launch Tool on External Site
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          );
        }

        if (tool.toolType === 'custom_code' && tool.customHtml) {
          return (
            <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800">
              <div
                dangerouslySetInnerHTML={{ __html: tool.customHtml }}
                className="prose prose-invert max-w-none"
              />
            </div>
          );
        }

        return (
          <div className="p-12 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400">
            <p className="text-sm font-medium">This tool is currently undergoing preparation.</p>
            <p className="text-xs text-slate-500 mt-1">Check back shortly or browse other tools in this category.</p>
          </div>
        );
    }
  };

  return <ToolLayout tool={tool}>{renderToolComponent()}</ToolLayout>;
};
