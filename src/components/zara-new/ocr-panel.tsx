'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Tesseract from 'tesseract.js';
import {
  Scan,
  Upload,
  Camera,
  Copy,
  Check,
  Trash2,
  FileText,
  Download,
  Save,
  RefreshCw,
  Image as ImageIcon,
  X,
  AlertCircle,
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Crop,
  Settings,
  ChevronDown,
  ChevronUp,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAssistantStore } from '@/store/assistant-store';

// OCR History entry type
interface OCREntry {
  id: string;
  imageUrl: string;
  extractedText: string;
  confidence: number;
  timestamp: number;
  language: string;
}

interface OCRPanelProps {
  onBack?: () => void;
}

export function OCRPanel({ onBack }: OCRPanelProps) {
  const { addFile } = useAssistantStore();
  
  // State
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [confidence, setConfidence] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ocrHistory, setOcrHistory] = useState<OCREntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saveAsTitle, setSaveAsTitle] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('zara-ocr-history');
    if (saved) {
      try {
        setOcrHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load OCR history:', e);
      }
    }
  }, []);

  // Save history to localStorage
  const saveHistory = useCallback((entry: OCREntry) => {
    const newHistory = [entry, ...ocrHistory].slice(0, 20); // Keep last 20 entries
    setOcrHistory(newHistory);
    localStorage.setItem('zara-ocr-history', JSON.stringify(newHistory));
  }, [ocrHistory]);

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, JPEG, WEBP)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    setError(null);
    setImageName(file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageUrl(e.target?.result as string);
      setExtractedText('');
      setConfidence(null);
    };
    reader.readAsDataURL(file);
  }, []);

  // Handle camera capture
  const handleCameraCapture = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setImageName(`Camera_${Date.now()}.jpg`);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageUrl(e.target?.result as string);
      setExtractedText('');
      setConfidence(null);
    };
    reader.readAsDataURL(file);
  }, []);

  // Handle drag and drop
  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('Please drop an image file');
      return;
    }

    setError(null);
    setImageName(file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageUrl(e.target?.result as string);
      setExtractedText('');
      setConfidence(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  // Perform OCR
  const performOCR = useCallback(async () => {
    if (!imageUrl) return;

    setIsProcessing(true);
    setProgress(0);
    setProgressText('Initializing OCR engine...');
    setError(null);

    try {
      const result = await Tesseract.recognize(imageUrl, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
            setProgressText('Recognizing text...');
          } else if (m.status === 'loading language traineddata') {
            setProgress(10);
            setProgressText('Loading English language data...');
          } else if (m.status === 'initializing api') {
            setProgress(5);
            setProgressText('Initializing OCR engine...');
          }
        },
      });

      const text = result.data.text.trim();
      const conf = result.data.confidence;

      if (!text) {
        setError('No text could be extracted from this image. Try a clearer image with more contrast.');
        setExtractedText('');
        setConfidence(null);
      } else {
        setExtractedText(text);
        setConfidence(conf);
        
        // Save to history
        const entry: OCREntry = {
          id: Date.now().toString(),
          imageUrl,
          extractedText: text,
          confidence: conf,
          timestamp: Date.now(),
          language: 'eng',
        };
        saveHistory(entry);
      }
    } catch (err) {
      console.error('OCR Error:', err);
      setError('Failed to process image. Please try again with a different image.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setProgressText('');
    }
  }, [imageUrl, saveHistory]);

  // Copy to clipboard
  const copyToClipboard = useCallback(() => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [extractedText]);

  // Save as file
  const saveAsFile = useCallback(() => {
    if (!extractedText) return;
    setSaveAsTitle(imageName.replace(/\.[^/.]+$/, '') || 'OCR_Result');
    setShowSaveDialog(true);
  }, [extractedText, imageName]);

  const confirmSaveFile = useCallback(() => {
    if (!extractedText || !saveAsTitle.trim()) return;

    addFile({
      title: saveAsTitle.trim(),
      content: extractedText,
      type: 'document',
      tags: ['ocr', 'extracted'],
    });

    setShowSaveDialog(false);
    setSaveAsTitle('');
  }, [extractedText, saveAsTitle, addFile]);

  // Download as text file
  const downloadAsText = useCallback(() => {
    if (!extractedText) return;
    
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${imageName.replace(/\.[^/.]+$/, '') || 'OCR_Result'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [extractedText, imageName]);

  // Clear everything
  const handleClear = useCallback(() => {
    setImageUrl(null);
    setImageName('');
    setExtractedText('');
    setConfidence(null);
    setError(null);
    setZoom(1);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  }, []);

  // Load from history
  const loadFromHistory = useCallback((entry: OCREntry) => {
    setImageUrl(entry.imageUrl);
    setExtractedText(entry.extractedText);
    setConfidence(entry.confidence);
    setImageName(`History_${new Date(entry.timestamp).toLocaleDateString()}`);
    setShowHistory(false);
  }, []);

  // Delete history entry
  const deleteHistoryEntry = useCallback((id: string) => {
    const newHistory = ocrHistory.filter(h => h.id !== id);
    setOcrHistory(newHistory);
    localStorage.setItem('zara-ocr-history', JSON.stringify(newHistory));
  }, [ocrHistory]);

  // Clear all history
  const clearHistory = useCallback(() => {
    setOcrHistory([]);
    localStorage.removeItem('zara-ocr-history');
  }, []);

  // Zoom controls
  const handleZoomIn = useCallback(() => setZoom(z => Math.min(z + 0.25, 3)), []);
  const handleZoomOut = useCallback(() => setZoom(z => Math.max(z - 0.25, 0.5)), []);
  const handleZoomReset = useCallback(() => setZoom(1), []);

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
          <Scan className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="font-semibold text-white">OCR Scanner</h1>
          <p className="text-xs text-white/40">Extract text from images</p>
        </div>
        {ocrHistory.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className={cn("text-white/60 hover:text-white", showHistory && "bg-white/10 text-white")}
          >
            <Clock className="w-4 h-4 mr-1" />
            History ({ocrHistory.length})
          </Button>
        )}
      </div>

      {/* History Panel */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-white/10 overflow-hidden"
          >
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/40">Recent scans</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="text-red-400/70 hover:text-red-400 text-xs h-6"
                >
                  Clear All
                </Button>
              </div>
              <ScrollArea className="max-h-40">
                <div className="space-y-1">
                  {ocrHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 group"
                    >
                      <img
                        src={entry.imageUrl}
                        alt=""
                        className="w-8 h-8 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white truncate">
                          {entry.extractedText.slice(0, 40)}...
                        </p>
                        <p className="text-[10px] text-white/30">
                          {new Date(entry.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => loadFromHistory(entry)}
                        className="opacity-0 group-hover:opacity-100 h-6 text-xs"
                      >
                        Load
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteHistoryEntry(entry.id)}
                        className="opacity-0 group-hover:opacity-100 h-6 text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Upload Area */}
          {!imageUrl ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center hover:border-white/40 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-white/40" />
              </div>
              <p className="text-white/60 mb-2">Drag and drop an image here</p>
              <p className="text-xs text-white/30 mb-4">or use the buttons below</p>
              
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white text-black hover:bg-white/90"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
                <Button
                  variant="outline"
                  onClick={() => cameraInputRef.current?.click()}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCameraCapture}
                className="hidden"
              />

              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                <Badge className="bg-white/5 text-white/40">PNG</Badge>
                <Badge className="bg-white/5 text-white/40">JPG</Badge>
                <Badge className="bg-white/5 text-white/40">JPEG</Badge>
                <Badge className="bg-white/5 text-white/40">WEBP</Badge>
                <Badge className="bg-white/5 text-white/40">Max 10MB</Badge>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Image Preview */}
              <div className="rounded-xl border border-white/10 overflow-hidden bg-white/5">
                <div className="flex items-center justify-between p-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-white/40" />
                    <span className="text-xs text-white/60 truncate max-w-[200px]">{imageName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleZoomOut}
                      disabled={zoom <= 0.5}
                      className="h-7 w-7 text-white/40 hover:text-white"
                    >
                      <ZoomOut className="w-3 h-3" />
                    </Button>
                    <span className="text-xs text-white/40 w-12 text-center">{Math.round(zoom * 100)}%</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleZoomIn}
                      disabled={zoom >= 3}
                      className="h-7 w-7 text-white/40 hover:text-white"
                    >
                      <ZoomIn className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleZoomReset}
                      className="h-7 w-7 text-white/40 hover:text-white"
                    >
                      <RotateCw className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="p-2 overflow-auto max-h-64 flex items-center justify-center bg-[#0a0a0a]">
                  <img
                    src={imageUrl}
                    alt="Uploaded for OCR"
                    style={{ transform: `scale(${zoom})` }}
                    className="max-w-full h-auto transition-transform"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {!extractedText && !isProcessing && (
                  <Button
                    onClick={performOCR}
                    className="bg-white text-black hover:bg-white/90"
                  >
                    <Scan className="w-4 h-4 mr-2" />
                    Extract Text
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Change Image
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleClear}
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </motion.div>
          )}

          {/* Processing Indicator */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-xl border border-white/10 bg-white/5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                  <span className="text-sm text-white">{progressText}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-white/40 mt-2 text-center">{progress}%</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-xl border border-red-500/30 bg-red-500/10"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Extracted Text */}
          <AnimatePresence>
            {extractedText && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                {/* Confidence Badge */}
                {confidence !== null && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/40">Confidence:</span>
                    <Badge
                      className={cn(
                        confidence >= 80 ? "bg-green-500/20 text-green-400" :
                        confidence >= 60 ? "bg-amber-500/20 text-amber-400" :
                        "bg-red-500/20 text-red-400"
                      )}
                    >
                      {confidence.toFixed(1)}%
                    </Badge>
                  </div>
                )}

                {/* Text Content */}
                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/40">Extracted Text</span>
                    <span className="text-xs text-white/30">{extractedText.length} characters</span>
                  </div>
                  <ScrollArea className="max-h-64">
                    <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">
                      {extractedText}
                    </p>
                  </ScrollArea>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? 'Copied!' : 'Copy Text'}
                  </Button>
                  <Button
                    onClick={saveAsFile}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save to Files
                  </Button>
                  <Button
                    onClick={downloadAsText}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download .txt
                  </Button>
                  <Button
                    onClick={performOCR}
                    variant="ghost"
                    className="text-white/60 hover:text-white"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Re-scan
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Save Dialog */}
          <AnimatePresence>
            {showSaveDialog && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                onClick={() => setShowSaveDialog(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-black border border-white/10 rounded-2xl p-4 w-full max-w-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="font-medium text-white mb-3">Save to Files</h3>
                  <Input
                    value={saveAsTitle}
                    onChange={(e) => setSaveAsTitle(e.target.value)}
                    placeholder="File title..."
                    className="bg-white/5 border-white/10 text-white mb-3"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => setShowSaveDialog(false)}
                      className="text-white/60 hover:text-white"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={confirmSaveFile}
                      disabled={!saveAsTitle.trim()}
                      className="bg-white text-black hover:bg-white/90"
                    >
                      Save
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tips Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-xs text-white/40 hover:text-white/60 transition-colors"
            >
              {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              Tips for better results
            </button>
            
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 p-3 rounded-xl bg-white/5 text-xs text-white/50 space-y-2">
                    <p>• Use clear, high-contrast images</p>
                    <p>• Ensure text is well-lit and not blurry</p>
                    <p>• Horizontal text works best</p>
                    <p>• Dark text on light background gives better results</p>
                    <p>• Crop unnecessary parts of the image</p>
                    <p>• Supported: English text only</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </ScrollArea>
    </div>
  );
}

export default OCRPanel;
