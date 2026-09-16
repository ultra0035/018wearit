import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Image as ImageIcon,
  Upload,
  RefreshCw,
  Check,
  MapPin,
  Tag,
  Sparkles,
  AlertCircle,
  Loader2,
  SwitchCamera
} from 'lucide-react';
import { Product, CommunityPhoto, SOUTH_AFRICA_PROVINCES } from '../types';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onPhotoUploaded: (photo: CommunityPhoto) => void;
}

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  onClose,
  products,
  onPhotoUploaded
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'camera' | 'gallery'>('camera');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Form details
  const [userName, setUserName] = useState('');
  const [handle, setHandle] = useState('');
  const [location, setLocation] = useState('Klerksdorp, North West');
  const [productTagged, setProductTagged] = useState(products[0]?.title || '018 Platinum Sunset Wool-Blend Cap');
  const [caption, setCaption] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize camera when camera tab is active
  useEffect(() => {
    let stream: MediaStream | null = null;

    if (activeTab === 'camera' && !capturedImage) {
      setCameraError(null);
      navigator.mediaDevices
        ?.getUserMedia({
          video: { facingMode, width: { ideal: 1280 }, height: { ideal: 1280 } },
          audio: false
        })
        .then((s) => {
          stream = s;
          setCameraStream(s);
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play().catch(() => {});
          }
        })
        .catch((err) => {
          console.warn('Camera access error:', err);
          setCameraError('Camera access not permitted or not supported. You can upload from your gallery.');
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [activeTab, facingMode, capturedImage]);

  // Clean up stream on modal close
  const handleClose = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }
    setCapturedImage(null);
    onClose();
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 640;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);

      // Stop video stream after capture
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
        setCameraStream(null);
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCapturedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitLook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!capturedImage) {
      setSubmitError('Please take a photo or select an image from your gallery first.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: userName.trim() || '018 Family Member',
          handle: handle.trim() || '@018_street',
          location: location.trim() || 'Klerksdorp, North West',
          caption: caption.trim() || 'Wearing Bokone Bophirima boldly. #Style018',
          imageUrl: capturedImage,
          productTagged,
          source: activeTab === 'camera' ? 'camera' : 'gallery'
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to submit look');
      }

      onPhotoUploaded(data.photo);
      handleClose();
    } catch (err: any) {
      setSubmitError(err.message || 'Error uploading photo. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#121317] border border-[#272935] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl my-auto text-left max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#21232c] flex items-center justify-between bg-[#15161b]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ff5500] text-black font-black flex items-center justify-center text-sm">
              📸
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-white uppercase font-display">
                Wear Your 018 Style • Snap & Upload
              </h3>
              <p className="text-[11px] text-zinc-400">
                Take a live photo or pick from your device gallery
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {submitError && (
            <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-xl text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Mode Switcher Tabs */}
          <div className="flex bg-[#181920] p-1 rounded-xl border border-[#272933]">
            <button
              type="button"
              onClick={() => {
                setActiveTab('camera');
                setCapturedImage(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                activeTab === 'camera'
                  ? 'bg-[#ff5500] text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Take Photo (Camera)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('gallery');
                setCapturedImage(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                activeTab === 'gallery'
                  ? 'bg-[#ff5500] text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Upload from Gallery</span>
            </button>
          </div>

          {/* Camera / Image Viewport */}
          <div className="relative aspect-video sm:aspect-[4/3] bg-black rounded-2xl overflow-hidden border border-[#282a35] flex items-center justify-center">
            {capturedImage ? (
              // Review Captured Image
              <div className="relative w-full h-full">
                <img
                  src={capturedImage}
                  alt="Captured preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="px-3 py-1.5 bg-black/80 hover:bg-black text-white text-xs font-semibold rounded-lg backdrop-blur-md flex items-center gap-1.5 border border-white/20"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#ff5500]" />
                    <span>Retake</span>
                  </button>
                </div>
                <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg text-[11px] text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Photo Ready</span>
                </div>
              </div>
            ) : activeTab === 'camera' ? (
              // Live Video Stream View
              <div className="relative w-full h-full flex items-center justify-center bg-[#0d0e12]">
                {cameraError ? (
                  <div className="p-6 text-center space-y-3 max-w-sm">
                    <Camera className="w-10 h-10 text-zinc-600 mx-auto" />
                    <p className="text-xs text-zinc-400">{cameraError}</p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('gallery')}
                      className="px-4 py-2 bg-[#ff5500] text-black font-bold text-xs rounded-lg"
                    >
                      Switch to Gallery Upload
                    </button>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      autoPlay
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                    {/* Capture button overlay */}
                    <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4 z-10">
                      <button
                        type="button"
                        onClick={() =>
                          setFacingMode(facingMode === 'user' ? 'environment' : 'user')
                        }
                        className="p-3 rounded-full bg-black/60 text-white hover:bg-black/90 border border-white/20"
                        title="Flip Camera"
                      >
                        <SwitchCamera className="w-5 h-5" />
                      </button>

                      <button
                        type="button"
                        id="snap-photo-btn"
                        onClick={handleCapturePhoto}
                        className="w-16 h-16 rounded-full bg-[#ff5500] hover:bg-[#e04a00] text-black p-1 shadow-lg shadow-[#ff5500]/40 flex items-center justify-center transition-transform active:scale-95"
                        title="Capture Photo"
                      >
                        <div className="w-13 h-13 rounded-full border-2 border-black flex items-center justify-center">
                          <Camera className="w-6 h-6 text-black" />
                        </div>
                      </button>
                    </div>
                  </>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>
            ) : (
              // Gallery File Picker View
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-full flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-zinc-900/50 transition-colors border-2 border-dashed border-[#2f3240] rounded-2xl"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-[#ff5500]/10 text-[#ff5500] flex items-center justify-center mb-3">
                  <Upload className="w-7 h-7" />
                </div>
                <p className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  Click to choose image from phone / computer
                </p>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Supports JPG, PNG, WEBP from your camera roll or files
                </p>
              </div>
            )}
          </div>

          {/* Form details */}
          <form id="community-photo-form" onSubmit={handleSubmitLook} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Your Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Lerato Tau"
                  className="w-full bg-[#181920] border border-[#272935] text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-[#ff5500]"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Instagram / TikTok Handle</label>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="e.g. @lerato_018"
                  className="w-full bg-[#181920] border border-[#272935] text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-[#ff5500]"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Klerksdorp, North West"
                  className="w-full bg-[#181920] border border-[#272935] text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-[#ff5500]"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Tag 018 Product</label>
                <select
                  value={productTagged}
                  onChange={(e) => setProductTagged(e.target.value)}
                  className="w-full bg-[#181920] border border-[#272935] text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-[#ff5500]"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.title}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] text-zinc-400 block mb-1">Outfit Caption / Story</label>
                <textarea
                  rows={2}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="How are you styling your 018 pieces today?"
                  className="w-full bg-[#181920] border border-[#272935] text-white text-xs p-3 rounded-lg focus:outline-none focus:border-[#ff5500]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting || !capturedImage}
                className="w-full py-3.5 bg-[#ff5500] hover:bg-[#e04a00] text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#ff5500]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-40"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Publish Look to 018 Community Feed</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
