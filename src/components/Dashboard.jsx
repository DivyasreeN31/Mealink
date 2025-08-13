import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import UploadForm from './provider/UploadForm';
import ItemsGrid from './receiver/ItemsGrid';

const Dashboard = () => {
  const { userRole } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        {userRole === 'provider' ? <UploadForm /> : <ItemsGrid />}
      </main>
    </div>
  );
};

export default Dashboard;