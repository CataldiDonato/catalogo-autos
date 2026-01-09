import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Responsive */}
      <section
        className="relative w-full min-h-screen sm:min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center"
        style={{
          backgroundImage: "url('/Portada.png')",
          backgroundAttachment: "fixed",
          minHeight: "clamp(500px, 100vh, 900px)",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Contenido - Mobile First */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 text-center bg-black/30 rounded-lg sm:rounded-xl">
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight drop-shadow-2xl">
            Encuentra tu próximo auto
          </h1>

          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white mb-6 sm:mb-8 leading-relaxed drop-shadow-lg font-semibold">
            Explora nuestro catálogo de vehículos de las mejores marcas del
            mercado. Financiamiento flexible y atención personalizada para
            ayudarte a elegir el auto perfecto.
          </p>

          {/* Botones - Hit area 44x44px mínimo */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              to="/catalogo"
              className="w-full sm:w-auto bg-blue-600 text-white px-6 sm:px-10 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-300 shadow-lg min-h-[44px] flex items-center justify-center"
            >
              Ver Catálogo
            </Link>
            <a
              href="https://api.whatsapp.com/send/?phone=543465668393&text=Holaa+Quiero+hacer+una+consulta&type=phone_number&app_absent=0"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-white text-gray-900 px-6 sm:px-10 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-300 shadow-lg min-h-[44px] flex items-center justify-center"
            >
              Contactar Asesor
            </a>
          </div>
        </div>
      </section>

      {/* Features Section - Mobile First */}
      <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              ¿Por qué elegirnos?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">
              Somos líderes en la venta de vehículos con excelencia en servicio
            </p>
          </div>

          {/* Grid responsivo con gap fluido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 sm:p-8 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-blue-500">
              <div
                className="text-3xl sm:text-4xl mb-4 text-blue-600"
                aria-hidden="true"
              >
                ✓
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                Gran Variedad
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Selecciona entre las mejores marcas y modelos de vehículos
                nuevos y usados.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 sm:p-8 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-blue-500">
              <div
                className="text-3xl sm:text-4xl mb-4 text-blue-600"
                aria-hidden="true"
              >
                💳
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                Financiamiento
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Opciones de financiamiento flexible adaptadas a tu presupuesto.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 sm:p-8 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-blue-500">
              <div
                className="text-3xl sm:text-4xl mb-4 text-blue-600"
                aria-hidden="true"
              >
                🛡️
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                Garantía y Soporte
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Garantía comprensiva y equipo de soporte disponible para ti.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action - Mobile First */}
      <section className="py-12 sm:py-16 md:py-20 bg-blue-600">
        <div className="w-full max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            ¿Listo para encontrar tu auto?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-6 sm:mb-8 leading-relaxed">
            Navega por nuestro amplio catálogo y encuentra el vehículo perfecto
            para ti hoy mismo.
          </p>
          <Link
            to="/catalogo"
            className="inline-flex items-center justify-center bg-white text-blue-600 px-6 sm:px-10 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 transition-all duration-300 shadow-lg min-h-[44px]"
          >
            Explorar Catálogo
          </Link>
        </div>
      </section>
    </div>
  );
}
