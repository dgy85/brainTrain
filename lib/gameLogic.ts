// This file contains the "questions" or "rounds" generation logic for each game type.

// --- 1. Calculation: Speed Math ---
export const generateMathQuestion = (difficulty: number) => {
  const ops = ['+', '-', '*'];
  // Difficulty 1: Single digits +
  // Difficulty 5: Double digits -
  // Difficulty 10: Mixed ops, larger numbers
  const operator = ops[Math.floor(Math.random() * Math.min(difficulty > 3 ? 2 : 1, 3))]; 
  
  let a = Math.floor(Math.random() * (10 * difficulty)) + 1;
  let b = Math.floor(Math.random() * (10 * difficulty)) + 1;
  
  // Simplify for lower levels
  if (difficulty < 3) {
    a = Math.floor(Math.random() * 10) + 1;
    b = Math.floor(Math.random() * 10) + 1;
  }

  let answer = 0;
  let question = "";

  if (operator === '*') {
    // Keep multiplication simpler
    a = Math.floor(Math.random() * (difficulty + 2)) + 2;
    b = Math.floor(Math.random() * (difficulty + 2)) + 2;
    answer = a * b;
  } else if (operator === '-') {
    if (a < b) [a, b] = [b, a]; // Ensure positive result
    answer = a - b;
  } else {
    answer = a + b;
  }
  question = `${a} ${operator} ${b}`;

  // Generate 3 wrong choices
  const choices = new Set<number>();
  choices.add(answer);
  while (choices.size < 4) {
    const offset = Math.floor(Math.random() * 10) - 5;
    const fake = answer + offset;
    if (fake >= 0 && fake !== answer) choices.add(fake);
    else if (fake < 0) choices.add(answer + Math.floor(Math.random() * 5) + 1);
  }

  return {
    question,
    answer,
    choices: Array.from(choices).sort(() => Math.random() - 0.5)
  };
};

// --- 2. Execution: Stroop (Color Match) ---
export const generateStroopQuestion = (difficulty: number) => {
  const colors = [
    { name: 'RED', hex: 'text-red-500' },
    { name: 'BLUE', hex: 'text-blue-500' },
    { name: 'GREEN', hex: 'text-green-500' },
    { name: 'YELLOW', hex: 'text-yellow-400' },
    { name: 'PURPLE', hex: 'text-purple-500' },
  ];

  const textIndex = Math.floor(Math.random() * colors.length);
  const colorIndex = Math.floor(Math.random() * colors.length);
  
  const isMatch = textIndex === colorIndex;
  
  return {
    text: colors[textIndex].name,
    colorClass: colors[colorIndex].hex,
    isMatch,
  };
};

// --- 3. Memory: Grid Recall ---
export const generateMemoryGrid = (difficulty: number) => {
  // Grid size grows with difficulty: 3x3 up to 5x5
  const gridSize = Math.min(5, 3 + Math.floor(difficulty / 4));
  const totalCells = gridSize * gridSize;
  
  // Number of items to remember
  const itemCount = Math.min(Math.floor(totalCells * 0.6), 3 + Math.floor(difficulty / 2));
  
  const indices = new Set<number>();
  while (indices.size < itemCount) {
    indices.add(Math.floor(Math.random() * totalCells));
  }
  
  return {
    gridSize,
    targets: Array.from(indices),
  };
};

