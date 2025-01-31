import React, { ChangeEvent } from 'react';

interface InputProps {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; 
}

const Input: React.FC<InputProps> = ({ value, onChange, placeholder }) => {
  return (
    <input
      className="px-4 py-2 border rounded"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
};

export default Input;
