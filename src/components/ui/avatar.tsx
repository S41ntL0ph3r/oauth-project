'use client';

import Image from "next/image";
import { useState, useEffect } from "react";

interface AvatarProps {
  src?: string | null;
  fallbackSrc?: string | null; // Imagem de fallback (ex: GitHub)
  alt: string;
  size?: number;
  className?: string;
}

export default function Avatar({ 
  src, 
  fallbackSrc, 
  alt, 
  size = 128, 
  className = "" 
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | null>(src || null);

  // Resetar estados quando src muda
  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
    setCurrentSrc(src || null);
  }, [src]);

  // Função para lidar com erro de imagem
  const handleImageError = () => {
    if (currentSrc === src && fallbackSrc && fallbackSrc !== src) {
      // Tentar fallback
      setCurrentSrc(fallbackSrc);
      setImageError(false);
      setImageLoaded(false);
    } else {
      // Usar placeholder
      setImageError(true);
    }
  };

  // Se não há src ou houve erro sem fallback, mostrar placeholder
  if (!currentSrc || imageError) {
    return (
      <div 
        className={`bg-gray-200 dark:bg-gray-600 flex items-center justify-center shadow-lg ${className}`}
        style={{ width: size, height: size }}
      >
        <svg 
          className="text-gray-400 dark:text-gray-300" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          style={{ width: size * 0.5, height: size * 0.5 }}
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Loading placeholder */}
      {!imageLoaded && (
        <div 
          className={`absolute inset-0 bg-gray-200 dark:bg-gray-600 animate-pulse ${className}`}
        />
      )}
      
      {/* Imagem */}
      <Image
        className={`object-cover shadow-lg transition-opacity duration-300 ${className} ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        src={currentSrc}
        alt={alt}
        width={size}
        height={size}
        onError={handleImageError}
        onLoad={() => setImageLoaded(true)}
        unoptimized={currentSrc.startsWith('/uploads/')} // Não otimizar uploads locais
      />
    </div>
  );
}
