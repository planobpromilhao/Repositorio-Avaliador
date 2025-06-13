import React from 'react';
import { User } from 'lucide-react';

interface HeaderProps {
  userName?: string;
  isLoginPopupOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ userName, isLoginPopupOpen }) => {
  // Função para extrair e formatar o nome do usuário
  const getDisplayName = (name: string): string => {
    if (!name) return '';
    
    // Se é um nome completo, extrair apenas o primeiro nome
    const firstName = name.trim().split(' ')[0];
    
    // Capitalizar primeira letra
    return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  };

  const displayName = userName ? getDisplayName(userName) : '';

  return (
    <header className="bg-gradient-to-r from-orange-500 to-red-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="https://i.imgur.com/K0sHM7g.png" 
              alt="Logo" 
              className="w-28 h-11 sm:w-36 sm:h-14 object-contain"
            />
          </div>

          {/* Elemento do usuário ou promocional */}
          <div className="flex items-center">
            {displayName ? (
              /* Card do usuário logado - Versão mais simples */
              <div className="bg-white/20 rounded-full px-3 py-2 sm:px-4 sm:py-2 flex items-center space-x-2">
                {/* Ícone de usuário simples */}
                <div className="bg-white/20 rounded-full p-1.5">
                  <User className="w-4 h-4 text-white" />
                </div>
                
                {/* Nome do usuário */}
                <span className="text-white text-sm sm:text-base font-bold">
                  {displayName}
                </span>
              </div>
            ) : (
              /* Sem usuário logado - Prêmio promocional sem estrelas */
              <div className={`bg-white/20 rounded-full px-3 py-2 sm:px-4 sm:py-2 flex items-center space-x-2 transition-all duration-300 ${
                isLoginPopupOpen ? 'scale-105 bg-white/30' : ''
              }`}>
                <span className={`text-white font-bold ${
                  isLoginPopupOpen 
                    ? 'text-sm sm:text-lg' // Tamanho aumentado durante login
                    : 'text-xs sm:text-base' // Tamanho normal
                }`}>
                  🎁 Ganhe até R$ 659,77
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};