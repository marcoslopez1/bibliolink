
import React, { useEffect, useRef } from 'react';
import { BrowserMultiFormatReader, Result } from '@zxing/library';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Camera } from 'lucide-react';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (isbn: string) => void;
}

const BarcodeScanner = ({ isOpen, onClose, onScan }: BarcodeScannerProps) => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isScanning, setIsScanning] = React.useState(false);

  useEffect(() => {
    if (isOpen && !readerRef.current) {
      startScanner();
    }
    return () => {
      if (readerRef.current) {
        readerRef.current.reset();
        readerRef.current = null;
      }
    };
  }, [isOpen]);

  const startScanner = async () => {
    try {
      setError(null);
      setIsScanning(true);
      readerRef.current = new BrowserMultiFormatReader();
      
      if (videoRef.current) {
        await readerRef.current.decodeFromConstraints(
          {
            audio: false,
            video: { facingMode: 'environment' }
          },
          videoRef.current,
          (result: Result | null, error: Error | undefined) => {
            if (result) {
              const isbn = result.getText();
              if (isbn && /^[0-9-]{10,17}$/.test(isbn)) {
                onScan(isbn.replace(/-/g, ''));
                if (readerRef.current) {
                  readerRef.current.reset();
                }
              }
            }
            if (error) {
              console.error("Scanning error:", error);
            }
          }
        );
      }
    } catch (err: any) {
      console.error("Scanner error:", err);
      setError(err.message || t("admin.scanner.error"));
      setIsScanning(false);
    }
  };

  const handleClose = () => {
    if (readerRef.current) {
      readerRef.current.reset();
      readerRef.current = null;
    }
    setError(null);
    setIsScanning(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <div className="space-y-4">
          {error ? (
            <div className="space-y-4">
              <p className="text-red-500">{error}</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleClose}>
                  {t("common.cancel")}
                </Button>
                <Button onClick={startScanner}>
                  {t("admin.scanner.tryAgain")}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-center text-sm text-gray-500">
                {t("admin.scanner.instructions")}
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BarcodeScanner;
