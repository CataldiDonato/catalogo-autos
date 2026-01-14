import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section - Country Style */}
      <section
        className="relative w-full min-h-screen sm:min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center"
        style={{
          backgroundImage: "url('/port.png')",
          backgroundAttachment: "fixed",
          minHeight: "clamp(500px, 100vh, 900px)",
        }}
      >
        {/* Overlay con tinte verde/negro */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 to-black/30"></div>

        {/* Contenido - Mobile First */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-amber-500/90 text-white text-xs sm:text-sm font-bold tracking-wider mb-4 uppercase shadow-lg">
            Potencia para el Campo y la Ciudad
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-4 sm:mb-6 leading-tight drop-shadow-2xl font-serif tracking-tight">
            Maquinaria, Vehículos <br className="hidden sm:block"/>y Herramientas
          </h1>

          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-stone-100 mb-8 sm:mb-10 leading-relaxed drop-shadow-lg font-medium max-w-3xl mx-auto">
            Equipamos tu trabajo y tu vida. Desde tractores y cosechadoras hasta 
            la camioneta que necesitás para moverte. Calidad garantizada.
          </p>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/catalogo"
              className="w-full sm:w-auto bg-emerald-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-emerald-700 hover:scale-105 transition-all duration-300 shadow-xl border-b-4 border-emerald-800 flex items-center justify-center gap-2"
            >
              <span>🚜</span> Ver Catálogo
            </Link>
            <a
              href="https://api.whatsapp.com/send/?phone=543465668393&text=Hola,+me+interesa+consultar+sobre+maquinaria+o+vehículos&type=phone_number&app_absent=0"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-white/10 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/20 transition-all duration-300 shadow-xl flex items-center justify-center gap-2"
            >
              <span>💬</span> Contactar Asesor
            </a>
          </div>
        </div>
      </section>

      {/* Features Section - Estilo Robusto */}
      <section className="py-16 sm:py-24 bg-stone-100">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-emerald-950 mb-4 font-serif">
              Soluciones Integrales
            </h2>
            <div className="h-1 w-24 bg-amber-500 mx-auto rounded-full mb-6"></div>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Sabemos lo que el campo y la ciudad necesitan. Tecnología, potencia y servicio post-venta.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-xl shadow-lg border-b-4 border-emerald-600 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-4xl mb-6 text-emerald-700">
                🚜
              </div>
              <h3 className="text-2xl font-bold text-emerald-950 mb-3">
                Maquinaria Agrícola
              </h3>
              <p className="text-stone-600 leading-relaxed">
                Tractores, cosechadoras y sembradoras listas para trabajar. 
                Equipos nuevos y usados seleccionados.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-xl shadow-lg border-b-4 border-amber-500 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-4xl mb-6 text-amber-600">
                🛻
              </div>
              <h3 className="text-2xl font-bold text-emerald-950 mb-3">
                Vehículos Utilitarios
              </h3>
              <p className="text-stone-600 leading-relaxed">
                Pick-ups 4x4, utilitarios y autos para la familia. 
                La movilidad que tu negocio necesita.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-xl shadow-lg border-b-4 border-emerald-600 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-4xl mb-6 text-emerald-700">
                🛠️
              </div>
              <h3 className="text-2xl font-bold text-emerald-950 mb-3">
                Herramientas
              </h3>
              <p className="text-stone-600 leading-relaxed">
                Insumos y herramientas profesionales para taller y campo. 
                Todo en un solo lugar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-emerald-900 relative overflow-hidden">
        {/* Pattern Background opcional */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        <div className="relative z-10 w-full max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 font-serif">
            ¿Buscas mejorar tu equipamiento?
          </h2>
          <p className="text-lg md:text-xl text-emerald-100 mb-10 leading-relaxed max-w-2xl mx-auto">
            Recorre nuestro catálogo completo y encontrá oportunidades únicas en maquinaria y rodados.
          </p>
          <Link
            to="/catalogo"
            className="inline-flex items-center justify-center bg-amber-500 text-emerald-950 px-10 py-4 rounded-lg font-bold text-lg hover:bg-amber-400 hover:scale-105 transition-all duration-300 shadow-xl"
          >
            Explorar Catálogo
          </Link>
        </div>
      </section>
    </div>
  );
}
