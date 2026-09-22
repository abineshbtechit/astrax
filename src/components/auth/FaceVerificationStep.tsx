import React, { useState, useEffect, useRef } from 'react';
import { Camera, CheckCircle2, ShieldAlert, Scan, RefreshCw, Sparkles, UserCheck } from 'lucide-react';
import { User } from '../../types';
import { computeFaceImageHash, compareFacialFeatures } from '../../utils/crypto';

interface FaceVerificationStepProps {
  user: User;
  onSuccess: (updatedFaceData?: { faceDataUrl: string; faceHash: string }) => void;
  onCancel: () => void;
}

export const FaceVerificationStep: React.FC<FaceVerificationStepProps> = ({
  user,
  onSuccess,
  onCancel,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    isMatch: boolean;
    confidenceScore: number;
    message: string;
  } | null>(null);

  const isFirstTimeEnrollment = !user.faceBiometricData && !user.isFaceEnrolled;

  // Initialize webcam stream
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    async function startCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const s = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          });
          activeStream = s;
          setStream(s);
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        } else {
          setCameraError('Webcam API unavailable in this browser context.');
        }
      } catch (err: any) {
        console.warn('Webcam access error:', err);
        setCameraError('Webcam access denied or unavailable. A real live camera feed is strictly required for facial biometric authentication.');
      }
    }

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Handle capture & verification
  const handleStartScan = async () => {
    setIsScanning(true);
    setScanProgress(0);
    setVerificationResult(null);

    // Progress bar animation
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 20;
      });
    }, 200);

    setTimeout(async () => {
      // Capture frame directly from active video element
      let imageDataUrl = '';
      let hasLiveWebcamFrame = false;

      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            imageDataUrl = canvas.toDataURL('image/jpeg', 0.85);
            hasLiveWebcamFrame = true;
          }
        }
      }

      setCapturedImage(imageDataUrl);
      setIsScanning(false);

      if (!hasLiveWebcamFrame || !imageDataUrl) {
        setVerificationResult({
          isMatch: false,
          confidenceScore: 0,
          message: 'Real webcam feed required. No live camera frame detected.',
        });
        return;
      }

      const result = await compareFacialFeatures(imageDataUrl, user.faceBiometricData);
      const faceHash = await computeFaceImageHash(imageDataUrl);

      setVerificationResult(result);

      if (result.isMatch) {
        setTimeout(() => {
          onSuccess({
            faceDataUrl: imageDataUrl,
            faceHash,
          });
        }, 1200);
      }
    }, 1200);
  };

  return (
    <div className="space-y-5 font-mono">
      {/* Title Banner */}
      <div className="text-center space-y-1">
        <div className="w-10 h-10 rounded-2xl bg-black text-[#64EE00] border-2 border-black flex items-center justify-center mx-auto shadow-[2px_2px_0px_#000000]">
          <Scan className="w-5 h-5 stroke-[2.5]" />
        </div>
        <h3 className="text-sm font-black text-black uppercase tracking-tight">
          {isFirstTimeEnrollment ? 'STEP 3: FIRST-TIME FACIAL ENROLLMENT' : 'STEP 3: MANDATORY FACE VERIFICATION'}
        </h3>
        <p className="text-xs text-black/70 font-bold">
          {isFirstTimeEnrollment
            ? 'Capture your official officer biometric profile for future login verifications'
            : `Verifying live camera feed against stored facial profile for ${user.fullName}`}
        </p>
      </div>

      {/* Hidden Canvas for Frame Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Scanner Container */}
      <div className="p-4 rounded-2xl bg-white border-2 border-black shadow-[4px_4px_0px_#000000] relative overflow-hidden space-y-3">
        {/* Camera Error Alert */}
        {cameraError && (
          <div className="p-2.5 rounded-xl bg-red-100 text-red-900 border-2 border-black text-[11px] font-bold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{cameraError}</span>
          </div>
        )}

        {/* Live Camera View Box */}
        <div className="relative w-full h-64 bg-black rounded-xl border-2 border-black overflow-hidden flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100"
          />

          {/* Scanning Reticle & Overlay */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
            {/* Oval Face Positioning Guide */}
            <div
              className={`w-40 h-52 rounded-[50%] border-4 transition-all duration-300 relative flex items-center justify-center ${
                verificationResult?.isMatch
                  ? 'border-[#64EE00] shadow-[0_0_20px_#64EE00]'
                  : isScanning
                  ? 'border-[#64EE00] animate-pulse'
                  : 'border-white/80 border-dashed'
              }`}
            >
              {/* Animated Scan Line */}
              {isScanning && (
                <div className="absolute w-full h-1 bg-[#64EE00] shadow-[0_0_10px_#64EE00] animate-bounce" />
              )}
            </div>

            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[#64EE00] border border-[#64EE00] text-[10px] font-mono font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#64EE00] animate-ping" />
              <span>LIVE SENSOR FEED</span>
            </div>

            {/* Officer Name Tag Overlay */}
            <div className="absolute bottom-2 bg-black/80 text-white px-3 py-1 rounded-lg border border-black font-mono text-xs font-bold">
              Officer: {user.fullName} [{user.badgeNumber}]
            </div>
          </div>
        </div>

        {/* Verification / Match Results Card */}
        {verificationResult && (
          <div
            className={`p-3 rounded-xl border-2 border-black text-xs font-mono font-bold flex items-center justify-between ${
              verificationResult.isMatch ? 'bg-[#64EE00]/20 text-black' : 'bg-red-100 text-red-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-black stroke-[3]" />
              <span>{verificationResult.message}</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-black text-[#64EE00] font-mono text-[10px]">
              {verificationResult.confidenceScore}% MATCH
            </span>
          </div>
        )}

        {/* Stored Photo Comparison Indicator */}
        {!isFirstTimeEnrollment && user.faceBiometricData && (
          <div className="p-2.5 rounded-xl bg-slate-50 border border-black/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-black" />
              <span className="font-bold text-black text-[11px]">Database Baseline Photo Enrolled</span>
            </div>
            <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded font-mono">
              VERIFICATION READY
            </span>
          </div>
        )}

        {/* Progress Bar during Scanning */}
        {isScanning && (
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-black">
              <span>SCANNING FACIAL VECTORS...</span>
              <span>{scanProgress}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden border border-black/20">
              <div
                className="bg-[#64EE00] h-full transition-all duration-300 ease-out"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="w-1/3 py-2.5 rounded-xl bg-white border-2 border-black text-black font-bold text-xs hover:bg-slate-100 transition shadow-[2px_2px_0px_#000000]"
        >
          BACK
        </button>
        <button
          type="button"
          onClick={handleStartScan}
          disabled={isScanning || verificationResult?.isMatch}
          className="w-2/3 py-2.5 rounded-xl bg-[#64EE00] border-2 border-black text-black font-mono font-extrabold text-xs flex items-center justify-center gap-2 shadow-[3px_3px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000] transition disabled:opacity-50"
        >
          {isScanning ? (
            <>
              <RefreshCw className="w-4 h-4 text-black animate-spin" />
              <span>ANALYZING FACIAL FRAME...</span>
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 text-black stroke-[2.5]" />
              <span>
                {isFirstTimeEnrollment
                  ? 'CAPTURE & ENROLL FACE PHOTO'
                  : 'SCAN FACE & VERIFY IDENTITY'}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
