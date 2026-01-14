import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <nav className="bg-emerald-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 font-bold text-2xl text-white hover:text-emerald-200 transition"
          >
            <span className="text-emerald-400">🚜</span>
            <span>Agro & Autos</span>
          </Link>

          {/* Menu Desktop */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link
              to="/"
              className="text-emerald-100 font-medium hover:text-white transition duration-300"
            >
              Inicio
            </Link>
            <Link
              to="/catalogo"
              className="text-emerald-100 font-medium hover:text-white transition duration-300"
            >
              Catálogo
            </Link>
            <Link
              to="/contacto"
              className="text-emerald-100 font-medium hover:text-white transition duration-300"
            >
              Contacto
            </Link>

            {/* Botones de autenticación */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-emerald-100 font-medium">{user?.name}</span>
                <Link
                  to="/admin"
                  className="bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded font-medium transition shadow-sm border border-emerald-600"
                >
                  Panel Admin
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded font-medium transition shadow-sm"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded font-medium transition shadow-sm border border-emerald-600"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>

          {/* Menu Mobile */}
          <button
            className="md:hidden text-emerald-100 text-2xl"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Menu Mobile Expandido */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-emerald-800 bg-emerald-900">
            <Link
              to="/"
              className="block py-2 text-emerald-100 font-medium hover:text-white transition px-4"
              onClick={() => setIsOpen(false)}
            >
              Inicio
            </Link>
            <Link
              to="/catalogo"
              className="block py-2 text-emerald-100 font-medium hover:text-white transition px-4"
              onClick={() => setIsOpen(false)}
            >
              Catálogo
            </Link>
            <Link
              to="/contacto"
              className="block py-2 text-emerald-100 font-medium hover:text-white transition px-4"
              onClick={() => setIsOpen(false)}
            >
              Contacto
            </Link>

            {/* Botones mobile */}
            {isAuthenticated ? (
              <div className="space-y-2 pt-4 border-t border-emerald-800 px-4">
                <p className="py-2 text-emerald-100 font-medium">
                  Hola, {user?.name}
                </p>
                <Link
                  to="/admin"
                  className="block py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded font-medium text-center transition"
                  onClick={() => setIsOpen(false)}
                >
                  Panel Admin
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full py-2 bg-red-700 hover:bg-red-600 text-white rounded font-medium transition"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="block py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded font-medium text-center transition mb-2 mx-4"
                onClick={() => setIsOpen(false)}
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
