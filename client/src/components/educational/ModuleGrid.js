import React, { useState, useMemo } from 'react';
import ModuleCard from '../ui/ModuleCard';

const ModuleGrid = ({ modules = [], onModuleClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('recommended');

  const categories = [
    { id: 'all', label: 'All Categories', icon: '📚' },
    { id: 'fundamentals', label: 'Fundamentals', icon: '🌱' },
    { id: 'social-engineering', label: 'Social Engineering', icon: '🎭' },
    { id: 'advanced', label: 'Advanced', icon: '🚀' },
    { id: 'tools', label: 'Tools & Techniques', icon: '🛠️' }
  ];

  const difficulties = [
    { id: 'all', label: 'All Levels', icon: '🌟' },
    { id: 'beginner', label: 'Beginner', icon: '🌱' },
    { id: 'intermediate', label: 'Intermediate', icon: '📈' },
    { id: 'advanced', label: 'Advanced', icon: '🚀' }
  ];

  const sortOptions = [
    { id: 'recommended', label: 'Recommended', icon: '⭐' },
    { id: 'progress', label: 'Progress', icon: '📊' },
    { id: 'difficulty', label: 'Difficulty', icon: '📈' },
    { id: 'duration', label: 'Duration', icon: '⏱️' },
    { id: 'alphabetical', label: 'A-Z', icon: '🔤' }
  ];

  const filteredAndSortedModules = useMemo(() => {
    let filtered = modules.filter(module => {
      const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           module.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || module.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });

    // Sort modules
    switch (sortBy) {
      case 'progress':
        filtered.sort((a, b) => (b.progress || 0) - (a.progress || 0));
        break;
      case 'difficulty':
        const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
        filtered.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
        break;
      case 'duration':
        filtered.sort((a, b) => {
          const aDuration = parseInt(a.duration) || 0;
          const bDuration = parseInt(b.duration) || 0;
          return aDuration - bDuration;
        });
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default: // recommended
        filtered.sort((a, b) => {
          // Prioritize in-progress modules, then by progress
          if (a.status === 'in_progress' && b.status !== 'in_progress') return -1;
          if (b.status === 'in_progress' && a.status !== 'in_progress') return 1;
          return (b.progress || 0) - (a.progress || 0);
        });
    }

    return filtered;
  }, [modules, searchTerm, selectedCategory, selectedDifficulty, sortBy]);

  const getModuleStats = () => {
    const total = modules.length;
    const completed = modules.filter(m => m.status === 'completed').length;
    const inProgress = modules.filter(m => m.status === 'in_progress').length;
    const notStarted = total - completed - inProgress;
    
    return { total, completed, inProgress, notStarted };
  };

  const stats = getModuleStats();

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              {sortOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-6 space-y-4">
          {/* Category Filter */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Categories</h4>
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 whitespace-nowrap
                    ${selectedCategory === category.id
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  <span>{category.icon}</span>
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Difficulty Level</h4>
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              {difficulties.map((difficulty) => (
                <button
                  key={difficulty.id}
                  onClick={() => setSelectedDifficulty(difficulty.id)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 whitespace-nowrap
                    ${selectedDifficulty === difficulty.id
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  <span>{difficulty.icon}</span>
                  <span>{difficulty.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Module Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Modules</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
          <div className="text-2xl font-bold text-gray-400">{stats.notStarted}</div>
          <div className="text-sm text-gray-600">Not Started</div>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {filteredAndSortedModules.length} of {modules.length} modules
        </div>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear search
          </button>
        )}
      </div>

      {/* Modules Grid */}
      {filteredAndSortedModules.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedModules.map((module, index) => (
            <ModuleCard
              key={module.id || index}
              title={module.title}
              description={module.description}
              icon={module.icon}
              color={module.color}
              progress={module.progress}
              difficulty={module.difficulty}
              duration={module.duration}
              status={module.status}
              lessons={module.modules}
              onClick={() => onModuleClick(module)}
              className="hover:shadow-xl transition-all duration-300"
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-gray-400">🔍</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No modules found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? `No modules match "${searchTerm}". Try adjusting your search or filters.`
              : 'No modules match your current filters. Try selecting different options.'
            }
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedDifficulty('all');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Quick Actions */}
      {filteredAndSortedModules.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Ready to learn?</h3>
              <p className="text-gray-600">Start with a recommended module or continue where you left off</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                Start Learning
              </button>
              <button className="px-4 py-2 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors border border-gray-200">
                View All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleGrid; 