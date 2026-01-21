import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API_ENDPOINTS from "../config";
import whatsappIcon from "../images/whatsappblanco.png";

export default function CarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedCars, setRelatedCars] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showZoom, setShowZoom] = useState(false);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.PUBLICATION_DETAIL(id));
        if (!response.ok) {
          throw new Error("Publicación no encontrada");
        }
        const data = await response.json();
        const mappedCar = {
          ...data,
          ...data.specs,
          brand: data.specs?.brand || (data.title ? data.title.split(' ')[0] : 'Varios'),
          model: data.specs?.model || (data.title ? data.title.substring(data.title.indexOf(' ') + 1) : ''),
        };
        setCar(mappedCar);
        setError(null);
        setCurrentImageIndex(0);
      } catch (err) {
        console.error("Error:", err);
        setError("No pudimos cargar los detalles.");
      } finally {
        setLoading(false);
      }
    };

    const fetchRelatedCars = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.PUBLICATIONS);
        if (response.ok) {
          const data = await response.json();
          // Filter out current car and sort specifically or shuffle
          const otherCars = data
            .filter((c) => c.id !== parseInt(id))
            .map(item => ({
              ...item,
              ...item.specs,
              brand: item.specs?.brand || (item.title ? item.title.split(' ')[0] : 'Varios'),
              model: item.specs?.model || (item.title ? item.title.substring(item.title.indexOf(' ') + 1) : ''),
            }));

          // Get 3 random cars
          const shuffled = otherCars.sort(() => 0.5 - Math.random());
          setRelatedCars(shuffled.slice(0, 3));
        }
      } catch (err) {
        console.error("Error loading related cars:", err);
      }
    };

    fetchCar();
    fetchRelatedCars();
  }, [id]);

  const getImages = () => {
    if (car?.images && Array.isArray(car.images)) {
      return car.images
        .filter((img) => img && img.image_path)
        .sort((a, b) => a.position - b.position);
    }
    return car?.image_url ? [{ image_path: car.image_url }] : [];
  };

  const images = getImages();
  const currentImage = images[currentImageIndex]?.image_path;

  const goToPreviousImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando detalles...</p>
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center mb-6">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-900 mb-2">
              Error al cargar
            </h2>
            <p className="text-red-700 mb-6">{error}</p>
            <button
              onClick={() => navigate("/catalogo")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Volver al Catálogo
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formattedPrice = (price) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "USD",
    }).format(price);

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/catalogo")}
            className="text-blue-600 hover:text-blue-700 font-semibold mb-4"
          >
            ← Volver al Catálogo
          </button>
          <h1 className="text-4xl font-bold text-gray-900">
            {car.title || `${car.brand} ${car.model}`}
          </h1>
          {car.year && <p className="text-xl text-gray-600 mt-2">Año {car.year}</p>}
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Carrusel de Imágenes */}
          <div className="lg:col-span-2">
            <div className="bg-gray-100 rounded-xl overflow-hidden shadow-lg mb-6 relative group flex items-center justify-center bg-opacity-20">
              <img
                src={currentImage}
                alt={`${car.brand} ${car.model} - Foto ${currentImageIndex + 1
                  }`}
                onClick={() => setShowZoom(true)}
                className="w-full h-auto max-h-[80vh] object-contain mx-auto cursor-zoom-in"
              />

              {/* Controles del Carrusel */}
              {images.length > 1 && (
                <>
                  {/* Botón Anterior */}
                  <button
                    onClick={goToPreviousImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition z-10"
                    aria-label="Imagen anterior"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  {/* Botón Siguiente */}
                  <button
                    onClick={goToNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition z-10"
                    aria-label="Siguiente imagen"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>

                  {/* Indicador de posición */}
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {/* Miniaturas del Carrusel */}
            {images.length > 1 && (
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 h-20 w-20 rounded-lg overflow-hidden border-2 transition ${index === currentImageIndex
                        ? "border-blue-600"
                        : "border-gray-300 hover:border-gray-400"
                      }`}
                  >
                    <img
                      src={image.image_path}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Descripción */}
            <div className="bg-gray-50 p-6 rounded-xl mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Descripción
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                {car.description}
              </p>
            </div>
          </div>

          {/* Panel Precio y CTA */}
          <div>
            <div className="bg-blue-600 text-white p-8 rounded-xl shadow-lg sticky top-20">
              {Number(car.price) > 0 && (
                <>
                  <p className="text-sm text-blue-100 mb-2">Precio Final</p>
                  <p className="text-4xl font-bold mb-6">
                    {formattedPrice(car.price)}
                  </p>
                </>
              )}

              <div className="space-y-3 mb-6">
                <p className="text-blue-100 text-sm">
                  ✓ Financiamiento disponible
                </p>
                <p className="text-blue-100 text-sm">✓ Garantía incluida</p>
                <p className="text-blue-100 text-sm">✓ Entrega inmediata</p>
              </div>

              <a
                href={`https://wa.me/543465650796?text=${encodeURIComponent(
                  `Hola, me interesa: ${car.title || `${car.brand} ${car.model}`}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-lg active:scale-95"
              >
                <img src={whatsappIcon} alt="WhatsApp" className="w-8 h-8" />
                Contactar Vendedor
              </a>

              <button
                onClick={async () => {
                  const shareData = {
                    title: `Ariel Piermattei Maquinarias: ${car.title || `${car.brand} ${car.model}`}`,
                    text: `Mira esta máquina: ${car.title || `${car.brand} ${car.model}`}. Entra al enlace para ver más detalles.`,
                    url: window.location.href,
                  };

                  if (navigator.share) {
                    try {
                      await navigator.share(shareData);
                    } catch (err) {
                      console.log("Error sharing", err);
                    }
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert("¡Enlace copiado al portapapeles!");
                  }
                }}
                className="block w-full text-center bg-gray-200 text-gray-800 py-4 rounded-lg font-bold text-lg hover:bg-gray-300 transition mt-3 shadow active:scale-95"
              >
                Compartir 🔗
              </button>
            </div>
          </div>
        </div>

        {/* Renderizado dinámico de specs */}
        {car.category === 'VEHICULO' && (
          <div className="bg-gray-50 p-8 rounded-xl mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Ficha Técnica
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">MOTOR</h3>
                <p className="text-lg font-bold text-gray-900">{car.motor || 'N/A'}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">POTENCIA</h3>
                <p className="text-lg font-bold text-gray-900">{car.potencia || 'N/A'}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">TRANSMISIÓN</h3>
                <p className="text-lg font-bold text-gray-900">{car.transmision || 'N/A'}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">KM</h3>
                <p className="text-lg font-bold text-gray-900">{car.km || '0'} km</p>
              </div>
            </div>
          </div>
        )}

        {car.category === 'MAQUINARIA' && (
          <div className="bg-gray-50 p-8 rounded-xl mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Ficha Técnica Maquinaria
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">HORAS</h3>
                <p className="text-lg font-bold text-gray-900">{car.horas || '0'} hs</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">AÑO</h3>
                <p className="text-lg font-bold text-gray-900">{car.year || 'N/A'}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">TRACCIÓN</h3>
                <p className="text-lg font-bold text-gray-900">{car.traccion || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}

        {car.category === 'HERRAMIENTA' && (
          <div className="bg-gray-50 p-8 rounded-xl mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Detalles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">CONDICIÓN</h3>
                <p className="text-lg font-bold text-gray-900">{car.condicion || 'N/A'}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">MARCA</h3>
                <p className="text-lg font-bold text-gray-900">{car.marca || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Equipamiento (si existe en specs, aunque es array, aquí asumimos simple para demo) */}
        {/* Simplemente mostramos JSON crudamente formateado si es complejo, o asumimos estructura previa */}



        {/* Autos Relacionados Carousel */}
        {relatedCars.length > 0 && (
          <div className="mt-16 border-t pt-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Relacionados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedCars.map((related) => {
                const relatedCoverImage = related.images
                  ? related.images.find((img) => img.is_cover)?.image_path ||
                  related.images[0]?.image_path
                  : related.image_url;
                return (
                  <div
                    key={related.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="h-48 overflow-hidden">
                      <img
                        src={relatedCoverImage}
                        alt={`${related.brand} ${related.model}`}
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {related.brand} {related.model}
                      </h3>
                      <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                        {related.description}
                      </p>
                      <div className="flex justify-between items-end">
                        {Number(related.price) > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Precio</p>
                            <p className="text-xl font-bold text-blue-600">
                              {formattedPrice(related.price)}
                            </p>
                          </div>
                        )}
                        <Link
                          to={`/catalogo/${related.id}`}
                          onClick={() => window.scrollTo(0, 0)}
                          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition"
                        >
                          Ver Detalle
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* Modal Zoom */}
        {showZoom && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95 p-4"
            onClick={() => setShowZoom(false)}
          >
            <button
              onClick={() => setShowZoom(false)}
              className="absolute top-4 right-4 text-white text-4xl p-4 hover:text-gray-300 z-50 bg-black/50 rounded-full"
            >
              ✕
            </button>
            <img
              src={currentImage}
              alt="Zoom"
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {/* Navegación en Zoom (Opcional, reutilizando funciones existentes) */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); goToPreviousImage(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-4 text-5xl hover:text-gray-300 transition"
                >
                  ‹
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); goToNextImage(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-4 text-5xl hover:text-gray-300 transition"
                >
                  ›
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
