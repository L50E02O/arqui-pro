import { memo, useCallback } from 'react'
import { Search } from 'lucide-react'
import { ESPECIALIDADES, RATINGS } from '../../config/constants'
import '../../styles/SearchBar.css'

interface SearchBarProps {
  onSearch: () => void
  filters: {
    especialidad: string
    rating: string
    setEspecialidad: (value: string) => void
    setRating: (value: string) => void
  }
}

const SearchBar = memo(function SearchBar({ onSearch, filters }: SearchBarProps) {
  const { especialidad, rating, setEspecialidad, setRating } = filters

  const handleEspecialidadChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setEspecialidad(e.target.value)
  }, [setEspecialidad])

  const handleRatingChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setRating(e.target.value)
  }, [setRating])

  return (
    <div className="search-bar">
      <div className="search-box" style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
        <Search className="search-icon" aria-hidden="true" />
        <input
          type="text"
          placeholder="Buscar por ubicación, tipo de proyecto o especialidad"
          className="search-input-main"
          style={{paddingLeft: '2.5rem'}}
          aria-label="Buscar arquitectos por ubicación, tipo de proyecto o especialidad"
        />
      </div>

      <div className="filters-container">
        <label className="filter-label" htmlFor="especialidad-filter">
          Filtros:
        </label>
        
        <select
          id="especialidad-filter"
          value={especialidad}
          onChange={handleEspecialidadChange}
          className="filter-select"
          aria-label="Filter by specialty"
        >
          {ESPECIALIDADES.map((esp) => (
            <option key={esp.value} value={esp.value}>
              {esp.label}
            </option>
          ))}
        </select>

        <select
          id="rating-filter"
          value={rating}
          onChange={handleRatingChange}
          className="filter-select"
          aria-label="Filter by rating"
        >
          {RATINGS.map((rat) => (
            <option key={rat.value} value={rat.value}>
              {rat.label}
            </option>
          ))}
        </select>

        <button 
          onClick={onSearch} 
          className="apply-btn"
          aria-label="Aplicar filtros"
        >
          Aplicar
        </button>
      </div>
    </div>
  )
})

export default SearchBar
