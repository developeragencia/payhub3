import { useState, useEffect } from "react";

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Verificar se a largura da tela é menor que 768px (tamanho md no Tailwind)
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }

    // Verificar o tamanho inicial
    handleResize();

    // Adicionar listener para redimensionamento
    window.addEventListener("resize", handleResize);

    // Limpar listener ao desmontar
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}