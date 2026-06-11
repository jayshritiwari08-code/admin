'use client';

import { useState, useRef } from 'react';

interface PutBlobResult {
  url: string;
  pathname: string;
  contentType?: string;
  contentDisposition?: string;
}

export default function AvatarUploadPage() {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<PutBlobResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = () => {
    setError(null);
    const files = inputFileRef.current?.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should not exceed 5MB');
        setPreviewUrl(null);
        return;
      }
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!inputFileRef.current?.files || inputFileRef.current.files.length === 0) {
      setError('Please select a file to upload');
      return;
    }

    const file = inputFileRef.current.files[0];
    setLoading(true);

    try {
      const response = await fetch(
        `/api/avatar/upload?filename=${encodeURIComponent(file.name)}`,
        {
          method: 'POST',
          body: file,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const newBlob = (await response.json()) as PutBlobResult;
      setBlob(newBlob);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Something went wrong during upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(#C9A84C_0.8px,transparent_1px)] bg-[length:40px_40px]"></div>
      </div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C9A84C]/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Upload container */}
      <div className="w-full max-w-md bg-neutral-900/60 border border-[#C9A84C]/25 backdrop-blur-xl rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative z-10">
        <h1 className="text-3xl font-bold text-center mb-2 tracking-wide text-[#C9A84C]" style={{ fontFamily: 'Georgia, serif' }}>
          Upload Your Avatar
        </h1>
        <p className="text-neutral-400 text-sm text-center mb-8">
          Upload a portrait locally or to private Vercel Blob Storage
        </p>

        {error && (
          <div className="bg-red-950/40 border border-red-500/30 text-red-300 text-sm rounded-lg p-3 mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <label 
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-neutral-700 rounded-xl cursor-pointer bg-neutral-950/40 hover:bg-neutral-950/70 hover:border-[#C9A84C]/50 transition-all duration-300"
            >
              {previewUrl ? (
                <div className="relative w-full h-full p-2 flex items-center justify-center">
                  <img 
                    src={previewUrl} 
                    alt="Upload Preview" 
                    className="max-w-full max-h-full object-contain rounded-lg shadow-md"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition-opacity duration-300 text-xs text-neutral-300">
                    Change image
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
                  <svg 
                    className="w-8 h-8 mb-4 text-neutral-400 group-hover:text-[#C9A84C] transition-colors duration-300" 
                    aria-hidden="true" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 20 16"
                  >
                    <path 
                      stroke="currentColor" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-neutral-300">
                    <span className="font-semibold text-[#C9A84C]">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-neutral-500">
                    JPEG, PNG, or WEBP (Max 5MB)
                  </p>
                </div>
              )}

              <input 
                id="file-upload" 
                name="file" 
                ref={inputFileRef} 
                type="file" 
                accept="image/jpeg, image/png, image/webp" 
                className="hidden" 
                onChange={handleFileChange}
                required 
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 px-6 rounded-lg font-bold text-sm tracking-wider uppercase transition-all duration-300 text-center ${
              loading 
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#C9A84C] via-[#e2c98a] to-[#8f6d1d] text-black hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(201,168,76,0.3)]'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-neutral-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Uploading...
              </span>
            ) : (
              'Upload Avatar'
            )}
          </button>
        </form>

        {blob && (
          <div className="mt-8 pt-6 border-t border-neutral-800 text-center">
            <p className="text-green-400 text-sm font-semibold mb-3">✓ Upload Successful!</p>
            <a 
              href={`/api/avatar/view?pathname=${encodeURIComponent(blob.pathname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-neutral-950 border border-[#C9A84C]/40 text-[#C9A84C] text-xs font-bold uppercase tracking-widest rounded-lg transition-all hover:bg-[#C9A84C] hover:text-black hover:border-transparent"
            >
              View Private Avatar
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
