import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, X } from 'lucide-react';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (isbn: string) => void;
}

const BarcodeScanner = ({ isOpen, onClose, onScan }: BarcodeScannerProps) => {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Wait for a short moment to ensure the video element is rendered
    let initTimeout: NodeJS.Timeout;
    
    if (isOpen) {
      setIsScanning(true);
      initTimeout = setTimeout(() => {
        initializeCamera();
      }, 100);
    }
    
    return () => {
      clearTimeout(initTimeout);
      stopCamera();
    };
  }, [isOpen]);

  const initializeCamera = async () => {
    try {
      console.log('Initializing camera...');
      setError(null);

      // Stop any existing streams
      stopCamera();

      // Create video element if it doesn't exist
      if (!videoRef.current) {
        console.error('Video element not found');
        setError('Camera initialization failed');
        return;
      }

      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      
      console.log('Camera access granted, setting up video stream...');
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      
      // Play the video
      try {
        console.log('Playing video...');
        await videoRef.current.play();
        console.log('Video playing successfully');
        
        // Initialize barcode reader after video is playing
        await initializeBarcodeReader();
      } catch (playError) {
        console.error('Error playing video:', playError);
        setError('Failed to start video stream');
        throw playError;
      }
    } catch (err) {
      console.error('Camera initialization error:', err);
      setError(t('admin.scanner.error'));
      setIsScanning(false);
      stopCamera();
    }
  };

  const initializeBarcodeReader = async () => {
    try {
      if (!videoRef.current) return;

      console.log('Initializing barcode reader...');
      if (!codeReader.current) {
        codeReader.current = new BrowserMultiFormatReader();
      }

      const controls = await codeReader.current.decodeFromVideoElement(videoRef.current, (result, error) => {
        if (result) {
          const isbn = result.getText();
          console.log('Barcode detected:', isbn);
          if (isbn && /^[0-9-]{10,17}$/.test(isbn)) {
            // Stop scanning immediately after a valid barcode is found
            controls.stop();
            onScan(isbn.replace(/-/g, ''));
            handleClose();
          }
        }
        if (error && !error.message.includes('No MultiFormat Readers were able to detect the code')) {
          console.error('Barcode reading error:', error);
        }
      });
      console.log('Barcode reader initialized successfully');
    } catch (err) {
      console.error('Barcode reader initialization error:', err);
      setError(t('admin.scanner.error'));
    }
  };

  const stopCamera = () => {
    console.log('Stopping camera...');
    if (codeReader.current) {
      try {
        codeReader.current = null;
      } catch (err) {
        console.error('Error resetting code reader:', err);
      }
    }

    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          console.log('Track stopped:', track.kind);
        });
        streamRef.current = null;
      } catch (err) {
        console.error('Error stopping stream:', err);
      }
    }

    if (videoRef.current) {
      try {
        videoRef.current.srcObject = null;
      } catch (err) {
        console.error('Error clearing video source:', err);
      }
    }

    setIsScanning(false);
    setError(null);
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const handleRetry = () => {
    initializeCamera();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogTitle>{t('admin.scanner.title')}</DialogTitle>
        <DialogDescription>{t('admin.scanner.description')}</DialogDescription>
        
        <div className="space-y-4">
          {error ? (
            <div className="space-y-4">
              <p className="text-red-500">{error}</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleClose}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleRetry}>
                  {t('admin.scanner.tryAgain')}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                {isScanning && (
                  <>
                    <div className="absolute top-4 right-4 z-10">
                      <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={handleClose}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <Loader2 className="h-8 w-8 animate-spin text-white opacity-50" />
                    </div>
                  </>
                )}
              </div>
              <p className="text-center text-sm text-gray-500">
                {t('admin.scanner.instructions')}
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BarcodeScanner;
