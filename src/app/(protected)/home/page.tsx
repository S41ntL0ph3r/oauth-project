import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const HomePage = async () => {
  const session = await auth();
  if (!session) redirect("/sign-in");

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to your Dashboard!
        </h1>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-blue-800 dark:text-blue-200">
            <span className="font-medium">Connected user:</span> {session.user?.email}
          </p>
          <p className="text-blue-600 dark:text-blue-300 text-sm mt-1">
            You are authenticated and can access all protected features.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">💰 Budget</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Plan and control your monthly expenses</p>
          <a 
            href="/budget" 
            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium"
          >
            Manage Budget →
          </a>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">📊 Reports</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Create custom reports</p>
          <a 
            href="/relatorios" 
            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium"
          >
            View Reports →
          </a>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">🔔 Notifications</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Alerts and notifications center</p>
          <a 
            href="/notificacoes" 
            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium"
          >
            View Notifications →
          </a>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">📈 Dashboard</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">View your financial statistics</p>
          <a 
            href="/dashboard" 
            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium"
          >
            View Dashboard →
          </a>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">👤 Profile</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Manage your personal information</p>
          <a 
            href="/profile" 
            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium"
          >
            View Profile →
          </a>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">⚙️ Settings</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Adjust your system preferences</p>
          <a 
            href="/settings" 
            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium"
          >
            Configure →
          </a>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">📊 Analytics</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">System metrics and insights</p>
          <a 
            href="/analytics" 
            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium"
          >
            View Analytics →
          </a>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">🔒 Security</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Monitor security events</p>
          <a 
            href="/security" 
            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium"
          >
            View Security →
          </a>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">💾 Backups</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Manage your data backups</p>
          <a 
            href="/backups" 
            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium"
          >
            View Backups →
          </a>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
