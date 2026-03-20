import { useState, useEffect } from 'react';
import { calculateDestinyMatrix, MatrixData } from '@/utils/destinyMatrix';

export const useDestinyMatrix = (birthDate: string) => {
  const [matrixData, setMatrixData] = useState<MatrixData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!birthDate) {
      setMatrixData(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const data = calculateDestinyMatrix(birthDate);
      setMatrixData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка расчета матрицы');
      setMatrixData(null);
    } finally {
      setIsLoading(false);
    }
  }, [birthDate]);

  return {
    matrixData,
    isLoading,
    error,
  };
};
