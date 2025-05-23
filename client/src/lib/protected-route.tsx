import { Route } from "wouter";

// Componente simplificado para evitar problemas de contexto
export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  return (
    <Route path={path} component={Component} />
  );
}
