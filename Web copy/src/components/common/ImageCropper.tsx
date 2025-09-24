import { useState, useEffect, useRef } from 'react';
import Modal from './Modal';

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  imageFile: File | null;
  onCrop: (croppedImage: File) => void;
  aspectRatio?: number;
  size?: 'small' | 'medium' | 'large' | 'full';
}

export default function ImageCropper({
  isOpen,
  onClose,
  imageFile,
  onCrop,
  aspectRatio = 1,
  size = 'large'
}: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(false);

  // 加载图片
  useEffect(() => {
    if (!imageFile) return;

    setLoading(true);
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };

    img.onload = () => {
      setImage(img);
      setLoading(false);
    };

    img.onerror = () => {
      console.error('无法加载图片');
      setLoading(false);
    };

    reader.readAsDataURL(imageFile);

    return () => {
      // 清理
      img.onload = null;
      reader.onload = null;
    };
  }, [imageFile]);

  // 绘制画布内容
  const drawCanvas = () => {
    if (!canvasRef.current || !image) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布大小
    const containerWidth = canvas.parentElement?.clientWidth || 800;
    const containerHeight = canvas.parentElement?.clientHeight || 600;
    const maxSize = Math.min(containerWidth - 40, containerHeight - 40);

    canvas.width = maxSize;
    canvas.height = maxSize;

    // 计算图片显示的尺寸和位置
    let displayWidth, displayHeight;
    if (image.width / image.height > aspectRatio) {
      displayHeight = maxSize * scale;
      displayWidth = image.width * (maxSize * scale / image.height);
    } else {
      displayWidth = maxSize * scale;
      displayHeight = image.height * (maxSize * scale / image.width);
    }

    // 计算图片位置（考虑偏移）
    const x = (maxSize - displayWidth) / 2 + imageOffset.x;
    const y = (maxSize - displayHeight) / 2 + imageOffset.y;

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 绘制图片
    ctx.drawImage(image, x, y, displayWidth, displayHeight);

    // 绘制裁剪区域边框
    ctx.strokeStyle = '#ff4d4f';
    ctx.lineWidth = 2;
    ctx.strokeRect(crop.x, crop.y, crop.width, crop.height);

    // 绘制裁剪区域的角落标记
    const cornerSize = 10;
    ctx.fillStyle = '#ff4d4f';
    // 左上角
    ctx.fillRect(crop.x - 1, crop.y - 1, cornerSize + 2, cornerSize + 2);
    // 右上角
    ctx.fillRect(crop.x + crop.width - cornerSize - 1, crop.y - 1, cornerSize + 2, cornerSize + 2);
    // 左下角
    ctx.fillRect(crop.x - 1, crop.y + crop.height - cornerSize - 1, cornerSize + 2, cornerSize + 2);
    // 右下角
    ctx.fillRect(crop.x + crop.width - cornerSize - 1, crop.y + crop.height - cornerSize - 1, cornerSize + 2, cornerSize + 2);

    // 绘制半透明遮罩
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    
    // 上遮罩
    ctx.fillRect(0, 0, canvas.width, crop.y);
    // 左遮罩
    ctx.fillRect(0, crop.y, crop.x, crop.height);
    // 右遮罩
    ctx.fillRect(crop.x + crop.width, crop.y, canvas.width - crop.x - crop.width, crop.height);
    // 下遮罩
    ctx.fillRect(0, crop.y + crop.height, canvas.width, canvas.height - crop.y - crop.height);
  };

  // 计算初始裁剪区域
  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布大小
    const containerWidth = canvas.parentElement?.clientWidth || 800;
    const containerHeight = canvas.parentElement?.clientHeight || 600;
    const maxSize = Math.min(containerWidth - 40, containerHeight - 40);

    canvas.width = maxSize;
    canvas.height = maxSize;

    // 重置缩放和偏移
    setScale(1);
    setImageOffset({ x: 0, y: 0 });

    // 计算图片显示的尺寸和位置
    let displayWidth, displayHeight;
    if (image.width / image.height > aspectRatio) {
      displayHeight = maxSize;
      displayWidth = image.width * (maxSize / image.height);
    } else {
      displayWidth = maxSize;
      displayHeight = image.height * (maxSize / image.width);
    }

    // 居中显示图片
    const x = (maxSize - displayWidth) / 2;
    const y = (maxSize - displayHeight) / 2;

    // 计算裁剪区域（居中显示的正方形区域）
    const cropSize = Math.min(displayWidth, displayHeight);
    setCrop({
      x: x + (displayWidth - cropSize) / 2,
      y: y + (displayHeight - cropSize) / 2,
      width: cropSize,
      height: cropSize
    });

    // 绘制初始状态
    drawCanvas();
    updatePreview();
  }, [image, aspectRatio]);

  // 处理鼠标按下事件
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (loading) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 检查是否点击在裁剪区域内
    if (
      x >= crop.x && 
      x <= crop.x + crop.width && 
      y >= crop.y && 
      y <= crop.y + crop.height
    ) {
      setIsDragging(true);
      setDragStart({ x: x - crop.x, y: y - crop.y });
    }
  };

  // 处理鼠标移动事件
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || loading || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 计算新的裁剪区域位置
    let newX = x - dragStart.x;
    let newY = y - dragStart.y;

    // 限制裁剪区域在画布内
    if (newX < 0) newX = 0;
    if (newY < 0) newY = 0;
    if (newX + crop.width > canvasRef.current.width) {
      newX = canvasRef.current.width - crop.width;
    }
    if (newY + crop.height > canvasRef.current.height) {
      newY = canvasRef.current.height - crop.height;
    }

    setCrop({ ...crop, x: newX, y: newY });
  };

  // 处理鼠标释放事件
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 更新预览
  const updatePreview = () => {
    if (!canvasRef.current || !previewCanvasRef.current || !image) return;

    const canvas = canvasRef.current;
    const previewCanvas = previewCanvasRef.current;
    const previewCtx = previewCanvas.getContext('2d');
    if (!previewCtx) return;

    // 设置预览画布大小
    previewCanvas.width = 200;
    previewCanvas.height = 200;

    // 绘制裁剪区域的预览
    previewCtx.drawImage(
      canvas,
      crop.x, crop.y, crop.width, crop.height,
      0, 0, previewCanvas.width, previewCanvas.height
    );
  };

  // 处理缩放
  const handleScale = (factor: number) => {
    if (!image || loading) return;
    
    const newScale = scale + factor;
    if (newScale < 0.5 || newScale > 3) return; // 限制缩放范围
    
    setScale(newScale);
  };

  // 处理确认裁剪
  const handleConfirm = async () => {
    if (!canvasRef.current || !image || loading) return;

    setLoading(true);
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 创建临时画布用于裁剪
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 400; // 固定输出尺寸
      tempCanvas.height = 400;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;

      // 先创建一个临时画布来绘制纯净的图片（不包含截取框）
      const cleanCanvas = document.createElement('canvas');
      cleanCanvas.width = canvas.width;
      cleanCanvas.height = canvas.height;
      const cleanCtx = cleanCanvas.getContext('2d');
      if (!cleanCtx) return;

      // 计算图片显示的尺寸和位置
      const containerWidth = canvas.parentElement?.clientWidth || 800;
      const containerHeight = canvas.parentElement?.clientHeight || 600;
      const maxSize = Math.min(containerWidth - 40, containerHeight - 40);

      let displayWidth, displayHeight;
      if (image.width / image.height > aspectRatio) {
        displayHeight = maxSize * scale;
        displayWidth = image.width * (maxSize * scale / image.height);
      } else {
        displayWidth = maxSize * scale;
        displayHeight = image.height * (maxSize * scale / image.width);
      }

      // 计算图片的位置（考虑偏移）
      const x = (maxSize - displayWidth) / 2 + imageOffset.x;
      const y = (maxSize - displayHeight) / 2 + imageOffset.y;

      // 在临时画布上只绘制图片，不绘制截取框
      cleanCtx.drawImage(image, x, y, displayWidth, displayHeight);

      // 从纯净的图片画布上裁剪所需区域
      tempCtx.drawImage(
        cleanCanvas,
        crop.x, crop.y, crop.width, crop.height,
        0, 0, tempCanvas.width, tempCanvas.height
      );

      // 将裁剪后的画布转换为Blob
      const blob = await new Promise<Blob | null>((resolve) => {
        tempCanvas.toBlob(resolve, 'image/png', 0.9);
      });

      if (blob) {
        // 创建新的File对象
        const croppedFile = new File([blob], 'avatar_cropped.png', {
          type: 'image/png',
          lastModified: Date.now()
        });

        onCrop(croppedFile);
        onClose();
      } else {
        console.error('无法创建裁剪后的图片');
      }
    } catch (error) {
      console.error('裁剪图片时发生错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 监听裁剪区域变化，更新画布和预览
  useEffect(() => {
    if (!image || loading) return;
    drawCanvas();
    updatePreview();
  }, [crop, scale, imageOffset, loading]);

  // 处理鼠标离开画布
  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  if (!imageFile) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="裁剪头像"
      size={size}
      footer={
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleScale(-0.1)}
              disabled={loading || scale <= 0.5}
              className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              -
            </button>
            
            {/* 缩放条控件 */}
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={scale}
              onChange={(e) => {
                if (!image || loading) return;
                const newScale = parseFloat(e.target.value);
                setScale(newScale);
              }}
              disabled={loading || !image}
              className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            
            <button
              onClick={() => handleScale(0.1)}
              disabled={loading || scale >= 3}
              className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              +
            </button>
            
            {/* 显示当前缩放比例 */}
            <span className="text-sm text-gray-600 dark:text-gray-300 min-w-[45px] text-center">
              {(scale * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <span className="animate-spin">⟳</span>
                  <span>处理中...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>✓</span>
                  <span>确认裁剪</span>
                </div>
              )}
            </button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 裁剪区域 */}
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg p-4 min-h-[300px]">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">加载图片中...</p>
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              className="cursor-move bg-white dark:bg-gray-800 shadow-sm max-w-full max-h-[400px]"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            />
          )}
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            拖动裁剪框调整截取区域
          </div>
        </div>
        
        {/* 预览区域 */}
        <div className="w-48 h-48 flex flex-col items-center">
          <div className="bg-white dark:bg-gray-800 rounded-full overflow-hidden shadow-md border-4 border-gray-100 dark:border-gray-700 w-full h-full flex items-center justify-center">
            <canvas
              ref={previewCanvasRef}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="mt-4 text-sm text-center text-gray-600 dark:text-gray-300">
            头像预览
          </div>
        </div>
      </div>
    </Modal>
  );
}