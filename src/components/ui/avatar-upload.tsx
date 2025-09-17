'use client';

import { useState, useRef } from 'react';
import Avatar from './avatar';

interface AvatarUploadProps {
  currentImage?: string | null;
  fallbackImage?: string | null;
  onUploadSuccess?: () => void;
  size?: number;
}

export default function AvatarUpload({ 
  currentImage, 
  fallbackImage, 
  onUploadSuccess,
  size = 128 
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validações
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione uma imagem válida.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB.');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Redimensionar imagem antes do upload
      const resizedFile = await resizeImage(file, 400); // Redimensionar para 400x400

      const formData = new FormData();
      formData.append('file', resizedFile);

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro no upload');
      }

      const data = await response.json();
      console.log('Upload bem-sucedido:', data.url);
      
      // Callback de sucesso
      if (onUploadSuccess) {
        onUploadSuccess();
      }

      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (err) {
      console.error('Erro no upload:', err);
      setError(err instanceof Error ? err.message : 'Erro no upload da imagem');
    } finally {
      setUploading(false);
    }
  };

  const resizeImage = (file: File, maxSize: number): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        // Calcular novo tamanho mantendo proporção
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        // Redimensionar para quadrado
        const size = Math.min(width, height);
        canvas.width = size;
        canvas.height = size;

        // Desenhar imagem centralizada
        const offsetX = (width - size) / 2;
        const offsetY = (height - size) / 2;
        
        ctx.drawImage(img, -offsetX, -offsetY, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          }
        }, file.type, 0.9);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleRemoveImage = async () => {
    if (!currentImage || currentImage.startsWith('https://avatars.githubusercontent.com')) {
      return; // Não remover imagem do GitHub
    }

    setUploading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/reset-avatar', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Erro ao remover imagem');
      }

      if (onUploadSuccess) {
        onUploadSuccess(); // Limpar imagem
      }

    } catch (err) {
      console.error('Erro ao remover:', err);
      setError('Erro ao remover imagem');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Avatar com overlay de upload */}
      <div className="relative group">
        <Avatar 
          src={currentImage}
          fallbackSrc={fallbackImage}
          alt="Foto do perfil"
          size={size}
          className="rounded-full"
        />
        
        {/* Overlay de upload */}
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
             onClick={() => fileInputRef.current?.click()}>
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>

        {/* Loading spinner */}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* Input escondido */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {/* Botões */}
      <div className="flex space-x-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
        >
          {uploading ? 'Enviando...' : 'Alterar Foto'}
        </button>
        
        {currentImage && !currentImage.startsWith('https://avatars.githubusercontent.com') && (
          <button
            onClick={handleRemoveImage}
            disabled={uploading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm"
          >
            Remover
          </button>
        )}
      </div>

      {/* Mensagem de erro */}
      {error && (
        <p className="text-red-600 text-sm text-center">{error}</p>
      )}

      {/* Informações */}
      <p className="text-gray-500 dark:text-gray-400 text-xs text-center">
        Formatos aceitos: JPG, PNG, GIF<br/>
        Tamanho máximo: 5MB<br/>
        A imagem será redimensionada automaticamente
      </p>
    </div>
  );
}
