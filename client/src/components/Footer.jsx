export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-emerald-950 text-white mt-16 border-t border-emerald-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold mb-4 text-emerald-400">
              Ariel Piermattei Maquinarias
            </h3>
            <p className="text-emerald-100/70">
              Expertos en conectar el campo con la movilidad. Encontrá maquinaria, 
              herramientas y vehículos con la confianza de siempre.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4 text-emerald-400">
              Enlaces Rápidos
            </h3>
            <ul className="space-y-2 text-emerald-100/70">
              <li>
                <a href="/" className="hover:text-emerald-300 transition">
                  Inicio
                </a>
              </li>
              <li>
                <a href="/catalogo" className="hover:text-emerald-300 transition">
                  Catálogo Completo
                </a>
              </li>

            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4 text-emerald-400">Visítanos</h3>
            <p className="text-emerald-100/70">
              📧 piermatteiariel67@gmail.com
              <br />
              📱 3465-650796 (Ariel Piermattei)
              <br />
              📍 Caseros, Santa Fe
            </p>
          </div>
        </div>
        <div className="border-t border-emerald-900 pt-8 text-center text-emerald-100/50 text-sm space-y-2">
          <p>
            &copy; {currentYear} Ariel Piermattei Maquinarias. Todos los derechos reservados.
          </p>
          <p>
            Desarrollado por{" "}
            <a 
              href="https://techphite.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-emerald-300 transition-colors"
            >
              TechPhite
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
