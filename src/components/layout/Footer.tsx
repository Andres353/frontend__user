export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 bg-primary-green rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Santiago Delivery
              </span>
            </div>
            <p className="text-gray-600 text-sm max-w-md">
              La mejor plataforma de delivery de comida en Santiago. 
              Conectamos restaurantes con clientes de manera rápida y confiable.
            </p>
          </div>

          {/* Enlaces útiles */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Enlaces Útiles
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-primary-green transition-colors">
                  Sobre Nosotros
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-primary-green transition-colors">
                  Contacto
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-primary-green transition-colors">
                  Términos y Condiciones
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-primary-green transition-colors">
                  Política de Privacidad
                </a>
              </li>
            </ul>
          </div>

          {/* Soporte */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Soporte
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-primary-green transition-colors">
                  Centro de Ayuda
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-primary-green transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-primary-green transition-colors">
                  Reportar Problema
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Línea divisoria y copyright */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              © 2024 Santiago Delivery. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="https://www.facebook.com/share/17ghaJQvVQ/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-green transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}



