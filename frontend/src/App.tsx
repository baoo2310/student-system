import { UserRole } from '@shared/index';
import './index.css';

function App() {
  const testRole: UserRole = UserRole.ADMIN;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="rounded-2xl bg-white p-8 shadow-xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-blue-600 mb-4">
          Student System
        </h1>
        <p className="text-gray-600 mb-6">Frontend is running! Setup complete.</p>
        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
          Role from shared pkg: {testRole}
        </span>
      </div>
    </div>
  );
}

export default App;
