import { useNavigate } from "react-router-dom";
import { formatPrice } from "../utils/formatters";

export default function VehicleCard({ vehicle }) {
  const navigate = useNavigate();

  // Obtener imagen de portada o primera imagen disponible
  const getCoverImage = () => {
    if (vehicle.images && Array.isArray(vehicle.images)) {
      const coverImage = vehicle.images.find((img) => img.is_cover);
      if (coverImage) return coverImage.image_path;
      if (vehicle.images.length > 0) return vehicle.images[0].image_path;
    }
    return vehicle.image_url;
  };

  const coverImage = getCoverImage();

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
      {/* Imagen - Más compacta */}
      <div className="relative overflow-hidden h-32 sm:h-40 bg-gray-200">
        <img
          src={coverImage}
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src =
              "https://via.placeholder.com/500x400?text=Auto+No+Disponible";
          }}
        />
        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">
          {vehicle.year}
        </div>
        {vehicle.images && vehicle.images.length > 1 && (
          <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-black bg-opacity-60 text-white px-2 py-0.5 rounded-full text-xs font-bold">
            📸 {vehicle.images.filter((img) => img).length}
          </div>
        )}
      </div>

      {/* Contenido - Reducido */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">
          {vehicle.brand}
        </h3>
        <p className="text-xs sm:text-sm text-gray-700 font-semibold mb-2">
          {vehicle.model}
        </p>

        <p className="text-gray-600 text-xs mb-3 flex-grow line-clamp-1">
          {vehicle.description}
        </p>

        <div className="border-t border-gray-200 pt-2 mt-auto">
          <p className="text-lg sm:text-xl font-bold text-blue-600">
            {formatPrice(vehicle.price)}
          </p>
        </div>

        <button
          onClick={() => navigate(`/catalogo/${vehicle.id}`)}
          className="mt-2 w-full bg-blue-600 text-white py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm hover:bg-blue-700 transition duration-300 min-h-[44px] flex items-center justify-center"
        >
          Ver Detalles
        </button>
      </div>
    </div>
  );
}
