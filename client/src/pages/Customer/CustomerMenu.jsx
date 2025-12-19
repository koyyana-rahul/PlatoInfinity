import React from 'react';
import { useParams } from 'react-router-dom';

const CustomerMenu = () => {
  const { brandSlug, tableId } = useParams(); // tableId will be dynamic
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">Customer Menu for {brandSlug} (Table: {tableId || 'N/A'})</h2>
      <p>This is the Customer's menu and ordering view.</p>
      {/* Customer specific UI elements */}
    </div>
  );
};

export default CustomerMenu;
