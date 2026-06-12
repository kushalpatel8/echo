'use client';
import dynamic from 'next/dynamic';

const CameraMoodTracker = dynamic(() => import('./CameraComponent'), {
  ssr: false,
});

export default function Page() {
  return <CameraMoodTracker />;
}
