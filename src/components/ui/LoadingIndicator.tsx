// src/components/MyAnimation.tsx
import React, { memo } from 'react';
import Lottie from 'lottie-react';
import animationData from '@/assets/Animation.json';
import { Skeleton } from '@/components/ui/skeleton';

const LoadingIndicator: React.FC = memo(() => {
  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: 300, height: 300, backgroundColor: '#111111', borderRadius: '30px', position: 'relative' }}>
            <Skeleton className="w-full h-full" style={{ backgroundColor: 'color-mix(in oklab, hsl(0deg 10.85% 89.22%) 10%, transparent)', borderRadius: '30px', position: 'absolute', top: 0, left: 0 }}/>
            <Lottie animationData={animationData} loop={true} />
        </div>
    </div>
  );
});

export default LoadingIndicator;
