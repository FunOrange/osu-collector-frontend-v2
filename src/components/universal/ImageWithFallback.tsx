'use client';
import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

interface ImageWithFallbackProps extends ImageProps {
  fallbackSrc: string;
}
const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ src, fallbackSrc, ...props }) => {
  const [error, setError] = useState(false);
  return <Image src={!error ? src : fallbackSrc} onError={() => setError(true)} {...props} alt={props.alt} />;
};

export default ImageWithFallback;
