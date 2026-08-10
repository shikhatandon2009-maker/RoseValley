/**
 * Client-side utility to automatically detect and erase fake checkerboard / white background pixels from product images.
 * Uses BFS floodfill from the borders inward to convert background pixels into 100% transparent alpha.
 */
export function removeFakeCheckerboard(src: string): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !src) {
      return resolve(src);
    }

    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.src = src;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(src);

        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Helper to check if a pixel is a checkerboard/white/grey background
        const isBgPixel = (r: number, g: number, b: number, a: number) => {
          if (a < 10) return true; // Already transparent
          // Pure white or near white
          if (r > 240 && g > 240 && b > 240) return true;
          // Grey checkerboard square (approx 160-240 range where R, G, B are nearly equal)
          const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
          if (maxDiff <= 18 && r >= 150 && r <= 245) return true;
          return false;
        };

        // Breadth-First Search (BFS) floodfill starting from all 4 borders
        const visited = new Uint8Array(width * height);
        const queue: number[] = [];

        // Push top & bottom border pixels
        for (let x = 0; x < width; x++) {
          queue.push(x, 0);
          queue.push(x, height - 1);
        }
        // Push left & right border pixels
        for (let y = 0; y < height; y++) {
          queue.push(0, y);
          queue.push(width - 1, y);
        }

        let head = 0;
        while (head < queue.length) {
          const x = queue[head++];
          const y = queue[head++];
          const idx = y * width + x;

          if (visited[idx]) continue;
          visited[idx] = 1;

          const pIdx = idx * 4;
          const r = data[pIdx];
          const g = data[pIdx + 1];
          const b = data[pIdx + 2];
          const a = data[pIdx + 3];

          if (isBgPixel(r, g, b, a)) {
            data[pIdx + 3] = 0; // Make pixel 100% transparent!

            // Add 4-directional neighbors
            if (x > 0) queue.push(x - 1, y);
            if (x < width - 1) queue.push(x + 1, y);
            if (y > 0) queue.push(x, y - 1);
            if (y < height - 1) queue.push(x, y + 1);
          }
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (e) {
        console.error('Auto image background cleaner error:', e);
        resolve(src);
      }
    };

    img.onerror = () => resolve(src);
  });
}
