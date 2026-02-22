import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
 // Optional icon. Remove if not using lucide-react.

const PaymentSuccess = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] px-4">
      <div className="bg-white shadow-md rounded-2xl p-10 max-w-md w-full text-center">
        
        {/* ICON */}
        <div className="flex justify-center mb-5">
          <CheckCircle className="text-[#00AFF5] w-16 h-16" />
        </div>
  
        {/* TITLE */}
        <h1 className="text-2xl font-semibold text-gray-900">
          Payment successful 🎉
        </h1>
  
        {/* DESCRIPTION */}
        <p className="text-gray-500 mt-2 leading-relaxed">
          Your seat has been successfully booked.  
          You can view your ride details anytime from your dashboard.
        </p>
  
        {/* BUTTON */}
        <div className="mt-8">
          <Link
            to="/"
            className="bg-[#00AFF5] text-white px-6 py-3 rounded-xl hover:bg-[#0095d6] transition font-semibold inline-block"
          >
            Back to rides
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
