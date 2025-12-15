import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameDefinition, GameEngineProps } from '../types';
import { 
  generateMathQuestion, 
  generateStroopQuestion, 
  generateMemoryGrid, 
  generateSchulteGrid,
  generateVisualMatchTask,
  generateNumberSeries,
  generateFlankerTask
} from '../lib/gameLogic';
import { X, Clock, Brain, CheckCircle, AlertCircle, ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';

const GAME_DURATION = 60; // 60 seconds per game

const GameSession: React.FC<GameEngineProps> = ({ definition, onComplete, onExit }) => {
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState(1);
  const [streak, setStreak] = useState(0);
  const [currentData, setCurrentData] = useState<any>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  
  // Specific state for Memory Game
  const [memoryPhase, setMemoryPhase] = useState<'memorize' | 'recall'>('memorize');
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  const correctCountRef = useRef(0);
  const totalCountRef = useRef(0);

  // --- Game Loop Management ---

  const generateNextRound = useCallback(() => {
    switch(definition.id) {
      case 'math': return generateMathQuestion(difficulty);
      case 'stroop': return generateStroopQuestion(difficulty);
      case 'memory': return generateMemoryGrid(difficulty);
      case 'schulte': return generateSchulteGrid(difficulty);
      case 'visual': return generateVisualMatchTask(difficulty);
      case 'logic': return generateNumberSeries(difficulty);
      case 'flanker': return generateFlankerTask(difficulty);
      default: return {};
    }
  }, [definition.id, difficulty]);

  // Initial Load & Round Reset
  useEffect(() => {
    setCurrentData(generateNextRound());
    if(definition.id === 'memory') {
        setMemoryPhase('memorize');
        setSelectedIndices(new Set());
    }
  }, []); // Run once on mount, subsequent updates handled in handleAnswer

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      const accuracy = totalCountRef.current > 0 
        ? Math.round((correctCountRef.current / totalCountRef.current) * 100) 
        : 0;
      
      const performance = Math.min(100, Math.round((score / 20) + (difficulty * 6)));
      
      onComplete(performance, accuracy, difficulty);
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onComplete, score, difficulty]);

  // Memory Phase Logic
  useEffect(() => {
    if (definition.id === 'memory' && memoryPhase === 'memorize') {
      const timeToMemorize = Math.max(800, 2500 - (difficulty * 150)); 
      const timer = setTimeout(() => {
        setMemoryPhase('recall');
      }, timeToMemorize);
      return () => clearTimeout(timer);
    }
  }, [definition.id, memoryPhase, difficulty]);


  // --- Interaction Handlers ---

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      // For Memory game, we only count 'total' when the full round is done or failed
      if (definition.id !== 'memory') totalCountRef.current += 1;
      
      setFeedback('correct');
      correctCountRef.current += 1;
      
      // Scoring Logic
      const basePoints = 100;
      const multiplier = 1 + (difficulty * 0.2);
      setScore(prev => Math.floor(prev + (basePoints * multiplier)));
      
      // Dynamic Difficulty
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak % 3 === 0 && difficulty < 10) {
        setDifficulty(d => d + 1);
      }
    } else {
      if (definition.id !== 'memory') totalCountRef.current += 1;

      setFeedback('wrong');
      setStreak(0);
      if (difficulty > 1) setDifficulty(d => d - 1);
    }

    // Delay next round
    setTimeout(() => {
      setFeedback(null);
      setCurrentData(generateNextRound());
      if(definition.id === 'memory') {
          setMemoryPhase('memorize');
          setSelectedIndices(new Set());
      }
    }, 500);
  };

  const handleMemoryClick = (index: number) => {
      if (selectedIndices.has(index)) return; // Already selected

      // Check if this index is a target
      const isTarget = currentData.targets.includes(index);

      if (!isTarget) {
          // Wrong click = Round Fail
          totalCountRef.current += 1; // Increment attempt
          handleAnswer(false);
          return;
      }

      // Correct click
      const newSet = new Set(selectedIndices);
      newSet.add(index);
      setSelectedIndices(newSet);

      // Check if all targets found
      if (newSet.size === currentData.targets.length) {
          totalCountRef.current += 1; // Increment attempt
          handleAnswer(true);
      }
  };

  // --- Renderers ---

  const renderContent = () => {
    if (!currentData) return <div className="text-white">Loading...</div>;

    switch (definition.id) {
      case 'math':
        return (
          <div className="flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-300">
            <div className="text-5xl md:text-7xl font-bold text-white tracking-wider font-mono">
              {currentData.question}
            </div>
            <div className="grid grid-cols-2 gap-4 w-full max-w-md">
              {currentData.choices.map((choice: number, idx: number) => (
                <button 
                  key={idx}
                  onClick={() => handleAnswer(choice === currentData.answer)}
                  className="bg-slate-800 hover:bg-primary border border-slate-700 hover:border-primary-hover text-2xl font-semibold py-6 rounded-xl transition-all active:scale-95 shadow-lg shadow-black/40"
                >
                  {choice}
                </button>
              ))}
            </div>
          </div>
        );

      case 'stroop':
        return (
          <div className="flex flex-col items-center gap-12">
            <div className="text-2xl text-slate-400">Does the meaning match the color?</div>
            <div className={`text-6xl md:text-8xl font-black tracking-widest ${currentData.colorClass} drop-shadow-2xl`}>
              {currentData.text}
            </div>
            <div className="flex gap-6 w-full max-w-sm">
              <button 
                onClick={() => handleAnswer(currentData.isMatch)}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white text-xl py-6 rounded-xl font-bold shadow-lg active:scale-95 transition-transform"
              >
                YES
              </button>
              <button 
                onClick={() => handleAnswer(!currentData.isMatch)}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white text-xl py-6 rounded-xl font-bold shadow-lg active:scale-95 transition-transform"
              >
                NO
              </button>
            </div>
          </div>
        );

      case 'memory':
        const isMem = memoryPhase === 'memorize';
        return (
          <div className="flex flex-col items-center gap-6">
             <div className="text-xl text-accent font-semibold animate-pulse">
               {isMem ? 'MEMORIZE THE PATTERN' : `REPLICATE THE PATTERN (${selectedIndices.size}/${currentData.targets.length})`}
             </div>
             <div 
               className="grid gap-2 bg-slate-800 p-4 rounded-xl shadow-inner"
               style={{ gridTemplateColumns: `repeat(${currentData.gridSize}, minmax(0, 1fr))` }}
             >
               {Array.from({ length: currentData.gridSize * currentData.gridSize }).map((_, i) => {
                 const isTarget = currentData.targets.includes(i);
                 const isSelected = selectedIndices.has(i);
                 
                 // Display logic:
                 // In Memorize: Show Targets (Bright)
                 // In Recall: Show Selected (Bright)
                 const showActive = (isMem && isTarget) || (!isMem && isSelected);

                 return (
                   <button
                     key={i}
                     disabled={isMem || isSelected}
                     onClick={() => handleMemoryClick(i)}
                     className={`
                       w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-lg transition-all duration-200
                       ${showActive 
                            ? 'bg-accent shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-105' 
                            : 'bg-slate-700 hover:bg-slate-600'}
                       ${!isMem && !isSelected ? 'cursor-pointer active:scale-90' : ''}
                     `}
                   />
                 );
               })}
             </div>
          </div>
        );
      
      case 'schulte':
         return (
            <div className="flex flex-col items-center gap-6">
                <div className="text-2xl text-slate-300">
                    Find number: <span className="text-4xl text-primary font-bold ml-2">{currentData.target}</span>
                </div>
                <div 
                   className="grid gap-2 md:gap-3 bg-slate-800 p-4 rounded-xl"
                   style={{ gridTemplateColumns: `repeat(${currentData.size}, minmax(0, 1fr))` }}
                >
                    {currentData.grid.map((num: number, i: number) => (
                        <button
                            key={i}
                            onClick={() => handleAnswer(num === currentData.target)}
                            className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-white text-xl sm:text-2xl font-bold rounded-lg transition-colors"
                        >
                            {num}
                        </button>
                    ))}
                </div>
            </div>
         );

      case 'visual':
          // Updated Visual: Match to Sample
          return (
            <div className="flex flex-col items-center gap-8 w-full max-w-2xl">
                <div className="flex flex-col items-center gap-2">
                    <span className="text-slate-400 text-sm uppercase tracking-widest">Target Shape</span>
                    <div 
                        className="text-7xl md:text-8xl text-indigo-400 drop-shadow-lg transition-all duration-300"
                        style={{ transform: `rotate(${currentData.target.rot}deg)` }}
                    >
                        {currentData.target.shape}
                    </div>
                </div>
                
                <div className="w-full h-px bg-slate-800"></div>

                <div className="flex flex-wrap justify-center gap-4">
                    {currentData.options.map((opt: any, idx: number) => (
                        <button
                            key={idx}
                            onClick={() => handleAnswer(opt.isMatch)}
                            className="w-20 h-20 md:w-24 md:h-24 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 rounded-xl flex items-center justify-center text-5xl md:text-6xl text-slate-200 transition-all active:scale-95 shadow-md"
                        >
                            <span style={{ transform: `rotate(${opt.rot}deg)` }}>
                                {opt.shape}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
          );

      case 'logic':
          return (
            <div className="flex flex-col items-center gap-8">
                <div className="text-xl text-slate-400 uppercase tracking-widest">Complete the Series</div>
                <div className="flex gap-3 md:gap-6">
                    {currentData.series.map((n: number, i: number) => (
                        <div key={i} className="w-14 h-14 md:w-20 md:h-20 flex items-center justify-center bg-slate-800 rounded-full text-xl md:text-3xl font-mono text-primary shadow-lg border border-slate-700">
                            {n}
                        </div>
                    ))}
                    <div className="w-14 h-14 md:w-20 md:h-20 flex items-center justify-center bg-slate-700/50 rounded-full text-xl md:text-3xl font-mono text-accent animate-pulse border border-accent/30">
                        ?
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full max-w-md mt-4">
                  {currentData.choices.map((choice: number, idx: number) => (
                    <button 
                      key={idx}
                      onClick={() => handleAnswer(choice === currentData.answer)}
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xl font-mono py-4 rounded-lg transition-all"
                    >
                      {choice}
                    </button>
                  ))}
                </div>
            </div>
          );
      
      case 'flanker':
          return (
              <div className="flex flex-col items-center gap-10">
                   <div className="text-center space-y-2">
                       <h3 className="text-xl text-slate-300">Which way does the <span className="text-primary font-bold">CENTER</span> arrow point?</h3>
                       <p className="text-sm text-slate-500">Ignore the outside arrows!</p>
                   </div>
                   
                   <div className="flex gap-2 md:gap-4 p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
                       {currentData.sequence.map((item: any, i: number) => {
                           // Center item styling
                           const isCenter = i === Math.floor(currentData.sequence.length / 2);
                           return (
                               <div key={i} className={`text-5xl md:text-7xl font-bold ${isCenter ? 'text-white scale-110' : 'text-slate-600'}`}>
                                   {item.char}
                               </div>
                           )
                       })}
                   </div>

                   <div className="grid grid-cols-2 gap-4 w-full max-w-xs md:max-w-md">
                       {/* Directional Pad */}
                       <div className="col-span-2 flex justify-center">
                            <button onClick={() => handleAnswer(currentData.targetKey === 'up')} className="p-6 bg-slate-800 hover:bg-primary rounded-xl transition-colors">
                                <ArrowUp size={32} />
                            </button>
                       </div>
                       <div className="flex justify-end">
                            <button onClick={() => handleAnswer(currentData.targetKey === 'left')} className="p-6 bg-slate-800 hover:bg-primary rounded-xl transition-colors">
                                <ArrowLeft size={32} />
                            </button>
                       </div>
                       <div className="flex justify-start">
                            <button onClick={() => handleAnswer(currentData.targetKey === 'right')} className="p-6 bg-slate-800 hover:bg-primary rounded-xl transition-colors">
                                <ArrowRight size={32} />
                            </button>
                       </div>
                       <div className="col-span-2 flex justify-center">
                            <button onClick={() => handleAnswer(currentData.targetKey === 'down')} className="p-6 bg-slate-800 hover:bg-primary rounded-xl transition-colors">
                                <ArrowDown size={32} />
                            </button>
                       </div>
                   </div>
              </div>
          )

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 md:p-6 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-4">
            <button onClick={onExit} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
                <X size={24} />
            </button>
            <div>
                <h2 className="text-xl font-bold text-white leading-none">{definition.name}</h2>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-accent">Lvl {difficulty}</span>
                    <span>Streak: {streak}</span>
                </div>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
                <div className="text-sm text-slate-400">Score</div>
                <div className="text-xl font-mono font-bold text-white">{score.toLocaleString()}</div>
             </div>
             <div className={`
                flex items-center justify-center w-12 h-12 rounded-full border-4 font-bold text-lg
                ${timeLeft < 10 ? 'border-red-500 text-red-500 animate-pulse' : 'border-primary text-primary'}
             `}>
                {timeLeft}
             </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
         {/* Background Decoration */}
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 -z-10"></div>
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-20"></div>

         {renderContent()}

         {/* Feedback Overlay */}
         {feedback && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-10 animate-in fade-in duration-200">
                 {feedback === 'correct' ? (
                     <CheckCircle className="text-green-500 w-32 h-32 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)] animate-bounce-small" />
                 ) : (
                     <AlertCircle className="text-red-500 w-32 h-32 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-bounce-small" />
                 )}
             </div>
         )}
      </div>

      {/* Progress Bar (optional, subtle at bottom) */}
      <div className="h-1 bg-slate-900 w-full">
         <div 
            className="h-full bg-primary transition-all duration-1000 ease-linear"
            style={{ width: `${(timeLeft / GAME_DURATION) * 100}%` }}
         ></div>
      </div>
    </div>
  );
};

export default GameSession;