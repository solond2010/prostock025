import { useState, useEffect } from 'react';
import { Smartphone } from 'lucide-react';

interface DealImageProps {
  src?: string | null;
  alt?: string;
  /** Tamaño y forma de la imagen, ej "w-16 h-16 rounded-xl object-cover". */
  className?: string;
  /** Tamaño del icono del placeholder. */
  iconClassName?: string;
  style?: React.CSSProperties;
}

/**
 * Imagen de una oferta con fallback. Las URLs de imágenes de Wallapop caducan,
 * así que cuando una falla (o no hay URL) mostramos un placeholder con un icono
 * de móvil en vez del feo icono de "imagen rota" del navegador.
 */
export function DealImage({ src, alt = '', className = '', iconClassName = 'h-1/2 w-1/2', style }: DealImageProps) {
  const [failed, setFailed] = useState(false);

  // Si cambia la URL (lista reutiliza componentes), reintentamos.
  useEffect(() => { setFailed(false); }, [src]);

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-muted to-muted/50 text-muted-foreground/40 ${className}`}
        style={style}
      >
        <Smartphone className={iconClassName} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
