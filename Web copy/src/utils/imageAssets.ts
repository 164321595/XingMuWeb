// 默认头像路径
export const DEFAULT_AVATAR =
  "https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=user%20avatar&sign=f1f81b57b203e2aa336aa3ec3f6e3f7f";

/**
 * 获取正确的图片路径
 * @param path 图片路径（可以是URL或相对路径）
 * @returns 处理后的图片路径
 */
export const getImagePath = (path: string | undefined | null): string => {
  // 如果路径为空，返回默认头像
  if (!path || path.trim() === "") {
    // console.log("Path is empty, using default avatar");
    return DEFAULT_AVATAR;
  }

  // 规范化路径，将所有反斜杠转换为正斜杠
  const normalizedPath = path.replace(/\\/g, "/");

  // 检查是否是完整的URL
  if (
    normalizedPath.startsWith("http://") ||
    normalizedPath.startsWith("https://")
  ) {
    return normalizedPath;
  }

  // 构建正确的URL，直接使用不含/api的基础URL
  let fullPath;
  // 规范化路径格式
  const cleanPath = normalizedPath.startsWith("/")
    ? normalizedPath.substring(1)
    : normalizedPath;

  // 使用不包含/api的基础URL（硬编码，确保正确）
  const baseUrl = "http://localhost:8080";

  // 检查cleanPath是否已经包含"uploads/"前缀
  if (cleanPath.startsWith("uploads/")) {
    fullPath = baseUrl + "/" + cleanPath;
  } else {
    fullPath = baseUrl + "/uploads/" + cleanPath;
  }

  return fullPath;
};

/**
 * 预加载图片
 * @param src 图片URL
 * @returns Promise<HTMLImageElement>
 */
export const preloadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};