// --- 4. Attention: Schulte Grid (Simplified) ---
export const generateSchulteGrid = (difficulty: number) => {
    const size = Math.min(5, 3 + Math.floor(difficulty / 3));
    const total = size * size;
    const numbers = Array.from({ length: total }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
    const target = Math.floor(Math.random() * total) + 1; 

    return {
        size,
        grid: numbers,
        target
    };
};

// --- 5. Visual: Match to Sample (Replaces simple Rotation) ---
export const generateVisualMatchTask = (difficulty: number) => {
    // Group similar shapes for higher difficulty discrimination
    const shapeGroups = [
        ['●', '○', '⦿', '⊚', '⊙', '◍'],
        ['◆', '◇', '❖', '⬧', '⧫', '⟡'],
        ['★', '☆', '✶', '✴', '✷', '✦'],
        ['▲', '△', '▴', '▵', '▶', '▷'],
        ['◼', '◻', '◾', '◽', '▪', '▢']
    ];
    
    // Flatten for easy access
    const allShapes = shapeGroups.flat();
    
    // Select Target
    const groupIdx = Math.floor(Math.random() * shapeGroups.length);
    const targetGroup = shapeGroups[groupIdx];
    const targetShape = targetGroup[Math.floor(Math.random() * targetGroup.length)];
    const targetRot = Math.floor(Math.random() * 4) * 90;

    // Determine options count: Starts at 3, max 9. Increasing quantity.
    const numOptions = Math.min(9, 2 + Math.floor(difficulty / 1.5));
    
    const options = [];
    
    // Add Correct Answer (Correct Shape, Random Rotation)
    options.push({
        id: 'correct',
        shape: targetShape,
        rot: (Math.floor(Math.random() * 4) * 90), 
        isMatch: true
    });
    
    // Add Distractors
    while (options.length < numOptions) {
        let distractorShape;
        
        // High difficulty: Pick from same group (visually similar)
        // Low difficulty: Pick from anywhere else
        if (difficulty > 3 && Math.random() > 0.4) {
             const available = targetGroup.filter(s => s !== targetShape);
             // fallback if group is small or unlucky
             distractorShape = available.length > 0 
                ? available[Math.floor(Math.random() * available.length)] 
                : allShapes.filter(s => s !== targetShape)[Math.floor(Math.random() * (allShapes.length - 1))];
        } else {
             const otherGroups = shapeGroups.filter((_, i) => i !== groupIdx).flat();
             distractorShape = otherGroups[Math.floor(Math.random() * otherGroups.length)];
        }
        
        // Ensure unique distractors in the set if possible, but duplicates are also fine distractions
        options.push({
            id: `wrong_${options.length}`,
            shape: distractorShape,
            rot: Math.floor(Math.random() * 4) * 90,
            isMatch: false
        });
    }

    return {
        target: { shape: targetShape, rot: targetRot },
        options: options.sort(() => Math.random() - 0.5)
    };
};

// --- 6. Abstraction: Number Series ---
export const generateNumberSeries = (difficulty: number) => {
    const type = Math.random();
    let series: number[] = [];
    let answer = 0;
    
    const start = Math.floor(Math.random() * 20) + 1;

    if (type < 0.4) {
        // Arithmetic
        const step = Math.floor(Math.random() * difficulty) + 1;
        series = [start, start + step, start + step * 2, start + step * 3];
        answer = start + step * 4;
    } else if (type < 0.7) {
        // Geometric
        const step = Math.floor(Math.random() * 2) + 2; 
        let current = Math.floor(Math.random() * 5) + 1;
        series = [current, current * step, current * step * step, current * Math.pow(step, 3)];
        answer = current * Math.pow(step, 4);
    } else {
        // Dual step
        const s1 = Math.floor(Math.random() * 3) + 1;
        const s2 = Math.floor(Math.random() * 3) + 1;
        let c = start;
        series.push(c);
        c += s1; series.push(c);
        c += s2; series.push(c);
        c += s1; series.push(c);
        answer = c + s2;
    }

    const choices = new Set<number>([answer]);
    while(choices.size < 4) {
        const fake = answer + (Math.floor(Math.random() * 20) - 10);
        if (fake !== answer && fake > 0) choices.add(fake);
    }

    return {
        series,
        answer,
        choices: Array.from(choices).sort(() => Math.random() - 0.5)
    };
};

// --- 7. Attention (New): Flanker Task ---
export const generateFlankerTask = (difficulty: number) => {
    // Arrows for directions
    const dirs = [
        { char: '←', key: 'left' },
        { char: '→', key: 'right' },
        { char: '↑', key: 'up' },
        { char: '↓', key: 'down' }
    ];
    
    const targetIdx = Math.floor(Math.random() * 4);
    const target = dirs[targetIdx];
    
    // Incongruent probability increases with difficulty
    const isIncongruent = Math.random() < (0.2 + (difficulty * 0.08)); 
    
    let flanker = target;
    if (isIncongruent) {
        const others = dirs.filter(d => d.key !== target.key);
        flanker = others[Math.floor(Math.random() * others.length)];
    }
    
    // Pattern: 5 or 7 items
    const count = 5;
    const sequence = Array(count).fill(flanker);
    const centerIdx = Math.floor(count / 2);
    sequence[centerIdx] = target; 

    return {
        sequence,
        targetKey: target.key,
        choices: dirs
    };
};