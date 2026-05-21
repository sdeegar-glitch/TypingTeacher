import { useState, useEffect, useRef } from 'react';

interface TypingAreaProps {
  text: string;
  durationSeconds: number;
  onSubmit: (stats: { netWpm: number; grossWpm: number; accuracy: number; errors: number; timeTaken: number }) => void;
}

const TypingArea: React.FC<TypingAreaProps> = ({ text, durationSeconds, onSubmit }) => {
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [isActive, setIsActive] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const words = text.split(' ');
  const inputWords = input.split(' ');

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleFinish();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isActive && !hasFinished) {
      setIsActive(true);
    }
    const val = e.target.value;
    // Stop if finished
    if (hasFinished) return;
    
    setInput(val);

    // Check if the whole text is typed successfully
    if (val === text) {
      handleFinish(val);
    }
  };

  const handleFinish = (finalInput = input) => {
    setIsActive(false);
    setHasFinished(true);
    
    const timeTaken = durationSeconds - timeLeft || 1; // avoid division by zero
    const minutes = timeTaken / 60;
    
    // Calculate stats
    // Gross WPM = (totalChars / 5) / minutes
    const totalChars = finalInput.length;
    const grossWpm = Math.round((totalChars / 5) / minutes);
    
    // Calculate errors based on the typed words vs actual words
    let errors = 0;
    const finalWords = finalInput.trim().split(/\s+/);
    for (let i = 0; i < finalWords.length; i++) {
      if (finalWords[i] !== words[i]) {
        errors++;
      }
    }
    
    // Net WPM = Gross WPM - (errors / minutes)
    const netWpm = Math.max(0, Math.round(grossWpm - (errors / minutes)));
    
    // Accuracy
    const correctWords = Math.max(0, finalWords.length - errors);
    const accuracy = finalWords.length > 0 ? (correctWords / finalWords.length) * 100 : 0;
    
    onSubmit({
      netWpm,
      grossWpm,
      accuracy: Number(accuracy.toFixed(2)),
      errors,
      timeTaken
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Render the text passage
  const renderText = () => {
    return words.map((word, wordIdx) => {
      const isCurrentWord = wordIdx === inputWords.length - 1;
      const typedWord = inputWords[wordIdx];
      
      let wordClass = "mr-2 inline-block rounded ";
      
      if (isCurrentWord) {
        wordClass += "bg-blue-100 underline ";
      }

      return (
        <span key={wordIdx} className={wordClass}>
          {word.split('').map((char, charIdx) => {
            let charColor = "text-gray-500"; // default un-typed
            if (typedWord != null) {
              if (charIdx < typedWord.length) {
                charColor = typedWord[charIdx] === char ? "text-green-600" : "text-red-600 bg-pink-100";
              }
            }
            return <span key={charIdx} className={charColor}>{char}</span>;
          })}
          {/* Handle extra typed characters in a word */}
          {typedWord && typedWord.length > word.length && (
            <span className="text-red-600 bg-pink-100">
              {typedWord.substring(word.length)}
            </span>
          )}
        </span>
      );
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 max-w-4xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-6">
        <div className="text-xl font-mono bg-gray-100 px-4 py-2 rounded-lg font-semibold text-gray-700">
          Time: <span className={timeLeft <= 10 ? "text-red-500" : ""}>{formatTime(timeLeft)}</span>
        </div>
        <div className="flex space-x-4">
          {/* Live stats could go here */}
        </div>
      </div>
      
      <div 
        className="typing-sentence text-2xl leading-relaxed mb-8 font-mono select-none"
        onClick={() => inputRef.current?.focus()}
      >
        {renderText()}
      </div>

      {/* Hidden input field for capturing keystrokes */}
      <input
        ref={inputRef}
        type="text"
        className="opacity-0 absolute -z-10"
        value={input}
        onChange={handleChange}
        disabled={hasFinished}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
      />

      <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100">
        <p className="text-sm text-gray-400">Start typing to begin the test. Press the button to submit early.</p>
        <button 
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition-colors"
          onClick={() => handleFinish()}
          disabled={hasFinished}
        >
          Submit Test
        </button>
      </div>
    </div>
  );
};

export default TypingArea;
