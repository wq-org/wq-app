import { Ghost, Home, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Error404 = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 p-4">
      <div className="text-center max-w-xl">
        <Ghost className="w-32 h-32 mx-auto mb-8 text-black animate-bounce" strokeWidth={1.5} />

        <h1 className="text-6xl  text-black mb-4">404</h1>

        <h2 className="text-2xl font-semibold text-black mb-6">Page Not Found</h2>

        <p className="text-gray-700 mb-8 px-4">
          Oops! Looks like you've ventured into uncharted territory. The page
          you're looking for seems to have gone exploring.
        </p>

        {/* Navigation options with icons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors gap-2"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>

          <Link
            to="/login"
            className="inline-flex items-center justify-center px-6 py-3 bg-white text-black border-2 border-black rounded-lg hover:bg-gray-100 transition-colors gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Error404;
