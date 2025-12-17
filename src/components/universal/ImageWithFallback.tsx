'use client';
import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

interface ImageWithFallbackProps extends ImageProps {
  fallbackSrc: string;
}
export default function ImageWithFallback({ src, fallbackSrc, ...props }: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  return <Image src={!error && src ? src : fallbackSrc} onError={() => setError(true)} {...props} alt={props.alt} />;
}
