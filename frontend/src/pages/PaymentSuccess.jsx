import { Link } from "react-router-dom";
 // Optional icon. Remove if not using lucide-react.

const PaymentSuccess = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md text-center">
        
        <div className="flex justify-center mb-4">
          <CheckCircle className="text-green-500 w-16 h-16" />
        </div>

        <h1 className="text-2xl font-semibold text-green-600">
          Payment Successful!
        </h1>

        <p className="text-gray-600 mt-2">
          Thank you for your payment. Your transaction has been completed successfully.
        </p>

        <div className="mt-6">
          <Link
            to="/"
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
