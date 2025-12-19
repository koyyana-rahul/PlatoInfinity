import React from 'react';
import { useParams } from 'react-router-dom';

const AdminDashboard = () => {
  const { brandSlug } = useParams();
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">Admin Dashboard for {brandSlug}</h2>
      <p>This is the Admin's view for strategy and global control.</p>
      {/* Admin specific UI elements */}
    </div>
  );
};

export default AdminDashboard;
