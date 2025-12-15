import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Activity, 
  Zap, 
  Eye, 
  Box, 
  Calculator, 
  Play, 
  Trophy,
  History,
  RotateCcw,
  Target,
  MousePointer,
  ListOrdered
} from 'lucide-react';
import { UserStats, GameDefinition, StatDimension } from './types';
import { getStats, updateStats, resetStats } from './services/storage';
import RadarAnalysis from './components/RadarAnalysis';
import GameSession from './components/GameSession';

// --- Game Registry ---
const GAMES: GameDefinition[] = [
  { id: 'math', name: 'Speed Math', dimension: 'calculation', description: 'Rapid fire arithmetic to boost processing speed.', iconName: 'calc', color: 'from-blue-500 to-cyan-500' },
  { id: 'stroop', name: 'Color Mind', dimension: 'execution', description: 'Challenge your inhibitory control.', iconName: 'zap', color: 'from-purple-500 to-pink-500' },
  { id: 'memory', name: 'Grid Recall', dimension: 'memory', description: 'Spatial memory training. Find all the blocks.', iconName: 'box', color: 'from-orange-500 to-red-500' },
  { id: 'schulte', name: 'Focus Finder', dimension: 'attention', description: 'Scan numbers in order to improve focus.', iconName: 'eye', color: 'from-green-500 to-emerald-500' },
  { id: 'visual', name: 'Shape Shift', dimension: 'visual', description: 'Find the matching shape among distractions.', iconName: 'activity', color: 'from-teal-500 to-green-400' },
  { id: 'logic', name: 'Logic Flow', dimension: 'abstraction', description: 'Deduce number patterns and series.', iconName: 'brain', color: 'from-indigo-500 to-violet-500' },
  { id: 'flanker', name: 'Arrow Focus', dimension: 'attention', description: 'Focus on the center. Red means Reverse!', iconName: 'target', color: 'from-rose-500 to-pink-600' },
  { id: 'reflex', name: 'Quick Reflex', dimension: 'execution', description: 'Test your motor reaction speed.', iconName: 'mouse', color: 'from-yellow-500 to-amber-500' },
  { id: 'order', name: 'Order Path', dimension: 'attention', description: 'Select numbers in ascending order.', iconName: 'list', color: 'from-cyan-500 to-sky-500' },
];

const getIcon = (name: string, size: number = 24) => {
    switch(name) {
        case 'calc': return <Calculator size={size} />;
        case 'zap': return <Zap size={size} />;
        case 'box': return <Box size={size} />;
        case 'eye': return <Eye size={size} />;
        case 'activity': return <Activity size={size} />;
        case 'target': return <Target size={size} />;
        case 'mouse': return <MousePointer size={size} />;
        case 'list': return <ListOrdered size={size} />;
        default: return <Brain size={size} />;
    }
};

