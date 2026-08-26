import { Component } from 'react';

/**
 * Captura los errores de render del arbol y muestra una salida en lugar de dejar
 * la pantalla en blanco.
 *
 * Sin este limite, un ejercicio con la forma equivocada lanzaba un TypeError en
 * render y React desmontaba el arbol entero: el usuario perdia la pantalla y con
 * ella cualquier via de exportar sus datos antes de tocarlos.
 */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    const { error } = this.state;
    const { children, fallback } = this.props;
    if (!error) return children;
    return fallback(error);
  }
}
