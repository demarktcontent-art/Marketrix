import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  
  try {
    const parsedUrl = new URL(url);
    
    // Google Drive File
    if (parsedUrl.hostname.includes('drive.google.com')) {
      const fileMatch = url.match(/\/file\/d\/([^\/]+)/);
      if (fileMatch && fileMatch[1]) {
        return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
      }
      
      const folderMatch = url.match(/\/folders\/([^\/?]+)/);
      if (folderMatch && folderMatch[1]) {
        return `https://drive.google.com/embeddedfolderview?id=${folderMatch[1]}#grid`;
      }
    }
    
    // YouTube
    if (parsedUrl.hostname.includes('youtube.com') || parsedUrl.hostname.includes('youtu.be')) {
      let videoId = '';
      if (parsedUrl.hostname.includes('youtu.be')) {
        videoId = parsedUrl.pathname.slice(1);
      } else {
        videoId = parsedUrl.searchParams.get('v') || '';
      }
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    // Facebook Video / Reel / Post
    if (parsedUrl.hostname.includes('facebook.com') || parsedUrl.hostname.includes('fb.watch')) {
      // For reels, the plugin usually works if we pass the reel URL directly
      // For share links, we'll also try to pass it to the plugin
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=560`;
    }
    
    // Vimeo
    if (parsedUrl.hostname.includes('vimeo.com')) {
      const match = url.match(/vimeo\.com\/(\d+)/);
      if (match && match[1]) {
        return `https://player.vimeo.com/video/${match[1]}`;
      }
    }
    
  } catch (e) {
    return null;
  }
  
  return null;
}
