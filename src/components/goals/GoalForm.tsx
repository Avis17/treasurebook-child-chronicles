
import { useState } from 'react';
import LoadingOverlay from '@/components/shared/LoadingOverlay';

const GoalForm = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // ... handle form submission
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <LoadingOverlay isLoading={isLoading} />
      {/* Form content */}
    </>
  );
};

export default GoalForm;
