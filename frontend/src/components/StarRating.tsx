'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

export default function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
  showValue = false,
  className = ''
}: StarRatingProps) {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const getStar = (index: number) => {
    const starValue = index + 1;
    const displayValue = hoveredValue !== null ? hoveredValue : value;
    const filled = starValue <= displayValue;
    const halfFilled = starValue === Math.ceil(displayValue) && displayValue % 1 !== 0;

    return (
      <button
        key={index}
        type="button"
        disabled={readonly}
        className={`${sizeClasses[size]} transition-colors duration-200 ${
          readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
        } ${className}`}
        onClick={() => !readonly && onChange?.(starValue)}
        onMouseEnter={() => !readonly && setHoveredValue(starValue)}
        onMouseLeave={() => !readonly && setHoveredValue(null)}
        title={readonly ? undefined : `Оценка: ${starValue} ${starValue === 1 ? 'звезда' : 'звезди'}`}
      >
        <Star
          className={`w-full h-full transition-all duration-200 ${
            filled
              ? 'text-yellow-400 fill-yellow-400'
              : halfFilled
              ? 'text-yellow-400 fill-yellow-200'
              : 'text-gray-300 hover:text-yellow-300'
          }`}
        />
      </button>
    );
  };

  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, index) => getStar(index))}
      </div>
      {showValue && (
        <span className="ml-2 text-sm text-gray-600">
          {value > 0 ? value.toFixed(1) : 'Без оценка'}
        </span>
      )}
    </div>
  );
}