const App: React.FC = () => {
  const [stats, setStats] = useState<UserStats>(getStats());
  const [activeGame, setActiveGame] = useState<GameDefinition | null>(null);
  const [showResult, setShowResult] = useState<{score: number, accuracy: number, level: number, game: GameDefinition} | null>(null);

  useEffect(() => {
    // Refresh stats on mount
    setStats(getStats());
  }, []);

  const handleStartGame = (game: GameDefinition) => {
    setActiveGame(game);
    setShowResult(null);
  };

  const handleGameComplete = (score: number, accuracy: number, level: number) => {
    if (!activeGame) return;
    
    // Save data
    const newStats = updateStats(activeGame.dimension, score); // score here acts as performance index 0-100
    setStats(newStats);
    
    setShowResult({
        score,
        accuracy,
        level,
        game: activeGame
    });
    setActiveGame(null);
  };

  const handleResetData = () => {
      if(confirm("Reset all training progress?")) {
          setStats(resetStats());
      }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-10 font-sans selection:bg-primary selection:text-white">
      {/* Game Overlay */}
      {activeGame && (
        <GameSession 
            definition={activeGame} 
            onComplete={handleGameComplete} 
            onExit={() => setActiveGame(null)} 
        />
      )}

      {/* Result Modal */}
      {showResult && (
        <div className="fixed inset-0 z-40 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-8 shadow-2xl relative overflow-hidden">
               {/* Shine effect */}
               <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-gradient-to-br from-primary to-transparent opacity-20 blur-3xl rounded-full"></div>
               
               <div className="text-center">
                   <div className="inline-flex p-4 rounded-full bg-slate-800 mb-6 text-primary shadow-inner">
                       <Trophy size={48} />
                   </div>
                   <h2 className="text-3xl font-bold text-white mb-1">{showResult.game.name} Complete</h2>
                   <p className="text-slate-400 mb-8">Training session recorded</p>
                   
                   <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-slate-800 p-4 rounded-xl">
                            <div className="text-xs text-slate-400 uppercase tracking-wider">Perf.</div>
                            <div className="text-2xl font-bold text-accent">{showResult.score}</div>
                        </div>
                        <div className="bg-slate-800 p-4 rounded-xl">
                            <div className="text-xs text-slate-400 uppercase tracking-wider">Level</div>
                            <div className="text-2xl font-bold text-white">{showResult.level}</div>
                        </div>
                        <div className="bg-slate-800 p-4 rounded-xl">
                            <div className="text-xs text-slate-400 uppercase tracking-wider">Acc.</div>
                            <div className="text-2xl font-bold text-blue-400">{showResult.accuracy}%</div>
                        </div>
                   </div>

                   <button 
                     onClick={() => setShowResult(null)}
                     className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20"
                   >
                     Continue
                   </button>
               </div>
           </div>
        </div>
      )}

      {/* Main Dashboard */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 pt-6">
        {/* Header */}
        <header className="flex justify-between items-end mb-8 border-b border-slate-800 pb-6">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
                    <Brain className="text-primary" size={40} />
                    NeuroPrime
                </h1>
                <p className="text-slate-400 mt-2 text-sm md:text-base max-w-md">
                    Scientific cognitive training optimized for peak performance.
                </p>
            </div>
            <div className="text-right hidden sm:block">
                <div className="text-sm text-slate-500">Games Played</div>
                <div className="text-2xl font-mono text-white">{stats.gamesPlayed}</div>
            </div>
        </header>

        {/* Top Section: Radar + Stats */}
        <section className="grid md:grid-cols-12 gap-6 mb-12">
            <div className="md:col-span-7 bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden group">
                <div className="flex justify-between items-center mb-4 relative z-10">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Activity size={18} className="text-accent"/> 
                        Cognitive Profile
                    </h3>
                    {stats.lastTrained && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                            <History size={12}/> Last: {new Date(stats.lastTrained).toLocaleDateString()}
                        </span>
                    )}
                </div>
                <RadarAnalysis stats={stats} />
            </div>

            <div className="md:col-span-5 flex flex-col gap-4">
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 border border-indigo-500/30 shadow-lg flex-1 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <h3 className="text-indigo-200 font-medium mb-1">Training Focus</h3>
                    <p className="text-sm text-slate-400 mb-6">Based on your recent performance, we recommend focusing on <span className="text-white font-semibold">Executive Function</span> today.</p>
                    <div className="mt-auto">
                         <div className="text-3xl font-bold text-white mb-2">Daily Goal</div>
                         <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                             <div className="bg-indigo-500 h-full w-2/3"></div>
                         </div>
                         <div className="text-xs text-right mt-1 text-indigo-300">66% Complete</div>
                    </div>
                </div>

                <button 
                    onClick={handleResetData}
                    className="flex items-center justify-center gap-2 p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm"
                >
                    <RotateCcw size={16} /> Reset Progress
                </button>
            </div>
        </section>

        {/* Games Grid */}
        <section>
            <h2 className="text-2xl font-bold text-white mb-6 pl-2 border-l-4 border-primary">Training Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {GAMES.map(game => (
                    <div 
                        key={game.id}
                        onClick={() => handleStartGame(game)}
                        className="group relative bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-lg"
                    >
                        {/* Gradient Border Overlay on Hover */}
                        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${game.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                        
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-lg bg-slate-800 text-slate-200 group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br ${game.color} bg-clip-text text-transparent`}>
                                {getIcon(game.iconName, 28)}
                            </div>
                            <div className="bg-slate-950 px-2 py-1 rounded text-xs font-bold text-slate-500 border border-slate-800">
                                {game.dimension.toUpperCase()}
                            </div>
                        </div>
                        
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{game.name}</h3>
                        <p className="text-sm text-slate-400 leading-relaxed mb-6 h-10">{game.description}</p>
                        
                        <div className="flex items-center text-primary font-medium text-sm group-hover:translate-x-2 transition-transform">
                            Start Session <Play size={16} className="ml-2 fill-current" />
                        </div>
                    </div>
                ))}
            </div>
        </section>
      </div>
    </div>
  );
};

export default App;